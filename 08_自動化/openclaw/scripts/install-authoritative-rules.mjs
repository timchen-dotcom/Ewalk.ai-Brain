#!/usr/bin/env node

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const openclawDir = resolve(scriptDir, "..");
const outputPath = resolve(openclawDir, "output/b30-authoritative-rules-install.review.json");
const expectedScope = "B30_INSTALL_AUTHORITATIVE_RULES";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (key?.startsWith("--")) {
    if (!value || value.startsWith("--")) {
      args.set(key, "true");
    } else {
      args.set(key, value);
      index += 1;
    }
  }
}

function requiredArg(name) {
  const value = args.get(name);
  if (!value || value === "true") throw new Error(`缺少必要參數：${name}`);
  return value;
}

function safeStamp(isoText) {
  return isoText.replace(/[-:.TZ]/g, "").slice(0, 14);
}

function section({ brainPath, generatedAt }) {
  return `<!-- EWALK_OPENCLAW_CONTROLLED_WORK_START -->
# Ewalk.ai OpenClaw Authoritative Controlled Work Rules

Last updated: ${generatedAt}
Authority: This section is the active Ewalk.ai B26-B29 operating rule for this workspace. It supersedes older B10A/B10B "text-only / B10A allowlist only" limits for the Ewalk.ai controlled-work scope below, while preserving explicit approval requirements for external side effects.

## Operating Mode

OpenClaw is now in Ewalk.ai controlled work mode.

It may:

- Read only the approved Brain scoped read roots.
- Write only the approved draft write roots.
- Create local action queue / approval item drafts.
- Prepare previews, diffs, checklists, rollback plans, publishing packages, deployment packages, Firebase write previews, ad-budget drafts, and finance approval packets.

It must not execute external side effects without explicit per-action approval from 提姆先生.

## Approved Brain Read-only Roots

Root Brain path:

\`\`\`text
${brainPath}
\`\`\`

OpenClaw may read only these paths:

\`\`\`text
${brainPath}/01_客戶
${brainPath}/02_內容
${brainPath}/03_廣告
${brainPath}/13_SOP流程
${brainPath}/14_每日工作
\`\`\`

This is a narrow exception to older "Do not access the formal Ewalk.ai Brain" rules. It does not allow full-Brain access.

## Approved Draft Write Roots

OpenClaw may write draft-only work products only here:

\`\`\`text
${brainPath}/00_收件匣/OpenClaw草稿
${brainPath}/14_每日工作/OpenClaw草稿回填
${brainPath}/08_自動化/openclaw/action-queue
\`\`\`

All written files must be marked as draft / 待審 / 未批准發布.

## External Ops Gate B29

The following capabilities are enabled with explicit per-action approval:

- 發文 / 排程發文
- 部署
- production Firebase 改狀態
- 正式客戶通道
- 廣告預算
- 金流 / 帳務 / 付款設定

Without explicit approval for a single action, OpenClaw may only prepare preview / draft / diff / approval item / action queue.

## Required Fields Before Execution

Any high-permission execution must include:

- approval_id
- capability_id
- client_or_project
- requested_action
- risk_summary
- preview_or_diff_path
- rollback_or_recovery_plan
- approved_by
- approval_text
- approved_at

## Still Forbidden Without Explicit Approval

- Publish or schedule a real post.
- Deploy to production.
- Update, delete, or create production Firebase documents.
- Send messages to formal client channels.
- Enable ads, increase budgets, or change bidding settings that can spend money.
- Make payments, refunds, cancellations, billing changes, or payment-method changes.
- Read /Volumes/提姆接案碟.
- Read secrets, tokens, API keys, passwords, .env files, payment credentials, or private config.
- Read the entire Brain outside the approved roots.
- Write outside the approved draft roots.

## 24H Work Rule

OpenClaw may work continuously on:

- Reading approved Brain roots.
- Producing drafts.
- Preparing approvals.
- Building previews and checklists.
- Creating local action queue items.
- Summarizing work and handoff notes.

OpenClaw must pause only at the final execution step that creates external side effects, waiting for explicit approval.
<!-- EWALK_OPENCLAW_CONTROLLED_WORK_END -->`;
}

