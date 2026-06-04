# 2026-06-03 Google Ads API 憑證與建稿續接操作單

## 用途

因 Google Ads 後台 UI 卡住、Google Ads Editor 在目前受控環境無法掛載安裝，本文件整理 Google Ads API 續接所需憑證、授權、安全邊界與下一步。

## 官方依據

- Google Ads API 是用程式管理 Google Ads 帳戶與 Campaign 的介面，可管理到客戶、Campaign、關鍵字等層級。
- Google 官方文件指出，呼叫 Google Ads API 需要 developer token。
- Google Ads API 使用 OAuth 2.0 進行身分驗證與授權，且 OAuth 憑證之外仍需要 developer token。

參考：

- Google Ads API Introduction：`https://developers.google.com/google-ads/api/docs/get-started/introduction`
- Google Ads API Developer Token：`https://developers.google.com/google-ads/api/docs/api-policy/developer-token`
- Google Ads API OAuth：`https://developers.google.com/google-ads/api/docs/oauth/overview`

## 已完成

- [x] 建立 Google Ads API mutate operations 預覽檔：[[2026-06-03_GoogleAds_API_mutate_operations_preview.json]]
- [x] 預覽檔 endpoint：`customers/7287266360/googleAds:mutate`
- [x] 預覽檔模式：`validateOnly: true`
- [x] Campaign 數量：3
- [x] Campaign Budget 數量：3
- [x] Ad Group 數量：3
- [x] Responsive Search Ad 數量：3
- [x] Keyword 數量：23
- [x] 全部 Campaign / Ad Group / Ad / Keyword 均保持 `PAUSED`

## 目前缺少

| 項目 | 狀態 | 說明 |
| --- | --- | --- |
| Google Ads manager account / MCC | 已建立 | `Ewalk.ai 數位漫步｜Google Ads Manager`，CID `756-316-1776` |
| Google Ads developer token | 已建立 | API Center 顯示權杖已建立，存取層級為 `Explorer 存取權`；實際權杖未查看、未複製、未寫入文件 |
| OAuth client / refresh token | 待取得 | 需授權可操作 Google Ads API 的帳戶 |
| login-customer-id | 待正式測試 | 預計使用 Manager Account CID `756-316-1776` |
| `臺南市` geoTargetConstant | 待解析 | 正式送 API 前必須換成 Google Ads API resource name |
| `繁體中文（台灣）` languageConstant | 待確認 | 正式送 API 前必須換成 Google Ads API resource name |

## Developer Token 取得路線

1. 前往 Google Ads API Center：`https://ads.google.com/aw/apicenter`
2. 使用 Google Ads manager account 登入。
3. 若目前帳戶不是 manager account，頁面會提示 API Center 只提供 manager account 使用。
4. 填寫 API Access form。
5. 接受 API Terms and Conditions。
6. 取得 developer token 後，先不要貼在公開文件內。
7. 將 token 放入本機安全輸入流程或私密 `.env`，由阿順建立不公開的執行設定。

## 2026-06-03 API Center 實測

已檢查目前 `tim.chen@ewalk.ai` 可見的兩個 Google Ads 帳戶：

| 帳戶 | CID | API Center 結果 |
| --- | --- | --- |
| EWALK數位漫步｜美業AI行銷服務領航者 | `728-726-6360` | 顯示「API 中心僅適用於管理員帳戶」 |
| Google Ads 帳戶 | `856-840-8701` | 顯示「API 中心僅適用於管理員帳戶」 |

結論：原本沒有可直接申請 developer token 的 manager account。2026-06-03 已由提姆先生完成建立，後續需將 `728-726-6360` 連結到該 manager account。

## 2026-06-03 Manager Account 建立頁實測

已開啟官方 Manager Account 建立頁：

- URL：`https://ads.google.com/aw/signup/manager`
- 畫面標題：Confirm your business information
- 目前登入：`tim.chen@ewalk.ai`
- 頁面暫列 CID：`756-316-1776`

畫面欄位：

