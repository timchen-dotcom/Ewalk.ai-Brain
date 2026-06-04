---
name: ops-meta-page-auto-publish
description: Ewalk.ai Vault skill for setting up and running Meta Facebook Page automated posting for any client. Use for Facebook-only Page automation, Page token validation, post publishing, queue writeback, or performance tracking handoff. If the client needs Facebook plus Instagram sync, 1080x1350 shared visuals, public IG image URLs, or Instagram Graph API publishing, use ops-meta-social-auto-publish instead.
---

# ops-meta-page-auto-publish

## 目的

把韓食日常鍋物驗證成功的 Meta 粉專自動發文流程，複製到每個適合導入的客戶，並為後續 FB / IG 同步發布保留規格。

這個 skill 不是單純發文；它負責讓「內容、視覺、憑證、發布、回寫、追蹤建檔」成為可交付的營運系統。

> 2026-06-03 起，若任務包含 Instagram 同步發布，請優先使用 `Ewalk.ai Brain/08_自動化/skills/ops-meta-social-auto-publish/SKILL.md`。本 skill 保留為 Facebook Page 子流程。

## 必讀文件

- SOP：`Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文串接SOP.md`
- 客戶啟用清單：`Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文客戶啟用清單.md`
- Flow：`Ewalk.ai Brain/08_自動化/營運Flows/Meta粉專全自動發文Flow.md`
- 成效追蹤：`Ewalk.ai Brain/13_SOP流程/社群與廣告成效追蹤啟動SOP.md`
- 工具 README：`Ewalk.ai Brain/腳本/meta-facebook/README.md`

## 啟動條件

任一條件成立就使用本 skill：

- 客戶要求 Facebook 粉專固定發文、排程發文或自動發文。
- 客戶已有每週內容表、月內容表或固定品牌內容支柱。
- 發文素材可以穩定產出，且最終視覺可由 GPT Image 2 製作。
- 客戶願意完成 Meta Business / Page / App / System User 權限設定。
- 阿順需要把某個客戶從手動發文升級成半自動或全自動。

## 角色分工

| 角色 | 負責 |
| --- | --- |
| 阿順 | 判斷導入等級、控管權限、批准低風險自動發布規則、回報提姆先生 |
| 客戶成功經理 | 盤點客戶粉專、Business、素材、內容頻率與待補資料 |
| 社群主編 | 建立內容排程、純 caption 檔、CTA 與風險標記 |
| 設計企劃 | 建立 GPT Image 2 prompt，確認最終視覺不是產品原圖直接發布 |
| 專案助理 | 維護發文佇列、檔案命名、日期與狀態欄位 |
| 成效追蹤員 | 發布後在成效追蹤總表建檔 |
| 數據分析師 | 使用追蹤紀錄做週報、月報與洞察 |

## 標準客戶資料結構

客戶導入前，先建立或確認：

```text
Ewalk.ai Brain/01_客戶/{客戶名稱}/
  01_品牌資料/
  02_活動與內容/
  04_素材/
    產品圖/
    Generated/
```

至少需要：

- `02_活動與內容/{起始日}_社群排程.md`
- `02_活動與內容/Meta自動發文佇列.md`
- `02_活動與內容/{日期}_FB貼文_{主題}_caption.md`
- `02_活動與內容/{日期}_GPTImage2_{主題}_prompt.txt`
- `04_素材/Generated/{日期}_{主題}_GPTImage2.png`
- 若要同步 IG，另準備 1080x1350 JPEG 與公開圖片 URL。

## 排程表欄位

建議使用固定欄位：

| 日期 | 主題 | 品牌訊息 | 參考素材 | CTA | 狀態 |
| --- | --- | --- | --- | --- | --- |

可發布狀態：

- `GPT Image 2 視覺完成，待手動發布`
- `GPT Image 2 視覺完成，待 Meta System User token 完成後發布`
- `GPT Image 2 視覺完成，待 Meta token 更新後發布`
- `已批准待正式 Meta System User token 完成後發布`
- `已批准待發布`

已完成狀態必須包含：

- `已自動發布`
- `Meta Post ID`

## Meta 憑證規則

正式自動發布只接受：

- Meta Business System User token
- 或後端 OAuth 長期憑證流程
- 並轉成目標粉專 Page token

禁止作為正式發布來源：

- Graph API Explorer 短期 token
- 使用者登入測試 token
- 貼在聊天、Obsidian、截圖或公開 repo 的 token

正式 token 只能放在本機安全設定檔或後端密鑰管理，不得寫進文件。

## 發布流程

1. 讀取客戶排程表。
2. 找出日期小於或等於今天、狀態可發布、且尚未發布的第一篇。
3. 檢查純 caption 檔存在，且未混入內部檢查、GPT Image 2 指令或發布紀錄。
4. 檢查 GPT Image 2 最終圖存在；不得用產品原圖替代。
5. 若客戶要 FB / IG 共用，確認最終圖為 1080x1350（4:5）。
6. 執行 dry-run，確認 Page ID、文案、圖片與主題。
7. 若 token 可讀取粉專，執行正式發布。
8. 發布後回寫排程狀態、Meta Post ID、Photo ID 與貼文連結。
9. 追加 `Meta自動發文佇列.md` 發布紀錄。
10. 請成效追蹤員在 `Ewalk.ai Brain/04_報表/成效追蹤總表.md` 建檔。

## IG 同步發布條件

IG 不能只靠 Facebook Page 發文 endpoint 自動同步。必須另外確認：

- IG 是 Professional / Business account。
- IG 已連結到對應 Facebook Page。
- App / System User 具備 `instagram_basic` 與 `instagram_content_publish`。
- 已取得 `ig_user_id`。
- 圖片可由公開 URL 讀取；本機檔案路徑不能直接給 IG 圖片發文 API。
- 圖片建議輸出為 1080x1350 JPEG，作為 FB / IG 動態共用格式。

## 工具使用原則

韓食日常鍋物目前使用：

```text
Ewalk.ai Brain/腳本/meta-facebook/publish-hansik-schedule-next.mjs
```

導入其他客戶時，不要直接複製韓食日常鍋物硬編碼版本。先依客戶啟用清單建立客戶設定，再將工具升級為可讀取客戶設定的通用發布器，或建立該客戶的專用安全包。

每次正式發布前，至少要通過：

```text
check-page.mjs
publish-*-schedule-next.mjs --dry-run
```

## 低風險可自動發布

- 品牌日常內容
- 菜色、產品、服務介紹
- 營業時間提醒
- 固定系列內容
- 已批准活動提醒
- 客戶已確認過的素材與文案模板

## 必須回提姆先生批准

- 優惠價格、活動條款、期限
- 法規、醫療、財務、政治敏感內容
- 客訴、道歉、爭議聲明
- 廣告預算、付費推廣設定
- 新客戶第一次正式發文
- token、App Secret、Business 管理權限變更

## 驗收標準

- 客戶粉專可由 `check-page.mjs` 成功讀取。
- 第一篇貼文完成 dry-run，且未呼叫 Meta API。
- 正式發布成功後取得 Meta Post ID。
- 排程表與佇列已回寫。
- 成效追蹤總表已新增任務。
- token 未出現在聊天、Obsidian、截圖或公開 repo。
- 下一次 dry-run 會抓到下一篇，不會重複發布同一篇。
