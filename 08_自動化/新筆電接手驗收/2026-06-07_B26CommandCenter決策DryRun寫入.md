---
類型: 權限逐步開放測試
階段: B26
狀態: 已建立工具，等待 Mac Studio 實機執行
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Firebase
  - Command Center
  - Approval Queue
  - decision-dry-run
  - 權限測試
---

# 2026-06-07 B26 Command Center 決策 Dry-run 寫入

## 一句話結論

B26 驗證 B25 產生的人工決策 mock 可以被整理成本機 audit trail 與 action queue dry-run，但不寫 production Firebase、不改 approval status、不執行發文、部署、正式通道、廣告或金流。

## 前置條件

- B23 已通過。
- B24 已通過。
- B25 已通過。
- Mac Studio 本機已有：
  - `output/command-center-approval-decision.mock.json`
  - `output/command-center-approval-decision.review.json`

## 新增工具

```text
08_自動化/firebase/scripts/build-command-center-decision-dry-run.mjs
08_自動化/firebase/B26CommandCenter決策DryRun寫入.command
```

## 執行方式

在 Mac Studio：

```zsh
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain"
git pull
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/firebase"
zsh "./B26CommandCenter決策DryRun寫入.command"
```

## 通過標準

通過時應看到：

```text
overall_status: passed_command_center_decision_dry_run
production_write_allowed: false
external_side_effects_allowed: false
```

## 產出檔案

```text
08_自動化/firebase/output/command-center-decision-audit-trail.dry-run.json
08_自動化/firebase/output/command-center-action-queue.dry-run.json
08_自動化/firebase/output/command-center-decision-dry-run.review.json
```

這些都是本機 dry-run 檔案，不需要 commit。

## 安全護欄

- 只讀 B25 mock decision packet。
- 只寫本機 dry-run JSON。
- 不寫 production Firebase。
- 不改 production approval status。
- `keep_pending` 必須維持 `pending`。
- 不發文、不部署、不接正式客戶通道。
- 不操作廣告預算、金流、帳務或付款設定。

## B26 通過後代表什麼

代表：

- Command Center 的人工決策可以被轉成可追蹤的本機 audit trail。
- Command Center 可以產生 action queue dry-run，讓阿順與提姆先生檢查下一步。
- 決策流程進入「可追蹤但不執行」狀態。

不代表：

- 可以真的修改 production approval status。
- 可以真的把 action queue 接到正式執行器。
- 可以正式發文。
- 可以部署。
- 可以接正式客戶通道。
- 可以操作廣告預算或金流。

## 下一步

若 B26 通過，下一步才評估：

```text
B27 Command Center 決策 review UI / 人工確認流程。
```

B27 仍應維持人工確認，不直接改 production 或執行外部副作用。
