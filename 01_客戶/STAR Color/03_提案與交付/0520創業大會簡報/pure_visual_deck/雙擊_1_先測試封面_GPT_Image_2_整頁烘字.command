#!/bin/zsh
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "先生成第 1 頁整頁烘字測試圖。"
echo "完成後請檢查中文字、品牌字、版面與是否有多餘英文。"
echo

python3 generate_gpt_image2_fullslides.py --only 1 --force
python3 validate_fullslide_deck_pipeline.py --require-images --pages 1

echo
echo "測試圖位置："
echo "$DIR/fullslide_images/page_01.png"
echo
echo "若文字正確，再執行：雙擊_2_完整生成10頁_GPT_Image_2_整頁烘字.command"
read "?按 Enter 關閉視窗..."
