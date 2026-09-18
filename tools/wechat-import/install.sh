#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR=/opt/superbobo-wechat
DATA_DIR=/var/lib/superbobo-wechat
ENV_FILE=/etc/superbobo-wechat.env
SERVICE_NAME=superbobo-wechat-fetch.service
TIMER_NAME=superbobo-wechat-fetch.timer

if [[ "${EUID}" -ne 0 ]]; then
  echo "请使用 root 用户安装。" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "找不到密钥文件：${ENV_FILE}" >&2
  exit 1
fi

ENV_MODE="$(stat -c '%a' "${ENV_FILE}")"
if [[ "${ENV_MODE}" != 600 ]]; then
  echo "密钥文件权限应为 600，当前为 ${ENV_MODE}。" >&2
  exit 1
fi

for required in wechat_fetch.py README.md "${SERVICE_NAME}" "${TIMER_NAME}" SHA256SUMS; do
  [[ -f "${SCRIPT_DIR}/${required}" ]] || {
    echo "安装包缺少文件：${required}" >&2
    exit 1
  }
done

echo "[1/4] 校验安装包"
(cd "${SCRIPT_DIR}" && sha256sum -c SHA256SUMS)

echo "[2/4] 安装私有抓取工具"
install -d -m 0700 "${INSTALL_DIR}" "${DATA_DIR}" "${DATA_DIR}/inbox" "${DATA_DIR}/exports"
install -m 0700 "${SCRIPT_DIR}/wechat_fetch.py" "${INSTALL_DIR}/wechat_fetch.py"
install -m 0600 "${SCRIPT_DIR}/README.md" "${INSTALL_DIR}/README.md"
install -m 0644 "${SCRIPT_DIR}/${SERVICE_NAME}" "/etc/systemd/system/${SERVICE_NAME}"
install -m 0644 "${SCRIPT_DIR}/${TIMER_NAME}" "/etc/systemd/system/${TIMER_NAME}"

echo "[3/4] 检查 Python 和 systemd 配置"
/usr/bin/python3 "${INSTALL_DIR}/wechat_fetch.py" --help >/dev/null
systemd-analyze verify "/etc/systemd/system/${SERVICE_NAME}" "/etc/systemd/system/${TIMER_NAME}"
systemctl daemon-reload

echo "[4/4] 完成安装"
echo
echo "安装完成。工具只抓取到私有审核区，不会自动修改或发布官网。"
echo "首次抓取：systemctl start ${SERVICE_NAME}"
echo "查看结果：journalctl -u ${SERVICE_NAME} -n 80 --no-pager"
echo "确认首次抓取无误后启用定时器：systemctl enable --now ${TIMER_NAME}"
echo "抓取资料目录：${DATA_DIR}"
