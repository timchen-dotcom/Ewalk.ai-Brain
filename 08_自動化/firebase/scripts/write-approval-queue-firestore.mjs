#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const vaultRoot = resolve(scriptDir, "../../..");
const projectRoot = resolve(vaultRoot, "..");
const defaultPreviewPath = resolve(firebaseDir, "output/approval-queue-firestore-commit.preview.json");
const defaultOutputPath = resolve(firebaseDir, "output/approval-queue-firestore-write-result.json");
const projectFirebaseAuthPath = resolve(projectRoot, ".firebase-home/.config/configstore/firebase-tools.json");
const expectedProjectId = "ewalk-ai-system-prod";
const expectedScope = "B17B_APPROVALS_AUDIT_LOGS_ONLY";
const allowedCollections = new Set(["approvals", "audit_logs"]);
const blockedScope = [
  "正式發文",
  "正式部署",
  "正式客戶通道",
  "廣告預算",
  "金流",
  "帳務或付款設定",
  "任意 exec",
  "完整 Brain / 接案碟讀取",
];

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
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
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
        const message = parsed?.error?.message
          || parsed?.error_description
          || (typeof parsed?.error === "string" ? parsed.error : null)
          || parsed?.raw
          || stderr
          || `HTTP ${status}`;
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

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function firebaseAuthCandidates() {
  const explicitAuthPath = args.get("--firebase-auth");
  return uniqueValues([
    explicitAuthPath && resolve(explicitAuthPath),
    projectFirebaseAuthPath,
    process.env.XDG_CONFIG_HOME
      && resolve(process.env.XDG_CONFIG_HOME, "configstore/firebase-tools.json"),
    process.env.HOME
      && resolve(process.env.HOME, ".config/configstore/firebase-tools.json"),
  ]);
}

async function findFirebaseAuthPath() {
  const candidates = firebaseAuthCandidates();
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  throw new Error(
    `Firebase CLI 尚未登入，找不到 firebase-tools.json。已檢查：${candidates.join("、")}`,
  );
}

function tokenExpiryMs(value) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric < 10_000_000_000 ? numeric * 1000 : numeric;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

