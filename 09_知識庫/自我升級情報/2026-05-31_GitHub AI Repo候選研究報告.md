# 2026-05-31 GitHub AI Repo 候選研究報告

建立日期：2026-05-31
負責角色：GitHub 研究員
狀態：第一版候選清單

## 來源確認

提姆先生提供的 YouTube Shorts：

- 影片連結：https://youtube.com/shorts/GTvrwYp0IGc?si=CDs9irwBg5cNra-P
- 公開標題：GitHub上最值得收藏的5个AI宝藏项目！#AI工具 #开源项目 #AI开发 #AI神器 #AI编程 #AI绘图 #AI工作流 #AI教程 #程序员
- 頻道：Futureworks

目前可確認：

- YouTube 公開 metadata 只有標題、頻道與描述文字。
- 影片頁面未提供可讀取字幕。
- 公開轉貼內容只看到影片標題與連結，尚未看到完整 5 個 repo 名單。

因此，以下清單分成兩類：

1. 影片實際名單：目前未確認，不補猜。
2. Ewalk.ai 候選 repo：依 Ewalk.ai 現有需求另外抓官方 GitHub repo metadata 後評估。

## 影片 repo 名單

狀態：未確認。

原因：

- 影片無可讀字幕。
- 描述欄沒有列出 repo。
- 目前公開搜尋只看到影片轉貼，沒有 5 個 repo 的文字清單。

備註：

- 後續若人工觀看影片或取得截圖 / 逐字稿，再補齊「影片實際提到 repo」。

## Ewalk.ai 候選 Repo 評估

資料來源：GitHub 官方 repo metadata，查詢時間 2026-05-31。

