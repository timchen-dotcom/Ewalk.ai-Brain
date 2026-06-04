#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local"

printf "請貼上 Meta Page access token，輸入時畫面不會顯示："
stty -echo
IFS= read -r META_TOKEN
stty echo
printf "\n"

if [[ -z "${META_TOKEN// }" ]]; then
  echo "沒有輸入 token，已取消。"
  exit 1
fi

META_TOKEN="$(printf '%s' "$META_TOKEN" | perl -pe 's/\e\[[0-9;?]*[A-Za-z]//g' | LC_ALL=C tr -d '\000-\037\177')"

if [[ "$META_TOKEN" == *"page_access_token_goes_here"* ]] || [[ "$META_TOKEN" == *"placeholder"* ]]; then
  echo "這看起來是範例值，不會寫入。"
  exit 1
fi

if [[ "$META_TOKEN" == *"["* ]] || [[ "$META_TOKEN" == *"]"* ]]; then
  echo "token 裡含有看起來像方向鍵控制碼的字元，請重新貼一次，不要按方向鍵。"
  exit 1
fi

if [[ "$(grep -o 'EAA' <<< "$META_TOKEN" | wc -l | tr -d ' ')" != "1" ]]; then
  echo "token 看起來不是單一 Page access token，請只貼一次完整 token。"
  exit 1
fi

umask 077
{
  echo "META_GRAPH_VERSION=v25.0"
  echo "META_PAGE_ID=1082884688247950"
  echo "META_PAGE_ACCESS_TOKEN=$META_TOKEN"
} > "$ENV_FILE"

echo "已寫入 $ENV_FILE"
echo "畫面沒有顯示 token，請回到 Codex 跟阿順說：好了"
