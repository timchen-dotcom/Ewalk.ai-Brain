# AI 開源 Repo 候選資料庫

建立日期：2026-05-31
狀態：啟用中

## 用途

這份資料庫存放尚未導入、但值得 Ewalk.ai 持續追蹤的 AI 開源 repo。

使用原則：

- 不因為熱門就導入。
- 只有當 Ewalk.ai 出現明確任務需求，才從資料庫拉出來做 PoC。
- 每日自我升級情報若看到重大 release、授權變動、資安風險、商用限制或新案例，才更新狀態。

## 已導入前三名

以下 repo 已進入 [[../../../08_自動化/AI工具實驗室/README|Ewalk.ai AI 工具實驗室]] 的 MVP 工具：

| Repo | 對應工具 | 狀態 |
| --- | --- | --- |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | 官網與 Google 商家 AI 健檢 | MVP 導入 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | 瀏覽流程 AI 健檢 | MVP 導入 |
| [langgenius/dify](https://github.com/langgenius/dify) | Dify 風格 AI Workflow 產生器 | MVP 導入 |

## 候選資料庫

| Repo | 類型 | 可用場景 | 目前不導入原因 | 觸發拉出條件 | 追蹤狀態 |
| --- | --- | --- | --- | --- | --- |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | 工作流自動化 | Make 備援、自架流程、內部自動化 | 目前已有 Make，直接導入會增加維運成本 | 需要自架、成本控管或 Make 無法處理的流程 | 持續追蹤 |
| [FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise) | 視覺化 AI Agent | 快速展示 AI workflow demo | 與 Dify 重疊，短期不養兩套 | 客戶需要可視化流程 demo，且 Dify 不適合 | 持續追蹤 |
| [open-webui/open-webui](https://github.com/open-webui/open-webui) | 自架 AI Chat / RAG UI | 內部知識庫問答、本地模型入口 | 目前 Ewalk.ai 已有 Codex / ChatGPT / Obsidian | 要做私有 AI 對話入口或本地模型管理 | 持續追蹤 |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | 圖像生成工作流 | 客戶品牌圖像、素材風格流、批量生成 | 需要 GPU、模型管理與圖像產線規範 | 圖像生成需求穩定每月重複出現 | 持續追蹤 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | 網頁抓取 API | 大量網頁擷取、競品研究、官網分析 | AGPL-3.0 與 API 成本需確認 | crawl4ai 不夠穩或需要雲端 API 規模化 | 持續追蹤 |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | 多 Agent 框架 | 阿順、研究員、客戶成功等 AI 員工正式流程化 | 需要工程實作與較完整測試 | AI 工具實驗室需要正式 agent runtime | 持續追蹤 |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | MCP server 集合 | 串接 GitHub、Google Drive、資料庫、檔案系統 | 每個 server 權限與品質不同，不能整包導入 | 需要某個明確外部系統連接器 | 持續追蹤 |
| [openclaw/openclaw](https://github.com/openclaw/openclaw) | 個人 AI Agent / Gateway runtime | Discord / WhatsApp / Slack 等通訊入口、常駐 AI 員工、跨工具執行、個人工作流自動化 | 權限面很大，涉及本機檔案、shell、瀏覽器、外部服務與長期記憶，需先做安全邊界 | 要升級 Discord 阿順、常駐 AI 員工、跨工具任務入口或個人 OS 型工作流時 | 重點追蹤 |
| [steipete/agent-scripts](https://github.com/steipete/agent-scripts) | Agent scripts / skill-cleaner | 掃描 Codex / OpenClaw skills 的描述過長、重複、未使用與 prompt budget 壓力 | 不應直接自動刪 skill；只能先出報告，再人工決定 | 每月 skill 治理、skills 數量快速增加、上下文壓力變高時 | 重點追蹤 |

## 每日追蹤規則

每日自我升級情報可追蹤：

- 是否有重大 release
- 是否有商用授權或 pricing 變動
- 是否有資安 / 供應鏈風險
- 是否有適合 Ewalk.ai 的實作案例
- 是否和 Google 商家、SEO、自動化、素材生成、AI 員工流程直接相關
- OpenClaw 是否有 Gateway / runtime、Skills / Plugins、ClawHub 安全、auto mode、SkillSpector 或多 agent workflow 更新
- skill-cleaner 是否有新的 token budget、描述壓縮、重複技能或未使用技能判斷方式

## 拉出評估格式

```md
## 為什麼現在需要這個 repo？

## 要解決哪個 Ewalk.ai 任務？

## PoC 範圍

## 權限與成本風險

## 成功 / 失敗標準

## 是否進入導入
```
