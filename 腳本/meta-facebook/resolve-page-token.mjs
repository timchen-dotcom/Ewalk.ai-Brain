#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  getScriptRoot,
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
    '請先放入能列出粉專的 User token 或 Page token。',
  );

  const identity = await graphGet('me', {
    apiBase,
    graphVersion,
    token,
    params: {
      fields: 'id,name',
    },
  });

  if (identity.id === pageId) {
    console.log('目前已經是目標粉專 Page token。');
    console.log(`粉專名稱：${identity.name}`);
    console.log(`Page ID：${identity.id}`);
    return;
  }

  const accounts = await graphGet('me/accounts', {
    apiBase,
    graphVersion,
    token,
    params: {
      fields: 'id,name,access_token',
      limit: '100',
    },
  });

  const page = (accounts.data || []).find((item) => item.id === pageId);

  if (!page) {
    throw new Error(`目前 token 沒有列出目標粉專 Page ID：${pageId}。請確認 Graph API Explorer 權限包含 pages_show_list、pages_read_engagement、pages_manage_posts、business_management。`);
  }

  if (!page.access_token) {
    throw new Error('Meta 有列出目標粉專，但沒有回傳 Page access token。請確認 me/accounts 查詢包含 access_token 欄位。');
  }

  writeEnvLocal({
    graphVersion,
    pageId,
    pageAccessToken: page.access_token,
  });

  console.log('已安全寫入目標粉專 Page token。');
  console.log(`原本 token 身分：${identity.name}`);
  console.log(`粉專名稱：${page.name}`);
  console.log(`Page ID：${page.id}`);
}

function writeEnvLocal({ graphVersion, pageId, pageAccessToken }) {
  const envPath = path.join(getScriptRoot(), '.env.local');
  const content = [
    `META_GRAPH_VERSION=${graphVersion}`,
    `META_PAGE_ID=${pageId}`,
    `META_PAGE_ACCESS_TOKEN=${pageAccessToken}`,
    '',
  ].join('\n');

  fs.writeFileSync(envPath, content, {
    encoding: 'utf8',
    mode: 0o600,
  });
}

main().catch(printCliError);
