#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, resolve } from "node:path";
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

const inputPath = workspacePath(args.get("--input") || config.input)
  || resolve(vaultRoot, "01_客戶/韓食日常鍋物/02_活動與內容/Meta自動發文佇列.md");
const outputPath = workspacePath(args.get("--output") || config.content_queue_output)
  || resolve(scriptDir, "../output/hansik-content-queue.dry-run.json");

function parseTable(block) {
  const rows = {};
  for (const line of block.split("\n")) {
    const match = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    if (key && key !== "---" && key !== "欄位") {
      rows[key] = value;
    }
  }
  return rows;
}

function extractCopy(block) {
  const copyMatch = block.match(/### 文案[\s\S]*?```(?:text)?\n([\s\S]*?)```/);
  return copyMatch ? copyMatch[1].trim() : null;
}

function parseScheduledAt(fields) {
  const raw = fields["發布時間"] || fields["排程日期"] || null;
  if (!raw) return null;

  const dateTimeMatch = raw.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)/);
  if (dateTimeMatch) {
    const time = dateTimeMatch[2].length === 5 ? `${dateTimeMatch[2]}:00` : dateTimeMatch[2];
    return `${dateTimeMatch[1]}T${time}+08:00`;
  }

  const dateMatch = raw.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) return `${dateMatch[1]}T12:00:00+08:00`;
  return null;
}

function mapStatus(rawStatus = "") {
  if (rawStatus.includes("已發布")) return "published";
  if (rawStatus.includes("已批准")) return "approved";
  if (rawStatus.includes("待提姆")) return "pending_approval";
  if (rawStatus.includes("待阿順")) return "pending_review";
  if (rawStatus.includes("失敗")) return "failed";
  if (rawStatus.includes("草稿")) return "draft";
  return "pending_review";
}

function platforms(rawPlatform = "", defaultPlatforms = ["facebook"]) {
  const result = [];
  if (/facebook|fb/i.test(rawPlatform)) result.push("facebook");
  if (/instagram|ig/i.test(rawPlatform)) result.push("instagram");
  return result.length ? result : defaultPlatforms;
}

function cleanInlineCode(value) {
  if (!value || value === "無") return null;
  return value.replace(/^`|`$/g, "").trim();
}

function taskToContentQueue(taskId, block) {
  const fields = parseTable(block);
  const status = mapStatus(fields["狀態"]);
  const assetPath = cleanInlineCode(fields["素材"]);
  const captionPath = cleanInlineCode(fields["文案檔案"]);
  const metaPostId = cleanInlineCode(fields["Meta Post ID"]);
  const metaPhotoId = cleanInlineCode(fields["Meta Photo ID"]);
  const postUrl = cleanInlineCode(fields["貼文連結"]);

  return {
    id: taskId.toLowerCase(),
    client_id: config.client_id || "hansik-daily-hotpot",
    client_name: config.client_name || "韓食日常鍋物",
    source_task_id: taskId,
    platforms: platforms(fields["平台"], config.default_platforms || ["facebook"]),
    status,
    content_type: fields["貼文類型"] || "post",
    publish_method: fields["發布方式"] || null,
    title: fields["貼文類型"] || basename(captionPath || taskId),
    copy: extractCopy(block),
    hashtags: config.hashtags || ["韓食日常鍋物"],
    asset_refs: assetPath ? [assetPath] : [],
    caption_ref: captionPath,
    scheduled_at: parseScheduledAt(fields),
    approval: {
      reviewer: fields["審核人"] || config.default_reviewer || "阿順",
      final_approver: fields["最終批准"] || config.default_final_approver || "提姆先生",
      risk_level: fields["風險判斷"] || null,
    },
    meta: {
      page_id: cleanInlineCode(fields["Page ID"]),
      photo_id: metaPhotoId && !metaPhotoId.includes("待發布") ? metaPhotoId : null,
      post_id: metaPostId && !metaPostId.includes("待發布") ? metaPostId : null,
      post_url: postUrl && !postUrl.includes("待發布") ? postUrl : null,
    },
    created_by: "ashun",
    source_file: inputPath,
  };
}

const markdown = await readFile(inputPath, "utf8");
const taskRegex = /^## 任務：(.+)$/gm;
const matches = [...markdown.matchAll(taskRegex)];

const documents = {};
for (let index = 0; index < matches.length; index += 1) {
  const taskId = matches[index][1].trim();
  const start = matches[index].index;
  const end = matches[index + 1]?.index ?? markdown.length;
  const block = markdown.slice(start, end);
  const doc = taskToContentQueue(taskId, block);
  documents[doc.id] = doc;
}

const output = {
  mode: "dry-run",
  generated_at: new Date().toISOString(),
  config: configPath,
  input: inputPath,
  target_collection: "content_queue",
  count: Object.keys(documents).length,
  documents,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`Dry-run 完成：${output.count} 筆 content_queue`);
console.log(`輸出：${outputPath}`);
