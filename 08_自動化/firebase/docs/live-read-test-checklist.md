# Command Center Live Read 測試清單

建立日期：2026-05-23  
負責角色：阿順  
最終決策者：提姆先生  
狀態：已完成正式 Live Read 驗收

## 目的

確認 Ewalk.ai Command Center 可以用公司 Google 帳號登入，並以只讀方式讀取正式 Firestore。

## 測試前條件

- [x] Firebase Web App config 已建立
- [x] 本機已有 `firebase-config.local.js`
- [x] Firebase Authentication 已有 `tim.chen@ewalk.ai`
- [x] Firestore 已有 `users/{uid}`，role 為 `owner`
- [x] Firestore rules 已完成靜態稽核
- [x] 提姆先生已批准部署正式 Firestore rules

## 啟動方式

```text
產生CommandCenterApp.command
```

開啟網址：

```text
http://localhost:17990/
```

## Snapshot 模式驗收

- [x] 頁面標題顯示 `Ewalk.ai 營運指揮中心`
- [x] 客戶顯示 `韓食日常鍋物`
- [x] 總佇列顯示 `4`
- [x] 已發布顯示 `3`
- [x] 已批准顯示 `1`
- [x] 成效待回收顯示 `6`
- [x] 狀態篩選可切換全部 / 已批准 / 已發布

## Live Read 模式驗收

點擊：

```text
登入讀正式資料
```

應看到：

- [x] 出現 Google 登入流程
- [x] 使用 `tim.chen@ewalk.ai` 登入
- [x] 系統先檢查 `users/{uid}` role
- [x] role 顯示 `owner`
- [x] 資料來源文字變成 `正式 Firestore 讀取模式`
- [x] 韓食 content_queue 與 campaign_reports 數字正確

## 2026-05-23 測試結果

- Firestore rules 已部署到 `projects/ewalk-ai-system-prod/releases/cloud.firestore`
- Ruleset：`projects/ewalk-ai-system-prod/rulesets/aa7cd77c-9b09-43bb-ae24-62e9515736b5`
- Command Center 成功顯示：`tim.chen@ewalk.ai 已通過 role=owner 權限檢查。`
- 本次測試只讀取正式資料，未寫入、未發文、未啟用 Blaze。

## 權限失敗測試

用沒有 `users/{uid}` 文件的帳號登入時，應看到：

```text
找不到 users role，請先建立提姆先生或內部員工權限文件。
```

用 role 不符合的帳號登入時，應看到：

```text
不可讀取內部 Command Center
```

## 安全確認

- [x] 沒有發文按鈕
- [x] 沒有廣告預算操作
- [x] 沒有 Blaze / billing 操作
- [x] 沒有 token 顯示
- [x] 沒有寫入 Firestore 的前端操作
- [x] 沒有客戶入口開放

## 通過後下一步

1. 規劃內部 Hosting，但不開放客戶入口。
2. 將 Command Center 拆成只讀、待批准、正式執行三層。
3. 下一階段才評估寫入操作與審核流，不直接開放自動發文。
