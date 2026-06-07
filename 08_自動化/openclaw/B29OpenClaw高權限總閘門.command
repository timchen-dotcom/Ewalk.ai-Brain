#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B29：OpenClaw 高權限總閘門"
echo "一次開啟：發文、部署、production Firebase 改狀態、正式客戶通道、廣告預算、金流。"
echo "開啟方式：enabled_with_explicit_approval。沒有提姆先生單一 action 批准時，只能 preview / approval item。"
echo ""

"$NODE_BIN" scripts/prepare-external-ops-gate.mjs \
  --confirm-scope B29_EXTERNAL_OPS_APPROVAL_GATE_ONLY

echo ""
echo "通過標準：overall_status: passed_openclaw_external_ops_gate 且 requires_explicit_approval_per_action: true。"
