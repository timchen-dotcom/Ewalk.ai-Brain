#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "用法：$0 <prompt-file> <reference-image> <output-file>" >&2
  exit 2
fi

PROMPT_FILE="$1"
REFERENCE_IMAGE="$2"
OUTPUT_FILE="$3"

WORKSPACE_ROOT="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
IMAGE_GEN="$CODEX_HOME/skills/.system/imagegen/scripts/image_gen.py"
PYTHON_BIN="$WORKSPACE_ROOT/.venv/bin/python"

if [[ ! -x "$PYTHON_BIN" ]]; then
  PYTHON_BIN="python3"
fi

ENV_CANDIDATES=(
  "$WORKSPACE_ROOT/.env.local"
  "$WORKSPACE_ROOT/Ewalk.ai Brain/08_自動化/現場語音阿順/realtime-demo/.env.local"
)

for ENV_FILE in "${ENV_CANDIDATES[@]}"; do
  if [[ -f "$ENV_FILE" ]] && grep -q '^OPENAI_API_KEY=' "$ENV_FILE"; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    break
  fi
done

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "找不到 OPENAI_API_KEY。請確認既有 .env.local 可供自動化讀取。" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"

"$PYTHON_BIN" "$IMAGE_GEN" edit \
  --model gpt-image-2 \
  --image "$REFERENCE_IMAGE" \
  --prompt-file "$PROMPT_FILE" \
  --size 1024x1536 \
  --quality high \
  --output-format png \
  --out "$OUTPUT_FILE" \
  --force
