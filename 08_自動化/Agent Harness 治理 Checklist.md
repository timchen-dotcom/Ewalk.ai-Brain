# Agent Harness 治理 Checklist

建立日期：2026-05-26  
更新日期：2026-06-02  
狀態：草稿（已吸收 `AGENT = LLM + HARNESS` 架構，待提姆先生確認後，才可納入正式規範）

## 核心公式

```text
Agent = LLM + Harness
```

在 Ewalk.ai 裡，LLM 是 Codex、ChatGPT、Claude Code、Gemini、Gemma 等模型或工作台能力。Harness 是讓這些能力變成可營運 AI 員工的外骨架，包含任務入口、上下文、觀測、推理、行動、驗證、記憶、工具、權限、批准、成本與回復。

相關架構文件：[[Agent Harness 阿順自我完成架構]]

## 用途

把「多 Agent / Skills / Tools / Plugins / MCP / Worktrees」變成可治理、可稽核、可回退的工作底座，避免：

- 權限越界（誤改、誤發、誤花錢）
- 長任務不可恢復（卡住不知道怎麼救）
- 記憶/規則漂移（今天有效、明天壞掉但找不到變更點）
- 成本不可拆帳（只知道貴，但不知道貴在哪）
- 多任務互相污染（同一 working tree 打架）

## 使用時機

- 要導入或升級：Codex / Claude Code / Gemini CLI / ChatGPT 工作流
- 要新增：Skills、Plugins、MCP server、外部工具連線
- 要做常駐自動化（例如：每日情報蒐集、固定產檔、定時任務）
- 要讓多 agent 並行（含 worktree / tmux / 多工作區）

## Checklist（最小可落地）

### 0) Agent Loop（每次任務都要有）

- [ ] Context：本次任務需要哪些最小上下文
- [ ] Observe：讀了哪些檔案、頁面、API 或狀態
- [ ] Reason：做了哪些判斷、風險分級與路線選擇
- [ ] Act：實際做了哪些寫檔、產物、工具呼叫或草稿
- [ ] Verify：如何確認結果可用
- [ ] Memory：哪些內容要寫回 Obsidian / Firestore / audit log

### A) 任務與範圍（先定義再開工）

- [ ] 任務目標清楚（輸入/輸出/驗收標準）
- [ ] 任務範圍清楚（只做蒐集/草稿 vs 允許寫檔/改規則）
- [ ] 風險等級已標記（對外/金流/預算/核心規則＝高風險）
- [ ] 需要批准的點已列出（請參考：[[AI員工權限隔離規則]]）

### B) 權限與工具（預設最小權限）

- [ ] 預設 read-only；若要寫檔，限定在指定資料夾（例如本 vault 的 `workspace-write`）
- [ ] 明確列出允許工具清單（shell / git / python / browser / mcp）
- [ ] 明確列出禁止事項（外發、刪除、改金流/預算、改核心規則）
- [ ] 外部連線（webhook、API key、OAuth）一律視為高風險：先出草稿，等提姆先生批准再接通
- [ ] 防注入底線（AWI / prompt injection）：外部不可信內容只能當「資料」，不得變成「可執行指令」或「工具調用依據」
  - 例：GitHub issue/PR/comment、網頁內容、第三方文件的內容 → 必須經過「資料/指令分離」與 allowlist 才能影響工具行為
  - 參考：AWI（Agentic Workflow Injection）研究（TaintAWI）：https://arxiv.org/abs/2605.07135
- [ ] Headless / CI 模式底線：若 agentic CLI 放進 GitHub Actions、CI runner 或無人值守排程，必須先確認版本下限、workspace trust、secrets 隔離與工具 allowlist
  - 外部 PR / issue / comment 觸發的流程，不得使用自動信任工作目錄、`--yolo` 或等價「跳過確認」模式
  - CI secrets 只開給已信任分支與已批准 workflow；不可信輸入只能產出草稿或報告，不得直接執行 shell / deploy / webhook
  - 參考：Gemini CLI / GitHub Action headless workspace trust 與 allowlist bypass 風險（2026-05）

### C) 工作區隔離（避免互相污染）

- [ ] 一個任務一個工作區（建議：git worktree / 分支 / 獨立資料夾）
- [ ] 任務切換時，先「結案」再開新任務（避免半成品污染下一件事）
- [ ] 若使用 worktree：確認 sandbox/write allowlist 覆蓋新路徑（避免誤判成可寫/不可寫）

### D) 記憶/規則變更（避免悄悄漂移）

- [ ] 所有「記憶/規則變更」必須可追蹤：以「變更單」形式紀錄（內容、原因、影響範圍、回退方式）
- [ ] 優先採用「inbox/patch 審核」思路：先提案 → 審核 → 套用（不要直接把新規則寫死）
- [ ] 記憶注入（若有）必須「可追溯、可回退」：每次注入的記憶片段要有證據連結；摘要不得覆蓋證據

### E) 成本/使用量拆帳（先能量測再優化）

- [ ] 至少能拆出四類：
  - 模型 token（或費用）
  - 工具呼叫（含外部 API）
  - MCP server（每個 server 的呼叫量/成本）
  - plugins/skills/subagents（哪個最花）
- [ ] 每次跑完留一段「成本異常解釋」（例如：為何今天暴增）

### F) 可恢復與可觀測（長任務不怕卡）

- [ ] 任務一定要能「重啟」：清楚知道重跑會不會重複寫入、會不會造成副作用
- [ ] 失敗時要有「下一步指令」：怎麼看狀態、怎麼停、怎麼恢復、怎麼回退
- [ ] 對外輸出/通知若失敗：必須保留草稿與原因，不阻塞主交付（例如 Discord 失敗就寫入每日檔案）

### G) Run Log（Ewalk.ai 目前最缺）

- [ ] 每次 AI 任務建立 `ai_run_id`
- [ ] 記錄任務來源、目標、使用角色、使用 Skill、使用工具
- [ ] 記錄輸入資料與輸出檔案
- [ ] 記錄批准需求與批准狀態
- [ ] 記錄成本、錯誤、重跑方式
- [ ] 任務完成後能回查「為什麼這樣做」

## 建議輸出模板（每次升級/導入時都留）

```md
# Agent Harness 變更單 - YYYY-MM-DD

## 目的

## 影響範圍

## 權限等級（L0-L5）

## 變更內容

## 風險與回退

## 驗收標準

## 結果與後續
```

## 來源（本次整理依據）

- Codex CLI `0.133.0` release notes：https://github.com/openai/codex/releases/tag/rust-v0.133.0
- Claude Code `v2.1.149` release notes：https://github.com/anthropics/claude-code/releases/tag/v2.1.149
- ECC（agent harness 參考）：https://github.com/affaan-m/ECC
- Gemini CLI CVSS 10.0 RCE research note：https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/05/CSA_research_note_gemini_cli_rce_cvss10_ai_tool_security_20260502-csa-styled.pdf
