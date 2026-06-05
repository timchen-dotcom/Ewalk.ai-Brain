#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const inputPath = resolve(firebaseDir, "output/approval-queue.dry-run.json");
const outputPath = resolve(firebaseDir, "command-center-app/data/approval-queue.js");

async function readJsonOrFallback(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return {
      mode: "dry-run",
      project_id: "ewalk-ai-system-prod",
      generated_at: new Date().toISOString(),
      summary: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        high_risk: 0,
      },
      documents: {},
    };
  }
}

const payload = await readJsonOrFallback(inputPath);
const approvals = Object.values(payload.documents || {}).sort((a, b) =>
  String(b.requested_at || "").localeCompare(String(a.requested_at || ""))
);

const appData = {
  mode: payload.mode || "dry-run",
  project_id: payload.project_id || "ewalk-ai-system-prod",
  generated_at: payload.generated_at || new Date().toISOString(),
  summary: payload.summary || {
    total: approvals.length,
    pending: approvals.filter((item) => item.status === "pending").length,
  },
  approvals,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `window.EWALK_APPROVAL_QUEUE = ${JSON.stringify(appData, null, 2)};\n`, "utf8");

console.log(`Approval Queue App 資料已產生：${outputPath}`);
console.log(`筆數：${approvals.length}`);
