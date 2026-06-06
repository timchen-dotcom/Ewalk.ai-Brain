---
類型: 權限逐步開放測試回填
階段: B15
狀態: 已完成
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Command Center
  - Approval Queue
  - dry-run
---

# 2026-06-07 B15 Command Center 本機 Dry-run Queue 寫入

## 一句話結論

B15 已由 Codex 主窗口把 B14A 的 queue item 寫入本機 Command Center dry-run data，不寫 production Firebase，也不執行任何外部副作用。

## 本次寫入範圍

只修改本機 Command Center 檔案：

- `08_自動化/firebase/command-center-app/data/approval-queue.js`
- `08_自動化/firebase/command-center-app/app.js`

## 新增 queue item

### 嘉昱隔熱膜 LINE 優先 CTA 承接流程

狀態：`approved_but_not_executed`

用途：

- 進入 Command Center 本機待辦追蹤。
- 追蹤 LINE 優先 CTA 承接流程。
- 不代表正式廣告上線。
- 不代表正式發文。
- 不代表 Firebase 寫入。
- 不代表 AI 接正式客戶通道。

### 韓食日常鍋物 6/9 Facebook 正式發布

狀態：`pending`

用途：

- 作為待提姆先生批准的正式發布項目。
- 目前不能執行。
- 不能發文。
- 不能排程。
- 不能接 Meta 發文工具。

## 前端顯示補強

新增 Command Center 本機顯示標籤：

- `approved_but_not_executed` 顯示為 `已批准未執行`。
- `client_channel` 顯示為 `客戶通道 / 承接流程`。
- `document_write` 顯示為 `文件寫入`。
- `automation` 顯示為 `自動化`。
- `firebase_write` 顯示為 `Firebase 寫入`。

## 安全邊界

B15 沒有做：

- 沒有寫 production Firebase。
- 沒有部署。
- 沒有發文。
- 沒有排程。
- 沒有接正式客戶通道。
- 沒有操作廣告預算、金流、帳務或付款設定。

## 通過標準

B15 可判定通過，條件是：

- 本機 dry-run data 有新增嘉昱與韓食 queue item。
- 嘉昱狀態為 `approved_but_not_executed`。
- 韓食 6/9 發布狀態為 `pending`。
- 前端標籤可辨識 `approved_but_not_executed`。
- 所有正式外部副作用仍未執行。

## 下一步

- 若要視覺驗收，可在本機 Command Center 預覽中檢查 Approval Queue。
- 下一階 B16 才討論 Firebase emulator / staging 寫入。
- B16 需提姆先生另行批准。

## 關聯文件

- [[2026-06-07_B14ACommandCenterMockQueue回填]]
- [[2026-06-07_B14CommandCenter本機MockActionQueue]]
- [[../../13_SOP流程/Command Center 本機 Mock Action Queue SOP]]
