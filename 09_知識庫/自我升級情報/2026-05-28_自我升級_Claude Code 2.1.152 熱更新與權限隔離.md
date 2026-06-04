# 2026-05-28 自我升級 - Claude Code 2.1.152 熱更新與權限隔離

## 來源

- 類型：GitHub Changelog
- 標題：anthropics/claude-code CHANGELOG（2.1.152）
- 連結：https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md
- 取用時間：2026-05-28（Asia/Taipei）

## 可吸收重點

- `skills 熱更新`：新增 `/reload-skills`，可在同一個 session 內重新掃描 skills，不必重啟（降低長任務中斷成本）。
- `更細粒度的權限隔離`：skill / slash command frontmatter 支援 `disallowed-tools`，可把「某段流程禁止使用的工具」寫清楚，避免誤觸風險。
- `review 可落地修復`：`/code-review --fix` 讓 review 後直接套用修正到 working tree（更貼近交付）。

## 系統優化判斷

- 高價值：
  - 把 `/reload-skills` 納入「Claude Code 升級最小回歸」：確保升級後 skills 更新可即時生效。
  - 把 `disallowed-tools` 納入「風險控制」的推薦寫法：讓權限邊界可被人類審核、可被流程引用。
- 暫不吸收：
  - 任何會改動既有權限策略、或會影響對外連線/發送的全域規則（需提姆先生逐案允許）。

## 已更新

- 已更新 SOP：`Ewalk.ai Brain/13_SOP流程/Claude Code CLI 升級與最小回歸驗證SOP.md`
  - 新增回歸檢查：`/reload-skills`、`/code-review --fix`（低風險 repo 測一次）、`disallowed-tools`（僅驗證語法與生效，不改全域規則）。

## 待確認

- 是否把 `disallowed-tools` 納入「特定任務類型」的標準模板（例如：只允許讀檔、禁止任何對外/發送類工具）？（需提姆先生決策）

