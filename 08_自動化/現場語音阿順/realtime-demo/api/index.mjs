export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ewalk.ai 行銷大腦｜阿順語音已關閉</title>
    <style>
      * { box-sizing: border-box; }
      html, body { min-height: 100%; margin: 0; }
      body {
        display: grid;
        min-height: 100vh;
        place-items: center;
        background: #f8fafc;
        color: #111827;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif;
      }
      main {
        width: min(560px, calc(100vw - 40px));
        padding: 36px 28px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #ffffff;
      }
      h1 { margin: 0 0 12px; font-size: clamp(24px, 4vw, 34px); letter-spacing: 0; }
      p { margin: 0; color: #4b5563; font-size: 16px; line-height: 1.7; }
      .meta { margin-top: 20px; color: #6b7280; font-size: 14px; }
    </style>
  </head>
  <body>
    <main>
      <h1>阿順語音網站已關閉</h1>
      <p>5/20 現場展示已結束。為避免 OpenAI Realtime API 被誤用或持續消耗，此網站已停止語音連線與文字查詢功能。</p>
      <p class="meta">Ewalk.ai 內部控管狀態：closed</p>
    </main>
  </body>
</html>`);
}
