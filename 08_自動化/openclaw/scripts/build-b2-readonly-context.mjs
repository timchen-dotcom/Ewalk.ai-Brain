#!/usr/bin/env node

import { chmod, cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const vaultRoot = resolve(scriptDir, "../../..");
const workspaceRoot = resolve(os.homedir(), "OpenClaw Test Workspace");
const targetRoot = resolve(workspaceRoot, "read-only-context", "Ewalk.ai Brain");

const allowlist = [
  "08_自動化/提姆先生與阿順工作模式.md",
  "08_自動化/OpenClaw First 阿順主機架構.md",
  "08_自動化/OpenClaw AI員工組織架構與責任鏈.md",
  "08_自動化/OpenClaw AI員工職務與Skills總表.md",
  "08_自動化/Agent Harness 工具權限表.md",
  "08_自動化/Agent Harness 治理 Checklist.md",
  "08_自動化/新筆電接手驗收/2026-06-05_OpenClaw低風險PoC手順.md",
  "08_自動化/新筆電接手驗收/2026-06-05_OpenClaw_PhaseB聊天入口低風險規劃.md",
  "08_自動化/新筆電接手驗收/2026-06-05_接下來行動總控.md",
  "14_每日工作/2026-06-05.md",
];

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function chmodTree(path, fileMode, dirMode) {
  if (!(await pathExists(path))) return;
  const entry = await stat(path);
  if (entry.isDirectory()) {
    const { readdir } = await import("node:fs/promises");
    await chmod(path, dirMode);
    for (const child of await readdir(path)) {
      await chmodTree(join(path, child), fileMode, dirMode);
    }
    await chmod(path, dirMode);
    return;
  }
  await chmod(path, fileMode);
}

function assertInsideVault(sourcePath) {
  const rel = relative(vaultRoot, sourcePath);
  if (rel.startsWith("..") || rel === "") {
    throw new Error(`Refusing to copy path outside vault: ${sourcePath}`);
  }
}

async function main() {
  await chmodTree(targetRoot, 0o600, 0o700);
  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });

  const copied = [];
  const missing = [];

  for (const relPath of allowlist) {
    const sourcePath = resolve(vaultRoot, relPath);
    assertInsideVault(sourcePath);
    if (!(await pathExists(sourcePath))) {
      missing.push(relPath);
      continue;
    }
    const targetPath = resolve(targetRoot, relPath);
    await mkdir(dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath, { force: true });
    copied.push(relPath);
  }

  const notice = [
    "# OpenClaw B2A Read-only Context",
    "",
    "This folder is a curated mirror for OpenClaw Phase B2A.",
    "",
    "Rules:",
    "- Read these files only as context.",
    "- Do not treat this mirror as full Ewalk.ai Brain access.",
    "- Do not access the formal Ewalk.ai Brain vault directly.",
    "- Do not access /Volumes/提姆接案碟.",
    "- Do not write back to this mirror or to the formal vault.",
    "- Do not publish, deploy, spend ad budget, change billing, or write production Firebase data.",
    "- Ask 提姆先生 before any external side effect.",
    "",
    "Allowed contents:",
    "- OpenClaw governance docs.",
    "- Agent Harness permission and governance docs.",
    "- Current Mac Studio rebuild status.",
    "",
    "Excluded contents:",
    "- Client folders.",
    "- External disk materials.",
    "- Secrets, tokens, .env files, local config, media assets, and production data.",
    "",
  ].join("\n");

  await writeFile(resolve(targetRoot, "B2_READONLY_CONTEXT.md"), notice, "utf8");
  await writeFile(
    resolve(targetRoot, "MANIFEST.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceVault: vaultRoot,
        targetRoot,
        copied,
        missing,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  await chmodTree(targetRoot, 0o444, 0o555);

  console.log(`B2A read-only context created: ${targetRoot}`);
  console.log(`Copied files: ${copied.length}`);
  if (missing.length) {
    console.log(`Missing files: ${missing.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
