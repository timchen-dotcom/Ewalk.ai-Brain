#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

FIREBASE_DIR="../firebase"

echo "B26-B28：OpenClaw 受控上工三關總執行"
echo "目標：追蹤可用、草稿可寫、指定資料可讀。"
echo "仍不批准：發文、部署、production Firebase 改狀態、正式客戶通道、廣告預算、金流。"
echo ""

echo "Step 1/3：B26 Command Center 決策 dry-run。"
zsh "$FIREBASE_DIR/B26CommandCenter決策DryRun寫入.command"
echo ""

echo "Step 2/3：B27 OpenClaw 限定草稿寫入。"
zsh "./B27OpenClaw限定草稿寫入.command"
echo ""

echo "Step 3/3：B28 OpenClaw 指定資料 read-only。"
zsh "./B28OpenClaw指定資料只讀.command"
echo ""

echo "B26-B28 完成。若三關都 passed，OpenClaw 可進入受控上工模式。"
