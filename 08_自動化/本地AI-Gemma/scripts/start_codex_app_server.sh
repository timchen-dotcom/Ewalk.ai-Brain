#!/usr/bin/env bash
set -euo pipefail

PORT="${CODEX_APP_SERVER_PORT:-8787}"
LISTEN_URL="ws://127.0.0.1:${PORT}"
PIDFILE="/private/tmp/ewalk_codex_app_server.pid"
LOGFILE="/private/tmp/ewalk_codex_app_server.log"
RUNTIME_HOME="/private/tmp/ewalk_codex_home"

if [[ -f "$PIDFILE" ]]; then
  PID="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "${PID:-}" ]] && kill -0 "$PID" 2>/dev/null; then
    echo "Codex app-server already running (pid=$PID) at $LISTEN_URL"
    exit 0
  fi
fi

echo "Starting Codex app-server at $LISTEN_URL"
mkdir -p "$RUNTIME_HOME"
HOME="$RUNTIME_HOME" nohup codex app-server --listen "$LISTEN_URL" >"$LOGFILE" 2>&1 &
echo "$!" >"$PIDFILE"

echo "Started (pid=$(cat "$PIDFILE")). Logs: $LOGFILE"
echo "Runtime HOME: $RUNTIME_HOME"
echo "Connect from another terminal:"
echo "  codex --remote $LISTEN_URL"
