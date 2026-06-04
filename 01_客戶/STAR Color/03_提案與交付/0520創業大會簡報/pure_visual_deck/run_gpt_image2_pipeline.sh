#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PY="/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
NODE="/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
NODE_MODULES="/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"
AI_PAGES=""
ARGS=("$@")
for ((i=0; i<${#ARGS[@]}; i++)); do
  if [[ "${ARGS[$i]}" == "--only" && $((i+1)) -lt ${#ARGS[@]} ]]; then
    AI_PAGES="${ARGS[$((i+1))]}"
  elif [[ "${ARGS[$i]}" == --only=* ]]; then
    AI_PAGES="${ARGS[$i]#--only=}"
  fi
done
VALIDATE_AI_ARGS=(--require-ai-backgrounds)
if [[ -n "$AI_PAGES" ]]; then
  VALIDATE_AI_ARGS+=(--ai-pages "$AI_PAGES")
fi

echo "Checking API key configuration..."
PYTHONUNBUFFERED=1 "$PY" generate_gpt_image2_backgrounds.py --check-auth
echo

if ! PYTHONUNBUFFERED=1 "$PY" generate_gpt_image2_backgrounds.py "$@"; then
  echo
  echo "GPT Image 2 background generation failed."
  echo "If the error says your organization must be verified, open:"
  echo "https://platform.openai.com/settings/organization/general"
  echo "Then click Verify Organization and wait up to 15 minutes before running again."
  exit 1
fi
echo
echo "Validating AI backgrounds..."
PYTHONUNBUFFERED=1 "$PY" validate_visual_deck_pipeline.py "${VALIDATE_AI_ARGS[@]}"
echo
echo "Rendering final slide PNGs..."
PYTHONUNBUFFERED=1 "$PY" generate_star_color_visual_images.py
echo
echo "Packaging PPTX..."
NODE_PATH="$NODE_MODULES" "$NODE" pack_star_color_visual_deck.js
echo
echo "Validating final PPTX..."
PYTHONUNBUFFERED=1 "$PY" validate_visual_deck_pipeline.py "${VALIDATE_AI_ARGS[@]}"

echo "Done: $(pwd)/STAR_Color_0520加盟簡報0511_10頁版_純視覺.pptx"
