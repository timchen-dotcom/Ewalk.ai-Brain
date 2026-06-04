#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const outputPath = resolve(firebaseDir, "output/ai-runs.dry-run.json");

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
      continue;
    }
    if (result[key]) {
      result[key] = Array.isArray(result[key]) ? [...result[key], next] : [result[key], next];
    } else {
      result[key] = next;
    }
    index += 1;
  }
  return result;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function slugify(value) {
  return String(value || "task")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "task";
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    return {
      mode: "dry-run",
      project_id: "ewalk-ai-system-prod",
      generated_at: null,
      summary: {
        total: 0,
        pending_approval: 0,
        success: 0,
      },
      documents: {},
    };
  }
}

const args = parseArgs(process.argv.slice(2));
const now = new Date().toISOString();
const title = args.title || "未命名 AI 任務";
const runId =
  args.runId ||
  `airun_${now.slice(0, 10).replaceAll("-", "")}_${slugify(title)}_${now.slice(11, 19).replaceAll(":", "")}`;

const approvalRequired =
  args.approvalRequired === true ||
  args.approvalRequired === "true" ||
  args.approvalStatus === "pending";

const document = {
  run_id: runId,
  client_id: args.clientId || null,
  task_id: args.taskId || null,
  source: args.source || "codex_chat",
  owner_uid: args.ownerUid || "tim_uid",
  lead_agent_id: args.leadAgentId || "ashun",
  agent_ids: asArray(args.agentId).length ? asArray(args.agentId) : ["ashun"],
  skill_ids: asArray(args.skillId),
  tool_ids: asArray(args.toolId),
  permission_level: args.permissionLevel || "L1_write_vault",
  approval_required: approvalRequired,
  approval_id: args.approvalId || null,
  approval_status: args.approvalStatus || (approvalRequired ? "pending" : "not_required"),
  provider: args.provider || "openai",
  model: args.model || "gpt-5",
  purpose: args.purpose || "agent_harness_dry_run",
  title,
  context_refs: asArray(args.contextRef),
  observe_summary: args.observe || "",
  reason_summary: args.reason || "",
  act_summary: args.act || "",
  verify_summary: args.verify || "",
  memory_refs: asArray(args.memoryRef),
  status: args.status || "success",
  cost_usd_estimate: args.costUsd ? Number(args.costUsd) : null,
  used_in_delivery: args.usedInDelivery === "false" ? false : true,
  created_at: now,
  updated_at: now,
};

const existing = await readExisting();
existing.generated_at = now;
existing.documents[`ai_runs/${runId}`] = document;
existing.summary = {
  total: Object.keys(existing.documents).length,
  pending_approval: Object.values(existing.documents).filter((item) => item.approval_status === "pending").length,
  success: Object.values(existing.documents).filter((item) => item.status === "success").length,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");

console.log(`AI 執行紀錄 dry-run 已產生：${outputPath}`);
console.log(`Run ID：${runId}`);
console.log(`模式：dry-run，不會寫入正式 Firebase`);
