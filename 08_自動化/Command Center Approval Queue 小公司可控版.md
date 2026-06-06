# Command Center Approval Queue 小公司可控版

建立日期：2026-06-02  
負責角色：阿順  
最終決策者：提姆先生  
狀態：本機 dry-run 已接入 Command Center；B14 mock action queue 測試已建立；尚未正式寫入 Firestore

## 用途

Approval Queue 是 Command Center 裡的「等待批准」區。

它的任務是把高風險工作集中起來，讓提姆先生只需要看白話摘要：

- 要批准什麼
- 為什麼值得做
- 有什麼風險
- 不批准會怎樣
- 阿順建議怎麼處理

## 第一版原則

- 先本機 dry-run，不直接寫正式 Firebase。
- 只顯示待批准事項，不提供一鍵正式執行。
- 對外發布、金流、廣告預算、核心規則都必須進入批准佇列。
- 批准後仍要再由對應工具執行，不能把「批准」等同於「已執行」。

## 第一版欄位

| 欄位 | 用途 |
| --- | --- |
| `approval_id` | 批准紀錄 ID |
| `target_type` | 影響對象類型，例如 `content_queue`、`automation`、`ad_budget` |
| `target_id` | 影響對象 ID |
| `client_id` | 客戶 ID，系統級任務可為空 |
| `client_name` | 客戶或系統名稱 |
| `category` | 批准類型，例如發文、金流、廣告預算 |
| `permission_level` | 權限等級，L4 / L5 必須特別謹慎 |
| `status` | `pending`、`approved`、`rejected`、`changes_requested`、`expired` |
| `request_summary` | 要批准什麼 |
| `business_value` | 做了有什麼幫助 |
| `risk_summary` | 主要風險 |
| `reject_impact` | 不批准會怎樣 |
| `rollback_plan` | 回退方式 |
| `ashun_recommendation` | 阿順建議 |

## 目前 dry-run 樣板

| 事項 | 類型 | 權限 | 狀態 | 阿順建議 |
| --- | --- | --- | --- | --- |
| 韓食日常鍋物品牌日常貼文進入正式發文流程 | 對外發布 | L4 | pending | 先不要自動發，等 Meta 發文工具與標示規則再做最終批准 |
| 每日 04:00 GitHub 自我升級情報研究 | 排程研究 | L3 | pending | 先做每週一次摘要，比每日跑更省 token |
| Firebase Blaze / Storage 啟用 | 金流 / 付費 | L4 | pending | 目前先不批准，等主機與預算監控建好後再開 |
| TheVision Meta 廣告月預算上限設定 | 廣告預算 | L4 | pending | 先做內部建議，不接正式廣告帳戶 |

## 已建立檔案

- `Ewalk.ai Brain/08_自動化/firebase/output/approval-queue.dry-run.json`
- `Ewalk.ai Brain/08_自動化/firebase/command-center-app/data/approval-queue.js`
- `Ewalk.ai Brain/08_自動化/firebase/scripts/create-approval-queue-dry-run.mjs`
- `Ewalk.ai Brain/08_自動化/firebase/scripts/build-approval-queue-app-data.mjs`
- `建立ApprovalQueueDryRun.command`

## 下一步

1. 提姆先生檢查 Approval Queue 的欄位與呈現方式。
2. B14 先測 OpenClaw 能否把批准文字整理成 mock action queue 草稿。
3. 若 B14A 通過，再由 Codex 主窗口整理本機 dry-run 寫入候選。
4. 若欄位 OK，再準備正式 Firestore `approvals` 寫入預覽。
5. 提姆先生批准後，才正式寫入 `approvals` 與 `audit_logs`。
6. 正式寫入後，Command Center Live Read 可讀取正式批准佇列。

## 安全限制

- 本階段沒有正式批准按鈕。
- 本階段沒有執行發文、廣告、金流或排程。
- 本階段沒有寫入正式 Firestore `approvals`。
- 所有正式寫入仍需提姆先生逐項批准。

## B14 Mock Action Queue 規則

B14 只開放「草稿整理」：

- OpenClaw 可根據人工貼入文字產出 queue item 草稿。
- Codex 主窗口負責檢查、補欄位、寫入 Brain 或本機 dry-run。
- Command Center 仍只顯示本機 dry-run 或正式只讀資料。

B14 不開放：

- OpenClaw 寫入 Command Center。
- OpenClaw 或 Command Center 直接執行 queue item。
- production Firebase 寫入。
- 發文、部署、廣告預算、金流、帳務或付款設定。
