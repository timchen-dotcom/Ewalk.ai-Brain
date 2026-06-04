import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve('.');
const DEFAULT_PREVIEW = resolve(
  ROOT,
  'Ewalk.ai Brain/01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動/2026-06-03_GoogleAds_API_mutate_operations_preview.json'
);

const REQUIRED_ENV = [
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_REFRESH_TOKEN',
  'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
  'GOOGLE_ADS_CUSTOMER_ID'
];

const OPTIONAL_ENV = ['GOOGLE_ADS_GEO_TARGET_CONSTANT', 'GOOGLE_ADS_LANGUAGE_CONSTANT', 'GOOGLE_ADS_API_VERSION'];
const ROOT_ENV_PATH = resolve(ROOT, '.env.local');
const HANSIK_CAMPAIGN_NAMES = [
  'HIH_202606_Search_Brand_Map',
  'HIH_202606_Search_Local_KoreanHotpot',
  'HIH_202606_Search_Delivery'
];
const HANSIK_REPORT_DIR = resolve(
  ROOT,
  'Ewalk.ai Brain/01_客戶/韓食日常鍋物/04_報表/2026-06_開幕慶GoogleAds日報'
);

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadConfig() {
  return {
    ...loadEnvFile(ROOT_ENV_PATH),
    ...loadEnvFile(resolve(ROOT, 'Ewalk.ai Brain/腳本/google-ads/.env.local')),
    ...process.env
  };
}

function upsertEnvFile(path, values) {
  const lines = existsSync(path) ? readFileSync(path, 'utf8').split(/\r?\n/).filter(Boolean) : [];
  const seen = new Set();
  const next = lines.map((line) => {
    const index = line.indexOf('=');
    if (index < 0) return line;
    const key = line.slice(0, index);
    if (!(key in values)) return line;
    seen.add(key);
    return `${key}=${values[key]}`;
  });
  for (const [key, value] of Object.entries(values)) {
    if (value && !seen.has(key)) next.push(`${key}=${value}`);
  }
  writeFileSync(path, `${next.join('\n')}\n`, { mode: 0o600 });
}

