#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$ROOT_DIR"

node "Ewalk.ai Brain/腳本/meta-facebook/publish-hansik-schedule-next.mjs" \
  --publish \
  --approved-by "提姆先生" \
  --confirm-page-id "1082884688247950"