| 欄位 | 目前狀態 |
| --- | --- |
| Account display name | 空白 |
| Primary use of the account | 預設為 `Manage other people's accounts` |
| Billing country | Taiwan |
| Time zone | `(GMT+08:00) Taiwan Time` |
| Currency | `New Taiwan Dollar (TWD NT$)` |
| reCAPTCHA | 需要提姆先生本人處理 |

阿順未填寫、未勾選 reCAPTCHA、未建立帳戶。

建議填寫：

- Account display name：`Ewalk.ai 數位漫步｜Google Ads Manager`
- Primary use：若只管理 Ewalk.ai 自有與客戶帳戶，建議選 `Manage my accounts`；若未來正式管理多客戶廣告帳戶，可維持 `Manage other people's accounts`。

建立前需提姆先生確認，因為 manager account 建立後部分設定無法再修改。

## 2026-06-03 Manager Account 建立結果

提姆先生已在畫面完成 Manager Account 建立。

| 項目 | 結果 |
| --- | --- |
| Manager account 名稱 | `Ewalk.ai 數位漫步｜Google Ads Manager` |
| Manager account CID | `756-316-1776` |
| 登入帳號 | `tim.chen@ewalk.ai` |
| 狀態 | 已建立，可進 Google Ads 後台 |

## 2026-06-03 API Center 申請頁狀態

新 Manager Account 已可進入 API Center，畫面顯示可申請 API 存取權。

需填欄位：

| 欄位 | 建議值 |
| --- | --- |
| API 聯絡電子郵件 | `tim.chen@ewalk.ai` |
| 公司名稱 | `Ewalk.ai 數位漫步有限公司` |
| 公司網址 | `https://ewalk.ai` |
| 公司類型 | `代理商/搜尋引擎行銷 (SEM)` |
| 預定用途 | `用於 Ewalk.ai 內部與客戶授權帳戶的 Google Ads 自動化建稿、PAUSED 草稿建立、預算檢查、關鍵字與廣告素材管理、報表查詢與投放成效監控。所有正式啟用與預算變更需由負責人批准。` |
| 主要營運地點 | 台灣 |
| 條款及細則 | 需提姆先生確認後勾選 |

安全提醒：按下「建立符記」會向 Google 建立 developer token / API 存取權申請，屬於持久權限建立動作。阿順需提姆先生明確批准後才可填寫並送出。

## 2026-06-03 Developer Token 建立結果

提姆先生回報已建立符號，阿順於 API Center 畫面確認 developer token 已出現。

| 項目 | 結果 |
| --- | --- |
| 權杖狀態 | 已建立 |
| 顯示方式 | Google Ads 後台以遮蔽字元顯示 |
| 存取層級 | `Explorer 存取權` |
| 安全處理 | 未點擊查看權杖、未複製、未寫入 Obsidian、未放入任何腳本或環境變數 |
| 下一個阻塞點 | 需將 `728-726-6360` 連結到 Manager Account `756-316-1776`，再做 OAuth / API validateOnly 測試 |

## 2026-06-03 Manager Account 連結進度

提姆先生批准後，阿順已在 Manager Account `756-316-1776` 送出連結既有帳戶要求。

| 項目 | 結果 |
| --- | --- |
| 連結發起端 | `Ewalk.ai 數位漫步｜Google Ads Manager`，CID `756-316-1776` |
| 連結目標 | `EWALK數位漫步｜美業AI行銷服務領航者`，CID `728-726-6360` |
| 要求狀態 | 已送出，目標帳戶「存取權和安全性 > 管理員」可看到待接受要求 |
| 待接受要求內容 | `Ewalk.ai 數位漫步｜Google Ads Manager 756-316-1776`，傳送者 `tim.chen@ewalk.ai`，日期 `2026年6月3日` |
| 目前卡點 | Google Ads 最後確認彈窗的 overlay 高度被算成 `0`，導致「授予存取權」按鈕渲染到畫面上緣，自動點擊未能完成 |
| 人工補點位置 | 目標帳戶 `728-726-6360` > 管理 > 存取權和安全性 > 管理員 > 連結要求 > 接受 > 授予存取權 |
| 安全狀態 | 未啟用任何廣告、未更改預算、未新增付款方式 |

