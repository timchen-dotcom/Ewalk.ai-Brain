import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "..");
const workspaceDir = resolve(projectDir, "../../../..");
const envPath = resolve(workspaceDir, ".env.local");

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const slug = getArg("slug", "fade-formula-star-color");
const audioArg = getArg("audio", `audio/${slug}.mp3`);
const prompt = getArg("prompt", "請以繁體中文辨識這首歌曲，保留英文歌詞。");
const audioPath = resolve(projectDir, audioArg);
const jsonPath = resolve(projectDir, `lyrics/${slug}.whisper.json`);
const lrcPath = resolve(projectDir, `lyrics/${slug}.whisper.lrc`);

function parseEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    values[key] = value;
  }
  return values;
}

function formatLrcTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  const hundredths = Math.floor((safeSeconds - Math.floor(safeSeconds)) * 100);
  return `${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function cleanSegmentText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/g, "");
}

function toLrc(transcript) {
  const segments = Array.isArray(transcript.segments) ? transcript.segments : [];
  const lines = segments
    .map((segment) => {
      const text = cleanSegmentText(segment.text);
      if (!text) return "";
      return `[${formatLrcTime(segment.start)}]${text}`;
    })
    .filter(Boolean);

  return `${lines.join("\n")}\n`;
}

const env = parseEnv(await readFile(envPath, "utf8"));
const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(`Missing OPENAI_API_KEY in ${envPath}`);
}

const audioBytes = await readFile(audioPath);
const form = new FormData();
form.append("file", new Blob([audioBytes], { type: "audio/mpeg" }), basename(audioPath));
form.append("model", "whisper-1");
form.append("language", "zh");
form.append("response_format", "verbose_json");
form.append("temperature", "0");
form.append("prompt", prompt);

const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`
  },
  body: form
});

const payload = await response.text();
if (!response.ok) {
  throw new Error(`OpenAI transcription failed: ${response.status} ${payload}`);
}

await mkdir(dirname(jsonPath), { recursive: true });
await writeFile(jsonPath, `${payload}\n`, "utf8");
await writeFile(lrcPath, toLrc(JSON.parse(payload)), "utf8");

console.log(JSON.stringify({
  transcript_json: jsonPath,
  lrc: lrcPath
}, null, 2));
