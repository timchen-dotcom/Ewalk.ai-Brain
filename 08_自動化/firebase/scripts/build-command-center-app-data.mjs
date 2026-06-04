#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const vaultRoot = resolve(scriptDir, "../../..");
const contentPath = resolve(firebaseDir, "output/hansik-content-queue.dry-run.json");
const followupsPath = resolve(firebaseDir, "output/hansik-performance-followups.dry-run.json");
const appDataPath = resolve(firebaseDir, "command-center-app/data/snapshot.js");

const content = JSON.parse(await readFile(contentPath, "utf8"));
const followups = JSON.parse(await readFile(followupsPath, "utf8"));

const items = Object.values(content.documents || {});
const followupItems = Object.values(followups.followups || {});

const snapshot = {
  mode: "snapshot",
  project_id: "ewalk-ai-system-prod",
  generated_at: new Date().toISOString(),
  firestore_verified_at: "2026-05-23T07:58:22.716Z",
  verified_document: "clients/hansik-daily-hotpot",
  client: {
    id: "hansik-daily-hotpot",
    name: "韓食日常鍋物",
    logo_src: "./assets/hansik-logo.png",
    industry: "餐飲",
    status: "active",
  },
  metrics: {
    content_total: items.length,
    published: items.filter((item) => item.status === "published").length,
    approved: items.filter((item) => item.status === "approved").length,
    pending: items.filter((item) => ["draft", "pending_review", "pending_approval"].includes(item.status)).length,
    followups_due: followupItems.filter((item) => item.status === "due").length,
  },
  content_queue: items,
  campaign_reports: followupItems,
};

await mkdir(dirname(appDataPath), { recursive: true });
await writeFile(
  appDataPath,
  `window.EWALK_COMMAND_CENTER_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};\n`,
  "utf8",
);

console.log(`Command Center App 資料已產生：${appDataPath}`);