### 2026-06-03 22:12 補充判斷

提姆先生手動嘗試也無法接受。阿順進一步確認：

- Google Ads 中文與英文介面皆可看到連結要求。
- 點擊 `接受 / Accept` 後，第二層確認彈窗實際存在。
- 但彈窗容器 `.pane.modal.visible` 高度被 Google Ads 前端算成 `0`。
- `授予存取權 / Grant access` 按鈕座標落在瀏覽器可視範圍上緣外，因此提姆先生與阿順都無法正常點擊。
- Chrome 畫面顯示該 Google Ads 視窗縮放比例為 `90%`，高度疑似導致 Google Ads overlay 排版錯位。

建議修復順序：

1. 在該 Google Ads 分頁按 `Command + 0`，或點網址列右側的 `90%` 縮放提示並選「重設」，恢復 100%。
2. 重新整理頁面。
3. 改用英文介面網址重試：在原網址後加 `&hl=en`。
4. 若仍錯位，改用 Safari 或 Chrome 無痕視窗登入 `tim.chen@ewalk.ai`，進同一路徑接受。
5. 若 UI 仍無法接受，改走 API direct-access 路線：以 `tim.chen@ewalk.ai` 對 `728-726-6360` 的直接管理權產生 OAuth，先不依賴 MCC 連結。

### 2026-06-03 22:30 實測結果

阿順接手 Chrome 分頁後確認：

- 正確分頁為 `管理員 - EWALK數位漫步｜美業AI行銷服務領航者 - Google Ads`。
- 連結要求仍存在，管理員帳戶為 `Ewalk.ai 數位漫步｜Google Ads Manager 756-316-1776`。
- 點擊 `接受` 後，Google Ads 確實產生第二層確認框。
- 第二層確認框文字為「要將 Ewalk.ai 數位漫步｜Google Ads Manager 的存取權授予這個帳戶嗎？」。
- `授予存取權` 按鈕存在且可用，但座標仍落在瀏覽器畫面上緣外，約為 `y = -17.6`。
- 頁面同時偵測到 `Turn off ad blockers` 提示，廣告阻擋器可能影響 Google Ads 後台彈窗定位。

下一步判斷：

- 技術上可嘗試點擊畫面上緣外露區域完成 `授予存取權`。
- 但此動作會正式授予 Manager Account 存取權，屬於帳戶權限變更，必須由提姆先生於動作前明確批准。
- 若不採用上緣點擊，建議改用 Safari 或 Chrome 無痕視窗，並停用廣告阻擋器後重試。

### 2026-06-03 授權成功後續接

提姆先生回報已成功完成 `728-726-6360` 對 Manager Account `756-316-1776` 的授權。

已完成：

- Manager Account 連結阻塞解除。
- 重新產出三組 Google Ads `PAUSED` dry-run / Editor CSV / API mutate preview。
- 建立 API runner：`Ewalk.ai Brain/腳本/google-ads/google-ads-api-runner.mjs`。
- 建立本機設定工具：`Ewalk.ai Brain/腳本/google-ads/set-google-ads-config.command`。
- `.env.local.example` 已補入 Google Ads API 欄位樣板。

目前阻塞點：

- `.env.local` 尚未有 Google Ads API 欄位。
- 缺少 `GOOGLE_ADS_DEVELOPER_TOKEN` 實際值。
- 缺少 OAuth client ID / secret / refresh token。
- 缺少 `GOOGLE_ADS_GEO_TARGET_CONSTANT` 與 `GOOGLE_ADS_LANGUAGE_CONSTANT`。

安全檢查結果：

```bash
node 'Ewalk.ai Brain/腳本/google-ads/google-ads-api-runner.mjs' check
```

結果：工具可正常列出缺少欄位，且不輸出任何密鑰內容。

### 2026-06-04 API 憑證補齊與續跑檔

