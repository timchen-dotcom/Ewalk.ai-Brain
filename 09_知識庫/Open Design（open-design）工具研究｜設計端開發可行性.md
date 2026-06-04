# Open Design（open-design）工具研究｜設計端開發可行性

> 你說的「open Disgen」我這邊比對後，最符合的是 `nexu-io/open-design`（Open Design：開源、local-first 的 Claude Design 替代品）。  
> 若你指的是其他 repo（名稱真的叫 Disgen），再丟連結我可以改成針對該 repo 評估。

## 來源

- GitHub repo：https://github.com/nexu-io/open-design
- Quickstart：https://github.com/nexu-io/open-design/blob/main/QUICKSTART.md

## 一句話結論（給提姆）

**可用、而且很適合拿來做「設計端的開發」：把設計產物變成可版本控的 artifact（HTML/PDF/PPTX/ZIP），再用 MCP 讓 Codex/Claude Code 直接讀到 artifacts 源碼做二次開發。**  
但它是「一個本機跑的設計工廠」，需要 Node 24 + pnpm、也需要我們把「素材歸檔/版本命名/交付邊界」定清楚，才不會變成另一個亂源。

## 它到底是什麼（定位）

- Open Design 是一個 local-first 的設計產物生成環境：用你已安裝的 coding-agent CLI（Codex / Claude Code / Cursor / Gemini CLI…）當設計引擎，生成 **可預覽、可導出** 的 artifact。
- 它不是只產生圖片，而是偏「可交付的設計成品」：網站/APP prototype、簡報 deck、PDF、ZIP 等。
- repo 熱度（觀察指標）：Star/Fork 明顯高、Issues/PR 活躍（代表正在快速迭代期）。

## 對 Ewalk.ai「設計端開發」的直接價值

### 1) 網頁（Landing / 活動頁 / 小工具）

- 產出：可直接預覽的 HTML artifact（可再由工程端拆成 Next.js/React 元件或直接當靜態頁交付）。
- 實務用法（最有用的方式）：
  1) 用 Open Design 先產「方向版」（視覺/版面/資訊架構）
  2) 再由阿順（Codex）讀 artifact 源碼，把它「工程化」：拆元件、接資料、加表單/追蹤碼、做 RWD 細修

### 2) 簡報（提案 deck / 月報 / Workshop）

- Open Design 有明確的 deck skill 生態（repo 說明中有 deck 相關 skill reuse），輸出可走 HTML/PDF/PPTX。
- 對我們最重要的是：**簡報不再只是「一次性生成」**，而是「可重跑、可迭代、可版本控」。

### 3) APP（UI 方向、流程稿、Prototype）

- 它比較像「產品/互動原型產生器」，適合快速做：
  - onboarding flow、功能導覽、空狀態、核心頁面 layout
- 對工程落地的關鍵：用 MCP 讓阿順直接讀到設計系統與頁面結構，減少「截圖→再描述」的損耗。

## MCP 與阿順的加成（為什麼它對我們更值錢）

Open Design repo 說明它提供 **read-only 的 stdio MCP server**，讓其他 MCP client（Codex/Claude Code/Cursor…）能直接 search/read Open Design 專案內的檔案與 artifacts。  
白話：**設計端產物 = 另一個可被 agent 讀取的專案資料夾**，阿順可以直接把設計稿變成可用的程式碼/簡報工程，而不是靠口述重建。

## 風險與限制（要先講清楚）

- 成本/環境：
  - 要 Node 24 + pnpm；本機環境要能跑起 daemon/web（不建議放在 Vault 內）。
- 迭代期風險：
  - Issues/PR 很活躍，代表功能變動快；要靠「我們自己的 SOP」把產物交付面固定住。
- 資安/資料：
  - BYOK/本機代理也要遵守 Ewalk.ai 資料規範；客戶機密不要丟到未授權模型或外部 endpoint。
- 導入邊界：
  - 它能把第一版方向做得很快，但「品牌級主視覺」仍需要設計師收尾（這點 SOP 要寫死）。

## 建議導入方式（最小試點）

沿用既有 SOP：[[13_SOP流程/Open Design 產物工作流試點SOP|Open Design 產物工作流試點 SOP]]

試點只做兩個產物（2～3 天內可驗收）：
1) 1 份客戶提案 deck（可導出 PPTX 或 PDF）
2) 1 組廣告視覺版型（3 種尺寸 + 可改文案結構）

驗收只看三件事：
- 產出速度：第一版在 60～120 分鐘內可拿來討論方向
- 可迭代：同一套流程 30 分鐘內能再改 1 版
- 可交付：產物有「可落檔」格式（HTML/PDF/PPTX）且命名/版本清楚

## 我對「是否值得用在設計端開發」的判斷

- 高價值（建議做試點）：
  - **網頁＋簡報**：最適合；可大幅降低「版型重做」與「工程重建」成本
  - MCP 串起來後，阿順能把「設計產物→可交付工程」變成一條穩定管線
- 中價值（視客戶型態）：
  - APP：適合做 UI/flow 原型與規格稿，真正上線仍要工程端重構

## 下一步（需要提姆一句話允許）

- 允許我在「工作資料夾（非 Vault）」clone `open-design`，跑一次最小試點（deck + 廣告版型）並把輸出落到 Vault 的既定素材路徑，回報產出成本與品質。

