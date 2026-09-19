#!/usr/bin/env python3
"""Download the private WeChat inbox and optionally prepare review drafts."""

import argparse
import os
import shutil
import subprocess
import sys
import tarfile
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional, Sequence


DEFAULT_REPOSITORY = "AnnISIS/superbobo-wechat-inbox"


class InboxError(RuntimeError):
    pass


def safe_extract_tar(archive: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=False)
    destination_root = destination.resolve()
    with tarfile.open(str(archive), "r:gz") as source:
        members = source.getmembers()
        roots = {
            Path(member.name).parts[0]
            for member in members
            if Path(member.name).parts
        }
        if len(roots) != 1:
            raise InboxError("私有仓库压缩包顶层目录异常")
        top_level = next(iter(roots))
        for member in members:
            path = Path(member.name)
            if not path.parts or path.parts[0] != top_level:
                raise InboxError(f"压缩包路径异常：{member.name}")
            relative = Path(*path.parts[1:])
            if not relative.parts:
                continue
            if relative.is_absolute() or ".." in relative.parts:
                raise InboxError(f"压缩包包含不安全路径：{member.name}")
            if member.issym() or member.islnk() or member.isdev():
                raise InboxError(f"压缩包包含不允许的链接或设备：{member.name}")
            target = (destination / relative).resolve()
            if destination_root not in target.parents:
                raise InboxError(f"压缩包包含不安全路径：{member.name}")
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
                os.chmod(target, 0o700)
                continue
            if not member.isfile():
                raise InboxError(f"压缩包包含不支持的文件：{member.name}")
            target.parent.mkdir(parents=True, exist_ok=True)
            extracted = source.extractfile(member)
            if extracted is None:
                raise InboxError(f"无法读取压缩包文件：{member.name}")
            with extracted, target.open("wb") as output:
                shutil.copyfileobj(extracted, output)
            os.chmod(target, 0o600)


def download_repository(repository: str, branch: str, destination: Path) -> None:
    if not shutil.which("gh"):
        raise InboxError("未找到 GitHub CLI（gh），请先安装并登录 GitHub")
    with tempfile.TemporaryDirectory(prefix="superbobo-wechat-inbox-") as directory:
        archive = Path(directory) / "inbox.tar.gz"
        with archive.open("wb") as output:
            result = subprocess.run(
                ["gh", "api", "--method", "GET", f"repos/{repository}/tarball/{branch}"],
                stdout=output,
                stderr=subprocess.PIPE,
            )
        if result.returncode != 0:
            detail = result.stderr.decode("utf-8", errors="replace").strip()
            raise InboxError(f"无法下载私有审核仓：{detail}")
        safe_extract_tar(archive, destination)


def prepare_drafts(repo_root: Path, snapshot: Path, output: Path) -> None:
    pipeline = repo_root / "tools" / "wechat-import" / "site_news_pipeline.py"
    result = subprocess.run(
        [
            sys.executable,
            str(pipeline),
            "--repo-root",
            str(repo_root),
            "prepare",
            str(snapshot),
            "--output",
            str(output),
        ]
    )
    if result.returncode != 0:
        raise InboxError("生成待审核草稿失败")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="拉取微信公众号私有审核仓")
    parser.add_argument("--repository", default=DEFAULT_REPOSITORY, help="GitHub 私有审核仓")
    parser.add_argument("--branch", default="main", help="审核仓分支")
    parser.add_argument("--output", help="快照输出目录；默认按时间创建")
    parser.add_argument("--prepare", action="store_true", help="拉取后立即生成待审核草稿")
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    repo_root = Path(__file__).resolve().parents[2]
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    run_root = Path(args.output).resolve() if args.output else repo_root / "work" / "wechat-inbox" / timestamp
    if run_root.exists():
        raise InboxError(f"输出目录已存在：{run_root}")
    snapshot = run_root / "snapshot"
    drafts = run_root / "drafts"
    download_repository(args.repository, args.branch, snapshot)
    if not (snapshot / "inbox").is_dir():
        raise InboxError("私有审核仓缺少 inbox 目录")
    print(f"私有审核仓已拉取：{snapshot}")
    if args.prepare:
        prepare_drafts(repo_root, snapshot, drafts)
        if drafts.exists():
            print(f"待审核草稿：{drafts}")
        else:
            print("没有新文章需要生成草稿。")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except InboxError as exc:
        print(f"处理失败：{exc}", file=sys.stderr)
        raise SystemExit(1)
