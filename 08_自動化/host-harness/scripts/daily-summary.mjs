#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const harnessRoot = resolve(scriptDir, "..");
const automationRoot = resolve(harnessRoot, "..");
const vaultRoot = resolve(automationRoot, "..");
const workspaceRoot = resolve(vaultRoot, "..");
const firebaseRoot = resolve(automationRoot, "firebase");
const dailyRoot = resolve(vaultRoot, "14_每日工作");

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

function taipeiDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function taipeiNow() {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function valuesFromDocuments(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.ai_runs)) return payload.ai_runs;
  if (Array.isArray(payload?.approvals)) return payload.approvals;
  if (payload?.documents) return Object.values(payload.documents);
  return [];
}

async function main() {
  const status = await readJson(resolve(harnessRoot, "output/host-status.latest.json"), {});
  const aiRuns = await readJson(resolve(firebaseRoot, "output/ai-runs.dry-run.json"), { documents: {} });
  const approvals = await readJson(resolve(firebaseRoot, "output/approval-queue.dry-run.json"), { documents: {} });
  const clients = await readJson(resolve(firebaseRoot, "output/client-registry.dry-run.json"), { clients: [], summary: {} });
  const harnessRuns = await readJson(resolve(harnessRoot, "output/harness-runs.json"), { runs: [] });

  const aiRunItems = valuesFromDocuments(aiRuns);
  const approvalItems = valuesFromDocuments(approvals);
  const pendingApprovals = approvalItems.filter((item) => item.status === "pending");
  const recentRuns = harnessRuns.runs?.slice(-8).reverse() || [];
  const clientCount = clients.count || clients.clients?.length || 0;

  const md = `# ${taipeiDate()} 阿順主機日報

建立時間：${taipeiNow()}
主機：${status.hostname || "Mac Studio"}
定位：阿順專用主機

## 今日重點

- 主機狀態：${status.health?.sleep_disabled ? "主機睡眠已關閉，可長時間運作" : "主機睡眠設定需再確認"}
- 工作磁碟：${status.health?.work_disk_mounted ? "提姆接案碟已掛載" : "提姆接案碟未掛載或未偵測"}
- 客戶名冊：${clientCount} 位客戶可讀取
- AI 執行紀錄：${aiRunItems.length} 筆
- 待批准事項：${pendingApprovals.length} 筆

## 最近 Harness 任務

${recentRuns.length ? recentRuns.map((run) => `- ${run.finished_at_taipei || run.finished_at}｜${run.title}｜${run.status}`).join("\n") : "- 尚無本機 Harness 任務紀錄"}

## 待提姆先生批准

${pendingApprovals.length ? pendingApprovals.map((item) => `- ${item.title}｜${item.permission_level}｜${item.ashun_recommendation || "待阿順建議"}`).join("\n") : "- 目前沒有新的待批准事項"}

## 目前限制

- OpenClaw 尚未接正式資料。
- 不會自動發文、改廣告預算、動金流或正式部署。
- 內建資料碟可用空間有限，大型素材建議放提姆接案碟或後續備份碟。

## 阿順下一步

1. 持續建立主機級 Harness 低風險任務。
2. 將主機狀態顯示到 Command Center。
3. 待提姆先生批准後，安裝 launchd 常駐排程。
4. OpenClaw 先建立測試 workspace，再逐步驗收。
`;

  await mkdir(dailyRoot, { recursive: true });
  const outputPath = resolve(dailyRoot, `${taipeiDate()}_阿順主機日報.md`);
  await writeFile(outputPath, md, "utf8");
  console.log(`阿順主機日報已產出：${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

