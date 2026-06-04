# AI 工作流 Token 觀測與削減 SOP

## 目的

把「省 token」從感覺改成可量測：先建立觀測（logging/audit），再做結構性削減（工具裁剪、CLI 取代、預先抓資料）。

## 使用時機

- 任一自動化/工作流出現「越跑越慢、越跑越貴、越跑越不穩」
- 要把某條流程從人工→半自動→全自動前
- 需要比較不同模型/不同提示/不同工具鏈的成本差異

## 來源

- GitHub Blog：Improving token efficiency in GitHub Agentic Workflows
  - https://github.blog/ai-and-ml/github-copilot/improving-token-efficiency-in-github-agentic-workflows/

## 核心觀念（白話）

- **先記錄**：沒有數字就無法穩定省。
- **先砍結構性浪費**：很多成本不是推理本身，而是「讀資料、列工具、來回確認」。
- **先把可不推理的步驟變成 deterministic**：用 CLI/腳本/快取把「不用想的事」拿出模型上下文。

## Step 1：建立最小觀測（必做）

### A) 有 token 資料就記 token（理想）

若你的平台/框架能輸出每次 API call 的 token/模型/時間戳，建立一個檔案（建議 JSONL）：

- `token-usage.jsonl`
  - 一行一筆 call 記錄：時間、工作流名稱、模型、input/output token、cache read/write（若有）

### B) 沒 token 資料就先記「代理指標」（可落地）

若拿不到 token（最常見），先用以下代理指標做「相對比較」：

- 這次 run 的：
  - 工具呼叫次數（tool calls）
  - 讀檔數量 / 讀檔總字數（可估）
  - web 查詢次數
  - 最終輸出字數
  - 總耗時（start/end timestamp）

重點：**可比較、可回歸**，先能看出「哪一步最浪費」。

## Step 2：做審計（找出前 1–2 個最大浪費點）

針對最近 3–5 次 run，回答：

- 哪一步最常重複？
- 哪些 tool schema/工具列出成本很高但幾乎不用？
- 哪些資料其實可以「先抓好」再丟給模型（避免 agent 多輪讀）？

## Step 3：削減策略（依成本大小排序）

### 1) 工具裁剪（Tool pruning）

- 原則：只暴露「本次任務會用到的工具」
- 做法：
  - 把工具分層：常用/偶爾用/危險或昂貴
  - 對特定工作流使用「最小工具集合」

### 2) CLI 取代（CLI substitution）

- 原則：凡是「不用推理」的資料抓取/列表操作，用 CLI/腳本先做掉。
- 例：GitHub 資料抓取可先用 `gh` 把 issue/PR 內容抓下來，再交給 agent 做摘要/決策。

### 3) 預先下載（Pre-fetch）

- 原則：agent 問「我需要哪些資料」前，就先把固定會用的資料抓齊。
- 例：repo 結構、README、release notes、最近 commits、檔案清單。

### 4) 快取與重用（Cache / reuse）

- 原則：同樣的輸入就不要重算、同樣的資料就不要重讀。

### 5) Context 壓縮規格（Compression spec）

- 原則：不要「臨場靠感覺摘要」，要用可回歸的規格定義：
  - 何時壓縮（triggers）
  - 壓縮後一定要保留什麼（preserve_always）
  - 哪些內容可大幅壓縮（compress_aggressively）
- 建議先用模板建立一份最小規格檔：
  - `Ewalk.ai Brain/模板/COMPRESSION規格檔模板.md`

## 驗收標準（最小）

- 有一份可追溯的 run log（token 或代理指標）
- 找到並修掉至少 1 個結構性浪費點（不是只改 prompt）
- 連續 3 次 run：耗時或成本指標明顯下降，且輸出品質不退化
