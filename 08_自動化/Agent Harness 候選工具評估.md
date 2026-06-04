# Agent Harness 候選工具評估

建立日期：2026-06-02  
負責角色：阿順  
最終決策者：提姆先生  
狀態：第一版候選清單，尚未導入正式系統

## 結論

Ewalk.ai 不建議找「一個萬能 Harness」。

比較穩的架構是四層組合：

```text
核心 Agent SDK
  + 狀態 / 長任務流程引擎
  + 觀測 / 成本 / 評估工具
  + Gateway / 多通道對談入口
  + 低代碼自動化橋接
```

這樣比較符合 Ewalk.ai 的現況：我們已經有 Obsidian、Firebase、Command Center、Codex、Gemma、GitHub 研究員、Meta / Google / Gmail / Discord 等工具，不需要整套推翻。

## 第一優先候選

| 工具 | 定位 | 適合 Ewalk.ai 的原因 | 風險 |
| --- | --- | --- | --- |
| OpenHarness / ohmo | Agent Harness / personal agent 基礎設施 | 最貼近 `LLM + Harness` 概念，包含 agent loop、工具、skills、memory、permission、subagent、dry-run；可研究怎麼補我們自家 Harness | 新興專案，要先 PoC，不可直接接高風險工具 |
| OpenClaw | 自架式 agent gateway / 多通道個人助理 | 適合把阿順接到 Discord、Telegram、Slack、WhatsApp、Web UI 等入口，並管理 session、workspace、routing | 預設能力太廣，安全與權限要重新收斂；不適合直接碰公司金流、發文與廣告 |
| NVIDIA OpenShell / NemoClaw | 安全 runtime / sandbox / enterprise agent stack 參考 | 對應黃仁勳爸爸圖中的協同框架安全層，可研究 sandbox、policy、privacy、agent runtime 怎麼做 | 目前偏 enterprise / NVIDIA stack，導入前要確認 Mac / Ewalk.ai 現有流程能否承接，不可直接取代 Command Center |
| OpenAI Agents SDK | 核心 Agent SDK | 有 handoff、tools、guardrails、tracing，適合做阿順第一版核心 agent loop | 綁定 OpenAI 生態較深，跨模型要另外設計 |
| LangGraph | 狀態型流程 / 長任務 agent runtime | 強在 durable execution、persistence、human-in-the-loop，適合任務卡住後恢復 | 比較工程化，上手成本較高 |
| Langfuse | 觀測、trace、prompt、eval、成本 | 補 Ewalk.ai 最缺的可觀測與成本回查 | 不是 orchestration，本身不能取代 Harness |
| Dify | 低代碼 agentic workflow | 適合把固定 AI 工具做成 UI / workflow，非工程人員也能理解 | 複雜權限與長任務仍需外部治理 |
| n8n | 外部服務自動化橋接 | 適合 Gmail、Google、Discord、RSS、Webhook、表單等流程 | 不適合作為真正多 agent 核心，狀態與長期記憶要自己補 |

## 第二優先候選

| 工具 | 定位 | 適合情境 | 暫不先導入原因 |
| --- | --- | --- | --- |
| Temporal | Durable execution | 長時間任務、重試、恢復、人工批准、正式雲端工作流 | 導入成本高，等 `ai_runs` 與 Command Center 先穩 |
| Mastra | TypeScript agent framework | 若 Command Center 走 Vercel / Node / TS，可研究 | 先確認生態穩定度與部署模式 |
| Vercel AI SDK / WorkflowAgent | Web / Vercel agent runtime | 若未來 Ewalk.ai Web App 部署在 Vercel，很合適 | 目前 Firebase 已打底，先不切平台 |
| CrewAI | 角色型多 agent 快速原型 | AI 員工概念很直覺，適合做 PoC | 對 production control / observability 要補很多 |
| Microsoft Agent Framework / AutoGen | Microsoft 生態多 agent | 若未來接 Microsoft 365 / Azure，可列入 | 目前 Ewalk.ai 主軸不是 Microsoft 生態 |
| Pydantic AI Harness | Python 型別與能力封裝 | 嚴格輸出、schema validation、工具能力模組 | 目前我們 Node/Firebase 工具較多，可先觀察 |
| Flowise | 視覺化 LLM workflow | 快速展示、RAG、簡單 agent flow | 易變成原型工具，不建議當核心治理層 |
| AgentScope | agent stack / 多 agent 開發與評估 | 可研究 memory、hosting、evaluation 與多 agent 架構 | 與 Ewalk.ai 現有 Firebase / Obsidian 需重新接軌 |

