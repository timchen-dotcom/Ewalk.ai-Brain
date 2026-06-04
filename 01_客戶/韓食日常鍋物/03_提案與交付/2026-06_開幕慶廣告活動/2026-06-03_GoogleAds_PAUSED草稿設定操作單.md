---
類型: Google Ads 建稿操作單
狀態: UI卡住，已產出 PAUSED dry-run / Editor 匯入草稿
客戶: 韓食日常鍋物
活動: 2026年6月開幕慶
建立日期: 2026-06-03
標籤:
  - GoogleAds
  - 廣告投放
  - 搜尋廣告
  - Google商家
---

# 韓食日常鍋物｜Google Ads PAUSED 草稿設定操作單

## 用途

本文件給阿順或廣告投放專員進入 Google Ads 後台建立草稿使用。所有 Campaign 建立完成後必須維持 `PAUSED`，未經提姆先生批准不得啟用。

2026-06-03 實測後補充：Google Ads 後台 UI 已完成第一組到查看頁，但因隱藏驗證 / 地點 / 外掛提示造成「無法儲存變更」，目前改以 dry-run JSON 與 Google Ads Editor CSV 作為續接路線。

## 已確認資料

- 店名：韓食日常鍋物 文南店
- 地址：台南市南區文南路49號1樓
- 電話：06 263 5885
- 活動期間：2026-06-01 至 2026-06-30
- 建議投放期間：2026-06-03 至 2026-06-30
- Google 預算：NT$4,000
- 每日總預算參考：約 NT$143
- Google 商家 / 導航頁：`https://www.google.com/maps/place/%E9%9F%93%E9%A3%9F%E6%97%A5%E5%B8%B8%E9%8D%8B%E7%89%A9+%E6%96%87%E5%8D%97%E5%BA%97/@22.9830414,120.1897276,1948m/data=!3m2!1e3!4b1!4m6!3m5!1s0x346e77f80f0cb895:0x25665092d56ed1cb!8m2!3d22.9830414!4d120.1897276!16s%2Fg%2F11z9rg471f?entry=ttu`
- 官方點餐頁：`https://shop.ichefpos.com/store/nNLhMqsW/ordering`
- Uber Eats 店家頁：`https://www.ubereats.com/tw/store/%E9%9F%93%E9%A3%9F%E6%97%A5%E5%B8%B8%E9%8D%8B%E7%89%A9/NN13z4XCUzC1LnsuTcQjhw`
- Foodpanda：尚未取得可公開確認的正式店家頁，暫不作為落地頁。

## 後台建立原則

- Campaign 類型：搜尋廣告
- 目標：網站流量或不使用目標指引
- 狀態：建立後立即暫停，維持 `PAUSED`
- 出價：Maximize clicks；若後台可設定 CPC 上限，先抓 NT$20 至 NT$25
- 語言：中文
- 地區：以台南市南區文南路49號為中心
- 廣告輪播：優先最佳化
- 內容聯播網：關閉
- 搜尋夥伴：可先開啟；若前 3 天流量品質差再關閉
- 自動套用建議：關閉
- 最終網址：依各 Campaign 設定，不混用未確認 Foodpanda 頁面

## Campaign 設定

| Campaign | 任務 | 每日預算 | 地區建議 | 最終網址 | 狀態 |
| --- | --- | ---: | --- | --- | --- |
| `HIH_202606_Search_Brand_Map` | 品牌、導航、Google 商家承接 | NT$43 | 店址周遭 8 公里，含台南市南區、中西區、安平區 | Google 商家 / 導航頁 | PAUSED |
| `HIH_202606_Search_Local_KoreanHotpot` | 附近韓式鍋物與在地餐飲搜尋 | NT$71 | 店址周遭 5 公里 | Google 商家 / 導航頁 | PAUSED |
| `HIH_202606_Search_Delivery` | 外送需求搜尋 | NT$29 | 店址周遭 5 公里 | Uber Eats 店家頁 | PAUSED |

## 關鍵字與文案來源

