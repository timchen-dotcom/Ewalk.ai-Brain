#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const harnessRoot = resolve(scriptDir, "..");
const automationRoot = resolve(harnessRoot, "..");
const firebaseRoot = resolve(automationRoot, "firebase");
const outputDir = resolve(harnessRoot, "output");
const queuePath = resolve(harnessRoot, "queue/task-queue.json");
const runsPath = resolve(outputDir, "harness-runs.json");

function runNode(scriptPath, args = []) {
  return new Promise((resolveRun) => {
    execFile(process.execPath, [scriptPath, ...args], { timeout: 120000 }, (error, stdout, stderr) => {
      resolveRun({
        ok: !error,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error: error ? error.message : null,
      });
    });
  });
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

function taipeiNow() {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function canAutoRun(task) {
  if (task.approval_required) return false;
  return ["L0", "L1", "L2"].includes(task.permission_level);
}

async function performTask(task) {
  if (task.type === "host_status_check") {
    return runNode(resolve(scriptDir, "host-status.mjs"));
  }
  if (task.type === "client_registry_dry_run_refresh") {
    return runNode(resolve(firebaseRoot, "scripts/build-client-registry.mjs"));
  }
  if (task.type === "command_center_local_data_refresh") {
    const steps = [
      await runNode(resolve(firebaseRoot, "scripts/build-ai-runs-app-data.mjs")),
      await runNode(resolve(firebaseRoot, "scripts/build-approval-queue-app-data.mjs")),
    ];
    return {
      ok: steps.every((step) => step.ok),
      stdout: steps.map((step) => step.stdout).filter(Boolean).join("\n"),
      stderr: steps.map((step) => step.stderr).filter(Boolean).join("\n"),
      error: steps.find((step) => !step.ok)?.error || null,
    };
  }
  if (task.type === "daily_host_summary") {
    return runNode(resolve(scriptDir, "daily-summary.mjs"));
  }
  return {
    ok: false,
    stdout: "",
    stderr: "",
    error: `未知任務類型：${task.type}`,
  };
}

async function saveRuns(existingRuns, baseRuns, runRecords) {
  existingRuns.generated_at = new Date().toISOString();
  existingRuns.runs = [...baseRuns, ...runRecords].slice(-200);
  existingRuns.summary = {
    total: existingRuns.runs.length,
    last_batch_total: runRecords.length,
    last_batch_success: runRecords.filter((item) => item.status === "success").length,
    last_batch_blocked: runRecords.filter((item) => item.status === "blocked").length,
    last_batch_failed: runRecords.filter((item) => item.status === "failed").length,
  };
  await writeFile(runsPath, `${JSON.stringify(existingRuns, null, 2)}\n`, "utf8");
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const queue = await readJson(queuePath, { tasks: [] });
  const existingRuns = await readJson(runsPath, { schema_version: "2026-06-04.phase0", runs: [] });
  const baseRuns = existingRuns.runs || [];
  const now = new Date().toISOString();
  const runRecords = [];

  for (const task of queue.tasks || []) {
    if (!["queued", "scheduled"].includes(task.status)) continue;
    const record = {
      run_id: `hostrun_${now.slice(0, 10).replaceAll("-", "")}_${task.task_id}_${now.slice(11, 19).replaceAll(":", "")}`,
      task_id: task.task_id,
      title: task.title,
      type: task.type,
      permission_level: task.permission_level,
      approval_required: Boolean(task.approval_required),
      started_at: now,
      started_at_taipei: taipeiNow(),
      finished_at: null,
      finished_at_taipei: null,
      status: "running",
      summary: "",
      error: null,
    };

    if (!canAutoRun(task)) {
      record.status = "blocked";
      record.summary = task.blocked_reason || "需要提姆先生批准，Harness 不會自動執行。";
      record.finished_at = new Date().toISOString();
      record.finished_at_taipei = taipeiNow();
      runRecords.push(record);
      continue;
    }

    if (task.type === "daily_host_summary") {
      await saveRuns(existingRuns, baseRuns, runRecords);
    }

    const result = await performTask(task);
    record.status = result.ok ? "success" : "failed";
    record.summary = result.stdout || (result.ok ? "完成" : "失敗");
    record.error = result.error || result.stderr || null;
    record.finished_at = new Date().toISOString();
    record.finished_at_taipei = taipeiNow();
    runRecords.push(record);
  }

  queue.updated_at = new Date().toISOString();
  await saveRuns(existingRuns, baseRuns, runRecords);
  await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");

  console.log(`阿順 Host Harness 本輪完成：${runRecords.length} 個任務`);
  console.log(`成功 ${existingRuns.summary.last_batch_success}；阻塞 ${existingRuns.summary.last_batch_blocked}；失敗 ${existingRuns.summary.last_batch_failed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
