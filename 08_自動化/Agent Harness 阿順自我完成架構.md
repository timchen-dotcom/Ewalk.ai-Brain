# Agent Harness 阿順自我完成架構

建立日期：2026-06-02  
來源：提姆先生提供截圖，核心句為 `AGENT = LLM + HARNESS`  
負責角色：阿順  
最終決策者：提姆先生  
狀態：架構吸收完成，待進入 Harness MVP

## 核心結論

Agent 不是只有 LLM。LLM 是大腦與語言推理能力，Harness 是讓這個大腦能被公司使用的工作外骨架。

對 Ewalk.ai 來說：

```text
阿順 = LLM 能力 + Ewalk.ai Harness
```

所以目前優先不是再找一個更酷的 coding agent，而是把 Codex、Claude Code、Gemini、ChatGPT、Gemma、AI 工具實驗室、Firebase、Meta、GitHub 研究員全部包進同一套可控流程。

## 圖中架構轉成 Ewalk.ai 語言

| 圖中元素 | Ewalk.ai 對應 | 目前狀態 | 缺口 |
| --- | --- | --- | --- |
| Prompt | `AGENTS.md`、Prompt 資料庫、SOP | 已有基礎 | 需要任務型 Prompt 與驗收綁定 |
| Orchestration | AI Command Center、任務分類、營運 Flows | 有文件與雛形 | 缺可執行任務狀態機 |
| Context | Obsidian 客戶資料、SOP、Firestore 資料 | 已有大量資料 | 缺自動挑選上下文規則 |
| Observe | 讀檔、瀏覽器、Firebase 回查、GitHub/Gmail/Google 工具 | 能做但分散 | 缺標準觀測紀錄 |
| Reason | 阿順判斷、分派、風險評估 | 目前靠主對話完成 | 缺固定決策紀錄格式 |
| Act | 寫文件、產 dry-run、呼叫工具、發文前準備 | 已有多個工具 | 高風險行動需統一批准閘 |
| Tools & Skills | Codex、Skills、AI 工具實驗室、Firebase、Meta 工具 | 已逐步建立 | 缺工具註冊與權限 allowlist |
| Security & Governance | 權限隔離、批准關卡、audit logs、Firebase rules | 已有基礎 | 缺每次執行的強制稽核 |
| Memory | Obsidian、Firestore、daily handoff、audit logs | 已有資料庫 | 缺 `ai_runs`、成本、錯誤與回復紀錄 |

## 我們現在缺什麼

不是主要缺 LLM。

不是主要缺另一個 coding 工具。

真正缺的是「Harness Runtime」，也就是每次阿順做事時，都能固定留下：

1. 這次任務是什麼。
2. 啟動哪些 AI 員工與 Skill。
3. 讀了哪些資料。
4. 做了哪些判斷。
5. 動了哪些檔案或工具。
6. 哪些地方需要提姆先生批准。
7. 花了多少成本或時間。
8. 失敗時怎麼恢復。
9. 完成後寫進哪裡當記憶。

## Ewalk.ai Harness 七層

### L1 任務入口

來源包含：

- Codex 聊天窗口
- Discord 交辦
- Obsidian 收件匣
- GitHub 自我升級情報
- Gmail / Calendar / Google Drive
- Command Center 手動任務

每個入口都要轉成同一種任務格式。

### L2 任務分類與佇列

把任務分成：

- 立即處理
- 本週處理
- 排程處理
- 待補資料
- 待批准
- 已完成
- 封存

### L3 Context Router

根據任務類型，自動挑選最少但足夠的上下文：

- 客戶資料
- SOP
- Prompt
- Skill
- 近期交付物
- 權限規則
- 成本紀錄

### L4 Observe / Reason / Act Loop

每次任務都照這個迴圈：

```text
Context -> Observe -> Reason -> Act -> Verify -> Memory
```

其中 `Verify` 是 Ewalk.ai 必加層，因為客戶交付與自動化不能只靠「做完了」。

### L5 Tool & Skill Registry

每個工具要登記：

- 可用任務
- 可讀資料
- 可寫範圍
- 是否會對外
- 是否會花錢
- 是否需要批准
- 失敗時怎麼停

### L6 Security & Governance

高風險行動一定要走批准：

- 對外發文
- 廣告預算
- 金流 / 訂閱取消
- 客戶正式承諾
- API key / token / OAuth
- 核心規則修改
- Blaze / 付費雲端資源

### L7 Memory & Observability

要補上的正式記憶欄位：

- `ai_runs`：每次 AI 任務執行紀錄
- `usage_costs`：token / API / 工具成本
- `tool_calls`：呼叫了哪些工具
- `approval_events`：批准或退回
- `error_logs`：錯誤與恢復方式
- `memory_updates`：哪些內容被沉澱成 SOP / Prompt / 文件

## 下一步落地順序

### Phase 1：建立 Run Log Harness

先不做複雜自動化，只建立「每次阿順做事的執行紀錄」。

產出：

- `ai_runs` schema
- 任務執行紀錄模板
- Command Center 的「AI 執行紀錄」區塊
- 每次高價值任務結束後自動留下變更單

已建立第一版模板：[[../模板/Agent Harness任務執行紀錄模板|Agent Harness 任務執行紀錄模板]]

候選外部 Harness 評估見：[[Agent Harness 候選工具評估]]

主機與安全性評估見：[[Agent Harness 主機安全評估]]

### Phase 2：建立 Tool & Skill Registry

把現有工具分級：

- 只讀工具
- 寫檔工具
- 對外工具
- 高風險工具
- 需批准工具

產出：

- 工具權限表
- Skill 觸發條件表
- AI 員工可用工具表

### Phase 3：建立 Approval Gate

所有高風險行動先進待批准佇列，由提姆先生批准後才執行。

產出：

- `approvals` 更完整 schema
- Command Center 批准區
- 發文 / 預算 / 金流 / 規則修改共同批准流程

### Phase 4：建立 Cost & Recovery

讓 Ewalk.ai 知道每次任務花在哪裡，也知道卡住時怎麼救。

產出：

- 成本紀錄
- 任務重跑規則
- 失敗恢復 SOP
- 每週 token / API 成本摘要

## 對提姆先生的白話結論

我們不是缺一個更聰明的員工。

我們缺的是一套能讓所有 AI 員工照規矩上班、留下紀錄、知道什麼能做什麼不能做、做完能交付、出錯能恢復的管理系統。

這就是 Harness。

Ewalk.ai 現在已經有 LLM、工具、資料庫、客戶資料、SOP 和權限規則。下一步就是把它們全部套進 Harness，讓阿順從「會做事」升級成「可營運的 AI 經理人」。
