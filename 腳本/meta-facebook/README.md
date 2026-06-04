# Meta Facebook 發文工具

用途：讓 Ewalk.ai 以安全、可控的方式測試 Facebook Page 自動發文。第一個樣板客戶是韓食日常鍋物。

## 安全原則

- Access Token、Page Access Token、App Secret 不可寫進 Obsidian 文件、聊天紀錄或公開 repo。
- `.env.local` 已加入 `.gitignore`，只用來放本機測試用環境變數。
- `publish-page-post.mjs` 預設只做 dry-run，不會真的發文。
- 正式發文必須同時提供 `--publish`、`--approved-by "提姆先生"`、`--confirm-page-id`。
- 發文成功後只記錄 Meta Post ID，不記錄 token。

## 設定檔

參考 `.env.example`，正式本機設定放在同資料夾的 `.env.local`。

必要欄位：

```env
META_GRAPH_VERSION=v25.0
META_PAGE_ID=1082884688247950
META_PAGE_ACCESS_TOKEN=page_access_token_goes_here
```

較安全省事的做法：

```sh
./"Ewalk.ai Brain/腳本/meta-facebook/set-page-token.command"
```

終端機會要求貼上 Page access token，輸入時畫面不會顯示，完成後會自動寫入 `.env.local`。

如果不小心放到 User token，可以用本機工具轉成韓食日常鍋物的 Page token：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/resolve-page-token.mjs"
```

這支工具只會回報身分與粉專名稱，不會顯示 token 明文。

## 檢查粉專

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/check-page.mjs"
```

成功時會回報：

- Graph API 版本
- 粉專名稱
- Page ID

## 發文 dry-run

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/publish-page-post.mjs" \
  --dry-run \
  --message "韓食日常鍋物自動發文系統測試中。"
```

dry-run 不需要 token，不會呼叫 Meta API。

## 正式發布文字貼文

正式發布前必須先在對話中取得提姆先生批准，確認粉專、文案與風險。

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/publish-page-post.mjs" \
  --publish \
  --approved-by "提姆先生" \
  --confirm-page-id "1082884688247950" \
  --message-file "Ewalk.ai Brain/01_客戶/韓食日常鍋物/02_活動與內容/Meta測試貼文_2026-05-15.md"
```

## 韓食日常鍋物自動排程發布

`publish-hansik-schedule-next.mjs` 會讀取韓食日常鍋物的每兩天社群排程，找出第一篇日期已到、文案與 GPT Image 2 圖片完成、尚未發布的貼文，發布成 Facebook 圖片貼文，並回寫排程與 `Meta自動發文佇列.md`。

先測試：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/publish-hansik-schedule-next.mjs" --dry-run
```

正式發布下一篇到期貼文：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/publish-hansik-schedule-next.mjs" \
  --publish \
  --approved-by "提姆先生" \
  --confirm-page-id "1082884688247950"
```

雙擊或排程可用：

```sh
"Ewalk.ai Brain/腳本/meta-facebook/publish-hansik-schedule-next.command"
```

注意：這支工具只能使用純 caption 檔與 GPT Image 2 最終圖，不會拿草稿檔或產品原圖發布。

## 後續擴充

- 排程貼文：新增排程時間欄位與發文佇列讀取器。
- 發文紀錄：發布後回寫任務 ID、Meta Post ID、發布時間與狀態。
- 成效回收：24 小時與 72 小時讀取互動數據。

## Meta 廣告自動建稿準備

廣告投放與粉專發文分開控管。粉專發文使用 `META_PAGE_ACCESS_TOKEN`；Meta 廣告建稿需另外設定具備 `ads_management` 的 `META_ADS_ACCESS_TOKEN` 與 `META_AD_ACCOUNT_ID`。

安全設定廣告自動化資料：

```sh
"Ewalk.ai Brain/腳本/meta-facebook/set-ads-config.command"
```

這支指令會更新 `.env.local`，其中 Ads token 輸入時不會顯示在畫面上。可填入：

- Meta 廣告帳號 ID
- Meta Ads access token
- 韓食日常店址經緯度
- Google 商家導航連結
- Uber Eats / Foodpanda 店家頁
- 粉專或私訊導流連結

檢查廣告帳號：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/check-ad-account.mjs"
```

韓食日常鍋物 2026 年 6 月開幕慶 Meta 廣告 dry-run：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/prepare-hansik-opening-ads.mjs"
```

dry-run 會讀取 Meta 建稿表、素材、預算與文案，輸出：

```text
Ewalk.ai Brain/01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動/2026-06-03_Meta廣告全自動建稿_dry-run.json
```

正式建立草稿前，所有 live blockers 都必須清空。建立時仍一律使用 `PAUSED`，不可直接啟用：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/prepare-hansik-opening-ads.mjs" \
  --create-paused \
  --approved-by "提姆先生" \
  --confirm-ad-account-id "act_你的廣告帳號ID"
```

注意：這只會建立 PAUSED 草稿。從 `PAUSED` 改成 `ACTIVE` 需提姆先生另行批准，不得由系統自動啟用。

## Instagram 同步發布準備

IG 不會直接跟 Facebook `/{page-id}/photos` 同步。必須先確認粉專已連結 Instagram 商業 / 專業帳號：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/check-instagram.mjs"
```

若檢查成功，會回報 IG User ID。正式 IG 發布仍需要：

- 具備 `instagram_content_publish` 權限的 token，只能放在 `.env.local` 的 `META_IG_ACCESS_TOKEN`
- 1080x1350 JPEG
- Meta 可公開讀取的 HTTPS 圖片 URL

IG 圖片發布 dry-run：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/publish-instagram-photo.mjs" \
  --dry-run \
  --ig-user-id "<IG_USER_ID>" \
  --image-url "https://example.com/1080x1350.jpg" \
  --caption-file "Ewalk.ai Brain/01_客戶/韓食日常鍋物/02_活動與內容/2026-06-03_FB貼文_豬肉湯飯_caption.md"
```

正式發布前需提姆先生批准，並加上：

```sh
--publish --approved-by "提姆先生"
```

### 準備 1080x1350 IGReady 圖片

把韓食日常鍋物 `Generated` 裡的 GPT Image 2 PNG 另存為 1080x1350 JPEG：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/prepare-instagram-assets.mjs"
```

輸出位置：

```text
Ewalk.ai Brain/01_客戶/韓食日常鍋物/04_素材/Generated/IGReady
```

這支工具只處理圖片尺寸與 JPEG 輸出，不會上傳公開 URL，也不會呼叫 Meta API。

### 韓食日常鍋物公開圖片 URL

韓食日常鍋物已建立 Vercel Production 公開素材站：

```text
https://hansik-hotpot-ig-assets.vercel.app
```

正式 IG API 請使用 Production URL，例如：

```text
https://hansik-hotpot-ig-assets.vercel.app/assets/2026-06-03-pork-soup-rice.jpg
```

不要使用 Vercel Preview URL，Preview 可能被登入保護擋住，Meta 會讀不到圖片。

對照清單：

```text
Ewalk.ai Brain/01_客戶/韓食日常鍋物/04_素材/Generated/IGReady/2026-06-03_IG公開圖片URL清單.md
```
