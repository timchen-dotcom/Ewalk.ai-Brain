# 官網 SEO 自動化架構

## 用途

這份文件定義 Ewalk.ai 幫客戶架設官網後，如何用自動化流程持續執行 SEO 技術檢查、內容建議、GitHub PR 修正、Vercel Preview 驗證與週報追蹤。

核心目標不是承諾「自動排名」，而是把可重複、可檢查、可修正的 SEO 基礎工作系統化，降低人工漏檢，讓每次官網交付後都有固定的維護節奏。

重要原則：

- SEO 可以高度自動化，特別是技術檢查、缺漏偵測、內容欄位建議、PR 草稿、Preview 驗證與週報彙整。
- SEO 不能保證自動排名，因為排名仍受搜尋需求、競爭強度、品牌信任、內容品質、外部連結、使用者行為與 Google 演算法影響。
- 自動化結果只能作為修正建議與交付證據，涉及品牌定位、醫療法律財務等高風險內容、對外發布與重大結構調整時，仍需人工審核。

## 適用網站

適用：

- Ewalk.ai 代客建置的形象官網、服務型官網、Landing Page、活動頁。
- 使用 GitHub 管理原始碼，並透過 Vercel 部署的網站。
- Next.js、Astro、Nuxt、Vite、靜態 HTML 等可在本地或 Preview 環境被 crawler 存取的網站。
- 內容量中小型網站，例如 5 至 200 個主要 URL。
- 有明確 sitemap、robots.txt、meta、Open Graph、結構化資料與內容頁模板的網站。

不建議直接套用：

- 尚未確認品牌定位、服務分類、目標受眾與主要關鍵字的網站。
- 頁面大量依賴登入、會員權限、動態搜尋結果或第三方 iframe 的網站。
- 電商大型站、新聞站、多語系大型資料庫網站；這類需要另開專案設計 crawl budget、索引策略與內容治理規則。
- 客戶不允許 AI 或自動化工具讀取 Preview 網站內容的案件。

## 可自動化項目

### 技術 SEO 檢查

- sitemap.xml 是否存在、可讀、URL 狀態碼正常。
- robots.txt 是否存在，是否誤擋主要頁面。
- canonical 是否一致，是否出現錯誤自我引用或跨頁混亂。
- title、meta description、H1 是否缺漏、重複或過長過短。
- Open Graph、Twitter Card、favicon、manifest 是否完整。
- 內部連結是否斷裂，是否出現 404、500、redirect chain。
- 圖片是否缺 alt、尺寸過大、格式不佳。
- 頁面是否可被無登入 crawler 讀取。
- Lighthouse SEO、Performance、Accessibility 基礎分數追蹤。
- Security headers、HTTPS、混合內容、基本安全設定檢查。

### 內容 SEO 建議

- 依頁面目的建議 title 與 description。
- 依服務頁、案例頁、文章頁產出 H1/H2 架構建議。
- 偵測內容太薄、段落資訊不足、缺 CTA、缺常見問題。
- 建議內部連結，例如服務頁連到案例、案例連到聯絡頁。
- 產出 FAQ schema、Organization schema、LocalBusiness schema、Article schema 草稿。
- 依 Google SEO Starter Guide 原則，優先協助搜尋引擎理解內容，而不是堆砌關鍵字。

### GitHub PR 修正

- 自動建立分支，例如 `seo/fix-2026-05-week3`。
- 將低風險修正寫成 commit，例如 meta 補齊、alt 補齊、schema 草稿、sitemap 設定修正。
- 自動開 Pull Request，附上檢查摘要、修正清單、風險等級與 Preview 驗證項目。
- GitHub Actions 跑 lint、build、SEO audit、Lighthouse 或自訂 crawler。
- PR 通過後由 Ewalk.ai 內部負責人或提姆先生指定審核者合併。

### Vercel Preview 驗證

- PR 建立後等待 Vercel Preview URL。
- 對 Preview URL 執行二次 crawl。
- 比對修正前後：
  - build 是否成功。
  - 主要頁面是否可開啟。
  - sitemap 與 robots 是否正常。
  - meta、canonical、schema 是否正確輸出。
  - Lighthouse SEO 分數是否退步。
  - 主要 CTA 與導覽是否仍可操作。
- 將驗證結果回填到 PR comment 或週報紀錄。

### 週報追蹤

- 每週固定產出 SEO 維護摘要。
- 統計本週新增問題、已修正問題、未修正問題、需人工決策問題。
- 追蹤 Lighthouse SEO 分數、錯誤 URL 數、缺 meta 頁數、斷鏈數、schema 覆蓋率。
- 彙整 Search Console 資料時，只做趨勢追蹤，不把短期排名波動視為單一因果。
- 將週報放入客戶資料夾或報表資料夾，例如 `Ewalk.ai Brain/04_報表/客戶名稱/SEO週報`。

## 不可全自動項目

