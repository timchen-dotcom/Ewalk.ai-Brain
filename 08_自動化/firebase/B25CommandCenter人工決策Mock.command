#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B25：Command Center approval item 人工決策流程 mock"
echo "安全邊界：只產生本機 mock decision packet 與 audit log preview。"
echo "不寫 Firebase、不改 approval status、不發文、不部署、不接正式客戶通道、不碰廣告預算、不碰金流。"
echo "若本機 approval queue data 是空的，會從 B23 production-readonly snapshot 自動還原。"
echo ""

echo "Step 1/2：產生單筆 approval 人工決策 mock。"
"$NODE_BIN" scripts/prepare-command-center-approval-decision-mock.mjs \
  --confirm-scope B25_MOCK_DECISION_ONLY \
  --mock-decision keep_pending \
  --decided-by "提姆先生" \
  --note "B25 僅驗證人工決策流程資料包；本輪不批准、不拒絕、不改 production 狀態。"
echo ""

echo "Step 2/2：完成。"
echo "通過標準：overall_status: passed_command_center_decision_mock 且 external_side_effects_allowed: false。"
