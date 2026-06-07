#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const decisionInputPath = resolve(firebaseDir, "output/command-center-approval-decision.mock.json");
const b25ReviewPath = resolve(firebaseDir, "output/command-center-approval-decision.review.json");
const auditTrailOutputPath = resolve(firebaseDir, "output/command-center-decision-audit-trail.dry-run.json");
const actionQueueOutputPath = resolve(firebaseDir, "output/command-center-action-queue.dry-run.json");
const reviewOutputPath = resolve(firebaseDir, "output/command-center-decision-dry-run.review.json");
const expectedScope = "B26_LOCAL_DECISION_DRY_RUN_ONLY";

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

function pass(condition, detail) {
  return { pass: Boolean(condition), detail };
}

function dryRunStatus(decision) {
  if (decision === "keep_pending") return "dry_run_keep_pending";
  if (decision === "request_changes") return "dry_run_request_changes";
  if (decision === "reject_preview") return "dry_run_reject_preview";
  if (decision === "approve_preview") return "dry_run_approve_preview";
  return "dry_run_review_required";
}

function nextStepFor(decision) {
  if (decision === "keep_pending") return "維持 pending；等待提姆先生後續正式批准、退回或拒絕。";
  if (decision === "request_changes") return "僅產生退回修改建議草稿；不得修改 production status。";
  if (decision === "reject_preview") return "僅產生拒絕預覽草稿；不得修改 production status。";
  if (decision === "approve_preview") return "僅產生批准預覽草稿；不得執行發文、部署、Firebase 寫入或外部副作用。";
  return "需要人工重新檢查 decision。";
}

const scope = requiredArg("--confirm-scope");
if (scope !== expectedScope) {
  throw new Error(`B26_BLOCKED_SCOPE：需要 ${expectedScope}，收到 ${scope}`);
}

const generatedAt = new Date().toISOString();
const [decisionPacket, b25Review] = await Promise.all([
  readFile(decisionInputPath, "utf8").then((text) => JSON.parse(text)),
  readFile(b25ReviewPath, "utf8").then((text) => JSON.parse(text)),
]);

const selected = decisionPacket.selected_approval || {};
const approvalId = selected.approval_id || b25Review.approval_id;
if (!approvalId) {
  throw new Error("B26_BLOCKED_MISSING_APPROVAL_ID：B25 decision packet 沒有 approval_id。");
}

const decision = selected.mock_decision || b25Review.mock_decision;
const originalStatus = selected.original_status || b25Review.original_status;
const proposedStatus = selected.proposed_status || b25Review.proposed_status;
const actor = decisionPacket.decision?.decided_by || "提姆先生";
const auditId = `dryrun_b26_${generatedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}_${approvalId}`;

const auditTrail = {
  mode: "local-dry-run",
  stage: "B26",
  generated_at: generatedAt,
  source: "B25 command-center approval decision mock",
  project_id: decisionPacket.project_id || b25Review.project_id || "ewalk-ai-system-prod",
  production_write_allowed: false,
  external_side_effects_allowed: false,
  write_to_firestore: false,
  events: [
    {
      audit_id: auditId,
      approval_id: approvalId,
      action: `dry_run_${decision}`,
      actor,
      created_at: generatedAt,
      original_status: originalStatus,
      proposed_status: proposedStatus,
      mock_decision: decision,
      note: "B26 只產生本機 audit trail dry-run，不寫 production Firebase。",
      source_audit_preview_path: decisionPacket.audit_log_preview?.path || null,
      write_to_firestore: false,
      production_write_allowed: false,
      external_side_effects_allowed: false,
    },
  ],
};

const actionQueue = {
  mode: "local-dry-run",
  stage: "B26",
  generated_at: generatedAt,
  source: "B25 command-center approval decision mock",
  project_id: auditTrail.project_id,
  production_write_allowed: false,
  external_side_effects_allowed: false,
  execution_allowed: false,
  items: [
    {
      action_id: `dryrun_b26_action_${approvalId}`,
      approval_id: approvalId,
      title: selected.title || "Command Center approval decision dry-run",
      client_id: selected.client_id || null,
      client_name: selected.client_name || null,
      category: selected.category || null,
      permission_level: selected.permission_level || null,
      status: dryRunStatus(decision),
      original_status: originalStatus,
      proposed_status: proposedStatus,
      recommended_next_step: nextStepFor(decision),
      execution_allowed: false,
      production_write_allowed: false,
      external_side_effects_allowed: false,
      blocked_actions: [
        "改 production approval status",
        "正式發文",
        "正式部署",
        "正式客戶通道",
        "寫入 Firebase",
        "廣告預算",
        "金流",
        "帳務或付款設定",
      ],
    },
  ],
};

