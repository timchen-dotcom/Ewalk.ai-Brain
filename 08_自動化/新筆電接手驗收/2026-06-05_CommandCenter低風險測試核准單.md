# 2026-06-05 Command Center 低風險測試核准單

## 一句話結論

Command Center 下一步可以測，但第一輪只能測本機 snapshot / dry-run，不碰正式 Firebase 寫入、不部署、不發文、不操作廣告預算或金流。

## 目前依據

- [[../firebase/command-center-app/README|Command Center App]] 已有本機 snapshot 模式。
- [[../firebase/docs/live-read-test-checklist|Command Center Live Read 測試清單]] 記錄過正式只讀驗收。
- [[../../13_SOP流程/Firebase Command Center 更新SOP|Firebase Command Center 更新 SOP]] 明確把正式寫入、rules 部署、Meta API、Blaze、金流列為批准項目。
- [[../Command Center Approval Queue 小公司可控版|Command Center Approval Queue 小公司可控版]] 已把高風險工作集中成待批准佇列，不等於直接執行。

## 分階段建議

| 階段 | 狀態 | 範圍 | 是否需要批准 |
| --- | --- | --- | --- |
| B6A 測試核准單 | 已建立 | 只整理測試範圍、邊界與通過標準 | 不需要額外批准 |
| B6B 本機 snapshot / dry-run 測試 | 待批准 | 開啟本機 Command Center，檢查 snapshot、Approval Queue、AI runs 顯示 | 需要提姆先生批准 |
| B6C Live Read 只讀測試 | 待批准 | 使用公司帳號登入，只讀正式 Firestore | 需另行批准 |
| B6D 寫入或正式自動化 | 禁止 | 寫 Firestore、部署 rules、外部發文、廣告、金流 | 本輪不開放 |

## B6B 允許範圍

若提姆先生批准 B6B，阿順只允許做：

- 檢查 Command Center App 現有文件與本機檔案。
- 啟動本機 snapshot / dry-run 預覽。
- 檢查頁面是否能顯示客戶、Approval Queue、AI runs、狀態摘要。
- 只產生或覆蓋本機 dry-run / snapshot 產物。
- 回報畫面狀態、錯誤、缺資料與下一步。

## B6B 禁止範圍

即使批准 B6B，也仍禁止：

- 不登入正式 Firebase Live Read。
- 不寫入 Firestore。
- 不部署 Firestore rules / Storage rules。
- 不啟用 Firebase Blaze。
- 不呼叫 Meta API。
- 不發 Facebook / Instagram 貼文。
- 不操作廣告預算或金流。
- 不接正式客戶外部通道。
- 不把 token、secret、API key 或密碼寫進 Vault。

## B6B 通過標準

- 本機 Command Center 可開啟。
- Snapshot 模式可讀。
- Approval Queue 可顯示待批准項目。
- AI runs 或執行紀錄區可顯示。
- 畫面沒有正式執行按鈕，或即使有也不得操作。
- 測試結果能整理回 Obsidian。
- Git 只提交文字紀錄或必要的安全文件，不提交 token、secret 或本機私密設定。

## B6B 失敗標準

出現以下任一情況，停止測試並回報：

- 要求登入正式 Firebase 才能繼續。
- 要求輸入或貼上 token / secret。
- 預覽會自動寫入正式 Firestore。
- 預覽會觸發發文、部署、廣告或金流操作。
- 找不到 Command Center App 或關鍵資料路徑。
- 本機預覽造成瀏覽器或系統異常。

## 建議批准語句

若提姆先生要進入下一步，建議使用：

```text
批准 B6B Command Center 本機 snapshot / dry-run 低風險測試
```

## 不建議現在批准的語句

以下都不是 B6B，需另開測試：

```text
批准 Command Center Live Read 正式資料讀取
批准 Command Center 寫入 Firebase
批准部署 Firestore rules
批准正式發文或廣告預算操作
```

## 交接給阿順

- 目前已完成 B6A：測試核准單。
- 下一步若獲批准，只做 B6B 本機 snapshot / dry-run。
- B6B 不等於批准 B6C Live Read，也不等於批准任何正式寫入或外部副作用。
- 若 B6B 通過，再由提姆先生決定是否進入 B6C。

## B6B 測試結果

2026-06-05 提姆先生批准 B6B 後，已完成本機 snapshot / dry-run 驗收。

- 結果：通過。
- 預覽網址：`http://127.0.0.1:17990/`
- 資料來源：本機預覽資料。
- 待批准事項：4 筆。
- AI 執行紀錄：5 筆。
- console error / warning：0。
- 未登入正式 Firebase、未寫入、未部署、未發文、未操作廣告預算或金流。

驗收紀錄：[[2026-06-05_CommandCenter_B6B本機dryrun驗收紀錄]]