| Repo | 用途 | GitHub 狀態 | 對 Ewalk.ai 的價值 | 風險 | 建議 |
| --- | --- | --- | --- | --- | --- |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | LLM 友善網頁爬取與轉 Markdown | 67k+ stars，Apache-2.0，2026-05-25 仍有更新 | 很適合「貼網址 → 讀網站 → SEO / Google 商家 / 官網健檢」工具 | 需要處理網站反爬、隱私與客戶授權 | 可 PoC |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | 讓 AI Agent 操作網站 | 96k+ stars，MIT，2026-05-26 仍有更新 | 可用於官網檢查、Make / 後台流程輔助、Google 商家操作輔助 | 涉及登入、外部操作與權限風險，不能直接自動發布 | 可 PoC，但限內部測試 |
| [langgenius/dify](https://github.com/langgenius/dify) | Agentic workflow / LLM app 平台 | 143k+ stars，2026-05-31 仍有更新 | 可做 Ewalk.ai 客戶用 AI 工具原型，例如 Google 商家健檢、客服知識庫、SEO 工具 | 平台較重，授權需再確認；長期維護成本較高 | 可 PoC |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | 工作流自動化平台 | 190k+ stars，2026-05-31 仍有更新 | 可作 Make 之外的備援 / 自架流程測試，適合內部自動化 | fair-code / 授權限制需確認；不應立刻取代既有 Make | 先觀察，挑一條內部流程 PoC |
| [FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise) | 視覺化 AI Agent 建置 | 53k+ stars，2026-05-30 仍有更新 | 適合快速做 AI workflow demo，給客戶看流程概念 | 與 Dify 定位重疊，需避免工具分裂 | 先觀察 |
| [open-webui/open-webui](https://github.com/open-webui/open-webui) | 自架 AI Chat / RAG UI | 139k+ stars，2026-05-28 仍有更新 | 可做內部知識庫問答或本地模型 UI | 目前 Ewalk.ai 已有 Codex / ChatGPT / Obsidian，短期不一定必要 | 先觀察 |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | 圖像生成節點式工作流 | 115k+ stars，GPL-3.0，2026-05-31 仍有更新 | 可做客戶圖像生成 SOP、品牌素材風格流 | 需要 GPU / 模型管理 / workflow 管理；GPL 授權需注意 | 先觀察，等圖像產線明確再 PoC |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | Web crawling / scraping API | 126k+ stars，AGPL-3.0，2026-05-31 仍有更新 | 可支援大量網頁擷取、官網分析、競品研究 | AGPL-3.0 授權對自架與商用整合需謹慎；API 成本也要評估 | 先觀察 |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | OpenAI 多 Agent 工作流框架 | 26k+ stars，MIT，2026-05-31 仍有更新 | 適合把阿順 / 研究員 / 客戶成功等 AI 員工變成正式 agent 流程 | 需要工程實作，不是無碼工具 | 可 PoC |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | MCP server 集合 | 86k+ stars，2026-05-30 仍有更新 | 可當作連接工具生態的參考清單，用於未來整合 Google Drive、GitHub、資料庫等 | 每個 server 品質與權限不同，不能整包導入 | 先觀察，按需求挑 server |

## 最適合 Ewalk.ai 的前三名

### 1. crawl4ai

最直接對應 Ewalk.ai 近期需求：Google 商家 AI 健檢、官網 SEO 健檢、客戶網站分析、競品頁面摘要。

建議 PoC：

- 輸入：客戶官網網址
- 處理：抓首頁 / 服務頁 / FAQ / 價格頁，轉成乾淨 Markdown
- 輸出：SEO 問題、Google 商家可補內容、服務頁缺口、CTA 建議

### 2. browser-use

適合用在「需要看網站實際畫面或操作流程」的任務，不只讀 HTML。

建議 PoC：

- 檢查客戶網站預約流程是否順
- 檢查 CTA / 表單 / 導航是否能操作
- 未來搭配人工授權後，輔助 Make 或 Google 商家後台操作

限制：

- 只能先做內部測試。
- 涉及登入、發布、付款、刪除、廣告預算時必須回到提姆先生批准。

### 3. Dify

適合把 Ewalk.ai 的 AI 工具包成客戶能理解的介面。

建議 PoC：

- Google 商家健檢工具
- 客戶官網 SEO 健檢工具
- 客戶品牌資料問答工具
- 社群內容企劃助理

## 暫不優先導入

- ComfyUI：有價值，但要先確定圖像生成產線、GPU / 雲端成本與授權流程。
- Open WebUI：適合內部 AI 入口，但目前不是最急迫。
- Firecrawl：能力強，但 AGPL-3.0 與 API 成本需要先釐清。
- Flowise：可以做 demo，但與 Dify 重疊，先不要同時養兩套。

## 下一步 PoC 建議

第一個 PoC 建議做：

```text
貼上客戶官網網址
↓
crawl4ai 抓取網站內容
↓
OpenAI / Dify / Agents SDK 分析
↓
輸出：
1. SEO 優化建議
2. Google 商家「服務 / 產品 / 貼文」補強建議
3. 官網 CTA 與轉換路徑問題
4. 內容更新待辦
```

PoC 命名：

```text
Ewalk.ai 官網與 Google 商家 AI 健檢工具
```

## 建議狀態

- 可 PoC：crawl4ai、browser-use、Dify、OpenAI Agents SDK
- 先觀察：n8n、Flowise、Open WebUI、ComfyUI、Firecrawl、MCP servers
- 暫不吸收：無，但所有 repo 都不得直接進正式流程，必須先做小範圍 PoC。

## 已納入每日追蹤

已寫入 [[優先AI工具追蹤清單|優先 AI 工具追蹤清單]] 的 5 個 repo：

- [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai)
- [browser-use/browser-use](https://github.com/browser-use/browser-use)
- [langgenius/dify](https://github.com/langgenius/dify)
- [openai/openai-agents-python](https://github.com/openai/openai-agents-python)
- [n8n-io/n8n](https://github.com/n8n-io/n8n)

## 導入進度

前三名已進入 [[../../08_自動化/AI工具實驗室/README|Ewalk.ai AI 工具實驗室]]：

- crawl4ai → `website-audit.mjs`
- browser-use → `browser-flow-audit.mjs`
- Dify → `workflow-builder.mjs`

其餘候選已放入 [[Repo候選資料庫/AI開源Repo候選資料庫|AI 開源 Repo 候選資料庫]]，有任務需求時再拉出評估。

## 待提姆先生確認

- 是否批准第一個 PoC：Ewalk.ai 官網與 Google 商家 AI 健檢工具。
- PoC 技術路線要選：
  - crawl4ai + OpenAI Agents SDK
  - crawl4ai + Dify
  - browser-use + crawl4ai + 阿順人工審核
- 是否允許研究員下一步拉 README / docs 深入比較安裝成本。
