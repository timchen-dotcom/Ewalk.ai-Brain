#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

echo "B16B：寫入 Approval Queue 到本機 Firebase Emulator"
echo "安全邊界：只寫本機 emulator，不寫 production Firebase。"
echo ""

if ! command -v java >/dev/null 2>&1; then
  echo "BLOCKED：找不到 Java Runtime，Firestore Emulator 無法啟動。"
  echo "請先在 Mac Studio 安裝 Java，再重跑本檔。"
  echo "建議：/opt/homebrew/bin/brew install openjdk"
  exit 20
fi

if [ ! -x "/opt/homebrew/bin/firebase" ]; then
  echo "BLOCKED：找不到 /opt/homebrew/bin/firebase。"
  echo "請先完成 Firebase CLI 工具鏈。"
  exit 21
fi

echo "Step 1/3：預檢 approvals queue，不寫入。"
node scripts/prepare-approval-queue-emulator-write.mjs --target emulator
echo ""

echo "Step 2/3：啟動 Firestore Emulator 並寫入 approvals。"
"/opt/homebrew/bin/firebase" emulators:exec \
  --only firestore \
  --project ewalk-ai-system-prod \
  'node scripts/prepare-approval-queue-emulator-write.mjs --target emulator --write --confirm-local-only B16_LOCAL_ONLY'
echo ""

echo "Step 3/3：B16B 完成。"
echo "結果判定：若上方顯示 wrote_to_emulator: 6 且 verified_from_emulator: 6，即通過。"
echo "production Firebase 未被寫入。"
