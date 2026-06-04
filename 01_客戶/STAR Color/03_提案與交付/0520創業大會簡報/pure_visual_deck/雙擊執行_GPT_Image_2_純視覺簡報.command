#!/bin/zsh
set -u

cd "$(dirname "$0")" || exit 1

LOG="gpt_image2_pipeline_$(date +%Y%m%d_%H%M%S).log"

exec > >(tee "$LOG") 2>&1

echo "=== GPT Image 2 pure visual deck pipeline ==="
echo "Started: $(date)"
echo "Folder: $(pwd)"
echo "Log: $(pwd)/$LOG"
echo

echo "Step 1/3: Generate GPT Image 2 backgrounds"
echo "If this step fails with 403, finish OpenAI organization verification first."
echo

/bin/bash ./run_gpt_image2_pipeline.sh "$@"
STATUS=$?

echo
echo "Pipeline exit code: $STATUS"
echo "Finished: $(date)"
echo "Output:"
echo "$(pwd)/STAR_Color_0520加盟簡報0511_10頁版_純視覺.pptx"

echo
echo "Log saved to: $(pwd)/$LOG"
echo "Press Enter to close this window."
read _
