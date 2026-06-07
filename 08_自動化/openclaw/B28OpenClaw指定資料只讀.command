#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  NODE_BIN="node"
fi

echo "B28：OpenClaw 正式 Brain 指定資料夾 read-only"
echo "安全邊界：只讀 allowlist 指定資料夾；不讀接案碟、不讀 secrets、不寫正式資料、不產生外部副作用。"
echo ""

"$NODE_BIN" scripts/review-brain-scoped-readonly.mjs \
  --confirm-scope B28_BRAIN_SCOPED_READONLY_ONLY

echo ""
echo "通過標準：overall_status: passed_openclaw_brain_scoped_readonly 且 ready_for_controlled_work: true。"
