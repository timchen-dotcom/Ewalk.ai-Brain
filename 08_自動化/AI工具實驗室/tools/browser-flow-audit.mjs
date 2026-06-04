#!/usr/bin/env node
import { parseArgs, requireArg } from "../lib/args.mjs";
import { extractPageData, fetchPage, summarizePages } from "../lib/html.mjs";
import { generateReport } from "../lib/openai.mjs";
import { saveReport, withSourceBlock } from "../lib/report.mjs";

const demoPage = {
  url: "https://example.com",
  title: "預約頁",
  description: "線上預約染髮與護髮服務。",
  headings: [
    { level: 1, text: "線上預約" },
    { level: 2, text: "選擇服務" }
  ],
  links: [
    { href: "https://line.me/example", text: "加入 LINE 預約" },
    { href: "https://example.com/price", text: "查看價目表" }
  ],
  buttons: ["立即預約", "聯絡我們"],
  forms: [{ inputs: 4, labels: ["姓名", "電話", "服務項目", "送出"] }],
  images: ["店內環境"],
  text: "顧客可查看價目表，點擊 LINE 或表單預約。"
};

function usage() {
  return [
    "用法：",
    "  node tools/browser-flow-audit.mjs --url https://example.com --goal 預約染髮 --client 客戶名稱",
    "",
    "常用參數：",
    "  --no-ai     只輸出靜態流程摘要",
    "  --demo      使用內建示範資料",
    "  --no-save   不寫入 output"
  ].join("\n");
}

function buildStaticFindings({ client, goal, page }) {
  const hasForm = page.forms.length > 0;
  const hasCta = [...page.buttons, ...page.links.map((link) => link.text)].some((text) =>
    /預約|聯絡|諮詢|購買|加入|line|book|contact|reserve/i.test(text)
  );

  return [
    `# 瀏覽流程健檢摘要｜${client}`,
    "",
    `目標：${goal}`,
    `頁面：${page.url}`,
    "",
    "## 靜態檢查",
    `- 有明確 CTA：${hasCta ? "是" : "否"}`,
    `- 有表單：${hasForm ? "是" : "否"}`,
    `- 按鈕：${page.buttons.join("、") || "未偵測"}`,
    `- 表單數：${page.forms.length}`,
    "",
    "## 頁面資料",
    "```json",
    JSON.stringify(summarizePages([page])[0], null, 2),
    "```",
    "",
    "## 下一步",
    "- 若要產生完整 AI 流程改善建議，移除 `--no-ai` 後重新執行。",
    "- 若要做真實點擊測試，後續可接 browser-use / Playwright / Chrome 權限。"
  ].join("\n");
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    console.log(usage());
    return;
  }

  const client = String(args.client || "未命名客戶");
  const goal = String(args.goal || "完成預約或聯絡");
  const page = args.demo ? demoPage : extractPageData(requireArg(args, "url", usage()), (await fetchPage(args.url)).html);

  let report;
  let model = "";
  if (args["no-ai"]) {
    report = buildStaticFindings({ client, goal, page });
  } else {
    const result = await generateReport({
      instructions: [
        "你是 Ewalk.ai 的瀏覽流程與轉換率健檢員。",
        "這是 browser-use 導入的第一版：目前只能看靜態頁面資料，不能登入、不能點擊、不能發布。",
        "請用台灣繁體中文輸出，重點放在使用者從進站到完成目標的阻力。",
        "輸出格式必須包含：流程結論、目前可見路徑、阻礙點、CTA 修正、表單/預約建議、需要真實瀏覽器測試的事項、風險與下一步。"
      ].join("\n"),
      input: JSON.stringify({ client, goal, page: summarizePages([page])[0] }, null, 2),
      maxOutputTokens: 2600
    });
    model = result.model;
    report = withSourceBlock({
      title: `瀏覽流程 AI 健檢報告｜${client}`,
      source: page.url,
      model,
      body: result.text
    });
  }

  if (args["no-save"]) {
    console.log(report);
    return;
  }

  const target = await saveReport("browser-flow-audit", report);
  console.log(JSON.stringify({ ok: true, tool: "browser-flow-audit", model: model || null, output: target }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
