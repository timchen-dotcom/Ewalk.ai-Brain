#!/usr/bin/env node

import {
  loadEnv,
  previewText,
  printCliError,
  readGraphConfig,
  readRequiredSecretEnv,
  readTextFile,
} from './lib/env.mjs';
import { graphGet, graphPost } from './lib/meta-client.mjs';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const { apiBase, graphVersion } = readGraphConfig(env);
  const pageId = args.pageId || env.META_PAGE_ID || '1082884688247950';
  const message = resolveMessage(args);
  const shouldPublish = Boolean(args.publish && !args.dryRun);

  assertMessage(message);

  if (!shouldPublish) {
    console.log('Meta 發文 dry-run 成功');
    console.log(`Graph API 版本：${graphVersion}`);
    console.log(`目標 Page ID：${pageId}`);
    console.log(`文字長度：${message.length}`);
    console.log(`文字預覽：${previewText(message)}`);
    console.log('狀態：尚未呼叫 Meta API，也沒有真的發文。');
    return;
  }

  assertPublishApproval(args, pageId);

  const token = readRequiredSecretEnv(
    env,
    'META_PAGE_ACCESS_TOKEN',
    '正式發文需要 Page access token，但 token 只能放在本機環境變數。',
  );

  await assertPageToken({
    apiBase,
    graphVersion,
    token,
    pageId,
  });

  const params = {
    message,
  };

  if (args.link) params.link = args.link;

  const result = await graphPost(`${pageId}/feed`, {
    apiBase,
    graphVersion,
    token,
    params,
  });

  console.log('Meta 貼文發布成功');
  console.log(`Graph API 版本：${graphVersion}`);
  console.log(`目標 Page ID：${pageId}`);
  console.log(`Meta Post ID：${result.id}`);
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (current === '--publish') {
      args.publish = true;
      continue;
    }

    if (current.startsWith('--')) {
      const key = current.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = argv[index + 1];

      if (!value || value.startsWith('--')) {
        throw new Error(`缺少參數值：${current}`);
      }

      args[key] = value;
      index += 1;
    }
  }

  return args;
}

function resolveMessage(args) {
  if (args.messageFile) return readTextFile(args.messageFile);
  if (args.message) return args.message.trim();
  throw new Error('缺少發文文字。請使用 --message 或 --message-file。');
}

function assertMessage(message) {
  if (!message.trim()) throw new Error('發文文字是空的。');
  if (message.length > 60000) throw new Error('發文文字過長，請拆成較短貼文。');
}

function assertPublishApproval(args, pageId) {
  if (args.approvedBy !== '提姆先生') {
    throw new Error('正式發文前需要加上 --approved-by "提姆先生"。');
  }

  if (args.confirmPageId !== pageId) {
    throw new Error(`正式發文前需要加上 --confirm-page-id "${pageId}"。`);
  }
}

async function assertPageToken({ apiBase, graphVersion, token, pageId }) {
  const identity = await graphGet('me', {
    apiBase,
    graphVersion,
    token,
    params: {
      fields: 'id,name',
    },
  });

  if (identity.id !== pageId) {
    throw new Error(
      `目前 META_PAGE_ACCESS_TOKEN 指向「${identity.name}」，不是目標粉專 Page token。請先執行 resolve-page-token.mjs。`,
    );
  }
}

main().catch(printCliError);
