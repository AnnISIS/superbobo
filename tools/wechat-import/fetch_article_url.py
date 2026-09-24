#!/usr/bin/env python3
"""Import WeChat official account articles by public URL into the review inbox.

Some articles are mass-broadcast (群发) and therefore never appear in
freepublish/batchget or material/batchget_material. For those, the only
reliable public source is the article's own mp.weixin.qq.com page. This tool
fetches that page, extracts title / publish time / body / images, and writes
a review bundle in exactly the same format as wechat_fetch.py's
localize_article_item, so site_news_pipeline.py can prepare and publish it
through the normal reviewed workflow. It never modifies the public website.
"""

import argparse
import hashlib
import html
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parent))

from wechat_fetch import (  # noqa: E402
    CHINA_TZ,
    HtmlImageRewriter,
    ImportErrorWithCode,
    atomic_write_text,
    download_image,
    normalize_image_url,
    parse_timestamp,
    safe_slug,
    write_json,
)

PAGE_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)
MAX_PAGE_BYTES = 10 * 1024 * 1024
CHINESE_DATETIME = re.compile(
    r"(\d{4})年(\d{1,2})月(\d{1,2})日\s*(?:(\d{1,2}):(\d{2}))?"
)


def clean_text(value: str) -> str:
    value = html.unescape(value).replace("\xa0", " ").replace("\u200b", "")
    return re.sub(r"\s+", " ", value).strip()


def fetch_page(url: str, timeout: int = 30) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": PAGE_USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "zh-CN,zh;q=0.9",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            raw = response.read(MAX_PAGE_BYTES + 1)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
        raise ImportErrorWithCode(f"无法打开文章页面：{exc}") from exc
    if len(raw) > MAX_PAGE_BYTES:
        raise ImportErrorWithCode("文章页面超过 10MB，疑似异常响应")
    return raw.decode(charset, "replace")


def _meta_content(page: str, property_name: str) -> str:
    pattern = re.compile(
        r"<meta[^>]+(?:property|name)=[\"']"
        + re.escape(property_name)
        + r"[\"'][^>]*>",
        re.IGNORECASE,
    )
    match = pattern.search(page)
    if not match:
        return ""
    content = re.search(
        r"content=[\"']([^\"']*)[\"']", match.group(0), re.IGNORECASE
    )
    return html.unescape(content.group(1)) if content else ""


def _tag_text(page: str, pattern: str) -> str:
    match = re.search(pattern, page, re.IGNORECASE | re.DOTALL)
    if not match:
        return ""
    return clean_text(re.sub(r"<[^>]+>", "", match.group(1)))


def extract_title(page: str) -> str:
    for candidate in (
        _meta_content(page, "og:title"),
        _tag_text(page, r'<h1[^>]*id="activity-name"[^>]*>([\s\S]*?)</h1>'),
        _tag_text(page, r"<title[^>]*>([\s\S]*?)</title>"),
    ):
        if candidate:
            return candidate
    return ""


def extract_author(page: str) -> str:
    for candidate in (
        _meta_content(page, "og:article:author"),
        _tag_text(page, r'<span[^>]*id="js_name"[^>]*>([\s\S]*?)</span>'),
    ):
        if candidate:
            return candidate
    return ""


def extract_publish_time(page: str) -> Optional[str]:
    em = _tag_text(page, r'<em[^>]*id="publish_time"[^>]*>([\s\S]*?)</em>')
    match = CHINESE_DATETIME.search(em)
    if match:
        year, month, day, hour, minute = match.groups()
        return datetime(
            int(year),
            int(month),
            int(day),
            int(hour or 0),
            int(minute or 0),
            tzinfo=CHINA_TZ,
        ).isoformat()
    for name in ("ct", "oriCreateTime"):
        match = re.search(r"var\s+" + name + r"\s*=\s*[\"']?(\d{10,13})", page)
        if match:
            value = int(match.group(1))
            if value > 10_000_000_000:
                value //= 1000
            return parse_timestamp(value)
    return None


def _format_tag(
    tag: str, attrs: Sequence[Tuple[str, Optional[str]]], closed: bool
) -> str:
    pieces = ["<", tag]
    for key, value in attrs:
        pieces.extend([" ", key])
        if value is not None:
            pieces.extend(['="', html.escape(value, quote=True), '"'])
    pieces.append(" />" if closed else ">")
    return "".join(pieces)