function mask(value) {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function printEnvStatus(config) {
  const rows = [...REQUIRED_ENV, ...OPTIONAL_ENV].map((key) => ({
    key,
    present: Boolean(config[key]),
    value: config[key] ? mask(config[key]) : ''
  }));
  console.log(JSON.stringify({ mode: 'check', rows }, null, 2));
  const missing = REQUIRED_ENV.filter((key) => !config[key]);
  if (missing.length) {
    console.error(`缺少必要設定：${missing.join(', ')}`);
    process.exitCode = 2;
  }
}

function taipeiDate(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function escapeSqlString(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function campaignNameFilter() {
  return HANSIK_CAMPAIGN_NAMES.map((name) => `'${escapeSqlString(name)}'`).join(', ');
}

async function refreshAccessToken(config) {
  const body = new URLSearchParams({
    client_id: config.GOOGLE_ADS_CLIENT_ID,
    client_secret: config.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: config.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`OAuth token refresh failed: ${response.status} ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

function assertReady(config) {
  const missing = REQUIRED_ENV.filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(`缺少必要設定：${missing.join(', ')}`);
  }
}

function assertAllPaused(operations) {
  const text = JSON.stringify(operations);
  if (/"status"\s*:\s*"ENABLED"/.test(text) || /"status"\s*:\s*"ACTIVE"/.test(text)) {
    throw new Error('安全阻擋：mutate operations 含 ENABLED/ACTIVE 狀態。');
  }
}

function stripInternalKeys(value) {
  if (Array.isArray(value)) return value.map(stripInternalKeys);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === 'unresolved' || key === 'note') continue;
    if (key === 'displayUrl') continue;
    result[key] = stripInternalKeys(child);
  }
  return result;
}

function replaceConstants(operations, config) {
  const json = JSON.stringify(operations)
    .replaceAll('NEEDS_GOOGLE_ADS_API_RESOLUTION', '__NEEDS_CONSTANT__');
  const parsed = JSON.parse(json);

  for (const operation of parsed) {
    const create = operation.campaignCriterionOperation?.create;
    if (create?.location?.geoTargetConstant === '__NEEDS_CONSTANT__') {
      create.location.geoTargetConstant = config.GOOGLE_ADS_GEO_TARGET_CONSTANT || '__NEEDS_CONSTANT__';
    }
    if (create?.language?.languageConstant === '__NEEDS_CONSTANT__') {
      create.language.languageConstant =
        config.GOOGLE_ADS_LANGUAGE_CONSTANT || '__NEEDS_CONSTANT__';
    }
  }

  const unresolved = JSON.stringify(parsed).includes('__NEEDS_CONSTANT__');
  if (unresolved) {
    throw new Error(
      '缺少 GOOGLE_ADS_GEO_TARGET_CONSTANT 或 GOOGLE_ADS_LANGUAGE_CONSTANT，無法送 validateOnly。'
    );
  }
  return parsed;
}

async function googleAdsRequest({ config, accessToken, path, body }) {
  const version = config.GOOGLE_ADS_API_VERSION || 'v22';
  const url = `https://googleads.googleapis.com/${version}/${path}`;
  const headers = {
    'content-type': 'application/json',
    'developer-token': config.GOOGLE_ADS_DEVELOPER_TOKEN,
    authorization: `Bearer ${accessToken}`
  };
  if (config.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    headers['login-customer-id'] = String(config.GOOGLE_ADS_LOGIN_CUSTOMER_ID).replaceAll('-', '');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, json };
}

async function checkAccess(config) {
  assertReady(config);
  const accessToken = await refreshAccessToken(config);
  const customerId = String(config.GOOGLE_ADS_CUSTOMER_ID).replaceAll('-', '');
  const result = await googleAdsRequest({
    config,
    accessToken,
    path: `customers/${customerId}/googleAds:searchStream`,
    body: {
      query:
        'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1'
    }
  });
  console.log(JSON.stringify({ mode: 'check-access', ok: result.ok, status: result.status, result: result.json }, null, 2));
  if (!result.ok) process.exitCode = 1;
}

async function runSearch(config, query) {
  assertReady(config);
  const accessToken = await refreshAccessToken(config);
  const customerId = String(config.GOOGLE_ADS_CUSTOMER_ID).replaceAll('-', '');
  return googleAdsRequest({
    config,
    accessToken,
    path: `customers/${customerId}/googleAds:searchStream`,
    body: { query }
  });
}

async function mutateCustomer(config, body) {
  assertReady(config);
  const accessToken = await refreshAccessToken(config);
  const customerId = String(config.GOOGLE_ADS_CUSTOMER_ID).replaceAll('-', '');
  return googleAdsRequest({
    config,
    accessToken,
    path: `customers/${customerId}/googleAds:mutate`,
    body
  });
}

async function lookupConstants(config) {
  const languageQuery =
    "SELECT language_constant.resource_name, language_constant.id, language_constant.name, language_constant.code FROM language_constant WHERE language_constant.name LIKE '%Chinese%'";
  const geoQuery =
    "SELECT geo_target_constant.resource_name, geo_target_constant.id, geo_target_constant.name, geo_target_constant.country_code, geo_target_constant.target_type, geo_target_constant.status FROM geo_target_constant WHERE geo_target_constant.name LIKE '%Tainan%'";
  const [language, geo] = await Promise.all([
    runSearch(config, languageQuery),
    runSearch(config, geoQuery)
  ]);
  console.log(JSON.stringify({ mode: 'lookup-constants', language, geo }, null, 2));
  if (!language.ok || !geo.ok) process.exitCode = 1;
}

function flattenSearchStream(json) {
  if (!Array.isArray(json)) return [];
  return json.flatMap((chunk) => chunk.results || []);
}

function pickLanguageConstant(languageJson) {
  const rows = flattenSearchStream(languageJson);
  return (
    rows.find((row) => row.languageConstant?.code === 'zh-TW') ||
    rows.find((row) => /traditional/i.test(row.languageConstant?.name || '')) ||
    rows.find((row) => row.languageConstant?.id === '1018') ||
    rows.find((row) => /Chinese/i.test(row.languageConstant?.name || ''))
  )?.languageConstant;
}

function pickGeoTargetConstant(geoJson) {
  const rows = flattenSearchStream(geoJson);
  return (
    rows.find(
      (row) =>
        row.geoTargetConstant?.countryCode === 'TW' &&
        row.geoTargetConstant?.status === 'ENABLED' &&
        /Tainan/i.test(row.geoTargetConstant?.name || '') &&
        /City|Municipality/i.test(row.geoTargetConstant?.targetType || '')
    ) ||
    rows.find(
      (row) =>
        row.geoTargetConstant?.countryCode === 'TW' &&
        row.geoTargetConstant?.status === 'ENABLED' &&
        /Tainan/i.test(row.geoTargetConstant?.name || '')
    )
  )?.geoTargetConstant;
}

async function resolveConstants(config) {
  assertReady(config);
  const languageQuery =
    "SELECT language_constant.resource_name, language_constant.id, language_constant.name, language_constant.code FROM language_constant WHERE language_constant.name LIKE '%Chinese%'";
  const geoQuery =
    "SELECT geo_target_constant.resource_name, geo_target_constant.id, geo_target_constant.name, geo_target_constant.country_code, geo_target_constant.target_type, geo_target_constant.status FROM geo_target_constant WHERE geo_target_constant.name LIKE '%Tainan%'";
  const [language, geo] = await Promise.all([
    runSearch(config, languageQuery),
    runSearch(config, geoQuery)
  ]);
  if (!language.ok || !geo.ok) {
    console.log(JSON.stringify({ mode: 'resolve-constants', ok: false, language, geo }, null, 2));
    process.exitCode = 1;
    return;
  }
  const languageConstant = pickLanguageConstant(language.json);
  const geoTargetConstant = pickGeoTargetConstant(geo.json);
  if (!languageConstant?.resourceName || !geoTargetConstant?.resourceName) {
    console.log(
      JSON.stringify(
        {
          mode: 'resolve-constants',
          ok: false,
          message: '找不到可自動判定的語言或地區常數，請查看 lookup-constants 輸出。',
          picked: { languageConstant, geoTargetConstant }
        },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }
  upsertEnvFile(ROOT_ENV_PATH, {
    GOOGLE_ADS_LANGUAGE_CONSTANT: languageConstant.resourceName,
    GOOGLE_ADS_GEO_TARGET_CONSTANT: geoTargetConstant.resourceName
  });
  console.log(
    JSON.stringify(
      {
        mode: 'resolve-constants',
        ok: true,
        wrote: {
          GOOGLE_ADS_LANGUAGE_CONSTANT: languageConstant.resourceName,
          GOOGLE_ADS_GEO_TARGET_CONSTANT: geoTargetConstant.resourceName
        },
        picked: { languageConstant, geoTargetConstant }
      },
      null,
      2
    )
  );
}

async function validatePreview(config) {
  assertReady(config);
  const previewPath = process.argv[3] ? resolve(process.argv[3]) : DEFAULT_PREVIEW;
  const preview = JSON.parse(readFileSync(previewPath, 'utf8'));
  const customerId = String(config.GOOGLE_ADS_CUSTOMER_ID || preview.mutateRequestPreview.customerId).replaceAll('-', '');
  const operations = replaceConstants(preview.mutateRequestPreview.mutateOperations, config);
  assertAllPaused(operations);
  const accessToken = await refreshAccessToken(config);
  const request = {
    customerId,
    partialFailure: false,
    validateOnly: true,
    responseContentType: 'MUTABLE_RESOURCE',
    mutateOperations: stripInternalKeys(operations)
  };
  const result = await googleAdsRequest({
    config,
    accessToken,
    path: `customers/${customerId}/googleAds:mutate`,
    body: request
  });
  console.log(JSON.stringify({ mode: 'validate-preview', previewPath, ok: result.ok, status: result.status, result: result.json }, null, 2));
  if (!result.ok) process.exitCode = 1;
}

async function createPaused(config) {
  assertReady(config);
  const previewPath = process.argv[3] ? resolve(process.argv[3]) : DEFAULT_PREVIEW;
  const preview = JSON.parse(readFileSync(previewPath, 'utf8'));
  const customerId = String(config.GOOGLE_ADS_CUSTOMER_ID || preview.mutateRequestPreview.customerId).replaceAll('-', '');
  const operations = replaceConstants(preview.mutateRequestPreview.mutateOperations, config);
  assertAllPaused(operations);
  const accessToken = await refreshAccessToken(config);
  const request = {
    customerId,
    partialFailure: false,
    validateOnly: false,
    responseContentType: 'MUTABLE_RESOURCE',
    mutateOperations: stripInternalKeys(operations)
  };
  const result = await googleAdsRequest({
    config,
    accessToken,
    path: `customers/${customerId}/googleAds:mutate`,
    body: request
  });
  const outputPath = previewPath.replace(/\.json$/, '_created-response.json');
  writeFileSync(
    outputPath,
    JSON.stringify(
      {
        mode: 'create-paused',
        createdAt: new Date().toISOString(),
        previewPath,
        ok: result.ok,
        status: result.status,
        result: result.json
      },
      null,
      2
    )
  );
  console.log(JSON.stringify({ mode: 'create-paused', previewPath, outputPath, ok: result.ok, status: result.status, result: result.json }, null, 2));
  if (!result.ok) process.exitCode = 1;
}

function rowsFromSearchStream(json) {
  return Array.isArray(json) ? json.flatMap((chunk) => chunk.results || []) : [];
}

async function getHansikCampaignRows(config) {
  const query = `
    SELECT
      campaign.resource_name,
      campaign.id,
      campaign.name,
      campaign.status,
      campaign_budget.amount_micros
    FROM campaign
    WHERE campaign.name IN (${campaignNameFilter()})
    ORDER BY campaign.name
  `;
  const result = await runSearch(config, query);
  if (!result.ok) {
    throw new Error(`查詢韓食日常 Campaign 失敗：${result.status} ${JSON.stringify(result.json)}`);
  }
  return rowsFromSearchStream(result.json);
}

async function enableHansik(config) {
  const rows = await getHansikCampaignRows(config);
  const foundNames = new Set(rows.map((row) => row.campaign?.name));
  const missing = HANSIK_CAMPAIGN_NAMES.filter((name) => !foundNames.has(name));
  if (missing.length) {
    throw new Error(`安全阻擋：找不到指定 Campaign：${missing.join(', ')}`);
  }
  const unexpected = rows.filter((row) => !HANSIK_CAMPAIGN_NAMES.includes(row.campaign?.name));
  if (unexpected.length) {
    throw new Error('安全阻擋：查詢結果含非指定 Campaign。');
  }
  const operations = rows.map((row) => ({
    campaignOperation: {
      update: {
        resourceName: row.campaign.resourceName,
        status: 'ENABLED'
      },
      updateMask: 'status'
    }
  }));
  const customerId = String(config.GOOGLE_ADS_CUSTOMER_ID).replaceAll('-', '');
  const result = await mutateCustomer(config, {
    customerId,
    partialFailure: false,
    validateOnly: false,
    responseContentType: 'MUTABLE_RESOURCE',
    mutateOperations: operations
  });
  const outputPath = resolve(
    ROOT,
    `Ewalk.ai Brain/01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動/${taipeiDate()}_GoogleAds_啟用回應.json`
  );
  writeFileSync(
    outputPath,
    JSON.stringify(
      {
        mode: 'enable-hansik',
        enabledAt: new Date().toISOString(),
        ok: result.ok,
        status: result.status,
        before: rows.map((row) => ({
          name: row.campaign?.name,
          resourceName: row.campaign?.resourceName,
          status: row.campaign?.status,
          dailyBudgetTwd: Number(row.campaignBudget?.amountMicros || 0) / 1_000_000
        })),
        result: result.json
      },
      null,
      2
    )
  );
  console.log(JSON.stringify({ mode: 'enable-hansik', ok: result.ok, status: result.status, outputPath, result: result.json }, null, 2));
  if (!result.ok) process.exitCode = 1;
}

function formatNumber(value, digits = 0) {
  const number = Number(value || 0);
  return number.toLocaleString('zh-TW', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  });
}

function metricRowsFromReport(json) {
  return rowsFromSearchStream(json).map((row) => {
    const metrics = row.metrics || {};
    return {
      date: row.segments?.date || '',
      campaign: row.campaign?.name || '',
      status: row.campaign?.status || '',
      budgetTwd: Number(row.campaignBudget?.amountMicros || 0) / 1_000_000,
      impressions: Number(metrics.impressions || 0),
      clicks: Number(metrics.clicks || 0),
      costTwd: Number(metrics.costMicros || 0) / 1_000_000,
      ctr: Number(metrics.ctr || 0),
      averageCpcTwd: Number(metrics.averageCpc || 0) / 1_000_000
    };
  });
}

function buildReportMarkdown({ date, rows }) {
  const totals = rows.reduce(
    (sum, row) => {
      sum.impressions += row.impressions;
      sum.clicks += row.clicks;
      sum.costTwd += row.costTwd;
      return sum;
    },
    { impressions: 0, clicks: 0, costTwd: 0 }
  );
  const ctr = totals.impressions ? totals.clicks / totals.impressions : 0;
  const averageCpc = totals.clicks ? totals.costTwd / totals.clicks : 0;
  const lines = [];
  lines.push(`---`);
  lines.push(`類型: Google Ads 日報`);
  lines.push(`客戶: 韓食日常鍋物`);
  lines.push(`日期: ${date}`);
  lines.push(`標籤:`);
  lines.push(`  - GoogleAds`);
  lines.push(`  - 日報`);
  lines.push(`  - 韓食日常鍋物`);
  lines.push(`---`);
  lines.push('');
  lines.push(`# 韓食日常鍋物｜Google Ads 日報｜${date}`);
  lines.push('');
  lines.push(`## 總覽`);
  lines.push('');
  lines.push(`| 指標 | 數值 |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| 花費 | NT$${formatNumber(totals.costTwd, 0)} |`);
  lines.push(`| 曝光 | ${formatNumber(totals.impressions)} |`);
  lines.push(`| 點擊 | ${formatNumber(totals.clicks)} |`);
  lines.push(`| CTR | ${(ctr * 100).toFixed(2)}% |`);
  lines.push(`| 平均 CPC | NT$${formatNumber(averageCpc, 1)} |`);
  lines.push('');
  lines.push(`## Campaign 明細`);
  lines.push('');
  lines.push(`| Campaign | 狀態 | 日預算 | 花費 | 曝光 | 點擊 | CTR | 平均 CPC |`);
  lines.push(`| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |`);
  for (const row of rows) {
    lines.push(
      `| ${row.campaign} | ${row.status} | NT$${formatNumber(row.budgetTwd, 0)} | NT$${formatNumber(row.costTwd, 0)} | ${formatNumber(row.impressions)} | ${formatNumber(row.clicks)} | ${(row.ctr * 100).toFixed(2)}% | NT$${formatNumber(row.averageCpcTwd, 1)} |`
    );
  }
  lines.push('');
  lines.push(`## 阿順初步判斷`);
  lines.push('');
  if (totals.impressions === 0) {
    lines.push(`- 今日尚未累積曝光，通常剛啟用後需要等待 Google Ads 審核與投放學習。`);
  } else if (totals.clicks === 0) {
    lines.push(`- 已有曝光但尚未有點擊，明日需觀察 CTR；若仍低於 2%，優先檢查關鍵字與文案吸引力。`);
  } else {
    lines.push(`- 已開始累積點擊，先觀察 48 小時再判斷是否調整預算或關鍵字。`);
  }
  if (totals.costTwd > 0 && totals.costTwd < 80) {
    lines.push(`- 花費速度偏保守，若 2 天後仍花不出去，再考慮放寬關鍵字或加碼主 Campaign。`);
  }
  lines.push(`- 任何預算提高、關鍵字大幅調整或啟停變更，需提姆先生批准後執行。`);
  lines.push('');
  return lines.join('\n');
}

async function reportHansik(config) {
  const date = process.argv[3] || taipeiDate();
  const query = `
    SELECT
      segments.date,
      campaign.name,
      campaign.status,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.ctr,
      metrics.average_cpc
    FROM campaign
    WHERE campaign.name IN (${campaignNameFilter()})
      AND segments.date = '${escapeSqlString(date)}'
    ORDER BY campaign.name
  `;
  const result = await runSearch(config, query);
  if (!result.ok) {
    console.log(JSON.stringify({ mode: 'report-hansik', ok: false, status: result.status, result: result.json }, null, 2));
    process.exitCode = 1;
    return;
  }
  const rows = metricRowsFromReport(result.json);
  mkdirSync(HANSIK_REPORT_DIR, { recursive: true });
  const outputPath = resolve(HANSIK_REPORT_DIR, `${date}_GoogleAds日報.md`);
  writeFileSync(outputPath, buildReportMarkdown({ date, rows }));
  console.log(JSON.stringify({ mode: 'report-hansik', ok: true, date, outputPath, rows }, null, 2));
}

const mode = process.argv[2] || 'check';
const config = loadConfig();

try {
  if (mode === 'check') {
    printEnvStatus(config);
  } else if (mode === 'check-access') {
    await checkAccess(config);
  } else if (mode === 'lookup-constants') {
    await lookupConstants(config);
  } else if (mode === 'resolve-constants') {
    await resolveConstants(config);
  } else if (mode === 'validate-preview') {
    await validatePreview(config);
  } else if (mode === 'create-paused') {
    await createPaused(config);
  } else if (mode === 'enable-hansik') {
    await enableHansik(config);
  } else if (mode === 'report-hansik') {
    await reportHansik(config);
  } else {
    console.error('用法：node google-ads-api-runner.mjs <check|check-access|lookup-constants|resolve-constants|validate-preview|create-paused|enable-hansik|report-hansik>');
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
