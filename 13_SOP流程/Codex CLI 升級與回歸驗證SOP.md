# Codex CLI 升級與回歸驗證 SOP

## 目的

把 Codex CLI 的升級從「直接升」改成「可回歸、可回滾、可驗收」的流程，避免升級後破壞既有自動化或日常工作流。

## 使用時機

- Codex CLI 有新 release，且「看起來會影響工作流」（例如 app-server、plugin、技能/工具列出方式、I/O 行為）
- 準備把某條既有流程改造成半自動/全自動前
- 版本更新提到 goal mode、remote resume、browser annotations、access tokens、profiles 等長任務治理能力時

## 前置條件

- 有一台「測試環境」或可接受風險的機器（不要直接在主力交付環境先升）
- 有一個「固定回歸清單」可跑（見下方）

## 升級流程

### 1) 記錄升級前狀態（必做）

- 記錄目前版本：`codex --version`（或等價指令）
- 記錄主要使用路徑（至少一項）：
  - 每日自我升級情報（產檔 + Discord）
  - 任一常用 SOP（例如簡報重製、素材歸檔）
- 若已有非互動式腳本或排程：記錄目前使用的是互動登入、workspace token、或其他身分方式

### 2) 升級（在測試環境）

- 依你當前安裝方式升級（brew / npm / 下載二進位 / 其他）
- 升級後再次記錄版本號與日期

### 3) 跑最小回歸（必跑）

回歸清單（至少跑 3 項）：

- `codex` 能正常啟動與完成一次「讀檔 → 產檔」任務
- 能在本專案寫入一個測試檔案（確保檔案系統權限正常）
- 能列出/使用至少一個既有技能（確保 skill / tool chain 沒斷）
- 能跑 `codex doctor` 並輸出合理診斷（用來快速定位環境/Git/thread 問題）
- 若版本 notes 提到 `codex doctor` 增強：確認診斷內容可看出 app-server 版本、thread inventory 或等價環境狀態，並把結果摘要留在升級紀錄
- 若版本提到 goal mode：驗證能建立一個明確目標，且過程中仍能保留可追溯的進度/完成狀態
- 若版本提到 access tokens：只在可信、本機或已批准的腳本上驗證一次非互動式登入；不可直接接到高風險外部流程
- 若版本提到 remote resume / remote-control：驗證中斷後至少可看到可恢復的 session/thread 狀態，不要求當日就改常駐流程
- 若版本提到 browser annotations / appshots：驗證輸出是否更容易留下「看過什麼畫面、如何判斷」的可讀證據
- 若有使用 composer：驗證 Vim 模式不影響輸入與格式（進 composer 後切換 Vim、測試貼上、撤銷/重做、清單/標題格式不亂）
- 若有使用權限 profiles：驗證 `/permissions` 可列出 profiles（含 named profiles）
- 若有使用 remote transport：驗證 `/status` 會顯示 remote 連線資訊與 server 版本
- 若版本涉及 memory/runtime state 遷移：驗證至少一個既有 thread 可 resume，且新建 thread、搜尋/列出 thread 不報錯
- 輸出可讀性檢查：讓 Codex 產出一段 Markdown 表格與多行清單，確認貼進 Obsidian 後不變形、不影響交接閱讀

### 4) 風險檢查（必看）

- token 觀感：是否出現明顯「無意義輸出膨脹」（例如大量 ASCII 表格/重複摘要）
- 長任務穩定性：是否更常卡住、或 I/O 異常（工具列不出來、thread 無法載入）
- 常駐/遠端流程：若使用 remote-control 或 app-server，升級後要確認重連 backoff、status 顯示與停止/恢復流程不影響既有自動化
- 身分與權限：若測過 access tokens，確認沒有把 token、複製指令或敏感值寫進 Obsidian、聊天紀錄或可回填記憶
- 任務治理：若測過 goal mode / browser annotations，確認它們有提升交接可讀性，而不是只增加額外輸出

### 5) 升級結論

- 若回歸全過：標記「可升級」，再安排主力環境升級
- 若回歸失敗：標記「暫緩」，保留失敗現象與回滾方式

## 驗收標準

- 至少 3 項回歸項目通過
- 主要流程不退化（更慢/更不穩/更貴都算退化）
- 留下可追溯記錄（版本、日期、通過/失敗）
