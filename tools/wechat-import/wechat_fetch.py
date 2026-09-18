#!/usr/bin/env python3
"""Fetch published WeChat Official Account articles into a private review inbox.

The script intentionally does not modify or publish the public website. It creates
review bundles that can be translated, checked, and turned into an incremental
website patch later.
"""

import argparse
import hashlib
import html
import json
import mimetypes
import os
import re
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/stable_token"
BATCH_URL = "https://api.weixin.qq.com/cgi-bin/freepublish/batchget"
ARTICLE_URL = "https://api.weixin.qq.com/cgi-bin/freepublish/getarticle"
USER_AGENT = "SuperBobo-WeChat-Importer/1.0"
CHINA_TZ = timezone(timedelta(hours=8))
ALLOWED_IMAGE_HOST_SUFFIXES = (
    ".qpic.cn",
    ".qlogo.cn",
    ".qq.com",
    ".weixin.qq.com",
)
MAX_IMAGE_BYTES = 25 * 1024 * 1024


class ImportErrorWithCode(RuntimeError):
    """Raised when WeChat or a remote resource returns an unusable response."""


def atomic_write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", dir=str(path.parent), delete=False
    ) as handle:
        handle.write(value)
        temp_path = Path(handle.name)
    os.chmod(temp_path, 0o600)
    temp_path.replace(path)


def write_json(path: Path, value: object) -> None:
    atomic_write_text(path, json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def read_env(path: Path) -> Dict[str, str]:
    if not path.is_file():
        raise ImportErrorWithCode(f"配置文件不存在：{path}")

    mode = path.stat().st_mode & 0o777
    if mode & 0o077:
        raise ImportErrorWithCode(
            f"配置文件权限过宽（当前 {mode:o}），请执行 chmod 600 {path}"
        )

    values: Dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()

    for key in ("WECHAT_APP_ID", "WECHAT_APP_SECRET"):
        if not values.get(key):
            raise ImportErrorWithCode(f"配置文件缺少 {key}")
    return values


def post_json(url: str, payload: object, timeout: int = 30) -> Dict[str, object]:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": USER_AGENT},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            result = json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read(1024).decode("utf-8", "replace")
        raise ImportErrorWithCode(f"HTTP {exc.code}: {detail}") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise ImportErrorWithCode(f"网络请求失败：{exc}") from exc

    if not isinstance(result, dict):
        raise ImportErrorWithCode("接口返回格式异常")
    if result.get("errcode") not in (None, 0):
        raise ImportErrorWithCode(
            "微信接口错误：errcode={} errmsg={}".format(
                result.get("errcode"), result.get("errmsg")
            )
        )
    return result


def get_access_token(credentials: Dict[str, str]) -> str:
    result = post_json(
        TOKEN_URL,
        {
            "grant_type": "client_credential",
            "appid": credentials["WECHAT_APP_ID"],
            "secret": credentials["WECHAT_APP_SECRET"],
            "force_refresh": False,
        },
        timeout=20,
    )
    token = result.get("access_token")
    if not isinstance(token, str) or not token:
        raise ImportErrorWithCode("微信接口未返回 access_token")
    return token


def token_url(base: str, token: str) -> str:
    return f"{base}?access_token={urllib.parse.quote(token, safe='')}"


def list_published_groups(token: str, max_groups: int) -> Tuple[int, List[Dict[str, object]]]:
    groups: List[Dict[str, object]] = []
    offset = 0
    total_count = 0
    while len(groups) < max_groups:
        count = min(20, max_groups - len(groups))
        result = post_json(
            token_url(BATCH_URL, token),
            {"offset": offset, "count": count, "no_content": 1},
        )
        total_count = int(result.get("total_count") or 0)
        items = result.get("item") or []
        if not isinstance(items, list):
            raise ImportErrorWithCode("已发布文章列表格式异常")
        valid_items = [item for item in items if isinstance(item, dict)]
        groups.extend(valid_items)
        item_count = int(result.get("item_count") or len(valid_items))
        if item_count <= 0 or offset + item_count >= total_count:
            break
        offset += item_count
    return total_count, groups[:max_groups]


def get_published_group(token: str, article_id: str) -> Dict[str, object]:
    return post_json(token_url(ARTICLE_URL, token), {"article_id": article_id})


def safe_slug(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-.")
    return cleaned[:120] or hashlib.sha256(value.encode("utf-8")).hexdigest()[:24]


def normalize_image_url(value: str) -> Optional[str]:
    value = html.unescape(value.strip())
    if value.startswith("//"):
        value = "https:" + value
    parsed = urllib.parse.urlsplit(value)
    if parsed.scheme != "https" or not parsed.hostname:
        return None
    host = parsed.hostname.lower()
    if not any(host.endswith(suffix) for suffix in ALLOWED_IMAGE_HOST_SUFFIXES):
        return None
    return urllib.parse.urlunsplit(parsed)


class ImageCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.urls: List[str] = []

    def handle_starttag(self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]]) -> None:
        if tag.lower() != "img":
            return
        values = {key.lower(): value for key, value in attrs if value}
        candidate = values.get("data-src") or values.get("src")
        if not candidate:
            return
        normalized = normalize_image_url(candidate)
        if normalized and normalized not in self.urls:
            self.urls.append(normalized)

    handle_startendtag = handle_starttag


