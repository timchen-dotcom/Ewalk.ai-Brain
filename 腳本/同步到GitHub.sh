#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "這個資料夾還不是 Git 專案。"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "尚未設定 GitHub 遠端。"
  echo "請執行：git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPO.git"
  exit 1
fi

branch="$(git branch --show-current)"
if [ -z "$branch" ]; then
  branch="main"
fi

git fetch origin "$branch" >/dev/null 2>&1 || true
git pull --rebase --autostash origin "$branch" || true

git add -A

if git diff --cached --quiet; then
  echo "沒有需要同步的變更。"
  exit 0
fi

timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "同步 Obsidian 資料庫：$timestamp"
git push -u origin "$branch"
