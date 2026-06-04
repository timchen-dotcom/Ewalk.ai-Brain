# 2026-06-02 自我升級｜Agent = LLM + Harness 架構吸收

## 來源

- 類型：截圖
- 提供者：提姆先生
- 來源內容：`AGENT = LLM + HARNESS`
- 圖中元素：Prompt、Orchestration、Context、Observe、Reason、Act、Tools & Skills、Security & Governance、Memory

## 可吸收重點

- Agent 的核心不是只有模型能力，而是模型外面的工作外骨架。
- Harness 負責把任務入口、上下文、工具、記憶、治理、批准、行動與回報串成可重複流程。
- Ewalk.ai 已有多個工具與 AI 員工，但要避免分散成一堆單點工具，必須用 Harness 統一管理。
- 阿順需要的不是再多一個模型身份，而是可觀測、可批准、可恢復、可沉澱的任務執行層。

## 系統優化判斷

高價值：

- 直接補強 Ewalk.ai AI Command Center 的核心架構。
- 可用來判斷 OpenCode、Claude Code、Gemini、Codex、ChatGPT、Gemma 的定位：它們是工具或 LLM 層，不是公司級 Harness 本身。
- 可把既有 Firestore schema 中的 `ai_runs`、`usage_costs`、`approvals`、`audit_logs` 推進成真正的營運底座。

暫不吸收：

- 不因此立刻接新的外部工具。
- 不把高風險行動自動化。
- 不修改 `AGENTS.md` 全域規則，先放在 08_自動化架構文件。

## 已更新

- `Ewalk.ai Brain/08_自動化/Agent Harness 阿順自我完成架構.md`
- `Ewalk.ai Brain/08_自動化/Agent Harness 治理 Checklist.md`
- `Ewalk.ai Brain/08_自動化/README.md`

## 待確認

- 提姆先生是否批准 Phase 1：建立 `ai_runs` 執行紀錄 dry-run。
- Command Center 是否下一版新增「AI 執行紀錄」區塊。
- 是否把 Harness 變更單列為每次自我升級後的固定輸出。
