import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent))
import site_news_pipeline  # noqa: E402,F401
import fetch_article_url  # noqa: E402

MODULE_PATH = Path(__file__).with_name("quick_publish.py")
SPEC = importlib.util.spec_from_file_location("quick_publish", MODULE_PATH)
assert SPEC and SPEC.loader
quick_publish = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(quick_publish)


SAMPLE_HTML = (
    '<html><head><meta property="og:title" content="测试标题" />'
    '<meta property="og:description" content="测试摘要" /></head>'
    '<body><em id="publish_time">2026年09月01日 10:00</em>'
    '<div id="js_content"><p>正文第一段</p>'
    '<img data-src="https://mmbiz.qpic.cn/a.jpg" /></div></body></html>'
)


def fake_download(url, destination_without_suffix):
    destination = destination_without_suffix.with_suffix(".jpg")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(b"\xff\xd8\xff\xe0image")
    return destination, "sha1", 4


def _make_repo(root: Path) -> Path:
    """Create a minimal repo structure that publish_from_url expects."""
    repo = root / "repo"
    repo.mkdir()
    (repo / "data").mkdir()
    (repo / "media" / "news" / "thumbs").mkdir(parents=True)
    (repo / "newsinfo").mkdir()

    # news-index.json with 5 existing articles (render_news_index needs >=5)
    articles = [
        {
            "id": f"2026090{i:02d}",
            "date": f"2026-09-0{i}",
            "title": f"已有文章{i}",
            "summary": "",
            "thumb": f"media/news/thumbs/news-2026090{i:02d}.webp",
        }
        for i in range(1, 6)
    ]
    (repo / "data" / "news-index.json").write_text(
        json.dumps(
            {"schema_version": 1, "updated_at": "2026-09-05", "articles": articles},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    # news.html with auto markers
    (repo / "news.html").write_text(
        """<!doctype html><html><body>
<!-- AUTO NEWS FEATURE START -->
<!-- AUTO NEWS FEATURE END -->
<!-- AUTO NEWS SPOTLIGHT START -->
<!-- AUTO NEWS SPOTLIGHT END -->
<!-- AUTO NEWS LIST START -->
<!-- AUTO NEWS LIST END -->
</body></html>""",
        encoding="utf-8",
    )

    # previous article page (needs nav marker) — top article is 202609001
    (repo / "newsinfo" / "202609001.html").write_text(
        '<html><nav class="article-nav" aria-label="文章切换"><span></span></nav></html>',
        encoding="utf-8",
    )

    # translations store
    (repo / "data" / "wechat-generated-translations.json").write_text(
        json.dumps({"schema_version": 1, "articles": {}}, ensure_ascii=False),
        encoding="utf-8",
    )

    # translations js
    (repo / "media" / "news" / "news-translations.js").write_text(
        "// no translations\n", encoding="utf-8"
    )

    # DEPLOY_MANIFEST
    (repo / "DEPLOY_MANIFEST.json").write_text(
        json.dumps(
            {
                "schema_version": 1,
                "news_article_count": 1,
                "new_news_articles": [],
                "checksums_sha256": {},
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return repo


class QuickPublishTests(unittest.TestCase):
    def test_publishes_article_from_url(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = _make_repo(Path(directory))

            with mock.patch.object(
                quick_publish, "fetch_page", return_value=SAMPLE_HTML
            ), mock.patch.object(
                quick_publish, "create_thumbnail"
            ) as thumb_mock, mock.patch.object(
                fetch_article_url,
                "download_image",
                side_effect=fake_download,
            ):
                archive = quick_publish.publish_from_url(
                    "https://mp.weixin.qq.com/s/test", repo
                )

            self.assertTrue(archive.is_file())
            article_html = repo / "newsinfo" / "2026090101.html"
            self.assertTrue(article_html.is_file())
            content = article_html.read_text(encoding="utf-8")
            self.assertIn("测试标题", content)
            self.assertIn("正文第一段", content)

            # news-index updated
            news_index = json.loads(
                (repo / "data" / "news-index.json").read_text(encoding="utf-8")
            )
            self.assertEqual(news_index["articles"][0]["id"], "2026090101")
            self.assertEqual(news_index["articles"][0]["title"], "测试标题")

            # thumb created (mock verifies call)
            thumb_mock.assert_called_once()

    def test_rejects_duplicate_article_id(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = _make_repo(Path(directory))
            with mock.patch.object(
                quick_publish, "fetch_page", return_value=SAMPLE_HTML
            ), mock.patch.object(quick_publish, "create_thumbnail"), mock.patch.object(
                fetch_article_url, "download_image", side_effect=fake_download
            ):
                quick_publish.publish_from_url(
                    "https://mp.weixin.qq.com/s/test",
                    repo,
                    article_id_override="2099010101",
                )
                with self.assertRaises(quick_publish.PipelineError):
                    quick_publish.publish_from_url(
                        "https://mp.weixin.qq.com/s/test2",
                        repo,
                        article_id_override="2099010101",
                    )

    def test_date_override_used_for_id(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = _make_repo(Path(directory))
            with mock.patch.object(
                quick_publish, "fetch_page", return_value=SAMPLE_HTML
            ), mock.patch.object(quick_publish, "create_thumbnail"), mock.patch.object(
                fetch_article_url, "download_image", side_effect=fake_download
            ):
                quick_publish.publish_from_url(
                    "https://mp.weixin.qq.com/s/test",
                    repo,
                    date_override="2026-08-15",
                )
            news_index = json.loads(
                (repo / "data" / "news-index.json").read_text(encoding="utf-8")
            )
            self.assertEqual(news_index["articles"][0]["date"], "2026-08-15")
            self.assertTrue(news_index["articles"][0]["id"].startswith("20260815"))


if __name__ == "__main__":
    unittest.main()
