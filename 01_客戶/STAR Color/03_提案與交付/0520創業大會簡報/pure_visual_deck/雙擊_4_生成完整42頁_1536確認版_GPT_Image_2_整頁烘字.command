#!/bin/zsh
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "開始生成 STAR Color 0511 完整46頁 GPT Image 2 整頁烘字確認版。"
echo "規格：1536x1024 high。"
echo "來源：STAR_Color_0520加盟簡報0511.md。"
echo "品牌：STAR Color 品牌包 v1.5，遵守 0512 Keynote 風格、機器廠商出場、廣告投手專家段落、許文元理事長政策經費段落、門店設計資產與無字頁首 / 頁尾。"
echo "已存在的 page_XX.png 會自動跳過，只補缺頁。"
echo

./run_gpt_image2_fullslide_pipeline.sh

echo
echo "輸出 PPTX："
echo "$DIR/STAR_Color_0520加盟簡報0511_GPT_Image_2_整頁烘字_完整確認版_1536.pptx"
read "?按 Enter 關閉視窗..."
