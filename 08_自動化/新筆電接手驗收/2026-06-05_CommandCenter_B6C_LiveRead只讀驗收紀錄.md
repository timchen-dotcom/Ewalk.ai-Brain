# 2026-06-05 Command Center B6C Live Read 只讀驗收紀錄

## 一句話結論

B6C 通過。Command Center 已可在 Chrome 使用 `tim.chen@ewalk.ai` 通過內部權限檢查，並以正式 Firestore Live Read 方式讀取資料；本輪未寫入、未部署、未發文、未操作廣告預算或金流。

## 測試範圍

本輪只測：

- 開啟本機 Command Center。
- 點擊 `讀取正式雲端資料`。
- 使用提姆先生公司帳號完成 Google 登入。
- 驗證 Command Center 是否切換成正式雲端資料只讀模式。

## 測試過程

### 1. 內建瀏覽器測試

先以 Codex 內建瀏覽器測 `http://localhost:17990/`。

結果：

- 本機預覽可開。
- 點擊 Live Read 後進入 Google OAuth。
- Firebase auth handler 回覆缺少初始狀態，疑似內建瀏覽器 popup / sessionStorage 不適合 Firebase OAuth。

判定：內建瀏覽器不作為 B6C Live Read 驗收表面。

### 2. Chrome 正式測試

改用提姆先生 Chrome profile 開啟：

```text
http://localhost:17990/
```

提姆先生手動完成 Google 登入後，Command Center 顯示：

```text
正式雲端資料
tim.chen@ewalk.ai 已通過內部權限檢查；目前讀到 15 位客戶、0 筆批准紀錄。
```

## 驗收結果

| 項目 | 結果 |
| --- | --- |
| 本機 Command Center 可開啟 | 通過 |
| Google 登入可完成 | 通過，需提姆先生手動登入 |
| 內部權限檢查 | 通過，`tim.chen@ewalk.ai` |
| Live Read 模式 | 通過，顯示正式雲端資料 |
| 正式 clients 讀取 | 通過，15 位客戶 |
| 正式 approvals 讀取 | 通過，0 筆 |
| 正式 ai_runs 讀取 | 通過，2 筆 |
| Firestore 寫入 | 未執行 |
| Rules 部署 | 未執行 |
| 發文 / 廣告 / 金流 | 未執行 |

## B6C 原始重要觀察

Live Read 成功後，畫面仍有部分區塊保留本機 dry-run 資料：

- 總覽客戶數仍顯示本機客戶名冊 `17`，但 Live Read 訊息顯示正式資料為 `15` 位客戶。
- Approval Queue 區塊仍顯示本機 dry-run `4` 筆，因正式 approvals 目前為 `0` 筆。
- AI 執行紀錄已從本機 dry-run `5` 筆切換為正式讀取 `2` 筆。

判定：這不是資料寫入或權限風險，但會造成提姆先生判讀混淆。下一步應修正介面，讓正式 Live Read 與本機 dry-run 區塊有清楚標示，不要混在同一組指標裡。

## 安全確認

本輪未做：

- 未寫入 Firestore。
- 未部署 Firestore rules 或 Storage rules。
- 未啟用 Firebase Blaze。
- 未呼叫 Meta API。
- 未發 Facebook / Instagram 貼文。
- 未操作廣告預算或金流。
- 未接正式客戶外部通道。
- 未讀取或記錄瀏覽器 cookie、密碼、token、secret 或 OAuth 授權碼。

## 判定

B6C 判定通過。

Command Center 已具備正式 Firestore 只讀能力，但目前仍只能定位為「內部只讀營運看板」。不得視為正式寫入、批准執行或自動化執行入口。

## 下一步

建議進入 B6C-1：修正 Live Read / dry-run 混合顯示問題。

目標：

- 正式 Live Read 模式下，總覽客戶數優先顯示正式 clients 數。
- 正式 approvals 為 0 時，不應讓總覽待批准與 Approval Queue 誤讀為正式 4 筆。
- 若仍保留本機 dry-run Approval Queue，必須明確標示為「本機 dry-run 參考」，不能混入正式資料指標。

B6C-1 不包含任何 Firestore 寫入、部署、發文、廣告或金流。

## B6C-1 修正結果

B6C-1 已完成。Command Center 前端已修正 Live Read / dry-run 混合顯示問題。

本次修正：

- 新增 `activeDataMode`，明確區分 `snapshot` 與 `live`。
- Live Read 成功後，客戶名冊、批准佇列與 AI 執行紀錄皆切換成正式只讀來源。
- 正式 approvals 為 `0` 筆時，批准佇列顯示空狀態，不再 fallback 到本機 dry-run `4` 筆。
- 正式 clients 顯示 `15` 位客戶，不再沿用本機客戶名冊 `17`。
- AI 執行紀錄顯示正式只讀 `2` 筆，不再沿用本機 dry-run `5` 筆。
- `firestore-live-adapter.js` 未修改，仍只使用 Firebase Auth 與 Firestore read API。

驗證結果：

| 驗證 | 結果 |
| --- | --- |
| `node --check app.js` | 通過 |
| 本機 dry-run 頁面 | 通過，17 客戶、4 待批准、5 AI 執行紀錄 |
| 本機 live payload 模擬 | 通過，15 客戶、0 待批准、2 AI 執行紀錄 |
| Live approvals 為 0 | 通過，顯示「正式雲端目前沒有批准紀錄。」 |
| Console error / warning | dry-run 檢查為 0 |

## B6C-1 判定

B6C-1 通過。

Command Center 目前可作為「本機 dry-run 預覽」與「正式 Firestore 只讀看板」兩種清楚分離的內部工具。仍不得視為正式寫入、批准執行、自動部署、發文、廣告或金流入口。

## B6C-1 後續

下一步若繼續推進，建議只做「Command Center 只讀使用 SOP 與批准邊界」整理，或另行請提姆先生批准更高風險的正式寫入 / 執行層測試。
