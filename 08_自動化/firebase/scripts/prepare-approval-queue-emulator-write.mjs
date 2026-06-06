#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const appDataPath = resolve(firebaseDir, "command-center-app/data/approval-queue.js");
const emulatorProjectId = "ewalk-ai-system-prod";
const productionProjectId = "ewalk-ai-system-prod";

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) continue;
    const normalized = key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[normalized] = true;
      continue;
    }
    result[normalized] = next;
    index += 1;
  }
  return result;
}

function parseApprovalAppData(source) {
  const prefix = "window.EWALK_APPROVAL_QUEUE = ";
  const trimmed = source.trim();
  if (!trimmed.startsWith(prefix) || !trimmed.endsWith(";")) {
    throw new Error("approval-queue.js 格式不符合預期。");
  }
  return JSON.parse(trimmed.slice(prefix.length, -1));
}

function assertLocalEmulatorHost(host) {
  if (!host) {
    throw new Error("缺少 FIRESTORE_EMULATOR_HOST；拒絕進行任何寫入。");
  }
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host)) {
    throw new Error(`FIRESTORE_EMULATOR_HOST 不是 localhost：${host}`);
  }
}

function assertNoProductionWrite({ target, write, confirmLocalOnly }) {
  if (target !== "emulator") {
    throw new Error(`B16A 只允許 --target emulator，收到：${target || "未指定"}`);
  }
  if (!write) return;
  if (confirmLocalOnly !== "B16_LOCAL_ONLY") {
    throw new Error("emulator 寫入需要 --confirm-local-only B16_LOCAL_ONLY。");
  }
  assertLocalEmulatorHost(process.env.FIRESTORE_EMULATOR_HOST);
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(new Date(value).getTime())) {
      return { timestampValue: new Date(value).toISOString() };
    }
    return { stringValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((item) => toFirestoreValue(item)) } };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, child]) => [key, toFirestoreValue(child)]),
        ),
      },
    };
  }
  return { stringValue: String(value) };
}

function toFirestoreDocument(data) {
  return {
    fields: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)]),
    ),
  };
}

function approvalDocs(payload) {
  return (payload.approvals || []).map((item) => ({
    path: `approvals/${item.approval_id}`,
    id: item.approval_id,
    data: {
      ...item,
      b16_write_mode: "emulator_only",
      production_write_allowed: false,
      production_write_note: "B16A 只允許本機 emulator；production Firebase 需另行批准。",
    },
  }));
}

async function writeEmulatorDocument({ host, path, data }) {
  const url = `http://${host}/v1/projects/${emulatorProjectId}/databases/(default)/documents/${path}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      authorization: "Bearer owner",
      "content-type": "application/json",
    },
    body: JSON.stringify(toFirestoreDocument(data)),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${path} emulator 寫入失敗：HTTP ${response.status} ${detail}`);
  }
}

async function readEmulatorDocument({ host, path }) {
  const url = `http://${host}/v1/projects/${emulatorProjectId}/databases/(default)/documents/${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      authorization: "Bearer owner",
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${path} emulator 回查失敗：HTTP ${response.status} ${detail}`);
  }
  return response.json();
}

const args = parseArgs(process.argv.slice(2));
const target = args.target || "emulator";
const write = args.write === true;

assertNoProductionWrite({
  target,
  write,
  confirmLocalOnly: args.confirmLocalOnly,
});

const payload = parseApprovalAppData(await readFile(appDataPath, "utf8"));
const docs = approvalDocs(payload);

if (docs.length === 0) {
  throw new Error("B16B_BLOCKED_EMPTY_APPROVAL_QUEUE：approval queue 為 0 筆，拒絕進入 emulator 寫入流程。");
}

const summary = {
  b16_stage: "B16A",
  target,
  write,
  production_project_id: productionProjectId,
  production_write_allowed: false,
  source: "command-center-app/data/approval-queue.js",
  approval_count: docs.length,
  pending_count: docs.filter((item) => item.data.status === "pending").length,
  approved_but_not_executed_count: docs.filter(
    (item) => item.data.status === "approved_but_not_executed",
  ).length,
  document_paths: docs.map((item) => item.path),
};

if (!write) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const host = process.env.FIRESTORE_EMULATOR_HOST;
const verifiedPaths = [];
for (const doc of docs) {
  await writeEmulatorDocument({ host, path: doc.path, data: doc.data });
  await readEmulatorDocument({ host, path: doc.path });
  verifiedPaths.push(doc.path);
}

console.log(JSON.stringify({
  ...summary,
  wrote_to_emulator: docs.length,
  verified_from_emulator: verifiedPaths.length,
  verified_paths: verifiedPaths,
}, null, 2));
