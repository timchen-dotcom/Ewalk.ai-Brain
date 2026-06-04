#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT_DIR"

node "Ewalk.ai Brain/腳本/social-frequency-tracker/run-social-frequency-tracker.mjs" \
  --clients "Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/clients.example.json" \
  --sample-posts "Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/sample-posts.json" \
  --output-dir "Ewalk.ai Brain/04_報表/社群更新追蹤"
