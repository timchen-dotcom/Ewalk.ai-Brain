---
類型: 權限逐步開放測試
階段: B23
狀態: 已通過
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Firebase
  - Command Center
  - Approval Queue
  - read-only
  - 權限測試
---

# 2026-06-07 B23 Command Center 正式 Approval Queue 只讀驗收

## 一句話結論

B23 是在 B17B-B22 正式 approvals / audit_logs 窄範圍寫入通過後，驗證 Command Center 能不能只讀 production Firebase 的 approval queue 並產生本機畫面資料；不寫 Firebase、不發文、不部署、不接正式客戶通道、不碰廣告預算或金流。

## 2026-06-07 實機結果

Mac Studio 實機通過：

```text
overall_status: passed_command_center_production_readonly
production_write_allowed: false
external_side_effects_allowed: false
```

判定：

- B23 通過。
- Command Center 已可取得 production-readonly approval queue snapshot。
- 本階段仍未開放任何寫入、發文、部署、正式客戶通道、廣告預算或金流操作。
- 下一關進入 B24 Command Center 主畫面只讀安全驗收。

## 前置條件

- B17B-B22 已通過。
- Mac Studio Firebase CLI 已重新登入。
- production Firebase 已有內部 `approvals` 與 `audit_logs`。
- 本階段只允許讀取 `approvals` / `audit_logs`。

## 新增工具

```text
08_自動化/firebase/scripts/read-approval-queue-firestore.mjs
08_自動化/firebase/B23CommandCenter正式ApprovalQueue只讀驗收.command
```

## 執行方式

在 Mac Studio：

```zsh
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain"
git pull
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/firebase"
zsh "./B23CommandCenter正式ApprovalQueue只讀驗收.command"
```

## 通過標準

通過時應看到：

```text
approval_count: 6
audit_log_count: 至少 1
overall_status: passed_command_center_production_readonly
production_write_allowed: false
external_side_effects_allowed: false
```

## 產出檔案

```text
08_自動化/firebase/output/command-center-production-readonly.snapshot.json
08_自動化/firebase/output/command-center-production-readonly.review.json
08_自動化/firebase/command-center-app/data/approval-queue.js
```

這些是本機只讀 snapshot 與 review，不需要 commit。

## 安全護欄

- 只讀 `approvals`。
- 只讀 `audit_logs`。
- 不讀 `clients`、`content_queue`、`campaign_reports`、`ai_runs`、`assets`、`ad_accounts`、`usage_costs`、`subscriptions` 或 `settings`。
- 不修改任何 approval status。
- 不寫入 Firebase。
- 不發文、不部署、不接正式客戶通道。
- 不操作廣告預算、金流、帳務或付款設定。

## B23 通過後代表什麼

代表：

- Command Center 可以使用 production-readonly snapshot 顯示正式 approval queue。
- 內部批准佇列已能從 Firebase 進入 Command Center 畫面驗收。
- approvals / audit_logs 可以作為內部追蹤資料源。

不代表：

- 可以按批准按鈕改狀態。
- 可以發文。
- 可以部署。
- 可以接正式客戶通道。
- 可以操作廣告預算或金流。
- OpenClaw 可以讀完整 Brain、接案碟或使用任意工具。

## 下一步

若 B23 通過，下一步才評估：

```text
B24 Command Center 本機畫面人工驗收：確認待批准、已批准未執行與風險欄位是否正確呈現。
```

B24 仍是本機畫面檢查，不等於開放任何外部副作用。
