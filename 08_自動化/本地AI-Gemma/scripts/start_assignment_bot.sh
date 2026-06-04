#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$BASE_DIR/output/assignment-bot.log"

mkdir -p "$BASE_DIR/output"

if [[ "${ASHUN_SKIP_OLLAMA_START:-}" != "1" ]]; then
  "$SCRIPT_DIR/start_ollama.sh" >> "$LOG_FILE" 2>&1 || true
fi

exec /usr/bin/python3 "$SCRIPT_DIR/discord_assignment_inbox.py" --interval 30 >> "$LOG_FILE" 2>&1
