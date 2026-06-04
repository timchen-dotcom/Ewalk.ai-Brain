import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_FILE = fileURLToPath(import.meta.url);
const CURRENT_DIR = path.dirname(CURRENT_FILE);
const SCRIPT_ROOT = path.resolve(CURRENT_DIR, '..');

export function getScriptRoot() {
  return SCRIPT_ROOT;
}

export function loadEnv(baseDir = SCRIPT_ROOT) {
  const values = {};
  const candidates = [
    path.join(baseDir, '.env'),
    path.join(baseDir, '.env.local'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
  ];

  for (const filePath of unique(candidates)) {
    if (!fs.existsSync(filePath)) continue;
    Object.assign(values, parseEnvFile(fs.readFileSync(filePath, 'utf8')));
  }

  return {
    ...values,
    ...process.env,
  };
}

export function readRequiredEnv(env, key, hint) {
  const value = env[key];
  if (typeof value === 'string' && value.trim()) return value.trim();

  const suffix = hint ? `\n${hint}` : '';
  throw new Error(`缺少必要環境變數：${key}${suffix}`);
}

export function readRequiredSecretEnv(env, key, hint) {
  const value = sanitizeSecret(readRequiredEnv(env, key, hint));

  if (isPlaceholderSecret(value)) {
    throw new Error(`${key} 目前看起來是範例值，請改用有效的本機環境變數。`);
  }

  validateSecretShape(key, value);

  return value;
}

export function readGraphConfig(env) {
  return {
    apiBase: (env.META_GRAPH_BASE_URL || 'https://graph.facebook.com').replace(/\/+$/, ''),
    graphVersion: env.META_GRAPH_VERSION || 'v25.0',
  };
}

export function readTextFile(filePath) {
  const resolved = path.resolve(filePath);
  return fs.readFileSync(resolved, 'utf8').trim();
}

export function previewText(text, limit = 120) {
  const compact = String(text).replace(/\s+/g, ' ').trim();
  if (compact.length <= limit) return compact;
  return `${compact.slice(0, limit)}...`;
}

export function printCliError(error) {
  console.error(`失敗：${redactSensitiveText(error.message)}`);

  if (error.status) console.error(`HTTP 狀態：${error.status}`);
  if (error.metaMessage) console.error(`Meta 訊息：${redactSensitiveText(error.metaMessage)}`);
  if (error.metaCode) console.error(`Meta 錯誤碼：${error.metaCode}`);
  if (error.metaSubcode) console.error(`Meta 子錯誤碼：${error.metaSubcode}`);
  if (error.metaType) console.error(`Meta 類型：${error.metaType}`);
  if (error.metaErrorData) console.error(`Meta 參數細節：${redactSensitiveText(JSON.stringify(error.metaErrorData))}`);
  if (error.metaUserTitle) console.error(`Meta 提示標題：${redactSensitiveText(error.metaUserTitle)}`);
  if (error.metaUserMessage) console.error(`Meta 提示內容：${redactSensitiveText(error.metaUserMessage)}`);
  if (error.metaTraceId) console.error(`Meta Trace ID：${error.metaTraceId}`);

  process.exitCode = 1;
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

    if (!key) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value.replace(/\\n/g, '\n');
  }

  return values;
}

function unique(items) {
  return [...new Set(items)];
}

function isPlaceholderSecret(value) {
  return /goes_here|your_|example|placeholder/i.test(value);
}

function sanitizeSecret(value) {
  return value
    .replace(/\x1B\[[0-9;?]*[A-Za-z]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

function validateSecretShape(key, value) {
  if (key !== 'META_PAGE_ACCESS_TOKEN') return;

  if (/[\[\]]/.test(value)) {
    throw new Error(`${key} 含有看起來像方向鍵或終端機控制碼的字元，請重新執行 set-page-token.command，只貼一次 token。`);
  }

  const repeatedPrefixCount = (value.match(/EAA/g) || []).length;
  if (repeatedPrefixCount > 1) {
    throw new Error(`${key} 看起來被貼了超過一次，請重新執行 set-page-token.command，只貼一次 token。`);
  }
}

function redactSensitiveText(text) {
  return String(text)
    .replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED_TOKEN]')
    .replace(/EAA[^\s"',}]+/g, '[REDACTED_META_TOKEN]')
    .replace(/access_token=[^&\s]+/gi, 'access_token=[REDACTED]');
}
