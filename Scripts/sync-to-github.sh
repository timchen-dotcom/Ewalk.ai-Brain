#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This folder is not a Git repository."
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "GitHub remote is not configured yet."
  echo "Run: git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPO.git"
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
  echo "No changes to sync."
  exit 0
fi

timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "Sync Obsidian vault: $timestamp"
git push -u origin "$branch"

