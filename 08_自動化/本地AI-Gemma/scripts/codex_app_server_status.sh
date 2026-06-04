#!/usr/bin/env bash
set -euo pipefail

PORT="${CODEX_APP_SERVER_PORT:-8787}"
LISTEN_URL="ws://127.0.0.1:${PORT}"
PIDFILE="/private/tmp/ewalk_codex_app_server.pid"
LOGFILE="/private/tmp/ewalk_codex_app_server.log"

if [[ ! -f "$PIDFILE" ]]; then
  echo "Codex app-server: not running (no pidfile). Expected: $LISTEN_URL"
  exit 0
fi

PID="$(cat "$PIDFILE" 2>/dev/null || true)"
if [[ -n "${PID:-}" ]] && kill -0 "$PID" 2>/dev/null; then
  echo "Codex app-server: running (pid=$PID) at $LISTEN_URL"
  echo "Logs: $LOGFILE"
  exit 0
fi

echo "Codex app-server: stale pidfile (pid=$PID). Remove it if needed: rm -f $PIDFILE"
if [[ -f "$LOGFILE" ]]; then
  echo "--- last log lines ---"
  tail -n 5 "$LOGFILE" || true
fi
