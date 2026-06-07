#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B24：Command Center 主畫面只讀安全驗收"
echo "安全邊界：只檢查 Command Center 主畫面、production-readonly approval queue data 與 live adapter。"
echo "不寫 Firebase、不發文、不部署、不接正式客戶通道、不碰廣告預算、不碰金流。"
echo "若 B23 產生的本機 approval-queue.js 被 git pull 蓋回，會從 B23 snapshot 自動還原。"
echo ""

echo "Step 1/2：檢查主畫面欄位、資料模式與高風險入口隔離。"
"$NODE_BIN" scripts/review-command-center-approval-queue-app.mjs
echo ""

echo "Step 2/2：完成。"
echo "通過標準：overall_status: passed_command_center_app_readonly_review 且 external_side_effects_allowed: false。"
