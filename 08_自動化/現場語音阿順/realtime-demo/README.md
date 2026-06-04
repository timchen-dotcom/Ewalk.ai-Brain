# 現場語音阿順 Realtime Demo

目標：0520 STAR Color 創業大會現場語音展示。

## 功能

- GPT-Realtime-2 雙向語音對話
- 本機 WebRTC 麥克風輸入與語音輸出
- 6 份 Obsidian 核心知識檢索
- 文字備援查詢
- 5 題預設 Q&A 備援

## 啟動

需先設定 `OPENAI_API_KEY`。最簡單方式是複製 `.env.example` 成 `.env.local` 後填入。

```bash
cd "Ewalk.ai Brain/08_自動化/現場語音阿順/realtime-demo"
cp .env.example .env.local
node server.mjs
```

開啟：

```text
http://127.0.0.1:4320
```

## 可調整環境變數

```bash
OPENAI_REALTIME_MODEL="gpt-realtime-2"
OPENAI_REALTIME_VOICE="echo"
OPENAI_REALTIME_SPEED="1.3"
OPENAI_REALTIME_REASONING="low"
PORT="4320"
```

## 雙擊啟動

專案根目錄有：

```text
開啟現場語音阿順.command
```

第一次雙擊會建立 `.env.local`，填入 API key 後再雙擊一次即可啟動。

## 現場建議

- 主流程：GPT-Realtime-2
- 備援一：文字輸入 + 查核心知識
- 備援二：預設 Q&A + 系統語音播放
- 備援三：主持人照稿引導

## 注意

- API key 只放在後端環境變數，不放前端。
- 彩排時先用 `low` reasoning effort，減少延遲。
- 預設聲音使用 `echo`，語速 `1.3`，並要求成熟穩重的台灣男性顧問口吻與 10-18 秒短回答。
- 重要問答請先用預設 Q&A 彩排。
- 若 `http://127.0.0.1:4320` 連不上，檢查同資料夾的 `server.log`。
- 若主服務無法啟動，可直接打開 `public/offline.html` 作為離線備援 Q&A。

## 雲端部署

此專案已支援 Vercel 部署：

- `public/`：現場操作頁
- `api/status.mjs`：狀態與知識庫清單
- `api/session.mjs`：OpenAI Realtime WebRTC SDP 交換
- `api/ask.mjs`：文字備援查詢
- `api/tool/searchKnowledge.mjs`：Realtime tool call 查詢
- `knowledge/`：部署用 Obsidian 核心知識快照

部署前先更新知識快照：

```bash
node scripts/sync-knowledge.mjs
```

Vercel 需要設定以下環境變數：

```bash
OPENAI_API_KEY
OPENAI_REALTIME_MODEL=gpt-realtime-2
OPENAI_REALTIME_VOICE=echo
OPENAI_REALTIME_SPEED=1.3
OPENAI_REALTIME_REASONING=low
```

`.env.local` 與 server log 已被 `.vercelignore` 排除，不會上傳。

## 目前正式雲端網址

```text
https://ashun-live-voice.vercel.app
```

## 2026-05-20 關閉紀錄

為避免 5/20 展示後被誤用而消耗 OpenAI Realtime API，提姆先生要求關閉線上語音網站。

已完成：

- 本機首頁改為關閉狀態，不再提供開始語音按鈕。
- `/session`、`/ask`、`/tool/searchKnowledge` 改為停用回應，不再呼叫 OpenAI。
- 本機 `server.mjs` 也改成關閉版，避免雙擊啟動後誤用。
- Vercel production 環境變數 `OPENAI_API_KEY` 已移除。

關閉版部署：

```text
deployment: dpl_5yb6hVoHnY3UEzZB6STirSrGNs7P
alias: https://ashun-live-voice.vercel.app
```

驗證：

- `https://ashun-live-voice.vercel.app/session` 目前回 404，不再建立 Realtime 連線。
- `https://ashun-live-voice.vercel.app/api/session` 目前回 410 disabled。
- production 環境已無 `OPENAI_API_KEY`，即使舊入口被打到也不應產生 OpenAI 消耗。

目前 Vercel 專案：

```text
project: ashun-live-voice
projectId: prj_stYb5BNVuY9cKmPy1hJFsmtWIWDJ
deployment: dpl_HFXoLY27Ktyjc7CJ8aFfvojHmHpq
```

2026-05-18 已驗證：

- 首頁 `/`：200
- 狀態 `/status`：已讀到 `OPENAI_API_KEY`
- 核心知識：6 份皆 `missing: false`
- 文字查詢 `/ask`：可查到「一個人的經濟」
- 封面版 UI：已改為 `ashun-cover.png` 主視覺，只保留「開始語音」與「停止」兩個按鈕

最新封面版 deployment：

```text
dpl_8THji17VhXpN9L5p7hSHvNhKFkBm
```

注意：本機開發仍使用 `public/index.html` 與 `server.mjs`；這次雲端是用 Vercel REST API 部署，部署包額外把 `public/index.html` 與 `public/app.js` 映射到根目錄 `index.html` / `app.js`。
