# Open Design 導入試點任務單

> 目標：用最小成本驗證 Open Design 是否能成為 Ewalk.ai「設計端開發」的固定管線（網頁 / 簡報 / APP 原型）。

## 來源

- Repo：https://github.com/nexu-io/open-design
- 試點 SOP：[[../13_SOP流程/Open Design 產物工作流試點SOP|Open Design 產物工作流試點 SOP]]
- 研究結論：[[../09_知識庫/Open Design（open-design）工具研究｜設計端開發可行性|Open Design 工具研究｜設計端開發可行性]]

## 試點範圍（固定只做兩件）

1) 產出 1 份「客戶提案 deck」  
2) 產出 1 組「廣告視覺版型」：至少 3 種尺寸/版型（1080×1080 / 1080×1920 / 1200×628）

## 驗收標準（只看三件事）

- 速度：第一版方向稿 ≤ 120 分鐘可拿來討論
- 可迭代：同一流程 30 分鐘內能改出 v2
- 可交付：能輸出 HTML / PDF / PPTX（或可轉 PPTX 的 HTML deck），且落檔命名一致

## 執行清單（照做）

### A. 環境與啟動（不在 Vault 內做）

- [ ] 選定工作資料夾（Vault 外，例如 `~/Work/open-design/`）
- [ ] `git clone` repo
- [ ] 依 Quickstart：Node 24、pnpm、`pnpm install`
- [ ] 啟動：`pnpm tools-dev run web`（daemon + web）

### B. 產出 deck（v1 → v2）

- [ ] 用試點 SOP 的「提案 Prompt 模板」產 v1
- [ ] 針對提姆回饋改 v2（只改 3 點以內）
- [ ] 紀錄：花費時間、改了幾次、最常用的 prompt 片段

### C. 產出廣告版型（v1 → v2）

- [ ] 產三尺寸 v1（主標/副標/CTA/品牌區）
- [ ] 改 v2（只改 3 點以內）
- [ ] 紀錄：版型可改性、字級/留白是否一致

## 落檔與歸檔（回到 Vault）

> 只存交付版本，不把整個 open-design repo 放進 Vault。

- Deck：
  - `Ewalk.ai Brain/06_素材/OpenDesign/提案/YYYY-MM-DD_客戶_提案deck_v1`
  - `Ewalk.ai Brain/06_素材/OpenDesign/提案/YYYY-MM-DD_客戶_提案deck_v2`
- 廣告版型：
  - `Ewalk.ai Brain/06_素材/OpenDesign/廣告版型/YYYY-MM-DD_客戶_廣告版型_v1`
  - `Ewalk.ai Brain/06_素材/OpenDesign/廣告版型/YYYY-MM-DD_客戶_廣告版型_v2`

## 回報格式（給提姆）

- 產物路徑（Vault 內）
- v1 → v2 的差異（3 點以內）
- 成本：總耗時、修改輪數
- 結論：值得導入 / 只適合特定場景 / 暫緩

## 待提姆允許

- [x] 是否允許我在 Vault 外 clone 並跑起 Open Design 試點（會需要對外網路下載依賴）？（提姆已允許：保持為獨立專案資料夾，不與既有系統混用）
- [ ] 試點的「目標客戶」是哪一個？（避免做出來放不進交付）

## 試點工作區（固定）

- Open Design 專案工作區（獨立、可刪可重建）：`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/tmp/open-design/`
- 說明：[[../../tmp/open-design/README|tmp/open-design/README]]

## 2026-05-13 第一次官網試點

- 目標客戶：髮染日式快染專門店
- 產物類型：品牌官網首頁（獨立靜態站）
- 產物路徑：`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/tmp/open-design/star-color-official-site/index.html`
- 使用素材：既有品牌加盟手冊中的沙龍空間、接待、服務現場視覺
- 已完成檢查：
  - JS 語法檢查：通過
  - 本地資源連結檢查：7 個相對資源皆存在
  - localhost 預覽：目前沙盒限制無法 bind port，改用直接開 HTML 預覽
- 下一步：
  - 補 LINE OA 真實連結、地址、營業時間與正式價格
  - 若版型方向通過，再做第 2 版：加入真實作品照片、Google 評論、預約連結

## 2026-05-14 官網 v2 優化

- 需求來源：提姆指定使用完整加盟手冊 PDF 與線上預約網址
- PDF 來源：`/Users/chenjinting/Downloads/髮染日式快染專門店_加盟手冊 (1).pdf`
- 已完成：
  - 首頁改成品牌紅 LOGO 視覺衝擊首屏
  - LOGO 從品牌手冊封面裁出並放入網站 header
  - 所有線上預約 CTA 綁定 Quenect：`https://quenect.yiti.com.tw/zh-TW/store/hairsaloncolor/pre_order`
  - 新增 `about.html`：關於我 / 品牌初心
  - 新增 `franchise.html`：加盟主專區，整理加盟手冊中的市場、優勢、支援與流程
  - 新增 `academy.html`：髮染學院架構頁，等待後續教材資料餵入
