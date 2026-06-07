#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const openclawDir = resolve(scriptDir, "..");
const automationDir = resolve(openclawDir, "..");
const brainDir = resolve(automationDir, "..");
const b26ReviewPath = resolve(brainDir, "08_自動化/firebase/output/command-center-decision-dry-run.review.json");
const configPath = resolve(openclawDir, "config/openclaw-controlled-work.allowlist.json");
const outputPath = resolve(openclawDir, "output/b27-controlled-draft-write.review.json");
const expectedScope = "B27_CONTROLLED_DRAFT_WRITE_ONLY";

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

function isInside(parent, target) {
  const rel = relative(parent, target);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function relPath(path) {
  return relative(brainDir, path);
}

function safeStamp(isoText) {
  return isoText.replace(/[-:.TZ]/g, "").slice(0, 14);
}

const scope = requiredArg("--confirm-scope");
if (scope !== expectedScope) {
  throw new Error(`B27_BLOCKED_SCOPE：需要 ${expectedScope}，收到 ${scope}`);
}

const generatedAt = new Date().toISOString();
const [b26Review, config] = await Promise.all([
  readFile(b26ReviewPath, "utf8").then((text) => JSON.parse(text)),
  readFile(configPath, "utf8").then((text) => JSON.parse(text)),
]);

const writeRoots = config.write_roots.map((root) => ({
  ...root,
  absolutePath: resolve(brainDir, root.path),
}));

const inboxDraftDir = writeRoots.find((root) => root.id === "openclaw-inbox-drafts")?.absolutePath;
const dailyDraftDir = writeRoots.find((root) => root.id === "openclaw-daily-draft-backfill")?.absolutePath;
const actionQueueDir = writeRoots.find((root) => root.id === "openclaw-action-queue")?.absolutePath;

if (!inboxDraftDir || !dailyDraftDir || !actionQueueDir) {
  throw new Error("B27_BLOCKED_CONFIG：allowlist 缺少必要 write_roots。");
}

await Promise.all(writeRoots.map((root) => mkdir(root.absolutePath, { recursive: true })));
await mkdir(dirname(outputPath), { recursive: true });

const stamp = safeStamp(generatedAt);
const draftFilePath = resolve(inboxDraftDir, `B27_OpenClaw受控上工草稿_${stamp}.md`);
const dailyFilePath = resolve(dailyDraftDir, `B27_OpenClaw每日回填草稿_${stamp}.md`);
const queueFilePath = resolve(actionQueueDir, `B27_OpenClaw受控上工Queue_${stamp}.json`);

const draftBody = `---
類型: OpenClaw 受控上工草稿
狀態: draft，待 Codex 主窗口或提姆先生審查
日期: ${generatedAt.slice(0, 10)}
階段: B27
---

# B27 OpenClaw 受控上工草稿寫入測試

## 用途

確認 OpenClaw / Codex 工作流可以把低風險工作成果寫入指定草稿區，而不是只停在對話裡。

## 安全邊界

- 這是草稿，不是正式發布內容。
- 不發文、不部署、不寫 production Firebase。
- 不接正式客戶通道。
- 不操作廣告預算、金流、帳務或付款設定。
- 後續若要正式化，必須由 Codex 主窗口整理並由提姆先生批准。

## 可開始承接的工作

- 客戶資料整理草稿。
- 社群文案與內容佇列草稿。
- 廣告主軸與 CTA 草稿。
- SOP / Prompt 草稿。
- 每日交接與待辦回填草稿。
`;

const dailyBody = `---
類型: OpenClaw 每日工作回填草稿
狀態: draft，待審
日期: ${generatedAt.slice(0, 10)}
階段: B27
---

# B27 OpenClaw 每日工作回填草稿

- B27 已測試指定草稿區寫入。
- 寫入範圍只限 allowlist write_roots。
- 仍不允許外部副作用。
- 下一步是 B28：正式 Brain 指定資料夾 read-only。
`;

const queue = {
  mode: "openclaw-controlled-work-queue",
  stage: "B27",
  generated_at: generatedAt,
  status: "draft_write_ready",
  production_write_allowed: false,
  external_side_effects_allowed: false,
  allowed_write_roots: writeRoots.map((root) => root.path),
  items: [
    {
      id: `b27_openclaw_controlled_work_${stamp}`,
      title: "OpenClaw 受控上工：指定草稿區寫入已啟用",
      status: "draft",
      owner: "阿順",
      reviewer: "提姆先生",
      next_step: "B28 通過後，OpenClaw 可讀指定資料夾並把工作成果落到草稿區。",
      blocked_actions: config.blocked_external_actions,
    },
  ],
};

await writeFile(draftFilePath, draftBody, "utf8");
await writeFile(dailyFilePath, dailyBody, "utf8");
await writeFile(queueFilePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");

const writtenFiles = [draftFilePath, dailyFilePath, queueFilePath];
const allowedWriteRoots = writeRoots.map((root) => root.absolutePath);
const allWritesInsideAllowedRoots = writtenFiles.every((file) =>
  allowedWriteRoots.some((root) => isInside(root, file)),
);
const [draftCheck, dailyCheck, queueCheck] = await Promise.all([
  readFile(draftFilePath, "utf8"),
  readFile(dailyFilePath, "utf8"),
  readFile(queueFilePath, "utf8").then((text) => JSON.parse(text)),
]);

const checks = {
  b27_depends_on_b26: pass(
    b26Review.overall_status === "passed_command_center_decision_dry_run"
      && b26Review.production_write_allowed === false
      && b26Review.external_side_effects_allowed === false,
    "B27 只在 B26 決策 dry-run 通過後啟用。",
  ),
  b27_writes_only_allowed_roots: pass(
    allWritesInsideAllowedRoots,
    "B27 寫入只落在 allowlist write_roots。",
  ),
  b27_draft_marking: pass(
    draftCheck.includes("狀態: draft")
      && dailyCheck.includes("狀態: draft")
      && queueCheck.status === "draft_write_ready",
    "所有寫入都標示為 draft / 待審，不是正式發布或正式執行。",
  ),
  b27_no_external_side_effects: pass(
    queueCheck.production_write_allowed === false
      && queueCheck.external_side_effects_allowed === false
      && queueCheck.items[0].blocked_actions.includes("正式發文")
      && queueCheck.items[0].blocked_actions.includes("寫入 production Firebase"),
    "B27 沒有 production write 或外部副作用能力。",
  ),
};

const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "openclaw-controlled-draft-write-review",
  stage: "B27",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_openclaw_controlled_draft_write" : "blocked",
  written_files: writtenFiles.map(relPath),
  allowed_write_roots: writeRoots.map((root) => root.path),
  production_write_allowed: false,
  external_side_effects_allowed: false,
  checks,
  next_allowed_step: allPassed
    ? "可進入 B28：正式 Brain 指定資料夾 read-only。"
    : "不得前進，先修正 failed checks。",
};

await writeFile(outputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B27 review 已產生：${outputPath}`);
console.log(`draft_file: ${relPath(draftFilePath)}`);
console.log(`daily_draft_file: ${relPath(dailyFilePath)}`);
console.log(`queue_file: ${relPath(queueFilePath)}`);
console.log(`overall_status: ${review.overall_status}`);
console.log("production_write_allowed: false");
console.log("external_side_effects_allowed: false");

if (!allPassed) {
  process.exitCode = 1;
}
