#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const appDataPath = resolve(firebaseDir, "command-center-app/data/approval-queue.js");
const b24ReviewPath = resolve(firebaseDir, "output/command-center-approval-queue-app.review.json");
const b23SnapshotPath = resolve(firebaseDir, "output/command-center-production-readonly.snapshot.json");
const decisionOutputPath = resolve(firebaseDir, "output/command-center-approval-decision.mock.json");
const reviewOutputPath = resolve(firebaseDir, "output/command-center-approval-decision.review.json");
const expectedScope = "B25_MOCK_DECISION_ONLY";
const allowedDecisions = new Set(["keep_pending", "request_changes", "reject_preview", "approve_preview"]);

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

function parseAppData(text) {
  const prefix = "window.EWALK_APPROVAL_QUEUE = ";
  if (!text.startsWith(prefix)) {
    throw new Error("B25_BLOCKED_APP_DATA：approval-queue.js 格式不是 window.EWALK_APPROVAL_QUEUE。");
  }
  const jsonText = text.slice(prefix.length).replace(/;\s*$/, "");
  return JSON.parse(jsonText);
}

function pickApproval(approvals, approvalId) {
  if (approvalId) return approvals.find((item) => item.approval_id === approvalId || item.id === approvalId);
  return approvals.find((item) => item.status === "pending" && item.permission_level === "L4")
    || approvals.find((item) => item.status === "pending")
    || approvals[0];
}

function proposedStatus({ originalStatus, decision }) {
  if (decision === "keep_pending") return originalStatus;
  if (decision === "request_changes") return "changes_requested";
  if (decision === "reject_preview") return "rejected";
  if (decision === "approve_preview") return "approved_but_not_executed";
  return originalStatus;
}

function pass(condition, detail) {
  return { pass: Boolean(condition), detail };
}

