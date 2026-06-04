#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { parseArgs } from "../lib/args.mjs";
import { generateReport } from "../lib/openai.mjs";
import { saveReport, withSourceBlock } from "../lib/report.mjs";

const demoBrief = [
  "我要做一個 Google 商家 AI 健檢工具。",
  "使用者貼上商家網址、官網網址、產業與主要服務。",
  "工具要輸出：服務項目建議、產品卡建議、貼文主題、圖片需求、風險提醒與下一步待辦。",
  "第一版只做分析，不自動修改 Google 商家。"
].join("\n");

function usage() {
  return [
    "用法：",
    "  node tools/workflow-builder.mjs --brief \"我要做一個...\" --name 工具名稱",
    "  node tools/workflow-builder.mjs --file brief.md --name 工具名稱",
    "",
    "常用參數：",
    "  --no-ai     只輸出基本 workflow 模板",
    "  --demo      使用內建示範需求",
    "  --no-save   不寫入 output"
  ].join("\n");
}

async function readBrief(args) {
  if (args.demo) return demoBrief;
  if (args.brief) return String(args.brief);
  if (args.file) return readFile(String(args.file), "utf8");
  throw new Error(`缺少 --brief 或 --file。\n${usage()}`);
}

function staticWorkflow({ name, brief }) {
  return [
    `# Dify 風格 AI Workflow 規格｜${name}`,
    "",
    "## 需求摘要",
    brief,
    "",
    "## 建議節點",
    "1. Input Collector：收集使用者輸入",
    "2. Data Normalizer：整理欄位與缺漏資料",
    "3. Analyzer：依任務產出分析",
    "4. Risk Checker：檢查權限、誇大、對外發布風險",
    "5. Output Formatter：輸出 Markdown 報告與待辦",
    "",
    "## 下一步",
    "- 若要產生完整 AI workflow 規格，移除 `--no-ai` 後重新執行。",
    "- 若要真的部署到 Dify，需另行確認 Dify Cloud 或自架環境。"
  ].join("\n");
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    console.log(usage());
    return;
  }

  const name = String(args.name || "未命名 AI 工具");
  const brief = await readBrief(args);

  let report;
  let model = "";
  if (args["no-ai"]) {
    report = staticWorkflow({ name, brief });
  } else {
    const result = await generateReport({
      instructions: [
        "你是 Ewalk.ai 的 AI 工具產品架構師。",
        "請把使用者需求轉成 Dify 風格 workflow 規格，但不要假設已經有 Dify 後台。",
        "輸出要能讓阿順後續交給工程師、Dify 建置者或自動化專員使用。",
        "請用台灣繁體中文。",
        "輸出格式必須包含：工具定位、輸入欄位、節點流程、每個節點的 prompt / 規則、輸出格式、權限風險、測試案例、未來串接 API。"
      ].join("\n"),
      input: JSON.stringify({ name, brief }, null, 2),
      maxOutputTokens: 3200
    });
    model = result.model;
    report = withSourceBlock({
      title: `Dify 風格 AI Workflow 規格｜${name}`,
      source: "使用者需求",
      model,
      body: result.text
    });
  }

  if (args["no-save"]) {
    console.log(report);
    return;
  }

  const target = await saveReport("workflow-builder", report);
  console.log(JSON.stringify({ ok: true, tool: "workflow-builder", model: model || null, output: target }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
