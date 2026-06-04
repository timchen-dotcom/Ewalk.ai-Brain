#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OLLAMA_BIN="${ASHUN_OLLAMA_BIN:-$BASE_DIR/tools/Ollama.app/Contents/Resources/ollama}"
MODELS_DIR="${ASHUN_OLLAMA_MODELS_DIR:-$BASE_DIR/models}"
LOG_FILE="${ASHUN_OLLAMA_LOG_FILE:-$BASE_DIR/output/ollama.log}"

mkdir -p "$MODELS_DIR" "$BASE_DIR/output" "$HOME/.ollama"

if curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "Ollama is already running."
  exit 0
fi

OLLAMA_HOST=127.0.0.1:11434 \
OLLAMA_MODELS="$MODELS_DIR" \
OLLAMA_FLASH_ATTENTION=false \
OLLAMA_LLM_LIBRARY=cpu \
nohup "$OLLAMA_BIN" serve > "$LOG_FILE" 2>&1 &

echo "Ollama started. Log: $LOG_FILE"
