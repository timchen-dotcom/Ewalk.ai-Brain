#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
ROOT_DIR="${SCRIPT_DIR:h}"
OUTPUT_DIR="${ROOT_DIR}/output"
SOURCE_ROOT="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain"

mkdir -p "$OUTPUT_DIR"

ASHUN_BASE_DIR="$SOURCE_ROOT" \
ASHUN_CONFIG_PATH="${ROOT_DIR}/config.local.json" \
ASHUN_OUTPUT_DIR="$OUTPUT_DIR" \
/usr/bin/python3 "${SCRIPT_DIR}/google_review_tracker.py" \
  --send \
  >> "${OUTPUT_DIR}/google-review-tracker-launchd.log" \
  2>> "${OUTPUT_DIR}/google-review-tracker-launchd.err"