- 建稿表：[[2026-06-02_Google搜尋廣告建稿表.csv]]
- 預算調整紀錄：[[2026-06-03_開幕慶預算配置調整紀錄_Google商家4000]]
- 正式投放設定：[[2026-06-02_韓食日常鍋物_六月開幕慶正式投放設定]]
- Google Ads API dry-run：[[2026-06-03_GoogleAds_PAUSED草稿_dry-run.json]]
- Google Ads Editor 匯入草稿：[[2026-06-03_GoogleAds_Editor匯入草稿.csv]]
- Google Ads API mutate 預覽：[[2026-06-03_GoogleAds_API_mutate_operations_preview.json]]
- Google Ads Editor 匯入執行紀錄：[[2026-06-03_GoogleAdsEditor匯入執行紀錄]]
- Google Ads API 憑證與建稿續接操作單：[[2026-06-03_GoogleAdsAPI憑證與建稿續接操作單]]
- 建稿準備腳本：`Ewalk.ai Brain/腳本/google-ads/prepare-hansik-opening-search-ads.mjs`

## 建議延伸素材

### Sitelink

| 名稱 | 連結 | 用途 |
| --- | --- | --- |
| 導航前往 | Google 商家 / 導航頁 | 到店導流 |
| 查看官方菜單 | 官方點餐頁 | 菜單與品項確認 |
| Uber Eats 外送 | Uber Eats 店家頁 | 外送需求承接 |
| 開幕慶活動 | Google 商家 / 導航頁 | 回到店家資訊 |

### Callout

- 6/1-6/30 開幕慶
- 點鍋物送手工料
- 多款韓式湯鍋
- 文南店新開幕
- 可導航前往

## 否定關鍵字

先加入共用否定清單 `HIH_202606_Negative_Search`：

```text
食譜
做法
教學
影片
韓劇
免費
加盟
批發
求職
工作
二手
泡菜製作
火鍋料批發
韓文
韓國旅遊
```

## 上線前檢查

- [x] 第一組 `HIH_202606_Search_Brand_Map` 已完成到查看頁
- [x] 確認 Google Ads UI 目前無安全可操作的儲存 / 發布入口
- [x] 三組 Google Ads `PAUSED` dry-run JSON 已產出
- [x] 三組 Google Ads Editor 匯入 CSV 已產出
- [x] Google Ads Editor 官方 DMG 已下載至 `/private/tmp/google_ads_editor.dmg`
- [x] 提姆先生批准安裝 Google Ads Editor
- [x] DMG 已驗證有效
- [ ] Google Ads Editor 已安裝
- [x] 確認目前受控環境無法掛載 DMG，需提姆先生手動安裝或改走 API
- [x] Google Ads API mutate operations preview 已產出
- [x] Google Ads API 憑證與建稿續接操作單已產出
- [x] Google Ads Manager Account 已建立：`756-316-1776`
- [x] Google Ads developer token 已建立 / 申請：API Center 顯示 `Explorer 存取權`
- [x] `728-726-6360` 已連結到 Manager Account `756-316-1776`：提姆先生回報已成功授權
- [x] Google Ads API runner 已建立：`Ewalk.ai Brain/腳本/google-ads/google-ads-api-runner.mjs`
- [x] Google Ads API 本機設定工具已建立：`Ewalk.ai Brain/腳本/google-ads/set-google-ads-config.command`
- [x] Google Ads API 本機憑證已寫入 `.env.local`
- [x] Google Ads API runner 已新增 `resolve-constants` 與 `create-paused` 模式
- [x] Google Ads API 續跑檔已建立：`Ewalk.ai Brain/腳本/google-ads/run-hansik-google-ads-paused-drafts.command`
- [x] Google Cloud 專案 `Ewalk-AI-Studio` 已啟用 `Google Ads API`
- [x] Google Ads API 連線檢查已通過
- [x] `臺南市` geoTargetConstant 已自動解析並寫入 `.env.local`
- [x] `繁體中文（台灣）` languageConstant 已自動解析並寫入 `.env.local`
- [x] API `validateOnly` 已通過
- [x] 三組 Campaign 已透過 API 實際建立
- [x] 三組 Campaign 實際建立後狀態皆為 `PAUSED`
- [x] 提姆先生批准後，三組 Campaign 已啟用為 `ENABLED`
- [x] 第一組每日預算已設為 NT$43
- [x] 第二、三組 dry-run 每日預算分別設為 NT$71、NT$29
- [ ] 地區鎖定店址周遭，不使用全台投放
- [ ] Foodpanda 未確認前，廣告文案不寫「Foodpanda 下單」
- [ ] 否定關鍵字已加入
- [ ] Sitelink 已加入
- [ ] 沒有開啟自動套用建議
- [ ] 未經提姆先生批准，不得按下啟用或發布 ACTIVE

