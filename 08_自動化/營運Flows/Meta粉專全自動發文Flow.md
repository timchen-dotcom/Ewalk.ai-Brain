# Meta 粉專全自動發文 Flow

建立日期：2026-05-15
狀態：Facebook / Instagram 自動發布首發皆已驗證
樣板客戶：韓食日常鍋物
主管：阿順
最終決策者：提姆先生

## 觸發條件

- 客戶需要 Facebook 粉專固定發文
- 客戶需要 Instagram feed 固定發文或與 Facebook 同步
- 內容已進入月內容表
- 發文時間已排定
- 粉專已完成 Meta API 串接

## Skill 入口

此 Flow 的可複製技能入口：

- `Ewalk.ai Brain/08_自動化/skills/ops-meta-social-auto-publish/SKILL.md`
- `Ewalk.ai Brain/08_自動化/skills/ops-meta-page-auto-publish/SKILL.md`
- `Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文客戶啟用清單.md`
- `Ewalk.ai Brain/11_Prompt資料庫/Meta粉專自動發文Prompt.md`

任何新客戶要導入 Meta 社群自動發文時，先套用客戶啟用清單，不要直接複製韓食日常鍋物的硬編碼發布器。若只做 Facebook，使用 `ops-meta-page-auto-publish`；若包含 Instagram 或 FB / IG 共用素材，使用 `ops-meta-social-auto-publish`。

## 前置檢查

開始發文系統前，阿順要先確認 Meta App 權限頁下方「需存取權驗證」表格可看到 Pages API 必要權限：

- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`

若上方搜尋框找不到，不代表 App 類型錯誤；要到下方搜尋框再查一次。確認權限可見後，再進入 token 測試。

若粉專屬於 Meta Business Portfolio，`me/accounts` 可能不會只靠 Pages 權限回傳完整粉專清單。遇到粉專在 Business Suite 看得到、但 Graph API 看不到時，補測：

- `business_management`
- `me/businesses?fields=id,name`
- `{business-id}/owned_pages?fields=id,name`
- `me/assigned_pages?fields=id,name,tasks`

這類測試仍只能使用短期 token，不得把 token 寫入 Obsidian 或貼回對話。

## 啟動角色

- 社群主編
- 設計企劃
- 專案助理
- 數據分析師
- 阿順

## 流程

### 1. 內容進入佇列

社群主編建立貼文草稿：

- 文案
- CTA
- 發文類型
- 發布時間
- 對應素材

### 2. 視覺與素材確認

設計企劃檢查：

- 圖片尺寸
- 品牌一致性
- 是否有錯字
- 是否違反自動發文規則
- 若要 FB / IG 共用，最終圖使用 1080x1350
- 若要 IG API 發布，需準備 JPEG 與公開 HTTPS 圖片 URL

### 3. 發文資格檢查

阿順檢查：

- 是否屬於低風險內容
- 是否需要提姆先生批准
- 是否已有相同內容發布過
- 是否缺少素材或連結

### 4. 發文執行

後端服務：

- 從安全環境讀取 Page access token
- 呼叫 Meta Graph API
- 發布或排程貼文
- 回寫 post id 與發布狀態

第一版本機工具：

- `腳本/meta-facebook/check-page.mjs`：先確認 token 可讀取目標粉專。
- `腳本/meta-facebook/publish-page-post.mjs --dry-run`：先確認將要發布的內容。
- `腳本/meta-facebook/publish-page-post.mjs --publish`：只在提姆先生批准後使用。
- `腳本/meta-facebook/publish-hansik-schedule-next.mjs`：韓食日常鍋物第一版排程發布器，會讀取排程表、抓第一篇到期且已完成素材的貼文，發布後回寫排程與佇列。
- `腳本/meta-facebook/check-instagram.mjs`：確認 Facebook Page 已連結 IG 商業 / 專業帳號。
- `腳本/meta-facebook/prepare-instagram-assets.mjs`：準備 1080x1350 IGReady JPEG。
- `腳本/meta-facebook/publish-instagram-photo.mjs`：執行 IG 圖片貼文 dry-run 與正式發布。

### 5. 成效回收

數據分析師：

- 24 小時回收第一次互動
- 72 小時回收第二次互動
- 每週整理內容表現

## 狀態欄位

```text
草稿
待素材
待阿順檢查
待提姆先生批准
已批准排程
已自動發布
發文失敗_待人工處理
已回收成效
```

## 權限規則

可以自動發布：

- 已批准的菜色介紹
- 日常營業提醒
- 店內氛圍
- 固定活動提醒

需要提姆先生批准：

- 優惠價格
- 活動規則
- 品牌聲明
- 客訴或負評處理
- 付費推廣或廣告預算

## 輸出紀錄

每次發布後要記錄：

- 任務 ID
- 發布平台
- 發布時間
- 發文內容
- 素材位置
- Meta post id
- IG media id
- 發布狀態
- 錯誤訊息
- 24 / 72 小時成效

## 驗收標準

- Meta App 權限頁可看到 Pages API 發文權限
- Business Portfolio 管理的粉專可被 API 找到
- `publish-hansik-schedule-next.mjs --dry-run` 能抓到第一篇到期且素材完成的貼文
- Meta System User token 完成後，能成功發布一則低風險測試貼文
- IG 可取得 `ig_user_id` 並完成一則正式圖片貼文發布
- 能避免重複發文
- token 未寫入 Obsidian
- 發文失敗能通知阿順
- 發文紀錄能回寫到客戶資料夾

## 2026-06-02 實作狀態

- 韓食日常鍋物已完成第一版排程發布器：`Ewalk.ai Brain/腳本/meta-facebook/publish-hansik-schedule-next.mjs`。
- 發布器會自動讀取排程、使用純 caption 檔與 GPT Image 2 最終圖、發布圖片貼文，並於成功後回寫排程與佇列。
- 目前 dry-run 已通過，第一篇待發布內容為 `2026-05-18 馬鈴薯排骨湯`。
- Meta Business System User、粉專資產與應用程式資產已設定完成。
- 當日卡點為 Meta 帳號確認碼驗證；此卡點已於後續設定完成。

## 2026-06-03 實作狀態

- 韓食日常鍋物 IG `hansik.hotpot` 已完成 Business / Page / System User / token 串接。
- `check-instagram.mjs` 已成功取得 IG User ID。
- 1080x1350 IGReady JPEG 與 Production 公開圖片 URL 流程已完成。
- `publish-instagram-photo.mjs --dry-run` 已通過。
- 提姆先生批准後，第一篇 IG 圖片貼文正式發布成功。
- 排程、佇列與成效追蹤已完成分平台回寫。
