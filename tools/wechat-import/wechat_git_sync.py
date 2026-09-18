#!/usr/bin/env python3
"""Synchronize private WeChat review bundles to a dedicated private Git repo."""

import argparse
import hashlib
import json
import os
import shlex
import shutil
import stat
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Optional, Sequence


CHINA_TZ = timezone(timedelta(hours=8))
DEFAULT_REMOTE = "ssh://git@ssh.github.com:443/AnnISIS/superbobo-wechat-inbox.git"
DEFAULT_DATA_DIR = Path("/var/lib/superbobo-wechat")
DEFAULT_KEY = Path("/etc/superbobo-wechat-github/id_ed25519")
MAX_SYNC_FILE_BYTES = 90 * 1024 * 1024
ALLOWED_ROOT_FILES = {"article.json", "content-original.html", "content-local.html"}
BLOCKED_NAME_PARTS = ("secret", "token", "credential", "private", ".env", ".pem", ".key")


class SyncError(RuntimeError):
    pass


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_key(path: Path) -> None:
    if not path.is_file():
        raise SyncError(f"GitHub 专用密钥不存在：{path}")
    mode = stat.S_IMODE(path.stat().st_mode)
    if mode & 0o077:
        raise SyncError(f"GitHub 专用密钥权限必须为 600，当前为 {mode:o}")


def validate_sync_source(path: Path, bundle_root: Path) -> None:
    if path.is_symlink():
        raise SyncError(f"拒绝同步符号链接：{path}")
    relative = path.relative_to(bundle_root)
    if len(relative.parts) == 1:
        if relative.name not in ALLOWED_ROOT_FILES:
            raise SyncError(f"文章目录包含未授权文件：{relative}")
    elif relative.parts[0] != "images":
        raise SyncError(f"文章目录包含未授权路径：{relative}")
    lower_name = relative.name.lower()
    if any(part in lower_name for part in BLOCKED_NAME_PARTS):
        raise SyncError(f"文件名疑似包含敏感信息，拒绝同步：{relative}")
    if path.stat().st_size > MAX_SYNC_FILE_BYTES:
        raise SyncError(f"文件超过 GitHub 单文件安全限制：{relative}")


def copy_if_changed(source: Path, destination: Path) -> bool:
    if destination.is_file() and source.stat().st_size == destination.stat().st_size:
        if sha256(source) == sha256(destination):
            return False
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(str(source), str(destination))
    return True


def copy_review_inbox(source_root: Path, repository: Path) -> Dict[str, object]:
    inbox = source_root / "inbox"
    if not inbox.is_dir():
        raise SyncError(f"审核目录不存在：{inbox}")
    target_inbox = repository / "inbox"
    changed_files: List[str] = []
    bundle_names: List[str] = []
    for bundle in sorted(path for path in inbox.iterdir() if path.is_dir()):
        if bundle.is_symlink():
            raise SyncError(f"拒绝同步符号链接目录：{bundle}")
        article_json = bundle / "article.json"
        if not article_json.is_file():
            continue
        bundle_names.append(bundle.name)
        for source in sorted(path for path in bundle.rglob("*") if path.is_file()):
            validate_sync_source(source, bundle)
            destination = target_inbox / bundle.name / source.relative_to(bundle)
            if copy_if_changed(source, destination):
                changed_files.append(destination.relative_to(repository).as_posix())

    summary = source_root / "fetch-summary.json"
    if summary.is_file():
        destination = repository / "fetch-summary.json"
        if copy_if_changed(summary, destination):
            changed_files.append("fetch-summary.json")

    manifest = {
        "schema_version": 1,
        "synced_at": datetime.now(CHINA_TZ).isoformat(),
        "bundle_count": len(bundle_names),
        "bundles": bundle_names,
    }
    manifest_path = repository / "sync-manifest.json"
    previous: Optional[Dict[str, object]] = None
    if manifest_path.is_file():
        try:
            previous = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            previous = None
    comparable = dict(manifest)
    comparable.pop("synced_at", None)
    previous_comparable = dict(previous or {})
    previous_comparable.pop("synced_at", None)
    if comparable != previous_comparable or changed_files:
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        changed_files.append("sync-manifest.json")
    return {"bundles": bundle_names, "changed_files": sorted(set(changed_files))}


