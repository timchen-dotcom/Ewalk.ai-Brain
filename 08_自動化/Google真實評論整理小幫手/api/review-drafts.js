const MODEL = "gpt-5.4-nano";

const SYSTEM_PROMPT = `
你是台灣服務業 Google 評論草稿整理助手。
你的任務是協助真實消費者把「自己實際提供的服務體驗」整理成自然、具體、可自行修改的繁體中文評論草稿。

核心原則：
- 只根據輸入資訊整理，不捏造沒有提供的服務細節、效果、優惠、價格或等待時間。
- 不保證五星，不要求正評，不鼓勵不實評論。
- 每一則都要像不同顧客自然打字，不要像同一個模板換詞。
- 可自然帶入品牌名稱、所在地區、服務項目、服務人員，但不要每句都硬塞關鍵字。
- 顧客有補充個人經驗時，必須優先使用那句話，並保持口語感。
- 顧客沒有補充時，只使用已勾選的實際感受，不要自行創造故事。

風格要求：
- 產生 3 則草稿，每則 70 到 130 個中文字，依 requestedLength 微調。
- 三則的開頭、句型、節奏、收尾都要明顯不同。
- 避免使用連續重複的固定句，例如「整體來說」、「服務過程中」、「完成後效果符合期待」不可每則都出現。
- 語氣自然，不要廣告文案，不要過度浮誇，不要像業配。
- 若資訊不足，寫得簡短真實，不要硬湊字數。

請只輸出 JSON，不要輸出 Markdown。
`.trim();

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "missing_openai_api_key" });
    return;
  }

  try {
    const input = sanitizeInput(req.body || {});
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              instruction: "請依照輸入內容產生 3 則自然、不模板化、可由顧客自行修改的 Google 評論草稿。",
              outputSchema: {
                drafts: [
                  { label: "自然版", text: "繁體中文評論草稿" },
                  { label: "具體版", text: "繁體中文評論草稿" },
                  { label: "口語版", text: "繁體中文評論草稿" }
                ]
              },
              input
            })
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "review_drafts",
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["drafts"],
              properties: {
                drafts: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["label", "text"],
                    properties: {
                      label: { type: "string" },
                      text: { type: "string" }
                    }
                  }
                }
              }
            },
            strict: true
          }
        },
        max_output_tokens: 700
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      res.status(response.status).json({
        error: "openai_request_failed",
        detail: payload.error?.message || payload.error?.code || "unknown_error"
      });
      return;
    }

    const parsed = parseResponseJson(payload);
    const drafts = Array.isArray(parsed.drafts) ? parsed.drafts : [];
    const cleanDrafts = drafts
      .map((draft, index) => ({
        label: sanitizeText(draft.label) || ["自然版", "具體版", "口語版"][index] || "草稿",
        text: sanitizeText(draft.text)
      }))
      .filter((draft) => draft.text)
      .slice(0, 3);

    if (cleanDrafts.length !== 3) {
      res.status(502).json({ error: "invalid_ai_output" });
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ drafts: cleanDrafts, model: MODEL });
  } catch (error) {
    res.status(500).json({ error: "server_error", detail: error.message });
  }
};

function sanitizeInput(input) {
  return {
    brandName: limitText(input.brandName, 60),
    storeArea: limitText(input.storeArea, 40),
    service: limitText(input.service, 40),
    designer: limitText(input.designer, 40),
    tone: limitText(input.tone, 20),
    requestedLength: Number(input.requestedLength) || 100,
    feelings: Array.isArray(input.feelings) ? input.feelings.map((item) => limitText(item, 30)).filter(Boolean).slice(0, 8) : [],
    customerNote: limitText(input.customerNote, 180)
  };
}

function limitText(value, maxLength) {
  return sanitizeText(value).slice(0, maxLength);
}

function sanitizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseResponseJson(payload) {
  if (payload.output_text) return JSON.parse(payload.output_text);

  const text = payload.output
    ?.flatMap((item) => item.content || [])
    ?.map((content) => content.text || "")
    ?.join("")
    ?.trim();

  if (!text) return {};
  return JSON.parse(text);
}
