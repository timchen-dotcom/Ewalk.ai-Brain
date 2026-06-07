#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B26：Command Center 決策結果寫入本機 audit trail / action queue dry-run"
echo "安全邊界：只產生本機 JSON，不寫 production Firebase、不改 approval status。"
echo "不發文、不部署、不接正式客戶通道、不碰廣告預算、不碰金流。"
echo ""

echo "Step 1/2：根據 B25 mock decision 產生本機 dry-run audit trail 與 action queue。"
"$NODE_BIN" scripts/build-command-center-decision-dry-run.mjs \
  --confirm-scope B26_LOCAL_DECISION_DRY_RUN_ONLY
echo ""

echo "Step 2/2：完成。"
echo "通過標準：overall_status: passed_command_center_decision_dry_run 且 external_side_effects_allowed: false。"
