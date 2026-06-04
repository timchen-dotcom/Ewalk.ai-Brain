#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local"

umask 077
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

upsert_env() {
  local key="$1"
  local value="$2"
  local tmp

  if [[ -z "${value// }" ]]; then
    return 0
  fi

  tmp="$(mktemp)"
  awk -v k="$key" -v v="$value" '
    BEGIN { done = 0 }
    $0 ~ "^" k "=" {
      print k "=" v
      done = 1
      next
    }
    { print }
    END {
      if (done == 0) print k "=" v
    }
  ' "$ENV_FILE" > "$tmp"
  mv "$tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
}

read_plain() {
  local label="$1"
  local value
  printf "%s（留空略過）： " "$label"
  IFS= read -r value
  printf "%s" "$value"
}

read_secret() {
  local label="$1"
  local value
  printf "%s（輸入時畫面不會顯示，留空略過）： " "$label"
  stty -echo
  IFS= read -r value
  stty echo
  printf "\n"
  printf "%s" "$value"
}

sanitize_token() {
  printf '%s' "$1" | perl -pe 's/\e\[[0-9;?]*[A-Za-z]//g' | LC_ALL=C tr -d '\000-\037\177'
}

AD_ACCOUNT_ID="$(read_plain "Meta 廣告帳號 ID，act_ 開頭")"
ADS_TOKEN="$(read_secret "Meta Ads access token，需具備 ads_management")"
LATITUDE="$(read_plain "韓食日常店址緯度 META_HANSIK_LATITUDE")"
LONGITUDE="$(read_plain "韓食日常店址經度 META_HANSIK_LONGITUDE")"
RADIUS_KM="$(read_plain "投放半徑公里 META_HANSIK_RADIUS_KM，預設 3")"
GOOGLE_MAPS_URL="$(read_plain "Google 商家導航連結")"
UBER_EATS_URL="$(read_plain "Uber Eats 店家頁連結")"
FOODPANDA_URL="$(read_plain "Foodpanda 店家頁連結")"
DELIVERY_URL="$(read_plain "外送整合連結，若沒有可留空")"
MESSAGE_URL="$(read_plain "粉專或私訊導流連結")"

if [[ -n "${AD_ACCOUNT_ID// }" && "$AD_ACCOUNT_ID" != act_* ]]; then
  AD_ACCOUNT_ID="act_$AD_ACCOUNT_ID"
fi

if [[ -n "${ADS_TOKEN// }" ]]; then
  ADS_TOKEN="$(sanitize_token "$ADS_TOKEN")"
  if [[ "$ADS_TOKEN" == *"goes_here"* ]] || [[ "$ADS_TOKEN" == *"placeholder"* ]]; then
    echo "Ads token 看起來是範例值，不會寫入。"
    exit 1
  fi
fi

upsert_env "META_AD_ACCOUNT_ID" "$AD_ACCOUNT_ID"
upsert_env "META_ADS_ACCESS_TOKEN" "$ADS_TOKEN"
upsert_env "META_HANSIK_LATITUDE" "$LATITUDE"
upsert_env "META_HANSIK_LONGITUDE" "$LONGITUDE"
upsert_env "META_HANSIK_RADIUS_KM" "${RADIUS_KM:-3}"
upsert_env "META_HANSIK_GOOGLE_MAPS_URL" "$GOOGLE_MAPS_URL"
upsert_env "META_HANSIK_UBER_EATS_URL" "$UBER_EATS_URL"
upsert_env "META_HANSIK_FOODPANDA_URL" "$FOODPANDA_URL"
upsert_env "META_HANSIK_DELIVERY_URL" "$DELIVERY_URL"
upsert_env "META_HANSIK_MESSAGE_URL" "$MESSAGE_URL"

echo "已更新 $ENV_FILE"
echo "請回到 Codex 跟阿順說：設定好了"