class PageContentExtractor(HTMLParser):
    """Capture the inner HTML of the #js_content div and its image URLs."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.capture_depth = 0
        self.pieces: List[str] = []
        self.image_urls: List[str] = []

    def _capture_start(
        self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]], closed: bool
    ) -> None:
        lowered = tag.lower()
        if self.capture_depth:
            if lowered == "img":
                values = {key.lower(): value for key, value in attrs if value}
                normalized = normalize_image_url(
                    values.get("data-src") or values.get("src") or ""
                )
                if normalized and normalized not in self.image_urls:
                    self.image_urls.append(normalized)
            self.pieces.append(_format_tag(tag, attrs, closed))
            if lowered == "div" and not closed:
                self.capture_depth += 1
        elif lowered == "div" and not closed:
            if any(
                key.lower() == "id" and value == "js_content"
                for key, value in attrs
            ):
                self.capture_depth = 1

    def handle_starttag(self, tag, attrs):
        self._capture_start(tag, attrs, False)

    def handle_startendtag(self, tag, attrs):
        self._capture_start(tag, attrs, True)

    def handle_endtag(self, tag: str) -> None:
        if not self.capture_depth:
            return
        if tag.lower() == "div":
            self.capture_depth -= 1
            if self.capture_depth <= 0:
                self.capture_depth = 0
                return
        self.pieces.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self._emit(data)

    def handle_entityref(self, name: str) -> None:
        self._emit(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self._emit(f"&#{name};")

    def handle_comment(self, data: str) -> None:
        self._emit(f"<!--{data}-->")

    def handle_decl(self, decl: str) -> None:
        self._emit(f"<!{decl}>")

    def _emit(self, text: str) -> None:
        if self.capture_depth:
            self.pieces.append(text)


def build_bundle(
    url: str, page: str, output_root: Path, include_images: bool = True
) -> Tuple[Path, Dict[str, object]]:
    extractor = PageContentExtractor()
    extractor.feed(page)
    content = "".join(extractor.pieces).strip()
    if not content:
        if "环境异常" in page or "完成验证" in page:
            raise ImportErrorWithCode(
                "微信返回了风控验证页面（环境异常）。请稍后重试或更换网络环境。"
            )
        raise ImportErrorWithCode(
            "页面中没有找到正文（js_content）。请确认链接可以在手机/浏览器中打开。"
        )

    title = clean_text(extract_title(page))
    if not title:
        raise ImportErrorWithCode("页面中没有找到文章标题")
    author = clean_text(extract_author(page))
    digest = clean_text(_meta_content(page, "og:description"))
    publish_time = extract_publish_time(page)
    cover_url = normalize_image_url(_meta_content(page, "og:image")) or ""

    article_id = "url-" + hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
    bundle_name = f"{safe_slug(article_id)}-01"
    bundle_dir = output_root / bundle_name
    if bundle_dir.exists():
        bundle_name = "{}-{}".format(
            safe_slug(article_id),
            datetime.now(CHINA_TZ).strftime("%Y%m%d-%H%M%S"),
        )
        bundle_dir = output_root / bundle_name
    images_dir = bundle_dir / "images"
    bundle_dir.mkdir(parents=True, exist_ok=False, mode=0o700)

    ordered_urls = list(extractor.image_urls)
    if cover_url and cover_url not in ordered_urls:
        ordered_urls.insert(0, cover_url)

    replacements: Dict[str, str] = {}
    image_records: List[Dict[str, object]] = []
    errors: List[str] = []
    if include_images:
        for image_index, image_url in enumerate(ordered_urls, start=1):
            try:
                path, sha256, size = download_image(
                    image_url, images_dir / f"image-{image_index:03d}"
                )
                relative_path = path.relative_to(bundle_dir).as_posix()
                replacements[image_url] = relative_path
                image_records.append(
                    {
                        "source_url": image_url,
                        "local_path": relative_path,
                        "sha256": sha256,
                        "size": size,
                    }
                )
            except ImportErrorWithCode as exc:
                errors.append(f"{image_url}: {exc}")

    rewriter = HtmlImageRewriter(replacements)
    rewriter.feed(content)
    localized_html = "".join(rewriter.output)

    atomic_write_text(bundle_dir / "content-original.html", content)
    atomic_write_text(bundle_dir / "content-local.html", localized_html)

    metadata: Dict[str, object] = {
        "schema_version": 1,
        "article_id": article_id,
        "item_index": 0,
        "bundle_name": bundle_name,
        "title": title,
        "author": author,
        "digest": digest,
        "article_url": url,
        "content_source_url": "",
        "thumb_url": cover_url,
        "show_cover_pic": None,
        "need_open_comment": None,
        "only_fans_can_comment": None,
        "create_time": publish_time,
        "update_time": publish_time,
        "fetched_at": datetime.now(CHINA_TZ).isoformat(),
        "content_original": "content-original.html",
        "content_local": "content-local.html",
        "images": image_records,
        "errors": errors,
        "ready_for_review": not errors,
    }
    write_json(bundle_dir / "article.json", metadata)
    return bundle_dir, metadata


def run(args: argparse.Namespace) -> int:
    os.umask(0o077)
    urls = list(dict.fromkeys(url.strip() for url in args.urls if url.strip()))
    if not urls:
        raise ImportErrorWithCode("没有提供文章链接")
    if args.output:
        output_root = Path(args.output).resolve()
    else:
        output_root = (
            Path(__file__).resolve().parents[2]
            / "work"
            / "wechat-url-import"
            / datetime.now(CHINA_TZ).strftime("%Y%m%d-%H%M%S")
        )
    output_root.mkdir(parents=True, exist_ok=True, mode=0o700)

    ready_flags: List[bool] = []
    for index, url in enumerate(urls, start=1):
        page = fetch_page(url)
        bundle_dir, metadata = build_bundle(
            url, page, output_root, include_images=not args.no_images
        )
        ready = bool(metadata["ready_for_review"])
        ready_flags.append(ready)
        status = "待审核" if ready else "图片不完整"
        print(f"[{index}/{len(urls)}] [{status}] {metadata['title']}")
        print(f"    日期：{str(metadata['update_time'] or '未能识别，prepare 时需 --date 指定')[:19]}")
        print(f"    目录：{bundle_dir}")
        for item in metadata["errors"]:
            print(f"    图片失败：{item}")

    print(f"共导入 {len(urls)} 篇。下一步生成待审核草稿：")
    print(f'  python3 tools/wechat-import/site_news_pipeline.py prepare "{output_root}"')
    return 0 if all(ready_flags) else 2


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="通过文章链接抓取公众号文章到审核区（用于群发等 API 不可见的文章）。"
    )
    parser.add_argument("urls", nargs="+", help="mp.weixin.qq.com 文章链接，可一次多个")
    parser.add_argument("--output", help="审核包输出目录；默认 work/wechat-url-import/<时间戳>")
    parser.add_argument("--no-images", action="store_true", help="只抓文字，不下载图片")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        return run(args)
    except ImportErrorWithCode as exc:
        print(f"导入失败：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
