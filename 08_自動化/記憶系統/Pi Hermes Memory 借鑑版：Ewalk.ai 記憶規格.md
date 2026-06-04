# Pi Hermes Memory 借鑑版：Ewalk.ai 記憶規格（Failure Memory + Secret Scanning）

## 目的

把阿順與各 Agent 的「可用記憶」做成：

- 可搜尋（避免重複問、重複踩坑）
- 分層（全域 vs 專案/客戶範圍）
- 可防洩漏（避免 token/API key 被寫進可回填記憶）
- 會記失敗（Failure Memory：記住什麼不該再做）
- 證據優先（raw artifacts/原始軌跡是第一級資料，摘要只是索引）

本文件是「需求規格與落地框架」，不直接改全域規則、不直接改任何現有自動化程式碼。

## 來源

- Pi Hermes Memory（pi-hermes-memory）：https://pi.dev/packages/pi-hermes-memory
- Useful Memories Become Faulty When Continuously Updated by LLMs（arXiv:2605.12978）：https://arxiv.org/abs/2605.12978
- Hugging Face Papers（同篇摘要頁）：https://huggingface.co/papers/2605.12978

## 核心概念（可直接吸收）

### 1) 兩層記憶（Two-tier memory）

- Global（全域）：跨任務都適用的偏好與環境事實
- Project（專案/工作區）：只在某個 repo / 客戶 / 專案脈絡才成立的規則與決策

對 Ewalk.ai 對應建議：

- Global → `Ewalk.ai Brain/00_系統說明` 或「阿順」的固定偏好（寫成短清單）
- Project → 每個客戶資料夾的「專案規則」或每個自動化子系統的專屬規則

### 2) 可搜尋的延伸記憶（SQLite FTS / indexed store）

把「所有對話 / 產出 / 決策」做成全文檢索，而不是只靠短期上下文。

對 Ewalk.ai 的最低可行作法（先不寫程式）：

- 先把「常見踩坑」與「常見決策」沉澱成文件（見 Failure Memory）
- 未來若要上資料庫：再評估以 SQLite/FTS5 做「可搜尋索引」，並加上權限邊界

### 3) Failure Memory（記失敗、記教訓）

把「做錯什麼 / 為什麼錯 / 以後怎麼避免」獨立成可回填的提醒。

建議分類（借鑑 Pi Hermes Memory）：

- `failure`：什麼不行 + 原因
- `correction`：使用者糾正的規則（例如「不要改 AGENTS.md」這種硬邊界）
- `insight`：可重複使用的洞察（有條件、不要寫成絕對）
- `convention`：固定慣例（命名、資料夾、交付格式）
- `tool-quirk`：工具怪癖（例如：某腳本路徑、某 webhook 沒有 self_upgrade）

### 4) Secret scanning（防洩漏掃描）

所有「寫入記憶/可回填內容」在落地前先掃描：

- API keys / tokens / webhook URLs
- SSH keys / private keys
- 任何可用來存取客戶資料或第三方帳號的機密

最低可行作法（先從流程做起）：

- 規定「記憶文件不得包含」：任何 webhook URL、token、password、private key
- 若需要記錄配置：只記「key 名稱」與「放置位置」，不記值（例如：`DISCORD_WEBHOOK_URL` 存在於 `config.local.json`）

### 5) 證據優先與整併風險（Evidence-first + gated consolidation）

新提醒：近期研究指出，依賴 LLM 持續「改寫/整併」的 consolidated memory，可能因整併錯誤而讓表現下降；相對地，保留 raw episodic trajectories（原始事件/軌跡）能維持較好的可靠性。

對 Ewalk.ai 的落地規則（先用文件流程做起）：

- **原始證據（raw artifacts）永不覆蓋**：逐字稿、交付檔、決策紀錄、run logs 一律 append-only。
- **摘要/規則是派生層**：任何「consolidation/摘要」必須指向來源（至少包含日期 + 檔名/連結），可回溯。
- **整併要有 gate**：不要每次互動都整併；只在「重複發生 ≥ 3 次」或「使用者明確糾正」時，才升級成穩定規則。
- **修正用 correction 追加**：不要直接改寫舊記憶內容；用新條目寫「修正/例外/失效條件」，避免歷史被抹平。

## Ewalk.ai 記憶寫入規格（建議）

### 記憶寫入的最小單位

每則記憶以一條可讀、可搜尋、可搬移的條目保存：

- `日期`
- `分類`
- `內容`
- `適用範圍`（Global/Project + 具體專案名）
- `驗證方式`（如何知道它是對的）

### 何時寫入

- 使用者明確糾正（correction）→ 立即寫入
- 任務完成後回顧（每 N 次回合）→ 擷取最有價值的 3-5 條
- 任務失敗/返工（failure）→ 必須寫入 1 條「失敗記憶」

### 何時注入（回填）

建議只回填「短、穩、可驗證」的內容：

- Global：每次任務都回填（但總字數要控）
- Project：只有在「同客戶/同 repo/同專案」才回填
- Failure（最近 7 天/最近 10 次）優先回填（避免立即重踩）

## 先做不寫程式的落地（建議 1 小時內完成）

1. 建立一份「Ewalk.ai Failure Memory 清單」（先用 Markdown）
2. 每天自我升級/交付後，至少新增 1 條 failure/correction
3. 每週做一次記憶健檢（review）：只在保留來源證據的前提下合併條目；不要用整併覆蓋原始證據

## 待確認

- 記憶的「Project」層級要以什麼切：客戶？repo？自動化子系統？
- 哪些類型資料一律禁止進記憶（建議：客戶個資、任何金鑰、任何 webhook URL）
