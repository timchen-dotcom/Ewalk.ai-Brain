import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const LAB_ROOT = path.resolve(__dirname, "..");
export const WORKSPACE_ROOT = path.resolve(__dirname, "../../../..");
export const OUTPUT_DIR = path.join(LAB_ROOT, "output");

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const index = trimmed.indexOf("=");
  if (index < 1) return null;
  const key = trimmed.slice(0, index).trim();
  const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
  return { key, value };
}

export async function loadLocalEnv() {
  const candidates = [
    path.join(WORKSPACE_ROOT, ".env.local"),
    path.join(WORKSPACE_ROOT, ".env"),
    path.join(WORKSPACE_ROOT, "Ewalk.ai Brain/08_自動化/現場語音阿順/realtime-demo/.env.local")
  ];

  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue;
    const text = await readFile(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      if (!process.env[parsed.key]) process.env[parsed.key] = parsed.value;
    }
  }
}

export function getOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.trim()) {
    throw new Error("OPENAI_API_KEY 尚未設定。請確認 .env.local 或環境變數。");
  }
  return key.trim();
}

export function getModel() {
  return process.env.EWALK_AI_TOOL_MODEL || process.env.OPENAI_MODEL || "gpt-5.2";
}
