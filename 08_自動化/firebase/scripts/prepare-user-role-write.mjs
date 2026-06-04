#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "../../../..");
const defaultFirebaseAuthPath = resolve(projectRoot, ".firebase-home/.config/configstore/firebase-tools.json");
const expectedProjectId = "ewalk-ai-system-prod";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (key?.startsWith("--")) {
    if (!value || value.startsWith("--")) args.set(key, "true");
    else {
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
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(new Date(value).getTime());
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return isIsoLike(value) ? { timestampValue: new Date(value).toISOString() } : { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map((item) => firestoreValue(item)) } };
  if (typeof value === "object") {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, firestoreValue(child)])) } };
  }
  return { stringValue: String(value) };
}

function fields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, firestoreValue(value)]));
}

function docName(projectId, collection, id) {
  return `projects/${projectId}/databases/(default)/documents/${collection}/${id}`;
}

const projectId = requiredArg("--confirm-project");
const approvedBy = requiredArg("--approved-by");
const uid = requiredArg("--uid");
const email = requiredArg("--email");
const displayName = requiredArg("--display-name");
const role = requiredArg("--role");
const batchDir = resolve(requiredArg("--batch-dir"));

if (projectId !== expectedProjectId) throw new Error(`專案確認失敗：收到 ${projectId}，預期 ${expectedProjectId}`);
if (approvedBy !== "提姆先生") throw new Error("使用者角色寫入必須由提姆先生批准。");
if (!["owner", "admin", "manager", "staff", "agent", "client"].includes(role)) throw new Error(`不支援的 role：${role}`);
if (role === "owner" && email !== "tim.chen@ewalk.ai") throw new Error("owner role 目前只允許 tim.chen@ewalk.ai。");

const now = new Date().toISOString();
const auditId = `user-role-bootstrap-${now.replace(/\D/g, "").slice(0, 14)}`;
const auth = JSON.parse(await readFile(defaultFirebaseAuthPath, "utf8"));
const refreshToken = auth.tokens?.refresh_token;
if (!refreshToken) throw new Error("Firebase CLI 尚未登入，缺少 refresh token。");

const tokenParams = new URLSearchParams({
  client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
  client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
  refresh_token: refreshToken,
  grant_type: "refresh_token",
});

const userDoc = {
  uid,
  email,
  display_name: displayName,
  role,
  status: "active",
  client_ids: [],
  department_ids: role === "owner" ? ["management"] : [],
  created_at: now,
  updated_at: now,
  updated_by: "ashun",
  approved_by: approvedBy,
};

const auditDoc = {
  id: auditId,
  action: "user_role_bootstrap",
  target_uid: uid,
  target_email: email,
  role,
  approved_by: approvedBy,
  performed_by: "ashun",
  project_id: projectId,
  created_at: now,
};

const commit = {
  writes: [
    {
      update: {
        name: docName(projectId, "users", uid),
        fields: fields(userDoc),
      },
    },
    {
      update: {
        name: docName(projectId, "audit_logs", auditId),
        fields: fields(auditDoc),
      },
    },
  ],
};

await mkdir(batchDir, { recursive: true });
await writeFile(resolve(batchDir, "oauth-refresh-form.txt"), tokenParams.toString(), "utf8");
await writeFile(resolve(batchDir, "firestore-commit.json"), `${JSON.stringify(commit, null, 2)}\n`, "utf8");
await writeFile(resolve(batchDir, "manifest.json"), `${JSON.stringify({
  project_id: projectId,
  approved_by: approvedBy,
  generated_at: now,
  writes: [`users/${uid}`, `audit_logs/${auditId}`],
  verify_document: `users/${uid}`,
}, null, 2)}\n`, "utf8");

console.log(`使用者角色寫入批次已產生：${batchDir}`);
console.log(`準備寫入：users/${uid} role=${role}`);
console.log(`稽核紀錄：audit_logs/${auditId}`);
