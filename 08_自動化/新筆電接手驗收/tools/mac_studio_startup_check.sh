#!/bin/zsh

set -u

timestamp="$(date +%Y%m%d-%H%M%S)"
report_dir="$HOME/Desktop/mac-studio-startup-check-$timestamp"
script_dir="$(cd "$(dirname "$0")" && pwd)"
brain_root="$(cd "$script_dir/../../.." && pwd)"
automation_root="$brain_root/08_自動化"
host_harness_root="$automation_root/host-harness"
command_center_root="$automation_root/firebase/command-center-app"

mkdir -p "$report_dir"

write_header() {
  local file="$1"
  local title="$2"
  {
    echo "# $title"
    echo
    echo "Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo "Host: $(scutil --get ComputerName 2>/dev/null || hostname)"
    echo "User: $(whoami)"
    echo "Brain root: $brain_root"
    echo
  } > "$file"
}

append_cmd() {
  local file="$1"
  shift
  {
    echo
    echo "## $*"
    echo
    "$@" 2>&1
  } >> "$file"
}

append_if_available() {
  local file="$1"
  local command_name="$2"
  shift 2
  if command -v "$command_name" >/dev/null 2>&1; then
    append_cmd "$file" "$command_name" "$@"
  else
    {
      echo
      echo "## $command_name $*"
      echo
      echo "NOT_FOUND: $command_name"
    } >> "$file"
  fi
}

system_file="$report_dir/00_system.txt"
write_header "$system_file" "Mac Studio Startup System Check"
append_cmd "$system_file" sw_vers
append_cmd "$system_file" uname -a
append_cmd "$system_file" df -h /
append_cmd "$system_file" df -h /System/Volumes/Data
append_cmd "$system_file" df -h /Volumes/提姆接案碟
append_cmd "$system_file" pmset -g custom

git_file="$report_dir/01_git_status.txt"
write_header "$git_file" "Ewalk.ai Brain Git Status"
if [ -d "$brain_root/.git" ]; then
  append_cmd "$git_file" git -C "$brain_root" status -sb
  append_cmd "$git_file" git -C "$brain_root" branch --show-current
  append_cmd "$git_file" git -C "$brain_root" log --oneline -8
  append_cmd "$git_file" git -C "$brain_root" remote -v
else
  echo "Missing Git repo: $brain_root/.git" >> "$git_file"
fi

toolchain_file="$report_dir/02_toolchain.txt"
write_header "$toolchain_file" "Toolchain Check"
append_if_available "$toolchain_file" git --version
append_if_available "$toolchain_file" node --version
append_if_available "$toolchain_file" npm --version
append_if_available "$toolchain_file" python3 --version
append_if_available "$toolchain_file" gh auth status
append_if_available "$toolchain_file" firebase --version
append_if_available "$toolchain_file" firebase login:list
append_if_available "$toolchain_file" firebase use
append_if_available "$toolchain_file" vercel --version
append_if_available "$toolchain_file" vercel whoami
append_if_available "$toolchain_file" ollama --version
append_if_available "$toolchain_file" ollama list
append_if_available "$toolchain_file" openclaw --version
append_if_available "$toolchain_file" openclaw status
append_if_available "$toolchain_file" openclaw channels list

host_file="$report_dir/03_host_harness.txt"
write_header "$host_file" "Host Harness Check"
{
  echo "## Paths"
  echo
  echo "Host Harness root: $host_harness_root"
  echo "Output dir: $host_harness_root/output"
  echo "Status dir: $host_harness_root/status"
  echo
} >> "$host_file"
if [ -d "$host_harness_root" ]; then
  append_cmd "$host_file" ls -la "$host_harness_root"
  append_cmd "$host_file" ls -la "$host_harness_root/output"
  append_cmd "$host_file" ls -la "$host_harness_root/status"
  if [ -f "$host_harness_root/output/host-status.latest.json" ]; then
    append_cmd "$host_file" head -80 "$host_harness_root/output/host-status.latest.json"
  fi
  if [ -f "$host_harness_root/output/harness-runs.json" ]; then
    append_cmd "$host_file" head -120 "$host_harness_root/output/harness-runs.json"
  fi
else
  echo "Missing Host Harness root." >> "$host_file"
fi

runtime_file="$report_dir/04_runtime_and_ports.txt"
write_header "$runtime_file" "Runtime and Ports Check"
{
  echo "## Matching LaunchAgents"
  echo
  launchctl list 2>&1 | egrep -i 'ashun|ewalk|openclaw|harness|ollama|codex|firebase|vercel' || true
  echo
  echo "## User LaunchAgents"
  echo
  ls -la "$HOME/Library/LaunchAgents" 2>&1
  echo
  echo "## Matching processes"
  echo
  ps -axo pid,ppid,comm | egrep -i 'node|python|firebase|vercel|ollama|openclaw|codex' | grep -v egrep || true
  echo
  echo "## Listening ports"
  echo
  lsof -nP -iTCP -sTCP:LISTEN 2>&1 | egrep -i 'node|python|firebase|vercel|ollama|openclaw|codex|18789|17990|11434' || true
} >> "$runtime_file"

command_center_file="$report_dir/05_command_center.txt"
write_header "$command_center_file" "Command Center Read-only Check"
{
  echo "## Paths"
  echo
  echo "Command Center root: $command_center_root"
  echo
  echo "## File presence"
  echo
  for file in index.html app.js styles.css firestore-live-adapter.js firebase-config.local.js data/snapshot.js data/client-registry.js data/approval-queue.js data/ai-runs.js data/host-status.js; do
    if [ -e "$command_center_root/$file" ]; then
      echo "OK: $file"
    else
      echo "MISSING: $file"
    fi
  done
} >> "$command_center_file"
if [ -f "$command_center_root/app.js" ]; then
  append_if_available "$command_center_file" node --check "$command_center_root/app.js"
fi
if [ -f "$command_center_root/firestore-live-adapter.js" ]; then
  {
    echo
    echo "## Firestore adapter write API search"
    echo
    egrep -n 'setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction' "$command_center_root/firestore-live-adapter.js" || true
  } >> "$command_center_file"
fi

ollama_file="$report_dir/06_ollama_openclaw_smoke.txt"
write_header "$ollama_file" "Ollama and OpenClaw Smoke Check"
{
  echo "## Ollama local API"
  echo
  curl -fsS http://127.0.0.1:11434/api/tags 2>&1 || true
} >> "$ollama_file"
append_if_available "$ollama_file" ollama list
append_if_available "$ollama_file" openclaw status
append_if_available "$ollama_file" openclaw channels list

summary_file="$report_dir/README.md"
{
  echo "# Mac Studio Startup Check"
  echo
  echo "Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo
  echo "## Files"
  echo
  echo "- 00_system.txt"
  echo "- 01_git_status.txt"
  echo "- 02_toolchain.txt"
  echo "- 03_host_harness.txt"
  echo "- 04_runtime_and_ports.txt"
  echo "- 05_command_center.txt"
  echo "- 06_ollama_openclaw_smoke.txt"
  echo
  echo "## Safety"
  echo
  echo "- This check is read-only except for writing this local report folder."
  echo "- It does not run git pull."
  echo "- It does not write Firestore."
  echo "- It does not deploy, publish, change ads, or touch payments."
  echo "- It records path and status output only; do not paste secret contents into Obsidian."
} > "$summary_file"

echo "Mac Studio startup check complete:"
echo "$report_dir"
