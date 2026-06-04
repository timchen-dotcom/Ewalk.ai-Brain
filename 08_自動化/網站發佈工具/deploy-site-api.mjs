import { existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "../../..");
const sitesDir = join(rootDir, "sites");
const recordDir = join(rootDir, "Ewalk.ai Brain/08_自動化/網站發佈紀錄");
const configPath = join(sitesDir, "deploy.config.json");
const envPath = join(rootDir, ".env.local");

const siteKey = process.argv[2];
const mode = process.argv[3] || "";

if (!siteKey) {
  console.log("用法：./deploy-site-api.command <sites 內相對路徑> [--prod]");
  process.exit(1);
}

if (siteKey.includes("..") || siteKey.startsWith("/")) {
  console.log("站台路徑不合法，只能使用 sites/ 底下的相對路徑。");
  process.exit(1);
}

const siteDir = join(sitesDir, siteKey);
if (!existsSync(siteDir)) {
  console.log(`找不到站台：${siteDir}`);
  process.exit(1);
}

const token = readEnvToken();
if (!token) {
  console.log("找不到 VERCEL_TOKEN，請先執行 ./設定VercelToken.command");
  process.exit(2);
}

const config = existsSync(configPath) ? JSON.parse(await readFile(configPath, "utf8")) : { projects: [] };
const project = config.projects.find((item) => item.key === siteKey) || {};
const projectName = project.vercelProject || slugify(siteKey);
const target = mode === "--prod" || mode === "prod" || mode === "production" ? "production" : undefined;

if (target === "production" && project.productionRequiresApproval !== false) {
  console.log("Production 部署需明確批准；目前 API 部署腳本只建議用於 Preview。");
  process.exit(3);
}

const files = await collectFiles(siteDir);
if (!files.some((file) => file.file === "index.html")) {
  console.log("靜態 API 部署目前需要 index.html。");
  process.exit(1);
}

const payload = {
  name: projectName,
  project: projectName,
  files,
  projectSettings: {
    framework: null
  },
  meta: {
    ewalkSiteKey: siteKey,
    ewalkAutoDeploy: "true"
  }
};

if (target) payload.target = target;

const tmpPayload = `/private/tmp/ewalk-vercel-deploy-${Date.now()}.json`;
const tmpResponse = `/private/tmp/ewalk-vercel-response-${Date.now()}.json`;

await writeFile(tmpPayload, JSON.stringify(payload), { mode: 0o600 });

console.log(`準備 API 部署：${siteKey}`);
console.log(`Vercel Project：${projectName}`);
console.log(`模式：${target || "preview"}`);

const curl = await run("curl", [
  "-sS",
  "--max-time", "120",
  "--retry", "5",
  "--retry-delay", "2",
  "--retry-all-errors",
  "-X", "POST",
  "--oauth2-bearer", token,
  "-H", "Content-Type: application/json",
  "--data-binary", `@${tmpPayload}`,
  "-o", tmpResponse,
  "-w", "%{http_code}\\n",
  "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1"
]);
const httpCode = curl.stdout.trim();
const curlError = curl.stderr.trim();
const responseText = existsSync(tmpResponse) ? await readFile(tmpResponse, "utf8") : "";

await cleanup([tmpPayload, tmpResponse]);

let deploymentUrl = "";
let deploymentId = "";
let errorMessage = "";

try {
  const response = JSON.parse(responseText || "{}");
  deploymentUrl = response.url ? `https://${response.url}` : "";
  deploymentId = response.id || "";
  errorMessage = response.error?.message || response.error?.code || "";
} catch {
  errorMessage = responseText.slice(0, 500);
}

await mkdir(recordDir, { recursive: true });
const now = new Date();
const dateKey = now.toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
const recordFile = join(recordDir, `${dateKey}_${siteKey.replaceAll("/", "_")}_api_${target || "preview"}.md`);

await writeFile(recordFile, [
  `# 網站 API 發佈紀錄｜${siteKey}`,
  "",
  `- 時間：${now.toISOString()}`,
  `- 類型：${target || "preview"}`,
  `- 本機路徑：${siteDir}`,
  `- Vercel Project：${projectName}`,
  `- HTTP 狀態：${httpCode}`,
  `- Deployment ID：${deploymentId || "未取得"}`,
  `- 部署網址：${deploymentUrl || "未取得"}`,
  `- 錯誤：${errorMessage || curlError || "無"}`,
  "",
  "## 檔案",
  "",
  ...files.map((file) => `- ${file.file}`)
].join("\n") + "\n");

console.log(`HTTP：${httpCode}`);
if (deploymentUrl) console.log(`部署網址：${deploymentUrl}`);
console.log(`發佈紀錄已寫入：${recordFile}`);

if (!String(httpCode).startsWith("2")) {
  if (errorMessage) console.log(`錯誤：${errorMessage}`);
  if (curlError) console.log(`curl：${curlError}`);
  process.exit(1);
}

async function collectFiles(dir) {
  const paths = await listFiles(dir);
  const deployFiles = [];

  for (const path of paths.sort()) {
    const rel = relative(dir, path);
    if (shouldIgnore(rel)) continue;

    const data = await readFile(path);
    deployFiles.push({
      file: rel,
      data: data.toString("base64"),
      encoding: "base64"
    });
  }

  return deployFiles;
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    if (entry.isFile()) files.push(path);
  }

  return files;
}

function shouldIgnore(rel) {
  const parts = rel.split("/");
  if (parts.some((part) => [".DS_Store", ".vercel", "node_modules", ".next", "dist", ".cache"].includes(part))) return true;
  if (extname(rel) === ".md") return true;
  return false;
}

function readEnvToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN.trim();
  if (!existsSync(envPath)) return "";
  const text = requireReadFile(envPath);
  return text.match(/^VERCEL_TOKEN=(.+)$/m)?.[1]?.trim() || "";
}

function requireReadFile(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function run(command, args) {
  return new Promise((resolvePromise) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(command, args, { cwd: rootDir });
    child.stdout.on("data", (data) => stdout += data);
    child.stderr.on("data", (data) => stderr += data);
    child.on("close", (code) => resolvePromise({ code, stdout, stderr }));
  });
}

async function cleanup(paths) {
  const { rm } = await import("node:fs/promises");
  for (const path of paths) {
    try { await rm(path); } catch {}
  }
}
