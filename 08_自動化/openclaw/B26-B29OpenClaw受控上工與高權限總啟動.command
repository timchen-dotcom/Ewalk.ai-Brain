#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

echo "B26-B29：OpenClaw 受控上工 + 高權限總閘門"
echo "目標：追蹤可用、草稿可寫、指定資料可讀、高權限能力可送審與批准後執行。"
echo "注意：B29 不是無批准全自動執行；沒有單一 action 批准時仍只能 preview。"
echo ""

zsh "./B26-B28OpenClaw受控上工啟動.command"
echo ""

echo "Step 4/4：B29 高權限總閘門。"
zsh "./B29OpenClaw高權限總閘門.command"
echo ""

echo "B26-B29 完成。若 B29 passed，停止擴驗證，開始高權限受控上工。"
