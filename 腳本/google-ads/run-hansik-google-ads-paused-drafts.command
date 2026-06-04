#!/bin/zsh
set -euo pipefail

ROOT="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統"
NODE_BIN="/Applications/Codex.app/Contents/Resources/node"
RUNNER="$ROOT/Ewalk.ai Brain/腳本/google-ads/google-ads-api-runner.mjs"
PREVIEW="$ROOT/Ewalk.ai Brain/01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動/2026-06-03_GoogleAds_API_mutate_operations_preview.json"
LOG_DIR="$ROOT/Ewalk.ai Brain/01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d_%H%M%S)_GoogleAds_API續跑.log"

cd "$ROOT"

{
  echo "== 韓食日常鍋物 Google Ads PAUSED 草稿續跑 =="
  date
  echo

  echo "== 1. 檢查本機憑證 =="
  "$NODE_BIN" "$RUNNER" check
  echo

  echo "== 2. 檢查 Google Ads API 帳戶連線 =="
  "$NODE_BIN" "$RUNNER" check-access
  echo

  echo "== 3. 自動解析臺南市與繁體中文常數 =="
  "$NODE_BIN" "$RUNNER" resolve-constants
  echo

  echo "== 4. validateOnly 檢查 PAUSED 草稿 =="
  "$NODE_BIN" "$RUNNER" validate-preview "$PREVIEW"
  echo

  echo "以上都成功後，才會建立 Google Ads 後台 PAUSED 草稿。"
  echo "安全確認：本流程只允許 PAUSED，程式會阻擋 ENABLED / ACTIVE。"
  echo
  printf "請輸入 CREATE_PAUSED 確認建立 PAUSED 草稿："
  read confirm
  if [[ "$confirm" != "CREATE_PAUSED" ]]; then
    echo "未建立草稿：確認字不符。"
    exit 0
  fi

  echo
  echo "== 5. 建立 PAUSED 草稿 =="
  "$NODE_BIN" "$RUNNER" create-paused "$PREVIEW"
  echo
  echo "完成。請回 Google Ads 後台確認草稿狀態仍為 PAUSED。"
} 2>&1 | tee "$LOG_FILE"

echo
echo "Log 已儲存：$LOG_FILE"
