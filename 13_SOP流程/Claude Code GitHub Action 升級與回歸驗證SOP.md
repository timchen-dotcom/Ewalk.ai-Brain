# Claude Code GitHub Action 升級與回歸驗證 SOP

## 目的

把 `anthropics/claude-code-action` 的升級改成「可回歸、可驗收、可回滾」，避免 Action 升級後破壞既有 PR/CI 工作流。

## 使用時機

- 官方發布 v1.0+（或 release notes 明確提到 breaking changes）
- 我們的 repo 內已有使用 `anthropics/claude-code-action@beta` / `@v0*` / `@v1*`
- 準備把 Claude Code 併入「PR 自動審查/修補」流程

## 來源

- Claude Code GitHub Actions 官方文件：https://code.claude.com/docs/en/github-actions
- claude-code-action releases：https://github.com/anthropics/claude-code-action/releases

## 升級流程（最小安全版）

### 1) 盤點目前使用狀態（必做）

- 先找出所有 workflow 內是否有使用：
  - `anthropics/claude-code-action@beta`
  - `anthropics/claude-code-action@v0`
  - `anthropics/claude-code-action@v1`
- 記錄：
  - 目前 pin 的版本（tag 或 SHA）
  - 使用在哪些 event（`pull_request`、`issue_comment`、`workflow_dispatch`…）
  - 是否會自動推 commit / comment（對外行為風險）

### 2) 讀 release notes，列出 breaking changes 檢查清單（必做）

原則：**先把「必改項」寫成清單**，再改 workflow。

- 以 v1.0 為例：官方提到從 v0.x 升 v1.0 需要更新 workflow（breaking changes）
- 對照官方 `examples/` 資料夾，確認：
  - inputs / env 名稱是否變更
  - 權限（`permissions`）是否需要調整
  - comment/commit 行為是否有預設改變

### 3) 在測試 repo / 測試分支做升級（建議必做）

- 建議做法：
  - 先開一個 `test/claude-action-v1` 分支
  - 將 `@beta` 改成 `@v1`（或先 pin 到特定 `@v1.x.y`）
  - 若 workflow 需要 token/secret：確認 secrets 來源與最小權限

### 4) 跑最小回歸（必跑）

至少跑 3 種情境（依你 workflow 設計調整）：

- `pull_request` 事件觸發：Action 能跑完且不報權限錯
- 觸發一次「只讀模式」：只產生 comment，不推 commit（降低風險）
- 觸發一次「可寫模式」（若有）：能在正確分支推 commit，且不會改到不該改的檔案

### 5) 風險控管（必看）

- 是否有「對外不可控輸出」：
  - 自動留言、標記人、推 commit、改 workflow 檔本身
- 是否有「成本暴增」：
  - 重複跑、重複讀 repo、跑到不該跑的事件

### 6) 升級結論

- 回歸全過：標記「可升級」，再把版本策略定下來：
  - 穩定優先：pin 到 `@v1.x.y` 或 SHA
  - 追新優先：`@v1`（但要搭配固定回歸清單）
- 回歸失敗：標記「暫緩」，留下：
  - 失敗 log
  - 回退方式（回到舊版 pin）

## 驗收標準

- 事件觸發正確、輸出可控（不亂留言/不亂改檔）
- 連續 3 次測試 run 成功（至少含一次 PR 情境）
- 留下可追溯記錄（版本、日期、通過/失敗、回退方案）

