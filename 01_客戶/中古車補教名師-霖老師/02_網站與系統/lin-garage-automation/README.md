# 霖老師線上車庫自動化網站包

建立日期：2026-05-17
狀態：第一版可用
用途：把 Canva 線上車庫改成 Ewalk.ai 可控的靜態網站，之後只要新增車輛資料與最多 5 張照片，就能重新產生公開車庫頁。

## 使用時機

- 霖老師新增在庫車
- 車輛已售出、保留、售價調整
- 需要把 Canva 車庫搬成正式網站或可部署版本
- 需要由阿順協助快速整理車輛資訊並更新頁面

## 資料來源

- Canva 參考頁：https://ewalk.my.canva.site/bzmj06tjxnsexz69
- LOGO：`assets/brand/lin-teacher-logo.png`
- 車輛資料：`data/garage-data.json`
- 車輛資料範例：`data/example-vehicle.json`

## 網站邏輯

公開網站保留 Canva 版的核心邏輯：

- 在庫車列表
- 車輛詳情
- 最多 5 張照片
- 年份、里程、等級、售價、車色
- 車輛說明與車況重點
- LINE / 電話詢問 CTA

同時移除公開頁後台登入，避免管理密碼出現在前台。更新權限改回 Ewalk.ai 內部資料檔與上架 SOP 控管。

## 資料欄位

每台車建議至少提供：

- `id`：車輛代號，使用英文小寫與連字號
- `status`：`available`、`reserved`、`sold`、`draft`
- `title`：公開車型名稱
- `brand`：品牌
- `model`：車型
- `year`：年份
- `grade`：等級
- `price`：在庫售價
- `mileage`：里程數
- `color`：車色
- `location`：看車地點
- `transmission`：排檔
- `fuel`：燃料
- `highlights`：3 至 6 個車況重點
- `description`：霖老師口吻車輛說明
- `images`：1 至 5 張照片路徑
- `updatedAt`：更新日期

## 更新方式

1. 把照片放到 `assets/cars/車輛代號/`。
2. 照片命名為 `01.jpg`、`02.jpg`、`03.jpg`、`04.jpg`、`05.jpg`。
3. 把車輛資料寫入 `data/garage-data.json` 的 `vehicles`。
4. 執行 `node scripts/build.mjs`，或雙擊 `產生線上車庫.command`。
5. 檢查 `dist/index.html`。

## 產出位置

- 可部署網站：`dist/index.html`
- 公開頁資料：`dist/garage-data.js`
- 建置紀錄：`dist/build-report.json`

## 風險控管

- 對外發布前需提姆先生確認車輛售價、車況描述與是否可公開。
- 不確定的車況不得自行補寫，統一標註待確認。
- 已售出車輛可先改 `status: "sold"`，若不想公開則改 `draft`。
- 正式部署網域、Vercel 專案或 LINE 導流設定需另行批准。
