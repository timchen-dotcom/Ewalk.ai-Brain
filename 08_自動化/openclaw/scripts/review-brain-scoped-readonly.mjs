#!/usr/bin/env node

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const openclawDir = resolve(scriptDir, "..");
const automationDir = resolve(openclawDir, "..");
const brainDir = resolve(automationDir, "..");
const configPath = resolve(openclawDir, "config/openclaw-controlled-work.allowlist.json");
const b27ReviewPath = resolve(openclawDir, "output/b27-controlled-draft-write.review.json");
const outputPath = resolve(openclawDir, "output/b28-brain-scoped-readonly.review.json");
const expectedScope = "B28_BRAIN_SCOPED_READONLY_ONLY";

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

async function findSampleMarkdown(root, maxDepth = 2) {
  const queue = [{ dir: root, depth: 0 }];
  let inspected = 0;
  while (queue.length && inspected < 120) {
    const current = queue.shift();
    const entries = await readdir(current.dir, { withFileTypes: true });
    for (const entry of entries.slice(0, 50)) {
      inspected += 1;
      const entryPath = resolve(current.dir, entry.name);
      if (entry.isDirectory() && current.depth < maxDepth) {
        queue.push({ dir: entryPath, depth: current.depth + 1 });
      }
      if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
        return entryPath;
      }
      if (inspected >= 120) break;
    }
  }
  return null;
}

const scope = requiredArg("--confirm-scope");
if (scope !== expectedScope) {
  throw new Error(`B28_BLOCKED_SCOPE：需要 ${expectedScope}，收到 ${scope}`);
}

const generatedAt = new Date().toISOString();
const [config, b27Review] = await Promise.all([
  readFile(configPath, "utf8").then((text) => JSON.parse(text)),
  readFile(b27ReviewPath, "utf8").then((text) => JSON.parse(text)),
]);

const readRoots = config.read_roots.map((root) => ({
  ...root,
  absolutePath: resolve(brainDir, root.path),
}));
const writeRoots = config.write_roots.map((root) => ({
  ...root,
  absolutePath: resolve(brainDir, root.path),
}));
const blockedRoots = config.blocked_roots.map((path) => resolve(brainDir, path));

const rootReviews = [];
for (const root of readRoots) {
  const rootStat = await stat(root.absolutePath);
  const entries = await readdir(root.absolutePath, { withFileTypes: true });
  const sampleMarkdown = await findSampleMarkdown(root.absolutePath);
  let sampleRead = null;
  if (sampleMarkdown) {
    const sampleStat = await stat(sampleMarkdown);
    const sampleText = await readFile(sampleMarkdown, "utf8");
    sampleRead = {
      path: relPath(sampleMarkdown),
      size: sampleStat.size,
      chars_read_for_probe: Math.min(sampleText.length, 4096),
      content_printed: false,
    };
  }
  rootReviews.push({
    id: root.id,
    path: root.path,
    mode: root.mode,
    exists: rootStat.isDirectory(),
    top_level_entry_count: entries.length,
    sample_names: entries.slice(0, 12).map((entry) => entry.name),
    sample_markdown_read: sampleRead,
  });
}

const readRootsInsideBrain = readRoots.every((root) => isInside(brainDir, root.absolutePath));
const writeRootsInsideBrain = writeRoots.every((root) => isInside(brainDir, root.absolutePath));
const readRootsDoNotOverlapBlocked = readRoots.every((root) =>
  blockedRoots.every((blocked) => !isInside(blocked, root.absolutePath) && !isInside(root.absolutePath, blocked)),
);
const writeRootsDoNotOverlapBlocked = writeRoots.every((root) =>
  blockedRoots.every((blocked) => !isInside(blocked, root.absolutePath) && !isInside(root.absolutePath, blocked)),
);
const scopedAllowlistText = JSON.stringify({
  read_roots: config.read_roots,
  write_roots: config.write_roots,
});
const noSecretsInAllowlist = scopedAllowlistText.match(/secret|token|api[_-]?key|password|付款|金流|billing/i) === null;

const checks = {
  b28_depends_on_b27: pass(
    b27Review.overall_status === "passed_openclaw_controlled_draft_write"
      && b27Review.production_write_allowed === false
      && b27Review.external_side_effects_allowed === false,
    "B28 只在 B27 限定草稿寫入通過後啟用。",
  ),
  b28_read_roots_exist: pass(
    rootReviews.every((root) => root.exists),
    "所有指定 read_roots 都存在且可列目錄。",
  ),
  b28_roots_inside_brain: pass(
    readRootsInsideBrain && writeRootsInsideBrain,
    "read_roots 與 write_roots 都必須位於正式 Brain 內。",
  ),
  b28_blocked_roots_isolated: pass(
    readRootsDoNotOverlapBlocked && writeRootsDoNotOverlapBlocked,
    "allowlist 不得覆蓋 blocked_roots。",
  ),
  b28_markdown_probe: pass(
    rootReviews.every((root) => root.sample_markdown_read === null || root.sample_markdown_read.content_printed === false),
    "read-only probe 可讀取樣本檔但不輸出內容。",
  ),
  b28_no_secret_scope: pass(
    noSecretsInAllowlist,
    "allowlist 不包含 token、secret、API key、付款或金流範圍。",
  ),
};

const allPassed = Object.values(checks).every((item) => item.pass);
const review = {
  mode: "openclaw-brain-scoped-readonly-review",
  stage: "B28",
  generated_at: generatedAt,
  overall_status: allPassed ? "passed_openclaw_brain_scoped_readonly" : "blocked",
  read_roots: rootReviews,
  write_roots: config.write_roots,
  blocked_roots: config.blocked_roots,
  production_write_allowed: false,
  external_side_effects_allowed: false,
  formal_channel_allowed: false,
  ad_budget_allowed: false,
  finance_allowed: false,
  checks,
  ready_for_controlled_work: allPassed,
  controlled_work_policy: allPassed
    ? "OpenClaw 可讀指定 read_roots，並把成果寫入 B27 指定草稿區；外部副作用仍需 Command Center / 提姆先生批准。"
    : "不得進入受控上工，先修正 failed checks。",
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

console.log(`B28 review 已產生：${outputPath}`);
console.log(`read_roots: ${rootReviews.map((root) => root.path).join(", ")}`);
console.log(`overall_status: ${review.overall_status}`);
console.log(`ready_for_controlled_work: ${review.ready_for_controlled_work}`);
console.log("production_write_allowed: false");
console.log("external_side_effects_allowed: false");

if (!allPassed) {
  process.exitCode = 1;
}
