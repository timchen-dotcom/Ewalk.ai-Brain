---
類型: 權限逐步開放測試
階段: B16A
狀態: 已完成預檢，未寫 production
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Firebase
  - Command Center
  - Approval Queue
  - emulator
  - 權限測試
---

# 2026-06-07 B16 Firebase Emulator / Staging 寫入前防線

## 一句話結論

B16A 已建立 Firebase approvals 寫入前防線：目前只允許本機 emulator 預檢與本機 emulator 寫入；不寫 production Firebase、不部署、不發文、不接正式通道。

## 為什麼先做 B16A

B15 已把 B14A queue item 寫入本機 Command Center dry-run data。下一個風險點是「寫入 Firebase」。

這一階不能直接進 production。必須先驗證：

- 寫入腳本預設不寫。
- 只有 `--target emulator` 被接受。
- 沒有 `FIRESTORE_EMULATOR_HOST` 時拒絕寫入。
- `FIRESTORE_EMULATOR_HOST` 必須是 `localhost` 或 `127.0.0.1`。
- 即使 queue item 有 `approved_but_not_executed`，也不能被當成 production 寫入批准。

## 新增腳本

```text
08_自動化/firebase/scripts/prepare-approval-queue-emulator-write.mjs
```

用途：

- 讀取本機 Command Center dry-run queue：
  - `08_自動化/firebase/command-center-app/data/approval-queue.js`
- 產生 approvals 寫入預檢摘要。
- 預設只輸出摘要，不寫任何資料。
- 僅在明確 emulator 條件下可寫本機 emulator。

## 本次預檢結果

B16A 預檢摘要：

```text
target: emulator
write: false
production_write_allowed: false
source: command-center-app/data/approval-queue.js
approval_count: 6
pending_count: 5
approved_but_not_executed_count: 1
```

JS 語法檢查：

- `prepare-approval-queue-emulator-write.mjs` 通過。
- `approval-queue.js` 通過。
- `app.js` 通過。

防線測試：

| 測試 | 結果 |
| --- | --- |
| 預設 `--target emulator` | 通過，只輸出預檢摘要，`write: false`。 |
| `--target production` | 通過，腳本拒絕並回覆 B16A 只允許 emulator。 |
| `--target emulator --write` 但未設定 `FIRESTORE_EMULATOR_HOST` | 通過，腳本拒絕並回覆缺少 emulator host。 |

## 寫入條件

B16A 即使要寫，也只能寫本機 emulator。

必須同時滿足：

```text
--target emulator
--write
--confirm-local-only B16_LOCAL_ONLY
FIRESTORE_EMULATOR_HOST=127.0.0.1:18080
```

缺少任一條件，腳本必須拒絕寫入。

## 明確禁止

- 禁止寫 production Firebase。
- 禁止部署 Firestore rules。
- 禁止建立正式 approvals 文件。
- 禁止正式發文。
- 禁止正式廣告上線。
- 禁止接正式客戶通道。
- 禁止操作廣告預算、金流、帳務或付款設定。

## 驗收標準

B16A 可通過的標準：

- 腳本預設只輸出預檢摘要。
- 腳本不讀 secret、不印 token。
- 腳本未指定 emulator 寫入條件時不寫任何資料。
- 腳本拒絕非 emulator target。
- 腳本拒絕沒有 `FIRESTORE_EMULATOR_HOST` 的寫入。
- 寫入 payload 會標記 `production_write_allowed: false`。

目前 B16A 判定：通過。

## 下一步

- B16B：已通過，Mac Studio 本機 emulator 寫入 6 筆 approvals，逐筆回查 6 筆。
- B16B 未碰 production Firebase。
- B17A 才討論正式 Firestore approvals 寫入預覽；B17A 仍不等於正式寫入。
- B17 也不等於正式寫入，仍需逐案批准。

## 關聯文件

- [[2026-06-07_B15CommandCenter本機DryRunQueue寫入]]
- [[2026-06-07_B16BApprovalQueueEmulator寫入測試]]
- [[2026-06-07_B14ACommandCenterMockQueue回填]]
- [[../../13_SOP流程/Command Center 本機 Mock Action Queue SOP]]
