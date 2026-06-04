---
類型: 網站交付紀錄
客戶: The Vision Hair Salon
狀態: Preview 已建立
建立日期: 2026-05-28
標籤:
  - 客戶
  - 官網
  - Preview
---

# TheVision｜官網重做預覽交付

## 用途

本文件紀錄 TheVision 官網重做第一版 preview。此版本用於提姆先生與客戶確認網站方向，不直接取代正式官網。

## 本次完成

- 建立新版官網 preview 專案：`sites/client-demos/thevision-website-redesign`
- 建立首頁品牌主視覺與預約 CTA
- 建立主打服務區：三倍水光染、空氣冷塑燙、男士紋理薄霧燙、頭皮與結構修護
- 建立 2026 春夏質感換季月檔期區
- 建立時尚文章、TheVision 選品、作品與日常、一店與二店資訊
- 加入 noindex 設定，避免 preview 被搜尋引擎收錄
- 補入 `sites/deploy.config.json`，可走既有 preview 部署流程

## 2026-05-28 版型調整

提姆先生提出希望版型更接近原官網，因此已將 preview 從「全新高轉換 landing page」改為「原官網版型延伸版」。

調整後保留原官網的內容節奏：

- 白底上方導覽：Home、關於我們、價目表、商業趨勢、選品、聯絡我們
- 首頁大圖後接品牌標準字感、標語與品牌簡介
- 品牌理念圖文區
- 透明價格方案與線上價目表入口
- 商業趨勢 Salon Business Trends
- 時尚流行文章卡
- TheVision 選品
- 作品與日常圖片流
- 聯絡我們與兩間分店資訊

保留的改善：

- 每個重要區塊仍放入預約導流
- 主打服務入口更清楚
- 正式上線前仍維持 noindex
- 圖片先使用 demo asset，待客戶授權後替換真實素材

## 本機位置

- 網站資料夾：`sites/client-demos/thevision-website-redesign`
- 首頁檔案：`sites/client-demos/thevision-website-redesign/index.html`
- 專案說明：`sites/client-demos/thevision-website-redesign/README.md`

## 使用資料

- [[TheVision官網重建與定期更新規劃]]
- [[../01_品牌資料/品牌資料總覽|品牌資料總覽]]
- [[../02_活動與內容/2026_05檔期計畫_TheVision|2026 05 檔期計畫 TheVision]]
- 現有公開官網資料：品牌標語、服務方向、商業趨勢、文章標題、選品資訊、分店地址、電話、營業時間、Instagram

## 上線前待確認

- [ ] 正式 LINE 官方帳號或預約連結
- [ ] 價目表正式連結，是否保留 Canva 或改成站內頁
- [ ] 客戶授權 Logo、店內照、真實作品照
- [ ] 服務名稱、價格區間與活動優惠是否需更新
- [ ] 是否從 Wix 正式改站，或先做獨立 landing page
- [ ] 是否保留既有文章與 SEO 權重

## 建議下一步

1. 先讓提姆先生確認首頁方向與服務分層。
2. 客戶確認後，補真實作品照與正式預約連結。
3. 第二版拆出服務分頁：三倍水光染、女生燙髮、男士燙髮、頭皮護理。
4. 建立每月更新 SOP：活動頁、作品案例、Google 商家、SEO 文章同步更新。
