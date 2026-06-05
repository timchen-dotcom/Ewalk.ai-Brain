# 2026-06-05 Mac Studio 阿順主機狀態判讀

## 用途

記錄提姆先生從 Mac Studio 帶回的新一批主機狀態檔判讀結果，避免把「部分主機日報」誤判成「完整重置前稽核」。

## 來源

提姆先生已放到新筆電：

```text
/Users/timchen/Desktop/mac-studio-pre-reset-audit-20260605/
```

已讀檔案：

- `2026-06-05_阿順主機日報.md`
- `host-status.latest.json`
- `harness-runs.json`

判斷：這批檔案是 Mac Studio 阿順主機 / Host Harness 狀態輸出，不是完整的 Mac Studio 重置前六份只讀稽核輸出。

## 一句話結論

Mac Studio 確認仍是一台可運作的阿順主機，低風險 Harness 任務正常，安全邊界看起來守住。此文件原判斷偏保守；後續已依提姆先生決策改採 [[2026-06-05_MacStudio風險接受重置策略]]，不再以完整稽核作為重置硬阻擋。

## 已確認

| 項目 | 判讀 |
| --- | --- |
| 主機身份 | `chenjintingdeMac-Studio.local`，定位為阿順專用主機。 |
| 硬體 | Mac Studio / Apple M1 Max / 32 GB。 |
| macOS | macOS 26.2，Build 25C56。 |
| 睡眠設定 | 主機睡眠 `sleep=0`、磁碟睡眠 `disksleep=0`，符合長時間運作需求。 |
| 外接工作碟 | `/Volumes/提姆接案碟` 已掛載，9.1TiB 容量，約 2.2TiB 可用。 |
| Vault / workspace 尺寸 | Vault 約 3.9G，workspace 約 17G。 |
| 客戶資料 | 主機日報顯示 17 位客戶可讀取。 |
| Harness 執行 | 共 16 筆，最近一批 4 筆全成功。 |
| 權限級別 | 最近任務皆為 L1，`approval_required=false`。 |
| 高風險邊界 | 外部副作用預設封鎖，高風險動作需批准，正式 Firestore 寫入需批准。 |
| OpenClaw | 目前只允許 test workspace，尚未接正式資料。 |

## 近期 Harness 任務

最近一批已成功：

- 阿順主機狀態檢查
- 客戶名冊本機資料更新
- Command Center 本機資料更新
- 阿順主機日報產出

判讀：Mac Studio 上已有一組低風險本機 Harness 能產生日報、更新客戶名冊與 Command Center 本機資料。這代表舊機仍有實際工作狀態，不應直接重置。

## 主要風險

### 1. 內建資料碟空間偏緊

`/System/Volumes/Data` 顯示：

```text
used: 397Gi
available: 39Gi
capacity: 92%
```

判讀：這不是立即故障，但已接近不舒服區間。重置前若還要跑大量備份、壓縮或素材整理，需優先把大型素材移到外接硬碟或備份碟。

### 2. launchd 是否安裝仍未確認

主機日報的下一步寫著：

```text
待提姆先生批准後，安裝 launchd 常駐排程。
```

判讀：目前看起來 launchd 常駐排程可能尚未正式安裝，但這只是從日報文字推論，不能替代原機 `launchctl` / `crontab` / `pmset schedule` 清單。

### 3. 這批不是完整重置稽核

目前缺少完整只讀稽核應有的輸出：

- `00_system.txt`
- `01_folder_sizes.txt`
- `02_git_status.txt`
- `03_automation_and_schedules.txt`
- `04_sensitive_path_candidates.txt`
- `05_recent_ewalk_files.txt`

判讀：沒有這六份，就不能說 Mac Studio 已完成重置前檢查。

### 4. 備份可讀尚未證明

這批檔案顯示工作碟已掛載，但沒有證明 Time Machine、外接硬碟備份或重要資料抽查可讀。

### 5. 私密憑證仍需走安全流程

日報沒有貼出 token 或 secret，這是正確的；但也代表我們尚未確認私密憑證是否只存在 Mac Studio。重置前只能記錄路徑與處理方式，不可明文搬進 Vault。

## 待批准事項

Mac Studio 日報列出的待提姆先生批准事項：

- 韓食日常鍋物品牌日常貼文進入正式發文流程，L4。
- 每日 04:00 GitHub 自我升級情報研究，L3。
- Firebase Blaze / Storage 啟用，L4。
- TheVision Meta 廣告月預算上限設定，L4。

判讀：以上都不能由阿順自動啟用；尤其發文、預算、金流、正式寫入與正式部署仍需提姆先生逐項批准。

## 回填判定

| 領域 | 狀態 |
| --- | --- |
| Mac Studio 可作為暫時阿順主機 | 通過 |
| Host Harness 低風險任務 | 通過 |
| 安全邊界 | 初步通過 |
| 內建磁碟空間 | 有風險 |
| 常駐排程完整盤點 | 未完成 |
| 完整備份抽查 | 未完成 |
| 私密憑證候選路徑盤點 | 未完成 |
| 舊 Codex thread 原機補強 | 未完成 |
| Mac Studio 重置 | 原保守判斷為不可重置；最新策略為風險接受重置 |

## 下一步

1. 仍需取得完整只讀稽核六份輸出，特別是 `03_automation_and_schedules.txt` 與 `04_sensitive_path_candidates.txt`。
2. 回填 [[2026-06-05_MacStudio原機檢查回填表]] 的「常駐自動化與排程」。
3. 做完整備份抽查，確認備份可讀。
4. 決定是否先保留 Mac Studio 當 24H Harness 主機，等新筆電完成日常替代後，再規劃 OpenClaw 主機重建。
5. 未取得完整稽核與提姆先生批准前，不重置 Mac Studio。
