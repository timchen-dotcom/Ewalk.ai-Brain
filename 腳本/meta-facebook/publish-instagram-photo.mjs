#!/usr/bin/env node

import {
  loadEnv,
  previewText,
  printCliError,
  readGraphConfig,
  readRequiredEnv,
  readRequiredSecretEnv,
  readTextFile,
} from './lib/env.mjs';
import { graphGet, graphPost } from './lib/meta-client.mjs';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const { apiBase, graphVersion } = readGraphConfig(env);
  const igUserId = args.igUserId || env.META_IG_USER_ID;
  const imageUrl = args.imageUrl || env.META_IG_IMAGE_URL;
  const caption = readCaption(args);
  const shouldPublish = Boolean(args.publish && !args.dryRun);

  if (!igUserId) {
    throw new Error('缺少 IG User ID。請先執行 check-instagram.mjs，確認 Page 已連結 IG 商業 / 專業帳號。');
  }

  if (!imageUrl) {
    throw new Error('缺少 IG 圖片公開 URL。Instagram API 不能直接使用本機檔案路徑。');
  }

  assertPublicImageUrl(imageUrl);
  assertCaption(caption);

  if (!shouldPublish) {
    console.log('Instagram 圖片發布 dry-run 成功');
    console.log(`Graph API 版本：${graphVersion}`);
    console.log(`IG User ID：${igUserId}`);
    console.log(`圖片 URL：${imageUrl}`);
    console.log(`文案預覽：${previewText(caption)}`);
    console.log('狀態：尚未呼叫 Meta API，也沒有真的發布 IG。');
    return;
  }

  assertPublishApproval(args);

  const token = readRequiredSecretEnv(
    env,
    'META_IG_ACCESS_TOKEN',
    '正式 IG 發布需要具備 instagram_content_publish 權限的 token，請只放在本機環境變數，不要貼到聊天或文件。',
  );

  const container = await graphPost(`${igUserId}/media`, {
    apiBase,
    graphVersion,
    token,
    params: {
      image_url: imageUrl,
      caption,
    },
  });

  if (!container.id) {
    throw new Error('IG media container 未回傳 ID。');
  }

  const published = await graphPost(`${igUserId}/media_publish`, {
    apiBase,
    graphVersion,
    token,
    params: {
      creation_id: container.id,
    },
  });

  const mediaId = published.id || '';
  const permalink = mediaId
    ? await readInstagramPermalink({ apiBase, graphVersion, token, mediaId })
    : '';

  console.log('Instagram 圖片發布成功');
  console.log(`IG Container ID：${container.id}`);
  console.log(`IG Media ID：${mediaId || '未回傳'}`);
  if (permalink) console.log(`IG 連結：${permalink}`);
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

function readCaption(args) {
  if (args.captionFile) return readTextFile(args.captionFile);
  if (args.caption) return args.caption.trim();
  return readRequiredEnv(args, 'caption', '請提供 --caption-file 或 --caption。');
}

function assertPublicImageUrl(imageUrl) {
  let parsed;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new Error('IG 圖片 URL 格式錯誤。');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('IG 圖片 URL 必須是 HTTPS 公開網址。');
  }

  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\.local$/i.test(parsed.hostname)) {
    throw new Error('IG 圖片 URL 不能是本機或內網網址，Meta 必須能公開讀取。');
  }
}

function assertCaption(caption) {
  if (!caption.trim()) throw new Error('IG caption 是空的。');
  if (caption.length > 2200) throw new Error('IG caption 超過 2200 字，請改短。');
  const hashtags = caption.match(/(^|\s)#[\p{L}\p{N}_]+/gu) || [];
  if (hashtags.length > 30) throw new Error('IG caption 超過 30 個 hashtag。');
  if (/GPT Image 2|視覺指令|發布檢查|內部檢查|Meta Post ID/.test(caption)) {
    throw new Error('caption 檔看起來混入內部檢查或製作紀錄，請改用純 caption 檔。');
  }
}

function assertPublishApproval(args) {
  if (args.approvedBy !== '提姆先生') {
    throw new Error('正式 IG 發布前需要加上 --approved-by "提姆先生"。');
  }
}

async function readInstagramPermalink({ apiBase, graphVersion, token, mediaId }) {
  try {
    const media = await graphGet(mediaId, {
      apiBase,
      graphVersion,
      token,
      params: {
        fields: 'id,permalink',
      },
    });
    return media.permalink || '';
  } catch {
    return '';
  }
}

main().catch(printCliError);
