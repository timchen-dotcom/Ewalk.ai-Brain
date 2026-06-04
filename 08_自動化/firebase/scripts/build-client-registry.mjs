#!/usr/bin/env node

import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const vaultRoot = resolve(scriptDir, "../../..");
const clientsRoot = resolve(vaultRoot, "01_客戶");
const outputPath = resolve(scriptDir, "../output/client-registry.dry-run.json");
const appDataPath = resolve(scriptDir, "../command-center-app/data/client-registry.js");
const reportPath = resolve(scriptDir, "../docs/client-import-roadmap.md");

const ignoreNames = new Set([".DS_Store"]);
const clientIdOverrides = new Map([
  ["大美好學院", "great-beauty-academy"],
  ["中古車補教名師-霖老師", "lin-used-car-coach"],
  ["幻色鏡方美業控股集團", "mirrorcube-beauty-group"],
  ["正官庄高麗蔘", "kgc-korea-ginseng"],
  ["髮染快染專門", "quick-dye-salon"],
  ["韓食日常鍋物", "hansik-daily-hotpot"],
  ["TheDay那日美學", "theday-aesthetics"],
]);
const displayNameOverrides = new Map([
  ["正官庄高麗蔘", "正官庄高麗蔘"],
  ["TheDay那日美學", "TheDay 那日美學"],
]);

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontMatter(markdown) {
  if (!markdown.startsWith("---")) return {};
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return {};
  const block = markdown.slice(3, end).trim();
  const result = {};
  let currentKey = null;
  for (const line of block.split("\n")) {
    const keyValue = line.match(/^([^:#]+):\s*(.*)$/);
    if (keyValue) {
      currentKey = keyValue[1].trim();
      const rawValue = keyValue[2].trim();
      result[currentKey] = rawValue || [];
      continue;
    }
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(result[currentKey])) result[currentKey] = [];
      result[currentKey].push(listItem[1].trim());
    }
  }
  return result;
}

function firstHeading(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function inferIndustry(name, tags = [], text = "") {
  const haystack = [name, ...tags, text].join(" ");
  if (/餐飲|鍋物|韓食|餐廳/.test(haystack)) return "餐飲";
  if (/正官庄|高麗蔘|保健|食藥|中藥/.test(haystack)) return "保健食品 / 法規稽核";
  if (/中古車|車庫|車輛/.test(haystack)) return "中古車 / 個人品牌";
  if (/學院|教育|學習護照|證照/.test(haystack)) return "教育 / 美業學院";
  if (/髮|染|SPA|美業|頭皮|Inebrya|hair|Hair|Color|Vogue|TheVision|TG/.test(haystack)) return "美業 / 髮廊";
  return "待分類";
}

function serviceTags(files, dirs) {
  const joined = files.join("\n");
  const tags = [];
  if (dirs.includes("01_品牌資料")) tags.push("品牌資料");
  if (dirs.includes("02_活動與內容")) tags.push("內容企劃");
  if (dirs.includes("03_提案與交付")) tags.push("提案交付");
  if (dirs.includes("04_素材")) tags.push("素材庫");
  if (/Meta自動發文佇列\.md/.test(joined)) tags.push("Meta自動化樣板");
  if (/月報|成效/.test(joined)) tags.push("成效報表");
  if (/網站|系統|demo-site|原型/.test(joined)) tags.push("網站 / 系統");
  if (/法規|稽核/.test(joined)) tags.push("法規稽核");
  return tags;
}

function importReadiness({ hasOverview, hasReadme, tags, fileCount }) {
  if (tags.includes("Meta自動化樣板")) return "ready_content_queue";
  if (hasOverview && tags.includes("內容企劃")) return "ready_profile_and_content";
  if (hasOverview || hasReadme) return "ready_profile";
  if (fileCount > 0) return "needs整理";
  return "empty_folder";
}

function nextAction(readiness) {
  if (readiness === "ready_content_queue") return "可作為正式匯入樣板，先由提姆先生審核";
  if (readiness === "ready_profile_and_content") return "先建立客戶基本資料，再補內容佇列欄位";
  if (readiness === "ready_profile") return "先匯入客戶名冊，不匯入任務";
  if (readiness === "needs整理") return "先整理 README / 00_客戶總覽";
  return "等待補資料";
}

async function listFilesRecursive(root, relative = "") {
  const entries = await readdir(join(root, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoreNames.has(entry.name)) continue;
    const child = join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFilesRecursive(root, child));
    } else {
      files.push(child);
    }
  }
  return files;
}

