---
類型: 權限逐步開放測試
階段: B24
狀態: 已補防呆，待 Mac Studio 重跑
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

# 2026-06-07 B24 Command Center 主畫面只讀安全驗收

## 一句話結論

B24 驗證 Command Center 主畫面能安全呈現 B23 產生的 production-readonly approval queue snapshot，並確認主畫面沒有 Firestore 寫入 API、高風險工具連結或外部執行入口。

## 2026-06-07 第一次實機結果與修正

Mac Studio 第一次實機結果：

```text
approval_count: 0
pending_count: 0
approved_but_not_executed_count: 0
overall_status: blocked
production_write_allowed: false
external_side_effects_allowed: false
```

判定：

- B24 第一次實跑未通過。
- 原因是 `command-center-app/data/approval-queue.js` 在 `git pull` 後可能被 repo 版空資料覆蓋，導致 approval queue 為 0 筆。
- 已補防呆：B24 會從 B23 production-readonly snapshot 還原 app data。
- 已補防呆：若 B24 判定 blocked，script 會回傳非 0，不再讓後續流程誤判通過。
- 待 Mac Studio 重跑 B24。

## 前置條件

- B17B-B22 已通過。
- B23 已通過。
- Mac Studio 本機已有：
  - `output/command-center-production-readonly.review.json`
  - `command-center-app/data/approval-queue.js`

## 新增工具

```text
08_自動化/firebase/scripts/review-command-center-approval-queue-app.mjs
08_自動化/firebase/B24CommandCenter主畫面只讀安全驗收.command
```

## 執行方式

在 Mac Studio：

```zsh
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain"
git pull
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/firebase"
zsh "./B24CommandCenter主畫面只讀安全驗收.command"
```

## 通過標準

通過時應看到：

```text
approval_count: 至少 6
pending_count: 至少 1
approved_but_not_executed_count: 至少 1
overall_status: passed_command_center_app_readonly_review
production_write_allowed: false
external_side_effects_allowed: false
```

## 檢查範圍

只檢查：

- `command-center-app/index.html`
- `command-center-app/app.js`
- `command-center-app/firestore-live-adapter.js`
- `command-center-app/data/approval-queue.js`
- B23 production-readonly review

不檢查、不開啟、不接入：

- owner bootstrap
- client import
- rules deploy
- 正式發文工具
- 正式客戶通道
- 廣告預算或金流工具

## 安全護欄

- 主畫面不得出現 Firestore 寫入 API。
- 主畫面不得連到高風險工具頁。
- 主畫面不得提供批准並執行、立即發文、部署、付款或啟用廣告的入口。
- approval queue 只做呈現，不改 status。
- B24 不寫 Firebase。

## 防呆

- 若 `command-center-app/data/approval-queue.js` 在 `git pull` 後被 repo 版空資料覆蓋，B24 會從 `output/command-center-production-readonly.snapshot.json` 還原 production-readonly app data。
- 若 B24 判定 `overall_status: blocked`，script 會回傳非 0，不應繼續進 B25。

## B24 通過後代表什麼

代表：

- Command Center 主畫面可安全顯示 production-readonly approval queue。
- 提姆先生可以用主畫面檢查待批准、已批准未執行與風險欄位。
- 高風險工具仍保持隔離。

不代表：

- 可以在畫面按批准並直接改 production。
- 可以正式發文。
- 可以正式部署。
- 可以接正式客戶通道。
- 可以操作廣告預算或金流。

## 下一步

若 B24 通過，下一步才評估：

```text
B25 Command Center approval item 人工決策流程 mock。
```

B25 仍只能做 mock，不直接修改 production Firebase。
