#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_GRAPH_VERSION = 'v25.0';
const DEFAULT_TIMEZONE = 'Asia/Taipei';

main().catch((error) => {
  console.error(`失敗：${redactSensitiveText(error.message)}`);
  process.exitCode = 1;
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const clientsPath = requiredArg(args, 'clients', '請提供 --clients 客戶設定檔。');
  const outputDir = args['output-dir'] || 'Ewalk.ai Brain/04_報表/社群更新追蹤';
  const reportLabel = args.label ? `${sanitizeFileLabel(args.label)}_` : '';
  const runDate = args.date ? parseLocalDate(args.date) : new Date();
  const config = readJson(clientsPath);
  const timezone = config.timezone || DEFAULT_TIMEZONE;
  const periods = buildPeriods(runDate);
  const samplePosts = args['sample-posts'] ? readJson(args['sample-posts']).posts || [] : [];
  const env = loadEnv(path.dirname(path.resolve(clientsPath)), args['env-file']);

  const trackingJobs = (config.clients || []).flatMap((client) =>
    expandTrackingTargets(client).map((target) => ({ client, ...target })),
  );
  const concurrency = Math.max(1, Number(args.concurrency || env.SOCIAL_TRACKER_CONCURRENCY || 1));
  const rows = await mapWithConcurrency(trackingJobs, concurrency, async ({ client, staff, platformConfig }) => {
    const source = platformConfig.source || 'sample';
    let posts = [];
    let statusOverride = '';
    let validationNote = '';

    try {
      const result = await loadPosts({
        client,
        staff,
        platformConfig,
        source,
        samplePosts,
        env,
        periods,
      });
      posts = result.posts || [];
      statusOverride = result.statusOverride || '';
      validationNote = result.validationNote || '';
    } catch (error) {
      statusOverride = '待確認';
      validationNote = `資料讀取失敗：${redactSensitiveText(error.message)}`;
    }

    return buildTrackingRow({
      client,
      staff,
      platformConfig,
      posts,
      periods,
      source,
      statusOverride,
      validationNote,
    });
  });

  if (!rows.length) {
    throw new Error('沒有可追蹤的客戶平台，請檢查 clients 設定。');
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const stamp = formatDate(runDate);
  const reportPath = path.join(outputDir, `${stamp}_${reportLabel}客戶社群更新追蹤報告.md`);
  const csvPath = path.join(outputDir, `${stamp}_${reportLabel}客戶社群更新追蹤明細.csv`);

  fs.writeFileSync(reportPath, renderMarkdownReport({ rows, runDate, periods, timezone }), 'utf8');
  fs.writeFileSync(csvPath, renderCsv(rows), 'utf8');

  console.log('客戶社群更新追蹤完成');
  console.log(`報告：${reportPath}`);
  console.log(`明細：${csvPath}`);
  console.log(`需提醒項目：${rows.filter((row) => row.needReminder).length}`);
}

async function loadPosts({ client, staff, platformConfig, source, samplePosts, env, periods }) {
  if (source === 'sample' || source === 'manual_json') {
    return {
      posts: samplePosts.filter((post) =>
        post.clientId === client.clientId &&
        (!staff?.staffId || post.staffId === staff.staffId) &&
        post.platform === platformConfig.platform &&
        post.accountId === platformConfig.accountId
      ),
    };
  }

  if (source === 'pending_auth') {
    return { posts: [], statusOverride: '待授權' };
  }

  if (source === 'facebook_page_graph') {
    const token = readSecret(env, platformConfig.tokenEnv || 'META_PAGE_ACCESS_TOKEN');
    const pageId = platformConfig.pageId || platformConfig.accountId;
    const fields = 'id,message,created_time,permalink_url';
    const data = await graphGet(`${pageId}/posts`, {
      env,
      token,
      params: {
        fields,
        since: Math.floor(periods.monthStart.getTime() / 1000),
        until: Math.floor(periods.monthEnd.getTime() / 1000),
        limit: 100,
      },
    });

    return {
      posts: (data.data || []).map((post) => ({
        clientId: client.clientId,
        staffId: staff?.staffId || platformConfig.staffId || '',
        platform: platformConfig.platform,
        accountId: platformConfig.accountId,
        postId: post.id,
        publishedAt: post.created_time,
        permalink: post.permalink_url || '',
        caption: post.message || '',
      })),
    };
  }

  if (source === 'instagram_business_graph') {
    const token = readSecret(env, platformConfig.tokenEnv || 'META_PAGE_ACCESS_TOKEN');
    const instagramUserId = platformConfig.instagramUserId || platformConfig.accountId;
    const data = await graphGet(`${instagramUserId}/media`, {
      env,
      token,
      params: {
        fields: 'id,caption,timestamp,permalink,media_type',
        since: Math.floor(periods.monthStart.getTime() / 1000),
        until: Math.floor(periods.monthEnd.getTime() / 1000),
        limit: 100,
      },
    });

    return {
      posts: (data.data || []).map((post) => ({
        clientId: client.clientId,
        staffId: staff?.staffId || platformConfig.staffId || '',
        platform: platformConfig.platform,
        accountId: platformConfig.accountId,
        postId: post.id,
        publishedAt: post.timestamp,
        permalink: post.permalink || '',
        caption: post.caption || '',
        mediaType: post.media_type || '',
      })),
    };
  }

  if (source === 'apify_instagram_public') {
    const tokenKey = platformConfig.tokenEnv || 'APIFY_TOKEN';
    const token = env[tokenKey]?.trim();

    if (!token || isPlaceholderSecret(token)) {
      return { posts: [], statusOverride: '待設定' };
    }

    const items = await runApifyInstagramScraper({ env, token, platformConfig });
    const expectedAccount = normalizeInstagramHandle(platformConfig.handle || platformConfig.accountId || platformConfig.profileUrl);
    const normalizedPosts = items
      .map((item) => normalizeApifyInstagramItem({ item, client, staff, platformConfig }))
      .filter((post) => post.publishedAt);
    const acceptedPosts = normalizedPosts.filter((post) =>
      !expectedAccount ||
      !post.sourceAccount ||
      normalizeInstagramHandle(post.sourceAccount) === expectedAccount
    );
    const mismatchedAccounts = [...new Set(
      normalizedPosts
        .map((post) => normalizeInstagramHandle(post.sourceAccount))
        .filter((account) => account && expectedAccount && account !== expectedAccount),
    )];

    return {
      posts: acceptedPosts,
      validationNote: mismatchedAccounts.length
        ? `Apify 回傳 owner 不符：${mismatchedAccounts.join('、')}；已排除不屬於 ${expectedAccount} 的貼文`
        : '',
    };
  }

  throw new Error(`不支援的資料來源：${source}`);
}

function expandTrackingTargets(client) {
  const targets = [];

  for (const platformConfig of client.platforms || []) {
    if (platformConfig.enabled === false) continue;
    targets.push({ staff: null, platformConfig });
  }

  for (const staff of client.staff || []) {
    for (const platformConfig of staff.platforms || []) {
      if (platformConfig.enabled === false) continue;
      targets.push({ staff, platformConfig });
    }
  }

  return targets;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}

function buildTrackingRow({ client, staff, platformConfig, posts, periods, source, statusOverride, validationNote }) {
  const normalizedPosts = posts
    .map((post) => ({ ...post, date: new Date(post.publishedAt) }))
    .filter((post) => !Number.isNaN(post.date.getTime()));

  const weekPosts = normalizedPosts.filter((post) => post.date >= periods.weekStart && post.date <= periods.weekEnd);
  const monthPosts = normalizedPosts.filter((post) => post.date >= periods.monthStart && post.date <= periods.monthEnd);
  const weeklyTarget = Number(platformConfig.targetPerWeek || 0);
  const monthlyTarget = Number(platformConfig.targetPerMonth || 0);
  const monthlyExpectedToDate = calculateExpectedToDate(monthlyTarget, periods);
  const weeklyGap = Math.max(weeklyTarget - weekPosts.length, 0);
  const monthlyGapToDate = Math.max(monthlyExpectedToDate - monthPosts.length, 0);
  const monthlyRemainingGap = Math.max(monthlyTarget - monthPosts.length, 0);
  const status = statusOverride || decideStatus({ weeklyGap, monthlyGapToDate, source });

  return {
    clientId: client.clientId,
    clientName: client.clientName,
    staffId: staff?.staffId || platformConfig.staffId || '',
    staffName: staff?.staffName || platformConfig.staffName || '',
    role: staff?.role || platformConfig.role || '',
    owner: client.owner || '',
    platform: platformConfig.platform,
    displayName: platformConfig.displayName || platformConfig.platform,
    source,
    weeklyTarget,
    weeklyActual: weekPosts.length,
    weeklyGap,
    monthlyTarget,
    monthlyExpectedToDate,
    monthlyActual: monthPosts.length,
    monthlyGapToDate,
    monthlyRemainingGap,
    status,
    needReminder: weeklyGap > 0 || monthlyGapToDate > 0 || status === '待授權' || status === '待設定' || status === '待確認',
    validationNote: validationNote || '',
    latestPostAt: normalizedPosts.length ? formatDateTime(new Date(Math.max(...normalizedPosts.map((post) => post.date.getTime())))) : '',
    latestPermalink: normalizedPosts.sort((a, b) => b.date - a.date)[0]?.permalink || '',
  };
}

function calculateExpectedToDate(monthlyTarget, periods) {
  if (!monthlyTarget) return 0;

  const totalDays = Math.max(daysBetween(periods.monthStart, periods.monthEnd) + 1, 1);
  const elapsedDays = Math.min(Math.max(daysBetween(periods.monthStart, periods.runDate) + 1, 1), totalDays);

  return Math.ceil((monthlyTarget * elapsedDays) / totalDays);
}

function daysBetween(start, end) {
  const startDay = startOfDay(start).getTime();
  const endDay = startOfDay(end).getTime();
  return Math.round((endDay - startDay) / 86400000);
}

function decideStatus({ weeklyGap, monthlyGapToDate, source }) {
  if (source === 'pending_auth') return '待授權';
  if (source.includes('graph') && (weeklyGap === null || monthlyGapToDate === null)) return '待授權';
  if (weeklyGap >= 3 || monthlyGapToDate >= 3) return '嚴重落後';
  if (weeklyGap > 0 || monthlyGapToDate > 0) return '稍微落後';
  return '正常';
}

async function runApifyInstagramScraper({ env, token, platformConfig }) {
  const apiBase = (env.APIFY_API_BASE_URL || 'https://api.apify.com').replace(/\/+$/, '');
  const actorId = platformConfig.actorId || env.APIFY_INSTAGRAM_ACTOR || 'apify~instagram-scraper';
  const profileUrl = platformConfig.profileUrl || `https://www.instagram.com/${platformConfig.handle || platformConfig.accountId}/`;
  const resultsLimit = Number(platformConfig.resultsLimit || env.APIFY_INSTAGRAM_RESULTS_LIMIT || 30);
  const timeout = Number(platformConfig.timeoutSeconds || env.APIFY_TIMEOUT_SECONDS || 180);
  const endpoint = new URL(`${apiBase}/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items`);

  endpoint.searchParams.set('token', token);
  endpoint.searchParams.set('format', 'json');
  endpoint.searchParams.set('clean', 'true');
  endpoint.searchParams.set('timeout', String(timeout));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      directUrls: [profileUrl],
      resultsType: 'posts',
      resultsLimit,
      searchType: 'user',
    }),
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : [];

  if (!response.ok) {
    const message = body?.error?.message || body?.message || `Apify API 呼叫失敗：${response.status}`;
    throw new Error(message);
  }

  if (!Array.isArray(body)) {
    throw new Error('Apify API 回傳格式不是陣列，請檢查 Actor 或輸入格式。');
  }

  return body;
}

