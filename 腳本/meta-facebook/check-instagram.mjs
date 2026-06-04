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
  const pageToken = readRequiredSecretEnv(
    env,
    'META_PAGE_ACCESS_TOKEN',
    '需要能讀取目標 Page 的正式 Page token。',
  );

  const page = await graphGet(pageId, {
    apiBase,
    graphVersion,
    token: pageToken,
    params: {
      fields: [
        'id',
        'name',
        'instagram_business_account{id,username,name}',
        'connected_instagram_account{id,username,name}',
        'instagram_accounts{id,username,name}',
      ].join(','),
    },
  });

  let ig = pickInstagramAccount(page);
  let igSource = 'Page 連結欄位';

  if (!ig && env.META_IG_USER_ID && env.META_IG_ACCESS_TOKEN) {
    const igToken = readRequiredSecretEnv(
      env,
      'META_IG_ACCESS_TOKEN',
      '需要能讀取 IG 資產的正式 System User token。',
    );

    ig = await graphGet(env.META_IG_USER_ID, {
      apiBase,
      graphVersion,
      token: igToken,
      params: {
        fields: 'id,username,name',
      },
    });
    igSource = 'META_IG_USER_ID + META_IG_ACCESS_TOKEN';
  }

  console.log('Meta Instagram 連結檢查');
  console.log(`Graph API 版本：${graphVersion}`);
  console.log('使用憑證：META_PAGE_ACCESS_TOKEN；必要時搭配 META_IG_ACCESS_TOKEN');
  console.log(`粉專名稱：${page.name}`);
  console.log(`Page ID：${page.id}`);

  if (!ig) {
    console.log('狀態：尚未偵測到已連結的 Instagram 商業 / 專業帳號。');
    console.log('下一步：確認 IG 已連結到此 Facebook Page，且 System User / App 已取得 IG 資產與 IG 發布權限。');
    process.exitCode = 2;
    return;
  }

  console.log('狀態：已偵測到 Instagram 商業 / 專業帳號。');
  console.log(`偵測來源：${igSource}`);
  console.log(`IG User ID：${ig.id}`);
  console.log(`IG 使用者名稱：${ig.username || '未回傳'}`);
  if (ig.name) console.log(`IG 名稱：${ig.name}`);
}

function pickInstagramAccount(page) {
  if (page.instagram_business_account) return page.instagram_business_account;
  if (page.connected_instagram_account) return page.connected_instagram_account;
  const accounts = page.instagram_accounts?.data || page.instagram_accounts || [];
  if (Array.isArray(accounts) && accounts.length) return accounts[0];
  return null;
}

main().catch(printCliError);
