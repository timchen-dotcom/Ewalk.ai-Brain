# GitHub 自我升級情報自動化

## 目的

每天早上 04:00 自動到 GitHub 與公開開源討論中，蒐集與「蒸餾、優化、進化、省 Token、自我升級」相關的內容，整理成白話情報，放進 Ewalk.ai 的自我升級情報庫，並通知提姆。

## 自動化原則

- 只蒐集與整理，不直接修改 Ewalk.ai 系統。
- 只保留對 Ewalk.ai 有用的內容，不收藏純 hype 或不明來源說法。
- 每則情報都要附來源連結。
- 通知提姆時要用白話說明：這件事對我們有什麼幫助。
- 只有提姆允許後，才進入 `/自我升級` 修改 SOP、Prompt、Skill、入職手冊或系統規則。

## 蒐集範圍

- 優先工具：Codex、OpenClaw、Claude Code、Gemini、ChatGPT、Images 2.0、即夢 2.0 / 國際版、Nano Banana
- GitHub repositories
- GitHub issues / discussions
- 開源工具 release notes
- 高度討論、快速成長、具實作價值的 AI repo
- 與 Agent、RAG、context engineering、prompt compression、token optimization、knowledge distillation、memory、multi-agent workflow、skill prompt budget、skill-cleaner 相關的公開內容

## 搜尋優先順序

1. 先看優先 AI 工具是否有新技巧、案例、Prompt、Skill、工作流或成本優化方式。
2. OpenClaw 與 skill-cleaner 若有重大 release、skill 安全、ClawHub / SkillSpector、Gateway / runtime、prompt budget 優化，視為優先收錄候選。
3. 再看高度討論、快速成長、具實作價值的 AI repo，判斷是否值得學習。
4. 再看自我升級、蒸餾、省 Token、Agent 工作流等通用方法。
4. 最後才看新工具；新工具必須能明確改善 Ewalk.ai 目前工作流，才收錄。

## 高度討論 Repo 判斷

優先關注符合以下條件的 repo：

- 近期 stars / forks 明顯增加
- issues / discussions 活躍且有實作細節
- 最近有 release 或重大功能更新
- 被多個技術來源引用
- 和 Agent、自我優化、省 token、內容生成、圖像生成、影片生成、RAG、memory、workflow automation 相關

收錄時必須白話說明：這個 repo 對 Ewalk.ai 有什麼幫助。熱門但沒有明確用途的 repo，列為暫不吸收。

優先追蹤清單見：[[../09_知識庫/自我升級情報/優先AI工具追蹤清單|優先AI工具追蹤清單]]

## 儲存位置

- 情報庫：`Ewalk.ai Brain/09_知識庫/自我升級情報`
- 每日檔案：`YYYY-MM-DD_GitHub自我升級情報.md`

## Discord 通知

優先通知到 `#自我升級`；若尚未建立或尚未接通 Webhook，先發到 `#系統通知`。

Discord 設定代號：

- `self_upgrade`

## Codex `remote-control` 試點提案（需提姆允許）

> 來源：Codex CLI `0.130.0`（openai/codex releases）

目標：把「每日情報蒐集 → 產檔 → Discord 通知」從一次性 CLI，改成更可控的常駐/可重啟流程。

原則：

- 不改動既有輸出格式與檔案路徑
- 先做小範圍試點（只針對自我升級情報）
- 失敗能快速回退到原流程

落地參考 SOP：

- [[../13_SOP流程/Codex CLI 升級與回歸驗證SOP|Codex CLI 升級與回歸驗證 SOP]]
- [[../13_SOP流程/Codex Remote-control 常駐自動化試點SOP|Codex Remote-control 常駐自動化試點 SOP]]

## 2026-05-11：試點已核准（只針對自我升級情報）

範圍：只做「每日 GitHub 情報蒐集 → 產檔 → Discord 通知（或草稿）」；不改命名、不改路徑、不改格式。

落地方式：

- 先依 [[../13_SOP流程/Codex CLI 升級與回歸驗證SOP|Codex CLI 升級與回歸驗證 SOP]] 做最小回歸
- 常駐化方式依 [[../13_SOP流程/Codex Remote-control 常駐自動化試點SOP|Codex Remote-control 常駐自動化試點 SOP]]
- 若環境無法對外送 Discord（DNS/網路），保留「Discord 通知草稿」在每日檔案即可，不阻塞產檔

驗收標準（最小）：

- 連續 7 天（或至少 3 次）成功產出每日檔案
- 失敗時能從日誌快速定位原因，且可一鍵回退到一次性流程

## 每日通知格式

```md
阿順自我升級情報｜YYYY-MM-DD

今天找到 X 則值得看，Y 則建議先觀察。

最有用的 3 件事：
1. 
2. 
3. 

白話說，這對 Ewalk.ai 的幫助是：

我建議：
- 可升級：
- 先觀察：

等提姆允許後，我再進入 /自我升級。
```
