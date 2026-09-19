import importlib.util
import json
import subprocess
import tempfile
import unittest
import zipfile
from argparse import Namespace
from pathlib import Path
from unittest import mock


MODULE_PATH = Path(__file__).with_name("site_news_pipeline.py")
SPEC = importlib.util.spec_from_file_location("site_news_pipeline", MODULE_PATH)
assert SPEC and SPEC.loader
pipeline = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pipeline)


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")


class ArchiveSafetyTests(unittest.TestCase):
    def test_rejects_parent_path(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            archive = root / "bad.zip"
            with zipfile.ZipFile(archive, "w") as output:
                output.writestr("../secret.txt", "no")
            with self.assertRaises(pipeline.PipelineError):
                pipeline.safe_extract(archive, root / "out")


class ArticleParsingTests(unittest.TestCase):
    def test_preserves_text_and_image_order(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = root / "bundle"
            (bundle / "images").mkdir(parents=True)
            (bundle / "images" / "cover.jpg").write_bytes(b"image")
            (bundle / "content-local.html").write_text(
                '<section><h2>第一部分</h2><p>图片前<img src="images/cover.jpg" alt="配图">图片后</p></section>',
                encoding="utf-8",
            )
            nodes, errors = pipeline.parse_article_nodes(bundle, root / "draft" / "assets")

            self.assertEqual(errors, [])
            self.assertEqual(
                [node["type"] for node in nodes],
                ["heading", "paragraph", "image", "paragraph"],
            )
            self.assertEqual(nodes[0]["text"], "第一部分")
            self.assertEqual(nodes[1]["text"], "图片前")
            self.assertEqual(nodes[2]["path"], "assets/image-001.jpg")
            self.assertEqual(nodes[3]["text"], "图片后")

    def test_recognizes_nested_wechat_heading_styles(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = root / "bundle"
            bundle.mkdir(parents=True)
            (bundle / "content-local.html").write_text(
                '<p style="text-align: center;"><span style="font-size: 17px;color: rgb(255, 104, 39);">'
                '展会高光时刻｜实力收获全网瞩目</span></p>'
                '<p style="text-align: center;"><span style="font-size: 15px;">'
                '【海外客商密集洽谈】</span></p>'
                '<p style="text-align: center;"><span style="font-size: 17px;font-weight: bold;">'
                '我们是谁：深耕情绪健康领域的AI先锋</span></p>',
                encoding="utf-8",
            )

            nodes, errors = pipeline.parse_article_nodes(bundle, root / "draft" / "assets")

            self.assertEqual(errors, [])
            self.assertEqual([node["type"] for node in nodes], ["heading", "heading", "heading"])

    def test_flags_unsupported_media_and_omits_decorative_end(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = root / "bundle"
            bundle.mkdir(parents=True)
            (bundle / "content-local.html").write_text(
                '<p>正文</p><iframe src="https://example.com/video"></iframe>'
                '<mp-common-videosnap data-type="video"></mp-common-videosnap><p>END</p>',
                encoding="utf-8",
            )

            nodes, errors = pipeline.parse_article_nodes(bundle, root / "draft" / "assets")

            self.assertEqual([node["text"] for node in nodes], ["正文"])
            self.assertEqual(len(errors), 1)
            self.assertIn("2 处视频或音频", errors[0])

    def test_review_page_displays_parse_warning(self):
        rendered = pipeline.make_review_html(
            {
                "title": "待审核文章",
                "date": "2026-09-19",
                "nodes": [{"type": "paragraph", "text": "正文"}],
                "parse_errors": ["检测到视频，请人工处理"],
            }
        )

        self.assertIn("需人工处理", rendered)
        self.assertIn("检测到视频，请人工处理", rendered)


class PrepareWorkflowTests(unittest.TestCase):
    def test_skips_article_already_present_on_website(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = root / "repo"
            review = root / "review" / "bundle"
            output = root / "drafts"
            write_json(
                repo / "data" / "news-index.json",
                {
                    "articles": [
                        {
                            "id": "2026081201",
                            "title": "官网已有文章",
                        }
                    ]
                },
            )
            write_json(
                review / "article.json",
                {
                    "title": "官网已有文章",
                    "update_time": "2026-08-12T12:00:00+08:00",
                },
            )
            args = Namespace(
                repo_root=str(repo),
                review=str(root / "review"),
                output=str(output),
                bundle=None,
                article_id=None,
                date=None,
                allow_existing_title=False,
            )

            self.assertEqual(pipeline.prepare_command(args), 0)
            self.assertFalse(output.exists())


class TranslationValidationTests(unittest.TestCase):
    def setUp(self):
        self.draft = {
            "article_id": "2026091801",
            "nodes": [
                {"type": "heading", "text": "标题"},
                {"type": "image", "path": "assets/image-001.jpg"},
                {"type": "paragraph", "text": "正文"},
            ],
        }
        self.translations = {"article_id": "2026091801"}
        for language in pipeline.LANGUAGES:
            self.translations[language] = {
                "title": f"{language} title",
                "summary": f"{language} summary",
                "body": [f"{language} heading", "[[media:1]]", f"{language} body"],
            }

    def test_accepts_matching_multilingual_structure(self):
        pipeline.validate_translations(self.draft, self.translations)

    def test_rejects_moved_media_token(self):
        self.translations["ja"]["body"][1] = "画像"
        with self.assertRaisesRegex(pipeline.PipelineError, "必须保留"):
            pipeline.validate_translations(self.draft, self.translations)


class RenderingTests(unittest.TestCase):
    def test_replaces_only_marked_news_sections(self):
        source = """before
<!-- AUTO NEWS FEATURE START -->
old feature
<!-- AUTO NEWS FEATURE END -->
middle
<!-- AUTO NEWS SPOTLIGHT START -->
old spotlight
<!-- AUTO NEWS SPOTLIGHT END -->
middle two
<!-- AUTO NEWS LIST START -->
old list
<!-- AUTO NEWS LIST END -->
after"""
        articles = [
            {
                "id": f"20260918{number:02d}",
                "date": "2026-09-18",
                "title": f"文章 {number}",
                "summary": f"摘要 {number}",
                "thumb": f"media/news/thumbs/{number}.webp",
            }
            for number in range(1, 7)
        ]
        result = pipeline.render_news_index(source, articles)
        self.assertTrue(result.startswith("before"))
        self.assertTrue(result.endswith("after"))
        self.assertIn("2026091801.html", result)
        self.assertIn("2026091806.html", result)
        self.assertNotIn("old feature", result)


class PublishWorkflowTests(unittest.TestCase):
    def test_generates_site_files_and_syntax_valid_patch(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = root / "repo"
            draft_dir = root / "draft"
            release_dir = root / "releases"
            for path in (
                repo / "data",
                repo / "media" / "news" / "thumbs",
                repo / "newsinfo",
                draft_dir / "assets",
            ):
                path.mkdir(parents=True, exist_ok=True)

            previous_id = "2026090101"
            write_json(
                repo / "data" / "news-index.json",
                {
                    "schema_version": 1,
                    "articles": [
                        {
                            "id": f"202608{number:02d}01" if number else previous_id,
                            "date": "2026-09-01" if number == 0 else "2026-08-01",
                            "title": f"旧文章 {number}",
                            "summary": "旧摘要",
                            "thumb": f"media/news/thumbs/old-{number}.webp",
                        }
                        for number in range(5)
                    ],
                },
            )
            write_json(repo / "data" / "wechat-generated-translations.json", {"schema_version": 1, "articles": {}})
            write_json(
                repo / "DEPLOY_MANIFEST.json",
                {
                    "package": "test",
                    "news_article_count": 5,
                    "new_news_articles": [],
                    "checksums_sha256": {},
                },
            )
            (repo / "news.html").write_text(
                """<html><body>
<!-- AUTO NEWS FEATURE START -->
old
<!-- AUTO NEWS FEATURE END -->
<!-- AUTO NEWS SPOTLIGHT START -->
old
<!-- AUTO NEWS SPOTLIGHT END -->
<!-- AUTO NEWS LIST START -->
old
<!-- AUTO NEWS LIST END -->
</body></html>""",
                encoding="utf-8",
            )
            (repo / "media" / "news" / "news-translations.js").write_text(
                "window.NEWS_TEXT_EN = {}; window.NEWS_TEXT_JA = {}; window.NEWS_TEXT_DA = {};\n"
                "window.NEWS_ARTICLE_EN = {}; window.NEWS_ARTICLE_JA = {}; window.NEWS_ARTICLE_DA = {};\n",
                encoding="utf-8",
            )
            (repo / "newsinfo" / f"{previous_id}.html").write_text(
                '<nav class="article-nav" aria-label="文章切换"><span></span><a href="./old.html">下一篇</a></nav>',
                encoding="utf-8",
            )
            (draft_dir / "assets" / "image-001.jpg").write_bytes(b"image")
            draft = {
                "schema_version": 1,
                "article_id": "2026091801",
                "date": "2026-09-18",
                "title": "新文章",
                "summary": "新摘要",
                "parse_errors": [],
                "nodes": [
                    {"type": "heading", "text": "新标题"},
                    {"type": "image", "path": "assets/image-001.jpg", "alt": "配图"},
                    {"type": "paragraph", "text": "新正文"},
                ],
            }
            write_json(draft_dir / "draft.json", draft)
            translations = {"article_id": "2026091801"}
            for language in pipeline.LANGUAGES:
                translations[language] = {
                    "title": f"{language} title",
                    "summary": f"{language} summary",
                    "body": [f"{language} heading", "[[media:1]]", f"{language} body"],
                }
            translations_path = draft_dir / "translations.json"
            write_json(translations_path, translations)
            args = Namespace(
                repo_root=str(repo),
                draft=str(draft_dir),
                translations=str(translations_path),
                output=str(release_dir),
                allow_parse_errors=False,
            )

            def fake_thumbnail(_source, destination):
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(b"webp")

            with mock.patch.object(pipeline, "create_thumbnail", side_effect=fake_thumbnail):
                self.assertEqual(pipeline.publish_command(args), 0)

            self.assertTrue((repo / "newsinfo" / "2026091801.html").is_file())
            self.assertIn("2026091801.html", (repo / "news.html").read_text(encoding="utf-8"))
            self.assertIn("上一篇", (repo / "newsinfo" / f"{previous_id}.html").read_text(encoding="utf-8"))
            self.assertIn(
                "2026091801",
                (repo / "media" / "news" / "news-translations.js").read_text(encoding="utf-8"),
            )
            archive = next(release_dir.glob("*.zip"))
            unpacked = root / "unpacked"
            with zipfile.ZipFile(archive) as source:
                source.extractall(unpacked)
            patch_dir = next(unpacked.iterdir())
            for script in ("deploy.sh", "rollback.sh"):
                result = subprocess.run(
                    ["bash", "-n", str(patch_dir / script)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
            manifest = json.loads((patch_dir / "PATCH_MANIFEST.json").read_text(encoding="utf-8"))
            self.assertIn("newsinfo/2026091801.html", manifest["files"])
            self.assertNotIn("styles.css", manifest["files"])


if __name__ == "__main__":
    unittest.main()