## 阿順備註

本案 Google Ads 優先承接「已經在找韓食日常、附近韓式鍋物、外送韓式料理」的高意圖搜尋。因預算只有 NT$4,000，不建議一開始使用太廣的興趣或全台曝光型投放，避免預算被低意圖流量吃掉。

2026-06-03 實測：第一組已完成關鍵字、廣告、電話素材與 NT$43 每日預算，停在 Google Ads 查看頁。提姆先生進入畫面未看到驗證入口，阿順重新檢查後確認 UI 內沒有可安全操作的儲存 / 發布按鈕；隱藏浮層包含廣告阻擋、確認身分與進階地點挑選器。已改產出三組 `PAUSED` dry-run / Editor 匯入草稿，等待 API 憑證或 Editor 匯入續接。

2026-06-03 續接：提姆先生回報已成功完成 Manager Account 授權。阿順已建立 API runner 與本機設定工具，下一步需安全補入 Google Ads developer token、OAuth client、OAuth refresh token，以及地區 / 語言 constant 後，先跑 `validateOnly`，不得直接建立 ACTIVE 廣告。

2026-06-04 續接：Google Ads API 本機憑證已補齊並寫入 `.env.local`，不保存於 Obsidian。API runner 已新增 `resolve-constants` 與 `create-paused`，並建立一鍵續跑檔 `Ewalk.ai Brain/腳本/google-ads/run-hansik-google-ads-paused-drafts.command`。目前阻塞不是憑證，而是 Codex 受控 shell 沒有 DNS 設定，無法解析 Google API 網域；需在正常可連外網的 Terminal 執行續跑檔。續跑檔會先跑 `check-access`、自動解析地區 / 語言常數、`validateOnly`，最後要求輸入 `CREATE_PAUSED` 才會建立正式 `PAUSED` 草稿。

2026-06-04 02:17 續接：提姆先生正常 Terminal 跑到第 2 步，log 顯示 Google Cloud 專案尚未啟用 `Google Ads API`。阿順已依批准進入 Google Cloud Console 啟用 `googleads.googleapis.com`，畫面狀態顯示 `已啟用`。下一步重新跑續跑檔，等待 API 啟用狀態傳播後應可進入 `check-access`、`resolve-constants` 與 `validateOnly`。

2026-06-04 03:10 續接：提姆先生重新跑續跑檔後，`check-access` 已成功讀取 Google Ads 帳戶，`resolve-constants` 已成功寫入 `geoTargetConstants/1012818` 與 `languageConstants/1018`。`validateOnly` 卡在 `maximizeClicks` 欄位不被 Google Ads API v22 REST mutate 接受。阿順已將 preview 建稿改為 `manualCpc`，並在 Ad Group 層補 `cpcBidMicros`，已重新產出 dry-run / Editor CSV / API mutate preview。下一步重新跑續跑檔。

2026-06-04 13:07 完成：提姆先生再次執行續跑檔並輸入 `CREATE_PAUSED` 後，Google Ads API 建立成功。回應檔 `2026-06-03_GoogleAds_API_mutate_operations_preview_created-response.json` 顯示 `ok: true`、HTTP `200`。已建立 3 個 Campaign、3 個 Ad Group、23 個 Keyword / Ad Group Criterion、3 則 Responsive Search Ad，Campaign / Ad Group / Keyword / Ad 全部狀態皆為 `PAUSED`。

2026-06-04 19:35 啟用：提姆先生批准今天啟用並執行 `enable-hansik-google-ads.command`。API 回應檔 `2026-06-04_GoogleAds_啟用回應.json` 顯示 `ok: true`、HTTP `200`。三組 Campaign 已由 `PAUSED` 改為 `ENABLED`，每日預算維持 NT$43、NT$29、NT$71，未更改預算、文案、關鍵字或地區設定。
