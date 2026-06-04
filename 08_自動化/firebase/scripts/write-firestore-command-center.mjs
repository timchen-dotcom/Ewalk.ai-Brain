#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const vaultRoot = resolve(scriptDir, "../../..");
const projectRoot = resolve(vaultRoot, "..");
const defaultConfigPath = resolve(scriptDir, "../config/clients/hansik-daily-hotpot.json");
const defaultFirebaseAuthPath = resolve(projectRoot, ".firebase-home/.config/configstore/firebase-tools.json");
const expectedProjectId = "ewalk-ai-system-prod";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (key?.startsWith("--")) {
    if (!value || value.startsWith("--")) {
      args.set(key, "true");
    } else {
      args.set(key, value);
      index += 1;
    }
  }
}

function requiredArg(name) {
  const value = args.get(name);
  if (!value || value === "true") throw new Error(`缺少必要參數：${name}`);
  return value;
}

function workspacePath(value) {
  if (!value) return null;
  return isAbsolute(value) ? value : resolve(vaultRoot, value);
}

function toRelativePath(value) {
  if (!value || typeof value !== "string") return value;
  if (!isAbsolute(value)) return value;
  if (value.startsWith(vaultRoot)) return relative(vaultRoot, value);
  if (value.startsWith(projectRoot)) return relative(projectRoot, value);
  return `local_pending_upload:${value.split("/").pop()}`;
}

function isIsoLike(value) {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") {
    if (isIsoLike(value)) return { timestampValue: new Date(value).toISOString() };
    return { stringValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((item) => firestoreValue(item)) } };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, child]) => [key, firestoreValue(child)]),
        ),
      },
    };
  }
  return { stringValue: String(value) };
}

function documentBody(data) {
  return {
    fields: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, firestoreValue(value)]),
    ),
  };
}

function curlJson(url, { method = "GET", headers = {}, body = null } = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const args = ["-sS", "-w", "\n%{http_code}", "-X", method];
    for (const [key, value] of Object.entries(headers)) {
      args.push("-H", `${key}: ${value}`);
    }
    if (body !== null) args.push("--data-binary", "@-");
    args.push(url);

    const child = spawn("curl", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code !== 0) {
        rejectPromise(new Error(stderr || `curl failed with exit code ${code}`));
        return;
      }
      const marker = stdout.lastIndexOf("\n");
      const text = marker >= 0 ? stdout.slice(0, marker) : "";
      const status = Number(stdout.slice(marker + 1));
      let parsed = null;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { raw: text };
        }
      }
      if (status < 200 || status >= 300) {
        const message = parsed?.error?.message || parsed?.raw || stderr || `HTTP ${status}`;
        rejectPromise(new Error(`${status} ${message}`));
        return;
      }
      resolvePromise(parsed);
    });
    if (body !== null) child.stdin.end(body);
    else child.stdin.end();
  });
}

async function requestJson(url, options = {}) {
  const body = await curlJson(url, {
    method: options.method || "GET",
    headers: options.headers || {},
    body: options.body ?? null,
  });
  return body;
}

