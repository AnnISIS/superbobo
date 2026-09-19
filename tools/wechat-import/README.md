# 微信公众号文章抓取工具

这个工具通过微信公众号官方 API，将已发布文章、正文和正文图片抓取到服务器私有目录。它不会直接修改官网，也不会自动公开发布内容。

## 默认目录

- 密钥：`/etc/superbobo-wechat.env`
- 私有数据：`/var/lib/superbobo-wechat`
- 待审核文章：`/var/lib/superbobo-wechat/inbox`
- 审核压缩包：`/var/lib/superbobo-wechat/exports`
- 去重状态：`/var/lib/superbobo-wechat/state.json`

## 手动运行

```bash
python3 /opt/superbobo-wechat/wechat_fetch.py
```

第一次运行会抓取最新 20 组已发布内容。以后再次运行时，会按照 `article_id` 跳过已经成功抓取的文章。

如需重新抓取已有文章：

```bash
python3 /opt/superbobo-wechat/wechat_fetch.py --force
```

程序不会输出 AppSecret 或 access token。所有生成文件默认仅 root 可读。

## 自动抓取

安装包同时提供 systemd 服务和定时器。第一次手动验证成功后，再启用定时器：

```bash
systemctl start superbobo-wechat-fetch.service
journalctl -u superbobo-wechat-fetch.service -n 80 --no-pager
systemctl enable --now superbobo-wechat-fetch.timer
```

定时器每两小时检查一次最新内容，并在 0–15 分钟内随机错峰。已抓取的 `article_id` 会自动跳过；没有新文章时不会生成空审核包。定时任务只写私有审核目录，不会修改或发布官网。

每次抓取结束后，`wechat_git_sync.py` 会把审核正文和图片同步到专用私有仓库 `AnnISIS/superbobo-wechat-inbox`。同步白名单只允许文章 JSON、两份正文 HTML 和 `images/`，不会读取或提交 AppSecret、access token、环境文件、证书或私钥。GitHub 同步失败会使本次服务显示失败并由下一次定时运行重试，但不会破坏已抓取的本地审核文件。

## 从私有 GitHub 审核仓生成官网草稿

服务器抓取后会自动推送到私有仓库，无需再登录服务器或手动下载 ZIP。在本地官网仓库执行：

```bash
python3 tools/wechat-import/pull_inbox.py --prepare
```

这条命令使用已登录的 GitHub CLI 读取 `AnnISIS/superbobo-wechat-inbox`，并在 `work/wechat-inbox/时间/` 下生成当次快照和待审核草稿。已在官网的同标题资讯会自动跳过。

程序会生成：

- 中文待审核页 `review.html`
- 标准化草稿 `draft.json`
- 四语翻译模板 `translations.template.json`

如果审核包中含有已经上线的资讯，程序会按照标题自动跳过，避免重复发布。只有明确需要重做同名文章时，才使用 `--allow-existing-title`。

如果正文包含视频、音频或无法解析的图片，预览页会标红提醒，发布命令会默认拒绝执行，防止内容被静默遗漏。

英语、日语、丹麦语由 Codex 按中文节点顺序生成到 `translations.json`，图片占位符必须保持原位。人工审核中文预览与三种译文后，先校验：

```bash
python3 tools/wechat-import/site_news_pipeline.py validate work/wechat-drafts/文章编号 translations.json
```

最后生成官网文件和增量部署包：

```bash
python3 tools/wechat-import/site_news_pipeline.py publish work/wechat-drafts/文章编号 translations.json
```

流水线不会直接连接生产服务器。部署包必须在预览确认后手动上传和执行。

## 完整链路

1. 公众号发布文章。
2. 阿里云服务器每两小时抓取，去重后推送到私有 GitHub inbox。
3. 本地执行 `pull_inbox.py --prepare`，自动跳过官网已有资讯。
4. Codex 根据草稿生成英语、日语、丹麦语并提供本地预览。
5. 人工确认后执行 `publish`，只生成本次资讯的增量部署包。
6. 更新提交到官网 Git，并将增量包上传服务器执行。