async function main() {
  const entries = await readdir(clientsRoot, { withFileTypes: true });
  const clients = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || ignoreNames.has(entry.name)) continue;
    const clientDir = join(clientsRoot, entry.name);
    const directEntries = await readdir(clientDir, { withFileTypes: true });
    const dirs = directEntries.filter((item) => item.isDirectory()).map((item) => item.name).sort();
    const files = await listFilesRecursive(clientDir);
    const markdownFiles = files.filter((file) => extname(file).toLowerCase() === ".md");
    const overviewRel = files.find((file) => file === "00_客戶總覽.md");
    const readmeRel = files.find((file) => file === "README.md");
    const primaryRel = overviewRel || readmeRel;
    let primaryText = "";
    let frontMatter = {};
    if (primaryRel) {
      primaryText = await readFile(join(clientDir, primaryRel), "utf8");
      frontMatter = parseFrontMatter(primaryText);
    }

    const displayName = frontMatter["客戶"] || firstHeading(primaryText) || entry.name;
    const fmTags = Array.isArray(frontMatter["標籤"]) ? frontMatter["標籤"] : [];
    const tags = serviceTags(files, dirs);
    const readiness = importReadiness({
      hasOverview: Boolean(overviewRel),
      hasReadme: Boolean(readmeRel),
      tags,
      fileCount: files.length,
    });

    clients.push({
      client_id: clientIdOverrides.get(entry.name) || slugify(entry.name),
      folder_name: entry.name,
      client_name: displayNameOverrides.get(entry.name) || displayName,
      industry: inferIndustry(displayName, fmTags, primaryText.slice(0, 1200)),
      status: frontMatter["狀態"] || "待確認",
      source_path: `01_客戶/${entry.name}`,
      primary_file: primaryRel ? `01_客戶/${entry.name}/${primaryRel}` : null,
      folders: dirs,
      file_count: files.length,
      markdown_count: markdownFiles.length,
      service_tags: tags,
      import_readiness: readiness,
      next_action: nextAction(readiness),
    });
  }

  clients.sort((a, b) => a.client_name.localeCompare(b.client_name, "zh-Hant"));

  const payload = {
    mode: "dry-run",
    generated_at: new Date().toISOString(),
    source_root: "01_客戶",
    target_collection: "clients",
    count: clients.length,
    summary: {
      ready_content_queue: clients.filter((item) => item.import_readiness === "ready_content_queue").length,
      ready_profile_and_content: clients.filter((item) => item.import_readiness === "ready_profile_and_content").length,
      ready_profile: clients.filter((item) => item.import_readiness === "ready_profile").length,
      needs整理: clients.filter((item) => item.import_readiness === "needs整理").length,
      empty_folder: clients.filter((item) => item.import_readiness === "empty_folder").length,
    },
    clients,
  };

  const report = `# Ewalk.ai 客戶匯入路線圖

建立日期：2026-05-23  
負責角色：阿順  
最終決策者：提姆先生  
狀態：本報告為客戶名冊掃描結果；正式寫入狀態以 Command Center Live Read 與 client-import-roadmap.md 為準

## 目的

韓食日常鍋物只是第一個樣板客戶。接下來要把 Command Center 變成 Ewalk.ai 全公司營運系統，先把 \`01_客戶\` 裡的客戶整理成統一名冊，再逐步匯入正式資料庫。

## 目前掃描結果

- 客戶資料夾總數：${payload.count}
- 可直接作為內容佇列樣板：${payload.summary.ready_content_queue}
- 有客戶總覽與內容資料：${payload.summary.ready_profile_and_content}
- 有基本客戶資料：${payload.summary.ready_profile}
- 需先整理：${payload.summary.needs整理}
- 空資料夾：${payload.summary.empty_folder}

## 匯入原則

- 第一階段只匯入客戶名冊，不匯入任務、不發文、不改預算。
- 第二階段才把有 \`Meta自動發文佇列.md\` 的客戶轉成 \`content_queue\`。
- 第三階段才建立成效追蹤、批准佇列與跨部門分工。
- 正式寫入 Firestore 前，必須由提姆先生批准。

## 客戶清單

| 客戶 | 產業 | 狀態 | 匯入分級 | 下一步 |
| --- | --- | --- | --- | --- |
${clients.map((item) => `| ${item.client_name} | ${item.industry} | ${item.status} | ${item.import_readiness} | ${item.next_action} |`).join("\n")}

## 下一步

1. 提姆先生確認客戶名冊與分類。
2. 阿順建立正式 \`clients\` 匯入包。
3. 提姆先生批准後，才正式寫入 Firestore。
4. 寫入後 Command Center 從「韓食樣板」升級成「Ewalk.ai 全客戶系統」。
`;

  await mkdir(dirname(outputPath), { recursive: true });
  await mkdir(dirname(appDataPath), { recursive: true });
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(appDataPath, `window.EWALK_CLIENT_REGISTRY = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
  await writeFile(reportPath, report, "utf8");

  const checked = await stat(outputPath);
  console.log(`客戶名冊 dry-run 已產生：${payload.count} 位客戶，${checked.size} bytes`);
  console.log(`輸出：${outputPath}`);
  console.log(`看板資料：${appDataPath}`);
  console.log(`路線圖：${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
