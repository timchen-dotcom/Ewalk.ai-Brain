#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '../../..');
const envPath = path.join(root, '.env.local');
const statePath = path.join(scriptDir, '.google-ads-secret-input-url');
const nonce = crypto.randomBytes(18).toString('hex');
const oauthStates = new Set();

function sanitize(value) {
  return String(value || '')
    .replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();
}

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

function upsertEnv(key, value) {
  if (!value) return;
  fs.mkdirSync(path.dirname(envPath), { recursive: true });
  if (!fs.existsSync(envPath)) fs.writeFileSync(envPath, '', { mode: 0o600 });
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) next.push(`${key}=${value}`);
  fs.writeFileSync(envPath, `${next.filter(Boolean).join('\n')}\n`, { mode: 0o600 });
}

function has(key) {
  return Boolean(loadEnv()[key]);
}

function page({ message = '', error = '' } = {}) {
  const env = loadEnv();
  const authReady = env.GOOGLE_ADS_CLIENT_ID && env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshReady = env.GOOGLE_ADS_REFRESH_TOKEN;
  const checkRows = [
    ['developer token', env.GOOGLE_ADS_DEVELOPER_TOKEN],
    ['OAuth client ID', env.GOOGLE_ADS_CLIENT_ID],
    ['OAuth client secret', env.GOOGLE_ADS_CLIENT_SECRET],
    ['OAuth refresh token', env.GOOGLE_ADS_REFRESH_TOKEN],
    ['Manager CID', env.GOOGLE_ADS_LOGIN_CUSTOMER_ID],
    ['Customer CID', env.GOOGLE_ADS_CUSTOMER_ID],
    ['Geo constant', env.GOOGLE_ADS_GEO_TARGET_CONSTANT],
    ['Language constant', env.GOOGLE_ADS_LANGUAGE_CONSTANT]
  ];
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Google Ads API 安全設定</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif;margin:0;background:#f6f7f9;color:#111827}
    main{max-width:780px;margin:40px auto;padding:30px;background:#fff;border:1px solid #e5e7eb;border-radius:8px}
    h1{font-size:24px;margin:0 0 8px}
    h2{font-size:18px;margin:28px 0 12px}
    p{line-height:1.7;color:#374151}
    label{display:block;font-weight:700;margin:18px 0 8px}
    input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:6px;font:14px ui-monospace,SFMono-Regular,Menlo,monospace}
    button,.button{display:inline-block;margin-top:18px;background:#0f3b63;color:white;border:0;border-radius:6px;padding:12px 18px;font-weight:700;cursor:pointer;text-decoration:none}
    .secondary{background:#334155}
    .note{background:#fff7ed;border:1px solid #fed7aa;color:#7c2d12;padding:12px;border-radius:6px}
    .ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:12px;border-radius:6px}
    .error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:12px;border-radius:6px}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    td{border-bottom:1px solid #e5e7eb;padding:8px}
    td:last-child{text-align:right;font-weight:700}
    .done{color:#047857}.missing{color:#b45309}
  </style>
</head>
<body>
<main>
  <h1>Google Ads API 安全設定</h1>
  <p class="note">資料只會寫入本機 <code>.env.local</code>。請不要把 token 或 secret 貼到聊天。</p>
  ${message ? `<div class="ok">${message}</div>` : ''}
  ${error ? `<div class="error">${error}</div>` : ''}

  <h2>目前狀態</h2>
  <table>
    ${checkRows
      .map(
        ([label, value]) =>
          `<tr><td>${label}</td><td class="${value ? 'done' : 'missing'}">${value ? '已設定' : '待補'}</td></tr>`
      )
      .join('')}
  </table>

  <h2>1. 寫入憑證</h2>
  <form method="post" action="/save">
    <input type="hidden" name="nonce" value="${nonce}">
    <label>Google Ads developer token</label>
    <input name="GOOGLE_ADS_DEVELOPER_TOKEN" autocomplete="off" spellcheck="false" placeholder="可留空保留既有值">
    <label>OAuth client ID</label>
    <input name="GOOGLE_ADS_CLIENT_ID" autocomplete="off" spellcheck="false" placeholder="可留空保留既有值">
    <label>OAuth client secret</label>
    <input name="GOOGLE_ADS_CLIENT_SECRET" autocomplete="off" spellcheck="false" placeholder="可留空保留既有值">
    <label>OAuth refresh token（如果還沒有，可先留空，下面會產生 Google 授權）</label>
    <input name="GOOGLE_ADS_REFRESH_TOKEN" autocomplete="off" spellcheck="false" placeholder="可留空保留既有值">
    <label>Manager account CID</label>
    <input name="GOOGLE_ADS_LOGIN_CUSTOMER_ID" value="${env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '7563161776'}">
    <label>投放帳戶 CID</label>
    <input name="GOOGLE_ADS_CUSTOMER_ID" value="${env.GOOGLE_ADS_CUSTOMER_ID || '7287266360'}">
    <label>臺南市 geoTargetConstant（可先留空，稍後由 API 查）</label>
    <input name="GOOGLE_ADS_GEO_TARGET_CONSTANT" value="${env.GOOGLE_ADS_GEO_TARGET_CONSTANT || ''}" placeholder="geoTargetConstants/xxxx">
    <label>繁體中文 languageConstant（可先留空，稍後由 API 查）</label>
    <input name="GOOGLE_ADS_LANGUAGE_CONSTANT" value="${env.GOOGLE_ADS_LANGUAGE_CONSTANT || ''}" placeholder="languageConstants/xxxx">
    <button type="submit">安全寫入本機</button>
  </form>

  <h2>2. 取得 refresh token</h2>
  ${
    refreshReady
      ? '<p class="ok">refresh token 已設定。可以回 Codex 讓阿順繼續檢查 API。</p>'
      : authReady
        ? `<p>OAuth client 已設定，可進行 Google 授權。授權 scope：<code>https://www.googleapis.com/auth/adwords</code></p><a class="button secondary" href="/oauth/start?k=${nonce}">開啟 Google OAuth 授權</a>`
        : '<p class="note">請先寫入 OAuth client ID / secret，再回到本頁開啟 Google OAuth 授權。</p>'
  }
</main>
</body>
</html>`;
}

function parseBody(body) {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params.entries());
}

async function exchangeCode(code, redirectUri) {
  const env = loadEnv();
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_ADS_CLIENT_ID,
    client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.refresh_token) {
    throw new Error(`OAuth token exchange failed: ${response.status} ${JSON.stringify(json)}`);
  }
  return json.refresh_token;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  const port = server.address()?.port;
  const redirectUri = `http://127.0.0.1:${port}/oauth/callback`;

  if (req.method === 'GET' && url.pathname === '/' && url.searchParams.get('k') === nonce) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(page());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/save') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 50000) req.destroy();
    });
    req.on('end', () => {
      const input = parseBody(body);
      if (input.nonce !== nonce) {
        res.writeHead(403, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(page({ error: '安全碼不符，沒有寫入。' }));
        return;
      }
      for (const key of [
        'GOOGLE_ADS_DEVELOPER_TOKEN',
        'GOOGLE_ADS_CLIENT_ID',
        'GOOGLE_ADS_CLIENT_SECRET',
        'GOOGLE_ADS_REFRESH_TOKEN',
        'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
        'GOOGLE_ADS_CUSTOMER_ID',
        'GOOGLE_ADS_GEO_TARGET_CONSTANT',
        'GOOGLE_ADS_LANGUAGE_CONSTANT'
      ]) {
        upsertEnv(key, sanitize(input[key]));
      }
      upsertEnv('GOOGLE_ADS_API_VERSION', 'v22');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(page({ message: '已安全寫入本機設定。' }));
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/oauth/start' && url.searchParams.get('k') === nonce) {
    const env = loadEnv();
    if (!env.GOOGLE_ADS_CLIENT_ID || !env.GOOGLE_ADS_CLIENT_SECRET) {
      res.writeHead(400, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(page({ error: '請先設定 OAuth client ID / secret。' }));
      return;
    }
    const state = crypto.randomBytes(18).toString('hex');
    oauthStates.add(state);
    const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    auth.searchParams.set('client_id', env.GOOGLE_ADS_CLIENT_ID);
    auth.searchParams.set('redirect_uri', redirectUri);
    auth.searchParams.set('response_type', 'code');
    auth.searchParams.set('scope', 'https://www.googleapis.com/auth/adwords');
    auth.searchParams.set('access_type', 'offline');
    auth.searchParams.set('prompt', 'consent');
    auth.searchParams.set('state', state);
    res.writeHead(302, { location: auth.toString(), 'cache-control': 'no-store' });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/oauth/callback') {
    const state = url.searchParams.get('state') || '';
    const code = url.searchParams.get('code') || '';
    if (!state || !oauthStates.has(state) || !code) {
      res.writeHead(400, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(page({ error: 'Google OAuth 回傳資料不完整，沒有寫入。' }));
      return;
    }
    oauthStates.delete(state);
    exchangeCode(code, redirectUri)
      .then((refreshToken) => {
        upsertEnv('GOOGLE_ADS_REFRESH_TOKEN', refreshToken);
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(page({ message: 'refresh token 已安全寫入。可以回 Codex 跟阿順說：設定好了。' }));
      })
      .catch((error) => {
        res.writeHead(500, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(page({ error: error.message }));
      });
    return;
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/?k=${nonce}`;
  fs.writeFileSync(statePath, `${url}\n`, { mode: 0o600 });
  console.log(url);
});

setTimeout(() => {
  try {
    server.close();
  } catch {
    // Server was already closed or still serving OAuth callback.
  }
}, 45 * 60 * 1000);
