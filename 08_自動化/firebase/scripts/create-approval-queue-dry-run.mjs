#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const outputPath = resolve(firebaseDir, "output/approval-queue.dry-run.json");

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
      continue;
    }
    result[key] = next;
    index += 1;
  }
  return result;
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

function statusSummary(documents) {
  const approvals = Object.values(documents);
  return {
    total: approvals.length,
    pending: approvals.filter((item) => item.status === "pending").length,
    approved: approvals.filter((item) => item.status === "approved").length,
    rejected: approvals.filter((item) => item.status === "rejected").length,
    high_risk: approvals.filter((item) => ["L4", "L5"].includes(item.permission_level)).length,
  };
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    return {
      mode: "dry-run",
      project_id: "ewalk-ai-system-prod",
      generated_at: null,
      summary: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        high_risk: 0,
      },
      documents: {},
    };
  }
}

function defaultApprovals(createdAt) {
  return [
    {
      approval_id: "approval_20260602_meta_hansik_publish_001",
      target_type: "content_queue",
      target_id: "meta-fb-hansik-20260518-004",
      client_id: "hansik-daily-hotpot",
      client_name: "韓食日常鍋物",
      category: "publish",
      permission_level: "L4",
      status: "pending",
      requested_by: "ashun",
      final_approver: "提姆先生",
      title: "韓食日常鍋物品牌日常貼文進入正式發文流程",
      request_summary: "允許已審過的品牌日常內容進入 Meta 發文工具執行。",
      business_value: "用韓食做全自動發文樣板，驗證 Ewalk.ai 客戶社群營運流程。",
      risk_summary: "會對外出現在 Facebook 粉專，消費者看得到。",
      reject_impact: "內容維持已批准待發布，不會對外發布。",
      rollback_plan: "若發出後需要撤回，只能人工到粉專刪除或隱藏貼文。",
      ashun_recommendation: "先不要自動發，等 Meta 發文工具與標示規則再做一次最終批准。",
      requested_at: createdAt,
      expires_at: addDays(createdAt, 7),
      source_refs: [
        "Ewalk.ai Brain/01_客戶/韓食日常鍋物/02_活動與內容/Meta自動發文佇列.md",
      ],
    },
    {
      approval_id: "approval_20260602_github_research_daily_001",
      target_type: "automation",
      target_id: "github-self-upgrade-daily-research",
      client_id: null,
      client_name: "Ewalk.ai 系統",
      category: "scheduled_research",
      permission_level: "L3",
      status: "pending",
      requested_by: "ashun",
      final_approver: "提姆先生",
      title: "每日 04:00 GitHub 自我升級情報研究",
      request_summary: "讓 GitHub 研究員定期整理 AI 工具、蒸餾、省 token、Agent 工作流等高討論內容。",
      business_value: "把外部開源討論轉成 Ewalk.ai 的優化建議，減少提姆先生自己追資訊的時間。",
      risk_summary: "會消耗自動化執行成本；若接 Discord 或 Email，會產生通知輸出。",
      reject_impact: "維持人工研究，需要時再手動叫阿順查。",
      rollback_plan: "停用排程即可，不會影響既有客戶資料。",
      ashun_recommendation: "先做每週一次摘要，比每日跑更省 token；穩定後再改每日。",
      requested_at: createdAt,
      expires_at: addDays(createdAt, 14),
      source_refs: [
        "Ewalk.ai Brain/08_自動化/GitHub自我升級情報自動化規則.md",
      ],
    },
    {
      approval_id: "approval_20260602_firebase_blaze_storage_001",
      target_type: "system_setting",
      target_id: "firebase_blaze_storage_enablement",
      client_id: null,
      client_name: "Ewalk.ai 系統",
      category: "billing",
      permission_level: "L4",
      status: "pending",
      requested_by: "ashun",
      final_approver: "提姆先生",
      title: "Firebase Blaze / Storage 啟用",
      request_summary: "啟用正式 Storage，讓客戶素材可進雲端儲存與權限控管。",
      business_value: "未來客戶素材、圖片、PDF、報表可以統一歸檔，Command Center 可直接引用。",
      risk_summary: "會進入付費方案，若沒有預算警示與用量控管可能產生費用。",
      reject_impact: "素材先維持本機與 Obsidian 檔案路徑管理。",
      rollback_plan: "設定預算警示、限制 Storage rules；必要時停用新上傳流程。",
      ashun_recommendation: "目前先不批准，等主機與預算監控建好後再開。",
      requested_at: createdAt,
      expires_at: addDays(createdAt, 30),
      source_refs: [
        "Ewalk.ai Brain/08_自動化/Firebase導入與系統優化路線圖.md",
      ],
    },
    {
      approval_id: "approval_20260602_thevision_meta_budget_001",
      target_type: "ad_budget",
      target_id: "thevision-meta-monthly-budget",
      client_id: "thevision",
      client_name: "TheVision",
      category: "ad_budget",
      permission_level: "L4",
      status: "pending",
      requested_by: "ashun",
      final_approver: "提姆先生",
      title: "TheVision Meta 廣告月預算上限設定",
      request_summary: "建立 TheVision 社群與廣告代操樣板時，先定義可被系統追蹤的預算上限。",
      business_value: "讓廣告投放專員之後可以產出建議與月報，不會散在聊天紀錄裡。",
      risk_summary: "若直接套用到廣告帳戶，會影響實際投放成本。",
      reject_impact: "只保留內容與策略規劃，不進入預算追蹤。",
      rollback_plan: "預算設定僅作內部紀錄；正式廣告帳戶仍需人工操作與再次批准。",
      ashun_recommendation: "先做內部建議，不接正式廣告帳戶。",
      requested_at: createdAt,
      expires_at: addDays(createdAt, 14),
      source_refs: [
        "Ewalk.ai Brain/01_客戶/TheVision",
      ],
    },
  ];
}

const args = parseArgs(process.argv.slice(2));
const createdAt = nowIso();
const existing = await readExisting();
existing.generated_at = createdAt;

if (args.seedDefaults || Object.keys(existing.documents).length === 0) {
  for (const item of defaultApprovals(createdAt)) {
    existing.documents[`approvals/${item.approval_id}`] = item;
  }
}

existing.summary = statusSummary(existing.documents);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");

console.log(`Approval Queue dry-run 已產生：${outputPath}`);
console.log(`待批准：${existing.summary.pending} 筆；模式：dry-run，不會寫入正式 Firebase`);
