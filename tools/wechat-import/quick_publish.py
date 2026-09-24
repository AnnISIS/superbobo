#!/usr/bin/env python3
"""One-click publish: WeChat article URL -> local website update.

This skips the review bundle and manual translation steps. It fetches a
public WeChat article page, parses the body, and publishes it directly to
the local website repository. Translations (en/ja/da) are left blank so the
front end falls back to Chinese; translations can be added later by editing
media/news/news-translations.js or re-running site_news_pipeline.py publish
with a filled translations file.

It never connects to the production server — it only updates the local
repository and produces an incremental deploy patch.
"""

import argparse
import os
import shutil
import sys
import tempfile
from datetime import date
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Set

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fetch_article_url import (  # noqa: E402
    ImportErrorWithCode,
    build_bundle,
    fetch_page,
)
from site_news_pipeline import (  # noqa: E402
    LANGUAGES,
    MEDIA_TOKEN,
    PipelineError,
    body_tokens,
    clean_text,
    create_incremental_patch,
    create_thumbnail,
    next_article_id,
    parse_article_nodes,
    parse_publish_date,
    read_json,
    render_article_html,
    render_news_index,
    render_translation_block,
    update_deploy_manifest,
    update_previous_navigation,
    update_translation_js,
    write_json,
)


def publish_from_url(
    url: str,
    repo_root: Path,
    date_override: Optional[str] = None,
    article_id_override: Optional[str] = None,
    output_dir: Optional[Path] = None,
) -> Path:
    os.umask(0o077)

    # 1. Fetch and build a review bundle in a temp directory.
    page = fetch_page(url)
    with tempfile.TemporaryDirectory(prefix="superbobo-quick-") as temp_dir:
        bundle_root = Path(temp_dir) / "bundle"
        bundle_dir, metadata = build_bundle(url, page, bundle_root)

        # 2. Parse the localized HTML into nodes (images copied to assets/).
        assets_dir = bundle_dir / "assets"
        nodes, errors = parse_article_nodes(bundle_dir, assets_dir)
        if not nodes:
            raise PipelineError("文章未解析出正文")

        # 3. Resolve title, date, id.
        news_index = read_json(repo_root / "data" / "news-index.json")
        reserved: Set[str] = set()
        title = clean_text(str(metadata.get("title") or ""))
        publish_date = parse_publish_date(metadata, date_override)
        article_id = article_id_override or next_article_id(
            news_index, publish_date, reserved
        )

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
            "source_bundle": bundle_dir.name,
            "nodes": nodes,
            "heading_indices": heading_indices,
            "parse_errors": errors,
        }

        # 4. Blank translations — front end falls back to Chinese text.
        translations: Dict[str, object] = {
            "schema_version": 1,
            "article_id": article_id,
        }
        for language in LANGUAGES:
            translations[language] = {
                "title": "",
                "summary": "",
                "body": [
                    token if MEDIA_TOKEN.match(token) else "" for token in tokens
                ],
            }

        # 5. Publish (mirrors site_news_pipeline.publish_command without
        #    the translation-structure validation that requires filled text).
        articles = news_index.get("articles")
        if not isinstance(articles, list) or not articles:
            raise PipelineError("资讯索引为空")
        if any(
            isinstance(item, dict) and str(item.get("id")) == article_id
            for item in articles
        ):
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
        for node in nodes:
            if node["type"] != "image":
                continue
            source = (bundle_dir / node["path"]).resolve()
            if not source.is_file():
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

        page_path = repo_root / "newsinfo" / f"{article_id}.html"
        page_path.write_text(render_article_html(draft, previous_top), encoding="utf-8")
        touched.add(page_path)

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
        news_index_path = repo_root / "data" / "news-index.json"
        write_json(news_index_path, news_index)
        touched.add(news_index_path)

        news_html_path = repo_root / "news.html"
        news_html = render_news_index(
            news_html_path.read_text(encoding="utf-8"), articles
        )
        news_html_path.write_text(news_html, encoding="utf-8")
        touched.add(news_html_path)

        store_path = repo_root / "data" / "wechat-generated-translations.json"
        store = read_json(store_path)
        stored_articles = store.setdefault("articles", {})
        if not isinstance(stored_articles, dict):
            raise PipelineError("自动翻译数据格式异常")
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
            update_translation_js(
                translation_js.read_text(encoding="utf-8"),
                render_translation_block(store),
            ),
            encoding="utf-8",
        )
        touched.add(translation_js)

        manifest_path = repo_root / "DEPLOY_MANIFEST.json"
        update_deploy_manifest(repo_root, article_id, touched, len(articles))
        touched.add(manifest_path)

        patch_output = output_dir or (repo_root.parent / "releases")
        patch_output.mkdir(parents=True, exist_ok=True)
        archive = create_incremental_patch(
            repo_root, sorted(touched), article_id, patch_output
        )

    print(f"标题：{title}")
    print(f"日期：{publish_date}　编号：{article_id}")
    print(f"文章页面：{page_path}")
    print(f"本地预览：http://127.0.0.1:8765/newsinfo/{article_id}.html")
    print(f"增量部署包：{archive}")
    print("翻译：en/ja/da 暂留空，官网显示中文。补充翻译后可重新运行 site_news_pipeline.py publish。")
    if errors:
        print(f"注意：解析时发现 {len(errors)} 个需人工处理的问题：")
        for item in errors:
            print(f"  - {item}")
    return archive


def build_parser() -> argparse.ArgumentParser:
    default_root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(
        description="一键将公众号文章链接发布到本地官网（跳过审核和翻译）。"
    )
    parser.add_argument("url", help="mp.weixin.qq.com 文章链接")
    parser.add_argument("--repo-root", default=str(default_root))
    parser.add_argument("--date", help="指定发布日期 YYYY-MM-DD（无法从页面识别时必填）")
    parser.add_argument("--article-id", help="指定文章编号 YYYYMMDDNN")
    parser.add_argument("--output", help="增量部署包输出目录")
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        archive = publish_from_url(
            args.url,
            Path(args.repo_root).resolve(),
            date_override=args.date,
            article_id_override=args.article_id,
            output_dir=Path(args.output).resolve() if args.output else None,
        )
    except (ImportErrorWithCode, PipelineError) as exc:
        print(f"发布失败：{exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
