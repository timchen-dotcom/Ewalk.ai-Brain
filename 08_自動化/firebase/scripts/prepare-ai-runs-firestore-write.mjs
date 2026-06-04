#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const inputPath = resolve(firebaseDir, "output/ai-runs.dry-run.json");
const outputPath = resolve(firebaseDir, "output/ai-runs-firestore-commit.preview.json");

const dryRun = JSON.parse(await readFile(inputPath, "utf8"));
const now = new Date().toISOString();

const output = {
  mode: "preview-only",
  project_id: dryRun.project_id || "ewalk-ai-system-prod",
  generated_at: now,
  requires_approval_before_write: true,
  approval_required_from: "提姆先生",
  warning: "此檔只準備 Firestore 寫入批次，不會自動提交。正式寫入需另外批准並執行寫入工具。",
  summary: dryRun.summary || {},
  writes: Object.fromEntries(
    Object.entries(dryRun.documents || {}).map(([path, value]) => [
      path,
      {
        ...value,
        prepared_at: now,
      },
    ]),
  ),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`AI 執行紀錄 Firestore 寫入預覽已產生：${outputPath}`);
console.log("模式：preview-only，不會寫入正式 Firebase");