class HtmlImageRewriter(HTMLParser):
    def __init__(self, replacements: Dict[str, str]) -> None:
        super().__init__(convert_charrefs=False)
        self.replacements = replacements
        self.output: List[str] = []

    @staticmethod
    def format_tag(tag: str, attrs: Sequence[Tuple[str, Optional[str]]], closed: bool) -> str:
        pieces = ["<", tag]
        for key, value in attrs:
            pieces.extend([" ", key])
            if value is not None:
                pieces.extend(["=\"", html.escape(value, quote=True), "\""])
        pieces.append(" />" if closed else ">")
        return "".join(pieces)

    def rewrite_img_attrs(
        self, attrs: Sequence[Tuple[str, Optional[str]]]
    ) -> List[Tuple[str, Optional[str]]]:
        normalized_attrs = list(attrs)
        lookup = {key.lower(): value for key, value in attrs if value}
        remote = normalize_image_url(lookup.get("data-src") or lookup.get("src") or "")
        replacement = self.replacements.get(remote or "")
        if not replacement:
            return normalized_attrs

        rewritten: List[Tuple[str, Optional[str]]] = []
        has_src = False
        for key, value in normalized_attrs:
            lower = key.lower()
            if lower == "src":
                rewritten.append((key, replacement))
                has_src = True
            elif lower == "data-src":
                continue
            else:
                rewritten.append((key, value))
        if not has_src:
            rewritten.insert(0, ("src", replacement))
        return rewritten

    def handle_starttag(self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]]) -> None:
        if tag.lower() == "img":
            attrs = self.rewrite_img_attrs(attrs)
        self.output.append(self.format_tag(tag, attrs, False))

    def handle_startendtag(self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]]) -> None:
        if tag.lower() == "img":
            attrs = self.rewrite_img_attrs(attrs)
        self.output.append(self.format_tag(tag, attrs, True))

    def handle_endtag(self, tag: str) -> None:
        self.output.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self.output.append(data)

    def handle_entityref(self, name: str) -> None:
        self.output.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.output.append(f"&#{name};")

    def handle_comment(self, data: str) -> None:
        self.output.append(f"<!--{data}-->")

    def handle_decl(self, decl: str) -> None:
        self.output.append(f"<!{decl}>")


def image_extension(content_type: str, url: str) -> str:
    clean_type = content_type.split(";", 1)[0].strip().lower()
    known = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "image/svg+xml": ".svg",
    }
    if clean_type in known:
        return known[clean_type]
    suffix = Path(urllib.parse.urlsplit(url).path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}:
        return ".jpg" if suffix == ".jpeg" else suffix
    guessed = mimetypes.guess_extension(clean_type) if clean_type else None
    return guessed or ".bin"


def download_image(url: str, destination_without_suffix: Path) -> Tuple[Path, str, int]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Referer": "https://mp.weixin.qq.com/"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            final_url = normalize_image_url(response.geturl())
            if not final_url:
                raise ImportErrorWithCode("图片重定向到了不允许的域名")
            content_type = response.headers.get("Content-Type", "")
            if not content_type.lower().startswith("image/"):
                raise ImportErrorWithCode(f"响应不是图片：{content_type or 'unknown'}")
            length_header = response.headers.get("Content-Length")
            if length_header and int(length_header) > MAX_IMAGE_BYTES:
                raise ImportErrorWithCode("图片超过 25MB 限制")
            data = response.read(MAX_IMAGE_BYTES + 1)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
        raise ImportErrorWithCode(f"下载失败：{exc}") from exc

    if len(data) > MAX_IMAGE_BYTES:
        raise ImportErrorWithCode("图片超过 25MB 限制")
    suffix = image_extension(content_type, final_url)
    destination = destination_without_suffix.with_suffix(suffix)
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    destination.write_bytes(data)
    os.chmod(destination, 0o600)
    return destination, hashlib.sha256(data).hexdigest(), len(data)