const actionItem = actionQueue.items[0];
const checks = {
  b26_depends_on_b25: pass(
    b25Review.overall_status === "passed_command_center_decision_mock"
      && b25Review.production_write_allowed === false
      && b25Review.external_side_effects_allowed === false,
    "B26 只在 B25 人工決策 mock 通過後執行，且 B25 沒有 production write 或外部副作用。",
  ),
  b26_decision_packet_is_mock_only: pass(
    decisionPacket.mode === "mock-only"
      && decisionPacket.decision?.mock_only === true
      && decisionPacket.decision?.production_write_allowed === false
      && decisionPacket.decision?.external_side_effects_allowed === false
      && decisionPacket.decision?.execution_allowed === false,
    "B26 只接受 B25 mock-only decision packet。",
  ),
  b26_audit_trail_local_only: pass(
    auditTrail.mode === "local-dry-run"
      && auditTrail.write_to_firestore === false
      && auditTrail.production_write_allowed === false
      && auditTrail.external_side_effects_allowed === false
      && auditTrail.events.every((event) => event.write_to_firestore === false),
    "audit trail 只寫本機 dry-run JSON，不寫 Firestore。",
  ),
  b26_action_queue_local_only: pass(
    actionQueue.mode === "local-dry-run"
      && actionQueue.execution_allowed === false
      && actionQueue.production_write_allowed === false
      && actionQueue.external_side_effects_allowed === false
      && actionItem.execution_allowed === false,
    "action queue 只寫本機 dry-run JSON，不產生執行權限。",
  ),
  b26_keep_pending_preserved: pass(
    decision !== "keep_pending" || (originalStatus === "pending" && proposedStatus === "pending"),
    "keep_pending 決策必須維持 pending，不得把 production status 改成 approved。",
  ),
  b26_no_external_side_effects: pass(
    actionItem.blocked_actions.includes("正式發文")
      && actionItem.blocked_actions.includes("寫入 Firebase")
      && actionItem.blocked_actions.includes("廣告預算")
      && actionItem.blocked_actions.includes("金流"),
    "正式發文、Firebase、廣告預算與金流仍封鎖。",
  ),
};

const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "command-center-decision-dry-run-review",
  stage: "B26",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_command_center_decision_dry_run" : "blocked",
  project_id: auditTrail.project_id,
  approval_id: approvalId,
  mock_decision: decision,
  original_status: originalStatus,
  proposed_status: proposedStatus,
  audit_trail_path: "output/command-center-decision-audit-trail.dry-run.json",
  action_queue_path: "output/command-center-action-queue.dry-run.json",
  production_write_allowed: false,
  external_side_effects_allowed: false,
  checks,
  next_allowed_step: allPassed
    ? "可進入 B27：OpenClaw 限定草稿寫入，不直接改 production。"
    : "不得前進，先修正 failed checks。",
};

await mkdir(dirname(auditTrailOutputPath), { recursive: true });
await writeFile(auditTrailOutputPath, `${JSON.stringify(auditTrail, null, 2)}\n`, "utf8");
await writeFile(actionQueueOutputPath, `${JSON.stringify(actionQueue, null, 2)}\n`, "utf8");
await writeFile(reviewOutputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B26 audit trail dry-run 已產生：${auditTrailOutputPath}`);
console.log(`B26 action queue dry-run 已產生：${actionQueueOutputPath}`);
console.log(`B26 review 已產生：${reviewOutputPath}`);
console.log(`approval_id: ${approvalId}`);
console.log(`mock_decision: ${decision}`);
console.log(`original_status: ${originalStatus}`);
console.log(`proposed_status: ${proposedStatus}`);
console.log(`overall_status: ${review.overall_status}`);
console.log("production_write_allowed: false");
console.log("external_side_effects_allowed: false");

if (!allPassed) {
  process.exitCode = 1;
}
