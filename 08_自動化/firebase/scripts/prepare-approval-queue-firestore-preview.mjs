#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const appDataPath = resolve(firebaseDir, "command-center-app/data/approval-queue.js");
const outputPath = resolve(firebaseDir, "output/approval-queue-firestore-commit.preview.json");
const projectId = "ewalk-ai-system-prod";

function parseApprovalAppData(source) {
  const prefix = "window.EWALK_APPROVAL_QUEUE = ";
  const trimmed = source.trim();
  if (!trimmed.startsWith(prefix) || !trimmed.endsWith(";")) {
    throw new Error("approval-queue.js 格式不符合預期。");
  }
  return JSON.parse(trimmed.slice(prefix.length, -1));
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

function firestoreFields(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, firestoreValue(value)]),
  );
}

function firestoreDocumentName(path) {
  return `projects/${projectId}/databases/(default)/documents/${path}`;
}

function approvalDocs(payload, generatedAt) {
  return (payload.approvals || []).map((item) => ({
    path: `approvals/${item.approval_id}`,
    id: item.approval_id,
    data: {
      ...item,
      firestore_preview_stage: "B17A",
      firestore_preview_prepared_at: generatedAt,
      production_write_allowed: false,
      production_write_note: "B17A 只產生正式 Firestore 寫入預覽；production 寫入需另行批准。",
    },
  }));
}

const generatedAt = new Date().toISOString();
const payload = parseApprovalAppData(await readFile(appDataPath, "utf8"));
const approvalDocuments = approvalDocs(payload, generatedAt);

if (approvalDocuments.length === 0) {
  throw new Error("B17A_BLOCKED_EMPTY_APPROVAL_QUEUE：approval queue 為 0 筆，拒絕產生 production preview。");
}

const auditId = `approval-queue-preview-${generatedAt.replace(/\D/g, "").slice(0, 14)}`;
const auditDocument = {
  path: `audit_logs/${auditId}`,
  id: auditId,
  data: {
    id: auditId,
    action: "approval_queue_firestore_preview_generated",
    stage: "B17A",
    batch: "B17-B20",
    project_id: projectId,
    performed_by: "ashun",
    approved_by: "提姆先生",
    approval_scope: "內部 approval queue / audit log / Command Center 上工流程測試",
    approval_count: approvalDocuments.length,
    pending_count: approvalDocuments.filter((doc) => doc.data.status === "pending").length,
    approved_but_not_executed_count: approvalDocuments.filter(
      (doc) => doc.data.status === "approved_but_not_executed",
    ).length,
    production_write_allowed: false,
    created_at: generatedAt,
  },
};

const docs = [...approvalDocuments, auditDocument];
const preview = {
  mode: "preview-only",
  stage: "B17A",
  batch: "B17-B20",
  project_id: projectId,
  generated_at: generatedAt,
  source: "command-center-app/data/approval-queue.js",
  production_write_allowed: false,
  requires_approval_before_write: true,
  approval_required_from: "提姆先生",
  allowed_scope: [
    "approval queue preview",
    "audit log preview",
    "Command Center internal workflow review",
  ],
  not_approved: [
    "Facebook / Instagram / LINE 發文",
    "部署",
    "正式客戶通道",
    "廣告預算",
    "金流",
    "帳務或付款設定",
  ],
  summary: {
    approval_count: approvalDocuments.length,
    pending_count: approvalDocuments.filter((doc) => doc.data.status === "pending").length,
    approved_but_not_executed_count: approvalDocuments.filter(
      (doc) => doc.data.status === "approved_but_not_executed",
    ).length,
    audit_log_count: 1,
    preview_write_count: docs.length,
  },
  writes: Object.fromEntries(docs.map((doc) => [doc.path, doc.data])),
  firestore_commit_preview: {
    writes: docs.map((doc) => ({
      update: {
        name: firestoreDocumentName(doc.path),
        fields: firestoreFields(doc.data),
      },
    })),
  },
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(preview, null, 2)}\n`, "utf8");

console.log(`B17A Firestore approval queue preview 已產生：${outputPath}`);
console.log(`approval_count: ${preview.summary.approval_count}`);
console.log(`audit_log_count: ${preview.summary.audit_log_count}`);
console.log(`preview_write_count: ${preview.summary.preview_write_count}`);
console.log("production_write_allowed: false");