## OpenClaw 類工具怎麼定位

提姆先生說的 OpenClaw 這類，和 OpenAI Agents SDK / LangGraph 不完全同層。

它更像：

```text
多通道 Gateway
  + agent session 管理
  + workspace / tools policy
  + chat app 入口
  + persistent assistant runtime
```

適合 Ewalk.ai 的地方：

- 讓阿順可以從 Discord、Telegram、Slack、Web UI 等地方被交辦。
- 每個 sender / channel / agent 可以有獨立 session。
- 可以把 Codex、Claude Code、其他 CLI agent 當 native harness 接進來。
- 對「手機也能跟阿順溝通」這件事很有幫助。

不適合直接做的地方：

- 不要一裝就給它完整電腦權限。
- 不要直接讓它發文、改廣告預算、取消訂閱或動金流。
- 不要讓外部訊息直接觸發 shell / deploy / webhook。
- 不要讓它取代 Ewalk.ai 自家批准制度。

所以它在 Ewalk.ai 的角色應該是：

```text
OpenClaw / OpenHarness = 阿順的多通道外骨架候選
Ewalk.ai Command Center = 公司治理與批准中心
Firebase / Obsidian = 記憶與任務資料庫
OpenAI Agents SDK / LangGraph = 核心任務推理與長流程
Langfuse = trace / 成本 / 失敗回放
```

## NVIDIA OpenShell / NemoClaw 怎麼定位

黃仁勳爸爸圖裡的關係可以這樣對照：

```text
OpenClaw = agent 協同框架 / agent 工作平台
OpenShell = 安全 runtime / sandbox / policy 層
NemoClaw = NVIDIA 企業級整合 stack
```

它對 Ewalk.ai 的價值不是「換掉阿順」，而是提醒我們：

- agent 不能只會動作，也要有安全外殼。
- 工具權限、資料隱私、sandbox、批准、觀測要成為底層能力。
- 協同框架要能接不同 agent，不應只綁單一模型或單一工具。

Ewalk.ai 的對應設計：

```text
Ewalk.ai Agent Harness = 我們的協同框架
Ewalk.ai Command Center = 公司治理與批准中心
Mac Studio 隔離主機 = 本地安全執行環境
OpenAI Agents SDK / LangGraph = 核心 agent loop 與長任務流程
Firebase / Obsidian = 狀態與記憶
Langfuse / ai_runs = 觀測與成本回放
OpenShell / NemoClaw = 未來安全 runtime 參考與 PoC 候選
```

短期做法：

- 不直接導入 NemoClaw 當正式系統。
- 先研究 OpenShell 的 sandbox / policy / privacy 設計。
- 把概念吸收到 Ewalk.ai 的 tool registry、approval gate、ai_runs 與 Mac Studio 隔離主機。
- 等本地阿順主機穩定後，再做低風險 PoC。

## 阿順建議導入順序

### Phase 1：不接外部 Harness，先補自家 Run Log

先完成：

- `ai_runs` dry-run
- `tool_registry` 文件
- `approval_gate` 文件與 Command Center 顯示
- 成本與錯誤欄位

原因：沒有這些基礎，接任何框架都會變成另一套黑盒。

### Phase 2：OpenAI Agents SDK PoC

使用場景：

- GitHub 自我升級研究員
- 社群內容草稿分派
- The Vision 客戶資料補齊任務

驗收標準：

- 能記錄 trace
- 能限制工具
- 能 handoff 給指定角色
- 能在高風險動作前停下來

### Phase 3：LangGraph PoC

使用場景：

