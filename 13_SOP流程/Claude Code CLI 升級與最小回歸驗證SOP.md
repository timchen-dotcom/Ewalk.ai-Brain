# Claude Code CLI 升級與最小回歸驗證 SOP

## 目的

把 Claude Code CLI 的升級從「直接升」改成「可回歸、可回滾、可驗收」的小流程，避免版本更新造成長任務卡死、plugin 行為改變、或上下文成本失控。

## 使用時機

- Claude Code CLI 有新版本更新（尤其 changelog 提到 plugins / compaction / background sessions / worktree 行為）
- 準備把 Claude Code 納入較長的任務（例如：批次修補、工具串接、repo 多輪改動）
- 近期版本提到 `/bg`、hook loop cap、worktree cleanup、背景模型/effort 維持等長任務穩定性修正時

## 前置條件

- 先在「測試環境」或可接受風險的機器升級（不要先在主力交付環境盲升）
- 有一個固定回歸清單（見下方）

## 升級流程

### 1) 記錄升級前狀態（必做）

- 記錄版本：`claude --version`（或等價指令）
- 記錄目前啟用的 plugins（若有）：
  - 在 Claude Code 內用 `/plugin list`（或等價指令）截一份清單到筆記

### 2) 升級（在測試環境）

- 依你當前安裝方式升級（brew / npm / 下載二進位 / 其他）
- 升級後再次記錄版本號與日期

### 3) 最小回歸（必跑）

至少跑 4 項；任一失敗就先暫緩導入：

1) 基本啟動
- `claude` 能啟動並完成一次最短互動（輸入一行 → 回覆一段）

2) Plugin 治理（避免誤關依賴）
- 若有安裝 plugins：執行一次 `claude plugin disable <任一 plugin>`（或對應操作）
- 確認「依賴鏈」不會讓必要 plugin 被誤關（或至少有明確阻擋/提示）

3) Plugin 成本可視化（projected context cost）
- 開啟 `/plugin` marketplace 瀏覽頁（或等價 UI）
- 確認能看到 projected context cost（若該版本支援）

3.1) Skills 熱更新（若有用 skills／hooks）
- 執行 `/reload-skills`
- 驗收：不重啟 session 也能讀到最新 skills（至少能觀察到新增/修改的 skill 生效）

3.2) Code review 可落地修復（建議做一次）
- 在低風險 repo/分支執行：`/code-review --fix`
- 驗收：能把修正套到 working tree，且不會產生大量無關改動（若有，標記暫緩）

3.3) 風險控制：disallowed-tools（只做驗證，不改全域規則）
- 選一個「可丟棄的測試 skill」加上 frontmatter `disallowed-tools`（例如禁止任何對外/發送類工具）
- 驗收：規則可被讀取且有明確阻擋/提示；若行為不明確，先暫緩導入到正式流程

4) 背景任務隔離策略（視情況）
- 若你有用 background sessions / worktree：確認升級後仍可正常進行
- 若 repo 不適合 worktree：記錄是否需要調整 `worktree.bgIsolation`（僅記錄，不在主力環境先改）
- 若有使用 `/bg`：確認背景 session 仍維持指定模型/effort，且不會因 cleanup 誤刪工作中的 worktree

5) Compaction / 長任務穩定性（觀察）
- 跑一個 5～10 分鐘的低風險任務（例如：讀 1 檔 → 產出 1 檔）
- 觀察是否出現：
  - 無限迴圈式自言自語
  - 反覆 summarize 失敗（token 浪費）
  - 明顯輸出膨脹（不必要的重複摘要/表格）

6) Hook loop cap（若有 hooks）
- 若 repo 有 hooks：跑一次會觸發 hooks 的低風險操作
- 確認 hook 不會反覆觸發到無限迴圈；若有 loop cap 提示，保留截圖/文字紀錄

### 4) 升級結論

- 回歸全過：標記「可升級」，再安排主力環境升級
- 任一失敗：標記「暫緩」，保留失敗現象、版本號與回退方式

## 驗收標準

- 最小回歸 ≥ 4 項全過；若使用 `/bg` 或 hooks，對應檢查也必須通過
- 長任務體感不退化（更慢/更不穩/更貴都算退化）
- 留下可追溯記錄（版本、日期、通過/失敗、卡住點）
