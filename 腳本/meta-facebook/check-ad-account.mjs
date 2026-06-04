#!/usr/bin/env node

import {
  loadEnv,
  printCliError,
  readGraphConfig,
  readRequiredEnv,
  readRequiredSecretEnv,
} from './lib/env.mjs';
import { graphGet } from './lib/meta-client.mjs';

async function main() {
  const env = loadEnv();
  const { apiBase, graphVersion } = readGraphConfig(env);
  const adAccountId = normalizeAdAccountId(readRequiredEnv(
    env,
    'META_AD_ACCOUNT_ID',
    '請填入 act_ 開頭的 Meta 廣告帳號 ID。',
  ));
  const token = readRequiredSecretEnv(
    env,
    'META_ADS_ACCESS_TOKEN',
    '請使用具備 ads_read / ads_management 的 User token 或 System User token。',
  );

  const account = await graphGet(adAccountId, {
    apiBase,
    graphVersion,
    token,
    params: {
      fields: 'id,name,account_status,currency,timezone_name',
    },
  });

  console.log('Meta 廣告帳號檢查成功');
  console.log(`Graph API 版本：${graphVersion}`);
  console.log(`廣告帳號：${account.name || '(未命名)'}`);
  console.log(`Ad Account ID：${account.id}`);
  console.log(`Account Status：${account.account_status}`);
  console.log(`Currency：${account.currency || '(未回傳)'}`);
  console.log(`Timezone：${account.timezone_name || '(未回傳)'}`);
}

function normalizeAdAccountId(value) {
  const text = String(value).trim();
  return text.startsWith('act_') ? text : `act_${text}`;
}

main().catch(printCliError);
