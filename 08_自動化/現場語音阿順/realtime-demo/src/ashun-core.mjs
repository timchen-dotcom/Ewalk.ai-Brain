import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(__dirname, "..");
export const VAULT_ROOT = path.resolve(PROJECT_ROOT, "../../../..");

await loadLocalEnv();

export const MODEL = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
export const VOICE = process.env.OPENAI_REALTIME_VOICE || "echo";
export const AUDIO_SPEED = Number(process.env.OPENAI_REALTIME_SPEED || 1.3);
export const REASONING_EFFORT = process.env.OPENAI_REALTIME_REASONING || "low";

export const knowledgeFiles = [
  {
    snapshot: "star_one_person_economy.md",
    path: "Ewalk.ai Brain/01_客戶/STAR Color/03_提案與交付/STAR加盟核心概念_一個人的經濟.md"
  },
  {
    snapshot: "star_0520_deck_full.md",
    path: "Ewalk.ai Brain/01_客戶/STAR Color/03_提案與交付/0520創業大會簡報/STAR_Color_0520加盟簡報0511_完整46頁_生成前查閱.md"
  },
  {
    snapshot: "ewalk_marketing_brain.md",
    path: "Ewalk.ai Brain/01_客戶/STAR Color/03_提案與交付/0520創業大會簡報/Ewalk.ai行銷大腦系統.md"
  },
  {
    snapshot: "hues_cube_ai_beauty_life.md",
    path: "Ewalk.ai Brain/01_客戶/幻色鏡方美業控股集團/02_策略架構/幻色鏡方AI美業生命體架構.md"
  },
  {
    snapshot: "great_beauty_micro_education.md",
    path: "Ewalk.ai Brain/01_客戶/大美好學院/02_活動與內容/學習護照系統/微型教育系統架構.md"
  },
  {
    snapshot: "ewalk_as_hues_cube_ai_brain.md",
    path: "Ewalk.ai Brain/01_客戶/幻色鏡方美業控股集團/02_策略架構/Ewalk.ai作為幻色鏡方AI大腦.md"
  }
];

export const fallbackQa = [
  {
    title: "什麼是一個人的經濟？",
    answer:
      "一個人的經濟，是 STAR Color 最重要的加盟邏輯。它不是要求每個人開大店、養大團隊，而是讓一位美業工作者也能擁有品牌、技術、行銷、教育與營運支援。透過集團和 Ewalk.ai 行銷大腦，一個人不再是孤軍作戰，而是用小型單位接上大型系統，創造更高收入、更低風險、更可複製的創業模式。"
  },
  {
    title: "Ewalk.ai 行銷大腦能幫加盟店做什麼？",
    answer:
      "Ewalk.ai 行銷大腦會協助每家店降低行銷落差。它可以整理市場資料、分析社群與廣告、建立下一季活動方案、優化每月業績，並把總部策略轉成每家店能執行的內容。簡單說，每家店雖然可能是一個人經營，但背後有一個集團級的行銷系統在支援。"
  },
  {
    title: "STAR Color 跟一般染髮加盟有什麼不同？",
    answer:
      "一般加盟常常只給品牌、裝潢和產品，但 STAR Color 的核心是把一個人的創業變成系統。它結合 AI 染髮技術、教育訓練、行銷大腦、總部活動與人才升遷，讓加盟者不只是開一間店，而是接上一套能持續進化的美業經濟系統。"
  },
  {
    title: "為什麼要做現場語音阿順？",
    answer:
      "因為我們要讓大家現場感受到，AI 大腦不是簡報上的概念，而是真的可以對話、整理資料、回答策略問題。當阿順能直接說明 STAR Color 的加盟邏輯、教育系統和行銷大腦，現場就會看見 Ewalk.ai 的價值不是工具，而是一套能陪著品牌長大的智慧系統。"
  },
  {
    title: "5/20 現場最重要要讓大家記住什麼？",
    answer:
      "最重要要記住一句話：STAR Color 不是賣一間店，而是讓一個人接上一套集團級的 AI 美業系統。大美好學院負責教育，Ewalk.ai 負責行銷大腦，幻色鏡方提供品牌與資源，最後讓每一位加盟者都能用更高勝率走向就業、創業與成長。"
  }
];

