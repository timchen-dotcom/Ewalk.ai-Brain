# 2026-06-05 Mac Studio 重置前必做清單

建立時間：2026-06-05
負責角色：阿順
最終決策者：提姆先生
用途：判斷 Mac Studio 何時可以從舊工作環境重置為 OpenClaw / 24H 阿順主機。

## 目前結論

Mac Studio 目前仍不可重置。

新筆電已可接手日常阿順入口，且 Ewalk.ai Brain 文字資料已完成 GitHub 遠端備份；但 Mac Studio 重置前，仍需完成舊主機獨有資料、舊 Codex thread、常駐自動化與完整備份確認。

## 已完成

- [x] 新筆電可讀寫 `Ewalk.ai Brain`。
- [x] 新筆電可開 Obsidian、Chrome Profile、Command Center 本機頁。
- [x] FileVault、Touch ID、自動鎖定、尋找我的 Mac 已由提姆先生確認。
- [x] Homebrew、Node.js / npm、GitHub CLI、Firebase CLI、Vercel CLI 已安裝與登入。
- [x] 新筆電 Codex 主窗口已改名並釘選。
- [x] P0 / P1 工作接續摘要已建立。
- [x] 舊主機 Codex 釘選聊天室喚起清單已建立。
- [x] Ewalk.ai Brain 三批文字資料已分批 commit。
- [x] GitHub 遠端備份已完成，`HEAD` 與 `origin/main` 均為 `131a1031e1fef433ef7fd254e3d541a1514134ef`。

## Git 與資料狀態

### 已完成遠端備份

本次推送到 GitHub 的最後 commit：

```text
131a103 chore: snapshot daily handoff records
```

確認狀態：

```text
main...origin/main
HEAD = origin/main = 131a1031e1fef433ef7fd254e3d541a1514134ef
```

### 剩餘 dirty 分類

目前仍有 156 筆未提交狀態，暫不視為阻擋日常工作，但重置前必須有備份策略。

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

## Mac Studio 上必做

以下項目需要在 Mac Studio 原主機上完成，不能只靠新筆電判定。

### 1. 舊 Codex thread 交接摘要

最低需要輸出或補完以下舊釘選 thread 的交接摘要：

- 工作交辦窗口
- Ewalk.ai 專業經理人 - 阿順
- 韓食日常鍋物自動發文系統
- 韓食日常鍋物六月開幕廣告
- 霖老師線上車庫
- TheVision 官網重做
- TheDay 分店訂購管理系統
- 正官庄行銷稽核系統
- Ewalk.ai 阿順語音系統
- Ewalk.ai 自動化製作文案簡報系統

交接摘要至少包含：

- 目前狀態
- 已完成事項
- 待補資料
- 風險與批准事項
- 下一步
- 相關 Vault 連結

### 2. 常駐自動化來源確認

需確認 Mac Studio 上是否仍有任何本機排程、常駐服務或瀏覽器登入狀態支撐下列工作：

- Codex Automations
- Discord / 每日交接提醒
- Google 商家 API / Google Ads 追蹤
- Meta 發文與廣告流程
- Command Center / Firebase 本機輔助流程
- OpenClaw / Ollama / Gemma 測試環境

若有本機依賴，重置前需先停用、搬移或改為雲端 / 未來 OpenClaw 主機承接。

### 3. 完整備份驗證

Mac Studio 重置前需完成以下至少一種備份，並確認可讀：

- Time Machine 完整備份
- 外接硬碟完整資料夾備份
- 重要資料同步到 iCloud / Google Drive / GitHub

必查資料：

- `Ewalk.ai 自動化系統`
- Desktop / Documents / Downloads 內的未歸檔素材
- 瀏覽器 Profile 與登入狀態
- 本機 `.env.local`、token、secret 設定，不明文搬入 Vault
- 舊 Codex thread 可見性與必要截圖

### 4. 提姆先生批准

所有項目完成後，仍需提姆先生明確批准才可重置。

批准句建議：

```text
批准重置 Mac Studio，定位為 OpenClaw / 24H 阿順主機。
```

## 不可重置條件

任一條成立時，不可重置：

- 舊 Codex thread 未輸出交接摘要。
- Mac Studio 是否存在本機常駐自動化尚未確認。
- 完整備份尚未完成或未驗證可讀。
- 私密憑證沒有重新取得或安全搬移方案。
- 提姆先生尚未明確批准。

## 下一步

1. 在 Mac Studio 開啟舊 Codex，逐個輸出舊 thread 交接摘要。
2. 盤點 Mac Studio 是否有本機排程與常駐程序。
3. 做完整備份並抽查可讀。
4. 阿順更新本清單為「可重置」。
5. 提姆先生批准後才進行重置。
