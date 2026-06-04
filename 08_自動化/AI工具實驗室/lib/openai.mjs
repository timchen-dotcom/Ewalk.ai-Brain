import { getModel, getOpenAIKey, loadLocalEnv } from "./env.mjs";

function extractText(response) {
  if (response.output_text) return response.output_text;
  const chunks = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
      if (content.type === "text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

export async function generateReport({ instructions, input, model, maxOutputTokens = 2400 }) {
  await loadLocalEnv();
  const apiKey = getOpenAIKey();
  const selectedModel = model || getModel();

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        instructions,
        input,
        max_output_tokens: maxOutputTokens
      })
    });
  } catch (error) {
    throw new Error(
      `OpenAI API 連線失敗：${error.message}。若是在 Codex 沙盒內執行，可能是本機網路限制；請在一般終端機重跑，或先使用 --no-ai 測本地流程。`
    );
  }

  const body = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = { raw: body };
  }

  if (!response.ok) {
    const message = parsed.error?.message || parsed.raw || body;
    throw new Error(`OpenAI API 失敗：${response.status} ${message}`);
  }

  const text = extractText(parsed);
  if (!text) throw new Error("OpenAI API 回傳成功，但沒有可讀文字輸出。");
  return { text, model: selectedModel, responseId: parsed.id };
}
