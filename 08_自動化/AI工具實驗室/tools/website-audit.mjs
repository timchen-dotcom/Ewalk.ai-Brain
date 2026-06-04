#!/usr/bin/env node
import { parseArgs, numberArg, requireArg } from "../lib/args.mjs";
import { extractPageData, fetchPage, pickInternalLinks, summarizePages } from "../lib/html.mjs";
import { generateReport } from "../lib/openai.mjs";
import { saveReport, withSourceBlock } from "../lib/report.mjs";

const demoPages = [
  {
    url: "https://example.com",
    title: "TheVision 美學髮廊",
    description: "淡水高質感沙龍，提供染髮、燙髮、護髮與預約服務。",
    headings: [
      { level: 1, text: "TheVision 美學髮廊" },
      { level: 2, text: "春夏髮色與三倍水光染" },
      { level: 2, text: "透明價目表" }
    ],
    buttons: ["立即預約", "查看價目表"],
    forms: [],
    images: ["染髮作品", "護髮前後效果"],
    links: [
      { href: "https://example.com/services", text: "服務項目" },
      { href: "https://example.com/contact", text: "聯絡我們" }
    ],
    text: "TheVision 位於淡水，主打高質感美學髮廊、染髮、燙髮、護髮、三倍水光染與設計師作品。"
  }
];

function usage() {
  return [
    "用法：",
    "  node tools/website-audit.mjs --url https://example.com --client 客戶名稱 --industry 產業 --services 主要服務",
    "",
    "常用參數：",
    "  --max-pages 5      最多抓取頁數",
    "  --no-ai           只輸出抓取摘要，不呼叫 OpenAI",
    "  --demo            使用內建示範資料",
    "  --no-save         不寫入 output"
  ].join("\n");
}

async function crawlWebsite(url, maxPages) {
  const home = await fetchPage(url);
  const homeData = extractPageData(home.url, home.html);
  const links = pickInternalLinks(homeData, Math.max(0, maxPages - 1));
  const pages = [homeData];

  for (const link of links) {
    try {
      const page = await fetchPage(link);
      if (!page.ok || !/html/i.test(page.contentType)) continue;
      pages.push(extractPageData(page.url, page.html));
    } catch (error) {
      pages.push({
        url: link,
        title: "抓取失敗",
        description: "",
        headings: [],
        links: [],
        buttons: [],
        forms: [],
        images: [],
        text: `抓取失敗：${error.message}`
      });
    }
  }
  return pages;
}

function staticSummary({ client, industry, services, pages }) {
  return [
    `# 官網與 Google 商家健檢摘要｜${client}`,
    "",
    "## 基本資料",
    `- 產業：${industry || "未提供"}`,
    `- 主推服務：${services || "未提供"}`,
    `- 抓取頁數：${pages.length}`,
    "",
    "## 抓取內容",
    "```json",
    JSON.stringify(summarizePages(pages), null, 2),
    "```",
    "",
    "## 下一步",
    "- 若要產生完整 AI 健檢報告，移除 `--no-ai` 後重新執行。",
    "- 若頁面內容很少，請補客戶服務、預約連結、Google 商家資料或截圖。"
  ].join("\n");
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    console.log(usage());
    return;
  }

  const client = String(args.client || "未命名客戶");
  const industry = String(args.industry || "");
  const services = String(args.services || "");
  const maxPages = Math.max(1, Math.min(8, numberArg(args, "max-pages", 5)));
  const pages = args.demo ? demoPages : await crawlWebsite(requireArg(args, "url", usage()), maxPages);
  const summary = summarizePages(pages);

  let report;
  let model = "";
  if (args["no-ai"]) {
    report = staticSummary({ client, industry, services, pages });
  } else {
    const result = await generateReport({
      instructions: [
        "你是 Ewalk.ai 的官網與 Google 商家 AI 健檢顧問。",
        "請用台灣繁體中文輸出，語氣務實、可執行。",
        "不要假設沒有提供的資訊。若資料不足，要列入待補資料。",
        "重點不是漂亮摘要，而是能交給客戶或內部執行的優化清單。",
        "輸出格式必須包含：一句話結論、優先修正、SEO 建議、Google 商家服務/產品/貼文建議、CTA 與預約流程、圖片需求、風險、下一步待辦。"
      ].join("\n"),
      input: JSON.stringify({ client, industry, services, pages: summary }, null, 2),
      maxOutputTokens: 3200
    });
    model = result.model;
    report = withSourceBlock({
      title: `官網與 Google 商家 AI 健檢報告｜${client}`,
      source: pages[0]?.url,
      model,
      body: result.text
    });
  }

  if (args["no-save"]) {
    console.log(report);
    return;
  }

  const target = await saveReport("website-audit", report);
  console.log(JSON.stringify({ ok: true, tool: "website-audit", model: model || null, output: target }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
