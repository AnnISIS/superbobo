import importlib.util
import json
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path
from unittest import mock


MODULE_PATH = Path(__file__).with_name("wechat_fetch.py")
SPEC = importlib.util.spec_from_file_location("wechat_fetch", MODULE_PATH)
assert SPEC and SPEC.loader
wechat_fetch = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(wechat_fetch)


class HtmlLocalizationTests(unittest.TestCase):
    def test_collects_allowed_wechat_images_only(self):
        parser = wechat_fetch.ImageCollector()
        parser.feed(
            '<p><img data-src="//mmbiz.qpic.cn/a.jpg"></p>'
            '<img src="https://example.com/not-allowed.jpg">'
        )
        self.assertEqual(parser.urls, ["https://mmbiz.qpic.cn/a.jpg"])

    def test_rewrites_lazy_image_to_local_src(self):
        parser = wechat_fetch.HtmlImageRewriter(
            {"https://mmbiz.qpic.cn/a.jpg": "images/image-001.jpg"}
        )
        parser.feed('<img data-src="https://mmbiz.qpic.cn/a.jpg" alt="测试">')
        result = "".join(parser.output)
        self.assertIn('src="images/image-001.jpg"', result)
        self.assertNotIn("data-src", result)
        self.assertIn('alt="测试"', result)

    def test_rejects_non_https_image(self):
        self.assertIsNone(wechat_fetch.normalize_image_url("http://mmbiz.qpic.cn/a.jpg"))


class EnvironmentTests(unittest.TestCase):
    def test_reads_private_env_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "wechat.env"
            path.write_text(
                "WECHAT_APP_ID=wx-test\nWECHAT_APP_SECRET=secret-test\n",
                encoding="utf-8",
            )
            path.chmod(0o600)
            result = wechat_fetch.read_env(path)
            self.assertEqual(result["WECHAT_APP_ID"], "wx-test")

    def test_rejects_world_readable_env_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "wechat.env"
            path.write_text(
                "WECHAT_APP_ID=wx-test\nWECHAT_APP_SECRET=secret-test\n",
                encoding="utf-8",
            )
            path.chmod(0o644)
            with self.assertRaises(wechat_fetch.ImportErrorWithCode):
                wechat_fetch.read_env(path)


