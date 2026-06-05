#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const inputPath = resolve(firebaseDir, "output/ai-runs.dry-run.json");
const appDataPath = resolve(firebaseDir, "command-center-app/data/ai-runs.js");

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
        pending_approval: 0,
        success: 0,
      },
      documents: {},
    };
  }
}

const dryRun = await readJsonOrFallback(inputPath);
const aiRuns = Object.values(dryRun.documents || {}).sort((a, b) =>
  (b.created_at || "").localeCompare(a.created_at || ""),
);

const payload = {
  mode: dryRun.mode || "dry-run",
  project_id: dryRun.project_id || "ewalk-ai-system-prod",
  generated_at: dryRun.generated_at || new Date().toISOString(),
  summary: dryRun.summary || {
    total: aiRuns.length,
    pending_approval: aiRuns.filter((item) => item.approval_status === "pending").length,
    success: aiRuns.filter((item) => item.status === "success").length,
  },
  ai_runs: aiRuns,
};

await mkdir(dirname(appDataPath), { recursive: true });
await writeFile(
  appDataPath,
  `window.EWALK_AI_RUNS = ${JSON.stringify(payload, null, 2)};\n`,
  "utf8",
);

console.log(`AI 執行紀錄 App 資料已產生：${appDataPath}`);
console.log(`筆數：${aiRuns.length}`);
