# 2026-05-10 自我升級 - Codex Remote-control 試點與技能包治理

## 來源

- Codex CLI release：openai/codex `0.130.0`
  - https://github.com/openai/codex/releases
- 今日情報彙整：[[2026-05-10_GitHub自我升級情報|2026-05-10 GitHub 自我升級情報]]

## 可吸收重點

- `codex remote-control` 讓 Codex 從「一次性 CLI」更接近「可控、可重啟、可長任務運行」的 app-server 形態，適合做每日自動化常駐/排程。
- plugin 分享與 discoverability（可發現性控制）有助於把內部固定流程（SOP）「技能包化」，並建立版本/回滾與可見範圍治理（降低亂用與風險）。
- thread pagination / unloaded/summary/full views 的方向，提醒我們：長任務要有「摘要層」與「載入策略」，避免每次都把完整歷史塞回上下文（成本與穩定性）。

## 系統優化判斷

- 高價值：
  - 把「每日 GitHub 情報蒐集 → 產檔 → Discord 通知」升級成更穩的可控流程（可重啟、可監控、可回滾）。
  - 建立技能包治理規則：內部 SOP 可以被複製、被版本控，但不會被模型誤觸發或被不該看的範圍看到。
- 暫不吸收：
  - **不直接改動**現有自動化行為（排程、通知路徑、權限），先做試點與回歸驗證。
  - 不把任何「尚未驗證」的工具行為寫入全域規則（`AGENTS.md`）。

## 已更新

- 新增 SOP：[[../13_SOP流程/Codex CLI 升級與回歸驗證SOP|Codex CLI 升級與回歸驗證 SOP]]
- 新增 SOP：[[../13_SOP流程/Codex Remote-control 常駐自動化試點SOP|Codex Remote-control 常駐自動化試點 SOP]]
- 更新自動化文件：[[../08_自動化/GitHub自我升級情報自動化|GitHub 自我升級情報自動化]]（新增「Codex remote-control 試點提案」與驗收點）

## 待確認

- 提姆是否同意先做 **7 天試點**：只針對「自我升級情報」這條線，驗證 remote-control 常駐的穩定性與維運成本。
- 技能包治理策略要採用哪個等級：
  - A) 先只做「內部文件化與命名規範」（最低成本）
  - B) 加上「版本固定與回滾流程」（中成本）
  - C) 再加上「可見範圍/觸發規則治理」（最高價值、需要更多設計）

