#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const registryPath = resolve(firebaseDir, "output/client-registry.dry-run.json");
const outputPath = resolve(firebaseDir, "output/clients-import.dry-run.json");
const commitPreviewPath = resolve(firebaseDir, "output/clients-firestore-commit.preview.json");

function normalizeStatus(status) {
  if (status === "提案中") return "proposal";
  if (status === "進行中" || status === "合作中") return "active";
  if (status === "暫停") return "paused";
  if (status === "結案") return "closed";
  return "pending_confirmation";
}

function isoNow() {
  return new Date().toISOString();
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

function firestoreFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, firestoreValue(value)]));
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const generatedAt = isoNow();

const documents = {};
for (const client of registry.clients || []) {
  documents[client.client_id] = {
    id: client.client_id,
    name: client.client_name,
    slug: client.client_id,
    status: normalizeStatus(client.status),
    display_status: client.status,
    industry: client.industry,
    source_path: client.source_path,
    primary_file: client.primary_file,
    service_tags: client.service_tags || [],
    import_readiness: client.import_readiness,
    next_action: client.next_action,
    command_center_enabled: true,
    content_queue_enabled: client.import_readiness === "ready_content_queue",
    formal_import_status: "pending_tim_review",
    folder_name: client.folder_name,
    file_count: client.file_count || 0,
    markdown_count: client.markdown_count || 0,
    folders: client.folders || [],
    updated_at: generatedAt,
    updated_by: "ashun",
  };
}

const output = {
  mode: "dry-run",
  generated_at: generatedAt,
  source: registryPath,
  target_collection: "clients",
  project_id: "ewalk-ai-system-prod",
  count: Object.keys(documents).length,
  requires_approval_before_write: true,
  approval_required_from: "提姆先生",
  write_scope: "clients collection only; no content_queue, no Meta API, no billing",
  documents,
};

const auditId = `clients-import-preview-${generatedAt.replace(/\D/g, "").slice(0, 14)}`;
const commitPreview = {
  writes: [
    ...Object.entries(documents).map(([id, data]) => ({
      update: {
        name: `projects/ewalk-ai-system-prod/databases/(default)/documents/clients/${id}`,
        fields: firestoreFields(data),
      },
    })),
    {
      update: {
        name: `projects/ewalk-ai-system-prod/databases/(default)/documents/audit_logs/${auditId}`,
        fields: firestoreFields({
          id: auditId,
          action: "clients_import_preview_generated",
          target_collection: "clients",
          client_count: Object.keys(documents).length,
          approved_by: null,
          performed_by: "ashun",
          project_id: "ewalk-ai-system-prod",
          source: "01_客戶",
          created_at: generatedAt,
        }),
      },
    },
  ],
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
await writeFile(commitPreviewPath, `${JSON.stringify(commitPreview, null, 2)}\n`, "utf8");

console.log(`clients 匯入 dry-run 已產生：${output.count} 筆`);
console.log(`輸出：${outputPath}`);
console.log(`Firestore commit 預覽：${commitPreviewPath}`);
