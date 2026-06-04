#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const vaultRoot = resolve(scriptDir, "../../..");
const projectRoot = resolve(vaultRoot, "..");
const defaultPreviewPath = resolve(firebaseDir, "output/ai-runs-firestore-commit.preview.json");
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
  if (Array.isArray(value)) return { arrayValue: { values: value.map((item) => firestoreValue(item)) } };
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, firestoreValue(child)])),
      },
    };
  }
  return { stringValue: String(value) };
}

function documentBody(data) {
  return {
    fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, firestoreValue(value)])),
  };
}

function curlJson(url, { method = "GET", headers = {}, body = null } = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const curlArgs = ["-sS", "-w", "\n%{http_code}", "-X", method];
    for (const [key, value] of Object.entries(headers)) curlArgs.push("-H", `${key}: ${value}`);
    if (body !== null) curlArgs.push("--data-binary", "@-");
    curlArgs.push(url);

    const child = spawn("curl", curlArgs, { stdio: ["pipe", "pipe", "pipe"] });
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
  return curlJson(url, {
    method: options.method || "GET",
    headers: options.headers || {},
    body: options.body ?? null,
  });
}

async function accessToken() {
  const auth = JSON.parse(await readFile(defaultFirebaseAuthPath, "utf8"));
  const tokens = auth.tokens || {};
  if (tokens.access_token && tokens.expires_at && Number(tokens.expires_at) > Date.now() + 60_000) {
    return tokens.access_token;
  }
  if (!tokens.refresh_token) throw new Error("Firebase CLI 尚未登入，缺少 refresh token。");

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

function splitPath(path) {
  const [collection, ...idParts] = path.split("/");
  const id = idParts.join("/");
  if (!collection || !id || id.includes("/")) throw new Error(`不支援的 Firestore path：${path}`);
  return { collection, id };
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
const previewPath = resolve(args.get("--preview") || defaultPreviewPath);

if (projectId !== expectedProjectId) {
  throw new Error(`專案確認失敗：收到 ${projectId}，預期 ${expectedProjectId}`);
}
if (approvedBy !== "提姆先生") throw new Error("正式寫入必須由提姆先生批准。");
if (!shouldWrite) throw new Error("正式寫入需要加上 --write。");

const preview = JSON.parse(await readFile(previewPath, "utf8"));
if (preview.project_id !== expectedProjectId) {
  throw new Error(`preview project 不符：${preview.project_id}`);
}
if (!preview.requires_approval_before_write) {
  throw new Error("preview 缺少 requires_approval_before_write 保護欄位。");
}

const syncedAt = new Date().toISOString();
const docs = Object.entries(preview.writes || {}).map(([path, data]) => {
  const { collection, id } = splitPath(path);
  if (collection !== "ai_runs") throw new Error(`此腳本只允許寫入 ai_runs，收到：${path}`);
  return {
    collection,
    id,
    data: {
      ...data,
      firestore_synced_at: syncedAt,
      firestore_sync_mode: "approved_formal_ai_runs_write",
      approved_by: approvedBy,
      updated_at: syncedAt,
    },
  };
});

if (!docs.length) throw new Error("沒有可寫入的 ai_runs 文件。");

const auditId = `ai-runs-sync-${syncedAt.replace(/\D/g, "").slice(0, 14)}`;
docs.push({
  collection: "audit_logs",
  id: auditId,
  data: {
    id: auditId,
    action: "firestore_ai_runs_sync",
    approved_by: approvedBy,
    performed_by: "ashun",
    project_id: projectId,
    source_preview: "Ewalk.ai Brain/08_自動化/firebase/output/ai-runs-firestore-commit.preview.json",
    ai_runs_count: Object.keys(preview.writes || {}).length,
    created_at: syncedAt,
  },
});

const token = await accessToken();
for (const doc of docs) {
  await writeDocument({ projectId, token, ...doc });
  console.log(`已寫入：${doc.collection}/${doc.id}`);
}

const firstAiRun = docs.find((doc) => doc.collection === "ai_runs");
await readDocument({
  projectId,
  token,
  collection: firstAiRun.collection,
  id: firstAiRun.id,
});

const result = {
  mode: "formal-write",
  project_id: projectId,
  approved_by: approvedBy,
  synced_at: syncedAt,
  ai_runs_count: Object.keys(preview.writes || {}).length,
  audit_log: `audit_logs/${auditId}`,
  verified_document: `${firstAiRun.collection}/${firstAiRun.id}`,
};

const outputPath = resolve(firebaseDir, "output/ai-runs-firestore-write-result.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

console.log("");
console.log(`正式 Firestore ai_runs 寫入完成：${result.ai_runs_count} 筆`);
console.log(`Project：${projectId}`);
console.log(`批准人：${approvedBy}`);
console.log(`稽核紀錄：${result.audit_log}`);
console.log(`結果檔：${outputPath}`);
