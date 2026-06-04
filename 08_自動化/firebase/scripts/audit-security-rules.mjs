#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const firestoreRulesPath = resolve(firebaseDir, "firestore.rules");
const storageRulesPath = resolve(firebaseDir, "storage.rules");
const liveAdapterPath = resolve(firebaseDir, "command-center-app/firestore-live-adapter.js");
const reportPath = resolve(firebaseDir, "docs/rules-audit-report.md");

const [firestoreRules, storageRules, liveAdapter] = await Promise.all([
  readFile(firestoreRulesPath, "utf8"),
  readFile(storageRulesPath, "utf8"),
  readFile(liveAdapterPath, "utf8"),
]);

const checks = [
  {
    id: "firestore_requires_login",
    label: "Firestore 未登入者預設拒絕",
    pass: /function signedIn\(\)[\s\S]*request\.auth != null/.test(firestoreRules)
      && /match \/\{document=\*\*\}[\s\S]*allow read, write: if false;/.test(firestoreRules),
    risk: "未登入者可能讀到正式營運資料。",
  },
  {
    id: "firestore_user_roles",
    label: "Firestore 使用 users/{uid} role 判斷權限",
    pass: /documents\/users\/\$\(request\.auth\.uid\)/.test(firestoreRules) && /function role\(\)/.test(firestoreRules),
    risk: "無法區分提姆先生、內部員工、AI 員工與客戶。",
  },
  {
    id: "audit_logs_immutable",
    label: "audit_logs 不允許修改或刪除",
    pass: /match \/audit_logs\/\{logId\}[\s\S]*allow update, delete: if false;/.test(firestoreRules),
    risk: "稽核紀錄可能被覆蓋，之後無法查責任歸屬。",
  },
  {
    id: "settings_admin_only",
    label: "settings 只有 owner/admin 可寫",
    pass: /match \/settings\/\{settingId\}[\s\S]*allow write: if isAdmin\(\);/.test(firestoreRules),
    risk: "功能開關可能被非管理者調整。",
  },
  {
    id: "content_queue_no_public_write",
    label: "content_queue 沒有公開寫入",
    pass: /match \/content_queue\/\{contentId\}[\s\S]*allow create: if isStaff\(\);/.test(firestoreRules)
      && /match \/content_queue\/\{contentId\}[\s\S]*allow delete: if isAdmin\(\);/.test(firestoreRules),
    risk: "貼文佇列可能被未授權者建立、修改或刪除。",
  },
  {
    id: "live_read_role_gate",
    label: "Command Center Live Read 有 role gate",
    pass: /allowedRoles = new Set\(\["owner", "admin", "manager", "staff"\]\)/.test(liveAdapter)
      && /users", credential\.user\.uid/.test(liveAdapter),
    risk: "登入後可能略過角色檢查直接讀內部資料。",
  },
  {
    id: "storage_default_deny",
    label: "Storage 未匹配路徑預設拒絕",
    pass: /match \/\{allPaths=\*\*\}[\s\S]*allow read, write: if false;/.test(storageRules),
    risk: "正式 Storage 啟用後，未規劃路徑可能被讀寫。",
  },
  {
    id: "storage_system_admin_only",
    label: "Storage system 路徑只有 owner/admin 可寫",
    pass: /match \/system\/\{allPaths=\*\*\}[\s\S]*allow read, write: if isAdmin\(\);/.test(storageRules),
    risk: "系統素材或內部設定檔可能被一般角色修改。",
  },
];

const warnings = [
  "Storage 正式 bucket 尚未啟用；部署 Storage rules 前需先由提姆先生決策是否升級 Blaze。",
  "第一位 owner 文件需透過已批准的管理流程寫入，因為 rules 本身無法讓尚未有 owner 的帳號自我升級。",
  "Command Center Live Read 目前只讀，不應加入前端寫入、發文、預算或金流操作。",
];

const passed = checks.filter((check) => check.pass).length;
const failed = checks.length - passed;
const now = new Date().toISOString();

const rows = checks
  .map((check) => `| ${check.pass ? "通過" : "需處理"} | ${check.label} | ${check.pass ? "無" : check.risk} |`)
  .join("\n");

const report = `# Firebase Rules 部署前權限稽核報告

建立時間：${now}  
負責角色：阿順  
最終決策者：提姆先生  
結果：${failed === 0 ? "通過部署前靜態檢查" : `有 ${failed} 項需處理`}

## 稽核摘要

- 檢查項目：${checks.length}
- 通過：${passed}
- 需處理：${failed}

## 檢查結果

| 狀態 | 檢查項目 | 風險說明 |
| --- | --- | --- |
${rows}

## 部署前提醒

${warnings.map((warning) => `- ${warning}`).join("\n")}

## 建議

${failed === 0
  ? "可以進入下一步：先建立 `users/{uid}` owner 文件，再做 Live Read 測試。Firestore rules 部署仍需提姆先生明確批准。"
  : "先修正需處理項目，再重新產生稽核報告。"}
`;

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, report, "utf8");

console.log(`權限稽核完成：${passed}/${checks.length} 通過`);
console.log(`報告已產生：${reportPath}`);
if (failed > 0) process.exitCode = 1;
