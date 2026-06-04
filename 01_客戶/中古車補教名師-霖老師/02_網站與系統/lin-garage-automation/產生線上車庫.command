#!/bin/zsh
cd "$(dirname "$0")" || exit 1
node scripts/build.mjs
echo
echo "完成後可開啟 dist/index.html 檢查線上車庫。"
echo "按 Enter 關閉視窗。"
read
