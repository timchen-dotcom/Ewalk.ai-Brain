#!/bin/zsh
set -euo pipefail

ROOT="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統"
NODE_BIN="/Applications/Codex.app/Contents/Resources/node"
RUNNER="$ROOT/Ewalk.ai Brain/腳本/google-ads/google-ads-api-runner.mjs"

cd "$ROOT"

if [[ $# -gt 0 ]]; then
  "$NODE_BIN" "$RUNNER" report-hansik "$1"
else
  "$NODE_BIN" "$RUNNER" report-hansik
fi
