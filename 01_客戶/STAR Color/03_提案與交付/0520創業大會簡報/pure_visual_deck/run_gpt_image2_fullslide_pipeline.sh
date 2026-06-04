#!/bin/zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

NODE_BIN="/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
NODE_MODULES="/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"
if [[ ! -x "$NODE_BIN" ]]; then
  NODE_BIN="node"
fi
if [[ -d "$NODE_MODULES" ]]; then
  export NODE_PATH="$NODE_MODULES"
fi

LOG="$ROOT/gpt_image2_fullslide_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG") 2>&1

echo "== GPT Image 2 full-slide baked deck pipeline =="
echo "Working folder: $ROOT"
echo "Log: $LOG"
echo "Mode: 1536x1024 high full-deck confirmation, 46 pages with machine vendor, ad expert, and chairman policy sections"
echo

python3 build_fullslide_prompt_spec_from_0511.py
python3 generate_gpt_image2_fullslides.py --check-auth

echo
echo "Generating missing pages. Existing page_XX.png files will be skipped unless --force is passed."
python3 generate_gpt_image2_fullslides.py --sleep 1 "$@"

echo
echo "Validating full-slide images..."
python3 validate_fullslide_deck_pipeline.py --require-images

echo
echo "Packing PPTX..."
"$NODE_BIN" pack_fullslide_deck.js

echo
echo "Validating PPTX..."
python3 validate_fullslide_deck_pipeline.py --require-images --require-pptx

echo
echo "Done:"
echo "$ROOT/STAR_Color_0520加盟簡報0511_GPT_Image_2_整頁烘字_完整確認版_1536.pptx"
echo "Log:"
echo "$LOG"