def parse_timestamp(value: object) -> Optional[str]:
    try:
        timestamp = int(value or 0)
    except (TypeError, ValueError):
        return None
    if timestamp <= 0:
        return None
    return datetime.fromtimestamp(timestamp, CHINA_TZ).isoformat()


def localize_article_item(
    article_id: str,
    item_index: int,
    item: Dict[str, object],
    group: Dict[str, object],
    inbox_dir: Path,
    download_images: bool,
) -> Dict[str, object]:
    bundle_name = f"{safe_slug(article_id)}-{item_index + 1:02d}"
    bundle_dir = inbox_dir / bundle_name
    if bundle_dir.exists():
        version = datetime.now(CHINA_TZ).strftime("%Y%m%d-%H%M%S")
        bundle_name = f"{bundle_name}-{version}"
        bundle_dir = inbox_dir / bundle_name
    images_dir = bundle_dir / "images"
    bundle_dir.mkdir(parents=True, exist_ok=False, mode=0o700)

    original_html = str(item.get("content") or "")
    collector = ImageCollector()
    collector.feed(original_html)

    cover_url = normalize_image_url(str(item.get("thumb_url") or ""))
    ordered_urls = list(collector.urls)
    if cover_url and cover_url not in ordered_urls:
        ordered_urls.insert(0, cover_url)

    replacements: Dict[str, str] = {}
    image_records: List[Dict[str, object]] = []
    errors: List[str] = []
    if download_images:
        for image_index, url in enumerate(ordered_urls, start=1):
            try:
                path, sha256, size = download_image(
                    url, images_dir / f"image-{image_index:03d}"
                )
                relative_path = path.relative_to(bundle_dir).as_posix()
                replacements[url] = relative_path
                image_records.append(
                    {
                        "source_url": url,
                        "local_path": relative_path,
                        "sha256": sha256,
                        "size": size,
                    }
                )
            except ImportErrorWithCode as exc:
                errors.append(f"{url}: {exc}")

    rewriter = HtmlImageRewriter(replacements)
    rewriter.feed(original_html)
    localized_html = "".join(rewriter.output)

    atomic_write_text(bundle_dir / "content-original.html", original_html)
    atomic_write_text(bundle_dir / "content-local.html", localized_html)

    metadata: Dict[str, object] = {
        "schema_version": 1,
        "article_id": article_id,
        "item_index": item_index,
        "bundle_name": bundle_name,
        "title": item.get("title") or "",
        "author": item.get("author") or "",
        "digest": item.get("digest") or "",
        "article_url": item.get("url") or "",
        "content_source_url": item.get("content_source_url") or "",
        "thumb_url": item.get("thumb_url") or "",
        "show_cover_pic": item.get("show_cover_pic"),
        "need_open_comment": item.get("need_open_comment"),
        "only_fans_can_comment": item.get("only_fans_can_comment"),
        "create_time": parse_timestamp(group.get("create_time")),
        "update_time": parse_timestamp(group.get("update_time")),
        "fetched_at": datetime.now(CHINA_TZ).isoformat(),
        "content_original": "content-original.html",
        "content_local": "content-local.html",
        "images": image_records,
        "errors": errors,
        "ready_for_review": not errors,
    }
    write_json(bundle_dir / "article.json", metadata)
    return metadata


def load_state(path: Path) -> Dict[str, object]:
    if not path.exists():
        return {"schema_version": 1, "articles": {}}
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ImportErrorWithCode(f"状态文件无法读取：{path}: {exc}") from exc
    if not isinstance(value, dict) or not isinstance(value.get("articles", {}), dict):
        raise ImportErrorWithCode(f"状态文件格式异常：{path}")
    value.setdefault("schema_version", 1)
    value.setdefault("articles", {})
    return value


