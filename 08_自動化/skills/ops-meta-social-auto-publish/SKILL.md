---
name: ops-meta-social-auto-publish
description: Ewalk.ai Vault skill for setting up and operating client Facebook Page plus Instagram automated social publishing. Use when any client needs FB/IG scheduled posting, Meta Business System User setup, Page and IG token validation, GPT Image 2 final visuals, 1080x1350 cross-platform assets, public IG image URLs, Graph API publishing, queue writeback, or performance tracking handoff.
---

# ops-meta-social-auto-publish

## 目的

把韓食日常鍋物已驗證成功的 Facebook / Instagram 自動發文流程，沉澱成所有客戶可複製的營運 skill。

這個 skill 處理整條鏈：

```text
客戶資料盤點 → 內容排程 → GPT Image 2 最終視覺 → FB/IG 發布前檢查 → Meta API 發布 → 回寫 → 成效追蹤建檔
```

它不是單篇代發工具；它是 Ewalk.ai 客戶社群自動化的標準能力包。

## 樣板驗證

樣板客戶：韓食日常鍋物

已驗證里程碑：

- 2026-06-02：Facebook Page 圖片貼文自動發布成功。
- 2026-06-03：Instagram Graph API 圖片貼文正式發布成功。
- 已完成 System User token、Page token、IG token、公開圖片 URL、排程回寫、佇列紀錄與成效追蹤建檔。

## 必讀文件

- SOP：`Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文串接SOP.md`
- Flow：`Ewalk.ai Brain/08_自動化/營運Flows/Meta粉專全自動發文Flow.md`
- 客戶啟用清單：`Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文客戶啟用清單.md`
- Prompt：`Ewalk.ai Brain/11_Prompt資料庫/Meta粉專自動發文Prompt.md`
- 成效追蹤：`Ewalk.ai Brain/13_SOP流程/社群與廣告成效追蹤啟動SOP.md`
- 工具說明：`Ewalk.ai Brain/腳本/meta-facebook/README.md`

## 何時使用

任一條件成立就啟用：

- 客戶要固定發 Facebook 或 Instagram。
- 客戶已有內容月曆、一週三更、每兩天發文或活動檔期。
- 客戶需要「文案 + AI 圖 + 自動發布 + 成效追蹤」整套交付。
- 客戶已授權 Ewalk.ai 管理粉專或 IG 商業帳號。
- 阿順要把手動發文升級成半自動、全自動或跨平台同步。

## 員工分工

| 員工 | 責任 |
| --- | --- |
| 阿順 | 判斷導入階段、批准低風險自動化規則、處理權限風險、回報提姆先生 |
| 客戶成功經理 | 盤點 Page、IG、Business、素材、內容頻率、授權缺口 |
| 社群主編 | 建立內容排程、純 caption、CTA、平台差異與風險標記 |
| 設計企劃 | 產出 GPT Image 2 prompt，確認最終視覺為 1080x1350 且非產品原圖直發 |
| 社群自動化發文員 | 執行 dry-run、正式發布、回寫排程與佇列 |
| 專案助理 | 維護檔案命名、狀態欄位、待辦清單與客戶資料夾 |
| 成效追蹤員 | 發布後在成效追蹤總表建檔 |
| 數據分析師 | 讀取 FB / IG 成效資料，整理週報、月報與洞察 |

## 客戶資料結構

導入前確認：

```text
Ewalk.ai Brain/01_客戶/{客戶名稱}/
  01_品牌資料/
  02_活動與內容/
    {起始日}_社群排程.md
    Meta自動發文佇列.md
    {日期}_FB貼文_{主題}_caption.md
    {日期}_GPTImage2_{主題}_prompt.txt
  04_素材/
    產品圖/
    Generated/
    Generated/IGReady/
```

若缺資料，先交客戶成功經理與專案助理，不得硬發。

## 共用內容規格

- FB / IG feed 共用主圖：`1080x1350`，比例 `4:5`。
- 最終視覺必須由 GPT Image 2 或已批准設計流程產出。
- 產品圖只能當參考素材，不可直接當最終貼文圖。
- caption 檔必須只有對外文案，不得混入內部檢查、prompt、token、發布紀錄。
- IG API 圖片需為公開 HTTPS URL；本機路徑不能發布到 IG。
- PNG 可作內部主檔，IG 發布建議使用 JPEG。

## 權限與憑證

正式自動化只接受：

- Meta Business System User token
- 或後端 OAuth 長期憑證流程
- Page token 與 IG 發布 token 必須存在安全環境檔或密鑰管理

禁止：

