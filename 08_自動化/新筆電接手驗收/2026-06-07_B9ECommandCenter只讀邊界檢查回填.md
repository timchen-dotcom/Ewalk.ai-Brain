---
類型: Command Center 只讀邊界檢查回填
階段: B9E
狀態: 主看板通過，高風險工具頁需隔離
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Command Center
  - 權限測試
  - 只讀
  - 安全邊界
---

# 2026-06-07 B9E Command Center 只讀邊界檢查回填

## 測試目的

確認 Command Center 主看板是否仍維持只讀，不提供正式寫入、發文、部署、廣告預算或金流操作入口。

## 檢查範圍

- `08_自動化/firebase/command-center-app/index.html`
- `08_自動化/firebase/command-center-app/app.js`
- `08_自動化/firebase/command-center-app/firestore-live-adapter.js`
- `08_自動化/firebase/firebase.json`
- `08_自動化/firebase/command-center-app/README.md`

## 檢查結果

主看板只讀邊界通過：

- `index.html` 主選單只有頁內錨點，沒有連到寫入頁、部署頁、發文頁或廣告頁。
- 主看板唯一主要按鈕是 `讀取正式雲端資料`。
- `app.js` 的 `loadLiveFirestore()` 顯示文案為「正在登入 Google 並讀取 Firestore，只讀不寫入」。
- `firestore-live-adapter.js` 只使用 `getDoc` / `getDocs` 讀取 `users`、`clients`、`content_queue`、`campaign_reports`、`ai_runs`、`approvals`。
- 主看板相關檔案未找到 `setDoc`、`addDoc`、`updateDoc`、`deleteDoc`、`writeBatch`、`runTransaction`、`documents:commit` 或外部 POST / PUT / PATCH / DELETE 操作。
- `firebase.json` 目前沒有 hosting public 設定，未顯示會把整個 `command-center-app` 直接當 hosting 目錄部署。
- README 明確寫目前只讀、不寫入 Firestore，正式 approvals 寫入需提姆先生另行批准。

## 需注意風險

同一個 `command-center-app` 目錄內仍存在高風險管理頁：

- `owner-bootstrap.html`：可寫入 `users/{uid}` owner 權限與 audit log。
- `import-clients.html`：可匯入 clients。
- `deploy-firestore-rules.html`：可部署 Firestore rules。

目前主看板沒有連到這些頁面，`firebase.json` 也沒有 hosting public 設定；但若未來把整個 `command-center-app` 直接公開部署，這些頁面可能被 URL 直接存取。

## 判定

主看板只讀邊界通過；高風險工具頁需隔離。

## 通過原因

- Command Center 主入口仍是 read-only dashboard。
- 正式雲端資料讀取使用 Firestore read API。
- 主看板沒有批准按鈕、發文按鈕、部署按鈕、Firebase 寫入按鈕、廣告或金流入口。
- 批准佇列目前只是顯示，不等於自動執行。

## 不升權原因

B9E 通過不代表可以開放正式寫入。原因：

- 高風險工具頁仍在同一資料夾中，未來 hosting 前需隔離。
- Command Center 目前仍不得作為正式 Obsidian 寫入或 Git 入口。
- Command Center 目前仍不得作為 Firebase production 寫入入口。
- Command Center 目前仍不得接正式發文、部署、廣告或金流。

## 後續要求

- TODO：若要公開部署 Command Center，先將 `owner-bootstrap.html`、`import-clients.html`、`deploy-firestore-rules.html` 移出 hosting public root 或加上明確隔離策略。
- TODO：若要加入批准按鈕，必須先通過 B9F 批准文字與執行分離測試。
- TODO：若要寫 Firebase，必須先通過 B9G emulator / staging 寫入測試。
- TODO：B9E 後可申請 B9B 精選只讀 context，但不開正式 Brain 全 Vault。