async function accessToken() {
  const firebaseAuthPath = await findFirebaseAuthPath();
  console.log(`firebase_auth_source: ${firebaseAuthPath}`);
  const auth = JSON.parse(await readFile(firebaseAuthPath, "utf8"));
  const tokens = auth.tokens || {};
  const expiresAtMs = tokenExpiryMs(tokens.expires_at);
  if (tokens.access_token && expiresAtMs && expiresAtMs > Date.now() + 60_000) {
    console.log("firebase_token_source: existing_access_token");
    return tokens.access_token;
  }
  if (!tokens.refresh_token) throw new Error("Firebase CLI 尚未登入，缺少 refresh token。");

  const params = new URLSearchParams({
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  });

  let refreshed;
  try {
    refreshed = await requestJson("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  } catch (error) {
    if (tokens.access_token) {
      console.log(`firebase_token_refresh_failed: ${error.message}`);
      console.log("firebase_token_fallback: existing_access_token");
      return tokens.access_token;
    }
    throw error;
  }
  if (!refreshed.access_token) throw new Error("無法更新 Firebase 登入 token。");
  console.log("firebase_token_source: refreshed_access_token");
  return refreshed.access_token;
}

function splitPath(path) {
  const [collection, ...idParts] = path.split("/");
  const id = idParts.join("/");
  if (!collection || !id || id.includes("/")) throw new Error(`不支援的 Firestore path：${path}`);
  if (!allowedCollections.has(collection)) {
    throw new Error(`B17B_BLOCKED_COLLECTION：只允許 approvals / audit_logs，收到 ${path}`);
  }
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

function assertIncludes(list, value, label) {
  if (!Array.isArray(list) || !list.includes(value)) {
    throw new Error(`B17B_BLOCKED_SCOPE_GAP：${label} 未明確包含 ${value}`);
  }
}

function validatePreview(preview) {
  if (preview.mode !== "preview-only") throw new Error("preview mode 不是 preview-only。");
  if (preview.stage !== "B17A") throw new Error(`preview stage 不符：${preview.stage}`);
  if (preview.batch !== "B17-B20") throw new Error(`preview batch 不符：${preview.batch}`);
  if (preview.project_id !== expectedProjectId) throw new Error(`preview project 不符：${preview.project_id}`);
  if (preview.production_write_allowed !== false) {
    throw new Error("B17A preview 必須明確標示 production_write_allowed: false。");
  }
  if (preview.requires_approval_before_write !== true) {
    throw new Error("preview 缺少 requires_approval_before_write 保護欄位。");
  }
  if (preview.summary?.approval_count !== 6 || preview.summary?.audit_log_count !== 1) {
    throw new Error("preview 筆數不符，預期 6 筆 approvals 與 1 筆 audit log。");
  }
  assertIncludes(preview.not_approved, "正式客戶通道", "not_approved");
  assertIncludes(preview.not_approved, "廣告預算", "not_approved");
  assertIncludes(preview.not_approved, "金流", "not_approved");

  const writePaths = Object.keys(preview.writes || {});
  if (writePaths.length !== 7) throw new Error(`preview 寫入筆數不符，收到 ${writePaths.length}`);
  for (const path of writePaths) splitPath(path);
}

function productionData(path, data, syncedAt, approvedBy) {
  const { collection, id } = splitPath(path);
  if (collection === "approvals") {
    return {
      collection,
      id,
      data: {
        ...data,
        firestore_sync_stage: "B17B",
        firestore_synced_at: syncedAt,
        firestore_sync_mode: "approved_internal_approval_queue_write",
        production_write_allowed: true,
        production_write_scope: "approvals_and_audit_logs_only",
        external_side_effects_allowed: false,
        approved_by: approvedBy,
        updated_at: syncedAt,
      },
    };
  }
  return {
    collection,
    id,
    data: {
      ...data,
      firestore_sync_stage: "B17B",
      firestore_synced_at: syncedAt,
      external_side_effects_allowed: false,
    },
  };
}

const projectId = requiredArg("--confirm-project");
const approvedBy = requiredArg("--approved-by");
const confirmScope = requiredArg("--confirm-scope");
const shouldWrite = args.has("--write");
const previewPath = resolve(args.get("--preview") || defaultPreviewPath);
const outputPath = resolve(args.get("--result") || defaultOutputPath);

if (projectId !== expectedProjectId) {
  throw new Error(`專案確認失敗：收到 ${projectId}，預期 ${expectedProjectId}`);
}
if (approvedBy !== "提姆先生") throw new Error("正式寫入必須由提姆先生批准。");
if (confirmScope !== expectedScope) {
  throw new Error(`正式寫入範圍確認失敗：收到 ${confirmScope}，預期 ${expectedScope}`);
}
if (!shouldWrite) throw new Error("正式寫入需要加上 --write。");

const preview = JSON.parse(await readFile(previewPath, "utf8"));
validatePreview(preview);

const syncedAt = new Date().toISOString();
const docs = Object.entries(preview.writes || {}).map(([path, data]) =>
  productionData(path, data, syncedAt, approvedBy),
);

const approvalCount = docs.filter((doc) => doc.collection === "approvals").length;
const previewAuditCount = docs.filter((doc) => doc.collection === "audit_logs").length;
const auditId = `approval-queue-firestore-write-${syncedAt.replace(/\D/g, "").slice(0, 14)}`;
docs.push({
  collection: "audit_logs",
  id: auditId,
  data: {
    id: auditId,
    action: "approval_queue_firestore_write_committed",
    stage: "B17B",
    batch: "B17B-B22",
    project_id: projectId,
    performed_by: "ashun",
    approved_by: approvedBy,
    approval_scope: "只允許 production Firebase approvals / audit_logs 內部寫入",
    source_preview: "08_自動化/firebase/output/approval-queue-firestore-commit.preview.json",
    approval_count: approvalCount,
    preview_audit_log_count: previewAuditCount,
    write_count: docs.length + 1,
    production_write_allowed: true,
    production_write_scope: "approvals_and_audit_logs_only",
    external_side_effects_allowed: false,
    blocked_scope: blockedScope,
    created_at: syncedAt,
  },
});

const token = await accessToken();
for (const doc of docs) {
  await writeDocument({ projectId, token, ...doc });
  console.log(`已寫入：${doc.collection}/${doc.id}`);
}

const verifiedPaths = [];
for (const doc of docs) {
  await readDocument({ projectId, token, collection: doc.collection, id: doc.id });
  verifiedPaths.push(`${doc.collection}/${doc.id}`);
}

const result = {
  mode: "formal-internal-write",
  stage: "B17B",
  batch: "B17B-B22",
  project_id: projectId,
  approved_by: approvedBy,
  synced_at: syncedAt,
  source_preview: "08_自動化/firebase/output/approval-queue-firestore-commit.preview.json",
  wrote_to_firestore: docs.length,
  verified_from_firestore: verifiedPaths.length,
  approval_count: approvalCount,
  preview_audit_log_count: previewAuditCount,
  commit_audit_log: `audit_logs/${auditId}`,
  document_paths: docs.map((doc) => `${doc.collection}/${doc.id}`),
  verified_paths: verifiedPaths,
  production_write_allowed: true,
  production_write_scope: "approvals_and_audit_logs_only",
  external_side_effects_allowed: false,
  blocked_scope: blockedScope,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

console.log("");
console.log("B17B 內部 approvals / audit_logs 正式寫入完成。");
console.log(`wrote_to_firestore: ${result.wrote_to_firestore}`);
console.log(`verified_from_firestore: ${result.verified_from_firestore}`);
console.log(`approval_count: ${result.approval_count}`);
console.log(`commit_audit_log: ${result.commit_audit_log}`);
console.log("external_side_effects_allowed: false");
console.log(`結果檔：${outputPath}`);
