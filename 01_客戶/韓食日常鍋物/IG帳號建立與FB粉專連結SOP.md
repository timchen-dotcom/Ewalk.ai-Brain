# 韓食日常鍋物 IG 帳號建立與 FB 粉專連結 SOP

建立日期：2026-05-15
狀態：IG 帳號資料已提供；Meta Business Suite 畫面已確認，API 待同步 / 待 System User IG 資產權限確認
客戶：韓食日常鍋物
負責：阿順

## 目的

建立韓食日常鍋物 Instagram 商業帳號，並連結到既有 Facebook 粉專，讓後續 Meta API 能支援 FB / IG 內容管理、排程與成效追蹤。

## 已知資料

- FB 粉專名稱：韓食日常鍋物
- FB 粉專連結：`https://www.facebook.com/profile.php?id=61589429556499`
- Page ID：`1082884688247950`
- Business Portfolio：walk數位漫步
- 粉專管理員：Ewalk數位漫步
- IG 帳號網址：`https://www.instagram.com/hansik.hotpot?igsh=bWlodW1hbjQ2cm9k&utm_source=qr`
- IG 使用者名稱：`hansik.hotpot`
- IG 帳號狀態：已切換商業帳號
- FB 粉專連結狀態：提姆先生回報已連結韓食日常鍋物 FB 粉專
- Meta Business Suite：提姆先生回報已看得到 IG 資產

## 建議帳號設定

| 項目 | 建議 |
| --- | --- |
| IG 帳號類型 | 商業帳號 Business |
| 類別 | 餐廳、韓式餐廳、火鍋店，依 IG 可選項目為準 |
| 帳號名稱 | 韓食日常鍋物 |
| 使用者名稱 | 優先使用 `hansik_daily`、`hansikilsang`、`hansik.hotpot` 類似名稱 |
| 連結粉專 | 韓食日常鍋物 FB 粉專 |

## 執行步驟

### 1. 建立 IG 帳號

1. 打開 Instagram App。
2. 選擇建立新帳號。
3. 使用公司可管理的 Email 或手機建立，不建議綁私人用途資料。
4. 設定帳號名稱：韓食日常鍋物。
5. 設定使用者名稱。
6. 完成基本註冊。

## 2. 切換成專業帳號

1. 進入 IG 個人檔案。
2. 右上角選單。
3. 進入設定與活動。
4. 找到「帳號類型和工具」或類似選項。
5. 選擇「切換為專業帳號」。
6. 類型選「商業」。
7. 類別選餐飲相關類別。
8. 完成專業帳號設定。

## 3. 連結 FB 粉專

官方建議路徑：

1. 進入 IG 個人檔案。
2. 點「編輯個人檔案」。
3. 在「公開商家資訊」區塊選「粉絲專頁 / Page」。
4. 點「繼續」。
5. 登入 Facebook。
6. 選擇「韓食日常鍋物」FB 粉專。
7. 按「連結 / Connect」。

如果看不到「韓食日常鍋物」粉專，可能原因：

- 登入的 Facebook 帳號沒有該粉專權限。
- IG 尚未切換成專業帳號。
- 粉專在 Business Portfolio 權限未開給目前登入帳號。
- Meta 需要重新登入或切換帳號。

## 4. 回到 Meta Business Suite 確認

1. 打開 Meta Business Suite。
2. 進入 `walk數位漫步` Business Portfolio。
3. 到「商家資產」或「已連結資產」。
4. 確認韓食日常鍋物 FB 粉專下方有連到 IG 帳號。
5. 確認 IG 帳號可被 Ewalk數位漫步管理。

## 5. 回報給阿順

完成後，請補給阿順：

```md
1. IG 帳號網址：已提供，https://www.instagram.com/hansik.hotpot?igsh=bWlodW1hbjQ2cm9k&utm_source=qr
2. IG 使用者名稱：已提供，hansik.hotpot
3. 是否已切換商業帳號：是
4. 是否已連結韓食日常鍋物 FB 粉專：是
5. Meta Business Suite 是否看得到 IG 資產：是
```

## 6. API 驗證

完成 IG 帳號與 FB 粉專連結後，請阿順執行：

```sh
node "Ewalk.ai Brain/腳本/meta-facebook/check-instagram.mjs"
```

成功時必須看到：

- IG User ID
- IG 使用者名稱
- 狀態：已偵測到 Instagram 商業 / 專業帳號

若仍顯示「尚未偵測到」，代表 IG 尚未正確連到韓食日常鍋物 Page，或 Meta Business 權限尚未同步完成。

2026-06-03 API 檢查結果：

```text
Graph API 已可讀取韓食日常鍋物 Page。
但 Page 欄位尚未回傳 instagram_business_account / connected_instagram_account / instagram_accounts。
判斷：Meta 畫面連結已完成，但 API 尚未同步，或 System User / App 尚未取得 IG 資產與 IG 發布權限。
```

## 注意事項

- 不要把 IG 密碼貼到聊天紀錄。
- 不要把驗證碼貼到 Obsidian。
- 不要把 Meta token、App Secret、Page token 貼出來。
- 建議公司保存登入資料時，使用正式密碼管理工具。
- 若未來要 API 發 IG，必須使用 IG 專業帳號，並連到 Facebook Page。

## 簡訊驗證碼收不到時

狀態範例：

```text
IG 建立卡關：簡訊驗證碼未收到，因短時間請求太多，需等待 24 小時後再試。
```

處理原則：

1. 停止重複點擊重新傳送，等待至少 24 小時。
2. 下一次重試時，確認手機號碼格式使用台灣國碼：`+886`，手機號碼開頭的 `0` 要拿掉。
3. 關閉 VPN，使用穩定網路與同一支手機操作，避免 Meta 判定異常。
4. 確認手機沒有封鎖陌生簡訊、簡訊過濾 App、垃圾訊息過濾或雙 SIM 收訊問題。
5. 若仍收不到，聯絡電信商確認是否阻擋國際簡訊、短碼簡訊或 A2P 驗證簡訊。
6. 若 IG 提供 Email 驗證，優先使用公司 Email 完成註冊。
7. 若同一門號持續失敗，改用另一個可長期由公司管理的台灣手機門號。

Ewalk.ai 實務建議：

- 不因 IG 卡關停止整個 Meta 發文系統。
- 第一階段先做 FB 粉專自動發文驗證。
- IG 串接排到第二階段，等帳號建立與粉專連結完成後再接入。

不可做：

- 不要一天內一直按重新發送。
- 不要使用來路不明的接碼平台。
- 不要使用無法長期由公司管理的私人臨時門號。
- 不要把驗證碼或登入資料寫進 Obsidian。

## 官方參考

- Instagram professional accounts 說明：`https://www.facebook.com/help/instagram/138925576505882`
- 連結 Facebook Page 說明：`https://www.facebook.com/help/570895513091465`
- Instagram 與 Facebook Page 連結後可使用的功能：`https://www.facebook.com/help/instagram/402748553849926`
- Facebook 未收到簡訊驗證碼說明：`https://www.facebook.com/help/163155247081024/`
- Facebook 使用 Email 替代確認手機號碼說明：`https://www.facebook.com/help/verify`
- Instagram 使用驗證器 App 說明：`https://www.facebook.com/help/1582474155197965/`
