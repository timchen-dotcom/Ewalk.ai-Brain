# Google Business Profile API 申請紀錄｜2026-05-31

## 狀態

- 申請狀態：已送出，等待 Google 審核
- 案件編號：`6-4682000041440`
- Google 預估審核時間：7 至 10 個工作天
- Google Cloud 專案：`Ewalk-AI-Studio`
- Project number：`951177369216`
- 申請商家：The Vision hair salon 淡水美學髮廊
- 商家狀態：Verified

## 已完成

- 已啟用 My Business Account Management API。
- 已啟用 My Business Business Information API。
- 已建立 Google Auth Platform OAuth 同意畫面。
- 已建立 OAuth Client。
- 已取得 `business.manage` scope 的 refresh token。
- 已寫入本機 `config.local.json`，不進版本控管。
- 已提交 Google Business Profile Basic API Access 申請。

## 目前卡點

Google Business Profile API 目前回傳 quota 0：

```text
Quota exceeded for quota metric 'Requests'
quota_limit_value: 0
service: mybusinessaccountmanagement.googleapis.com
```

這代表專案已設定 OAuth，但尚未被 Google allowlist。等 Google 審核通過後，才能用 API 匯出 `account_id / location_id` 並啟用每日評論追蹤。

## 審核通過後下一步

1. 執行 `google_review_tracker.py --discover-locations`。
2. 找到 The Vision hair salon 淡水美學髮廊的 `account_id` 與 `location_id`。
3. 更新 `clients.csv`，將 Thevision 的 `active` 改為 `TRUE`。
4. 執行一次 dry run，確認可抓到評論。
5. 再接每日排程與 Discord 通知。

## 注意

- `config.local.json` 內含 OAuth 機密，不可複製到公開文件或版本控管。
- 對外回覆評論仍需人工確認；負評一定要提姆先生確認。
