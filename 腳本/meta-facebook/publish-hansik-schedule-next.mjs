#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadEnv,
  previewText,
  printCliError,
  readGraphConfig,
  readRequiredSecretEnv,
  readTextFile,
} from './lib/env.mjs';
import { graphGet, graphPostMultipart } from './lib/meta-client.mjs';

const CURRENT_FILE = fileURLToPath(import.meta.url);
const SCRIPT_ROOT = path.dirname(CURRENT_FILE);
const WORKSPACE_ROOT = path.resolve(SCRIPT_ROOT, '../../..');
const CLIENT_ROOT = path.join(WORKSPACE_ROOT, 'Ewalk.ai Brain/01_客戶/韓食日常鍋物');
const CONTENT_DIR = path.join(CLIENT_ROOT, '02_活動與內容');
const GENERATED_DIR = path.join(CLIENT_ROOT, '04_素材/Generated');
const SCHEDULE_PATH = path.join(CONTENT_DIR, '2026-05-18起_每兩天社群排程.md');
const QUEUE_PATH = path.join(CONTENT_DIR, 'Meta自動發文佇列.md');

const READY_STATUSES = [
  'GPT Image 2 視覺完成，待手動發布',
  'GPT Image 2 視覺完成，待 Meta System User token 完成後發布',
  'GPT Image 2 視覺完成，待 Meta token 更新後發布',
  '已批准待正式 Meta System User token 完成後發布',
  '已批准待發布',
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const { apiBase, graphVersion } = readGraphConfig(env);
  const pageId = args.confirmPageId || args.pageId || env.META_PAGE_ID || '1082884688247950';
  const today = args.date || todayTaipei();
  const shouldPublish = Boolean(args.publish && !args.dryRun);

  const items = readScheduleItems(SCHEDULE_PATH);
  const dueItems = items.filter((item) => isDueAndReady(item, today));
  const selectedItems = args.allDue ? dueItems : dueItems.slice(0, 1);

  if (!selectedItems.length) {
    console.log(`沒有到期且可發布的韓食日常鍋物貼文。檢查日期：${today}`);
    return;
  }

  for (const item of selectedItems) {
    const assets = resolveAssets(item);
    assertFile(assets.captionPath, '文案檔案');
    assertFile(assets.imagePath, '圖片檔案');

    const message = readTextFile(assets.captionPath);
    assertMessage(message);

    if (!shouldPublish) {
      console.log('韓食日常鍋物自動發文 dry-run 成功');
      console.log(`排程日期：${item.date}`);
      console.log(`主題：${item.topic}`);
      console.log(`Graph API 版本：${graphVersion}`);
      console.log(`目標 Page ID：${pageId}`);
      console.log(`文案檔案：${relativePath(assets.captionPath)}`);
      console.log(`圖片檔案：${relativePath(assets.imagePath)}`);
      console.log(`文字預覽：${previewText(message)}`);
      console.log('狀態：尚未呼叫 Meta API，也沒有真的發文。');
      continue;
    }

    assertPublishApproval(args, pageId);

    const token = readRequiredSecretEnv(
      env,
      'META_PAGE_ACCESS_TOKEN',
      '正式發文需要 Page access token 或具備 Pages 權限的 System User token。',
    );

    await assertCanReadPage({ apiBase, graphVersion, token, pageId });

    const result = await graphPostMultipart(`${pageId}/photos`, {
      apiBase,
      graphVersion,
      token,
      fields: {
        message,
        published: 'true',
      },
      files: [
        {
          field: 'source',
          filename: path.basename(assets.imagePath),
          blob: new Blob([fs.readFileSync(assets.imagePath)], { type: detectMimeType(assets.imagePath) }),
        },
      ],
    });

    const postId = result.post_id || null;
    const photoId = result.id || null;
    const publishedAt = formatTaipeiTimestamp(new Date());
    const postUrl = postId ? buildFacebookPostUrl(pageId, postId) : '';

    updateScheduleStatus({
      schedulePath: SCHEDULE_PATH,
      item,
      status: postId ? `已自動發布（Meta Post ID: ${postId}）` : `已自動發布（Meta Photo ID: ${photoId}）`,
    });

    appendQueueLog({
      item,
      pageId,
      postId,
      photoId,
      postUrl,
      publishedAt,
      assets,
    });

    console.log('韓食日常鍋物 Meta 圖片貼文發布成功');
    console.log(`排程日期：${item.date}`);
    console.log(`主題：${item.topic}`);
    console.log(`Meta Photo ID：${photoId || '未回傳'}`);
    console.log(`Meta Post ID：${postId || '未回傳'}`);
    if (postUrl) console.log(`貼文連結：${postUrl}`);
  }
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

    if (current === '--all-due') {
      args.allDue = true;
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

function readScheduleItems(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^\|\s*20\d{2}-\d{2}-\d{2}\s*\|/.test(line))
    .map((line) => {
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      return {
        rawLine: line,
        date: cells[0],
        topic: cells[1],
        brandMessage: cells[2],
        references: cells[3],
        cta: cells[4],
        status: cells[5],
      };
    });
}

function isDueAndReady(item, today) {
  if (!item.date || item.date > today) return false;
  if (/已發布|已自動發布|Meta Post ID/.test(item.status)) return false;
  return READY_STATUSES.some((status) => item.status.includes(status));
}

function resolveAssets(item) {
  return {
    captionPath: path.join(CONTENT_DIR, `${item.date}_FB貼文_${item.topic}_caption.md`),
    imagePath: path.join(GENERATED_DIR, `${item.date}_${item.topic}_GPTImage2.png`),
  };
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label}不存在：${relativePath(filePath)}`);
  }
}

function assertMessage(message) {
  if (!message.trim()) throw new Error('發文文字是空的。');
  if (/GPT Image 2|視覺指令|發布檢查|內部檢查|Meta Post ID/.test(message)) {
    throw new Error('文案檔看起來混入內部檢查或製作紀錄，請改用純 caption 檔。');
  }
  if (message.length > 60000) throw new Error('發文文字過長，請拆成較短貼文。');
}

function assertPublishApproval(args, pageId) {
  if (args.approvedBy !== '提姆先生') {
    throw new Error('正式自動發文前需要加上 --approved-by "提姆先生"。');
  }

  if (args.confirmPageId !== pageId) {
    throw new Error(`正式自動發文前需要加上 --confirm-page-id "${pageId}"。`);
  }
}

async function assertCanReadPage({ apiBase, graphVersion, token, pageId }) {
  const page = await graphGet(pageId, {
    apiBase,
    graphVersion,
    token,
    params: {
      fields: 'id,name',
    },
  });

  if (page.id !== pageId) {
    throw new Error(`目前 token 無法讀取目標粉專 Page ID：${pageId}。`);
  }
}

function updateScheduleStatus({ schedulePath, item, status }) {
  const content = fs.readFileSync(schedulePath, 'utf8');
  const escapedDate = escapeRegExp(item.date);
  const escapedTopic = escapeRegExp(item.topic);
  const rowPattern = new RegExp(`^\\|\\s*${escapedDate}\\s*\\|\\s*${escapedTopic}\\s*\\|.*$`, 'm');
  const nextLine = `| ${item.date} | ${item.topic} | ${item.brandMessage} | ${item.references} | ${item.cta} | ${status} |`;

  if (!rowPattern.test(content)) {
    throw new Error(`找不到排程列：${item.date} ${item.topic}`);
  }

  fs.writeFileSync(schedulePath, content.replace(rowPattern, nextLine), 'utf8');
}

function appendQueueLog({ item, pageId, postId, photoId, postUrl, publishedAt, assets }) {
  const log = [
    '',
    `## 自動發布紀錄：META-FB-HANSIK-${item.date.replaceAll('-', '')}-${slugTopic(item.topic)}`,
    '',
    '| 欄位 | 內容 |',
    '| --- | --- |',
    '| 客戶 | 韓食日常鍋物 |',
    '| 平台 | Facebook |',
    '| 貼文類型 | 品牌日常內容 |',
    '| 發布方式 | GPT Image 2 圖片貼文 |',
    `| 排程日期 | ${item.date} |`,
    `| 發布時間 | ${publishedAt} |`,
    '| 狀態 | 已發布 |',
    '| 審核人 | 阿順 |',
    '| 最終批准 | 提姆先生 |',
    `| Page ID | \`${pageId}\` |`,
    `| 文案檔案 | \`${relativePath(assets.captionPath, CLIENT_ROOT)}\` |`,
    `| 素材 | \`${relativePath(assets.imagePath, CLIENT_ROOT)}\` |`,
    `| Meta Photo ID | \`${photoId || '未回傳'}\` |`,
    `| Meta Post ID | \`${postId || '未回傳'}\` |`,
    `| 貼文連結 | ${postUrl || '未回傳'} |`,
    '| 風險判斷 | 低風險，品牌日常內容；依既定一週三更規則自動發布 |',
    '',
  ].join('\n');

  fs.appendFileSync(QUEUE_PATH, log, 'utf8');
}

function todayTaipei() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatTaipeiTimestamp(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day} ${value.hour}:${value.minute}:${value.second}（Asia/Taipei）`;
}

function buildFacebookPostUrl(pageId, postId) {
  const postOnlyId = String(postId).includes('_') ? String(postId).split('_').at(-1) : postId;
  return `https://www.facebook.com/${pageId}/posts/${postOnlyId}`;
}

function detectMimeType(imagePath) {
  const extension = path.extname(imagePath).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.webp') return 'image/webp';
  return 'image/png';
}

function relativePath(filePath, base = WORKSPACE_ROOT) {
  return path.relative(base, filePath);
}

function slugTopic(topic) {
  return topic.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main().catch(printCliError);
