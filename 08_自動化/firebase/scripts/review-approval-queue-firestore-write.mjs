#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const resultPath = resolve(firebaseDir, "output/approval-queue-firestore-write-result.json");
const previewPath = resolve(firebaseDir, "output/approval-queue-firestore-commit.preview.json");
const liveAdapterPath = resolve(firebaseDir, "command-center-app/firestore-live-adapter.js");
const outputPath = resolve(firebaseDir, "output/internal-production-approval-workflow.review.json");

function pass(condition, detail) {
  return {
    pass: Boolean(condition),
    detail,
  };
}

function onlyInternalPaths(paths) {
  return Array.isArray(paths)
    && paths.length > 0
    && paths.every((path) => path.startsWith("approvals/") || path.startsWith("audit_logs/"));
}

function includesAll(list, values) {
  return Array.isArray(list) && values.every((value) => list.includes(value));
}

const generatedAt = new Date().toISOString();
const result = JSON.parse(await readFile(resultPath, "utf8"));
const preview = JSON.parse(await readFile(previewPath, "utf8"));
const liveAdapter = await readFile(liveAdapterPath, "utf8");
const documentPaths = result.document_paths || [];
const auditPaths = documentPaths.filter((path) => path.startsWith("audit_logs/"));

const checks = {
  b17b_formal_write_scope: pass(
    result.mode === "formal-internal-write"
      && result.stage === "B17B"
      && result.project_id === "ewalk-ai-system-prod"
      && result.approved_by === "提姆先生"
      && result.production_write_allowed === true
      && result.production_write_scope === "approvals_and_audit_logs_only"
      && result.external_side_effects_allowed === false
      && onlyInternalPaths(documentPaths),
    "B17B 只允許 approvals / audit_logs 內部正式寫入，且外部副作用仍為 false。",
  ),
  b18_audit_log: pass(
    auditPaths.length >= 2
      && typeof result.commit_audit_log === "string"
      && result.commit_audit_log.startsWith("audit_logs/"),
    "正式寫入包含 preview audit log 與 commit audit log。",
  ),
  b19_command_center_queue: pass(
    /collection\(db,\s*"approvals"\)/.test(liveAdapter)
      && result.approval_count === 6,
    "Command Center live adapter 已讀取 approvals collection，且正式寫入 6 筆 approvals。",
  ),
  b20_internal_work_loop: pass(
    result.wrote_to_firestore === documentPaths.length
      && result.verified_from_firestore === result.wrote_to_firestore,
    "寫入後已逐筆回查，內部工作閉環成立。",
  ),
  b21_readback: pass(
    Array.isArray(result.verified_paths)
      && result.verified_paths.length === result.document_paths.length
      && onlyInternalPaths(result.verified_paths),
    "正式 Firestore 寫入已讀回驗證，且驗證路徑仍限 approvals / audit_logs。",
  ),
  b22_rejection_boundary: pass(
    includesAll(result.blocked_scope, [
      "正式發文",
      "正式部署",
      "正式客戶通道",
      "廣告預算",
      "金流",
    ])
      && includesAll(preview.not_approved, ["正式客戶通道", "廣告預算", "金流"]),
    "外部副作用邊界仍封鎖：發文、部署、正式客戶通道、廣告與金流未開放。",
  ),
};

const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "post-production-internal-review",
  stage: "B17B-B22",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_internal_production_write_review" : "blocked",
  production_write_scope: result.production_write_scope,
  external_side_effects_allowed: false,
  checks,
  result_summary: {
    wrote_to_firestore: result.wrote_to_firestore,
    verified_from_firestore: result.verified_from_firestore,
    approval_count: result.approval_count,
    commit_audit_log: result.commit_audit_log,
  },
  still_blocked: [
    "正式發文",
    "正式部署",
    "正式客戶通道",
    "廣告預算",
    "金流",
    "帳務或付款設定",
    "任意 exec",
    "完整 Brain / 接案碟讀取",
  ],
  next_allowed_step: allPassed
    ? "Command Center 可使用正式 approvals / audit_logs 做內部追蹤；外部副作用仍需逐案批准。"
    : "不得前進，先修正 failed checks。",
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B17B-B22 post-write review 已產生：${outputPath}`);
console.log(`overall_status: ${review.overall_status}`);
for (const [key, value] of Object.entries(checks)) {
  console.log(`${key}: ${value.pass ? "PASS" : "FAIL"}`);
}
console.log("external_side_effects_allowed: false");
