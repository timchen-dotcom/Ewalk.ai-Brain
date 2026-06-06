---
類型: 權限逐步開放測試
階段: B17A
狀態: 已通過預覽產生，不得正式寫入
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Firebase
  - Command Center
  - Approval Queue
  - production-preview
  - 權限測試
---

# 2026-06-07 B17A 正式 Firestore Approval Queue 寫入預覽

## 一句話結論

B16B 已證明 approvals 可安全寫入本機 Firestore Emulator；B17A 只能建立正式 Firestore 寫入預覽，不寫 production Firebase。

## B17A 目標

B17A 要做的是把 B16B 已驗證的 6 筆 approvals 轉成 production Firestore 寫入前預覽。

預覽必須清楚列出：

- project id。
- collection / document path。
- approval id。
- status。
- permission level。
- 風險分類。
- 是否需要提姆先生逐案批准。

## 明確邊界

B17A 可以做：

- 讀取本機 `approval-queue.js`。
- 產生 production write preview。
- 標出哪些項目仍是 pending。
- 標出哪些項目是 `approved_but_not_executed`。
- 標出 production 寫入前需要的批准文字。

B17A 不可以做：

- 不寫 production Firebase。
- 不呼叫 Firestore commit API。
- 不部署 Firestore rules。
- 不發文。
- 不啟用廣告。
- 不接正式客戶通道。
- 不操作廣告預算、金流、帳務或付款設定。

## 從 B16B 帶來的已驗證事實

B16B 通過訊號：

```text
approval_count: 6
pending_count: 5
approved_but_not_executed_count: 1
wrote_to_emulator: 6
verified_from_emulator: 6
production_write_allowed: false
```

這代表：

- 本機 queue 來源已恢復正確。
- Java / Firebase Emulator 可用。
- 寫入與回查流程可用。
- production Firebase 尚未被寫入。

## B17A 通過標準

B17A 只有在以下條件都達成時才算通過：

- 預覽列出 6 筆 approvals。
- 每筆都有 document path。
- 每筆都有風險與狀態。
- 輸出明確標示 `production_write_allowed: false`。
- 沒有任何 production 寫入。
- 沒有任何外部副作用。

## 需要提姆先生批准

- APPROVAL：是否建立 B17A production write preview script。
- APPROVAL：是否允許未來進入 B17B production Firestore 寫入。
- APPROVAL：若進入 B17B，需逐案批准要寫入哪幾筆 approvals。

## 已建立工具

```text
08_自動化/firebase/scripts/prepare-approval-queue-firestore-preview.mjs
```

此工具只產生：

```text
08_自動化/firebase/output/approval-queue-firestore-commit.preview.json
```

不呼叫 Firestore API，不寫 production Firebase。

## 預覽回填

2026-06-07 已執行 B17A preview。

通過訊號：

```text
approval_count: 6
audit_log_count: 1
preview_write_count: 7
production_write_allowed: false
```

判定：

- B17A 通過。
- 已產生 production Firestore write preview。
- preview 內容包含 6 筆 `approvals` 與 1 筆 `audit_logs`。
- 未呼叫 Firestore API。
- 未寫 production Firebase。

## 下一步

- B17-B20 批次審查已通過。
- 若提姆先生沒有另行批准，不進入 B17B。

## 關聯文件

- [[2026-06-07_B16BApprovalQueueEmulator寫入測試]]
- [[2026-06-07_B16FirebaseEmulatorStaging寫入前防線]]
- [[2026-06-07_B9權限逐步開放測試計畫]]
- [[2026-06-07_B17-B20內部ApprovalQueue批次審查]]
