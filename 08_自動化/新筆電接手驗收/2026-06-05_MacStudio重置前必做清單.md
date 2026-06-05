# 2026-06-05 Mac Studio 重置前必做清單

建立時間：2026-06-05
負責角色：阿順
最終決策者：提姆先生
用途：判斷 Mac Studio 何時可以從舊工作環境重置為 OpenClaw / 24H 阿順主機。

## 目前結論

Mac Studio 改為可進入「風險接受重置」準備，不再追求 100% 重置前稽核。

新筆電已可接手日常阿順入口，且 Ewalk.ai Brain 文字資料已完成 GitHub 遠端備份；提姆先生帶回的 Mac Studio 主機日報已確認低風險 Harness 正常運作。提姆先生判斷：繼續追求完整稽核的時間成本高於收益，舊主機細節改為升級後按價值補做。

策略文件：[[2026-06-05_MacStudio風險接受重置策略]]

## 已完成

- [x] 新筆電可讀寫 `Ewalk.ai Brain`。
- [x] 新筆電可開 Obsidian、Chrome Profile、Command Center 本機頁。
- [x] FileVault、Touch ID、自動鎖定、尋找我的 Mac 已由提姆先生確認。
- [x] Homebrew、Node.js / npm、GitHub CLI、Firebase CLI、Vercel CLI 已安裝與登入。
- [x] 新筆電 Codex 主窗口已改名並釘選。
- [x] P0 / P1 工作接續摘要已建立。
- [x] 舊主機 Codex 釘選聊天室喚起清單已建立。
- [x] Ewalk.ai Brain 三批文字資料已分批 commit。
- [x] GitHub 遠端備份已完成，`HEAD` 與 `origin/main` 已同步；最新 commit 以 GitHub `main` 為準。
- [x] 新筆電剩餘非敏感 dirty 已備份到 `/Users/timchen/Desktop/Ewalk.ai 自動化系統/_重置前備份/2026-06-05_dirty_nonsensitive`。
- [x] 舊主機 thread 交接摘要資料夾已先以新筆電 Vault 脈絡全數預回填，P0 / P1 / P2 皆有可接續版本。
- [x] 已收到 Mac Studio 阿順主機日報、Host Harness 執行紀錄與主機狀態，並完成判讀：[[2026-06-05_MacStudio阿順主機狀態判讀]]。
- [x] 提姆先生已決定不追求 100% 稽核，改採風險接受重置策略。

## Mac Studio Host Harness 判讀

2026-06-05 提姆先生帶回以下檔案：

```text
/Users/timchen/Desktop/mac-studio-pre-reset-audit-20260605/
```

判讀重點：

- Mac Studio 主機睡眠與磁碟睡眠已關閉，可長時間運作。
- `/Volumes/提姆接案碟` 已掛載，約 2.2TiB 可用。
- 客戶名冊 17 位可讀取。
- Harness 共 16 筆紀錄，最近一批 4 筆全成功。
- 最近任務皆為 L1，未要求批准。
- 外部副作用、高風險動作、正式 Firestore 寫入仍有批准邊界。
- OpenClaw 目前僅 test workspace，尚未接正式資料。
- 內建資料碟使用率 92%，只剩約 39GiB 可用，重置前備份與大型素材整理需小心。

這批檔案是主機 / Harness 狀態，不是完整重置前稽核。依新策略，缺少完整六份輸出不再阻擋重置，改列為重置後補做。

## Git 與資料狀態

### 已完成遠端備份

本次推送到 GitHub 的最後 commit：

```text
以 GitHub main 最新 commit 為準
```

確認狀態：

```text
main...origin/main
HEAD 與 origin/main 已在新筆電驗證同步
```

### 剩餘 dirty 分類

目前仍有 156 筆未提交狀態，暫不視為阻擋日常工作，也不再視為 Mac Studio 重置硬阻擋；後續按素材、設定、產出資料夾分批處理。

| 分類 | 數量 | 處理策略 |
| --- | ---: | --- |
| Obsidian 本機設定 | 5 | 不提交到 Git；若 Mac Studio 有不同工作空間設定，重置前以截圖或備份保留。 |
| 素材與成品檔 | 109 | 不混入文字 Git；重置前備份到外接硬碟、iCloud 或 Google Drive 素材庫。 |
| 產出 / 本機資料夾 | 23 | 依專案判斷是否保留；多數可視為 generated/output，但重置前先備份。 |
| 私密本機設定 | 3 | 不提交、不明文保存；重置前確認憑證可重新取得或已搬到安全憑證流程。 |
| 巢狀 `Ewalk.ai/.obsidian` | 1 組 | 屬 Obsidian 本機設定；不視為正式 Vault 資料。 |

私密本機設定包含：

- `08_自動化/firebase/command-center-app/firebase-config.local.js`
- `腳本/google-ads/.google-ads-secret-input-url`
- `腳本/meta-facebook/.ads-token-input-url`

### 新筆電非敏感 dirty 備份

已建立本機備份：

```text
/Users/timchen/Desktop/Ewalk.ai 自動化系統/_重置前備份/2026-06-05_dirty_nonsensitive
```

驗證結果：

- 備份容量：約 `2.1G`
- 備份檔案數：`371`
- 已排除私密設定與 token / secret input URL

