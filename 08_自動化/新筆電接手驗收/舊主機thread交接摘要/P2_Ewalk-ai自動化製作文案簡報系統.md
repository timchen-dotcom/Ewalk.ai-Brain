# 交接摘要｜Ewalk.ai 自動化製作文案簡報系統

## 回填狀態

- 狀態：已先以新筆電 Vault 基礎脈絡回填；待 Mac Studio 原 thread 補強完整歷史
- 來源 thread：【Ewalk.ai】自動化製作教案簡報系統 / 簡報AI自動化系統
- 優先級：P2
- 回填日期：2026-06-05
- 回填依據：`NotebookLM到Codex簡報美感重製SOP`、`GPT Image 2 簡報視覺生成流程`、`GPT Image 2 整頁烘字簡報生成流程`、`簡報生成工具`、`簡報美感重製Prompt`

## 目前狀態

- 這個 thread 對應的能力已分散沉澱在 SOP、Prompt、工具腳本與 STAR Color 實作案例中。
- 核心穩定流程是「NotebookLM / 參考稿建立美感基準，Codex 做內容結構、品牌化與可編輯 PPTX 重製」。
- 進階視覺流程分兩條：
  - 穩定版：GPT Image 2 生無字背景，程式疊正確中文、數字、圖表，再打包 PPTX。
  - 實驗版：GPT Image 2 直接整頁烘字，適合氣氛稿、開場視覺、招商視覺版，但需人工查錯。
- STAR Color 0520 創業大會簡報已有實作經驗，可作為案例與測試基準。

## 已完成事項

- 已建立 `13_SOP流程/NotebookLM到Codex簡報美感重製SOP.md`。
- 已建立 `11_Prompt資料庫/簡報美感重製Prompt.md`。
- 已建立 `11_Prompt資料庫/GPT Image 2 整頁烘字簡報Prompt.md`。
- 已建立 `08_自動化/GPT Image 2 簡報視覺生成流程.md`。
- 已建立 `08_自動化/GPT Image 2 整頁烘字簡報生成流程.md`。
- 已建立 `08_自動化/簡報生成工具/create_star_color_0506_course_deck.mjs`。
- 已建立 `08_自動化/簡報生成工具/create_star_color_0520_deck.mjs`。
- STAR Color 專案中已有品牌包、Prompt guardrails、GPT Image 2 prompt、圖片生成、驗證與 PPTX 打包流程。

## 待補資料

- 舊 thread 是否有尚未沉澱的 `/製作簡報` 指令格式、路由規則或工具包設計。
- 是否要把 STAR Color 實作抽象成通用 `soil-image-deck` 或 Ewalk.ai 簡報生成 skill。
- NotebookLM 來源包格式、簡報輸入模板、交付命名規則尚可再標準化。
- OpenAI Images API key、organization verification、成本與資料外送批准流程需明確。
- 產出素材、PPTX、PDF、Keynote、PNG 是否進 Git 或另走素材庫，仍需資料治理規則。

## 風險與需提姆先生批准事項

- 客戶正式簡報、報價、日期、法規、廣告數據與合約資訊不得只靠 AI 烘字，需以可控文字或程式疊字確保正確。
- 使用 GPT Image 2 會把簡報內容、品牌、文字需求送到 OpenAI Images API；涉及客戶資料時需提姆先生明確同意。
- API key、secret、billing 與 organization verification 不得寫入 Vault。
- 整頁烘字可能出現中文錯字、數字錯誤、假 logo、字太小或圖表不準，必須逐頁人工檢查。
- 正式對外交付前需有人眼驗收，不只檢查檔案是否產出。
- Mac Studio 原 thread 尚未輸出完整歷史，若有工具路由或產品化決策需補回。

## 下一步可執行清單

1. 在 Mac Studio 原機打開「自動化製作教案簡報系統 / 簡報AI自動化系統」thread，輸出完整交接摘要，補到本檔「原 thread 補強」區段。
2. 將 `/製作簡報` 的輸入格式整理成一份標準 Prompt：目標受眾、簡報目的、資料來源、品牌基準、輸出格式、驗收標準。
3. 將 NotebookLM 到 Codex 的流程補成可複製模板：來源包、視覺基準、PPTX 重製、PDF 預覽、QA。
4. 將 GPT Image 2 穩定版與整頁烘字版整理成選擇規則：正式交付優先穩定版，氣氛稿可走整頁烘字。
5. 盤點 STAR Color 實作中哪些腳本可抽成通用簡報生成工具。
6. 建立素材歸檔策略：PPTX / PDF / PNG / Keynote / prompt / manifest 分別放哪裡，不混進敏感 Git commit。

## 相關檔案與連結

- `10_市場洞察`
- `11_Prompt資料庫`
- `11_Prompt資料庫/簡報美感重製Prompt.md`
- `11_Prompt資料庫/GPT Image 2 整頁烘字簡報Prompt.md`
- `13_SOP流程/NotebookLM到Codex簡報美感重製SOP.md`
- `08_自動化/GPT Image 2 簡報視覺生成流程.md`
- `08_自動化/GPT Image 2 整頁烘字簡報生成流程.md`
- `08_自動化/簡報生成工具`
- `01_客戶/STAR Color/01_品牌資料/簡報生成品牌包`
- `01_客戶/STAR Color/03_提案與交付/0520創業大會簡報`

## 原 thread 補強

待 Mac Studio 原機輸出後補入：

- 原 thread 未完成事項
- `/製作簡報` 指令格式與路由規則
- 工具產品化決策
- 未寫入 Vault 的 prompt、腳本、測試結果或成本評估

## 建議歸檔位置

`08_自動化`、`10_市場洞察`、`11_Prompt資料庫`
