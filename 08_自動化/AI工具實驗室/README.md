# Ewalk.ai AI 工具實驗室

建立日期：2026-05-31
狀態：MVP 可執行

## 用途

這裡放 Ewalk.ai 內部可試跑的 AI 工具原型。

第一階段導入三個 GitHub repo 的核心能力，不直接把大型 repo 全量裝進 Vault，而是先做可控、可回退、可驗證的本地工具：

| 導入來源 | 本地工具 | 用途 |
| --- | --- | --- |
| [crawl4ai](https://github.com/unclecode/crawl4ai) | `website-audit.mjs` | 官網 / SEO / Google 商家健檢 |
| [browser-use](https://github.com/browser-use/browser-use) | `browser-flow-audit.mjs` | 網站瀏覽流程、CTA、預約路徑健檢 |
| [Dify](https://github.com/langgenius/dify) | `workflow-builder.mjs` | 把需求轉成 Dify 風格 AI workflow 規格 |

## 權限原則

- 第一版只分析與產生報告，不自動修改客戶網站、Google 商家、Make、Dify 或任何正式後台。
- 涉及登入、發布、付款、刪除、廣告預算、客戶資料寫入，必須回到提姆先生批准。
- 使用 OpenAI API 時會讀取本機 `OPENAI_API_KEY`，不會輸出 key 內容。
- 預設模型可用 `EWALK_AI_TOOL_MODEL` 或 `OPENAI_MODEL` 調整；未設定時使用 `gpt-5.2`。

## 工具 1：官網與 Google 商家 AI 健檢

```bash
cd "Ewalk.ai Brain/08_自動化/AI工具實驗室"
node tools/website-audit.mjs \
  --url "https://www.thevision.tw/" \
  --client "TheVision" \
  --industry "美業沙龍" \
  --services "染髮、燙髮、護髮、頭皮護理"
```

輸出：

- SEO 優化建議
- Google 商家產品 / 服務 / 貼文建議
- 官網 CTA 與預約流程問題
- 圖像需求
- 風險提醒
- 下一步待辦

## 工具 2：瀏覽流程 AI 健檢

```bash
cd "Ewalk.ai Brain/08_自動化/AI工具實驗室"
node tools/browser-flow-audit.mjs \
  --url "https://www.thevision.tw/" \
  --client "TheVision" \
  --goal "顧客完成線上預約"
```

輸出：

- 目前可見轉換路徑
- CTA 與表單問題
- 顧客可能卡住的位置
- 需要真實瀏覽器測試的事項
- 下一步修正建議

## 工具 3：Dify 風格 AI Workflow 產生器

```bash
cd "Ewalk.ai Brain/08_自動化/AI工具實驗室"
node tools/workflow-builder.mjs \
  --name "Google 商家 AI 健檢工具" \
  --brief "使用者貼上 Google 商家網址、官網網址、產業與主要服務，工具輸出服務建議、產品卡建議、貼文主題、圖片需求與風險提醒。"
```

輸出：

- 工具定位
- 輸入欄位
- 節點流程
- 每個節點的 Prompt / 規則
- 輸出格式
- 權限風險
- 測試案例
- 未來串接 API

## Smoke Test

不呼叫 OpenAI、只測本地流程：

```bash
npm run smoke
```

若目前環境沒有 `npm`，可直接執行：

```bash
node tools/website-audit.mjs --demo --no-ai
node tools/browser-flow-audit.mjs --demo --no-ai
node tools/workflow-builder.mjs --demo --no-ai
```

若出現 `OpenAI API 連線失敗`，代表本機網路或沙盒限制擋住 API 連線；工具仍可用 `--no-ai` 先測抓取與格式，之後在一般終端機或部署環境執行 AI 產出。

## 輸出位置

所有報告預設輸出到：

```text
Ewalk.ai Brain/08_自動化/AI工具實驗室/output
```

## 後續升級路線

### crawl4ai

- 若 MVP 證明有用，再正式安裝 crawl4ai。
- 目標是改善動態網站擷取、Markdown 轉換與多頁爬取穩定性。

### browser-use

- 若需要真實點擊、登入後台、表單測試，再導入 browser-use 或 Playwright。
- 第一版必須只跑內部測試，不碰正式發布與金流。

### Dify

- 目前先產生 Dify 風格規格。
- 後續若要部署，需確認 Dify Cloud 或自架環境、API key、資料保存規則與客戶權限。

## 相關文件

- [[../../09_知識庫/自我升級情報/2026-05-31_GitHub AI Repo候選研究報告|GitHub AI Repo 候選研究報告]]
- [[../../09_知識庫/自我升級情報/Repo候選資料庫/AI開源Repo候選資料庫|AI 開源 Repo 候選資料庫]]