- 用 Graph API Explorer 短期 token 做長期排程。
- 把 token、App Secret、Page token 寫入 Obsidian、聊天、截圖或公開 repo。
- 在權限未驗證時反覆呼叫正式發布 API。

Facebook 必要權限：

- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- 視 Business 管理情境補 `business_management`

Instagram 必要條件：

- IG 是 Professional / Business account。
- IG 已連結正確 Facebook Page。
- Meta Business Suite 看得到 IG 資產。
- System User 已被指派 IG 資產。
- App / token 具備 `instagram_basic`、`instagram_content_publish`。
- 已取得 `ig_user_id`。

## 標準流程

1. 讀取客戶排程表，找日期小於或等於今天且尚未發布的第一篇。
2. 確認文案、CTA、風險等級、平台設定。
3. 確認 GPT Image 2 最終圖完成，尺寸為 1080x1350。
4. FB 發布前執行 Page 檢查與 dry-run。
5. IG 發布前執行 IG 檢查、公開圖片 URL 檢查與 dry-run。
6. 若屬第一次正式發布、新客戶、優惠、價格、活動條款或高風險內容，先取得提姆先生批准。
7. 正式發布 FB，取得 Meta Photo ID / Post ID / permalink。
8. 正式發布 IG，建立 media container，確認可發布，再呼叫 `media_publish`，取得 IG Media ID / permalink。
9. 回寫排程表與 `Meta自動發文佇列.md`。
10. 請成效追蹤員在 `Ewalk.ai Brain/04_報表/成效追蹤總表.md` 分平台建檔。
11. 下一輪 dry-run 必須抓到下一篇，不得重複發布已完成項目。

## 工具路由

先檢查：

```text
Ewalk.ai Brain/腳本/meta-facebook/check-page.mjs
Ewalk.ai Brain/腳本/meta-facebook/check-instagram.mjs
```

Facebook 發布：

```text
Ewalk.ai Brain/腳本/meta-facebook/publish-page-post.mjs
Ewalk.ai Brain/腳本/meta-facebook/publish-hansik-schedule-next.mjs
```

Instagram 發布：

```text
Ewalk.ai Brain/腳本/meta-facebook/prepare-instagram-assets.mjs
Ewalk.ai Brain/腳本/meta-facebook/publish-instagram-photo.mjs
```

韓食日常鍋物的 `publish-hansik-schedule-next.mjs` 是樣板客戶專用工具。導入新客戶時，不要直接硬改韓食設定；先建立客戶啟用清單與設定檔，再抽通用發布器或建立新客戶專用安全包。

## 可自動發布範圍

低風險、可在已批准規則內自動發布：

- 品牌日常內容
- 菜色、產品、服務介紹
- 營業時間提醒
- 店內氛圍
- 已批准活動提醒
- 固定系列內容

必須回提姆先生批准：

- 新客戶第一篇正式自動發布
- 優惠價格、活動條款、期限
- 法規、醫療、財務、政治敏感內容
- 客訴、道歉、爭議聲明
- 廣告預算、付費推廣設定
- Meta Business、App、System User、token 權限變更

## 回寫格式

排程表狀態需寫清楚平台：

```text
FB 已自動發布（Meta Post ID: ...）；IG 已正式發布（IG Media ID: ...）
FB 已自動發布；IG 待公開圖片 URL
IG 已正式發布；FB 待發布
GPT Image 2 視覺完成，待發布
```

佇列紀錄至少包含：

- 任務 ID
- 客戶
- 平台
- 貼文類型
- 排程日期
- 發布時間
- 審核人
- 最終批准
- 文案檔案
- 素材檔案或素材 URL
- FB Photo ID / Post ID 或 IG Container ID / Media ID
- 貼文連結
- 風險判斷

成效追蹤總表至少包含：

- 任務 ID
- 客戶
- 平台
- 類型
- 發布 / 上線時間
- 主要 ID
- 追蹤節點：1h / 24h / 72h / 7d
- 交接對象：數據分析師

## 驗收標準

- Page 可由 API 正確讀取。
- IG 可由 API 回傳 `ig_user_id`。
- FB dry-run 與 IG dry-run 都能通過。
- 正式發布時只使用純 caption 檔與最終視覺。
- IG 圖片 URL 為 Production 公開 HTTPS URL。
- 發布後取得 FB Post ID 或 IG Media ID。
- 排程、佇列、成效追蹤總表都已回寫。
- token 未出現在任何文件、聊天、截圖或公開 repo。
- 下一篇排程不會被已發布貼文卡住，也不會重複發同一篇。
