#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const vaultRoot = resolve(scriptDir, "../../..");
const defaultConfigPath = resolve(scriptDir, "../config/clients/hansik-daily-hotpot.json");

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (key?.startsWith("--")) {
    args.set(key, value);
    index += 1;
  }
}

function workspacePath(value) {
  if (!value) return null;
  return isAbsolute(value) ? value : resolve(vaultRoot, value);
}

const configPath = resolve(args.get("--config") || defaultConfigPath);
let config = {};
try {
  config = JSON.parse(await readFile(configPath, "utf8"));
} catch {
  config = {};
}

const inputPath = workspacePath(args.get("--content") || config.content_queue_output)
  || resolve(scriptDir, "../output/hansik-content-queue.dry-run.json");
const followupsPath = workspacePath(args.get("--followups") || config.performance_followups_output)
  || resolve(scriptDir, "../output/hansik-performance-followups.dry-run.json");
const outputPath = workspacePath(args.get("--output") || config.command_center_output)
  || resolve(scriptDir, "../output/command-center-preview.html");

const data = JSON.parse(await readFile(inputPath, "utf8"));
let followupData = { followups: {} };
try {
  followupData = JSON.parse(await readFile(followupsPath, "utf8"));
} catch {
  followupData = { followups: {} };
}

const items = Object.values(data.documents).sort((a, b) => {
  const left = a.scheduled_at || "";
  const right = b.scheduled_at || "";
  return right.localeCompare(left);
});
const followups = Object.values(followupData.followups).sort((a, b) => {
  const left = a.due_at || "";
  const right = b.due_at || "";
  return left.localeCompare(right);
});

const statusLabels = {
  draft: "草稿",
  pending_review: "待阿順檢查",
  pending_approval: "待提姆先生批准",
  approved: "已批准待發布",
  published: "已發布",
  failed: "發文失敗",
};

