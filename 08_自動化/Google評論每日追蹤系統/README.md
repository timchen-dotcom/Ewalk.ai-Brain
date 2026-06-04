# Google 評論每日追蹤系統

建立日期：2026-05-31
狀態：可試行
主管：阿順
最終決策者：提姆先生

## 用途

每日追蹤 Ewalk.ai 代管客戶的 Google 商家評論，確認是否有新增評論、尚未回覆評論數量、各客戶設定幾天內必須回覆、每則評論的到期日倒數，以及需要提醒或升級的項目。

第一版只做「追蹤、報表、提醒」，不自動替客戶送出評論回覆。任何對外回覆、刪除回覆、修改商家資料，都必須回到提姆先生或客戶授權確認。

## 核心功能

1. 每日讀取所有啟用中的客戶與分店。
2. 透過 Google Business Profile API 抓取各分店評論。
3. 比對本地追蹤狀態，判斷今日是否有新增評論。
4. 統計每家客戶、每間分店尚未回覆評論數量。
5. 依客戶 SLA 計算每則未回覆評論的到期日與倒數天數。
6. 依客戶品牌語氣產生建議回覆草稿，供人工審核。
7. 產出每日 Markdown 報表，存到 `Ewalk.ai Brain/04_報表/Google評論追蹤`。
8. 將摘要推送到 Discord `customer_tasks`，若今天到期或逾期則同步提醒 `important`。

## 官方 API 依據

- Google Business Profile API 的 Review API 可列出指定且已驗證商家的評論，回傳評論內容、星等、建立時間、回覆狀態與分頁資訊。
- Review API 的 `accounts.locations.reviews.list` 每頁最多 50 則，預設可依 `updateTime desc` 排序。
- 回覆評論可用 `accounts.locations.reviews.updateReply`，但本系統第一版不自動送出。
- OAuth 使用 `https://www.googleapis.com/auth/business.manage` scope；舊的 `plus.business.manage` 已屬相容用途，不作為新系統首選。
- 若未來要改成即時觸發，可接 Google Business Profile Notifications API 與 Cloud Pub/Sub 的 `NEW_REVIEW` / `UPDATED_REVIEW` 通知；每日巡檢仍保留作為補漏與 SLA 統計。

官方參考：

- https://developers.google.com/my-business/content/review-data
- https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
- https://developers.google.com/my-business/content/implement-oauth
- https://developers.google.com/my-business/content/notification-setup

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `clients.csv` | 正式追蹤清單，預設只有表頭，啟用前由阿順填入客戶與分店 |
| `clients.example.csv` | 客戶設定範例，可複製欄位格式 |
| `sample-reviews.json` | 測試腳本邏輯用的假資料 |
| `../本地AI-Gemma/scripts/google_review_tracker.py` | 每日追蹤主程式 |
| `../本地AI-Gemma/scripts/run_google_review_tracker.sh` | launchd 排程用啟動腳本 |
| `../本地AI-Gemma/com.ewalk.ashun.google-review-tracker.plist` | macOS 每日排程範本 |

## 客戶設定欄位

| 欄位 | 說明 |
| --- | --- |
| `active` | `TRUE` 才會追蹤 |
| `client_name` | 客戶名稱，對應 `01_客戶` 資料夾命名 |
| `brand_name` | 對外品牌名稱 |
| `account_id` | Google Business Profile account ID |
| `location_id` | Google Business Profile location ID |
| `location_display_name` | 分店或商家顯示名稱 |
| `google_maps_url` | 人工複查用 Maps 連結 |
| `owner` | 內部負責人 |
| `sla_days` | 幾天內必須回覆；空白時用預設值 |
| `alert_channel` | Discord 頻道代號，預設 `customer_tasks` |
| `notes` | 補充說明 |

## 狀態分級

| 狀態 | 判斷 | 處理方式 |
| --- | --- | --- |
| 新增評論 | 本地狀態尚未看過的 review name | 今日摘要列入「新增評論」 |
| 待回覆 | 無 `reviewReply.comment` | 列入未回覆統計 |
| 即將到期 | 剩餘天數小於等於提醒門檻 | Discord 提醒負責人 |
| 今天到期 | `due_date = today` | 推送 `customer_tasks` 與 `important` |
| 已逾期 | `due_date < today` | 每日升級提醒，直到回覆完成 |
| 已回覆 | 有商家回覆內容 | 不列入待處理，但保留在狀態紀錄 |
| 需人工確認 | 低星、負評或含高風險字詞 | 產草稿但不得直接對外發布 |

## 建議 SLA

| 評論類型 | 建議回覆期限 |
| --- | --- |
| 1 至 2 星負評 | 1 天內 |
| 3 星中性評論 | 2 天內 |
| 4 至 5 星正評 | 3 天內 |
| 高價服務、醫美、爭議型評論 | 1 天內，且需人工審稿 |

若客戶合約另有約定，以客戶設定表的 `sla_days` 為準。

## 啟用前待辦

- [x] 確認 Ewalk.ai 或客戶授權帳號具有 The Vision 商家管理權限。
- [x] 在 Google Cloud 專案啟用 Business Profile 相關 API。
- [x] 建立 OAuth client，取得 refresh token。
- [x] 將 OAuth 資訊放入 `config.local.json`，不要寫入公開檔案。
- [x] 將 `config.local.json` 的 `google_review_tracker.enabled` 設為 `true`。
- [x] 提交 Google Business Profile Basic API Access 申請：`6-4682000041440`。
- [ ] 用 `--discover-locations` 匯出可讀取的帳號與分店。
- [ ] 填好 `clients.csv`。
- [ ] 用範例資料與正式資料各跑一次 dry run。
- [ ] 設定每日排程。
- [ ] 第一週每日人工複查 Google 商家後台，確認 API 與實際評論數一致。

## 與既有工具整合

- 回覆草稿可交給 [[../../11_Prompt資料庫/Google評論回覆追蹤Prompt|Google 評論回覆追蹤 Prompt]]。
- 每日營運可套用 [[../營運Flows/Google評論每日追蹤Flow|Google 評論每日追蹤 Flow]]。
- 客戶成效回顧可併入 [[../營運Flows/客戶月報Flow|客戶月報 Flow]]。
- Google 商家整體優化可併入 [[../Google商家AI健檢工具/README|Google 商家 AI 健檢工具]]。
- 評論來源累積可搭配 [[../Google真實評論整理小幫手/README|Google 真實評論整理小幫手]]。

## 風險與限制

- Google API 只能讀取授權帳號可管理的商家，不適合抓未授權競品評論。
- API 回傳可能與 Google Maps 前台顯示有延遲，第一週要人工對照。
- 評論回覆屬於對外品牌溝通，不應完全自動送出。
- 負評、法律、醫療、金流、歧視、個資、消費爭議等內容必須人工審稿。
- 第一次啟用時建議使用基準模式，避免把所有歷史評論都誤報成今日新增。
