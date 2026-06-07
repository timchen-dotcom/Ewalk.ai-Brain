#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

WORKSPACE_PATH="${OPENCLAW_WORKSPACE:-$HOME/OpenClaw Test Workspace}"
BRAIN_PATH="${EWALK_BRAIN_PATH:-$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain}"

echo "B30：把 B26-B29 寫入 OpenClaw Test Workspace 的 authoritative AGENTS.md"
echo "workspace: $WORKSPACE_PATH"
echo "brain: $BRAIN_PATH"
echo "會先備份 AGENTS.md，再插入或更新 Ewalk.ai controlled work rules。"
echo ""

"$NODE_BIN" scripts/install-authoritative-rules.mjs \
  --confirm-scope B30_INSTALL_AUTHORITATIVE_RULES \
  --workspace "$WORKSPACE_PATH" \
  --brain "$BRAIN_PATH"

echo ""
echo "通過標準：overall_status: passed_openclaw_authoritative_rules_installed。"
echo "下一步：Telegram 傳 /new，重新喚起 OpenClaw session。"