const statusClass = {
  draft: "neutral",
  pending_review: "attention",
  pending_approval: "attention",
  approved: "ready",
  published: "done",
  failed: "danger",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  if (!value) return "未排程";
  if (value.endsWith("Z")) {
    const parts = new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date(value));
    const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${byType.year}-${byType.month}-${byType.day} ${byType.hour}:${byType.minute}:${byType.second}`;
  }
  return value.replace("T", " ").replace("+08:00", "");
}

function nextAction(item) {
  if (item.status === "published") return item.meta?.post_url ? "檢查成效回收" : "補回貼文連結";
  if (item.status === "approved") return "等待 System User token 或人工發布批准";
  if (item.status === "pending_approval") return "送提姆先生批准";
  if (item.status === "pending_review") return "阿順檢查品牌與風險";
  if (item.status === "failed") return "人工排查錯誤";
  return "補齊內容與素材";
}

function countByStatus(status) {
  return items.filter((item) => item.status === status).length;
}

const rows = items.map((item) => `
  <tr>
    <td>
      <div class="title">${escapeHtml(item.title)}</div>
      <div class="meta">${escapeHtml(item.source_task_id)}</div>
    </td>
    <td>${escapeHtml(item.platforms.join(", "))}</td>
    <td>${escapeHtml(formatDate(item.scheduled_at))}</td>
    <td><span class="status ${statusClass[item.status] || "neutral"}">${escapeHtml(statusLabels[item.status] || item.status)}</span></td>
    <td>${item.asset_refs?.length ? "有素材" : "無素材"}</td>
    <td>${escapeHtml(item.approval?.final_approver || "未指定")}</td>
    <td>${item.meta?.post_url ? `<a href="${escapeHtml(item.meta.post_url)}">查看貼文</a>` : `<span class="muted">未發布</span>`}</td>
    <td>${escapeHtml(nextAction(item))}</td>
  </tr>`).join("");

const followupRows = followups.length ? followups.map((item) => `
  <tr>
    <td>
      <div class="title">${escapeHtml(item.source_task_id)}</div>
      <div class="meta">${escapeHtml(item.id)}</div>
    </td>
    <td>${escapeHtml(item.checkpoint)}</td>
    <td>${escapeHtml(formatDate(item.due_at))}</td>
    <td><span class="status ${item.status === "due" ? "attention" : "neutral"}">${item.status === "due" ? "待回收" : "已排程"}</span></td>
    <td>${escapeHtml(item.assigned_to)}</td>
    <td>${item.post_url ? `<a href="${escapeHtml(item.post_url)}">查看貼文</a>` : `<span class="muted">缺連結</span>`}</td>
    <td>${escapeHtml(item.metrics_to_collect.join(", "))}</td>
  </tr>`).join("") : `
  <tr>
    <td colspan="7"><span class="muted">尚未產生成效追蹤佇列</span></td>
  </tr>`;

const approvedItems = items.filter((item) => item.status === "approved");
const publishedItems = items.filter((item) => item.status === "published");
const dueFollowups = followups.filter((item) => item.status === "due");

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ewalk.ai Command Center Preview</title>
  <style>
    :root {
      --bg: #f4f7f6;
      --ink: #17212b;
      --muted: #657282;
      --line: #d9e0e7;
      --panel: #ffffff;
      --brand: #0b5f70;
      --accent: #f37021;
      --ready: #0b6b4f;
      --done: #234f8f;
      --warn: #9a6700;
      --danger: #a63636;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }
    header {
      background: #ffffff;
      border-bottom: 1px solid var(--line);
      padding: 18px 28px;
    }
    .shell {
      max-width: 1280px;
      margin: 0 auto;
    }
    .topbar {
      align-items: center;
      display: flex;
      gap: 16px;
      justify-content: space-between;
    }
    .brand {
      align-items: center;
      display: flex;
      gap: 12px;
      min-width: 0;
    }
    .mark {
      align-items: center;
      background: var(--brand);
      border-radius: 6px;
      color: white;
      display: grid;
      font-weight: 800;
      height: 38px;
      justify-items: center;
      width: 38px;
    }
    h1 {
      font-size: 20px;
      line-height: 1.2;
      margin: 0;
    }
    .sub {
      color: var(--muted);
      font-size: 13px;
      margin-top: 4px;
    }
    main {
      padding: 24px 28px 40px;
    }
    .metrics {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 20px;
    }
    .metric {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
    }
    .metric dt {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 8px;
    }
    .metric dd {
      font-size: 28px;
      font-weight: 760;
      margin: 0;
    }
    .band {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
    }
    .band-head {
      align-items: center;
      border-bottom: 1px solid var(--line);
      display: flex;
      gap: 16px;
      justify-content: space-between;
      padding: 16px;
    }
    h2 {
      font-size: 16px;
      margin: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      font-size: 13px;
      padding: 12px 14px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f9fbfc;
      color: #475466;
      font-weight: 680;
      white-space: nowrap;
    }
    tr:last-child td {
      border-bottom: 0;
    }
    a {
      color: var(--brand);
      font-weight: 650;
      text-decoration: none;
    }
    .title {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .meta, .muted {
      color: var(--muted);
      font-size: 12px;
    }
    .status {
      border-radius: 999px;
      display: inline-flex;
      font-size: 12px;
      font-weight: 750;
      line-height: 1;
      padding: 6px 8px;
      white-space: nowrap;
    }
    .status.ready { background: #e4f4ee; color: var(--ready); }
    .status.done { background: #e7eefb; color: var(--done); }
    .status.attention { background: #fff3cf; color: var(--warn); }
    .status.danger { background: #fde8e8; color: var(--danger); }
    .status.neutral { background: #edf1f5; color: #4b5563; }
    .notice {
      background: #fff8ed;
      border-left: 4px solid var(--accent);
      color: #563618;
      font-size: 13px;
      line-height: 1.6;
      margin-top: 20px;
      padding: 12px 14px;
    }
    @media (max-width: 900px) {
      .topbar { align-items: flex-start; flex-direction: column; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .band { overflow-x: auto; }
      table { min-width: 920px; }
    }
    @media (max-width: 520px) {
      header, main { padding-left: 16px; padding-right: 16px; }
      .metrics { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="shell topbar">
      <div class="brand">
        <div class="mark">E</div>
        <div>
          <h1>Ewalk.ai Command Center</h1>
          <div class="sub">韓食日常鍋物｜Firebase content_queue dry-run｜${escapeHtml(data.generated_at)}</div>
        </div>
      </div>
      <div class="sub">只讀預覽，不連正式 Firebase，不會發文</div>
    </div>
  </header>
  <main>
    <div class="shell">
      <dl class="metrics">
        <div class="metric"><dt>總佇列</dt><dd>${items.length}</dd></div>
        <div class="metric"><dt>已批准待發布</dt><dd>${countByStatus("approved")}</dd></div>
        <div class="metric"><dt>已發布</dt><dd>${countByStatus("published")}</dd></div>
        <div class="metric"><dt>成效待回收</dt><dd>${dueFollowups.length}</dd></div>
      </dl>
      <section class="band">
        <div class="band-head">
          <h2>內容佇列</h2>
          <span class="sub">下一步優先處理 ${approvedItems.length} 筆已批准待發布內容</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>任務</th>
              <th>平台</th>
              <th>排程</th>
              <th>狀態</th>
              <th>素材</th>
              <th>批准</th>
              <th>Meta</th>
              <th>下一步</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
      <div class="notice">
        目前這是只讀預覽。正式寫入 Firestore、部署 rules、正式發文、升級 Firebase Blaze 都需要提姆先生批准。
        已發布紀錄共有 ${publishedItems.length} 筆，後續可交給成效追蹤員建立 24 / 72 小時回收欄位。
      </div>
      <section class="band followups">
        <div class="band-head">
          <h2>成效追蹤佇列</h2>
          <span class="sub">${dueFollowups.length} 筆到期回收任務</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>來源任務</th>
              <th>節點</th>
              <th>到期時間</th>
              <th>狀態</th>
              <th>負責</th>
              <th>Meta</th>
              <th>需回收指標</th>
            </tr>
          </thead>
          <tbody>${followupRows}</tbody>
        </table>
      </section>
    </div>
  </main>
</body>
</html>`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, html, "utf8");

console.log(`Command Center 預覽已產生：${outputPath}`);