class FetchWorkflowTests(unittest.TestCase):
    def test_creates_private_review_bundle_and_state(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            env_file = root / "wechat.env"
            env_file.write_text(
                "WECHAT_APP_ID=wx-test\nWECHAT_APP_SECRET=secret-test\n",
                encoding="utf-8",
            )
            env_file.chmod(0o600)
            args = Namespace(
                env_file=str(env_file),
                data_dir=str(root / "data"),
                max_groups=20,
                force=False,
                no_images=True,
            )
            groups = [{"article_id": "article-1", "update_time": 1789680000}]
            detail = {
                "news_item": [
                    {
                        "title": "测试文章",
                        "content": "<p>正文</p>",
                        "url": "https://mp.weixin.qq.com/s/example",
                    }
                ]
            }
            with mock.patch.object(wechat_fetch, "get_access_token", return_value="token"), mock.patch.object(
                wechat_fetch, "list_published_groups", return_value=(1, groups)
            ), mock.patch.object(wechat_fetch, "list_material_news", return_value=(0, [])), mock.patch.object(
                wechat_fetch, "get_published_group", return_value=detail
            ):
                result = wechat_fetch.fetch(args)

            self.assertEqual(result, 0)
            state = json.loads((root / "data" / "state.json").read_text(encoding="utf-8"))
            self.assertIn("article-1", state["articles"])
            bundles = list((root / "data" / "inbox").glob("article-1-*"))
            self.assertEqual(len(bundles), 1)
            self.assertTrue((bundles[0] / "article.json").is_file())
            self.assertEqual(len(list((root / "data" / "exports").glob("*.zip"))), 1)

    def test_material_api_captures_mass_broadcast_articles(self):
        """Material API returns all permanent news including 群发 articles
        that freepublish/batchget intentionally hides."""
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            env_file = root / "wechat.env"
            env_file.write_text(
                "WECHAT_APP_ID=wx-test\nWECHAT_APP_SECRET=secret-test\n",
                encoding="utf-8",
            )
            env_file.chmod(0o600)
            args = Namespace(
                env_file=str(env_file),
                data_dir=str(root / "data"),
                max_groups=20,
                force=False,
                no_images=True,
            )
            # freepublish returns NOTHING — this simulates the real bug
            # where all articles were mass-broadcast and invisible to freepublish.
            freepublish_groups = []
            # material API returns 2 groups with no article_id (only media_id)
            material_groups = [
                {
                    "media_id": "media-new-1",
                    "update_time": 1789680000,
                    "content": {
                        "news_item": [
                            {
                                "title": "群发文章A",
                                "content": "<p>群发正文 A</p>",
                                "url": "https://mp.weixin.qq.com/s/a",
                            }
                        ]
                    },
                },
                {
                    "media_id": "media-new-2",
                    "update_time": 1789593600,
                    "content": {
                        "news_item": [
                            {
                                "title": "群发文章B",
                                "content": "<p>群发正文 B</p>",
                                "url": "https://mp.weixin.qq.com/s/b",
                            }
                        ]
                    },
                },
            ]
            with mock.patch.object(wechat_fetch, "get_access_token", return_value="token"), mock.patch.object(
                wechat_fetch, "list_published_groups", return_value=(0, freepublish_groups)
            ), mock.patch.object(
                wechat_fetch, "list_material_news", return_value=(2, material_groups)
            ):
                result = wechat_fetch.fetch(args)

            self.assertEqual(result, 0)
            state = json.loads((root / "data" / "state.json").read_text(encoding="utf-8"))
            self.assertIn("media-new-1", state["articles"])
            self.assertIn("media-new-2", state["articles"])
            self.assertEqual(state["articles"]["media-new-1"]["source"], "material")
            summary = json.loads((root / "data" / "fetch-summary.json").read_text(encoding="utf-8"))
            self.assertEqual(summary["total_freepublish_groups"], 0)
            self.assertEqual(summary["total_material_groups"], 2)
            self.assertEqual(summary["imported_items"], 2)
            # No getarticle call — material items carry content inline
            bundles = sorted((root / "data" / "inbox").iterdir())
            self.assertEqual(len(bundles), 2)

    def test_merge_deduplicates_by_normalized_title(self):
        """Same article appears in both freepublish and material —
        should be deduped by normalized whitespace-stripped title."""
        material_group = {
            "media_id": "media-shared",
            "update_time": 1789680000,
            "content": {
                "news_item": [{"title": "  同一篇   文章  ", "content": "<p>正文</p>"}]
            },
        }
        freepublish_group = {
            "article_id": "article-shared",
            "update_time": 1789680000,
            "content": {
                "news_item": [{"title": "同一篇 文章", "content": "<p>正文</p>"}]
            },
        }
        merged = wechat_fetch.merge_article_groups([freepublish_group], [material_group])
        # Material takes precedence (primary source), so only 1 group and
        # it carries the material group's media_id + _source="material"
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged[0]["_source"], "material")
        self.assertEqual(merged[0]["media_id"], "media-shared")

    def test_merge_combines_different_sources(self):
        """Articles unique to each source should all appear."""
        freepublish_group = {
            "article_id": "article-fp",
            "update_time": 1789680000,
            "content": {
                "news_item": [{"title": "只在 freepublish 的文章", "content": "<p>正文</p>"}]
            },
        }
        material_group = {
            "media_id": "media-mat",
            "update_time": 1789680100,
            "content": {
                "news_item": [{"title": "只在 material 的群发文章", "content": "<p>正文</p>"}]
            },
        }
        merged = wechat_fetch.merge_article_groups([freepublish_group], [material_group])
        self.assertEqual(len(merged), 2)
        # Newer material group first
        self.assertEqual(merged[0]["_source"], "material")
        self.assertEqual(merged[0]["media_id"], "media-mat")
        self.assertEqual(merged[1]["_source"], "freepublish")
        self.assertEqual(merged[1]["article_id"], "article-fp")


if __name__ == "__main__":
    unittest.main()