def run_git(
    args: Sequence[str],
    repository: Path,
    environment: Dict[str, str],
    check: bool = True,
) -> subprocess.CompletedProcess:
    result = subprocess.run(
        ["git"] + list(args),
        cwd=str(repository),
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    if check and result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        raise SyncError(f"Git 命令失败：git {' '.join(args)}：{detail}")
    return result


def ensure_repository(
    repository: Path,
    remote: str,
    environment: Dict[str, str],
) -> None:
    if (repository / ".git").is_dir():
        current = run_git(["remote", "get-url", "origin"], repository, environment).stdout.strip()
        if current != remote:
            raise SyncError(f"现有仓库远端不匹配：{current}")
        run_git(["pull", "--ff-only", "origin", "main"], repository, environment)
        return

    if repository.exists() and any(repository.iterdir()):
        raise SyncError(f"Git 同步目录不是空目录：{repository}")
    repository.parent.mkdir(parents=True, exist_ok=True)
    clone = subprocess.run(
        ["git", "clone", "--branch", "main", "--single-branch", remote, str(repository)],
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    if clone.returncode != 0:
        raise SyncError(f"无法克隆私有 inbox 仓库：{clone.stderr.strip()}")
    run_git(["config", "user.name", "SuperBobo WeChat Importer"], repository, environment)
    run_git(["config", "user.email", "automation@superbobo.com"], repository, environment)


def sync(args: argparse.Namespace) -> int:
    os.umask(0o077)
    source_root = Path(args.data_dir).resolve()
    repository = Path(args.repository).resolve()
    key = Path(args.key).resolve()
    known_hosts = source_root / "github-known-hosts"
    validate_key(key)
    environment = os.environ.copy()
    environment["GIT_SSH_COMMAND"] = " ".join(
        [
            "ssh",
            "-i",
            shlex.quote(str(key)),
            "-o",
            "IdentitiesOnly=yes",
            "-o",
            "StrictHostKeyChecking=accept-new",
            "-o",
            "UserKnownHostsFile=" + shlex.quote(str(known_hosts)),
        ]
    )
    ensure_repository(repository, args.remote, environment)
    result = copy_review_inbox(source_root, repository)
    run_git(["add", "README.md", "inbox", "fetch-summary.json", "sync-manifest.json"], repository, environment)
    status = run_git(["status", "--porcelain"], repository, environment).stdout.strip()
    if not status:
        run_git(["push", "origin", "HEAD:main"], repository, environment)
        print("GitHub inbox 没有新内容，无需推送。")
        return 0
    timestamp = datetime.now(CHINA_TZ).strftime("%Y-%m-%d %H:%M CST")
    run_git(["commit", "-m", f"Sync WeChat review inbox {timestamp}"], repository, environment)
    run_git(["push", "origin", "HEAD:main"], repository, environment)
    print(
        "GitHub inbox 同步成功：{} 个文章目录，{} 个文件发生变化。".format(
            len(result["bundles"]), len(result["changed_files"])
        )
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="将公众号私有审核目录同步到专用私有 GitHub 仓库")
    parser.add_argument("--data-dir", default=str(DEFAULT_DATA_DIR))
    parser.add_argument("--repository", default=str(DEFAULT_DATA_DIR / "git-inbox"))
    parser.add_argument("--key", default=str(DEFAULT_KEY))
    parser.add_argument("--remote", default=DEFAULT_REMOTE)
    return parser


def main() -> int:
    try:
        return sync(build_parser().parse_args())
    except SyncError as exc:
        print(f"GitHub inbox 同步失败：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
