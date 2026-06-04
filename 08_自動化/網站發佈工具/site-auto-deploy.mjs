import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "../../..");
const sitesDir = join(rootDir, "sites");
const configPath = join(sitesDir, "deploy.config.json");
const stateDir = join(rootDir, ".cache");
const statePath = join(stateDir, "site-auto-deploy-state.json");
const deployCommand = join(rootDir, "deploy-site-api-direct.command");

const args = new Set(process.argv.slice(2));
const deployAll = args.has("--all");
const dryRun = args.has("--dry-run");
const listOnly = args.has("--list");
const help = args.has("--help") || args.has("-h");

if (help) {
  printHelp();
  process.exit(0);
}

const config = await readJson(configPath);
const state = existsSync(statePath) ? await readJson(statePath) : {};
const projects = config.projects.filter((project) => project.autoDeployPreview === true);

if (listOnly) {
  for (const project of projects) {
    console.log(`${project.key}\t${project.name}\t${project.risk}`);
  }
  process.exit(0);
}

if (!projects.length) {
  console.log("沒有設定 autoDeployPreview 的站台。");
  process.exit(0);
}

let deployed = 0;
let skipped = 0;
let failed = 0;

for (const project of projects) {
  const siteDir = join(sitesDir, project.key);
  if (!siteDir.startsWith(sitesDir) || !existsSync(siteDir)) {
    console.log(`略過：${project.key} 找不到站台資料夾。`);
    skipped += 1;
    continue;
  }

  if (project.risk !== "low") {
    console.log(`略過：${project.key} 風險不是 low，不允許自動 Preview。`);
    skipped += 1;
    continue;
  }

  const hash = await hashDirectory(siteDir);
  const previous = state[project.key]?.hash;
  const changed = hash !== previous;

  if (!deployAll && !changed) {
    console.log(`無變更：${project.key}`);
    skipped += 1;
    continue;
  }

  if (dryRun) {
    console.log(`將部署：${project.key}${changed ? "（有變更）" : "（--all）"}`);
    continue;
  }

  console.log(`開始自動 Preview：${project.key}`);
  const result = await run(deployCommand, [project.key]);

  if (result.code === 0) {
    state[project.key] = {
      hash,
      deployedAt: new Date().toISOString()
    };
    deployed += 1;
  } else {
    failed += 1;
    console.log(`部署失敗：${project.key}，exit ${result.code}`);
  }
}

if (!dryRun) {
  await mkdir(stateDir, { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

console.log("");
console.log(`自動部署完成：部署 ${deployed}，略過 ${skipped}，失敗 ${failed}`);

if (failed > 0) {
  process.exit(1);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function hashDirectory(dir) {
  const hash = createHash("sha256");
  const files = await listFiles(dir);

  for (const file of files.sort()) {
    const rel = relative(dir, file);
    hash.update(rel);
    hash.update("\0");
    hash.update(await readFile(file));
    hash.update("\0");
  }

  return hash.digest("hex");
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (shouldIgnore(entry.name)) continue;

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function shouldIgnore(name) {
  return [
    ".DS_Store",
    ".vercel",
    "node_modules",
    "dist",
    ".next",
    ".cache"
  ].includes(name);
}

function run(command, commandArgs) {
  return new Promise((resolvePromise) => {
    const child = spawn(command, commandArgs, {
      cwd: rootDir,
      env: process.env,
      stdio: "inherit"
    });

    child.on("close", (code) => resolvePromise({ code }));
  });
}

function printHelp() {
  console.log(`Ewalk.ai 網站自動部署

用法：
  ./auto-deploy-sites.command
  ./auto-deploy-sites.command --dry-run
  ./auto-deploy-sites.command --all
  ./auto-deploy-sites.command --list

規則：
  - 只部署 sites/deploy.config.json 中 autoDeployPreview=true 的站台
  - 只允許 risk=low 的站台自動 Preview
  - Production 不會自動部署
  - 有變更才部署，--all 可強制部署全部低風險 Preview
`);
}
