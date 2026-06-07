---
類型: SOP
狀態: 啟用前，等待 B29 Mac Studio 實機通過
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - SOP
  - OpenClaw
  - 高權限
  - Approval
  - Command Center
---

# OpenClaw 高權限作業批准 SOP

## 用途

讓 OpenClaw 不再只做低風險整理，而是可以準備並推進高權限工作：發文、部署、production Firebase 改狀態、正式客戶通道、廣告預算與金流。

## 核心原則

高權限工作不是禁止，而是走 approval gate。

沒有提姆先生明確批准時：

- 可以讀指定資料。
- 可以寫草稿。
- 可以產生 preview。
- 可以產生 diff。
- 可以產生 action queue。
- 可以建立 approval item。

不能直接執行。

有提姆先生明確批准時：

- 可由 Codex、Command Center 或對應正式工具執行。
- 必須留下 audit log。
- 必須保留 preview / diff / recovery plan。

## 六類高權限

1. 發文 / 排程發文。
2. 部署。
3. production Firebase 改狀態。
4. 正式客戶通道。
5. 廣告預算。
6. 金流 / 帳務 / 付款設定。

## 每個 action 必備欄位

```text
approval_id
capability_id
client_or_project
requested_action
risk_summary
preview_or_diff_path
rollback_or_recovery_plan
approved_by
approval_text
approved_at
```

## 批准文字格式

提姆先生批准時，建議使用：

```text
批准 action_id: [id]
批准能力: [發文 / 部署 / Firebase / 正式通道 / 廣告 / 金流]
批准範圍: [客戶 / 專案 / 文件 / 平台 / 預算上限 / 時間]
限制: [例如只排程、不立即發布；預算上限；只改指定欄位]
```

## 發文

可先做：

- 文案草稿。
- 視覺 preview。
- 發文檢查清單。
- 發文 approval item。

批准後才可：

- 正式發布。
- 排程發布。
- 修改已發布內容。

## 部署

可先做：

- build / preview。
- release note。
- rollback plan。
- deployment approval item。

批准後才可：

- production deploy。
- 修改 production env。
- 推送正式網站。

## production Firebase

可先做：

- read-only 查詢。
- write preview。
- before / after diff。
- audit log preview。

批准後才可：

- 寫入指定 collection / document。
- 修改指定欄位。
- 回查驗證。

## 正式客戶通道

可先做：

- 訊息草稿。
- 回覆建議。
- 人工發送清單。
- channel approval item。

批准後才可：

- 傳送正式訊息。
- 進入指定通道。
- 代表 Ewalk.ai 對外回覆。

## 廣告預算

可先做：

- 投放架構。
- 受眾與文案草稿。
- PAUSED draft。
- 預算上限檢查。

批准後才可：

- 啟用廣告。
- 修改預算。
- 修改投放設定。

## 金流 / 帳務

可先做：

- 帳務檢查清單。
- 訂閱稽核草稿。
- 付款設定變更建議。
- approval item。

批准後才可：

- 付款。
- 退款。
- 取消訂閱。
- 修改付款方式。
- 更改帳務設定。

## 失敗處理

若發生未批准執行：

1. 立即停止該工具或流程。
2. 回填事件到每日工作。
3. 保留 action_id、log 與執行者。
4. 回復前一狀態或執行 recovery plan。
5. 由提姆先生決定是否恢復高權限。
