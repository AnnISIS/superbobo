#!/usr/bin/env python3
"""Prepare and publish reviewed WeChat articles into the static website.

Workflow:
1. prepare: unpack a private review archive and produce editable drafts.
2. validate: check English, Japanese and Danish translations.
3. publish: generate the website page, update the news index and create a patch.

Publishing changes the local repository only. It never connects to the production
server and never bypasses the explicit review step.
"""

import argparse
import hashlib
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from datetime import date, datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError as exc:  # pragma: no cover - exercised by deployment environment
    raise SystemExit("缺少 beautifulsoup4，请先安装后再运行。") from exc


LANGUAGES = ("en", "ja", "da")
TRANSLATION_START = "// BEGIN WECHAT_GENERATED_NEWS_TRANSLATIONS"
TRANSLATION_END = "// END WECHAT_GENERATED_NEWS_TRANSLATIONS"
FEATURE_START = "<!-- AUTO NEWS FEATURE START -->"
FEATURE_END = "<!-- AUTO NEWS FEATURE END -->"
SPOTLIGHT_START = "<!-- AUTO NEWS SPOTLIGHT START -->"
SPOTLIGHT_END = "<!-- AUTO NEWS SPOTLIGHT END -->"
LIST_START = "<!-- AUTO NEWS LIST START -->"
LIST_END = "<!-- AUTO NEWS LIST END -->"
MEDIA_TOKEN = re.compile(r"^\[\[media:(\d+)\]\]$")
BLOCK_TAGS = {
    "article",
    "blockquote",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
    "p",
    "section",
}


class PipelineError(RuntimeError):
    pass


def read_json(path: Path) -> Dict[str, object]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise PipelineError(f"无法读取 JSON：{path}: {exc}") from exc
    if not isinstance(value, dict):
        raise PipelineError(f"JSON 顶层必须是对象：{path}")
    return value


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def clean_text(value: str) -> str:
    value = html.unescape(value).replace("\xa0", " ").replace("\u200b", "")
    return re.sub(r"\s+", " ", value).strip()


