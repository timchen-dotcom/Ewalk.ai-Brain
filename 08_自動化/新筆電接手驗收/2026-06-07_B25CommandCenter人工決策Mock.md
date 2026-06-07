---
類型: 權限逐步開放測試
階段: B25
狀態: 已建立工具，等待 B24 重跑通過後 Mac Studio 實機執行
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Firebase
  - Command Center
  - Approval Queue
  - decision-mock
  - 權限測試
---

# 2026-06-07 B25 Command Center 人工決策 Mock

## 一句話結論

B25 驗證 Command Center 可以把單筆 approval item 轉成「人工決策資料包」與「audit log 預覽」，但不寫入 production Firebase、不改 approval status、不執行任何外部動作。

## 前置條件

- B17B-B22 已通過。
- B23 已通過。
- B24 已通過。
- Mac Studio 本機已有：
  - `output/command-center-approval-queue-app.review.json`
  - `command-center-app/data/approval-queue.js`

## 新增工具

```text
08_自動化/firebase/scripts/prepare-command-center-approval-decision-mock.mjs
08_自動化/firebase/B25CommandCenter人工決策Mock.command
```

## 執行方式

在 Mac Studio：

```zsh
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain"
git pull
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/firebase"
zsh "./B25CommandCenter人工決策Mock.command"
```

## 通過標準

通過時應看到：

```text
approval_id: 任一筆 approval
mock_decision: keep_pending
overall_status: passed_command_center_decision_mock
production_write_allowed: false
external_side_effects_allowed: false
```

## 產出檔案

```text
08_自動化/firebase/output/command-center-approval-decision.mock.json
08_自動化/firebase/output/command-center-approval-decision.review.json
```

這些是本機 mock 決策資料包與 review，不需要 commit。

## 安全護欄

- 只產生 mock decision packet。
- 只產生 audit log preview。
- 不寫入 Firebase。
- 不改 production approval status。
- 不把 `pending` 改成 `approved`。
- 不發文、不部署、不接正式客戶通道。
- 不操作廣告預算、金流、帳務或付款設定。

## 防呆

- 若本機 `approval-queue.js` 是空的或不是 production-readonly，B25 會從 B23 production-readonly snapshot 還原 approval queue，再產生 mock decision packet。
- 若 B24 review 不是 `passed_command_center_app_readonly_review`，B25 會判定 blocked，不得前進。

## B25 通過後代表什麼

代表：

- Command Center 已能把單筆 approval item 整理成人工決策資料包。
- 決策資料包有原狀態、擬議狀態、決策者、決策理由與 audit log preview。
- 高風險項目仍能被標記並維持封鎖。

不代表：

- 可以在 production 改 approval status。
- 可以真的批准發文或部署。
- 可以接正式客戶通道。
- 可以操作廣告預算或金流。

## 下一步

若 B25 通過，下一步才評估：

```text
B26 決策結果寫入本機 audit trail / action queue dry-run。
```

B26 仍只能寫本機 dry-run，不寫 production Firebase。
