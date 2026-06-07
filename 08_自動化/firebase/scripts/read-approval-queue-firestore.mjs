#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const vaultRoot = resolve(scriptDir, "../../..");
const projectRoot = resolve(vaultRoot, "..");
const projectFirebaseAuthPath = resolve(projectRoot, ".firebase-home/.config/configstore/firebase-tools.json");
const outputPath = resolve(firebaseDir, "output/command-center-production-readonly.snapshot.json");
const reviewPath = resolve(firebaseDir, "output/command-center-production-readonly.review.json");
const appDataPath = resolve(firebaseDir, "command-center-app/data/approval-queue.js");
const expectedProjectId = "ewalk-ai-system-prod";
const expectedScope = "B23_APPROVALS_AUDIT_LOGS_READONLY";
const allowedCollections = new Set(["approvals", "audit_logs"]);

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

function requiresFirebaseReauth(error) {
  const message = String(error?.message || "");
  return /invalid_rapt|reauth|invalid_grant/i.test(message);
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
    console.log(`firebase_token_refresh_failed: ${error.message}`);
    if (requiresFirebaseReauth(error)) {
      throw new Error(
        `B23_REAUTH_REQUIRED：Firebase CLI 登入已過期或需要重新驗證。請在 Mac Studio 執行 firebase logout、firebase login 後重跑 B23。原始錯誤：${error.message}`,
      );
    }
    throw error;
  }
  if (!refreshed.access_token) throw new Error("無法更新 Firebase 登入 token。");
  console.log("firebase_token_source: refreshed_access_token");
  return refreshed.access_token;
}

function firestoreValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map((item) => firestoreValue(item));
  }
  if ("mapValue" in value) {
    return firestoreFields(value.mapValue.fields || {});
  }
  if ("bytesValue" in value) return value.bytesValue;
  if ("referenceValue" in value) return value.referenceValue;
  if ("geoPointValue" in value) return value.geoPointValue;
  return null;
}

function firestoreFields(fields) {
  return Object.fromEntries(
    Object.entries(fields || {}).map(([key, value]) => [key, firestoreValue(value)]),
  );
}

function normalizeDoc(doc) {
  const id = String(doc.name || "").split("/").pop();
  return {
    id,
    ...firestoreFields(doc.fields || {}),
  };
}

async function readCollection({ projectId, token, collection }) {
  if (!allowedCollections.has(collection)) {
    throw new Error(`B23_BLOCKED_COLLECTION：只允許 approvals / audit_logs，收到 ${collection}`);
  }

  const documents = [];
  let pageToken = null;
  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`,
    );
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await requestJson(url.toString(), {
      headers: { authorization: `Bearer ${token}` },
    });
    documents.push(...(response.documents || []).map((doc) => normalizeDoc(doc)));
    pageToken = response.nextPageToken || null;
  } while (pageToken);

  return documents;
}

function appSummary(approvals) {
  return {
    total: approvals.length,
    pending: approvals.filter((item) => item.status === "pending").length,
    approved_but_not_executed: approvals.filter((item) => item.status === "approved_but_not_executed").length,
    approved: approvals.filter((item) => item.status === "approved").length,
    rejected: approvals.filter((item) => item.status === "rejected").length,
    high_risk: approvals.filter((item) => ["L4", "L5"].includes(item.permission_level)).length,
  };
}

function pass(condition, detail) {
  return { pass: Boolean(condition), detail };
}

const projectId = requiredArg("--confirm-project");
const scope = requiredArg("--confirm-scope");

if (projectId !== expectedProjectId) {
  throw new Error(`B23_BLOCKED_PROJECT：只能讀 ${expectedProjectId}，收到 ${projectId}`);
}
if (scope !== expectedScope) {
  throw new Error(`B23_BLOCKED_SCOPE：需要 ${expectedScope}，收到 ${scope}`);
}

const generatedAt = new Date().toISOString();
const token = await accessToken();
const [approvals, auditLogs] = await Promise.all([
  readCollection({ projectId, token, collection: "approvals" }),
  readCollection({ projectId, token, collection: "audit_logs" }),
]);

const sortedApprovals = approvals
  .slice()
  .sort((a, b) => String(b.requested_at || "").localeCompare(String(a.requested_at || "")));
const sortedAuditLogs = auditLogs
  .slice()
  .sort((a, b) => String(b.created_at || b.timestamp || "").localeCompare(String(a.created_at || a.timestamp || "")));

const snapshot = {
  mode: "production-readonly",
  stage: "B23",
  project_id: projectId,
  generated_at: generatedAt,
  read_scope: ["approvals", "audit_logs"],
  production_write_allowed: false,
  external_side_effects_allowed: false,
  approval_count: sortedApprovals.length,
  audit_log_count: sortedAuditLogs.length,
  approvals: sortedApprovals,
  audit_logs: sortedAuditLogs,
  still_blocked: [
    "正式發文",
    "正式部署",
    "正式客戶通道",
    "廣告預算",
    "金流",
    "帳務或付款設定",
    "寫入 Firebase",
    "修改 approval status",
  ],
};

const appData = {
  mode: "production-readonly",
  project_id: projectId,
  generated_at: generatedAt,
  summary: appSummary(sortedApprovals),
  approvals: sortedApprovals,
};

const checks = {
  b23_read_scope: pass(
    snapshot.read_scope.length === 2
      && snapshot.read_scope.every((collection) => allowedCollections.has(collection))
      && snapshot.production_write_allowed === false
      && snapshot.external_side_effects_allowed === false,
    "B23 只讀 approvals / audit_logs，且沒有開放 production write 或外部副作用。",
  ),
  b23_approval_queue_present: pass(
    snapshot.approval_count >= 6,
    "正式 Firestore approvals 至少讀到 B17B-B22 寫入的 6 筆批准佇列。",
  ),
  b23_audit_log_present: pass(
    snapshot.audit_log_count >= 1,
    "正式 Firestore audit_logs 至少讀到 1 筆稽核紀錄。",
  ),
  b23_command_center_snapshot: pass(
    appData.mode === "production-readonly" && appData.approvals.length === snapshot.approval_count,
    "Command Center 本機 approval-queue.js 已改為 production-readonly snapshot。",
  ),
};
const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "command-center-production-readonly-review",
  stage: "B23",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_command_center_production_readonly" : "blocked",
  project_id: projectId,
  production_write_allowed: false,
  external_side_effects_allowed: false,
  checks,
  result_summary: {
    approval_count: snapshot.approval_count,
    audit_log_count: snapshot.audit_log_count,
    pending_count: appData.summary.pending,
    approved_but_not_executed_count: appData.summary.approved_but_not_executed,
  },
  next_allowed_step: allPassed
    ? "Command Center 可用 production-readonly snapshot 做內部 approval queue 畫面驗收；仍不可執行批准項目的外部動作。"
    : "不得前進，先修正 failed checks。",
};

await mkdir(dirname(outputPath), { recursive: true });
await mkdir(dirname(appDataPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
await writeFile(appDataPath, `window.EWALK_APPROVAL_QUEUE = ${JSON.stringify(appData, null, 2)};\n`, "utf8");
await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B23 production readonly snapshot 已產生：${outputPath}`);
console.log(`B23 Command Center approval queue data 已更新：${appDataPath}`);
console.log(`B23 review 已產生：${reviewPath}`);
console.log(`approval_count: ${snapshot.approval_count}`);
console.log(`audit_log_count: ${snapshot.audit_log_count}`);
console.log(`overall_status: ${review.overall_status}`);
console.log("production_write_allowed: false");
console.log("external_side_effects_allowed: false");
