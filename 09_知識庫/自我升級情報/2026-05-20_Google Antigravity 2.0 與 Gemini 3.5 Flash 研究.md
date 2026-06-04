# Google Antigravity 2.0 與 Gemini 3.5 Flash 研究

日期：2026-05-20  
負責角色：GitHub 研究員  
主管：阿順  
最終決策者：提姆先生  
狀態：研究完成，待提姆先生決策是否進入 POC

## 研究來源

提姆先生提供文章：

- BlockTempo：<https://www.blocktempo.com/google-antigravity-2-standalone-desktop-agent-drops-ide-gemini-flash/>

主要核對來源：

- Google Antigravity overview：<https://antigravity.google/docs/overview?app=antigravity>
- Google Antigravity features：<https://antigravity.google/docs/features?app=antigravity>
- Google I/O 2026 developer highlights：<https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/>
- Gemini 3.5 Flash model card：<https://deepmind.google/models/model-cards/gemini-3-5-flash/>
- TechCrunch：<https://techcrunch.com/2026/05/19/with-gemini-3-5-flash-google-bets-its-next-ai-wave-on-agents-not-chatbots/>
- Gemini CLI：<https://github.com/google-gemini/gemini-cli>
- Gemini CLI GitHub Action：<https://github.com/google-github-actions/run-gemini-cli>

## 結論

Google Antigravity 2.0 不是單純新聞傳言。Google 官方文件與 Google I/O 2026 開發者文章都已提到 Antigravity 2.0、Gemini 3.5 Flash、Gemini API / AI Studio / Android / Cloud 的 agent 工作流整合。

對 Ewalk.ai 來說，短期不建議直接導入正式客戶流程，但值得做 7 天小型 POC。適合先測：

- GitHub issue / PR 摘要與分流
- AI 工具與開源情報整理
- 客戶網站 / landing page 原型
- 社群素材分類與草稿整理
- 簡報前期研究與資料架構

## 對 Ewalk.ai 的可用價值

### 1. GitHub 自動化

`google-github-actions/run-gemini-cli` 可以把 Gemini CLI 放進 GitHub Actions，用於 issue triage、PR review、留言觸發任務與排程工作。

可用在 Ewalk.ai：

- 每天整理高討論 repo 的新 issue / PR
- 自動抓「自我升級」相關討論
- 對我們自己的 repo 做初步 review
- 把研究摘要回寫到 Obsidian 待審文件

### 2. 研究與內容整理

Antigravity 2.0 的方向是桌面 agent 指揮中心，搭配瀏覽器、檔案、指令、MCP、subagents 與 artifacts。這和 Ewalk.ai 的公司化 AI 員工架構方向接近。

可用在 Ewalk.ai：

- 讓研究員、社群主編、設計企劃分工跑資料
- 把結果收斂成阿順可判斷的摘要
- 加速簡報、提案、週報的前期整理

### 3. 網站與原型

Gemini 3.5 Flash 官方定位偏 agentic workflows 與 coding tasks。若穩定，可能適合做活動頁、客戶 demo site、簡單 UI 原型。

可用在 Ewalk.ai：

- 客戶簡報前快速做互動 demo
- 讓網站製作員做低風險初稿
- 再由 Codex 接手整理程式碼、測試與部署

## 風險

### 1. 權限風險

桌面 agent 能碰檔案、瀏覽器、指令與 MCP。若開太大權限，有誤刪、誤改、誤讀敏感資料風險。

Ewalk.ai 導入規則：

- 只允許測試資料夾
- 不開全機權限
- 不允許自動執行破壞性指令
- 客戶資料、金流、API key、Token 一律隔離

### 2. 成本風險

Gemini 3.5 Flash 雖然主打速度與 agent 工作流，但真正成本要用 Ewalk.ai 任務實測。不能只看模型名稱判斷便宜。

測試時要記錄：

- 任務耗時
- API / token / 訂閱成本
- 人工修正時間
- 成果可交付程度

### 3. 生態風險

GitHub 上有很多冒充 Gemini / keygen / patch loader 的可疑 repo。只採用官方來源：

- `google-gemini`
- `google-github-actions`
- `antigravity.google`
- `ai.google.dev`
- `cloud.google.com`

## 建議 POC

### 7 天測試範圍

1. Gemini CLI GitHub Action：測 issue triage、PR review、每日 repo 摘要。
2. Antigravity 桌面：測網站 demo 修改、素材分類、文章研究整理。
3. 成本紀錄：每個任務記錄時間、費用、人工修正量。
4. 權限限制：只開測試資料夾，不給全機權限。
5. 決策門檻：若能節省 30% 以上整理 / 初稿 / 檢查時間，再沉澱 SOP。

## 阿順建議

先不要把 Antigravity 放進正式客戶交付。  
目前比較穩的做法是：

1. Codex 繼續當 Ewalk.ai 主工作台與落地執行者。
2. Gemini CLI / Antigravity 作為研究與輔助代理測試。
3. 所有自動化結果先進 Obsidian 待審，不直接改正式系統。
4. 若 POC 成本與品質都通過，再把 GitHub 研究員與自我升級流程接上 Gemini CLI Action。
