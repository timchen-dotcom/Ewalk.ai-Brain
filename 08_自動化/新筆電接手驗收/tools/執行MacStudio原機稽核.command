#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUDIT_SCRIPT="$SCRIPT_DIR/mac_studio_pre_reset_audit.sh"

echo "Mac Studio pre-reset audit"
echo "Script: $AUDIT_SCRIPT"
echo

if [[ ! -x "$AUDIT_SCRIPT" ]]; then
  echo "ERROR: audit script is not executable:"
  echo "$AUDIT_SCRIPT"
  echo
  echo "Try running:"
  echo "chmod +x \"$AUDIT_SCRIPT\""
  exit 1
fi

"$AUDIT_SCRIPT"

echo
echo "Audit finished. Check the report folder on Desktop:"
echo "$HOME/Desktop/mac-studio-pre-reset-audit-*"
