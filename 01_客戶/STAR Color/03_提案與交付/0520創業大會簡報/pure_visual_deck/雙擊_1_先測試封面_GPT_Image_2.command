#!/bin/zsh
set -u

cd "$(dirname "$0")" || exit 1

echo "This will generate page 01 only as a GPT Image 2 smoke test."
echo "Press Enter to start, or close this window to cancel."
read _

./雙擊執行_GPT_Image_2_純視覺簡報.command --only 1 --force