export async function loadLocalEnv() {
  const envPath = path.join(PROJECT_ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const text = await readFile(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function tokenize(text) {
  const source = String(text).toLowerCase();
  const tokens = new Set(source.match(/[a-z0-9]{2,}/g) || []);
  const cjkParts = source.match(/[\u4e00-\u9fff]+/g) || [];
  for (const part of cjkParts) {
    if (part.length >= 2) tokens.add(part);
    for (let size = 2; size <= Math.min(6, part.length); size += 1) {
      for (let index = 0; index <= part.length - size; index += 1) {
        tokens.add(part.slice(index, index + size));
      }
    }
  }
  return [...tokens];
}

function knowledgeSource(entry) {
  const livePath = path.join(VAULT_ROOT, entry.path);
  if (existsSync(livePath)) return livePath;
  return path.join(PROJECT_ROOT, "knowledge", entry.snapshot);
}

export async function loadKnowledge() {
  const docs = [];
  for (const entry of knowledgeFiles) {
    const full = knowledgeSource(entry);
    if (!existsSync(full)) {
      docs.push({ path: entry.path, title: path.basename(entry.path), missing: true, text: "" });
      continue;
    }
    const text = await readFile(full, "utf8");
    docs.push({
      path: entry.path,
      title: path.basename(entry.path, ".md"),
      missing: false,
      text
    });
  }
  return docs;
}

function chunkText(text, size = 900, overlap = 120) {
  const clean = text.replace(/\n{3,}/g, "\n\n").trim();
  const chunks = [];
  for (let i = 0; i < clean.length; i += size - overlap) {
    chunks.push(clean.slice(i, i + size));
  }
  return chunks;
}

export async function searchKnowledge(query, limit = 5) {
  const docs = await loadKnowledge();
  const queryTokens = tokenize(query);
  const scored = [];
  for (const doc of docs) {
    if (doc.missing) continue;
    for (const chunk of chunkText(doc.text)) {
      const lower = chunk.toLowerCase();
      const score = queryTokens.reduce((total, token) => total + (lower.includes(token) ? 1 : 0), 0);
      if (score > 0) {
        scored.push({ score, title: doc.title, path: doc.path, excerpt: chunk.slice(0, 700) });
      }
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function buildRealtimeSession() {
  const instructions = [
    "你是阿順，Ewalk.ai 的現場語音 AI 專業經理人。",
    "展示場景是 2026-05-20 STAR Color 創業大會。",
    "你的任務是用台灣繁體中文回答主持人或現場來賓問題。",
    "你是阿順，聲音與語氣要像 35-45 歲成熟穩重的台灣男性顧問：沉著、溫和、有自信，不油膩，不像播報員。",
    "請使用台灣生活化口吻，像在現場跟主持人自然對話。可以先用「對，這個問題很關鍵」、「簡單說」、「我會這樣看」接住問題，再講重點。",
    "不要使用大陸用語，例如：別說視頻、打造閉環、賦能、落地場景；改說影片、建立流程、協助、實際應用。",
    "回答要短、自然、穩，不要像背簡報稿；一次只講一個主軸，控制在 10 到 18 秒，最多 3 句話。",
    "語速要比一般說話快一點，大約 1.3 倍，但語尾不要急，咬字要清楚。",
    "少用條列式，不要一直說第一第二第三；除非主持人要求整理重點。",
    "不要過度技術化，不要提太多模型、API、資料庫細節，不要補太多背景。",
    "如果你不確定，請用生活化方式說「這題我會保守一點講」，再回到 STAR Color、一個人的經濟、大美好學院、Ewalk.ai 行銷大腦或幻色鏡方 AI 美業生命體的核心論述。",
    "需要資料時使用 searchKnowledge 工具。"
  ].join("\n");

  return {
    type: "realtime",
    model: MODEL,
    instructions,
    audio: {
      output: {
        voice: VOICE,
        speed: Math.min(1.5, Math.max(0.25, AUDIO_SPEED))
      }
    },
    reasoning: {
      effort: REASONING_EFFORT
    },
    tools: [
      {
        type: "function",
        name: "searchKnowledge",
        description: "搜尋 5/20 現場語音阿順的 Obsidian 核心知識資料。",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "要查詢的問題或關鍵字。" }
          },
          required: ["query"]
        }
      }
    ]
  };
}

export async function createRealtimeSession(sdp) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OPENAI_API_KEY 尚未設定。請先在 Vercel 或本機環境變數設定 API key。" };
  }

  const form = new FormData();
  form.set("sdp", sdp);
  form.set("session", JSON.stringify(buildRealtimeSession()));

  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  const answer = await response.text();
  if (!response.ok) {
    return { error: `OpenAI Realtime 建立失敗：${response.status} ${answer}` };
  }
  return { sdp: answer };
}

export async function syncKnowledgeSnapshots() {
  const targetDir = path.join(PROJECT_ROOT, "knowledge");
  await mkdir(targetDir, { recursive: true });
  const synced = [];
  for (const entry of knowledgeFiles) {
    const source = path.join(VAULT_ROOT, entry.path);
    if (!existsSync(source)) {
      synced.push({ path: entry.path, snapshot: entry.snapshot, missing: true });
      continue;
    }
    const text = await readFile(source, "utf8");
    await writeFile(path.join(targetDir, entry.snapshot), text);
    synced.push({ path: entry.path, snapshot: entry.snapshot, missing: false });
  }
  return synced;
}
