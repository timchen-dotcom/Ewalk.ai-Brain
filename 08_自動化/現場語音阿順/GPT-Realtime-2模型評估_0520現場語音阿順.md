# GPT-Realtime-2 模型評估：0520 現場語音阿順

建立日期：2026-05-13
目標活動：2026-05-20 STAR Color 創業大會
判斷：GPT-Realtime-2 可作為現場語音阿順主方案

## 結論

GPT-Realtime-2 很適合 5/20 現場語音阿順，尤其是「主持人問、阿順即時回答」這種雙向語音展示。

建議架構：

```text
主持人 / 現場提問
        ↓
瀏覽器 WebRTC 麥克風
        ↓
GPT-Realtime-2 語音代理
        ↓
知識檢索工具：讀取 Obsidian 核心資料
        ↓
阿順 30-45 秒語音回答
        ↓
備援：預設 Q&A / 預錄語音 / 文字輸入
```

## 三個模型分工

| 模型 | 本次用途 | 是否必要 | 判斷 |
| --- | --- | --- | --- |
| GPT-Realtime-2 | 雙向即時語音代理、即時回答、可用工具查資料 | 必要 | 主方案 |
| GPT-Realtime-Whisper | 即時字幕、逐字稿、會後紀錄、備援 STT | 建議 | 輔助方案 |
| GPT-Realtime-Translate | 多語即時翻譯 | 非必要 | 若現場有英文 / 日文橋段再加 |

## 為什麼 GPT-Realtime-2 適合

官方文件顯示 GPT-Realtime-2 是 realtime voice interactions 的 reasoning model，支援 speech-to-speech、可調 reasoning effort、較強 instruction following、工具使用與複雜 voice-agent workflow。

對 5/20 來說，關鍵不是單純語音聊天，而是：

- 要能聽懂主持人的自然問法
- 要能維持現場對話節奏
- 要能用「專業經理人 + 創業軍師」語氣回答
- 要能查 STAR Color / 幻色鏡方 / Ewalk.ai 行銷大腦資料
- 要能控制回答在 30-45 秒內
- 要能在不確定時優雅回到核心論述

這些都比較符合 GPT-Realtime-2，而不是傳統「Whisper + 文字模型 + TTS」三段式串接。

## GitHub 可參考 Repo

### 1. openai/openai-realtime-agents

用途：主要參考。

它示範用 OpenAI Realtime API + Agents SDK 建立進階語音代理，包含：

- Realtime agent
- tool use
- handoff
- supervisor pattern
- guardrails
- 多代理流程

適合 Ewalk.ai 借用的地方：

- 用 Realtime agent 做現場對話
- 用 supervisor / tool call 處理比較複雜的知識查詢
- 將「現場阿順」限制在一個明確場景，而不是讓它自由亂答

來源：https://github.com/openai/openai-realtime-agents

### 2. webrtcHacks/gpt-realtime-webrtc

用途：快速理解 WebRTC 連線。

它是單檔 demo，示範瀏覽器如何直接用 WebRTC 連 OpenAI Realtime API。

適合 Ewalk.ai 借用的地方：

- 快速理解麥克風、WebRTC、音訊輸出流程
- 做最小 Demo 驗證

不建議直接當正式現場版本，因為它是教育型 sandbox，API key 安全性與後端控管不足。

來源：https://github.com/webrtcHacks/gpt-realtime-webrtc

## 建議技術架構

### 前端

- 本機網頁
- 開始 / 停止語音按鈕
- 麥克風狀態
- 即時字幕區
- 阿順回答文字區
- 備援 Q&A 按鈕

### 後端

- Node / Next.js 小型 server
- 由 server 使用 OpenAI API key 建立 Realtime session
- 不把 API key 放前端
- 提供知識檢索工具：`searchKnowledge(query)`

### 模型設定

- 主模型：`gpt-realtime-2`
- reasoning effort：先用 `low` 或 `medium`，避免現場延遲太高
- voice：先用 `echo`，目標是成熟穩重男性顧問感；若現場聽感不合，再試 `ash`
- audio speed：`1.3`
- 回答語言：繁體中文
- 回答長度：先改為 10-18 秒，最多 3 句話；主持人要追問再補
- 語氣：成熟穩重、生活化、台灣男性顧問感，不像背稿
- 禁止：過度技術化、亂編資料、回答太長

## 是否需要 GPT-Realtime-Whisper

GPT-Realtime-2 本身可以做 speech-to-speech，所以 Whisper 不是主流程必須。

但建議加 GPT-Realtime-Whisper 做輔助：

- 即時字幕
- 現場逐字稿
- 會後整理成 FAQ
- 若主語音代理出問題，可退回「Whisper 轉文字 + 文字回答 + TTS」

## 是否需要 GPT-Realtime-Translate

本次 5/20 如果主要是中文活動，暫時不需要。

可以做成加分橋段：

- 阿順用日文 / 英文一句話介紹 STAR Color
- 模擬未來國際加盟或海外教育場景

但不建議把它放進主流程，避免現場複雜度增加。

## 5/20 前落地節奏

### 5/13-5/14：技術選型與最小 Demo

- 用 GPT-Realtime-2 建立本機網頁
- 完成麥克風輸入與語音輸出
- 先不接完整知識庫，只測人格與回答節奏

### 5/15-5/16：接 Obsidian 知識

- 建立 `searchKnowledge(query)` 工具
- 只接 6 個核心知識檔
- 回答限制 30-45 秒

### 5/17-5/18：現場彩排

- 測試 10-20 題 Q&A
- 測試主持人打斷、重問、追問
- 測試網路、麥克風、喇叭

### 5/19：備援版

- 準備 5 段預錄語音
- 準備文字輸入模式
- 準備無網路版本 Q&A

### 5/20：現場

- 主方案：GPT-Realtime-2
- 備援一：文字輸入 + 語音播放
- 備援二：預錄語音
- 備援三：主持人照稿引導

## 風險

- API key / 額度 / rate limit 未確認
- 現場網路延遲
- 現場收音品質
- 回答太長
- 知識檢索資料不夠精準
- 模型臨場回答偏離品牌主軸

## 阿順建議

這次不要做太大，先做「可展示、可控、可備援」。

最穩現場版本：

```text
GPT-Realtime-2 主流程
+ 固定 6 份知識資料
+ 10-20 題預設 Q&A
+ 5 段預錄語音備援
+ 文字輸入備援
```

這樣能兼顧震撼感與現場穩定度。

## 來源

- OpenAI 發表文章：https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/
- GPT-Realtime-2 模型文件：https://developers.openai.com/api/docs/models/gpt-realtime-2
- GPT-Realtime-Translate 模型文件：https://developers.openai.com/api/docs/models/gpt-realtime-translate
- Realtime WebRTC 文件：https://developers.openai.com/api/docs/guides/realtime-webrtc
- OpenAI Realtime Agents Repo：https://github.com/openai/openai-realtime-agents
- WebRTC Realtime Demo Repo：https://github.com/webrtcHacks/gpt-realtime-webrtc
