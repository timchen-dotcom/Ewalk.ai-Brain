#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHECK_SCRIPT="$SCRIPT_DIR/mac_studio_startup_check.sh"

echo "Mac Studio startup check"
echo "Script: $CHECK_SCRIPT"
echo

if [[ ! -x "$CHECK_SCRIPT" ]]; then
  echo "ERROR: startup check script is not executable:"
  echo "$CHECK_SCRIPT"
  echo
  echo "Try running:"
  echo "chmod +x \"$CHECK_SCRIPT\""
  exit 1
fi

"$CHECK_SCRIPT"

echo
echo "Startup check finished. Check the report folder on Desktop:"
echo "$HOME/Desktop/mac-studio-startup-check-*"
