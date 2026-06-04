import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { OUTPUT_DIR } from "./env.mjs";

export function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function saveReport(prefix, content) {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const filename = `${prefix}_${timestamp()}.md`;
  const target = path.join(OUTPUT_DIR, filename);
  await writeFile(target, content, "utf8");
  return target;
}

export function withSourceBlock({ title, source, model, body }) {
  const lines = [
    `# ${title}`,
    "",
    `產出時間：${new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`,
    source ? `來源：${source}` : "",
    model ? `模型：${model}` : "",
    "",
    body.trim(),
    ""
  ].filter((line) => line !== "");
  return lines.join("\n");
}
