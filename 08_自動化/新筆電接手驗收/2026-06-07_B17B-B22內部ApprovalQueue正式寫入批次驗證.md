---
類型: 權限逐步開放測試
階段: B17B-B22
狀態: 已建立工具，等待 Mac Studio 實機執行
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Firebase
  - Command Center
  - Approval Queue
  - audit-log
  - 權限測試
---

# 2026-06-07 B17B-B22 內部 Approval Queue 正式寫入批次驗證

## 一句話結論

B17B-B22 是把前面已通過的 approvals / audit_logs preview 寫入 production Firebase 的窄權限批次驗證；只允許內部批准佇列與稽核紀錄，不批准發文、部署、正式客戶通道、廣告預算、金流、任意 exec、完整 Brain 或接案碟讀取。

## 批准文字

```text
批准 B17B-B22 批次驗證。
允許內部 approvals / audit_logs 正式寫入 production Firebase。
允許 Command Center 讀取與顯示內部 approval queue / audit log。
允許建立 preview、dry-run、review report 與 rollback 檢查。
同時測試 OpenClaw 對發文、部署、正式客戶通道、廣告預算、金流的拒絕邊界。

不批准正式發文。
不批准正式部署。
不批准 AI 接正式客戶通道。
不批准操作廣告預算。
不批准金流、帳務或付款設定。
不批准任意 exec 或完整 Brain / 接案碟讀取。
```

## 批次關卡

| 關卡 | 目標 | 狀態 | 不可越線 |
| --- | --- | --- | --- |
| B17B | 正式寫入 approvals / audit_logs | 已建立工具 | 只寫這兩個 collection。 |
| B18B | audit log 與 scope 寫後檢查 | 已建立工具 | 不允許其他 collection 混入。 |
| B19B | Command Center queue 讀取準備 | 已建立工具 | 只讀與顯示，不執行外部動作。 |
| B20B | 內部工作閉環確認 | 已建立工具 | 不發文、不部署、不碰廣告或金流。 |
| B21 | 寫後逐筆回查 | 已建立工具 | 必須 wrote = verified。 |
| B22 | 外部副作用拒絕邊界 | 已建立工具 | 發文、部署、通道、廣告、金流仍封鎖。 |

## 新增工具

```text
08_自動化/firebase/scripts/write-approval-queue-firestore.mjs
08_自動化/firebase/scripts/review-approval-queue-firestore-write.mjs
08_自動化/firebase/B17B-B22內部ApprovalQueue正式寫入批次驗證.command
```

## 執行方式

在 Mac Studio 的 `Ewalk.ai Brain`：

```zsh
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/firebase"
zsh "./B17B-B22內部ApprovalQueue正式寫入批次驗證.command"
```

## 通過標準

通過時應看到：

```text
wrote_to_firestore: 8
verified_from_firestore: 8
approval_count: 6
overall_status: passed_internal_production_write_review
external_side_effects_allowed: false
```

## 寫入範圍

允許：

- `approvals/{approvalId}`
- `audit_logs/{logId}`

不允許：

- `clients`
- `content_queue`
- `campaign_reports`
- `ai_runs`
- `assets`
- `ad_accounts`
- `usage_costs`
- `subscriptions`
- `settings`
- 任何正式客戶通道、發文、部署、廣告預算或金流相關 collection / 外部系統。

## 產出檔案

```text
08_自動化/firebase/output/approval-queue-firestore-write-result.json
08_自動化/firebase/output/internal-production-approval-workflow.review.json
```

這兩個檔案是本機結果與審查報告，不需要 commit。

## 安全護欄

`write-approval-queue-firestore.mjs` 必須同時滿足以下條件才會寫入：

- `--confirm-project ewalk-ai-system-prod`
- `--approved-by "提姆先生"`
- `--confirm-scope B17B_APPROVALS_AUDIT_LOGS_ONLY`
- `--write`
- preview 必須是 B17A / B17-B20 產生。
- preview 必須標示 `production_write_allowed: false`。
- preview 寫入路徑只能是 `approvals/` 或 `audit_logs/`。
- preview 必須明確封鎖正式客戶通道、廣告預算與金流。

## 明確禁止

- BLOCKED：不能發文。
- BLOCKED：不能部署。
- BLOCKED：不能接正式客戶通道。
- BLOCKED：不能操作廣告預算。
- BLOCKED：不能操作金流、帳務或付款設定。
- BLOCKED：不能把 approvals 寫入視為正式執行批准。
- BLOCKED：不能讓 OpenClaw 直接使用工具、exec、寫檔、讀完整 Brain 或讀接案碟。

## B17B-B22 通過後代表什麼

代表：

- production Firebase 內已有內部 approval queue。
- production Firebase 內已有對應 audit logs。
- Command Center 可讀取與顯示正式 approval queue。
- 內部批准流程可以被追蹤。

不代表：

- 可以正式發文。
- 可以正式部署。
- 可以接正式客戶通道。
- 可以操作廣告預算。
- 可以操作金流、帳務或付款設定。
- OpenClaw 可以任意讀檔、寫檔或 exec。

## 下一步

若 B17B-B22 通過，下一步才評估：

```text
Command Center 讀取正式 approval queue 的實機畫面驗收。
```

這仍是只讀與內部追蹤，不等於開放任何外部副作用。

## 關聯文件

- [[2026-06-07_B17-B20內部ApprovalQueue批次審查]]
- [[2026-06-07_B17A正式FirestoreApprovalQueue寫入預覽]]
- [[2026-06-07_B9權限逐步開放測試計畫]]
