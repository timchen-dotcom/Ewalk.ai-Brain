# 2026-06-03 Google Ads 後台設定實測紀錄

## 用途

記錄韓食日常鍋物 2026 年 6 月開幕慶 Google Ads 後台實際建稿進度、已完成設定、卡點與下一步，供提姆先生與阿順續接投放流程。

## 本次操作帳戶

- Google Ads 帳戶：EWALK數位漫步｜美業AI行銷服務領航者
- CID：728-726-6360
- 操作日期：2026-06-03
- 操作原則：僅建立與檢查草稿，不主動發布、不啟用正式花費

## 已完成的第一組搜尋活動

### 活動基本資料

- 活動名稱：HIH_202606_Search_Brand_Map
- 活動類型：搜尋
- 建立方式：不依據廣告指引建立廣告活動
- 目標：網站造訪；後台同時帶入來電相關目標，因此已補電話素材
- 最終到達網址：`https://shop.ichefpos.com/store/nNLhMqsW/ordering`
- 顯示路徑：`opening / hansik`

### 出價與聯播網

- 出價策略：盡量爭取點擊
- 最高單次點擊出價上限：NT$20
- Google 搜尋聯播網：開啟
- 搜尋夥伴：開啟
- Google 多媒體廣告聯播網：已關閉
- AI Max：已關閉

### 地區與語言

- 地區：台南市, 台灣
- 語言：繁體中文（台灣）
- 歐盟政治廣告：沒有歐盟政治廣告

### 關鍵字

```text
"韓食日常"
[韓食日常]
"韓食日常鍋物"
[韓食日常鍋物]
"韓食日常文南店"
[韓食日常文南店]
"Hansik Ilsang"
"韓食日常 Uber Eats"
```

### 廣告標題

- 韓食日常鍋物開幕慶
- 點鍋物送手工料
- 韓食日常文南店
- 導航前往韓食日常
- Uber Eats看韓食日常
- 6月開幕慶進行中

### 廣告說明

- 韓食日常鍋物文南店6/1至6/30開幕慶，點鍋物隨鍋送手工料。
- 想吃韓式鍋物可查看菜單、導航前往，或搜尋Uber Eats韓食日常。

### 電話素材

- 電話：06 263 5885
- 狀態：已套用至草稿，原本的來電警告已消失

### 預算

- 預算類型：平均每日預算
- 每日預算：NT$43
- 後台提醒：預算低於 Google 建議金額，這是控量品牌搜尋策略，可接受

## 目前卡點

- 已進入「查看」頁。
- 頁面顯示「您的廣告活動已經可以發布了」。
- 但左側狀態仍顯示「無法儲存變更」。
- 提姆先生進入畫面後未看到可操作的帳戶驗證入口。
- 阿順重新接手檢查後，確認 Google Ads 畫面可見範圍內沒有可安全點擊的「發布 / 建立 / 儲存」按鈕。
- 後台 DOM 仍殘留畫面外或隱藏浮層：
  - `Turn off ad blockers` 廣告阻擋提示
  - `確認身分` 安全確認提示
  - `進階地點挑選器` 儲存浮層
- 這代表目前卡點不是廣告資料缺漏，而是 Google Ads 介面狀態卡住。阿順未按發布，未啟用正式投放。

## 已改走的安全續接路線

因 Google Ads UI 無法安全完成儲存，已先建立三組搜尋廣告的 `PAUSED` 草稿資料包：

- Google Ads API dry-run：[[2026-06-03_GoogleAds_PAUSED草稿_dry-run.json]]
- Google Ads Editor 匯入草稿：[[2026-06-03_GoogleAds_Editor匯入草稿.csv]]
- 建稿準備腳本：`Ewalk.ai Brain/腳本/google-ads/prepare-hansik-opening-search-ads.mjs`

三組 Campaign 均設定為 `PAUSED`：

| Campaign | 每日預算 | 狀態 |
| --- | ---: | --- |
| `HIH_202606_Search_Brand_Map` | NT$43 | PAUSED |
| `HIH_202606_Search_Local_KoreanHotpot` | NT$71 | PAUSED |
| `HIH_202606_Search_Delivery` | NT$29 | PAUSED |

## 驗證後續接步驟

1. 優先使用 Google Ads API 或 Google Ads Editor 匯入路線建立三組 `PAUSED` 草稿。
2. 若走 API，developer token 已建立但未保存；需先連結 `728-726-6360` 到 Manager Account `756-316-1776`，再補 OAuth 授權、geoTargetConstant 與 languageConstant。
3. 若走 Google Ads Editor，先匯入 `2026-06-03_GoogleAds_Editor匯入草稿.csv`，檢查所有 Campaign / Ad Group / Ad / Keyword 狀態皆為 Paused。
4. 未經提姆先生批准，不得將任何 Campaign 改成 `ACTIVE`。
5. Foodpanda 未確認正式店家頁前，Google 廣告文案不寫「Foodpanda 下單」。

## 阿順判斷

第一組 Brand/Map 搜尋活動的文案、關鍵字、電話素材與預算已完成到可審查狀態。現場問題不是投放資料缺漏，而是 Google Ads UI 卡在隱藏驗證 / 地點 / 外掛提示的複合狀態。為避免誤發布或觸發不可控流程，本案改走 `PAUSED` dry-run / Editor 匯入資料包續接。
