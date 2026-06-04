#!/bin/zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
ENV_FILE="$ROOT/.env.local"

mkdir -p "$(dirname "$ENV_FILE")"
touch "$ENV_FILE"
chmod 600 "$ENV_FILE" 2>/dev/null || true

read_plain() {
  local label="$1"
  local default_value="${2:-}"
  local value
  if [[ -n "$default_value" ]]; then
    printf "%s [%s]: " "$label" "$default_value" >/dev/tty
  else
    printf "%s: " "$label" >/dev/tty
  fi
  IFS= read -r value </dev/tty
  if [[ -z "$value" && -n "$default_value" ]]; then
    value="$default_value"
  fi
  printf "%s" "$value"
}

read_secret() {
  local label="$1"
  local value
  printf "%s: " "$label" >/dev/tty
  stty -echo </dev/tty
  IFS= read -r value </dev/tty
  stty echo </dev/tty
  printf "\n" >/dev/tty
  printf "%s" "$value"
}

upsert_env() {
  local key="$1"
  local value="$2"
  [[ -z "${value// }" ]] && return 0
  local escaped
  escaped="$(printf "%s" "$value" | sed 's/[\/&]/\\&/g')"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i '' "s/^${key}=.*/${key}=${escaped}/" "$ENV_FILE"
  else
    printf "%s=%s\n" "$key" "$value" >> "$ENV_FILE"
  fi
}

echo "Google Ads API 本機設定"
echo "注意：密鑰只寫入 .env.local，不寫入 Obsidian 文件。"
echo

DEV_TOKEN="$(read_secret 'Google Ads developer token')"
CLIENT_ID="$(read_secret 'OAuth client ID')"
CLIENT_SECRET="$(read_secret 'OAuth client secret')"
REFRESH_TOKEN="$(read_secret 'OAuth refresh token（scope 需含 https://www.googleapis.com/auth/adwords）')"
LOGIN_CUSTOMER_ID="$(read_plain 'Manager account CID，不含破折號' '7563161776')"
CUSTOMER_ID="$(read_plain '投放帳戶 CID，不含破折號' '7287266360')"
GEO_TARGET="$(read_plain '臺南市 geoTargetConstant，例如 geoTargetConstants/xxxx；未知可先留空' '')"
LANGUAGE_CONSTANT="$(read_plain '繁體中文 languageConstant，例如 languageConstants/xxxx；未知可先留空' '')"

upsert_env GOOGLE_ADS_DEVELOPER_TOKEN "$DEV_TOKEN"
upsert_env GOOGLE_ADS_CLIENT_ID "$CLIENT_ID"
upsert_env GOOGLE_ADS_CLIENT_SECRET "$CLIENT_SECRET"
upsert_env GOOGLE_ADS_REFRESH_TOKEN "$REFRESH_TOKEN"
upsert_env GOOGLE_ADS_LOGIN_CUSTOMER_ID "$LOGIN_CUSTOMER_ID"
upsert_env GOOGLE_ADS_CUSTOMER_ID "$CUSTOMER_ID"
upsert_env GOOGLE_ADS_GEO_TARGET_CONSTANT "$GEO_TARGET"
upsert_env GOOGLE_ADS_LANGUAGE_CONSTANT "$LANGUAGE_CONSTANT"
upsert_env GOOGLE_ADS_API_VERSION "v22"

echo
echo "已寫入 $ENV_FILE"
echo "下一步可執行：node 'Ewalk.ai Brain/腳本/google-ads/google-ads-api-runner.mjs' check"
