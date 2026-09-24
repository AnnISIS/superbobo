import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock


MODULE_PATH = Path(__file__).with_name("fetch_article_url.py")
SPEC = importlib.util.spec_from_file_location("fetch_article_url", MODULE_PATH)
assert SPEC and SPEC.loader
fetch_article_url = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(fetch_article_url)


SAMPLE_PAGE = """<!doctype html>
<html><head>
<meta property="og:title" content="测试文章：链接导入" />
<meta property="og:description" content="这是测试摘要" />
<meta property="og:image" content="https://mmbiz.qpic.cn/cover.jpg?wx_fmt=jpeg" />
<meta property="og:article:author" content="有爱智能" />
</head><body>
<h1 class="rich_media_title" id="activity-name">测试文章：链接导入</h1>
<em id="publish_time" class="rich_media_meta rich_media_meta_text">2026年09月21日 14:00</em>
<div class="rich_media_content" id="js_content" style="visibility: hidden;">
  <section><p>第一段正文 <img data-src="https://mmbiz.qpic.cn/a.jpg?wx_fmt=jpeg" /></p>
    <div class="outer"><div class="inner">嵌套文字</div><img data-src="//mmbiz.qpic.cn/b.png" /></div>
  </section>
  <script>var x = 1;</script>
</div>
<script>var ct = "1789663200";</script>
</body></html>"""


class PageExtractionTests(unittest.TestCase):
    def test_extracts_title_author_and_digest(self):
        self.assertEqual(fetch_article_url.extract_title(SAMPLE_PAGE), "测试文章：链接导入")
        self.assertEqual(fetch_article_url.extract_author(SAMPLE_PAGE), "有爱智能")
        self.assertEqual(
            fetch_article_url._meta_content(SAMPLE_PAGE, "og:description"), "这是测试摘要"
        )

    def test_extracts_publish_time_from_chinese_em(self):
        self.assertEqual(
            fetch_article_url.extract_publish_time(SAMPLE_PAGE),
            "2026-09-21T14:00:00+08:00",
        )

    def test_publish_time_falls_back_to_unix_var(self):
        page = '<html><script>var ct = "1789663200";</script><body></body></html>'
        self.assertEqual(
            fetch_article_url.extract_publish_time(page),
            fetch_article_url.parse_timestamp(1789663200),
        )

    def test_publish_time_returns_none_when_unknown(self):
        self.assertIsNone(fetch_article_url.extract_publish_time("<html></html>"))

    def test_extracts_content_and_images_only_inside_js_content(self):
        extractor = fetch_article_url.PageContentExtractor()
        extractor.feed(SAMPLE_PAGE)
        content = "".join(extractor.pieces)
        self.assertIn("第一段正文", content)
        self.assertIn("嵌套文字", content)
        self.assertNotIn('id="js_content"', content)
        self.assertIn("</div>", content)
        self.assertEqual(
            extractor.image_urls,
            [
                "https://mmbiz.qpic.cn/a.jpg?wx_fmt=jpeg",
                "https://mmbiz.qpic.cn/b.png",
            ],
        )

    def test_nested_div_depth_is_balanced(self):
        page = (
            '<div id="js_content"><div><div>深</div></div>浅</div><div>外面</div>'
        )
        extractor = fetch_article_url.PageContentExtractor()
        extractor.feed(page)
        content = "".join(extractor.pieces)
        self.assertIn("深", content)
        self.assertIn("浅", content)
        self.assertNotIn("外面", content)
        self.assertEqual(content.count("</div>"), 2)


class BundleTests(unittest.TestCase):
    def run_build(self, output_root, url="https://mp.weixin.qq.com/s/test123"):
        def fake_download(url, destination_without_suffix):
            destination = destination_without_suffix.with_suffix(".jpg")
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(b"data-" + url.encode("utf-8"))
            return destination, "sha-" + url, len(url)

        with mock.patch.object(
            fetch_article_url, "download_image", side_effect=fake_download
        ):
            return fetch_article_url.build_bundle(url, SAMPLE_PAGE, output_root)

    def test_builds_review_bundle_matching_localize_format(self):
        with tempfile.TemporaryDirectory() as directory:
            output_root = Path(directory) / "inbox"
            bundle_dir, metadata = self.run_build(output_root)

            self.assertTrue((bundle_dir / "article.json").is_file())
            self.assertTrue((bundle_dir / "content-original.html").is_file())
            article = json.loads(
                (bundle_dir / "article.json").read_text(encoding="utf-8")
            )
            self.assertEqual(article["schema_version"], 1)
            self.assertEqual(article["item_index"], 0)
            self.assertEqual(article["title"], "测试文章：链接导入")
            self.assertEqual(article["author"], "有爱智能")
            self.assertEqual(article["digest"], "这是测试摘要")
            self.assertEqual(article["article_url"], "https://mp.weixin.qq.com/s/test123")
            self.assertEqual(article["update_time"], "2026-09-21T14:00:00+08:00")
            self.assertEqual(
                article["thumb_url"], "https://mmbiz.qpic.cn/cover.jpg?wx_fmt=jpeg"
            )
            self.assertTrue(article["ready_for_review"])
            self.assertEqual(article["errors"], [])
            # cover + 2 content images, all downloaded
            self.assertEqual(len(article["images"]), 3)
            self.assertEqual(article["images"][0]["local_path"], "images/image-001.jpg")

            local = (bundle_dir / "content-local.html").read_text(encoding="utf-8")
            self.assertIn('src="images/image-002.jpg"', local)
            self.assertIn('src="images/image-003.jpg"', local)
            self.assertNotIn("data-src", local)
            self.assertNotIn("mmbiz.qpic.cn", local)
            self.assertIn("第一段正文", local)

    def test_second_run_creates_versioned_bundle(self):
        with tempfile.TemporaryDirectory() as directory:
            output_root = Path(directory) / "inbox"
            first, _ = self.run_build(output_root)
            second, second_metadata = self.run_build(output_root)
            self.assertNotEqual(first, second)
            self.assertIn("url-", second_metadata["bundle_name"])
            self.assertEqual(
                len(list(output_root.glob("*/article.json"))), 2
            )

    def test_missing_content_raises_clear_error(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(fetch_article_url.ImportErrorWithCode):
                fetch_article_url.build_bundle(
                    "https://mp.weixin.qq.com/s/x",
                    "<html><body>无正文</body></html>",
                    Path(directory),
                )

    def test_risk_control_page_raises_clear_error(self):
        with tempfile.TemporaryDirectory() as directory:
            page = "<html><body>当前环境异常，完成验证后即可继续访问。</body></html>"
            with self.assertRaises(fetch_article_url.ImportErrorWithCode) as ctx:
                fetch_article_url.build_bundle(
                    "https://mp.weixin.qq.com/s/x", page, Path(directory)
                )
            self.assertIn("风控", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
