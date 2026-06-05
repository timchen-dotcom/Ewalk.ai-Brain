# Command Center 只讀使用 SOP

## 用途

讓提姆先生與阿順用 Command Center 查看 Ewalk.ai 營運狀態，但只限本機預覽與正式 Firestore 只讀看板。

此 SOP 不代表批准正式寫入、發文、部署、廣告預算、金流或任何外部副作用。

## 使用時機

- 要快速確認 Ewalk.ai 客戶、內容佇列、批准佇列、成效追蹤與 AI 執行紀錄時。
- 要檢查 Command Center 版面與資料來源是否正常時。
- 要確認正式 Firestore 可讀，但尚未批准寫入或執行層時。
- 要給提姆先生看營運狀態，但不希望誤觸正式操作時。

## 目前狀態

- B6B：本機 snapshot / dry-run 通過。
- B6C：正式 Firestore Live Read 只讀通過。
- B6C-1：Live Read / dry-run 混合顯示修正通過。

目前 Command Center 可以作為：

- 本機 dry-run 預覽。
- 正式 Firestore 只讀看板。

目前 Command Center 不可以作為：

- 正式批准執行入口。
- 正式寫入入口。
- 發文、部署、廣告預算或金流操作入口。

## 權限邊界

允許：

- 開啟本機 Command Center。
- 查看本機 snapshot / dry-run 預覽。
- 由提姆先生在 Chrome 手動登入公司 Google 帳號。
- 讀取正式 Firestore 資料。
- 查看 clients、content_queue、campaign_reports、ai_runs、approvals。
- 依畫面結果整理報告、待辦或需批准事項。

禁止：

- 寫入 Firestore。
- 部署 Firebase rules 或 hosting。
- 修改 Firebase config。
- 發 Facebook / Instagram 貼文。
- 操作 Meta 廣告預算。
- 操作金流、帳務、訂閱或 Blaze 設定。
- 接正式客戶外部通道。
- 把 token、secret、API key、OAuth code 或密碼寫入 Obsidian。

## 啟動方式

在 Mac Studio 或新筆電的 `Ewalk.ai Brain` 工作副本中，進入：

```zsh
08_自動化/firebase/command-center-app
```

啟動本機預覽：

```zsh
python3 -m http.server 17990
```

用 Chrome 開啟：

```text
http://localhost:17990/
```

使用完畢後，關閉本機預覽 server。

## 資料來源判斷

### 本機預覽資料

畫面顯示：

```text
本機預覽資料
```

代表目前讀的是本機產生的 snapshot / dry-run 資料。這適合測版面、測流程與測低風險待批准佇列。

### 正式雲端資料

點擊：

```text
讀取正式雲端資料
```

由提姆先生在 Chrome 手動完成 Google 登入。成功後畫面應顯示：

```text
正式雲端資料
```

並顯示登入帳號已通過內部權限檢查。

## 標準檢查步驟

1. 開啟 `http://localhost:17990/`。
2. 確認資料來源為 `本機預覽資料`。
3. 檢查本機 dry-run 指標是否可讀。
4. 點擊 `讀取正式雲端資料`。
5. 由提姆先生手動完成 Google 登入。
6. 確認資料來源切換為 `正式雲端資料`。
7. 檢查 clients、approvals、ai_runs 數字是否與畫面訊息一致。
8. 若 approvals 為 `0`，畫面應顯示沒有正式批准紀錄，不應顯示本機 dry-run 待批准佇列。
9. 檢查畫面沒有出現寫入、部署、發文、廣告或金流操作。
10. 使用完畢後關閉本機預覽 server。

## 判讀標準

| 畫面狀態 | 判斷 |
| --- | --- |
| `本機預覽資料` | 只是在看本機 dry-run，不代表正式資料。 |
| `正式雲端資料` | 已通過 Google 登入與內部權限檢查，可讀正式 Firestore。 |
| approvals 為 `0` | 正式批准紀錄目前為 0，不可用本機 dry-run 待批准數補判斷。 |
| clients 數與本機不同 | 以資料來源標示為準；正式模式看正式 Firestore 數字。 |
| AI 執行紀錄顯示正式只讀 | 只代表可讀紀錄，不代表可啟動 AI 任務。 |

## 常見狀況

### 內建瀏覽器登入失敗

Codex 內建瀏覽器可能因 Firebase OAuth popup / sessionStorage 限制而失敗。Live Read 驗收以 Chrome 為主。

### 顯示沒有權限

代表 Google 帳號可登入，但 Firestore `users/{uid}` 權限文件未通過。此時不得繞過權限，需由阿順回到權限設定流程，並由提姆先生確認。

### 正式 approvals 為 0

這是合法狀態。Command Center 應顯示空狀態，不應拿本機 dry-run 佇列補畫面。

## 升級閘門

以下任何升級都需要提姆先生另行批准：

- Command Center 正式寫入。
- 建立或修改 Firestore 文件。
- 部署 Firebase rules。
- 將批准佇列接成可執行操作。
- 接 Meta 發文或廣告 API。
- 接金流、帳務、訂閱或 Blaze 操作。
- 接正式客戶通道。
- 讓 OpenClaw、Ollama 或 Host Harness 直接讀寫 Command Center。

## 驗收標準

Command Center 只讀使用可通過的標準：

- 本機 dry-run 可開啟且 console 無錯誤。
- 正式 Live Read 可由提姆先生手動登入。
- 讀到正式資料後，畫面明確顯示 `正式雲端資料`。
- clients、approvals、ai_runs 使用正式資料，不混入本機 dry-run。
- approvals 為 0 時顯示正式空狀態。
- 未出現寫入、部署、發文、廣告預算或金流操作。
- 使用結束後本機 server 已關閉。

## 關聯文件

- [[../08_自動化/新筆電接手驗收/2026-06-05_CommandCenter低風險測試核准單]]
- [[../08_自動化/新筆電接手驗收/2026-06-05_CommandCenter_B6B本機dryrun驗收紀錄]]
- [[../08_自動化/新筆電接手驗收/2026-06-05_CommandCenter_B6C_LiveRead只讀驗收紀錄]]
- [[../08_自動化/新筆電接手驗收/2026-06-05_接下來行動總控]]
- [[阿順三入口分工手動SOP]]
