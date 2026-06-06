#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const previewPath = resolve(firebaseDir, "output/approval-queue-firestore-commit.preview.json");
const appDataPath = resolve(firebaseDir, "command-center-app/data/approval-queue.js");
const outputPath = resolve(firebaseDir, "output/internal-approval-workflow.review.json");

function parseApprovalAppData(source) {
  const prefix = "window.EWALK_APPROVAL_QUEUE = ";
  const trimmed = source.trim();
  if (!trimmed.startsWith(prefix) || !trimmed.endsWith(";")) {
    throw new Error("approval-queue.js 格式不符合預期。");
  }
  return JSON.parse(trimmed.slice(prefix.length, -1));
}

function pass(condition, detail) {
  return {
    pass: Boolean(condition),
    detail,
  };
}

const generatedAt = new Date().toISOString();
const preview = JSON.parse(await readFile(previewPath, "utf8"));
const appData = parseApprovalAppData(await readFile(appDataPath, "utf8"));
const writePaths = Object.keys(preview.writes || {});
const forbiddenCollections = writePaths.filter(
  (path) => !path.startsWith("approvals/") && !path.startsWith("audit_logs/"),
);
const approvalItems = appData.approvals || [];
const hasApprovedButNotExecuted = approvalItems.some(
  (item) => item.status === "approved_but_not_executed",
);
const hasPending = approvalItems.some((item) => item.status === "pending");

const checks = {
  b17a_preview: pass(
    preview.mode === "preview-only"
      && preview.production_write_allowed === false
      && preview.summary?.approval_count === 6
      && preview.summary?.preview_write_count === 7,
    "正式 Firestore 寫入預覽存在，含 6 筆 approvals 與 1 筆 audit log，不允許 production 寫入。",
  ),
  b18_audit_and_scope: pass(
    writePaths.some((path) => path.startsWith("audit_logs/"))
      && forbiddenCollections.length === 0
      && preview.requires_approval_before_write === true,
    "預覽只包含 approvals / audit_logs，且仍要求正式寫入前批准。",
  ),
  b19_command_center_queue: pass(
    approvalItems.length === 6 && hasApprovedButNotExecuted && hasPending,
    "Command Center 本機 approval queue 可呈現 approved_but_not_executed 與 pending 狀態。",
  ),
  b20_internal_work_loop: pass(
    preview.not_approved?.includes("正式客戶通道")
      && preview.not_approved?.includes("廣告預算")
      && preview.not_approved?.includes("金流"),
    "批次仍封鎖正式客戶通道、廣告預算與金流；只允許內部上工流程測試。",
  ),
};

const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "local-review-only",
  stage: "B17-B20",
  generated_at: generatedAt,
  production_write_allowed: false,
  external_side_effects_allowed: false,
  overall_status: allPassed ? "passed_internal_batch_review" : "blocked",
  checks,
  next_allowed_step: allPassed
    ? "可進入 B17B 內部 approval queue / audit log 正式寫入申請；仍需提姆先生另行明確批准。"
    : "先修正 failed checks，不得進入任何正式寫入。",
  still_blocked: [
    "發文",
    "部署",
    "正式客戶通道",
    "廣告預算",
    "金流",
    "帳務或付款設定",
  ],
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B17-B20 internal approval workflow review 已產生：${outputPath}`);
console.log(`overall_status: ${review.overall_status}`);
for (const [key, value] of Object.entries(checks)) {
  console.log(`${key}: ${value.pass ? "PASS" : "FAIL"}`);
}
console.log("production_write_allowed: false");
