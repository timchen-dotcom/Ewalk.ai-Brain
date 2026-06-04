#!/bin/zsh
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "補齊 GPT Image 2 整頁烘字缺頁，並在 10 頁齊全後打包 PPTX。"
echo "這個程序會跳過已存在的 fullslide_images/page_XX.png。"
echo

./run_gpt_image2_fullslide_pipeline.sh

echo
echo "完成後請檢查："
echo "$DIR/STAR_Color_0520加盟簡報0511_10頁版_GPT_Image_2_整頁烘字.pptx"
read "?按 Enter 關閉視窗..."