- 保證排名、保證流量、保證收錄。
- 決定客戶品牌定位、主打服務、商業優先順序。
- 高風險內容的事實審核，例如醫療、法律、財務、投資、政府法規。
- 產業關鍵字策略與競品策略的最終取捨。
- 需要客戶授權的 Search Console、GA4、CMS、DNS、Vercel、GitHub 權限操作。
- 對外發布內容、刪除頁面、大量改 URL、修改 robots 封鎖規則、調整 canonical 策略。
- 判斷內容是否真正符合客戶專業、語氣與商業利益。

人工審核門檻：

- 只補齊缺漏欄位、修正明顯錯字、補圖片 alt，可由 Ewalk.ai SEO 自動化流程產出 PR，交由內部審核。
- 牽涉頁面標題主張、價格、療效、保證、競品比較、法規聲明，必須交由客戶或提姆先生批准。
- 牽涉刪除頁面、改 URL、改 sitemap 大量索引策略，必須先建立變更單。

## 建議工具

### 技術檢查工具

- Unlighthouse：適合對整站跑 Lighthouse，檢查多頁 SEO、Performance、Accessibility 與報表視覺化。
- LibreCrawl：適合做開源 SEO crawler，檢查 meta、schema、hreflang、社群標籤、PageSpeed 與大量 URL 匯出。
- seofor.dev：適合開發階段對 localhost 或 Preview 站執行 CLI SEO audit，並產出 AI-ready 修正提示。
- seo-audits-toolkit：適合做開源網站稽核工具箱，整合 Lighthouse、Security Headers、sitemap、圖片與關鍵字摘要。
- Lighthouse CI：適合放進 GitHub Actions，設定最低分數門檻與退步警示。
- Playwright：適合檢查 Preview 頁面實際渲染、導覽、CTA、表單與重要 DOM。

### 資料與追蹤工具

- Google Search Console：追蹤索引、曝光、點擊、查詢、頁面問題。
- GA4：追蹤自然流量、轉換事件與頁面互動。
- Vercel Analytics 或 Speed Insights：追蹤部署後的速度與使用者體驗指標。
- GitHub Issues / Projects：追蹤待修 SEO 任務與 PR 狀態。
- Obsidian：沉澱客戶 SEO 週報、決策紀錄、SOP 與可重複 Prompt。

### 流程參考

- effectly.ai 的 Git + CI PR 流程：參考其「SEO 修正應寫回 CMS 或 Git，經 PR、CI、rollback 管控」的做法，不只產出待辦清單。
- Google SEO Starter Guide：作為基礎原則來源，重點是幫助搜尋引擎理解內容、幫助使用者判斷是否造訪，而不是使用秘密技巧承諾排名。

## GitHub PR 流程

### 1. 建立排程

建議排程：

- 每日凌晨：跑輕量檢查，偵測 build、sitemap、robots、主要 URL 狀態。
- 每週一上午：跑完整 SEO audit，產出問題清單。
- 每週一下午：AI 整理可修正項目，建立 PR 或交接單。
- 每週五：彙整本週修正狀態與週報。

### 2. 執行 Audit

輸入：

- Production URL。
- Vercel Preview URL。
- sitemap.xml。
- 客戶主關鍵字與服務分類。
- 需排除的 URL，例如後台、測試頁、活動過期頁。

輸出：

- `seo-audit.json`：工具原始結果。
- `seo-summary.md`：人可讀摘要。
- `seo-fix-plan.md`：可修正項目、風險等級、建議負責人。

### 3. 分級處理

P0 立即處理：

- production build 失敗。
- robots.txt 誤擋全站或主要頁。
- sitemap 無法讀取。
- 主要頁面 404 / 500。
- canonical 指向錯誤網域。

P1 本週處理：

- 主要頁缺 title、description、H1。
- 重要圖片缺 alt。
- schema 錯誤。
- 大量斷鏈。
- Open Graph 缺漏導致社群分享異常。

P2 排入優化：

- meta 文案可讀性優化。
- 內部連結補強。
- FAQ 與內容段落補強。
- 圖片壓縮、lazy loading、結構化資料擴充。

P3 策略討論：

- 新增內容主題。
- 關鍵字地圖重整。
- 多語系策略。
- URL 架構調整。
- 大量內容改寫。

### 4. 建立修正分支

分支命名：

```txt
seo/client-name/YYYY-MM-DD-fix
```

Commit 命名：

```txt
fix(seo): 補齊主要服務頁 metadata
fix(seo): 修正 sitemap 與 canonical 設定
chore(seo): 新增 weekly audit report
```

### 5. 自動修正範圍

可由 AI 直接提交 PR 的低風險修正：

- 補缺少的 title、description、Open Graph。
- 補圖片 alt，但不得捏造不存在的產品或服務資訊。
- 修正明顯錯誤的 internal link。
- 補基本 Organization、WebSite、Breadcrumb schema。
- 修正 sitemap 或 robots 的明顯格式錯誤。
- 補 canonical 自我引用。

必須標記人工審核的修正：

- 改 H1 主張。
- 改服務頁銷售文案。
- 新增 FAQ 牽涉專業承諾。
- 改 URL slug。
- 改 noindex / index 規則。
- 改價格、優惠、保證、案例成果。

### 6. PR 描述格式

