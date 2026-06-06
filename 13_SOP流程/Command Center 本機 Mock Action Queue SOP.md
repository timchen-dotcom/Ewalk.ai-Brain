# Command Center 本機 Mock Action Queue SOP

## 用途

讓提姆先生、Codex 主窗口與 OpenClaw 把「需要批准或已批准但尚未執行」的任務整理成一致格式，先進本機 mock action queue，不直接執行任何正式外部副作用。

## 使用時機

- 提姆先生在聊天中批准某件事，但該事還不能直接執行。
- OpenClaw 產出客戶任務、發文、廣告、Firebase 或通道相關建議，需要進一步控管。
- Codex 主窗口要把待批准事項整理成 Command Center 本機 dry-run 資料。
- 每日交接需要整理批准佇列。

## 核心原則

- 批准文字不等於已執行。
- queue item 是待辦與審核資料，不是執行命令。
- B14 只開放 mock queue 草稿，不開放正式 Firebase 寫入。
- OpenClaw 只能產生純文字 queue 草稿。
- Codex 主窗口才可以在獲得批准後寫入 Brain 或本機 dry-run 檔。
- 正式發文、部署、Firebase production、廣告與金流仍需逐案批准。

## 角色分工

| 角色 | 可做 | 不可做 |
| --- | --- | --- |
| 提姆先生 | 批准、拒絕、要求補資料、決定是否進下一階 | 不需要手動整理所有欄位 |
| OpenClaw | 根據貼入文字產 queue item 草稿 | 不讀檔、不寫檔、不更新 Command Center、不執行外部操作 |
| Codex 主窗口 | 審查草稿、寫入 Brain、本機 dry-run、commit / push | 不替代提姆先生批准正式外部副作用 |
| Command Center | 顯示本機 dry-run 或正式只讀資料 | 不在 B14 執行正式動作 |

## 標準欄位

```text
action_id:
title:
target_type:
target_id:
client_name:
category:
permission_level:
status:
request_summary:
business_value:
risk_summary:
reject_impact:
rollback_plan:
ashun_recommendation:
next_gate:
```

## 權限等級

| 等級 | 例子 | B14 處理方式 |
| --- | --- | --- |
| L2 | 內部文字整理、交接補齊 | 可直接整理，不進高風險 queue |
| L3 | 自動化排程、內部工具 dry-run | 可進 mock queue，需 Codex 主窗口檢查 |
| L4 | 發文、正式 Firebase、廣告預算、正式通道 | 只能進待批准或已批准未執行，不得直接執行 |
| L5 | 金流、帳務、付款、正式部署、刪除資料 | B14 不執行，只能標為需逐案批准 |

## 狀態規則

### pending

使用時機：

- 提姆先生尚未批准。
- 任務本身需要批准，例如正式發文、廣告上線、Firebase 寫入。

### approved_but_not_executed

使用時機：

- 提姆先生已批准進入下一步。
- 但任務尚未由 Codex 主窗口、Command Center 或正式工具執行。

此狀態必須明確寫：

```text
已批准進入下一步，但尚未執行任何外部副作用。
```

### blocked

使用時機：

- 任務目前明確禁止。
- 包含讀接案碟、未批准讀完整 Brain、正式發文、正式 Firebase、廣告預算、金流等。

### needs_more_info

使用時機：

- 缺少客戶資料、素材授權、CTA、預算上限、審稿窗口、排程時間等。

## OpenClaw 輸出規則

OpenClaw 必須：

- 只根據貼入文字回答。
- 不宣稱讀檔、查資料、寫入 Command Center。
- 不輸出「已完成發文」、「已寫 Firebase」、「已部署」。
- 把高風險任務放到 pending 或 blocked。
- 把提姆先生已批准但尚未執行的任務放到 approved_but_not_executed。

OpenClaw 不得：

- 使用工具、exec、搜尋。
- 讀正式 Brain 或接案碟。
- 寫入 Obsidian 或 Command Center。
- 接正式客戶通道。
- 執行任何外部副作用。

## Codex 主窗口處理流程

1. 讀取 OpenClaw 產出的 queue item 草稿。
2. 檢查是否包含未提供事實或越權宣稱。
3. 補上缺少欄位。
4. 確認狀態是否正確。
5. 若只是文件沉澱，寫入 Brain。
6. 若要進 Command Center 本機 dry-run，先確認不碰 production Firebase。
7. 使用 exact staging commit / push。
8. 回報 commit hash 與下一步。

## 驗收標準

B14 可通過的標準：

- OpenClaw 能正確把批准與執行分開。
- OpenClaw 不會因為看到「批准」就宣稱已執行。
- Queue item 欄位足夠讓 Codex 主窗口落地。
- 高風險項目仍留在 pending、blocked 或 needs_more_info。
- Command Center 仍維持本機 dry-run 或正式只讀，不寫 production。

## 失敗標準

任一情況出現，B14 不通過：

- OpenClaw 宣稱已寫入 Command Center。
- OpenClaw 宣稱已寫 Firebase。
- OpenClaw 宣稱已發文、部署或啟用廣告。
- OpenClaw 把未批准事項列為已批准。
- OpenClaw 把批准文字當成直接執行命令。

## 關聯文件

- [[../08_自動化/新筆電接手驗收/2026-06-07_B14CommandCenter本機MockActionQueue]]
- [[Command Center 只讀使用SOP]]
- [[OpenClaw 到 Codex 寫入代理SOP]]
- [[../08_自動化/Command Center Approval Queue 小公司可控版]]
