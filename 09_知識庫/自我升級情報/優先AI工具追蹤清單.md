# 優先 AI 工具追蹤清單

建立日期：2026-05-05
狀態：啟用中

## 目的

這份清單定義阿順每天做自我升級情報蒐集時，優先追蹤哪些 Ewalk.ai 目前正在使用或準備重點使用的 AI 工具。

原則：先優化正在用的工具，再追新工具。只有能改善 Ewalk.ai 產能、品質、成本或交付穩定性的內容，才值得進入自我升級情報。

## 高度討論 Repo 規則

除了優先工具外，若 GitHub 上出現高度討論、快速成長或被大量引用的 AI repo，也要優先關注並判斷是否值得學習。

判斷指標：

- 近期 stars 或 forks 快速增加
- issues / discussions 活躍，且討論內容有實作細節
- 最近有 release、重大功能更新或明確 roadmap
- 被多個開源專案、技術文章或社群討論引用
- 主題和 Agent、自我優化、省 token、內容生成、圖像生成、影片生成、RAG、memory、workflow automation 有關
- 能明確改善 Ewalk.ai 的工作流、交付品質、成本或 AI 員工管理方式

高度討論 repo 不代表自動吸收。阿順只先整理重點與白話價值，提姆允許後才進入 `/自我升級`。

## 優先工具

| 優先級 | 工具 | 主要關注方向 |
| --- | --- | --- |
| 1 | Codex | Skill、Agent 工作流、檔案系統操作、自動化、專案入職手冊、任務分派 |
| 2 | OpenClaw | 個人 AI Agent、Gateway / runtime、Skills / Plugins、生態安全、跨通訊軟體入口、AI 員工常駐工作流 |
| 3 | Claude Code | 長任務開發、CLI 工作流、程式碼修改、跨工具協作、Agent 操作習慣 |
| 4 | Gemini | 多模態理解、長上下文、Google 生態整合、文件 / 圖片 / 影片理解 |
| 5 | ChatGPT | 策略、文案、分析、圖文內容、工作流設計、Ewalk.ai 日常決策協助 |
| 6 | Images 2.0 | 圖像生成、社群圖文、廣告素材、品牌視覺、Prompt 寫法 |
| 7 | 即夢 2.0 / 國際版 | 影片生成、短影音、分鏡、動態素材、廣告影片產製 |
| 8 | Nano Banana | 圖像處理、視覺生成、素材變體、設計流程優化 |

## 優先追蹤 Repo

來源：[[2026-05-31_GitHub AI Repo候選研究報告|2026-05-31 GitHub AI Repo 候選研究報告]]

備註：YouTube Shorts 原始提到的 5 個 repo 尚未取得可驗證名單；以下先放入 Ewalk.ai 目前最值得每日追蹤的 5 個候選 repo。前三名已進入 [[../../08_自動化/AI工具實驗室/README|Ewalk.ai AI 工具實驗室]] MVP 導入，其餘候選放入 [[Repo候選資料庫/AI開源Repo候選資料庫|AI 開源 Repo 候選資料庫]] 持續追蹤。

| 優先級 | Repo | 追蹤方向 | 對 Ewalk.ai 的可能用途 | 狀態 |
| --- | --- | --- | --- | --- |
| 1 | [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | LLM 友善網頁爬取、HTML 轉 Markdown、網站資料抽取 | 官網 SEO 健檢、Google 商家 AI 健檢、競品頁面摘要 | MVP 導入中 |
| 2 | [browser-use/browser-use](https://github.com/browser-use/browser-use) | AI Agent 操作網站、表單流程、瀏覽器自動化 | 官網流程檢查、預約流程測試、Make / 後台輔助操作 | MVP 導入中 |
| 3 | [langgenius/dify](https://github.com/langgenius/dify) | AI workflow、RAG、Agent app、客戶可用介面 | 把 Google 商家健檢、SEO 健檢、品牌知識庫包成工具 | MVP 導入中 |
| 4 | [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | 多 Agent 工作流、handoff、工具調用、guardrails | 把阿順、研究員、客戶成功等 AI 員工變成正式流程 | 候選資料庫追蹤 |
| 5 | [n8n-io/n8n](https://github.com/n8n-io/n8n) | 工作流自動化、整合 API、self-hosted automation | 作為 Make 之外的備援與內部自動化測試平台 | 候選資料庫追蹤 |
| 6 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | 個人 AI Agent、Gateway、Skills / Plugins、跨通訊入口、常駐 Agent workflow | 評估 Ewalk.ai Command Center、Discord 阿順、AI 員工常駐工作流與 skill 生態治理 | 重點追蹤 |
| 7 | [steipete/agent-scripts](https://github.com/steipete/agent-scripts) | skill-cleaner、agent scripts、Codex / OpenClaw skill prompt budget 治理 | 定期掃描 Ewalk.ai skills 是否描述過長、重複、未使用，降低 token 浪費 | 重點追蹤 |

## 每日搜尋重點

- 有沒有更省 token / 更省成本的用法
- 有沒有更穩定的 Prompt、Skill、工作流
- 有沒有新的模型能力或限制需要知道
- 有沒有適合 Ewalk.ai 的案例、模板、指令或 SOP
- 有沒有能改善客戶交付品質的方法
- 有沒有值得加入 AI 員工入職手冊的規則
- 有沒有高度討論 repo 值得觀察或學習
- OpenClaw 是否有重大 release、skill 安全更新、Gateway / runtime 改動、ClawHub / SkillSpector / auto mode 等治理變化
- skill-cleaner / agent-scripts 是否有新的 skill budget、重複技能、未使用技能掃描規則
- 上述優先追蹤 Repo 是否有 release、重大 issue、roadmap、授權變動或適合 Ewalk.ai 的新案例

## 不優先收錄

- 純粹宣傳文
- 沒有實作細節的心得
- 和 Ewalk.ai 目前工具無關的新奇工具
- 熱度很高但沒有明確工作流價值的 repo
- 只適合工程團隊、但無法改善 Ewalk.ai 目前工作流的內容
- 需要高成本或高風險權限，且短期看不到明確回報的做法

## 每日情報標籤

每日情報可使用以下標籤：

- `#Codex`
- `#ClaudeCode`
- `#OpenClaw`
- `#Gemini`
- `#ChatGPT`
- `#Images2`
- `#即夢`
- `#NanoBanana`
- `#省Token`
- `#自我升級`
- `#工作流`
- `#素材生成`
- `#影片生成`
- `#高度討論Repo`
- `#開源工具`
- `#SkillCleaner`