阿順接手後已完成 Google Ads API 本機憑證設定，密鑰僅寫入根目錄 `.env.local`，未寫入 Obsidian 文件。

已完成：

- [x] `GOOGLE_ADS_CLIENT_ID` 已寫入 `.env.local`
- [x] `GOOGLE_ADS_CLIENT_SECRET` 已寫入 `.env.local`
- [x] `GOOGLE_ADS_REFRESH_TOKEN` 已透過 Google OAuth 授權取得並寫入 `.env.local`
- [x] `GOOGLE_ADS_DEVELOPER_TOKEN` 已從 Google Ads API Center 讀取並寫入 `.env.local`
- [x] `GOOGLE_ADS_LOGIN_CUSTOMER_ID` 已設定為 Manager Account `756-316-1776`
- [x] `GOOGLE_ADS_CUSTOMER_ID` 已設定為投放帳戶 `728-726-6360`
- [x] API runner 新增 `resolve-constants` 模式，可自動解析臺南市與繁體中文常數
- [x] API runner 新增 `create-paused` 模式，可建立正式 `PAUSED` 草稿
- [x] 建立續跑檔：`Ewalk.ai Brain/腳本/google-ads/run-hansik-google-ads-paused-drafts.command`

本機檢查結果：

```bash
node 'Ewalk.ai Brain/腳本/google-ads/google-ads-api-runner.mjs' check
```

結果：必要憑證皆已存在；尚待 API 連線後自動補入：

- `GOOGLE_ADS_GEO_TARGET_CONSTANT`
- `GOOGLE_ADS_LANGUAGE_CONSTANT`

目前技術阻塞：

- Codex 受控執行環境沒有 DNS 設定，`oauth2.googleapis.com` 與 `googleads.googleapis.com` 皆無法解析。
- 因此無法在此受控 shell 內直接執行 `check-access`、`resolve-constants`、`validate-preview`、`create-paused`。
- Chrome / Google 後台授權流程可用，因此 OAuth 與 developer token 已完成；阻塞只剩本機 API runner 的外網 DNS。

### 2026-06-04 02:17 Google Ads API 啟用

提姆先生於正常 Terminal 續跑後，log 顯示第 2 步 `check-access` 回傳 `403 SERVICE_DISABLED`：

```text
Google Ads API has not been used in project 951177369216 before or it is disabled.
```

阿順已依提姆先生批准進入 Google Cloud Console：

- 專案：`Ewalk-AI-Studio`
- 服務：`Google Ads API`
- 服務名稱：`googleads.googleapis.com`
- 動作：按下 `啟用`
- 結果：Google Cloud Console 顯示狀態 `已啟用`

下一步：

1. 等待 Google API 啟用狀態傳播，通常數分鐘內生效。
2. 重新執行：

```bash
cd '/Users/chenjinting/Desktop/Ewalk.ai 自動化系統'
'Ewalk.ai Brain/腳本/google-ads/run-hansik-google-ads-paused-drafts.command'
```

3. 若 `check-access` 通過，流程會繼續解析地區 / 語言常數與執行 `validateOnly`。
4. 最後看到確認字提示時，才輸入 `CREATE_PAUSED` 建立 PAUSED 草稿。

### 2026-06-04 03:10 validateOnly 欄位修正

提姆先生再次執行續跑檔後，API 前三步已通過：

- `check-access` 成功讀取 `customers/7287266360`
- 帳戶名稱：`EWALK數位漫步｜美業AI行銷服務領航者`
- 幣別：`TWD`
- 時區：`Asia/Taipei`
- 地區常數已寫入：`geoTargetConstants/1012818`（Tainan City）
- 語言常數已寫入：`languageConstants/1018`（Chinese traditional）

第 4 步 `validateOnly` 回傳 `400 INVALID_ARGUMENT`，原因是 preview JSON 使用 `maximizeClicks` 欄位，Google Ads API v22 REST mutate 不接受此欄位。

阿順已修正：

