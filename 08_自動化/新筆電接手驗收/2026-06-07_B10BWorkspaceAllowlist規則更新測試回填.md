---
類型: Workspace allowlist 規則更新測試回填
階段: B10B
狀態: 已完成，待重跑 B10A
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - OpenClaw
  - workspace規則
  - allowlist
  - 正式Brain
  - 只讀
---

# 2026-06-07 B10B Workspace Allowlist 規則更新測試回填

## 測試目的

B10B 的目的，是解除 B10A 被上層 workspace 規則擋住的問題，但不開放完整正式 Brain。

本階段只允許更新 OpenClaw Test Workspace 的 `AGENTS.md`，讓 B10A 指定的 10 個正式 Brain 檔案成為 exact path read-only 例外。

## 提姆先生回報

提姆先生回報：

- 已完成 B10B 規則更新。
- 只修改 OpenClaw Test Workspace 的 `AGENTS.md`。
- 更新內容是窄例外：只允許 B10A 指定的 10 個正式 Brain 檔案 read-only。
- 仍明確禁止讀完整 Brain、客戶資料、接案碟、寫檔、exec、搜尋、正式通道、Firebase、發文、部署、廣告預算、金流、帳務與付款設定。
- 沒有讀正式 Brain。
- 沒有 exec。
- 沒有搜尋。
- 沒有碰接案碟或正式通道。

## 判定

B10B 判定為：已完成，待重跑 B10A。

這代表 workspace 規則已準備好進行下一輪 B10A allowlist read-only 測試，但不代表 B10A 已通過。

## 目前仍禁止

- BLOCKED：讀完整 `Ewalk.ai Brain`。
- BLOCKED：讀 `Ewalk.ai Brain/01_客戶`。
- BLOCKED：讀 `Ewalk.ai Brain/00_收件匣`。
- BLOCKED：讀 `Ewalk.ai Brain/03_廣告`。
- BLOCKED：讀 `Ewalk.ai Brain/04_報表`。
- BLOCKED：讀 `Ewalk.ai Brain/06_素材`。
- BLOCKED：讀 `/Volumes/提姆接案碟`。
- BLOCKED：讀 secret、token、`.env`、Firebase local config、付款資料、廣告帳戶設定、帳務資料。
- BLOCKED：寫檔、修改檔案、commit、push。
- BLOCKED：exec、搜尋網路、接正式客戶通道。
- BLOCKED：發文、部署、寫 Firebase、操作廣告預算、金流或帳務。

## 下一步

- TODO：重跑 B10A 正式 Brain 限定路徑 read-only 測試。
- TODO：確認 OpenClaw 是否能只讀 allowlist 10 個檔案。
- TODO：確認 OpenClaw 不會列目錄、搜尋正式 Brain、讀 sibling files 或推測客戶資料。
- TODO：若 B10A 成功，再回填 B10A 最終結果。
- TODO：若 B10A 仍被擋住，停在 B10A / B10B，不升級權限。

## 關聯文件

- [[2026-06-07_B10BWorkspaceAllowlist規則更新測試包]]
- [[2026-06-07_B10A正式Brain限定路徑ReadOnly測試包]]
- [[2026-06-07_B10A正式Brain限定路徑ReadOnly測試回填]]
- [[2026-06-07_B9權限逐步開放測試計畫]]
- [[../../13_SOP流程/OpenClaw 權限逐步開放測試SOP]]
