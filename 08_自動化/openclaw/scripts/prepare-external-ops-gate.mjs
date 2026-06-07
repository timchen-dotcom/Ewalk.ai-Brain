#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const openclawDir = resolve(scriptDir, "..");
const b28ReviewPath = resolve(openclawDir, "output/b28-brain-scoped-readonly.review.json");
const policyPath = resolve(openclawDir, "config/openclaw-external-ops.policy.json");
const gateOutputPath = resolve(openclawDir, "output/b29-external-ops-gate.review.json");
const queueOutputPath = resolve(openclawDir, "action-queue/B29_external_ops_gate_queue.json");
const playbookOutputPath = resolve(openclawDir, "external-ops/B29_external_ops_playbook.md");
const expectedScope = "B29_EXTERNAL_OPS_APPROVAL_GATE_ONLY";

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

const scope = requiredArg("--confirm-scope");
if (scope !== expectedScope) {
  throw new Error(`B29_BLOCKED_SCOPE：需要 ${expectedScope}，收到 ${scope}`);
}

const generatedAt = new Date().toISOString();
const [b28Review, policy] = await Promise.all([
  readFile(b28ReviewPath, "utf8").then((text) => JSON.parse(text)),
  readFile(policyPath, "utf8").then((text) => JSON.parse(text)),
]);

const requiredCapabilities = [
  "social_publish",
  "deploy",
  "firebase_production_status",
  "formal_client_channel",
  "ad_budget",
  "finance_cashflow",
];
const capabilityIds = policy.capabilities.map((item) => item.id);
const allCapabilitiesPresent = requiredCapabilities.every((id) => capabilityIds.includes(id));
const allCapabilitiesApprovalRequired = policy.capabilities.every(
  (item) => item.state === "enabled_with_explicit_approval",
);
const allCapabilitiesHaveHardBlocks = policy.capabilities.every(
  (item) => Array.isArray(item.blocked_without_approval) && item.blocked_without_approval.length > 0,
);
const hasRequiredApprovalFields = [
  "approval_id",
  "approval_text",
  "approved_by",
  "preview_or_diff_path",
  "rollback_or_recovery_plan",
].every((field) => policy.global_required_fields.includes(field));
const moneyCapabilitiesBounded = policy.capabilities
  .filter((item) => ["ad_budget", "finance_cashflow"].includes(item.id))
  .every((item) => JSON.stringify(item.execution_requires).includes("批准"));

const queue = {
  mode: "openclaw-external-ops-approval-gate",
  stage: "B29",
  generated_at: generatedAt,
  status: "enabled_with_explicit_approval",
  direct_execution_allowed: false,
  production_write_allowed_without_approval: false,
  external_side_effects_allowed_without_approval: false,
  capabilities: policy.capabilities.map((capability) => ({
    id: capability.id,
    label: capability.label,
    state: capability.state,
    default_without_approval: policy.default_without_approval,
    next_action: "可建立 preview / approval item；正式執行需提姆先生針對單一 action 批准。",
  })),
};

const playbook = `# B29 External Ops 高權限總閘門

產生時間：${generatedAt}

## 一句話結論

發文、部署、production Firebase 改狀態、正式客戶通道、廣告預算、金流已從永久封鎖改為高權限 approval gate。

## 作業規則

- 沒有提姆先生明確批准時：只能 preview / draft / approval item。
- 有提姆先生明確批准時：可由對應正式工具執行，但必須留下 audit log。
- 廣告與金流必須有金額或預算上限。
- Firebase production 必須有 before / after diff。
- 部署必須有 rollback plan。
- 正式客戶通道必須有訊息內容與發送紀錄。

## 已開啟能力

${policy.capabilities.map((capability) => `- ${capability.label}：${capability.state}`).join("\n")}

## 仍不得無批准執行

${policy.capabilities.flatMap((capability) => capability.blocked_without_approval.map((item) => `- ${capability.label}：${item}`)).join("\n")}
`;

const checks = {
  b29_depends_on_b28: pass(
    b28Review.overall_status === "passed_openclaw_brain_scoped_readonly"
      && b28Review.ready_for_controlled_work === true
      && b28Review.external_side_effects_allowed === false,
    "B29 只在 B28 指定資料 read-only 通過後啟用。",
  ),
  b29_all_capabilities_present: pass(
    allCapabilitiesPresent,
    "B29 同時納入發文、部署、production Firebase、正式通道、廣告預算、金流六類能力。",
  ),
  b29_approval_required: pass(
    allCapabilitiesApprovalRequired && policy.default_without_approval === "preview_only",
    "所有高權限能力都是 enabled_with_explicit_approval；未批准只能 preview。",
  ),
  b29_direct_execution_blocked: pass(
    queue.direct_execution_allowed === false
      && queue.production_write_allowed_without_approval === false
      && queue.external_side_effects_allowed_without_approval === false,
    "B29 不允許無批准直接執行、無批准 production write 或無批准外部副作用。",
  ),
  b29_required_approval_fields: pass(
    hasRequiredApprovalFields,
    "高權限 action 必須包含 approval_id、approval_text、approved_by、preview/diff 與 rollback/recovery plan。",
  ),
  b29_hard_blocks_without_approval: pass(
    allCapabilitiesHaveHardBlocks,
    "每個能力都明列未批准時不得執行的動作。",
  ),
  b29_money_controls: pass(
    moneyCapabilitiesBounded,
    "廣告與金流能力仍需提姆先生明確批准金額、對象、平台或預算上限。",
  ),
};

const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "openclaw-external-ops-gate-review",
  stage: "B29",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_openclaw_external_ops_gate" : "blocked",
  enabled_capabilities: policy.capabilities.map((item) => ({
    id: item.id,
    label: item.label,
    state: item.state,
  })),
  direct_execution_allowed: false,
  production_write_allowed_without_approval: false,
  external_side_effects_allowed_without_approval: false,
  requires_explicit_approval_per_action: true,
  checks,
  next_allowed_step: allPassed
    ? "停止擴驗證，OpenClaw 可進入高權限受控上工：準備 preview / approval item，取得提姆先生單一 action 批准後才執行。"
    : "不得開啟高權限總閘門，先修正 failed checks。",
};

await mkdir(dirname(gateOutputPath), { recursive: true });
await mkdir(dirname(queueOutputPath), { recursive: true });
await mkdir(dirname(playbookOutputPath), { recursive: true });
await writeFile(gateOutputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");
await writeFile(queueOutputPath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
await writeFile(playbookOutputPath, playbook, "utf8");

console.log(`B29 review 已產生：${gateOutputPath}`);
console.log(`B29 queue 已產生：${queueOutputPath}`);
console.log(`B29 playbook 已產生：${playbookOutputPath}`);
console.log(`overall_status: ${review.overall_status}`);
console.log("direct_execution_allowed: false");
console.log("requires_explicit_approval_per_action: true");
console.log("production_write_allowed_without_approval: false");
console.log("external_side_effects_allowed_without_approval: false");

if (!allPassed) {
  process.exitCode = 1;
}