- `Ewalk.ai Brain/腳本/google-ads/prepare-hansik-opening-search-ads.mjs`
- 三組 Campaign bidding 改為 `manualCpc`
- 三組 Ad Group 補上 `cpcBidMicros`
- 重新產出：
  - `2026-06-03_GoogleAds_PAUSED草稿_dry-run.json`
  - `2026-06-03_GoogleAds_Editor匯入草稿.csv`
  - `2026-06-03_GoogleAds_API_mutate_operations_preview.json`

下一步：請在正常 Terminal 重新執行續跑檔。

### 2026-06-04 13:01 validateOnly 第二輪修正

提姆先生重新執行續跑檔後，仍停在第 4 步 `validateOnly`，尚未進入 `CREATE_PAUSED` 建立階段，因此沒有建立任何 Google Ads 草稿。

API 回傳重點：

- `CANNOT_SET_DATE_TO_PAST`：原始 startDate `20260603` 已是過去日期。
- `CANNOT_TARGET_PARTNER_SEARCH_NETWORK`：此帳戶不可開啟 partner search network。
- `contains_eu_political_advertising` 必填。
- 後續 `RESOURCE_NOT_FOUND` 是因 Campaign 建立驗證失敗後，Ad Group / Keyword 參照暫存 Campaign 被連帶判定不存在。

阿順已修正：

- startDate 改為自動取「今日」與原始 startDate 兩者較晚者；本輪為 `20260604`。
- `targetPartnerSearchNetwork` 改為 `false`。
- 補上 `containsEuPoliticalAdvertising: DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING`。
- 重新產出 dry-run / Editor CSV / API mutate preview。

下一步：請在正常 Terminal 再次執行續跑檔。

### 2026-06-04 13:07 建立完成

提姆先生再次執行續跑檔並輸入 `CREATE_PAUSED` 後，Google Ads API 建立成功。

建立回應：

- Log：`2026-06-04_130704_GoogleAds_API續跑.log`
- Response：`2026-06-03_GoogleAds_API_mutate_operations_preview_created-response.json`
- API mode：`create-paused`
- HTTP status：`200`
- API result：`ok: true`

建立數量：

| 類型 | 數量 | 狀態 |
| --- | ---: | --- |
| Campaign Budget | 3 | 已建立 |
| Campaign | 3 | 全部 `PAUSED` |
| Campaign Criterion | 6 | 已建立 |
| Ad Group | 3 | 全部 `PAUSED` |
| Keyword / Ad Group Criterion | 23 | 全部 `PAUSED` |
| Responsive Search Ad | 3 | 全部 `PAUSED` |

Campaign resource：

- `HIH_202606_Search_Brand_Map`：`customers/7287266360/campaigns/23907761963`
- `HIH_202606_Search_Local_KoreanHotpot`：`customers/7287266360/campaigns/23902684203`
- `HIH_202606_Search_Delivery`：`customers/7287266360/campaigns/23912188936`

下一步：

1. 回 Google Ads 後台人工確認三組 Campaign 狀態仍為 `PAUSED`。
2. 檢查地區、文案、網址與每日預算。
3. 未經提姆先生再次批准，不得啟用投放。

### 2026-06-04 18:00 啟用批准與日報規則

提姆先生確認三組 Campaign 人工檢查無誤，並批准今天啟用投放。

阿順已建立：

- 啟用腳本：`Ewalk.ai Brain/腳本/google-ads/enable-hansik-google-ads.command`
- 日報腳本：`Ewalk.ai Brain/腳本/google-ads/report-hansik-google-ads.command`

啟用範圍：

- `HIH_202606_Search_Brand_Map`
- `HIH_202606_Search_Local_KoreanHotpot`
- `HIH_202606_Search_Delivery`

啟用腳本安全邊界：

- 只會把上述三組 Campaign 狀態改為 `ENABLED`
- 不更改預算
- 不更改文案
- 不更改關鍵字
- 不新增素材

日報規則：

