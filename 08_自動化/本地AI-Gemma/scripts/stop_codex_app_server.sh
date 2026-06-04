#!/usr/bin/env bash
set -euo pipefail

PIDFILE="/private/tmp/ewalk_codex_app_server.pid"

if [[ ! -f "$PIDFILE" ]]; then
  echo "No pidfile found: $PIDFILE"
  exit 0
fi

PID="$(cat "$PIDFILE" 2>/dev/null || true)"
if [[ -z "${PID:-}" ]]; then
  rm -f "$PIDFILE"
  echo "Empty pidfile removed: $PIDFILE"
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  echo "Stopping Codex app-server (pid=$PID)"
  kill "$PID"
else
  echo "Process not running (pid=$PID); removing pidfile"
fi

rm -f "$PIDFILE"