- 週五美感趨勢週報
- 每日 GitHub 自我升級情報
- 客戶月報流程

驗收標準：

- 可以中斷後恢復
- 可以 human-in-the-loop
- 可以保存 state
- 不重複執行副作用

### Phase 4：Langfuse / 觀測層

使用場景：

- token 成本追蹤
- agent run trace
- prompt 版本比較
- 錯誤定位

驗收標準：

- 每次任務知道花多少
- 可以看出是哪個工具或 agent 花最多
- 可以回放失敗任務

### Phase 5：OpenClaw / OpenHarness Gateway PoC

使用場景：

- 阿順多通道入口
- Discord / Web UI / 手機交辦
- 不接正式發文、不接金流、不接廣告
- 只允許寫入 Obsidian 收件匣與 AI 執行紀錄 dry-run

驗收標準：

- 可以限定允許的 channel / sender
- 可以限制 workspace 與工具
- 可以留下 session 與 run log
- 可以在高風險工具前停下來
- 可以與 Command Center 的批准佇列分離

### Phase 6：Dify / n8n 只做業務橋接

Dify 適合：

- 內部 AI 工具 UI
- 固定工作流
- 客戶可理解的 demo

n8n 適合：

- Gmail / RSS / Discord / Google Sheet / Webhook
- 固定通知
- 外部 API 串接

它們不要當阿順核心大腦，只當流程與整合層。

## 不建議現在做的事

- 不要一次導入 CrewAI、LangGraph、Dify、n8n、Temporal。
- 不要把發文、預算、金流直接交給任何 Harness。
- 不要讓外部文件或 GitHub issue 直接觸發 shell / deploy / webhook。
- 不要把 API key、Page token、App secret 寫進 Obsidian 或 Firestore。
- 不要為了追新工具重寫已經能用的 Firebase / Command Center。

## 白話建議

最穩的組合：

```text
Ewalk.ai 自家 Harness 規則
  + OpenHarness / OpenClaw 做多通道 Gateway PoC
  + OpenAI Agents SDK 做核心 Agent Loop
  + LangGraph 做長任務與人審流程
  + Langfuse 做觀測與成本
  + Dify / n8n 做業務自動化橋接
```

OpenClaw / OpenHarness 可以研究，但先當「多通道入口與 Harness 參考」，不要直接當公司治理中心。

## 參考來源

- OpenAI Agents SDK：https://platform.openai.com/docs/guides/agents-sdk/
- OpenAI Agents SDK Guardrails：https://openai.github.io/openai-agents-js/guides/guardrails
- OpenAI Agents SDK Tracing：https://github.com/openai/openai-agents-python/blob/main/docs/tracing.md
- LangGraph Durable Execution：https://docs.langchain.com/oss/python/langgraph/durable-execution
- LangGraph Persistence：https://docs.langchain.com/oss/python/langgraph/persistence
- LangGraph Human-in-the-loop：https://docs.langchain.com/oss/python/langgraph/human-in-the-loop
- Dify Docs：https://docs.dify.ai/en/guides/workspace/app
- Dify Orchestration Logic：https://docs.dify.ai/en/use-dify/build/orchestrate-node
- Langfuse：https://langfuse.com/
- n8n AI Agents：https://docs.n8n.io/advanced-ai/examples/understand-agents/
- Temporal：https://temporal.io/
- Mastra：https://mastra.ai/
- Vercel Agents / AI SDK：https://vercel.com/docs/agents/
- CrewAI：https://docs.crewai.com/
- Microsoft Agent Framework：https://learn.microsoft.com/en-gb/agent-framework/overview/agent-framework-overview
- Pydantic AI Harness：https://pydantic.dev/docs/ai/harness/overview
- Flowise：https://docs.flowiseai.com/
- OpenClaw Docs：https://docs.openclaw.ai/
- OpenClaw GitHub：https://github.com/openclaw
- OpenClaw Agent Harness Plugins：https://docs.openclaw.ai/plugins/sdk-agent-harness
- OpenHarness GitHub：https://github.com/HKUDS/OpenHarness
- AgentScope：https://agentscope.io/
