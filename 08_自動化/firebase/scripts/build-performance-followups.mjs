#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const vaultRoot = resolve(scriptDir, "../../..");
const defaultConfigPath = resolve(scriptDir, "../config/clients/hansik-daily-hotpot.json");
const now = new Date();

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (key?.startsWith("--")) {
    args.set(key, value);
    index += 1;
  }
}

function workspacePath(value) {
  if (!value) return null;
  return isAbsolute(value) ? value : resolve(vaultRoot, value);
}

const configPath = resolve(args.get("--config") || defaultConfigPath);
let config = {};
try {
  config = JSON.parse(await readFile(configPath, "utf8"));
} catch {
  config = {};
}

const inputPath = workspacePath(args.get("--input") || config.content_queue_output)
  || resolve(scriptDir, "../output/hansik-content-queue.dry-run.json");
const outputPath = workspacePath(args.get("--output") || config.performance_followups_output)
  || resolve(scriptDir, "../output/hansik-performance-followups.dry-run.json");
const checkpoints = (config.followup_checkpoints_hours || [24, 72]).map(Number);

const source = JSON.parse(await readFile(inputPath, "utf8"));
const publishedItems = Object.values(source.documents)
  .filter((item) => item.status === "published")
  .sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || ""));

function addHours(value, hours) {
  const date = new Date(value);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function checkpointStatus(dueAt) {
  return new Date(dueAt) <= now ? "due" : "scheduled";
}

function checkpoint(item, hours) {
  const dueAt = addHours(item.scheduled_at, hours);
  return {
    id: `${item.id}-${hours}h`,
    client_id: item.client_id,
    source_content_queue_id: item.id,
    source_task_id: item.source_task_id,
    platform: item.platforms[0] || "facebook",
    checkpoint: `${hours}h`,
    status: checkpointStatus(dueAt),
    due_at: dueAt,
    post_url: item.meta?.post_url || null,
    post_id: item.meta?.post_id || null,
    assigned_to: "數據分析師",
    metrics_to_collect: [
      "reach",
      "impressions",
      "reactions",
      "comments",
      "shares",
      "link_clicks",
      "negative_feedback",
    ],
    result_template: {
      reach: null,
      impressions: null,
      reactions: null,
      comments: null,
      shares: null,
      link_clicks: null,
      negative_feedback: null,
      summary: null,
      recommendation: null,
    },
  };
}

const followups = {};
for (const item of publishedItems) {
  for (const hours of checkpoints) {
    const task = checkpoint(item, hours);
    followups[task.id] = task;
  }
}

const output = {
  mode: "dry-run",
  generated_at: now.toISOString(),
  config: configPath,
  source: inputPath,
  target_collection: "campaign_reports",
  count: Object.keys(followups).length,
  followups,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`成效追蹤 dry-run 完成：${output.count} 筆`);
console.log(`輸出：${outputPath}`);
