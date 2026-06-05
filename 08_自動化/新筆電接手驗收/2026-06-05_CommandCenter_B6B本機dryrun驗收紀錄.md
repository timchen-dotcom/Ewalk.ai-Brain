# 2026-06-05 Command Center B6B 本機 dry-run 驗收紀錄

## 一句話結論

B6B 通過。Command Center 本機 snapshot / dry-run 可開啟並顯示核心區塊，未登入正式 Firebase、未寫入 Firestore、未部署、未發文、未操作廣告預算或金流。

## 執行範圍

本輪依提姆先生批准，只做：

- 檢查 Command Center App 現有本機檔案。
- 產生本機 snapshot / dry-run App data。
- 啟動本機靜態預覽。
- 驗證頁面是否顯示總覽、Approval Queue、AI 執行紀錄與狀態摘要。

## 執行項目

### 1. 產生本機 App data

執行結果：

- `build-command-center-app-data.mjs`：產生 `data/snapshot.js`。
- `build-approval-queue-app-data.mjs`：產生 `data/approval-queue.js`，顯示 4 筆。
- `build-ai-runs-app-data.mjs`：產生 `data/ai-runs.js`。

注意：本輪產生流程只改到 `snapshot.js` 的 generated_at 時間戳，資料本體未變，已手動還原該時間戳，避免 Git 產生無意義變更。

### 2. 啟動本機預覽

本機網址：

```text
http://127.0.0.1:17990/
```

頁面標題：

```text
Ewalk.ai Command Center
```

資料來源顯示：

```text
本機預覽資料
```

頁面有 `讀取正式雲端資料` 按鈕，但本輪未點擊。

### 3. 畫面驗收

本機預覽成功顯示：

| 項目 | 結果 |
| --- | --- |
| 客戶數 | 17 |
| 總佇列 | 4 |
| 已發布 | 3 |
| 已批准 | 1 |
| 待批准 | 4 |
| 成效待回收 | 6 |
| AI 執行紀錄 | 5 |
| 客戶狀態 | 韓食日常鍋物，4 筆待批准 |
| Approval Queue | 可顯示，模式為本機 dry-run |
| AI runs | 可顯示，模式為本機 dry-run |

瀏覽器 console 檢查：

```text
error / warning：0
```

## 安全確認

本輪未做：

- 未登入正式 Firebase Live Read。
- 未寫入 Firestore。
- 未部署 Firestore rules 或 Storage rules。
- 未啟用 Firebase Blaze。
- 未呼叫 Meta API。
- 未發 Facebook / Instagram 貼文。
- 未操作廣告預算或金流。
- 未接正式客戶外部通道。
- 未提交 token、secret、API key 或本機私密設定。

## 判定

B6B 判定通過。

Command Center 目前可作為本機只讀營運看板與批准佇列預覽，但仍不能視為正式自動化入口。

## 下一步

下一步只能二選一：

1. 維持 B6B 狀態，把 Command Center 當成本機 snapshot / dry-run 預覽。
2. 若提姆先生另行批准，再進入 B6C：Command Center Live Read 正式資料只讀測試。

B6C 仍只會是「只讀正式 Firestore」測試，不包含寫入、部署、發文、廣告預算或金流。

## 建議批准語句

若要進入 B6C，建議使用：

```text
批准 B6C Command Center Live Read 正式資料只讀測試
```