每個 SEO PR 必須包含：

```md
## 修正目的

## Audit 來源

## 本次修正

## 未處理項目

## Vercel Preview

## 風險等級

## 需要審核
```

### 7. CI 與 Preview 驗證

PR 開啟後自動執行：

- install。
- lint。
- typecheck。
- build。
- Lighthouse 或 Unlighthouse。
- crawler 檢查 sitemap、robots、meta、canonical、schema。
- Playwright 檢查首頁、服務頁、聯絡頁與至少 1 個內容頁。

合併門檻：

- build 必須成功。
- 主要頁面不得新增 404 / 500。
- Lighthouse SEO 分數不得比 main branch 退步。
- P0 問題不可存在。
- 若有 P1 未修，必須在 PR 留下原因。

### 8. 合併與部署後檢查

合併後：

- 等待 Vercel Production 部署成功。
- 跑 Production URL 二次檢查。
- 紀錄部署時間、commit、修正項目。
- 若 Search Console 有權限，提交 sitemap 或觀察索引狀態。
- 週報中標記「已部署」與「待觀察」。

## Ewalk.ai 交付版本

### Lite：基礎 SEO 健檢

適合形象官網剛上線或一次性檢查。

交付內容：

- 1 次技術 SEO audit。
- 主要頁面 meta / H1 / sitemap / robots / canonical 檢查。
- 1 份 Obsidian 摘要報告。
- 1 份修正建議清單。

不包含：

- 自動開 PR。
- 每週追蹤。
- Search Console 深度分析。

### Standard：SEO 自動化維護

適合 Ewalk.ai 代管官網與持續維護客戶。

交付內容：

- 每週 SEO audit。
- GitHub PR 修正低風險技術問題。
- Vercel Preview 驗證。
- 每週 SEO 維護週報。
- P0 / P1 問題提醒。

建議頻率：

- 每週一次完整檢查。
- 每月一次趨勢回顧。

### Pro：SEO 成長系統

適合內容行銷、廣告投放與官網轉換一起經營的客戶。

交付內容：

- Standard 全部項目。
- Search Console + GA4 趨勢分析。
- 內容缺口建議。
- 服務頁與案例頁內部連結策略。
- FAQ / schema / 內容架構優化。
- 月度 SEO 成長報告。

注意：

- Pro 可以追蹤排名與流量趨勢，但仍不承諾排名。
- 內容策略與商業主張需客戶共同審核。

## 風險控管

### 權限控管

- GitHub repo 權限需限定在指定客戶專案。
- AI 自動化帳號只能開 PR，不得直接 push main。
- Vercel 權限需限制部署與讀取 Preview，不得任意刪除專案。
- Search Console、GA4 權限需由客戶授權，並記錄授權範圍。

### 變更控管

- 所有 SEO 修正必須經 PR。
- 不允許 AI 直接合併 main。
- P0 修正可以加急，但仍需至少一位負責人審核。
- 大量 URL、robots、canonical、schema 調整需建立變更單。
- 每次合併後保留 rollback 方法，例如 revert PR 或回退 Vercel deployment。

### 內容控管

- AI 可提出內容建議，不可自動發布高風險內容。
- 不得虛構客戶案例、客戶數據、專業證照、保證效果。
- 不得為了 SEO 堆砌關鍵字，造成閱讀品質下降。
- 不得把 Google 官方文件解讀成排名保證。

### 報告控管

- 週報需分清楚「已修正」、「建議修正」、「需客戶確認」、「待觀察」。
- 排名與流量變化需標註可能因素，不做單一因果歸因。
- 若工具分數上升但轉換下降，需提醒回頭檢查使用者體驗與商業目標。

## 待確認

- Ewalk.ai 官網專案標準技術棧是否統一為 Next.js + Vercel + GitHub。
- 每個客戶是否都需要建立 SEO audit GitHub Action。
- SEO PR 的內部審核者是由提姆先生、專案 PM，還是技術負責人擔任。
- 客戶是否願意授權 Search Console、GA4、Vercel Analytics。
- 週報固定存放位置是否統一為 `Ewalk.ai Brain/04_報表/客戶名稱/SEO週報`。
- 是否建立共用 Prompt：`SEO Audit 結果轉 PR 修正任務`。
- 是否建立標準 GitHub PR template：`seo-fix-pr-template.md`。
- 是否把本架構拆成可執行 SOP：`官網SEO每週自動化維護SOP`。

## 參考來源

- Unlighthouse：整站 Lighthouse 與 SEO Insights。
- LibreCrawl：開源 SEO crawler，支援技術 SEO 分析、JS rendering 與匯出。
- seofor.dev：localhost / Preview SEO CLI audit，支援 AI-ready prompt。
- seo-audits-toolkit：開源網站稽核工具箱，涵蓋 Lighthouse、Security Headers、sitemap、圖片與摘要。
- effectly.ai：Git-backed SEO execution、PR、CI、rollback 的流程概念。
- Google SEO Starter Guide：SEO 是幫助搜尋引擎理解內容與幫助使用者找到網站，沒有能自動排名第一的秘密技巧。