async function accessToken() {
  const auth = JSON.parse(await readFile(defaultFirebaseAuthPath, "utf8"));
  const tokens = auth.tokens || {};
  if (tokens.access_token && tokens.expires_at && Number(tokens.expires_at) > Date.now() + 60_000) {
    return tokens.access_token;
  }
  if (!tokens.refresh_token) {
    throw new Error("Firebase CLI 尚未登入，缺少 refresh token。");
  }

  const params = new URLSearchParams({
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  });

  const refreshed = await requestJson("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!refreshed.access_token) throw new Error("無法更新 Firebase 登入 token。");
  return refreshed.access_token;
}

async function writeDocument({ projectId, token, collection, id, data }) {
  const path = `${collection}/${encodeURIComponent(id)}`;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`;
  await requestJson(url, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(documentBody(data)),
  });
}

async function readDocument({ projectId, token, collection, id }) {
  const path = `${collection}/${encodeURIComponent(id)}`;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`;
  return requestJson(url, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` },
  });
}

const projectId = requiredArg("--confirm-project");
const approvedBy = requiredArg("--approved-by");
const shouldWrite = args.has("--write");

if (projectId !== expectedProjectId) {
  throw new Error(`專案確認失敗：收到 ${projectId}，預期 ${expectedProjectId}`);
}
if (approvedBy !== "提姆先生") {
  throw new Error("正式寫入必須由提姆先生批准。");
}
if (!shouldWrite) {
  throw new Error("正式寫入需要加上 --write。");
}

const configPath = resolve(args.get("--config") || defaultConfigPath);
const config = JSON.parse(await readFile(configPath, "utf8"));
const contentPath = workspacePath(config.content_queue_output);
const followupsPath = workspacePath(config.performance_followups_output);
const content = JSON.parse(await readFile(contentPath, "utf8"));
const followups = JSON.parse(await readFile(followupsPath, "utf8"));
const syncedAt = new Date().toISOString();

const docs = [];
docs.push({
  collection: "clients",
  id: config.client_id,
  data: {
    id: config.client_id,
    name: config.client_name,
    status: "active",
    sample_client: true,
    command_center_enabled: true,
    source_config: toRelativePath(configPath),
    updated_at: syncedAt,
    updated_by: "ashun",
  },
});

for (const item of Object.values(content.documents || {})) {
  docs.push({
    collection: "content_queue",
    id: item.id,
    data: {
      ...item,
      source_file: toRelativePath(item.source_file),
      asset_refs: (item.asset_refs || []).map(toRelativePath),
      firebase_synced_at: syncedAt,
      firebase_sync_mode: "approved_formal_write",
      updated_at: syncedAt,
      updated_by: "ashun",
    },
  });
}

for (const item of Object.values(followups.followups || {})) {
  docs.push({
    collection: "campaign_reports",
    id: item.id,
    data: {
      ...item,
      firebase_synced_at: syncedAt,
      firebase_sync_mode: "approved_formal_write",
      updated_at: syncedAt,
      updated_by: "ashun",
    },
  });
}

const auditId = `firebase-sync-${syncedAt.replace(/\D/g, "").slice(0, 14)}`;
docs.push({
  collection: "audit_logs",
  id: auditId,
  data: {
    id: auditId,
    action: "firestore_command_center_sync",
    client_id: config.client_id,
    approved_by: approvedBy,
    performed_by: "ashun",
    project_id: projectId,
    source_config: toRelativePath(configPath),
    content_queue_count: Object.keys(content.documents || {}).length,
    campaign_reports_count: Object.keys(followups.followups || {}).length,
    created_at: syncedAt,
  },
});

function firestoreDocumentName(projectIdValue, collection, id) {
  return `projects/${projectIdValue}/databases/(default)/documents/${collection}/${id}`;
}

async function prepareCurlBatch(dir) {
  await mkdir(dir, { recursive: true });
  const auth = JSON.parse(await readFile(defaultFirebaseAuthPath, "utf8"));
  const refreshToken = auth.tokens?.refresh_token;
  if (!refreshToken) throw new Error("Firebase CLI 尚未登入，缺少 refresh token。");

  const tokenParams = new URLSearchParams({
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const commit = {
    writes: docs.map((doc) => ({
      update: {
        name: firestoreDocumentName(projectId, doc.collection, doc.id),
        fields: documentBody(doc.data).fields,
      },
    })),
  };

  await writeFile(resolve(dir, "oauth-refresh-form.txt"), tokenParams.toString(), "utf8");
  await writeFile(resolve(dir, "firestore-commit.json"), `${JSON.stringify(commit, null, 2)}\n`, "utf8");
  await writeFile(resolve(dir, "manifest.json"), `${JSON.stringify({
    project_id: projectId,
    approved_by: approvedBy,
    generated_at: syncedAt,
    writes: docs.map((doc) => `${doc.collection}/${doc.id}`),
    audit_log: `audit_logs/${auditId}`,
  }, null, 2)}\n`, "utf8");

  console.log(`已產生 Firestore 寫入批次：${dir}`);
  console.log(`準備寫入：${docs.length} 筆`);
  console.log(`稽核紀錄：audit_logs/${auditId}`);
}

const prepareCurlDir = args.get("--prepare-curl-dir");
if (prepareCurlDir && prepareCurlDir !== "true") {
  await prepareCurlBatch(resolve(prepareCurlDir));
  process.exit(0);
}

const token = await accessToken();
for (const doc of docs) {
  await writeDocument({ projectId, token, ...doc });
  console.log(`已寫入：${doc.collection}/${doc.id}`);
}

await readDocument({
  projectId,
  token,
  collection: "clients",
  id: config.client_id,
});

console.log("");
console.log(`正式 Firestore 寫入完成：${docs.length} 筆`);
console.log(`Project：${projectId}`);
console.log(`批准人：${approvedBy}`);
console.log(`稽核紀錄：audit_logs/${auditId}`);
