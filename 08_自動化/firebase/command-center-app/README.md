# Ewalk.ai Command Center App

建立日期：2026-05-23  
狀態：內部只讀骨架；已預留 Firebase Auth + Firestore Live Read  
資料來源：韓食日常鍋物正式 Firestore 寫入同批 snapshot

## 目的

這是 Ewalk.ai 內部營運指揮中心的第一版 Web App 骨架，用來驗證：

- 客戶內容佇列是否能被清楚閱讀
- 已發布 / 已批准 / 待回收狀態是否能被管理
- 高風險任務是否能集中成待批准佇列
- 成效追蹤任務是否能交給數據分析師
- 權限控管提醒是否固定出現在內部流程

## 目前模式

預設使用 snapshot 模式：

```text
data/snapshot.js
data/approval-queue.js
data/ai-runs.js
assets/hansik-logo.png
```

原因：

- 韓食第一批資料已正式寫入 Firestore
- Firestore rules 與使用者角色還沒正式部署驗證
- Command Center 先做內部可視化，不開放客戶入口

## Live Read 模式

Live Read 會在本機 Command Center 按「登入讀正式資料」後才啟用。

需要先完成：

1. 建立 `firebase-config.local.js`
2. 提姆先生先登入一次，讓 Firebase Authentication 建立 `tim.chen@ewalk.ai`
3. 依畫面顯示的 UID 建立 `users/{uid}`，role 為 `owner`
4. Firestore rules 已測試並由提姆先生批准部署

第一次登入時，如果尚未建立 `users/{uid}`，畫面會顯示 UID 與 email。這是正常狀態，用來讓阿順建立提姆先生的 owner 權限文件。

啟用工具：

```text
建立CommandCenterFirebaseConfig.command
取得FirebaseUID.command
產生CommandCenterApp.command
```

安全設計：

- 沒有 `firebase-config.local.js` 時，只顯示 snapshot
- 登入後會先讀 `users/{uid}` 檢查 role
- 只允許 `owner` / `admin` / `manager` / `staff` 讀取
- 目前只讀，不寫入 Firestore
- Approval Queue 本機 dry-run 已通過；正式 `approvals` / `audit_logs` 寫入需走 B17B-B22 批次驗證，且只限內部追蹤資料

## 下一階段

1. 檢查 Approval Queue 欄位與呈現方式
2. B17B-B22 批次驗證正式寫入 `approvals` / `audit_logs`
3. 測試 Firestore Live Read 讀取正式批准佇列
4. 再評估是否加入只改狀態、不直接執行的批准按鈕

## 安全限制

- 不發文
- 不修改廣告預算
- 不顯示 token
- 不處理金流
- 不開放外部客戶登入
- 批准佇列只做顯示，不等於已執行

## 相關工具

- `建立CommandCenterFirebaseConfig.command`：建立本機 Firebase Web App config
- `取得FirebaseUID.command`：登入一次並取得 Firebase Authentication UID
- `產生CommandCenterApp.command`：重新產生 snapshot 並以本機網址開啟 App
- `建立ApprovalQueueDryRun.command`：建立本機 Approval Queue dry-run 與 App 資料
- `開啟FirebaseAuthUsers.command`：開啟 Firebase Auth 使用者頁
- `寫入Firebase使用者角色.command`：建立 `users/{uid}` role 文件
