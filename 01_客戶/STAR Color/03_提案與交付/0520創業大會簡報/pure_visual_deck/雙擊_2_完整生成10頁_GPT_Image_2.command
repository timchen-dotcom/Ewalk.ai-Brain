#!/bin/zsh
set -u

cd "$(dirname "$0")" || exit 1

echo "This will generate all 10 GPT Image 2 backgrounds and package the deck."
echo "This uses OpenAI API credits."
echo "Press Enter to start, or close this window to cancel."
read _

./雙擊執行_GPT_Image_2_純視覺簡報.command --force
