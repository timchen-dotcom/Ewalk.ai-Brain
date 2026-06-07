#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B23：Command Center 正式 Approval Queue 只讀驗收"
echo "安全邊界：只讀 production Firebase 的 approvals / audit_logs。"
echo "不寫 Firebase、不發文、不部署、不接正式客戶通道、不碰廣告預算、不碰金流。"
echo ""

echo "Step 1/2：讀取 production approvals / audit_logs，產生本機只讀 snapshot。"
"$NODE_BIN" scripts/read-approval-queue-firestore.mjs \
  --confirm-project ewalk-ai-system-prod \
  --confirm-scope B23_APPROVALS_AUDIT_LOGS_READONLY
echo ""

echo "Step 2/2：完成。"
echo "通過標準：overall_status: passed_command_center_production_readonly 且 external_side_effects_allowed: false。"
echo "本機畫面可開：$PWD/command-center-app/index.html"