const scope = requiredArg("--confirm-scope");
if (scope !== expectedScope) {
  throw new Error(`B30_BLOCKED_SCOPE：需要 ${expectedScope}，收到 ${scope}`);
}

const generatedAt = new Date().toISOString();
const workspacePath = resolve(args.get("--workspace") || `${process.env.HOME}/OpenClaw Test Workspace`);
const brainPath = resolve(args.get("--brain") || `${process.env.HOME}/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain`);
const agentsPath = resolve(workspacePath, "AGENTS.md");
const backupPath = resolve(workspacePath, `AGENTS.md.bak-${safeStamp(generatedAt)}`);
const startMarker = "<!-- EWALK_OPENCLAW_CONTROLLED_WORK_START -->";
const endMarker = "<!-- EWALK_OPENCLAW_CONTROLLED_WORK_END -->";

let currentText;
try {
  currentText = await readFile(agentsPath, "utf8");
} catch (error) {
  if (error.code === "ENOENT") {
    throw new Error(`B30_BLOCKED_AGENTS_NOT_FOUND：找不到 ${agentsPath}`);
  }
  throw error;
}

await copyFile(agentsPath, backupPath);

const newSection = section({ brainPath, generatedAt });
let nextText;
const startIndex = currentText.indexOf(startMarker);
const endIndex = currentText.indexOf(endMarker);
if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  const before = currentText.slice(0, startIndex).trimEnd();
  const after = currentText.slice(endIndex + endMarker.length).trimStart();
  nextText = `${before}\n\n${newSection}\n\n${after}`.trimEnd() + "\n";
} else {
  nextText = `${currentText.trimEnd()}\n\n${newSection}\n`;
}

await writeFile(agentsPath, nextText, "utf8");

const reloaded = await readFile(agentsPath, "utf8");
const checks = {
  b30_agents_updated: reloaded.includes(startMarker) && reloaded.includes(endMarker),
  b30_scoped_read_roots_present: [
    `${brainPath}/01_客戶`,
    `${brainPath}/02_內容`,
    `${brainPath}/03_廣告`,
    `${brainPath}/13_SOP流程`,
    `${brainPath}/14_每日工作`,
  ].every((path) => reloaded.includes(path)),
  b30_draft_write_roots_present: [
    `${brainPath}/00_收件匣/OpenClaw草稿`,
    `${brainPath}/14_每日工作/OpenClaw草稿回填`,
    `${brainPath}/08_自動化/openclaw/action-queue`,
  ].every((path) => reloaded.includes(path)),
  b30_external_ops_gate_present: [
    "發文 / 排程發文",
    "部署",
    "production Firebase 改狀態",
    "正式客戶通道",
    "廣告預算",
    "金流 / 帳務 / 付款設定",
  ].every((text) => reloaded.includes(text)),
  b30_explicit_approval_preserved: reloaded.includes("explicit per-action approval"),
};

const allPassed = Object.values(checks).every(Boolean);
const review = {
  mode: "openclaw-authoritative-rules-install-review",
  stage: "B30",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_openclaw_authoritative_rules_installed" : "blocked",
  workspace_path: workspacePath,
  brain_path: brainPath,
  agents_path: agentsPath,
  backup_path: backupPath,
  checks,
  next_step: allPassed
    ? "在 Telegram 傳送 /new，要求 OpenClaw 重新載入 AGENTS.md，確認不再停留 B10A/B10B。"
    : "不得前進，先檢查 AGENTS.md 是否成功寫入 B26-B29 authoritative rules。",
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B30 review 已產生：${outputPath}`);
console.log(`agents_path: ${agentsPath}`);
console.log(`backup_path: ${backupPath}`);
console.log(`overall_status: ${review.overall_status}`);
console.log("authoritative_rules: B26-B29 installed");
console.log("external_ops_without_approval: preview_only");

if (!allPassed) {
  process.exitCode = 1;
}
