#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const configPath = resolve(firebaseDir, "config/system-settings.json");
const outputPath = resolve(firebaseDir, "output/system-settings.dry-run.json");

const config = JSON.parse(await readFile(configPath, "utf8"));
const now = new Date().toISOString();

const documents = Object.fromEntries(
  config.settings.map((setting) => [
    `settings/${setting.id}`,
    {
      ...setting,
      project_id: config.project_id,
      updated_by: config.updated_by,
      approved_by: setting.requires_approval ? null : config.requires_approval_by,
      approval_status: setting.requires_approval ? "pending" : "not_required",
      created_at: now,
      updated_at: now,
    },
  ]),
);

const output = {
  mode: "dry-run",
  project_id: config.project_id,
  generated_at: now,
  summary: {
    total: config.settings.length,
    enabled: config.settings.filter((setting) => setting.enabled).length,
    disabled: config.settings.filter((setting) => !setting.enabled).length,
    requires_approval: config.settings.filter((setting) => setting.requires_approval).length,
  },
  documents,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`系統功能開關 dry-run 已產生：${outputPath}`);
console.log(`總數：${output.summary.total}，預設開啟：${output.summary.enabled}，預設關閉：${output.summary.disabled}`);
