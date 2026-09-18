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
