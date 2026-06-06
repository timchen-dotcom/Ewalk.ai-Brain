#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B17-B20：內部 Approval Queue / Audit Log / Command Center 上工流程批次審查"
echo "安全邊界：只產生 preview / review，不寫 production Firebase，不發文、不部署、不接正式客戶通道、不碰廣告或金流。"
echo ""

echo "Step 1/2：產生 B17A 正式 Firestore approvals 寫入預覽。"
"$NODE_BIN" scripts/prepare-approval-queue-firestore-preview.mjs
echo ""

echo "Step 2/2：執行 B18-B20 內部上工流程審查。"
"$NODE_BIN" scripts/review-internal-approval-workflow.mjs
echo ""

echo "B17-B20 批次審查完成。"
echo "通過標準：overall_status: passed_internal_batch_review 且 production_write_allowed: false。"
