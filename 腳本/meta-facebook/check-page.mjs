#!/usr/bin/env node

import {
  loadEnv,
  printCliError,
  readGraphConfig,
  readRequiredSecretEnv,
} from './lib/env.mjs';
import { graphGet } from './lib/meta-client.mjs';

async function main() {
  const env = loadEnv();
  const { apiBase, graphVersion } = readGraphConfig(env);
  const pageId = env.META_PAGE_ID || '1082884688247950';
  const token = readRequiredSecretEnv(
    env,
    'META_PAGE_ACCESS_TOKEN',
    '請把 Page access token 放在腳本資料夾的 .env.local 或系統環境變數。',
  );

  const page = await graphGet(pageId, {
    apiBase,
    graphVersion,
    token,
    params: {
      fields: 'id,name',
    },
  });

  console.log('Meta 粉專檢查成功');
  console.log(`Graph API 版本：${graphVersion}`);
  console.log(`粉專名稱：${page.name}`);
  console.log(`Page ID：${page.id}`);
}

main().catch(printCliError);
