#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B17B-B22：內部 approvals / audit_logs 正式寫入與批次驗證"
echo "安全邊界：只允許 production Firebase 的 approvals / audit_logs。"
echo "仍不發文、不部署、不接正式客戶通道、不碰廣告預算、不碰金流。"
echo ""

echo "Step 0/5：確認 approval queue 來源不是空檔。"
"$NODE_BIN" scripts/ensure-approval-queue-app-data.mjs
echo ""

echo "Step 1/5：重新產生 B17A 正式 Firestore approvals 寫入預覽。"
"$NODE_BIN" scripts/prepare-approval-queue-firestore-preview.mjs
echo ""

echo "Step 2/5：執行 B18-B20 內部上工流程審查。"
"$NODE_BIN" scripts/review-internal-approval-workflow.mjs
echo ""

echo "Step 3/5：執行 B17B 內部 approvals / audit_logs 正式寫入。"
"$NODE_BIN" scripts/write-approval-queue-firestore.mjs \
  --confirm-project ewalk-ai-system-prod \
  --approved-by "提姆先生" \
  --confirm-scope B17B_APPROVALS_AUDIT_LOGS_ONLY \
  --write
echo ""

echo "Step 4/5：執行 B17B-B22 寫後批次審查。"
"$NODE_BIN" scripts/review-approval-queue-firestore-write.mjs
echo ""

echo "Step 5/5：完成。"
echo "通過標準：overall_status: passed_internal_production_write_review 且 external_side_effects_allowed: false。"
