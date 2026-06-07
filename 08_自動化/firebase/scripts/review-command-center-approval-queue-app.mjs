#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const appDir = resolve(firebaseDir, "command-center-app");
const b23ReviewPath = resolve(firebaseDir, "output/command-center-production-readonly.review.json");
const b23SnapshotPath = resolve(firebaseDir, "output/command-center-production-readonly.snapshot.json");
const appDataPath = resolve(appDir, "data/approval-queue.js");
const indexPath = resolve(appDir, "index.html");
const appJsPath = resolve(appDir, "app.js");
const liveAdapterPath = resolve(appDir, "firestore-live-adapter.js");
const outputPath = resolve(firebaseDir, "output/command-center-approval-queue-app.review.json");

function pass(condition, detail) {
  return { pass: Boolean(condition), detail };
}

function parseAppData(text) {
  const prefix = "window.EWALK_APPROVAL_QUEUE = ";
  if (!text.startsWith(prefix)) {
    throw new Error("B24_BLOCKED_APP_DATA：approval-queue.js 格式不是 window.EWALK_APPROVAL_QUEUE。");
  }
  const jsonText = text.slice(prefix.length).replace(/;\s*$/, "");
  return JSON.parse(jsonText);
}

function containsAny(text, values) {
  return values.some((value) => text.includes(value));
}

function hasAllColumns(html, columns) {
  return columns.every((column) => html.includes(`<th>${column}</th>`));
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

const generatedAt = new Date().toISOString();
const [b23Review, appDataText, indexHtml, appJs, liveAdapter] = await Promise.all([
  readFile(b23ReviewPath, "utf8").then((text) => JSON.parse(text)),
  readFile(appDataPath, "utf8"),
  readFile(indexPath, "utf8"),
  readFile(appJsPath, "utf8"),
  readFile(liveAdapterPath, "utf8"),
]);

let appData = parseAppData(appDataText);
let restoredFromB23Snapshot = false;
if (appData.mode !== "production-readonly" || !(appData.approvals || []).length) {
  const b23Snapshot = await readJsonOrNull(b23SnapshotPath);
  if (b23Snapshot?.mode === "production-readonly" && b23Snapshot.approvals?.length) {
    appData = appDataFromSnapshot(b23Snapshot);
    restoredFromB23Snapshot = true;
    await writeFile(
      appDataPath,
      `window.EWALK_APPROVAL_QUEUE = ${JSON.stringify(appData, null, 2)};\n`,
      "utf8",
    );
    console.log("B24_RESTORED_APPROVAL_QUEUE_FROM_B23_SNAPSHOT");
  }
}
const approvals = appData.approvals || [];
const appSource = `${indexHtml}\n${appJs}\n${liveAdapter}`;
const mainUiSource = `${indexHtml}\n${appJs}`;
const pendingCount = approvals.filter((item) => item.status === "pending").length;
const approvedButNotExecutedCount = approvals.filter((item) => item.status === "approved_but_not_executed").length;
const highRiskCount = approvals.filter((item) => ["L4", "L5"].includes(item.permission_level)).length;

const firestoreWriteApiBlocked = !/setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction|documents:commit|documents:batchWrite/.test(appSource);
const highRiskToolLinksBlocked = !containsAny(mainUiSource, [
  "owner-bootstrap.html",
  "import-clients.html",
  "deploy-firestore-rules.html",
]);
const executionCopyBlocked = !containsAny(mainUiSource, [
  "批准並執行",
  "立即發文",
  "部署 Firestore Rules",
  "寫入 Firebase",
  "啟用廣告",
  "付款",
]);

const checks = {
  b24_depends_on_b23: pass(
    b23Review.overall_status === "passed_command_center_production_readonly"
      && b23Review.external_side_effects_allowed === false,
    "B24 只在 B23 production-readonly 通過後執行，且外部副作用仍為 false。",
  ),
  b24_app_data: pass(
    appData.mode === "production-readonly"
      && appData.project_id === "ewalk-ai-system-prod"
      && approvals.length >= 6
      && pendingCount >= 1
      && approvedButNotExecutedCount >= 1,
    restoredFromB23Snapshot
      ? "Command Center approval queue data 已從 B23 production-readonly snapshot 還原，且讀到待批准與已批准未執行項目。"
      : "Command Center approval queue data 使用 production-readonly snapshot，且讀到待批准與已批准未執行項目。",
  ),
  b24_required_columns: pass(
    hasAllColumns(indexHtml, ["事項", "客戶 / 系統", "類型", "為什麼要做", "風險", "狀態", "阿順建議"])
      && appJs.includes("risk_summary")
      && appJs.includes("ashun_recommendation"),
    "Approval Queue 表格包含事項、客戶、類型、價值、風險、狀態與阿順建議欄位。",
  ),
  b24_no_write_api_in_main_app: pass(
    firestoreWriteApiBlocked,
    "Command Center 主畫面與 live adapter 沒有 Firestore 寫入 API 或 REST commit 呼叫。",
  ),
  b24_high_risk_tools_isolated: pass(
    highRiskToolLinksBlocked,
    "Command Center 主畫面沒有連到 owner bootstrap、client import 或 rules deploy 高風險工具頁。",
  ),
  b24_no_execution_affordance: pass(
    executionCopyBlocked,
    "Command Center 主畫面沒有批准並執行、立即發文、部署、付款或啟用廣告等執行型文案。",
  ),
};

const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "command-center-approval-queue-app-review",
  stage: "B24",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_command_center_app_readonly_review" : "blocked",
  project_id: appData.project_id,
  approval_count: approvals.length,
  pending_count: pendingCount,
  approved_but_not_executed_count: approvedButNotExecutedCount,
  high_risk_count: highRiskCount,
  production_write_allowed: false,
  external_side_effects_allowed: false,
  checks,
  still_blocked: [
    "批准按鈕直接改狀態",
    "正式發文",
    "正式部署",
    "正式客戶通道",
    "廣告預算",
    "金流",
    "帳務或付款設定",
    "寫入 Firebase",
  ],
  next_allowed_step: allPassed
    ? "可進入 B25：Command Center approval item 人工決策流程 mock，不直接改 production。"
    : "不得前進，先修正 failed checks。",
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B24 Command Center app review 已產生：${outputPath}`);
console.log(`approval_count: ${review.approval_count}`);
console.log(`pending_count: ${review.pending_count}`);
console.log(`approved_but_not_executed_count: ${review.approved_but_not_executed_count}`);
console.log(`overall_status: ${review.overall_status}`);
console.log("production_write_allowed: false");
console.log("external_side_effects_allowed: false");

if (!allPassed) {
  process.exitCode = 1;
}
