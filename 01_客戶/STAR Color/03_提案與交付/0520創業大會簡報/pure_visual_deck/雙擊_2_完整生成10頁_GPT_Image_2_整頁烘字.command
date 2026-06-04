#!/bin/zsh
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "開始生成 10 頁 GPT Image 2 整頁烘字簡報。"
echo "提醒：這個模式會讓 AI 直接生成中文字，完成後一定要檢查錯字與數字。"
echo "已存在的 page_XX.png 會自動跳過，只補缺頁。"
echo

./run_gpt_image2_fullslide_pipeline.sh

echo
echo "輸出 PPTX："
echo "$DIR/STAR_Color_0520加盟簡報0511_10頁版_GPT_Image_2_整頁烘字.pptx"
read "?按 Enter 關閉視窗..."
