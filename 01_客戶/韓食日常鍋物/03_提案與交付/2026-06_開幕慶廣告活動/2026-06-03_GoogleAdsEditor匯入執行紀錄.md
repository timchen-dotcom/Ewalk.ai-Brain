# 2026-06-03 Google Ads Editor 匯入執行紀錄

## 用途

記錄韓食日常鍋物 Google Ads 因後台 UI 卡住後，改走 Google Ads Editor 匯入 `PAUSED` 草稿的實際執行進度。

## 目前狀態

- 執行時間：2026-06-03 21:02
- Google Ads Editor 安裝狀態：本機尚未安裝
- macOS 版本：26.2，符合 Google Ads Editor macOS 12+ 需求
- 官方下載頁：`https://business.google.com/us/ad-tools/google-ads-editor/`
- 官方 DMG 下載來源：`https://dl.google.com/adwords_editor/google_ads_editor.dmg`
- 已下載 DMG：`/private/tmp/google_ads_editor.dmg`
- 檔案大小：約 313MB
- DMG 驗證：有效
- DMG 掛載狀態：受目前受控環境限制，`hdiutil attach` 回覆「尚未設定裝置」，無法由阿順完成掛載安裝

## 已完成

- [x] 確認本機 `/Applications` 與使用者 `Applications` 內沒有 Google Ads Editor
- [x] 開啟 Google Ads Editor 官方頁
- [x] Chrome 下載被 `dl.google.com` 阻擋後，改用系統下載方式
- [x] 取得本回合網路權限
- [x] 成功下載 Google 官方 Google Ads Editor DMG
- [x] 保留 Google Ads Editor 官方頁在 Chrome
- [x] 驗證 DMG 檔案有效
- [x] 嘗試以 `hdiutil` 掛載，因本機受控環境限制失敗
- [x] 嘗試以 DiskImageMounter 掛載，未成功

## 安裝卡點

提姆先生已批准安裝，但目前阿順所在受控環境未取得磁碟映像掛載能力，也未取得 `/Applications` 寫入權限。因此 Google Ads Editor 安裝需改由提姆先生手動完成，或改用 Google Ads API 路線。

手動安裝方式：

1. 在 Finder 開啟 `/private/tmp/google_ads_editor.dmg`
2. 將 Google Ads Editor 拖到 Applications
3. 開啟 Google Ads Editor
4. 登入 / 選擇 Google Ads 帳戶 `728-726-6360`
5. 匯入 [[2026-06-03_GoogleAds_Editor匯入草稿.csv]]
6. 確認三組 Campaign / Ad Group / Ad / Keyword 全部維持 Paused
7. 不要張貼變更，回報阿順檢查

## API 續接準備

已產出 Google Ads API mutate operations 預覽：

- [[2026-06-03_GoogleAds_API_mutate_operations_preview.json]]

檢查結果：

- 模式：`preview-only`
- API endpoint：`customers/7287266360/googleAds:mutate`
- `validateOnly`：`true`
- mutate operations：41
- Campaign：3
- Campaign Budget：3
- Ad Group：3
- Responsive Search Ad：3
- Keyword：23

正式 API 送出前仍缺：

- Google Ads developer token
- OAuth access token / refresh token
- 若透過 MCC 操作，需確認 login-customer-id
- `臺南市` 的 geoTargetConstant
- `繁體中文（台灣）` 的 languageConstant

## 本次匯入目標

| Campaign | 每日預算 | 匯入狀態 |
| --- | ---: | --- |
| `HIH_202606_Search_Brand_Map` | NT$43 | 待匯入 |
| `HIH_202606_Search_Local_KoreanHotpot` | NT$71 | 待匯入 |
| `HIH_202606_Search_Delivery` | NT$29 | 待匯入 |

## 安全邊界

- 不輸入密碼或二階段驗證碼。
- 不新增付款方式。
- 不發布、不張貼、不啟用 `ACTIVE`。
- 若 Google Ads Editor 要求授權、上傳、張貼或同步變更，先停下回報提姆先生。
