#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B27：OpenClaw 限定草稿區寫入"
echo "安全邊界：只寫 00_收件匣/OpenClaw草稿、14_每日工作/OpenClaw草稿回填、08_自動化/openclaw/action-queue。"
echo "不發文、不部署、不寫 production Firebase、不接正式客戶通道、不碰廣告預算、不碰金流。"
echo ""

"$NODE_BIN" scripts/prepare-controlled-draft-write.mjs \
  --confirm-scope B27_CONTROLLED_DRAFT_WRITE_ONLY

echo ""
echo "通過標準：overall_status: passed_openclaw_controlled_draft_write 且 external_side_effects_allowed: false。"
