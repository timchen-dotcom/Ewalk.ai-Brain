# 2026-06-05 Mac Studio 原機檢查回填表

## 用途

這份表單用來記錄 Mac Studio 原機檢查結果。完成後，阿順才能重新判定是否可重置。

## 本次回填來源

- 2026-06-05 提姆先生自 Mac Studio 帶回 `2026-06-05_阿順主機日報.md`、`host-status.latest.json`、`harness-runs.json`。
- 判讀文件：[[2026-06-05_MacStudio阿順主機狀態判讀]]
- 這批檔案屬於阿順主機 / Host Harness 狀態，不等於完整重置前六份只讀稽核輸出。

## 一、舊 Codex thread 交接摘要

| 優先 | Thread | 狀態 | 摘要檔 |
| --- | --- | --- | --- |
| P0 | 工作交辦窗口 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P0_工作交辦窗口.md` |
| P0 | Ewalk.ai 專業經理人 - 阿順 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P0_Ewalk-ai專業經理人-阿順.md` |
| P0 | 霖老師線上車庫 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P0_霖老師線上車庫.md` |
| P1 | 韓食日常鍋物自動發文系統 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P1_韓食日常鍋物自動發文系統.md` |
| P1 | 韓食日常鍋物六月開幕廣告 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P1_韓食日常鍋物六月開幕廣告.md` |
| P1 | TheVision 官網重做 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P1_TheVision官網重做.md` |
| P1 | TheDay 分店訂購管理系統 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P1_TheDay分店訂購管理系統.md` |
| P1 | 正官庄行銷稽核系統 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P1_正官庄行銷稽核系統.md` |
| P1 | Ewalk.ai 阿順語音系統 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P1_Ewalk-ai阿順語音系統.md` |
| P2 | Ewalk.ai 自動化製作文案簡報系統 | 已先以 Vault 脈絡回填，待原 thread 補強 | `舊主機thread交接摘要/P2_Ewalk-ai自動化製作文案簡報系統.md` |

## 二、常駐自動化與排程

| 檢查項目 | 狀態 | 發現內容 | 處理方式 |
| --- | --- | --- | --- |
| Codex Automations | 部分回填 | 這批檔案未包含 Codex Automations 設定；已確認 Host Harness 最近一批 4 筆 L1 任務全成功。 | 仍需原機或 Codex UI 補查 automation 清單。 |
| LaunchAgents / LaunchDaemons | 待回填 | 主機日報提到「待提姆先生批准後，安裝 launchd 常駐排程」，但未提供 `launchctl` 清單。 | 需取得 `03_automation_and_schedules.txt`。 |
| crontab | 待回填 | 未提供 crontab 輸出。 | 需取得完整只讀稽核。 |
| pmset schedule | 待回填 | 未提供 `pmset -g sched`；已確認 `sleep=0`、`disksleep=0`。 | 需取得完整只讀稽核。 |
| node / python / firebase / vercel 程序 | 部分回填 | Host Harness 能更新客戶名冊、Command Center 本機資料、主機日報；排程來源未確認。 | 先保留 Mac Studio，不搬移或停用。 |
| ollama / openclaw / codex 程序 | 部分回填 | OpenClaw 尚未接正式資料，目前只允許 test workspace。 | 正式資料接入前需另案驗收。 |
| Chrome / 瀏覽器登入依賴 | 待回填 | 這批檔案未包含 Chrome Profile 或登入依賴。 | 需原機人工確認或完整稽核補充。 |
| Discord / 每日交接提醒 | 部分回填 | 阿順主機日報可產出；是否由 Discord / Automations / launchd 觸發尚未確認。 | 需取得排程清單。 |
| Google Ads / Meta 發文流程 | 部分回填 | 日報明確列出不會自動發文、改廣告預算、動金流或正式部署；韓食發文與 TheVision 預算仍為待批准。 | 維持批准制，不啟用正式流程。 |

## 三、完整備份驗證

| 備份項目 | 狀態 | 備份位置 | 抽查結果 |
| --- | --- | --- | --- |
| Time Machine | 待回填 |  |  |
| 外接硬碟備份 | 部分回填 | `/Volumes/提姆接案碟` 已掛載，約 2.2TiB 可用 | 只確認掛載，尚未確認備份內容可讀。 |
| `Ewalk.ai 自動化系統` | 部分回填 | Mac Studio workspace 約 17G | 尚未確認完整備份位置與抽查。 |
| Desktop | 待回填 |  |  |
| Documents | 待回填 |  |  |
| Downloads | 待回填 |  |  |
| 瀏覽器 Profile | 待回填 |  |  |
| 私密憑證保管方案 | 待回填 | 不明文記錄 |  |

## 四、最後判定

- Mac Studio 是否可重置：不可重置
- 還缺什麼：完整只讀稽核六份輸出、排程清單、備份抽查、私密憑證候選路徑盤點、舊 thread 原機補強或替代批准
- 需提姆先生批准事項：正式重置、韓食正式自動發文、GitHub 自我升級情報頻率、Firebase Blaze / Storage、TheVision Meta 月預算上限
- 阿順判斷日期：2026-06-05