function normalizeApifyInstagramItem({ item, client, staff, platformConfig }) {
  const publishedAt = item.timestamp || item.takenAt || item.createdAt || item.datetime || item.date || '';
  const permalink = item.url || item.permalink || item.inputUrl || '';
  const shortCode = item.shortCode || item.shortcode || extractInstagramShortCode(permalink);

  return {
    clientId: client.clientId,
    staffId: staff?.staffId || platformConfig.staffId || '',
    platform: platformConfig.platform,
    accountId: platformConfig.accountId || platformConfig.handle,
    postId: shortCode || item.id || item.pk || permalink,
    publishedAt,
    permalink,
    caption: previewText(item.caption || item.text || item.description || '', 120),
    mediaType: item.typeName || item.mediaType || item.productType || '',
    sourceAccount: item.ownerUsername || item.username || item.owner?.username || '',
  };
}

function normalizeInstagramHandle(value) {
  return String(value || '')
    .replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, '')
    .replace(/[/?#].*$/g, '')
    .replace(/^@/, '')
    .trim()
    .toLowerCase();
}

function extractInstagramShortCode(url) {
  const match = String(url).match(/instagram\.com\/(?:p|reel|tv)\/([^/?#]+)/i);
  return match?.[1] || '';
}

function renderMarkdownReport({ rows, runDate, periods, timezone }) {
  const reminderRows = rows.filter((row) => row.needReminder);
  const lines = [
    '# 客戶社群更新追蹤報告',
    '',
    `產出日期：${formatDate(runDate)}`,
    `時區：${timezone}`,
    `本週區間：${formatDate(periods.weekStart)} 至 ${formatDate(periods.weekEnd)}`,
    `本月區間：${formatDate(periods.monthStart)} 至 ${formatDate(periods.monthEnd)}`,
    '',
    '## 總覽',
    '',
    `- 追蹤平台數：${rows.length}`,
    `- 需要提醒：${reminderRows.length}`,
    `- 正常：${rows.filter((row) => row.status === '正常').length}`,
    `- 稍微落後：${rows.filter((row) => row.status === '稍微落後').length}`,
    `- 嚴重落後：${rows.filter((row) => row.status === '嚴重落後').length}`,
    `- 待設定：${rows.filter((row) => row.status === '待設定').length}`,
    `- 待授權：${rows.filter((row) => row.status === '待授權').length}`,
    `- 待確認：${rows.filter((row) => row.status === '待確認').length}`,
    '',
    '## 追蹤明細',
    '',
    '| 客戶 / 髮型師 | 平台 | 本週目標 | 本週已發 | 本週缺口 | 本月至今應發 | 本月已發 | 至今缺口 | 月底仍需 | 狀態 | 最新貼文 |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |',
    ...rows.map((row) => [
      formatClientPerson(row),
      row.displayName,
      row.weeklyTarget,
      row.weeklyActual,
      row.weeklyGap,
      row.monthlyExpectedToDate,
      row.monthlyActual,
      row.monthlyGapToDate,
      row.monthlyRemainingGap,
      row.status,
      row.latestPostAt || '無資料',
    ].join(' | ')).map((line) => `| ${line} |`),
    '',
    '## 需要處理',
    '',
  ];

  if (!reminderRows.length) {
    lines.push('- 本次無需提醒項目。');
  } else {
    for (const row of reminderRows) {
      const note = row.validationNote ? `；${row.validationNote}` : '';
      lines.push(`- ${row.clientName} / ${row.displayName}：本週差 ${row.weeklyGap} 篇，本月至今差 ${row.monthlyGapToDate} 篇，月底仍需 ${row.monthlyRemainingGap} 篇，狀態：${row.status}${note}`);
    }
  }

  lines.push(
    '',
    '## 建議下一步',
    '',
    '- 稍微落後：由社群主編補排內容或請客戶補素材。',
    '- 嚴重落後：阿順列入週會追蹤，確認是否為素材不足、排程中斷或帳號授權問題。',
    '- 待設定：補齊工具 token、Actor ID 或資料來源設定。',
    '- 待授權：客戶成功經理補齊 Meta Page / Instagram Business 權限。',
    '- 待確認：確認帳號是否公開、handle 是否正確、外部資料工具是否可讀。',
    '- 月底：將本報告併入客戶月報 Flow。',
    '',
  );

  return `${lines.join('\n')}\n`;
}

function renderCsv(rows) {
  const headers = [
    'clientId',
    'clientName',
    'staffId',
    'staffName',
    'role',
    'owner',
    'platform',
    'displayName',
    'source',
    'weeklyTarget',
    'weeklyActual',
    'weeklyGap',
    'monthlyTarget',
    'monthlyExpectedToDate',
    'monthlyActual',
    'monthlyGapToDate',
    'monthlyRemainingGap',
    'status',
    'needReminder',
    'latestPostAt',
    'latestPermalink',
    'validationNote',
  ];

  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n') + '\n';
}

function formatClientPerson(row) {
  if (!row.staffName) return row.clientName;
  return `${row.clientName} / ${row.staffName}`;
}

async function graphGet(graphPath, { env, token, params }) {
  const apiBase = (env.META_GRAPH_BASE_URL || 'https://graph.facebook.com').replace(/\/+$/, '');
  const graphVersion = env.META_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;
  const url = new URL(`${apiBase}/${graphVersion}/${String(graphPath).replace(/^\/+/, '')}`);

  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await response.json();

  if (!response.ok || body.error) {
    const message = body.error?.message || `Meta API 呼叫失敗：${graphPath}`;
    throw new Error(message);
  }

  return body;
}

function buildPeriods(date) {
  const local = new Date(date);
  const weekStart = startOfDay(local);
  const day = weekStart.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + mondayOffset);

  const weekEnd = endOfDay(new Date(weekStart));
  weekEnd.setDate(weekEnd.getDate() + 6);

  const monthStart = startOfDay(new Date(local.getFullYear(), local.getMonth(), 1));
  const monthEnd = endOfDay(new Date(local.getFullYear(), local.getMonth() + 1, 0));

  return { runDate: local, weekStart, weekEnd, monthStart, monthEnd };
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }

  return args;
}

function requiredArg(args, key, message) {
  if (args[key]) return args[key];
  throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function loadEnv(baseDir, explicitEnvFile) {
  const values = {};
  const candidates = [
    explicitEnvFile,
    path.join(baseDir, '.env'),
    path.join(baseDir, '.env.local'),
    path.join(process.cwd(), 'Ewalk.ai Brain/腳本/social-frequency-tracker/.env.local'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
  ].filter(Boolean);

  for (const filePath of [...new Set(candidates)]) {
    if (!fs.existsSync(filePath)) continue;
    Object.assign(values, parseEnvFile(fs.readFileSync(filePath, 'utf8')));
  }

  return { ...values, ...process.env };
}

function parseEnvFile(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value.replace(/\\n/g, '\n');
  }

  return values;
}

function readSecret(env, key) {
  const value = env[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`缺少必要環境變數：${key}。請只放在本機 .env.local 或安全環境，不要寫進 Obsidian。`);
  }
  if (isPlaceholderSecret(value)) {
    throw new Error(`${key} 目前看起來是範例值，請改用有效的本機環境變數。`);
  }
  return value.trim();
}

function isPlaceholderSecret(value) {
  return /goes_here|your_|example|placeholder/i.test(String(value));
}

function previewText(text, limit = 120) {
  const compact = String(text).replace(/\s+/g, ' ').trim();
  if (compact.length <= limit) return compact;
  return `${compact.slice(0, limit)}...`;
}

function parseLocalDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) throw new Error(`日期格式錯誤：${value}`);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(date)} ${hour}:${minute}`;
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function sanitizeFileLabel(value) {
  return String(value)
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function redactSensitiveText(text) {
  return String(text)
    .replace(/EAA[^\s"',}]+/g, '[REDACTED_META_TOKEN]')
    .replace(/access_token=[^&\s]+/gi, 'access_token=[REDACTED]');
}