def safe_extract(archive: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    root = destination.resolve()
    with zipfile.ZipFile(archive) as source:
        for member in source.infolist():
            target = (destination / member.filename).resolve()
            if target != root and root not in target.parents:
                raise PipelineError(f"压缩包包含不安全路径：{member.filename}")
        source.extractall(destination)


def probable_heading(tag: Tag, text: str) -> bool:
    if tag.name in {"h1", "h2", "h3", "h4", "h5", "h6"}:
        return True
    if len(text) > 60 or re.search(r"[。！？!?]$", text):
        return False
    styles = [str(tag.get("style") or "").lower()]
    styles.extend(str(child.get("style") or "").lower() for child in tag.find_all(True))
    combined_style = ";".join(styles)
    parent_style = styles[0]
    centered = bool(re.search(r"text-align\s*:\s*center", parent_style))
    bold = bool(tag.find(["strong", "b"])) or bool(
        re.search(r"font-weight\s*:\s*(?:bold|[6-9]00)", combined_style)
    )
    sizes = [int(value) for value in re.findall(r"font-size\s*:\s*(\d+)px", combined_style)]
    largest_size = max(sizes) if sizes else 0
    bracketed = bool(re.fullmatch(r"[【\[].+[】\]]", text))

    # WeChat often applies visual heading styles to a nested span instead of
    # the paragraph itself. A centered 17px line, a centered bracketed label,
    # or a short bold line should therefore remain a heading after import.
    if centered and (largest_size >= 17 or bold or bracketed):
        return True
    if largest_size >= 18:
        return True
    return bold and len(text) <= 36


def next_article_id(news_index: Dict[str, object], publish_date: str, reserved: Set[str]) -> str:
    prefix = publish_date.replace("-", "")
    existing = {
        str(item.get("id"))
        for item in news_index.get("articles", [])
        if isinstance(item, dict)
    } | reserved
    for number in range(1, 100):
        candidate = f"{prefix}{number:02d}"
        if candidate not in existing:
            reserved.add(candidate)
            return candidate
    raise PipelineError(f"日期 {publish_date} 已没有可用文章编号")


def parse_publish_date(metadata: Dict[str, object], override: Optional[str]) -> str:
    value = override or str(metadata.get("update_time") or metadata.get("create_time") or "")[:10]
    try:
        return date.fromisoformat(value).isoformat()
    except ValueError as exc:
        raise PipelineError(f"无法确定文章日期，请用 --date YYYY-MM-DD 指定：{value}") from exc


def parse_article_nodes(bundle_dir: Path, output_assets: Path) -> Tuple[List[Dict[str, str]], List[str]]:
    source = bundle_dir / "content-local.html"
    if not source.is_file():
        raise PipelineError(f"缺少正文文件：{source}")
    soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
    errors: List[str] = []
    embedded_media = soup.select("iframe, video, audio, mp-common-videosnap, mp-video, mpvoice")
    if embedded_media:
        errors.append(
            f"检测到 {len(embedded_media)} 处视频或音频内容，官网暂不自动搬运，请人工确认后处理"
        )
    for unwanted in soup.select(
        "script, style, noscript, svg, iframe, video, audio, mp-common-videosnap, mp-video, mpvoice"
    ):
        unwanted.decompose()

    nodes: List[Dict[str, str]] = []
    copied_images: Dict[Path, str] = {}
    last_text = ""

    def add_text(text: str, kind: str) -> None:
        nonlocal last_text
        text = clean_text(text)
        if not text or text == last_text or text.upper() == "END":
            return
        nodes.append({"type": kind, "text": text})
        last_text = text

    def add_image(tag: Tag) -> None:
        raw_src = str(tag.get("src") or "").strip()
        if not raw_src:
            return
        parsed = Path(raw_src)
        if parsed.is_absolute() or ".." in parsed.parts:
            errors.append(f"图片路径不安全：{raw_src}")
            return
        source_image = (bundle_dir / parsed).resolve()
        bundle_root = bundle_dir.resolve()
        if bundle_root not in source_image.parents or not source_image.is_file():
            errors.append(f"找不到图片：{raw_src}")
            return
        if source_image in copied_images:
            return
        output_assets.mkdir(parents=True, exist_ok=True)
        number = len(copied_images) + 1
        suffix = source_image.suffix.lower() or ".bin"
        filename = f"image-{number:03d}{suffix}"
        destination = output_assets / filename
        shutil.copy2(source_image, destination)
        copied_images[source_image] = filename
        nodes.append(
            {
                "type": "image",
                "path": f"assets/{filename}",
                "alt": clean_text(str(tag.get("alt") or "")),
            }
        )

    def inline_walk(parent: Tag, default_kind: str) -> None:
        buffer: List[str] = []

        def flush() -> None:
            if not buffer:
                return
            text = clean_text("".join(buffer))
            buffer.clear()
            if text:
                add_text(text, "heading" if probable_heading(parent, text) else default_kind)

        def visit_inline(node: object) -> None:
            if isinstance(node, NavigableString):
                buffer.append(str(node))
                return
            if not isinstance(node, Tag):
                return
            if node.name == "img":
                flush()
                add_image(node)
                return
            if node.name == "br":
                buffer.append("\n")
                return
            if node.name in BLOCK_TAGS and node is not parent:
                flush()
                walk(node)
                return
            for child in node.children:
                visit_inline(child)

        for child in parent.children:
            visit_inline(child)
        flush()

    def walk(node: object) -> None:
        if isinstance(node, NavigableString):
            add_text(str(node), "paragraph")
            return
        if not isinstance(node, Tag):
            return
        if node.name == "img":
            add_image(node)
            return
        if node.name in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            inline_walk(node, "heading")
            return
        if node.name in {"p", "li", "blockquote"}:
            inline_walk(node, "paragraph")
            return

        direct_blocks = [
            child for child in node.children if isinstance(child, Tag) and child.name in BLOCK_TAGS
        ]
        if direct_blocks:
            for child in node.children:
                walk(child)
            return
        inline_walk(node, "paragraph")

    root = soup.body or soup
    for child in root.children:
        walk(child)
    return nodes, errors


def body_tokens(nodes: Sequence[Dict[str, str]]) -> Tuple[List[str], List[int]]:
    tokens: List[str] = []
    heading_indices: List[int] = []
    media_number = 0
    for node in nodes:
        if node["type"] == "image":
            media_number += 1
            tokens.append(f"[[media:{media_number}]]")
        else:
            if node["type"] == "heading":
                heading_indices.append(len(tokens))
            tokens.append(node["text"])
    return tokens, heading_indices


def make_review_html(draft: Dict[str, object]) -> str:
    blocks: List[str] = []
    for node in draft["nodes"]:
        if node["type"] == "heading":
            blocks.append(f"<h2>{html.escape(node['text'])}</h2>")
        elif node["type"] == "paragraph":
            blocks.append(f"<p>{html.escape(node['text'])}</p>")
        else:
            blocks.append(
                f'<figure><img src="{html.escape(node["path"], quote=True)}" alt="{html.escape(node.get("alt", ""), quote=True)}"></figure>'
            )
    parse_errors = draft.get("parse_errors") or []
    warning_html = ""
    if parse_errors:
        warning_items = "".join(f"<li>{html.escape(str(item))}</li>" for item in parse_errors)
        warning_html = f'<div class="warning"><strong>需人工处理</strong><ul>{warning_items}</ul></div>'
    return """<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}｜待审核</title><style>
body{{margin:0;background:#f7f4f6;color:#1f3148;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}}
main{{max-width:820px;margin:32px auto;padding:40px;background:#fff;border-radius:24px}}
h1{{line-height:1.35}}h2{{margin-top:32px}}p{{font-size:17px;line-height:1.9}}figure{{margin:28px 0}}img{{display:block;max-width:100%;height:auto;margin:auto}}
.meta{{color:#718096;margin-bottom:28px}}.notice,.warning{{padding:14px 18px;border-radius:12px}}
.notice{{background:#fff4d8}}.warning{{margin-top:14px;background:#ffe7e7;color:#8a1c1c}}.warning ul{{margin-bottom:0}}
</style></head><body><main><div class="notice">待审核预览：此页面不会发布到官网。</div>
{warning}<h1>{title}</h1><div class="meta">{date}</div>{body}</main></body></html>
""".format(
        title=html.escape(str(draft["title"])),
        date=html.escape(str(draft["date"])),
        warning=warning_html,
        body="".join(blocks),
    )


def prepare_command(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo_root).resolve()
    review_path = Path(args.review).resolve()
    output_root = Path(args.output or (repo_root / "work" / "wechat-drafts")).resolve()
    news_index = read_json(repo_root / "data" / "news-index.json")
    reserved: Set[str] = set()
    indexed_articles = news_index.get("articles", [])
    existing_titles = {
        clean_text(str(item.get("title") or "")): str(item.get("id") or "")
        for item in indexed_articles
        if isinstance(item, dict) and clean_text(str(item.get("title") or ""))
    }

    with tempfile.TemporaryDirectory(prefix="superbobo-wechat-review-") as temp_dir:
        extracted = Path(temp_dir)
        if review_path.is_file() and review_path.suffix.lower() == ".zip":
            safe_extract(review_path, extracted)
            review_root = extracted
        elif review_path.is_dir():
            review_root = review_path
        else:
            raise PipelineError(f"审核包不存在：{review_path}")

        metadata_files = sorted(review_root.glob("**/article.json"))
        if not metadata_files:
            raise PipelineError("审核包中没有 article.json")
        if args.bundle:
            metadata_files = [path for path in metadata_files if path.parent.name == args.bundle]
            if not metadata_files:
                raise PipelineError(f"审核包中没有指定文章：{args.bundle}")
        if args.article_id and len(metadata_files) != 1:
            raise PipelineError("--article-id 只能用于单篇审核包")
        if args.date and len(metadata_files) != 1:
            raise PipelineError("--date 只能用于单篇审核包")

        prepared: List[Path] = []
        for metadata_file in metadata_files:
            metadata = read_json(metadata_file)
            title = clean_text(str(metadata.get("title") or ""))
            existing_id = existing_titles.get(title)
            if existing_id and not args.allow_existing_title:
                print(f"跳过官网已有文章：{title}（{existing_id}）")
                continue
            publish_date = parse_publish_date(metadata, args.date)
            article_id = args.article_id or next_article_id(news_index, publish_date, reserved)
            draft_dir = output_root / article_id
            if draft_dir.exists():
                raise PipelineError(f"草稿目录已经存在：{draft_dir}")
            assets_dir = draft_dir / "assets"
            nodes, errors = parse_article_nodes(metadata_file.parent, assets_dir)
            if not nodes:
                raise PipelineError(f"文章未解析出正文：{metadata_file.parent.name}")
            first_paragraph = next(
                (node["text"] for node in nodes if node["type"] == "paragraph"), ""
            )
            summary = clean_text(str(metadata.get("digest") or "")) or first_paragraph
            if len(summary) > 120:
                summary = summary[:117].rstrip("，。；、 ") + "…"
            tokens, heading_indices = body_tokens(nodes)
            draft: Dict[str, object] = {
                "schema_version": 1,
                "article_id": article_id,
                "date": publish_date,
                "title": title,
                "summary": summary,
                "source_article_id": metadata.get("article_id"),
                "source_url": metadata.get("article_url"),
                "source_bundle": metadata_file.parent.name,
                "nodes": nodes,
                "heading_indices": heading_indices,
                "parse_errors": errors,
            }
            template: Dict[str, object] = {
                "schema_version": 1,
                "article_id": article_id,
                "zh": {
                    "title": draft["title"],
                    "summary": draft["summary"],
                    "body": tokens,
                    "headingIndices": heading_indices,
                },
            }
            for language in LANGUAGES:
                template[language] = {
                    "title": "",
                    "summary": "",
                    "body": [token if MEDIA_TOKEN.match(token) else "" for token in tokens],
                }
            write_json(draft_dir / "draft.json", draft)
            write_json(draft_dir / "translations.template.json", template)
            (draft_dir / "review.html").write_text(make_review_html(draft), encoding="utf-8")
            prepared.append(draft_dir)
            print(f"草稿已生成：{draft_dir}")
            print(f"预览文件：{draft_dir / 'review.html'}")
            if errors:
                print(f"注意：发现 {len(errors)} 个需人工处理的问题，发布前必须先审核。")
        print(f"共生成 {len(prepared)} 篇待审核草稿。")
    return 0


def validate_translations(draft: Dict[str, object], translations: Dict[str, object]) -> None:
    article_id = str(draft["article_id"])
    if str(translations.get("article_id")) != article_id:
        raise PipelineError("翻译文件 article_id 与草稿不一致")
    source_tokens, _ = body_tokens(draft["nodes"])
    for language in LANGUAGES:
        value = translations.get(language)
        if not isinstance(value, dict):
            raise PipelineError(f"翻译文件缺少 {language}")
        if not clean_text(str(value.get("title") or "")):
            raise PipelineError(f"{language} 标题为空")
        if not clean_text(str(value.get("summary") or "")):
            raise PipelineError(f"{language} 摘要为空")
        translated_body = value.get("body")
        if not isinstance(translated_body, list) or len(translated_body) != len(source_tokens):
            raise PipelineError(
                f"{language} 正文段落数不一致：应为 {len(source_tokens)}，实际为 {len(translated_body) if isinstance(translated_body, list) else '非数组'}"
            )
        for index, (source, translated) in enumerate(zip(source_tokens, translated_body)):
            source_media = MEDIA_TOKEN.match(source)
            translated_text = clean_text(str(translated or ""))
            if source_media:
                if translated_text != source:
                    raise PipelineError(f"{language} 第 {index + 1} 项必须保留 {source}")
            elif not translated_text:
                raise PipelineError(f"{language} 第 {index + 1} 段为空")


def render_article_html(draft: Dict[str, object], next_article: Dict[str, object]) -> str:
    article_id = str(draft["article_id"])
    title = str(draft["title"])
    long_class = " article-page--long-title" if len(title) >= 30 else ""
    blocks: List[str] = []
    image_number = 0
    for node in draft["nodes"]:
        if node["type"] == "heading":
            blocks.append(f'          <h2 class="article-section-heading">{html.escape(node["text"])}</h2>')
        elif node["type"] == "paragraph":
            blocks.append(f"          <p>{html.escape(node['text'])}</p>")
        else:
            image_number += 1
            filename = Path(node["path"]).name
            alt = node.get("alt") or f"{title} - 原文配图 {image_number}"
            blocks.append(
                '          <figure class="article-inline-image"><img src="../media/news/article-{id}/{filename}" alt="{alt}" loading="lazy" decoding="async" /></figure>'.format(
                    id=article_id,
                    filename=html.escape(filename, quote=True),
                    alt=html.escape(str(alt), quote=True),
                )
            )
    return """<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | 品牌资讯 | 超级有爱</title>
    <link rel="stylesheet" href="../styles.css?v=20260918" />
  </head>
  <body class="article-page{long_class}">
    <main class="article-shell">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../news.html">品牌资讯</a><span>/</span><span>{title}</span></nav>
      <article class="article-layout">
        <header class="article-header">
          <span class="article-kicker">Brand News</span>
          <h1>{title}</h1>
          <div class="article-meta"><time datetime="{date}">{date}</time><span>品牌资讯</span></div>
        </header>
        <div class="article-body">
{body}
        </div>
      </article>
      <nav class="article-nav" aria-label="文章切换"><span></span><a href="./{next_id}.html"><span>下一篇</span><strong>{next_title}</strong></a></nav>
      <div class="article-back"><a class="button secondary" href="../news.html">返回品牌资讯</a></div>
    </main>
    <script src="../media/news/news-translations.js?v=20260918" defer></script>
    <script src="../site.js?v=20260903-3" defer></script>
  </body>
</html>
""".format(
        title=html.escape(title),
        long_class=long_class,
        date=html.escape(str(draft["date"])),
        body="\n".join(blocks),
        next_id=html.escape(str(next_article["id"]), quote=True),
        next_title=html.escape(str(next_article["title"])),
    )


def replace_between(source: str, start: str, end: str, body: str) -> str:
    pattern = re.compile(
        r"(?m)^(?P<indent>[ \t]*)"
        + re.escape(start)
        + r"[\s\S]*?^(?P=indent)"
        + re.escape(end)
    )
    match = pattern.search(source)
    if not match:
        raise PipelineError(f"文件中缺少自动生成标记：{start}")
    indent = match.group("indent")
    replacement = indent + start + "\n" + body.rstrip() + "\n" + indent + end
    return source[: match.start()] + replacement + source[match.end() :]


def render_news_index(news_html: str, articles: Sequence[Dict[str, object]]) -> str:
    if len(articles) < 5:
        raise PipelineError("资讯索引至少需要 5 篇文章")
    feature = articles[0]
    feature_html = """        <a class="news-featured" href="./newsinfo/{id}.html">
          <div class="news-featured-image"><img src="./{thumb}" decoding="async" fetchpriority="high" alt="{title}" /></div>
          <div class="news-featured-body">
            <time>{date}</time>
            <span>Latest</span>
            <h2>{title}</h2>
            <p>{summary}</p>
          </div>
        </a>""".format(**{key: html.escape(str(feature.get(key, "")), quote=True) for key in ("id", "thumb", "title", "date", "summary")})
    spotlight = []
    for item in articles[1:4]:
        values = {key: html.escape(str(item.get(key, "")), quote=True) for key in ("id", "thumb", "title", "date")}
        spotlight.append(
            '          <a class="news-card" href="./newsinfo/{id}.html"><div class="news-thumb"><img src="./{thumb}" loading="lazy" decoding="async" alt="{title}" /></div><div class="news-body"><time>{date}</time><h3>{title}</h3><p>阅读全文</p></div></a>'.format(**values)
        )
    rows = []
    for item in articles[4:]:
        values = {key: html.escape(str(item.get(key, "")), quote=True) for key in ("id", "thumb", "title", "date")}
        rows.append(
            '          <a class="news-row" href="./newsinfo/{id}.html"><img src="./{thumb}" loading="lazy" decoding="async" alt="{title}" /><div><time>{date}</time><h3>{title}</h3></div></a>'.format(**values)
        )
    news_html = replace_between(news_html, FEATURE_START, FEATURE_END, feature_html)
    news_html = replace_between(news_html, SPOTLIGHT_START, SPOTLIGHT_END, "\n".join(spotlight))
    news_html = replace_between(news_html, LIST_START, LIST_END, "\n".join(rows))
    return news_html


def render_translation_block(store: Dict[str, object]) -> str:
    articles = store.get("articles", {})
    if not isinstance(articles, dict):
        raise PipelineError("自动翻译数据格式异常")
    lines = [TRANSLATION_START]
    for language in LANGUAGES:
        text_map: Dict[str, str] = {}
        article_map: Dict[str, object] = {}
        for article_id, record in articles.items():
            if not isinstance(record, dict):
                continue
            translated = record.get(language)
            if not isinstance(translated, dict):
                continue
            zh_title = str(record.get("zh_title") or "")
            zh_summary = str(record.get("zh_summary") or "")
            text_map[zh_title] = str(translated.get("title") or "")
            if zh_summary:
                text_map[zh_summary] = str(translated.get("summary") or "")
            article_map[str(article_id)] = {
                "title": translated.get("title"),
                "summary": translated.get("summary"),
                "body": translated.get("body"),
                "headingIndices": record.get("headingIndices", []),
            }
        suffix = language.upper()
        lines.append(
            f"Object.assign(window.NEWS_TEXT_{suffix}, {json.dumps(text_map, ensure_ascii=False, indent=2)});"
        )
        lines.append(
            f"Object.assign(window.NEWS_ARTICLE_{suffix}, {json.dumps(article_map, ensure_ascii=False, indent=2)});"
        )
    lines.append(TRANSLATION_END)
    return "\n".join(lines)


def update_translation_js(source: str, block: str) -> str:
    pattern = re.compile(re.escape(TRANSLATION_START) + r"[\s\S]*?" + re.escape(TRANSLATION_END))
    if pattern.search(source):
        return pattern.sub(block, source, count=1)
    return source.rstrip() + "\n\n" + block + "\n"


def create_thumbnail(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise PipelineError("找不到 ffmpeg，无法生成资讯缩略图")
    result = subprocess.run(
        [
            ffmpeg,
            "-y",
            "-v",
            "error",
            "-i",
            str(source),
            "-vf",
            "scale=900:-2:force_original_aspect_ratio=decrease",
            "-frames:v",
            "1",
            "-c:v",
            "libwebp",
            "-quality",
            "82",
            str(destination),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if result.returncode != 0 or not destination.is_file():
        raise PipelineError(f"生成缩略图失败：{result.stderr.strip()}")


def update_previous_navigation(previous_page: Path, new_id: str, new_title: str) -> None:
    source = previous_page.read_text(encoding="utf-8")
    pattern = re.compile(r'(<nav class="article-nav" aria-label="文章切换">)([\s\S]*?)(</nav>)')
    match = pattern.search(source)
    if not match:
        raise PipelineError(f"上一篇文章缺少切换导航：{previous_page}")
    inner = match.group(2)
    if f'./{new_id}.html' in inner:
        return
    previous_link = '<a href="./{id}.html"><span>上一篇</span><strong>{title}</strong></a>'.format(
        id=html.escape(new_id, quote=True), title=html.escape(new_title)
    )
    if "<span></span>" in inner:
        inner = inner.replace("<span></span>", previous_link, 1)
    else:
        inner = previous_link + inner
    source = source[: match.start()] + match.group(1) + inner + match.group(3) + source[match.end() :]
    previous_page.write_text(source, encoding="utf-8")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def update_deploy_manifest(repo_root: Path, article_id: str, touched: Iterable[Path], count: int) -> None:
    path = repo_root / "DEPLOY_MANIFEST.json"
    manifest = read_json(path)
    manifest["created_at"] = date.today().isoformat()
    manifest["working_tree_changes_included"] = True
    manifest["news_article_count"] = count
    new_articles = manifest.setdefault("new_news_articles", [])
    article_path = f"newsinfo/{article_id}.html"
    if isinstance(new_articles, list) and article_path not in new_articles:
        new_articles.append(article_path)
    checksums = manifest.setdefault("checksums_sha256", {})
    if isinstance(checksums, dict):
        for item in touched:
            if item.is_file() and repo_root in item.resolve().parents:
                checksums[item.relative_to(repo_root).as_posix()] = sha256(item)
    write_json(path, manifest)


def shell_quote(value: str) -> str:
    return "'" + value.replace("'", "'\"'\"'") + "'"


def create_incremental_patch(repo_root: Path, files: Sequence[Path], article_id: str, output_dir: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    patch_name = f"superbobo-news-patch-{article_id}-{timestamp}"
    patch_dir = output_dir / patch_name
    payload = patch_dir / "payload"
    patch_dir.mkdir(parents=True, exist_ok=False)
    relative_files = sorted({path.relative_to(repo_root).as_posix() for path in files if path.is_file()})
    for relative in relative_files:
        destination = payload / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(repo_root / relative, destination)
    sums = [f"{sha256(payload / relative)}  payload/{relative}" for relative in relative_files]
    (patch_dir / "SHA256SUMS").write_text("\n".join(sums) + "\n", encoding="utf-8")
    write_json(
        patch_dir / "PATCH_MANIFEST.json",
        {
            "patch_id": patch_name,
            "article_id": article_id,
            "created_at": datetime.now().isoformat(),
            "site_root": "/usr/share/superbobo/superqiuqiu-website-v2",
            "files": relative_files,
        },
    )
    file_array = "\n".join(f"  {shell_quote(relative)}" for relative in relative_files)
    deploy = """#!/usr/bin/env bash
set -euo pipefail
PATCH_ID={patch_id}
SITE_ROOT="${{1:-/usr/share/superbobo/superqiuqiu-website-v2}}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${{BASH_SOURCE[0]}}")" && pwd)"
BACKUP_DIR="/usr/share/superbobo/incremental-backups/${{PATCH_ID}}"
FILES=(
{files}
)
case "${{SITE_ROOT}}" in /usr/share/superbobo/*) ;; *) echo "站点目录不合法" >&2; exit 1;; esac
[[ -d "${{SITE_ROOT}}" ]] || {{ echo "站点目录不存在：${{SITE_ROOT}}" >&2; exit 1; }}
(cd "${{SCRIPT_DIR}}" && sha256sum -c SHA256SUMS)
[[ ! -e "${{BACKUP_DIR}}" ]] || {{ echo "备份目录已存在：${{BACKUP_DIR}}" >&2; exit 1; }}
mkdir -p "${{BACKUP_DIR}}/files"
: > "${{BACKUP_DIR}}/NEW_FILES.txt"
for rel in "${{FILES[@]}}"; do
  if [[ -e "${{SITE_ROOT}}/${{rel}}" ]]; then
    mkdir -p "${{BACKUP_DIR}}/files/$(dirname -- "${{rel}}")"
    cp -a "${{SITE_ROOT}}/${{rel}}" "${{BACKUP_DIR}}/files/${{rel}}"
  else
    printf '%s\n' "${{rel}}" >> "${{BACKUP_DIR}}/NEW_FILES.txt"
  fi
done
for rel in "${{FILES[@]}}"; do
  mkdir -p "${{SITE_ROOT}}/$(dirname -- "${{rel}}")"
  install -m 0644 "${{SCRIPT_DIR}}/payload/${{rel}}" "${{SITE_ROOT}}/${{rel}}"
  cmp -s "${{SCRIPT_DIR}}/payload/${{rel}}" "${{SITE_ROOT}}/${{rel}}" || {{ echo "校验失败：${{rel}}" >&2; exit 1; }}
done
printf '%s\n' "${{BACKUP_DIR}}" > /usr/share/superbobo/incremental-backups/LAST_NEWS_PATCH
echo "增量部署完成，共更新 ${{#FILES[@]}} 个文件。"
echo "备份位置：${{BACKUP_DIR}}"
""".format(patch_id=shell_quote(patch_name), files=file_array)
    rollback = """#!/usr/bin/env bash
set -euo pipefail
SITE_ROOT="${{SITE_ROOT:-/usr/share/superbobo/superqiuqiu-website-v2}}"
POINTER=/usr/share/superbobo/incremental-backups/LAST_NEWS_PATCH
if [[ $# -ge 1 ]]; then
  BACKUP_DIR="$1"
elif [[ -f "${{POINTER}}" ]]; then
  BACKUP_DIR="$(<"${{POINTER}}")"
else
  echo "找不到最近一次资讯增量备份记录" >&2
  exit 1
fi
FILES=(
{files}
)
case "${{BACKUP_DIR}}" in /usr/share/superbobo/incremental-backups/*) ;; *) echo "备份目录不合法" >&2; exit 1;; esac
for rel in "${{FILES[@]}}"; do
  if [[ -f "${{BACKUP_DIR}}/files/${{rel}}" ]]; then
    mkdir -p "${{SITE_ROOT}}/$(dirname -- "${{rel}}")"
    install -m 0644 "${{BACKUP_DIR}}/files/${{rel}}" "${{SITE_ROOT}}/${{rel}}"
  elif grep -Fxq "${{rel}}" "${{BACKUP_DIR}}/NEW_FILES.txt"; then
    rm -f -- "${{SITE_ROOT}}/${{rel}}"
  else
    echo "备份记录缺失：${{rel}}" >&2; exit 1
  fi
done
echo "回滚完成。"
""".format(files=file_array)
    (patch_dir / "deploy.sh").write_text(deploy, encoding="utf-8")
    (patch_dir / "rollback.sh").write_text(rollback, encoding="utf-8")
    os.chmod(patch_dir / "deploy.sh", 0o755)
    os.chmod(patch_dir / "rollback.sh", 0o755)
    (patch_dir / "README.txt").write_text(
        "上传整个 ZIP 到服务器后解压，进入同名目录执行 bash deploy.sh。\n"
        "脚本只备份并覆盖本次变更文件，不需要重载 Nginx。\n",
        encoding="utf-8",
    )
    archive = output_dir / f"{patch_name}.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as output:
        for path in sorted(patch_dir.rglob("*")):
            if path.is_file():
                output.write(path, Path(patch_name) / path.relative_to(patch_dir))
    return archive


def publish_command(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo_root).resolve()
    draft_dir = Path(args.draft).resolve()
    draft = read_json(draft_dir / "draft.json")
    translations = read_json(Path(args.translations).resolve())
    validate_translations(draft, translations)
    if draft.get("parse_errors") and not args.allow_parse_errors:
        raise PipelineError("草稿仍有解析错误；确认后可用 --allow-parse-errors 继续")

    news_index_path = repo_root / "data" / "news-index.json"
    news_index = read_json(news_index_path)
    articles = news_index.get("articles")
    if not isinstance(articles, list) or not articles:
        raise PipelineError("资讯索引为空")
    article_id = str(draft["article_id"])
    if any(isinstance(item, dict) and str(item.get("id")) == article_id for item in articles):
        raise PipelineError(f"文章编号已存在：{article_id}")

    previous_top = articles[0]
    if not isinstance(previous_top, dict):
        raise PipelineError("资讯索引首篇数据异常")
    media_dir = repo_root / "media" / "news" / f"article-{article_id}"
    if media_dir.exists():
        raise PipelineError(f"媒体目录已存在：{media_dir}")
    media_dir.mkdir(parents=True)
    touched: Set[Path] = set()
    first_image: Optional[Path] = None
    for node in draft["nodes"]:
        if node["type"] != "image":
            continue
        source = (draft_dir / node["path"]).resolve()
        if draft_dir not in source.parents or not source.is_file():
            raise PipelineError(f"草稿图片不存在：{node['path']}")
        destination = media_dir / source.name
        shutil.copy2(source, destination)
        touched.add(destination)
        if first_image is None:
            first_image = source
    if first_image is None:
        raise PipelineError("文章没有图片，无法生成资讯缩略图")

    thumbnail = repo_root / "media" / "news" / "thumbs" / f"news-{article_id}.webp"
    create_thumbnail(first_image, thumbnail)
    touched.add(thumbnail)

    page = repo_root / "newsinfo" / f"{article_id}.html"
    page.write_text(render_article_html(draft, previous_top), encoding="utf-8")
    touched.add(page)

    previous_page = repo_root / "newsinfo" / f"{previous_top['id']}.html"
    update_previous_navigation(previous_page, article_id, str(draft["title"]))
    touched.add(previous_page)

    articles.insert(
        0,
        {
            "id": article_id,
            "date": draft["date"],
            "title": draft["title"],
            "summary": draft["summary"],
            "thumb": f"media/news/thumbs/news-{article_id}.webp",
        },
    )
    news_index["updated_at"] = date.today().isoformat()
    write_json(news_index_path, news_index)
    touched.add(news_index_path)

    news_html_path = repo_root / "news.html"
    news_html = render_news_index(news_html_path.read_text(encoding="utf-8"), articles)
    news_html_path.write_text(news_html, encoding="utf-8")
    touched.add(news_html_path)

    store_path = repo_root / "data" / "wechat-generated-translations.json"
    store = read_json(store_path)
    stored_articles = store.setdefault("articles", {})
    if not isinstance(stored_articles, dict):
        raise PipelineError("自动翻译数据格式异常")
    _, heading_indices = body_tokens(draft["nodes"])
    stored_articles[article_id] = {
        "zh_title": draft["title"],
        "zh_summary": draft["summary"],
        "headingIndices": heading_indices,
        **{language: translations[language] for language in LANGUAGES},
    }
    write_json(store_path, store)
    touched.add(store_path)

    translation_js = repo_root / "media" / "news" / "news-translations.js"
    translation_js.write_text(
        update_translation_js(translation_js.read_text(encoding="utf-8"), render_translation_block(store)),
        encoding="utf-8",
    )
    touched.add(translation_js)

    manifest_path = repo_root / "DEPLOY_MANIFEST.json"
    update_deploy_manifest(repo_root, article_id, touched, len(articles))
    touched.add(manifest_path)

    output_dir = Path(args.output or (repo_root.parent / "releases")).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    archive = create_incremental_patch(repo_root, sorted(touched), article_id, output_dir)
    print(f"文章页面：{page}")
    print(f"本地预览：http://127.0.0.1:8765/newsinfo/{article_id}.html")
    print(f"增量部署包：{archive}")
    return 0


def validate_command(args: argparse.Namespace) -> int:
    draft = read_json(Path(args.draft).resolve() / "draft.json")
    translations = read_json(Path(args.translations).resolve())
    validate_translations(draft, translations)
    print("四语结构校验通过：标题、摘要、段落和图片位置完整。")
    return 0


def build_parser() -> argparse.ArgumentParser:
    default_root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description="公众号审核包到官网增量发布流水线")
    parser.add_argument("--repo-root", default=str(default_root))
    subparsers = parser.add_subparsers(dest="command", required=True)

    prepare = subparsers.add_parser("prepare", help="解析审核包并生成中文待审核草稿")
    prepare.add_argument("review", help="wechat-review ZIP 或解压目录")
    prepare.add_argument("--bundle", help="只处理指定 bundle 目录名")
    prepare.add_argument("--date", help="单篇文章日期 YYYY-MM-DD")
    prepare.add_argument("--article-id", help="单篇文章编号 YYYYMMDDNN")
    prepare.add_argument("--output", help="草稿输出目录")
    prepare.add_argument(
        "--allow-existing-title",
        action="store_true",
        help="允许处理标题与官网已有资讯相同的文章",
    )
    prepare.set_defaults(func=prepare_command)

    validate = subparsers.add_parser("validate", help="校验三种翻译与中文结构完全对应")
    validate.add_argument("draft", help="包含 draft.json 的草稿目录")
    validate.add_argument("translations", help="已填写的翻译 JSON")
    validate.set_defaults(func=validate_command)

    publish = subparsers.add_parser("publish", help="生成官网文件及增量部署包")
    publish.add_argument("draft", help="包含 draft.json 的草稿目录")
    publish.add_argument("translations", help="已审核的翻译 JSON")
    publish.add_argument("--output", help="增量包输出目录")
    publish.add_argument("--allow-parse-errors", action="store_true")
    publish.set_defaults(func=publish_command)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except PipelineError as exc:
        print(f"处理失败：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