def create_export(data_dir: Path, bundle_names: Iterable[str]) -> Optional[Path]:
    names = list(bundle_names)
    if not names:
        return None
    exports_dir = data_dir / "exports"
    exports_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    timestamp = datetime.now(CHINA_TZ).strftime("%Y%m%d-%H%M%S")
    archive = exports_dir / f"wechat-review-{timestamp}.zip"
    inbox_dir = data_dir / "inbox"
    summary = data_dir / "fetch-summary.json"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as output:
        if summary.is_file():
            output.write(summary, "fetch-summary.json")
        for name in names:
            bundle_dir = inbox_dir / name
            for path in sorted(bundle_dir.rglob("*")):
                if path.is_file():
                    output.write(path, Path("inbox") / name / path.relative_to(bundle_dir))
    os.chmod(archive, 0o600)
    return archive


def fetch(args: argparse.Namespace) -> int:
    os.umask(0o077)
    env_file = Path(args.env_file)
    data_dir = Path(args.data_dir)
    inbox_dir = data_dir / "inbox"
    state_file = data_dir / "state.json"
    inbox_dir.mkdir(parents=True, exist_ok=True, mode=0o700)

    credentials = read_env(env_file)
    token = get_access_token(credentials)
    total_count, groups = list_published_groups(token, args.max_groups)
    print(f"公众号连接成功：共有 {total_count} 组已发布内容。")

    state = load_state(state_file)
    state_articles = state["articles"]
    assert isinstance(state_articles, dict)
    imported: List[Dict[str, object]] = []
    imported_bundles: List[str] = []
    skipped = 0

    for group in groups:
        article_id = str(group.get("article_id") or "").strip()
        if not article_id:
            continue
        if article_id in state_articles and not args.force:
            skipped += 1
            continue

        detail = get_published_group(token, article_id)
        news_items = detail.get("news_item") or []
        if not isinstance(news_items, list) or not news_items:
            raise ImportErrorWithCode(f"文章 {article_id} 没有返回图文内容")

        group_records: List[Dict[str, object]] = []
        group_ok = True
        for item_index, raw_item in enumerate(news_items):
            if not isinstance(raw_item, dict):
                continue
            record = localize_article_item(
                article_id,
                item_index,
                raw_item,
                group,
                inbox_dir,
                download_images=not args.no_images,
            )
            group_records.append(record)
            imported.append(record)
            imported_bundles.append(str(record["bundle_name"]))
            if record["errors"]:
                group_ok = False

        if group_ok:
            state_articles[article_id] = {
                "update_time": group.get("update_time"),
                "bundles": [record["bundle_name"] for record in group_records],
                "fetched_at": datetime.now(CHINA_TZ).isoformat(),
            }

    summary = {
        "schema_version": 1,
        "fetched_at": datetime.now(CHINA_TZ).isoformat(),
        "total_published_groups": total_count,
        "checked_groups": len(groups),
        "imported_items": len(imported),
        "skipped_groups": skipped,
        "items": [
            {
                "article_id": record["article_id"],
                "bundle_name": record["bundle_name"],
                "title": record["title"],
                "ready_for_review": record["ready_for_review"],
                "error_count": len(record["errors"]),
            }
            for record in imported
        ],
    }
    write_json(data_dir / "fetch-summary.json", summary)
    state["updated_at"] = datetime.now(CHINA_TZ).isoformat()
    write_json(state_file, state)
    archive = create_export(data_dir, imported_bundles)

    print(f"本次新增 {len(imported)} 篇，跳过已抓取内容 {skipped} 组。")
    for record in imported:
        status = "待审核" if record["ready_for_review"] else "图片不完整"
        print(f"- [{status}] {record['title']}")
    if archive:
        print(f"审核包：{archive}")
    else:
        print("没有新文章，不生成新的审核包。")
    return 0 if all(record["ready_for_review"] for record in imported) else 2


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="将公众号已发布文章抓取到私有待审核区，不直接修改官网。"
    )
    parser.add_argument(
        "--env-file",
        default="/etc/superbobo-wechat.env",
        help="包含 WECHAT_APP_ID 和 WECHAT_APP_SECRET 的 600 权限文件",
    )
    parser.add_argument(
        "--data-dir",
        default="/var/lib/superbobo-wechat",
        help="私有抓取数据与审核包目录",
    )
    parser.add_argument(
        "--max-groups",
        type=int,
        default=20,
        help="本次最多检查的已发布内容组数，默认 20",
    )
    parser.add_argument("--force", action="store_true", help="重新抓取状态中已有的文章")
    parser.add_argument("--no-images", action="store_true", help="仅抓取文字，不下载图片")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.max_groups < 1 or args.max_groups > 1000:
        parser.error("--max-groups 必须在 1 到 1000 之间")
    try:
        return fetch(args)
    except ImportErrorWithCode as exc:
        print(f"抓取失败：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
