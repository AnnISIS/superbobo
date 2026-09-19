import importlib.util
import io
import tarfile
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("pull_inbox.py")
SPEC = importlib.util.spec_from_file_location("pull_inbox", MODULE_PATH)
assert SPEC and SPEC.loader
pull = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pull)


def make_archive(path, members):
    with tarfile.open(str(path), "w:gz") as output:
        for name, value, kind in members:
            info = tarfile.TarInfo(name)
            if kind == "file":
                data = value.encode("utf-8")
                info.size = len(data)
                output.addfile(info, io.BytesIO(data))
            elif kind == "symlink":
                info.type = tarfile.SYMTYPE
                info.linkname = value
                output.addfile(info)


class SafeTarTests(unittest.TestCase):
    def test_extracts_files_after_stripping_repository_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            archive = root / "inbox.tar.gz"
            make_archive(archive, [("repo-abc/inbox/article/article.json", "{}", "file")])

            pull.safe_extract_tar(archive, root / "output")

            self.assertEqual(
                (root / "output" / "inbox" / "article" / "article.json").read_text(), "{}"
            )

    def test_rejects_symbolic_links(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            archive = root / "inbox.tar.gz"
            make_archive(archive, [("repo-abc/inbox/link", "../../secret", "symlink")])

            with self.assertRaises(pull.InboxError):
                pull.safe_extract_tar(archive, root / "output")


if __name__ == "__main__":
    unittest.main()
