#!/bin/zsh
set -euo pipefail

ROOT="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統"
NODE_BIN="/Applications/Codex.app/Contents/Resources/node"
RUNNER="$ROOT/Ewalk.ai Brain/腳本/google-ads/google-ads-api-runner.mjs"
LOG_DIR="$ROOT/Ewalk.ai Brain/01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d_%H%M%S)_GoogleAds_啟用投放.log"

cd "$ROOT"

{
  echo "== 韓食日常鍋物 Google Ads 啟用投放 =="
  date
  echo
  echo "安全範圍：只啟用三組已建立 Campaign，不更改預算、文案、關鍵字。"
  echo "目標 Campaign："
  echo "- HIH_202606_Search_Brand_Map"
  echo "- HIH_202606_Search_Local_KoreanHotpot"
  echo "- HIH_202606_Search_Delivery"
  echo

  "$NODE_BIN" "$RUNNER" enable-hansik

  echo
  echo "完成。請回 Google Ads 後台確認三組 Campaign 狀態為 ENABLED。"
} 2>&1 | tee "$LOG_FILE"

echo
echo "Log 已儲存：$LOG_FILE"
