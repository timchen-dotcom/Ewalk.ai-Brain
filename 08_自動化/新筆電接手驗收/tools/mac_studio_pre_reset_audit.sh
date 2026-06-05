#!/bin/zsh

set -u

timestamp="$(date +%Y%m%d-%H%M%S)"
report_dir="$HOME/Desktop/mac-studio-pre-reset-audit-$timestamp"
ewalk_root="$HOME/Desktop/Ewalk.ai 自動化系統"
brain_root="$ewalk_root/Ewalk.ai Brain"

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

system_file="$report_dir/00_system.txt"
write_header "$system_file" "Mac Studio Pre-reset System Check"
append_cmd "$system_file" sw_vers
append_cmd "$system_file" uname -a
append_cmd "$system_file" df -h "$HOME"

folders_file="$report_dir/01_folder_sizes.txt"
write_header "$folders_file" "Folder Size Check"
for target in "$ewalk_root" "$brain_root" "$HOME/Desktop" "$HOME/Documents" "$HOME/Downloads"; do
  if [ -e "$target" ]; then
    append_cmd "$folders_file" du -sh "$target"
  else
    {
      echo
      echo "Missing: $target"
    } >> "$folders_file"
  fi
done

git_file="$report_dir/02_git_status.txt"
write_header "$git_file" "Ewalk.ai Brain Git Check"
if [ -d "$brain_root/.git" ]; then
  append_cmd "$git_file" git -C "$brain_root" status -sb
  append_cmd "$git_file" git -C "$brain_root" log --oneline -10
  append_cmd "$git_file" git -C "$brain_root" remote -v
else
  echo "Missing Git repo: $brain_root/.git" >> "$git_file"
fi

automation_file="$report_dir/03_automation_and_schedules.txt"
write_header "$automation_file" "Automation and Schedule Check"
{
  echo "## Codex automation path candidates"
  echo
  find "$HOME/.codex" -maxdepth 5 \( -iname '*automation*' -o -name 'automation.toml' \) -print 2>/dev/null
  echo
  echo "## LaunchAgents and LaunchDaemons"
  echo
  ls -la "$HOME/Library/LaunchAgents" 2>&1
  ls -la "/Library/LaunchAgents" 2>&1
  ls -la "/Library/LaunchDaemons" 2>&1
  echo
  echo "## crontab"
  echo
  crontab -l 2>&1
  echo
  echo "## pmset schedule"
  echo
  pmset -g sched 2>&1
  echo
  echo "## Matching process names only"
  echo
  ps -axo pid,ppid,comm | egrep 'node|python|firebase|vercel|ollama|openclaw|codex|discord' | grep -v egrep
} >> "$automation_file"

sensitive_file="$report_dir/04_sensitive_path_candidates.txt"
write_header "$sensitive_file" "Sensitive Path Candidate Check"
{
  echo "This file lists path candidates only. Do not paste secret contents into Vault."
  echo
  find "$HOME/Desktop" "$HOME/Documents" "$HOME/Downloads" -maxdepth 5 \( \
    -name '.env' -o \
    -name '.env.*' -o \
    -iname '*secret*' -o \
    -iname '*token*' -o \
    -iname '*credential*' -o \
    -iname '*apikey*' -o \
    -iname '*api-key*' -o \
    -iname '*key*.json' \
  \) -print 2>/dev/null
} >> "$sensitive_file"

recent_file="$report_dir/05_recent_ewalk_files.txt"
write_header "$recent_file" "Recent Ewalk-related Files"
{
  echo "Files modified in the last 45 days under Desktop, Documents, and Downloads."
  echo
  find "$HOME/Desktop" "$HOME/Documents" "$HOME/Downloads" -maxdepth 5 -type f -mtime -45 \( \
    -iname '*ewalk*' -o \
    -iname '*客戶*' -o \
    -iname '*素材*' -o \
    -iname '*阿順*' -o \
    -iname '*韓食*' -o \
    -iname '*霖老師*' -o \
    -iname '*TheVision*' -o \
    -iname '*TheDay*' -o \
    -iname '*正官庄*' -o \
    -iname '*STAR*' -o \
    -iname '*Inebrya*' \
  \) -print 2>/dev/null
} >> "$recent_file"

summary_file="$report_dir/README.md"
{
  echo "# Mac Studio Pre-reset Audit"
  echo
  echo "Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo
  echo "## Files"
  echo
  echo "- 00_system.txt"
  echo "- 01_folder_sizes.txt"
  echo "- 02_git_status.txt"
  echo "- 03_automation_and_schedules.txt"
  echo "- 04_sensitive_path_candidates.txt"
  echo "- 05_recent_ewalk_files.txt"
  echo
  echo "## Safety"
  echo
  echo "- This audit is read-only."
  echo "- Secret contents are not read."
  echo "- Sensitive path candidates are path-only and must not be pasted with contents into Vault."
} > "$summary_file"

echo "Mac Studio pre-reset audit complete:"
echo "$report_dir"
