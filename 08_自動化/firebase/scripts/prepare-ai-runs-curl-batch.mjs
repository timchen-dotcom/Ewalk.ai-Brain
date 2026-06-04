#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
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

function firestoreDocumentName(projectId, collection, id) {
  return `projects/${projectId}/databases/(default)/documents/${collection}/${id}`;
}

function splitPath(path) {
  const [collection, ...idParts] = path.split("/");
  const id = idParts.join("/");
  if (!collection || !id || id.includes("/")) throw new Error(`不支援的 Firestore path：${path}`);
  return { collection, id };
}

const projectId = requiredArg("--confirm-project");
const approvedBy = requiredArg("--approved-by");
const outputDir = resolve(requiredArg("--output-dir"));
const previewPath = resolve(args.get("--preview") || defaultPreviewPath);

if (projectId !== expectedProjectId) throw new Error(`專案確認失敗：收到 ${projectId}，預期 ${expectedProjectId}`);
if (approvedBy !== "提姆先生") throw new Error("正式寫入必須由提姆先生批准。");

const preview = JSON.parse(await readFile(previewPath, "utf8"));
if (preview.project_id !== expectedProjectId) throw new Error(`preview project 不符：${preview.project_id}`);
if (!preview.requires_approval_before_write) throw new Error("preview 缺少 requires_approval_before_write 保護欄位。");

const syncedAt = new Date().toISOString();
const docs = Object.entries(preview.writes || {}).map(([path, data]) => {
  const { collection, id } = splitPath(path);
  if (collection !== "ai_runs") throw new Error(`此批次只允許 ai_runs，收到：${path}`);
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

const manifest = {
  project_id: projectId,
  approved_by: approvedBy,
  generated_at: syncedAt,
  ai_runs_count: Object.keys(preview.writes || {}).length,
  write_count: docs.length,
  verify_document: `ai_runs/${docs[0].id}`,
  audit_log: `audit_logs/${auditId}`,
};

await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, "oauth-refresh-form.txt"), tokenParams.toString(), "utf8");
await writeFile(resolve(outputDir, "firestore-commit.json"), `${JSON.stringify(commit, null, 2)}\n`, "utf8");
await writeFile(resolve(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`已產生 ai_runs Firestore curl 批次：${outputDir}`);
console.log(`準備寫入 ai_runs：${manifest.ai_runs_count} 筆`);
console.log(`稽核紀錄：${manifest.audit_log}`);
