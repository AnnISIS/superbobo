import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("wechat_git_sync.py")
SPEC = importlib.util.spec_from_file_location("wechat_git_sync", MODULE_PATH)
assert SPEC and SPEC.loader
syncer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(syncer)


class InboxCopyTests(unittest.TestCase):
    def test_copies_only_review_bundle_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            data = root / "data"
            repository = root / "repository"
            bundle = data / "inbox" / "article-01"
            (bundle / "images").mkdir(parents=True)
            repository.mkdir()
            (bundle / "article.json").write_text('{"title":"测试"}', encoding="utf-8")
            (bundle / "content-original.html").write_text("<p>原文</p>", encoding="utf-8")
            (bundle / "content-local.html").write_text("<p>本地正文</p>", encoding="utf-8")
            (bundle / "images" / "image-001.jpg").write_bytes(b"image")
            (data / "fetch-summary.json").write_text('{"imported_items":1}', encoding="utf-8")

            result = syncer.copy_review_inbox(data, repository)

            self.assertEqual(result["bundles"], ["article-01"])
            self.assertTrue((repository / "inbox" / "article-01" / "article.json").is_file())
            self.assertTrue((repository / "inbox" / "article-01" / "images" / "image-001.jpg").is_file())
            manifest = json.loads((repository / "sync-manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["bundle_count"], 1)

    def test_rejects_unapproved_or_sensitive_file(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            data = root / "data"
            repository = root / "repository"
            bundle = data / "inbox" / "article-01"
            bundle.mkdir(parents=True)
            repository.mkdir()
            (bundle / "article.json").write_text("{}", encoding="utf-8")
            (bundle / "access-token.txt").write_text("do-not-sync", encoding="utf-8")

            with self.assertRaises(syncer.SyncError):
                syncer.copy_review_inbox(data, repository)

    def test_second_copy_is_idempotent(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            data = root / "data"
            repository = root / "repository"
            bundle = data / "inbox" / "article-01"
            bundle.mkdir(parents=True)
            repository.mkdir()
            (bundle / "article.json").write_text("{}", encoding="utf-8")

            first = syncer.copy_review_inbox(data, repository)
            second = syncer.copy_review_inbox(data, repository)

            self.assertGreater(len(first["changed_files"]), 0)
            self.assertEqual(second["changed_files"], [])


if __name__ == "__main__":
    unittest.main()
