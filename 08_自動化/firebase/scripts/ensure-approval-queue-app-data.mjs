#!/usr/bin/env node

import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const vaultRoot = resolve(firebaseDir, "../..");
const appDataPath = resolve(firebaseDir, "command-center-app/data/approval-queue.js");
const repoPath = "08_自動化/firebase/command-center-app/data/approval-queue.js";

function parseApprovalAppData(source) {
  const prefix = "window.EWALK_APPROVAL_QUEUE = ";
  const trimmed = source.trim();
  if (!trimmed.startsWith(prefix) || !trimmed.endsWith(";")) {
    throw new Error("approval-queue.js 格式不符合預期。");
  }
  return JSON.parse(trimmed.slice(prefix.length, -1));
}

function countApprovals(source) {
  const payload = parseApprovalAppData(source);
  return payload.approvals?.length || 0;
}

const currentSource = await readFile(appDataPath, "utf8");
const currentCount = countApprovals(currentSource);

if (currentCount > 0) {
  console.log(`approval_queue_source: current_file`);
  console.log(`approval_count: ${currentCount}`);
  process.exit(0);
}

const { stdout } = await execFileAsync("git", ["show", `HEAD:${repoPath}`], {
  cwd: vaultRoot,
  maxBuffer: 1024 * 1024 * 4,
});
const restoredCount = countApprovals(stdout);

if (restoredCount === 0) {
  throw new Error("B17A_BLOCKED_EMPTY_APPROVAL_QUEUE_HEAD：目前檔案與 Git HEAD 的 approval queue 都是 0 筆。");
}

await writeFile(appDataPath, stdout.endsWith("\n") ? stdout : `${stdout}\n`, "utf8");

console.log("B17A_RESTORED_APPROVAL_QUEUE_FROM_HEAD");
console.log(`approval_count: ${restoredCount}`);