- 每天回報 Google Ads 進度。
- 回報指標包含花費、曝光、點擊、CTR、平均 CPC、Campaign 狀態。
- 阿順可提出優化建議。
- 任何預算、文案、關鍵字、地區、啟停等優化動作，仍需提姆先生批准後執行。

### 2026-06-04 19:35 啟用完成

提姆先生執行啟用腳本後，阿順已驗證 Google Ads API 回應。

啟用回應：

- Log：`2026-06-04_193555_GoogleAds_啟用投放.log`
- Response：`2026-06-04_GoogleAds_啟用回應.json`
- API mode：`enable-hansik`
- HTTP status：`200`
- API result：`ok: true`

啟用前狀態：

| Campaign | 啟用前狀態 | 每日預算 |
| --- | --- | ---: |
| `HIH_202606_Search_Brand_Map` | `PAUSED` | NT$43 |
| `HIH_202606_Search_Delivery` | `PAUSED` | NT$29 |
| `HIH_202606_Search_Local_KoreanHotpot` | `PAUSED` | NT$71 |

啟用後狀態：

| Campaign | 啟用後狀態 |
| --- | --- |
| `HIH_202606_Search_Brand_Map` | `ENABLED` |
| `HIH_202606_Search_Delivery` | `ENABLED` |
| `HIH_202606_Search_Local_KoreanHotpot` | `ENABLED` |

本次啟用未更改預算、文案、關鍵字或地區設定。

下一步：

1. 2026-06-05 起每日產出 Google Ads 日報。
2. 先觀察 48-72 小時。
3. 阿順提出優化建議，提姆先生批准後才執行。

續跑方式：

1. 在正常可連外網的 macOS Terminal 執行：

```bash
cd '/Users/chenjinting/Desktop/Ewalk.ai 自動化系統'
'Ewalk.ai Brain/腳本/google-ads/run-hansik-google-ads-paused-drafts.command'
```

2. 續跑檔會依序執行：
   - `check`
   - `check-access`
   - `resolve-constants`
   - `validate-preview`
3. 前四步成功後，終端機會要求輸入 `CREATE_PAUSED`。
4. 只有輸入正確確認字，才會執行 `create-paused` 建立 Google Ads 後台草稿。
5. 程式仍會阻擋任何 `ENABLED` / `ACTIVE` 狀態。

## OAuth 授權路線

1. 使用可操作 Google Ads 帳戶 `728-726-6360` 的 Google 帳號授權。
2. 授權範圍需包含 Google Ads API 操作權限。
3. 取得 refresh token 後，放入本機私密 `.env`。
4. 阿順只讀取環境變數，不將 token 寫入 Obsidian 文件。

## API 建稿順序

1. 將 `728-726-6360` 連結到 manager account `756-316-1776`。
2. 設定 OAuth 授權。
3. 以 GAQL 查詢確認 `728-726-6360` 可存取。
4. 查詢 / 解析：
   - `臺南市` geoTargetConstant
   - `繁體中文（台灣）` languageConstant
5. 將 [[2026-06-03_GoogleAds_API_mutate_operations_preview.json]] 的 unresolved placeholder 替換為正式 resource name。
6. 先以 `validateOnly: true` 打 API 檢查。
7. 若 validateOnly 成功，回報提姆先生。
8. 只有在提姆先生批准後，才可改 `validateOnly: false` 建立正式 `PAUSED` 草稿。
9. 建立後再次查詢，確認所有狀態仍為 `PAUSED`。

## 安全邊界

- 不在 Obsidian 文件保存 developer token、OAuth token、refresh token。
- 不輸入密碼或二階段驗證碼。
- 不新增付款方式。
- 不啟用 `ACTIVE`。
- 不調高預算。
- `validateOnly: false` 前需提姆先生再次批准。

## 阿順判斷

目前最完整的自動化路線已經準備到 API request preview 層級。Manager account 與 developer token 已建立，下一步是將 `728-726-6360` 連結到 `756-316-1776`，再做 OAuth 與 `validateOnly` 測試。真正投放資料已備妥，阻塞點只剩 Google Ads 權限鏈。