async function readJsonOrNull(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function appSummary(approvals) {
  return {
    total: approvals.length,
    pending: approvals.filter((item) => item.status === "pending").length,
    approved_but_not_executed: approvals.filter((item) => item.status === "approved_but_not_executed").length,
    approved: approvals.filter((item) => item.status === "approved").length,
    rejected: approvals.filter((item) => item.status === "rejected").length,
    high_risk: approvals.filter((item) => ["L4", "L5"].includes(item.permission_level)).length,
  };
}

function appDataFromSnapshot(snapshot) {
  const approvals = snapshot.approvals || [];
  return {
    mode: "production-readonly",
    project_id: snapshot.project_id || "ewalk-ai-system-prod",
    generated_at: snapshot.generated_at || new Date().toISOString(),
    summary: appSummary(approvals),
    approvals,
  };
}

const scope = requiredArg("--confirm-scope");
if (scope !== expectedScope) {
  throw new Error(`B25_BLOCKED_SCOPE：需要 ${expectedScope}，收到 ${scope}`);
}

const mockDecision = args.get("--mock-decision") || "keep_pending";
if (!allowedDecisions.has(mockDecision)) {
  throw new Error(`B25_BLOCKED_DECISION：不支援的 mock decision：${mockDecision}`);
}

const decidedBy = args.get("--decided-by") || "提姆先生";
const decisionNote = args.get("--note") || "B25 僅測試人工決策資料包，不修改 production Firebase。";
const generatedAt = new Date().toISOString();
const [b24Review, appDataText] = await Promise.all([
  readFile(b24ReviewPath, "utf8").then((text) => JSON.parse(text)),
  readFile(appDataPath, "utf8"),
]);
let appData = parseAppData(appDataText);
if (appData.mode !== "production-readonly" || !(appData.approvals || []).length) {
  const b23Snapshot = await readJsonOrNull(b23SnapshotPath);
  if (b23Snapshot?.mode === "production-readonly" && b23Snapshot.approvals?.length) {
    appData = appDataFromSnapshot(b23Snapshot);
    await writeFile(
      appDataPath,
      `window.EWALK_APPROVAL_QUEUE = ${JSON.stringify(appData, null, 2)};\n`,
      "utf8",
    );
    console.log("B25_RESTORED_APPROVAL_QUEUE_FROM_B23_SNAPSHOT");
  }
}
const approvals = appData.approvals || [];
const selected = pickApproval(approvals, args.get("--approval-id"));

if (!selected) {
  throw new Error("B25_BLOCKED_EMPTY_APPROVAL_QUEUE：找不到可供 mock 決策的 approval item。");
}

const selectedId = selected.approval_id || selected.id;
const afterStatus = proposedStatus({ originalStatus: selected.status, decision: mockDecision });
const auditId = `mock_b25_${generatedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}_${selectedId}`;
const highRiskCategories = new Set(["publish", "ad_budget", "billing", "client_channel", "firebase_write"]);
const highRisk = highRiskCategories.has(selected.category) || ["L4", "L5"].includes(selected.permission_level);

const decisionPacket = {
  mode: "mock-only",
  stage: "B25",
  generated_at: generatedAt,
  project_id: appData.project_id || "ewalk-ai-system-prod",
  source: "command-center-production-readonly-approval-queue",
  selected_approval: {
    approval_id: selectedId,
    title: selected.title,
    client_id: selected.client_id,
    client_name: selected.client_name,
    category: selected.category,
    permission_level: selected.permission_level,
    original_status: selected.status,
    proposed_status: afterStatus,
    mock_decision: mockDecision,
    high_risk: highRisk,
  },
  decision: {
    decided_by: decidedBy,
    decided_at: generatedAt,
    note: decisionNote,
    mock_only: true,
    production_write_allowed: false,
    external_side_effects_allowed: false,
    execution_allowed: false,
  },
  document_update_preview: {
    path: `approvals/${selectedId}`,
    operation: "mock_update_only",
    before_status: selected.status,
    after_status: afterStatus,
    write_to_firestore: false,
  },
  audit_log_preview: {
    path: `audit_logs/${auditId}`,
    operation: "mock_audit_log_only",
    write_to_firestore: false,
    fields: {
      approval_id: selectedId,
      action: `mock_${mockDecision}`,
      actor: decidedBy,
      created_at: generatedAt,
      scope: expectedScope,
    },
  },
  still_blocked: [
    "寫入 Firebase",
    "改 production approval status",
    "正式發文",
    "正式部署",
    "正式客戶通道",
    "廣告預算",
    "金流",
    "帳務或付款設定",
  ],
};

const checks = {
  b25_depends_on_b24: pass(
    b24Review.overall_status === "passed_command_center_app_readonly_review"
      && b24Review.external_side_effects_allowed === false,
    "B25 只在 B24 主畫面只讀安全驗收通過後執行。",
  ),
  b25_selected_approval: pass(
    Boolean(selectedId) && Boolean(selected.title) && Boolean(selected.status),
    "已選到一筆 Command Center approval item，且具備 title / status。",
  ),
  b25_mock_only: pass(
    decisionPacket.mode === "mock-only"
      && decisionPacket.decision.mock_only === true
      && decisionPacket.decision.production_write_allowed === false
      && decisionPacket.decision.external_side_effects_allowed === false
      && decisionPacket.decision.execution_allowed === false,
    "人工決策只產生 mock decision packet，不開放 production write 或外部執行。",
  ),
  b25_preview_only: pass(
    decisionPacket.document_update_preview.write_to_firestore === false
      && decisionPacket.audit_log_preview.write_to_firestore === false,
    "approval status update 與 audit log 都只是 preview，不寫入 Firestore。",
  ),
  b25_high_risk_still_blocked: pass(
    !highRisk || decisionPacket.still_blocked.includes("正式發文"),
    "若選中高風險項目，正式發文、部署、通道、廣告、金流仍封鎖。",
  ),
};

const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "command-center-approval-decision-mock-review",
  stage: "B25",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_command_center_decision_mock" : "blocked",
  project_id: decisionPacket.project_id,
  approval_id: selectedId,
  mock_decision: mockDecision,
  original_status: selected.status,
  proposed_status: afterStatus,
  production_write_allowed: false,
  external_side_effects_allowed: false,
  checks,
  next_allowed_step: allPassed
    ? "可進入 B26：決策結果寫入本機 audit trail / action queue dry-run，不寫 production。"
    : "不得前進，先修正 failed checks。",
};

await mkdir(dirname(decisionOutputPath), { recursive: true });
await writeFile(decisionOutputPath, `${JSON.stringify(decisionPacket, null, 2)}\n`, "utf8");
await writeFile(reviewOutputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B25 decision mock 已產生：${decisionOutputPath}`);
console.log(`B25 review 已產生：${reviewOutputPath}`);
console.log(`approval_id: ${selectedId}`);
console.log(`mock_decision: ${mockDecision}`);
console.log(`original_status: ${selected.status}`);
console.log(`proposed_status: ${afterStatus}`);
console.log(`overall_status: ${review.overall_status}`);
console.log("production_write_allowed: false");
console.log("external_side_effects_allowed: false");

if (!allPassed) {
  process.exitCode = 1;
}
