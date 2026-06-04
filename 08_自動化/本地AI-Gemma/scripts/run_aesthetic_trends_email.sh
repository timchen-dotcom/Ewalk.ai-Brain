#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
ROOT_DIR="${SCRIPT_DIR:h}"
OUTPUT_DIR="${ROOT_DIR}/output/aesthetic-trends-email"
SOURCE_ROOT="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain"
PROJECT_ROOT="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統"
SECRETS_ENV="${PROJECT_ROOT}/.codex-local/aesthetic-trends-email.env"

mkdir -p "$OUTPUT_DIR"

if [ -f "$SECRETS_ENV" ]; then
  set -a
  source "$SECRETS_ENV"
  set +a
fi

ASHUN_BASE_DIR="$SOURCE_ROOT" \
ASHUN_CONFIG_PATH="${ROOT_DIR}/config.local.json" \
ASHUN_OUTPUT_DIR="$OUTPUT_DIR" \
/usr/bin/python3 "${SCRIPT_DIR}/aesthetic_trends_email.py" \
  --mode latest \
  --send \
  >> "${OUTPUT_DIR}/launchd.log" \
  2>> "${OUTPUT_DIR}/launchd.err"