- 已完成檢查：
  - JS 語法檢查：通過
  - 新增頁面本地資源連結檢查：通過，無缺圖 / 缺 CSS / 缺 JS
- 待補：
  - 真實門市地址、營業時間、正式價格表
  - 真實作品照片、Google 評論、LINE OA 連結
  - 髮染學院正式教材與課程內容

## 2026-05-14 官網 v3 視覺優化

- 需求來源：提姆截圖回饋與 Image 2 視覺生成需求
- 已完成：
  - 使用 Image 2 生成首頁品牌情境圖：`assets/hero-salon-image2.png`
  - 使用 Image 2 生成染前 30 秒髮況判斷輔助照片：
    - `assets/hair-check-root.png`
    - `assets/hair-check-dry.png`
    - `assets/hair-check-gray.png`
    - `assets/hair-check-uneven.png`
  - 導覽「服務」改為「線上預約服務」
  - 文案「最適合的染法」改為「最適合的染髮」
  - 預約段落改成網頁內容呈現，不再使用加盟手冊整頁截圖
- 已完成檢查：
  - JS 語法檢查：通過
  - 新增 Image 2 圖片資源連結檢查：通過

## 2026-05-14 髮染學院頁內容更新

- 需求來源：提姆提供髮染學院核心價值圖
- 來源圖：`/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_3.jpg`
- 已完成：
  - 將來源圖歸檔為網站資產：`assets/academy-core-values.jpg`
  - `academy.html` 改為正式課程頁：三個月，讓自己重新發光
  - 新增適合對象：想轉職、喜歡美感、想快速上手
  - 新增學習內容：染髮操作、色彩學、修色技巧、護髮養護、真人實操
  - 新增課程承諾：20 堂完整課程、彈性上課時間、結訓後可直接接客、未來可輔導創業
- 已完成檢查：
  - JS 語法檢查：通過
  - `academy.html` 本地資源連結檢查：通過

## 2026-05-14 髮染學院課程內容補強

- 需求來源：提姆提供兩張課程內容圖
- 來源圖：
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_20.jpg`
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_21.jpg`
- 已完成：
  - 歸檔網站素材：`assets/academy-learn-modules.jpg`
  - 歸檔網站素材：`assets/academy-20-lessons.jpg`
  - 補強課程設計段落：專業師資指導、小班制教學、實作為主、學會立即上手
  - 補強三個月學習計畫段落：20 堂完整課程、手把手教學、實操練習、結訓後可接客、未來可輔導創業或進階發展
- 已完成檢查：
  - JS 語法檢查：通過
  - 全站本地資源連結檢查：通過

## 2026-05-14 髮染學院選修單元課

- 需求來源：提姆提供兩張學院選修課程圖
- 來源圖：
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_15.jpg`
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_14.jpg`
- 已完成：
  - 歸檔網站素材：`assets/academy-elective-relaxation.jpg`
  - 歸檔網站素材：`assets/academy-elective-gua-sha.jpg`
  - 新增選修單元課區：舒壓課程、臉部撥筋課程
  - 舒壓課程整理：頭皮結構解析、放鬆按摩手法、產品搭配應用、完整服務流程
  - 臉部撥筋課程整理：撥筋原理、專業手法教學、搭配產品應用、完整服務流程
- 已完成檢查：
  - JS 語法檢查：通過
  - 全站本地資源連結檢查：通過

## 2026-05-14 髮染學院講師陣容

- 需求來源：提姆提供 7 張髮染學院講師介紹圖
- 來源圖：
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_11.jpg`
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_10.jpg`
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_12.jpg`
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_9.jpg`
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_8.jpg`
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_7.jpg`
  - `/Users/chenjinting/Downloads/LINE_ALBUM_髮染學院_260514_6.jpg`
- 已完成：
  - 歸檔網站素材：`assets/academy-instructor-summer.jpg`
  - 歸檔網站素材：`assets/academy-instructor-angel.jpg`
  - 歸檔網站素材：`assets/academy-instructor-araynay.jpg`
  - 歸檔網站素材：`assets/academy-instructor-abby.jpg`
  - 歸檔網站素材：`assets/academy-instructor-zeller.jpg`
  - 歸檔網站素材：`assets/academy-instructor-lulu.jpg`
  - 歸檔網站素材：`assets/academy-instructor-ivan.jpg`
  - `academy.html` 新增「講師陣容」區，整理每位講師定位、技術專長、教學風格與學員價值。
- 已完成檢查：
  - JS 語法檢查：通過
  - 全站本地資源連結檢查：通過
  - HTML 基礎解析檢查：通過
- 待補：
  - 若後續要正式上線，可再補講師報名諮詢 CTA、課程班別時間與每位講師可預約課程。
