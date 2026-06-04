#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(scriptDir, '.env.local');
const statePath = path.join(scriptDir, '.ads-token-input-url');
const nonce = crypto.randomBytes(18).toString('hex');

function sanitizeToken(value) {
  return String(value || '')
    .replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();
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
  fs.writeFileSync(envPath, `${next.filter((line, index) => line || index < next.length - 1).join('\n')}\n`, {
    mode: 0o600,
  });
}

function page(message = '') {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Meta Ads Token 安全輸入</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif;margin:0;background:#f6f7f9;color:#111827}
    main{max-width:680px;margin:48px auto;padding:32px;background:white;border:1px solid #e5e7eb;border-radius:8px}
    h1{font-size:24px;margin:0 0 8px}
    p{line-height:1.7;color:#374151}
    label{display:block;font-weight:700;margin:22px 0 8px}
    textarea{box-sizing:border-box;width:100%;min-height:150px;padding:12px;border:1px solid #cbd5e1;border-radius:6px;font:14px ui-monospace,SFMono-Regular,Menlo,monospace}
    button{margin-top:18px;background:#0f3b63;color:white;border:0;border-radius:6px;padding:12px 18px;font-weight:700;cursor:pointer}
    .note{background:#fff7ed;border:1px solid #fed7aa;color:#7c2d12;padding:12px;border-radius:6px}
    .ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:12px;border-radius:6px}
  </style>
</head>
<body>
<main>
  <h1>Meta Ads Token 安全輸入</h1>
  ${message ? `<div class="ok">${message}</div>` : '<p class="note">Token 只會寫進本機設定檔，不會顯示在聊天或文件裡。請貼上剛剛 Meta 產生的完整 Token。</p>'}
  <form method="post" action="/save">
    <input type="hidden" name="nonce" value="${nonce}">
    <label for="token">Meta Ads access token</label>
    <textarea id="token" name="token" autocomplete="off" spellcheck="false" placeholder="貼上 Token"></textarea>
    <button type="submit">安全寫入</button>
  </form>
</main>
</body>
</html>`;
}

function parseBody(body) {
  const params = new URLSearchParams(body);
  return {
    nonce: params.get('nonce') || '',
    token: sanitizeToken(params.get('token') || ''),
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (req.method === 'GET' && url.pathname === '/' && url.searchParams.get('k') === nonce) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(page());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/save') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20000) req.destroy();
    });
    req.on('end', () => {
      const input = parseBody(body);
      if (input.nonce !== nonce || !input.token || input.token.length < 80) {
        res.writeHead(400, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(page('Token 沒有寫入：請確認貼的是完整 Token。'));
        return;
      }
      upsertEnv('META_ADS_ACCESS_TOKEN', input.token);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(page('已安全寫入。可以回到 Codex 跟阿順說：設定好了。'));
      setTimeout(() => server.close(), 500);
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
    // Already closed after successful submission.
  }
}, 30 * 60 * 1000);
