# Firebase Command Center 更新 SOP

建立日期：2026-05-23  
主管：阿順  
最終決策者：提姆先生  
樣板客戶：韓食日常鍋物  
狀態：已建立；本機 dry-run 可執行；韓食樣板已完成正式 Firestore 寫入與回查

## 目的

把客戶的社群發文、審核狀態、已發布紀錄與成效追蹤任務，整理成 Ewalk.ai Command Center 可以查看的資料。

第一階段先做「安全只讀管理頁」，讓阿順能每天看到：

- 哪些內容已發布
- 哪些內容已批准但還沒發
- 哪些貼文需要回收 24 / 72 小時成效
- 哪些資料缺素材、缺連結或缺批准

## 使用時機

符合任一條件就使用：

- 客戶開始使用 Meta 自動發文流程
- 阿順需要檢查本週內容佇列
- 成效追蹤員需要建立貼文追蹤任務
- 提姆先生要快速看某個客戶目前進度
- 要把 Obsidian 內的客戶資料準備搬上 Firebase

## 一鍵更新方式

在 Ewalk.ai 自動化系統根目錄雙擊：

```text
更新CommandCenter資料.command
```

目前客戶設定檔：

```text
Ewalk.ai Brain/08_自動化/firebase/config/clients/hansik-daily-hotpot.json
```

新客戶設定檔模板：

```text
Ewalk.ai Brain/08_自動化/firebase/config/clients/client-template.json
```

目前會依序完成：

1. 讀取韓食日常鍋物 `Meta自動發文佇列.md`
2. 轉成 `content_queue` dry-run JSON
3. 根據已發布貼文產生 24 / 72 小時成效追蹤任務
4. 產生 Command Center 只讀 HTML 預覽

## 產出位置

| 檔案 | 用途 |
| --- | --- |
| `Ewalk.ai Brain/08_自動化/firebase/output/hansik-content-queue.dry-run.json` | 韓食發文佇列資料 |
| `Ewalk.ai Brain/08_自動化/firebase/output/hansik-performance-followups.dry-run.json` | 成效追蹤員待辦 |
| `Ewalk.ai Brain/08_自動化/firebase/output/command-center-preview.html` | Command Center 只讀預覽 |

## 權責分工

| 角色 | 負責 |
| --- | --- |
| 阿順 | 執行更新、檢查異常、決定是否送提姆先生批准 |
| 社群主編 | 補齊貼文主題、文案、CTA |
| 設計企劃 | 補齊素材、圖片、視覺需求 |
| 成效追蹤員 | 回收 24 / 72 小時成效 |
| 數據分析師 | 將成效整理成週報或月報洞察 |
| 提姆先生 | 批准正式寫入 Firebase、正式發文、廣告與金流相關動作 |

## 安全限制

這個一鍵更新流程目前不會做以下事情：

- 不寫入正式 Firebase
- 不部署 Firestore rules
- 不呼叫 Meta API
- 不發布 Facebook / Instagram 貼文
- 不升級 Firebase Blaze
- 不處理金流或廣告預算

## 標準檢查

阿順每次更新後要確認：

- Content Queue 筆數是否正確
- 已發布貼文是否都有 Meta 連結
- 已批准待發布內容是否需要補 token 或人工發布
- 成效追蹤佇列是否包含 24 / 72 小時節點
- 是否有缺素材、缺文案、缺批准、缺平台連結

## 部署前安全檢查

正式部署 rules 前，先雙擊：

```text
產生Firebase權限稽核報告.command
```

產出位置：

```text
Ewalk.ai Brain/08_自動化/firebase/docs/rules-audit-report.md
```

通過標準：

- Firestore 未登入者預設拒絕
- `users/{uid}` role 權限模型存在
- `audit_logs` 不可修改或刪除
- `settings` 只有 owner / admin 可寫
- `content_queue` 沒有公開寫入
- Command Center Live Read 有 role gate

## 系統功能開關

正式功能上線前，先雙擊：

```text
產生Firebase系統開關.command
```

產出位置：

```text
Ewalk.ai Brain/08_自動化/firebase/output/system-settings.dry-run.json
```

目前預設策略：

- Command Center 正式讀取：關閉，待測試後批准
- Meta 自動發文：關閉，待提姆先生逐步批准
- 廣告預算寫入：關閉
- AI 批量任務：關閉
- 即時語音公開入口：關閉
- 客戶入口：關閉
- 訂閱與金流操作：關閉
- Meta 發文最終批准：開啟

## 新客戶複製方式

目前韓食日常鍋物是樣板。下一個客戶導入時，阿順要先建立：

1. 客戶資料夾
2. 品牌資料
3. Meta 發文佇列
4. 內容狀態欄位
5. 成效追蹤欄位
6. Command Center 轉換規則
7. 客戶 Command Center 設定檔

不建議一開始就全自動發文。先做到「資料乾淨、狀態清楚、可審核、可追蹤」，再接正式 Firebase 與 Meta API。

## 正式上線前批准關卡

以下動作必須先回報提姆先生並取得批准：

- 部署 Firestore rules
- 部署 Storage rules
- 把 dry-run JSON 寫入正式 Firestore
- 把系統功能開關寫入正式 Firestore
- 啟用正式客戶後台
- 接上 Meta API 自動發文
- 啟用 Firebase Blaze 或任何付費雲端資源

## 正式 Firestore 寫入

取得提姆先生批准後，使用：

```text
寫入FirebaseCommandCenter.command
```

安全條件：

- 必須確認 project 是 `ewalk-ai-system-prod`
- 必須由 `提姆先生` 批准
- 寫入前會重新產生 dry-run 資料
- 寫入範圍限定 `clients`、`content_queue`、`campaign_reports`、`audit_logs`
- 不發文、不部署 rules、不啟用 Blaze
- 若 Firestore API 直連失敗，工具會改用本機 Chrome 送出並回傳驗證結果

## Rules 部署方式

取得提姆先生批准後，使用：

```text
部署FirebaseRules.command
```

部署時有兩種模式：

- `FIRESTORE`：只部署 Firestore Rules + Indexes
- `ALL`：部署 Firestore + Storage Rules

目前建議優先使用 `FIRESTORE`。Storage 正式 bucket 尚未啟用，除非提姆先生批准 Blaze / Storage 決策，否則不要用 `ALL`。

韓食樣板 2026-05-23 已完成第一次正式寫入：

- 寫入 12 筆
- 回查 `clients/hansik-daily-hotpot` 成功
- 結果檔：`/Users/chenjinting/Downloads/ewalk-firestore-result-20260523075808.json`

## 關聯文件

- [[Meta粉專全自動發文串接SOP]]
- [[社群與廣告成效追蹤啟動SOP]]
- [[新客戶接案到AI部門分工SOP]]
- `Ewalk.ai Brain/08_自動化/firebase/docs/phase1-workboard.md`
- `Ewalk.ai Brain/08_自動化/Firebase導入與系統優化路線圖.md`