注意：這是新筆電上的非敏感 dirty 備份，不等於 Mac Studio 完整備份。依新策略，Mac Studio 完整備份驗證改為重置後視需求補查，不再阻擋升級。

## 新筆電可讀入口補查

2026-06-05 已用 Codex app thread 入口補查目前新筆電可讀 thread。

結果：

- 可列出 3 個近期 thread：
  - `Ewalk.ai 專業經理人 - 阿順｜新筆電接手`
  - `【Ewalk.ai】Google 評論小幫手`
  - `【嘉昱】隔熱膜行銷專案`
- 舊主機畫面中的 P0 / P1 釘選工作 thread 仍未在新筆電重現。
- 新筆電已先以 Vault 脈絡完成 P0 / P1 / P2 摘要預回填；Mac Studio 原 thread 仍建議逐項輸出補強，避免漏掉聊天中未沉澱到 Vault 的決策。

已讀到的補充摘要：

- `【Ewalk.ai】Google 評論小幫手`
  - 正式網址：`https://ewalk-tools-google-review-helper.vercel.app`
  - 管理入口：`https://ewalk-tools-google-review-helper.vercel.app?admin=1`
  - 專案位置：`sites/ewalk-tools/google-review-helper`
- `【嘉昱】隔熱膜行銷專案`
  - 已重新整理 3+2 服務內容、3+2 預算更新、LINE 官方優化建議。
  - 對應客戶資料夾：`01_客戶/嘉昱隔熱膜`

## Codex Automations 補查

2026-06-05 已檢查新筆電本機 Codex 設定：

```text
/Users/timchen/.codex/automations
```

結果：新筆電不存在此目錄，未找到可讀的 `automation.toml`。

判斷：

- 新筆電目前沒有可直接交接的本機 Codex automation 設定。
- 截圖中看到的 automation 可在系統升級後逐項重建。
- 不再要求確認完所有舊 automation 才能重置 Mac Studio。

## 原本必做項目改為後補

以下項目原本列為重置前必做；依提姆先生決策，改為重置後補做，不再硬卡重置。

原機操作手順：[[2026-06-05_MacStudio原機操作手順]]
原機檢查回填表：[[2026-06-05_MacStudio原機檢查回填表]]
接下來行動總控：[[2026-06-05_接下來行動總控]]
舊 thread 摘要模板資料夾：[[舊主機thread交接摘要/README]]

### 1. 舊 Codex thread 交接摘要

以下舊釘選 thread 已先由新筆電用 Vault 脈絡預回填；Mac Studio 原機補強改為有需要再做：

- 工作交辦窗口
- Ewalk.ai 專業經理人 - 阿順
- 霖老師線上車庫
- 韓食日常鍋物自動發文系統
- 韓食日常鍋物六月開幕廣告
- TheVision 官網重做
- TheDay 分店訂購管理系統
- 正官庄行銷稽核系統
- Ewalk.ai 阿順語音系統
- Ewalk.ai 自動化製作文案簡報系統

後補時至少確認：

- 目前狀態
- 已完成事項
- 待補資料
- 風險與批准事項
- 下一步
- 相關 Vault 連結

### 2. 常駐自動化來源確認

升級後重新設計需要的排程、常駐服務或瀏覽器登入狀態，不追求原樣搬移：

- Codex Automations
- Discord / 每日交接提醒
- Google 商家 API / Google Ads 追蹤
- Meta 發文與廣告流程
- Command Center / Firebase 本機輔助流程
- OpenClaw / Ollama / Gemma 測試環境

若升級後仍需要，才改為雲端 / 新版 OpenClaw 主機承接。

### 3. 完整備份驗證

Mac Studio 重置後，若有缺資料需求，再從以下來源補查：

- Time Machine 完整備份
- 外接硬碟完整資料夾備份
- 重要資料同步到 iCloud / Google Drive / GitHub

優先補查資料：

- `Ewalk.ai 自動化系統`
- Desktop / Documents / Downloads 內的未歸檔素材
- 瀏覽器 Profile 與登入狀態
- 本機 `.env.local`、token、secret 設定，不明文搬入 Vault
- 舊 Codex thread 可見性與必要截圖

### 4. 提姆先生批准

新策略下，提姆先生已接受不追求 100% 稽核；實際重置前仍需最後確認目標磁碟，避免誤清外接工作碟。

批准句建議：

```text
批准重置 Mac Studio，定位為 OpenClaw / 24H 阿順主機。
```

## 不可重置條件

任一條成立時，不可重置：

- 會清除或影響 `/Volumes/提姆接案碟`。
- 提姆先生尚未接受重置後需重建登入、排程、Host Harness 與私密憑證。
- 有人把重置誤解成正式發文、廣告預算、金流、Firebase 正式寫入批准。

## 下一步

1. 確認重置只針對 Mac Studio 內建系統碟，不動 `/Volumes/提姆接案碟`。
2. 提姆先生執行 Mac Studio 系統升級 / 重置。
3. 升級後依 [[2026-06-05_MacStudio風險接受重置策略]] 重建工具鏈。
4. OpenClaw 先接 test workspace。
5. Host Harness 用新版方式重建，不盲目搬舊排程。
6. 有缺資料再回頭補查舊素材、thread 或備份。
