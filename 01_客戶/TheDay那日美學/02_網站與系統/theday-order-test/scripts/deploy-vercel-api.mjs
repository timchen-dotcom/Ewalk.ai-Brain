import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectName = process.env.VERCEL_PROJECT_NAME || "theday-order-test";
const teamId = process.env.VERCEL_TEAM_ID || "team_nY2uzBgwWiSBRXbIZafedR2H";
const token = process.env.VERCEL_TOKEN || readLocalVercelToken();

const files = [
  "index.html",
  "styles.css",
  "app.js",
  "seed-data.js",
  "vercel.json",
  "README.md",
  "商品匯入模板.csv",
  "分店資料模板.csv",
].map((file) => ({
  file,
  data: readFileSync(resolve(file), "utf8"),
}));

if (!token) {
  console.error("Missing VERCEL_TOKEN. Set it in the environment or login with Vercel CLI first.");
  process.exit(1);
}

const payload = {
  name: projectName,
  project: projectName,
  target: "production",
  files,
  meta: {
    source: "theday-order-test-api-deploy",
    importedAt: "2026-05-31",
  },
};

const endpoint = new URL("https://api.vercel.com/v13/deployments");
endpoint.searchParams.set("teamId", teamId);
endpoint.searchParams.set("forceNew", "1");
endpoint.searchParams.set("skipAutoDetectionConfirmation", "1");

const result = await retry(
  async () => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Vercel API ${response.status}: ${text}`);
    return JSON.parse(text);
  },
  { attempts: 5, delayMs: 3000 },
);

console.log(`Deployment created: https://${result.url}`);
console.log(`State: ${result.readyState || "QUEUED"}`);
if (result.alias?.length) console.log(`Aliases: ${result.alias.join(", ")}`);

function readLocalVercelToken() {
  const home = process.env.HOME || "";
  const authPath = resolve(home, "Library/Application Support/com.vercel.cli/auth.json");
  try {
    return JSON.parse(readFileSync(authPath, "utf8")).token;
  } catch {
    return "";
  }
}

async function retry(fn, options) {
  let lastError;
  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt}/${options.attempts} failed: ${error.message}`);
      if (attempt < options.attempts) await sleep(options.delayMs * attempt);
    }
  }
  throw lastError;
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}
