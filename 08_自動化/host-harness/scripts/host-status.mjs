#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const harnessRoot = resolve(scriptDir, "..");
const automationRoot = resolve(harnessRoot, "..");
const vaultRoot = resolve(automationRoot, "..");
const workspaceRoot = resolve(vaultRoot, "..");
const outputDir = resolve(harnessRoot, "output");
const statusDir = resolve(harnessRoot, "status");
const commandCenterDataPath = resolve(
  automationRoot,
  "firebase/command-center-app/data/host-status.js"
);

function run(command, args = []) {
  return new Promise((resolveRun) => {
    execFile(command, args, { timeout: 20000 }, (error, stdout, stderr) => {
      resolveRun({
        command,
        args,
        ok: !error,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error: error ? error.message : null,
      });
    });
  });
}

function parseDf(output) {
  const lines = output.trim().split(/\n+/);
  const row = lines[1]?.trim().split(/\s+/);
  if (!row) return null;
  return {
    filesystem: row[0],
    size: row[1],
    used: row[2],
    available: row[3],
    capacity: row[4],
    mount: row.slice(8).join(" ") || row[row.length - 1],
  };
}

function parseSwVers(output) {
  const result = {};
  for (const line of output.split("\n")) {
    const [key, value] = line.split(":").map((item) => item.trim());
    if (key) result[key] = value;
  }
  return result;
}

function parseHardware(output) {
  const wanted = ["Model Name", "Chip", "Memory", "Model Identifier"];
  const result = {};
  for (const line of output.split("\n")) {
    const [key, value] = line.split(":").map((item) => item.trim());
    if (wanted.includes(key)) result[key] = value;
  }
  return result;
}

function parsePmset(output) {
  const result = {};
  for (const line of output.split("\n")) {
    const match = line.trim().match(/^([A-Za-z0-9 ]+)\s+(.+)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    if (["sleep", "displaysleep", "disksleep", "autorestart", "womp", "tcpkeepalive"].includes(key)) {
      result[key] = value;
    }
  }
  return result;
}

function todayTaipei() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatTaipei(value) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
}

function safeUptime() {
  try {
    return Math.round(os.uptime());
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await mkdir(statusDir, { recursive: true });
  await mkdir(dirname(commandCenterDataPath), { recursive: true });

  const [swVers, hardware, pmset, rootDf, dataDf, workDiskDf, vaultSize, workspaceSize] = await Promise.all([
    run("sw_vers"),
    run("system_profiler", ["SPHardwareDataType"]),
    run("pmset", ["-g", "custom"]),
    run("df", ["-h", "/"]),
    run("df", ["-h", "/System/Volumes/Data"]),
    run("df", ["-h", "/Volumes/提姆接案碟"]),
    run("du", ["-sh", vaultRoot]),
    run("du", ["-sh", workspaceRoot]),
  ]);

  const now = new Date();
  const status = {
    schema_version: "2026-06-04.phase0",
    mode: "local_status",
    host_id: "ewalk_mac_studio_ashun_host",
    generated_at: now.toISOString(),
    generated_at_taipei: formatTaipei(now),
    hostname: os.hostname(),
    uptime_seconds: safeUptime(),
    platform: `${os.type()} ${os.release()}`,
    macos: parseSwVers(swVers.stdout),
    hardware: parseHardware(hardware.stdout),
    power: parsePmset(pmset.stdout),
    disks: {
      system_root: parseDf(rootDf.stdout),
      data: parseDf(dataDf.stdout),
      work_disk: workDiskDf.ok ? parseDf(workDiskDf.stdout) : null,
    },
    sizes: {
      vault: vaultSize.stdout.split(/\s+/)[0] || null,
      workspace: workspaceSize.stdout.split(/\s+/)[0] || null,
    },
    guardrails: {
      external_side_effects: "blocked_by_default",
      high_risk_actions: "approval_required",
      formal_firestore_write: "approval_required",
      openclaw_mode: "test_workspace_only",
    },
    health: {
      sleep_disabled: parsePmset(pmset.stdout).sleep === "0",
      disk_sleep_disabled: parsePmset(pmset.stdout).disksleep === "0",
      work_disk_mounted: Boolean(workDiskDf.ok),
    },
  };

  const outputPath = resolve(outputDir, "host-status.latest.json");
  await writeFile(outputPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");

  const statusMd = `# 阿順主機狀態檢查

建立時間：${status.generated_at_taipei}
主機：${status.hostname}

## 狀態

| 項目 | 結果 |
| --- | --- |
| 主機定位 | Mac Studio 阿順專用主機 |
| 機型 | ${status.hardware["Model Name"] || "未知"} |
| 晶片 | ${status.hardware.Chip || "未知"} |
| 記憶體 | ${status.hardware.Memory || "未知"} |
| macOS | ${status.macos.ProductVersion || "未知"} |
| 主機睡眠 | ${status.health.sleep_disabled ? "已關閉" : "需檢查"} |
| 磁碟睡眠 | ${status.health.disk_sleep_disabled ? "已關閉" : "需檢查"} |
| 工作磁碟 | ${status.health.work_disk_mounted ? "已掛載 /Volumes/提姆接案碟" : "未掛載"} |
| Vault 大小 | ${status.sizes.vault || "未知"} |
| Workspace 大小 | ${status.sizes.workspace || "未知"} |

## 磁碟

| 位置 | 已用 | 可用 | 使用率 |
| --- | --- | --- | --- |
| 內建資料碟 | ${status.disks.data?.used || "未知"} | ${status.disks.data?.available || "未知"} | ${status.disks.data?.capacity || "未知"} |
| 提姆接案碟 | ${status.disks.work_disk?.used || "未掛載"} | ${status.disks.work_disk?.available || "未掛載"} | ${status.disks.work_disk?.capacity || "未掛載"} |

## Guardrails

- 低風險內部整理：可自動執行。
- 對外發布、金流、廣告預算、正式部署：必須提姆先生批准。
- OpenClaw 第一階段只允許測試 workspace。
`;

  const mdPath = resolve(statusDir, `${todayTaipei()}_阿順主機狀態.md`);
  await writeFile(mdPath, statusMd, "utf8");

  const appPayload = {
    ...status,
    status_md_path: mdPath,
  };
  await writeFile(
    commandCenterDataPath,
    `window.EWALK_HOST_STATUS = ${JSON.stringify(appPayload, null, 2)};\n`,
    "utf8"
  );

  console.log(`阿順主機狀態已更新：${outputPath}`);
  console.log(`Command Center 主機狀態資料已更新：${commandCenterDataPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
