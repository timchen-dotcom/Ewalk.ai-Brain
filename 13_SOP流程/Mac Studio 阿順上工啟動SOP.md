# Mac Studio 阿順上工啟動 SOP

## 用途

讓 Mac Studio 從「重建驗收中」切換成「阿順可開始上工」的穩定模式。

這份 SOP 的目的不是一次開放所有自動化，而是讓提姆先生、Codex 主窗口、OpenClaw Telegram DM、Ollama Gemma、Command Center 與 Host Harness 各就各位，開始以低風險方式支援日常工作。

## 目前定位

| 項目 | 定位 |
| --- | --- |
| 新筆電 | 提姆先生控制台、Codex 主窗口、文件整理與審核入口 |
| Mac Studio | 阿順固定主機、Host Harness、OpenClaw、Ollama、Command Center 實機驗收環境 |
| GitHub | Ewalk.ai Brain 文字資料與 SOP 的主要同步點 |
| Obsidian | Ewalk.ai Brain 的人工閱讀、整理與交接入口 |
| Command Center | 本機 dry-run 與正式 Firestore 只讀看板 |

## 上工前條件

以下條件已完成，Mac Studio 可以進入低風險上工：

- Mac Studio 已重置完成。
- 工具鏈已重建：Homebrew、GitHub CLI、Firebase CLI、Vercel CLI、Node.js。
- `Ewalk.ai Brain` 已重新 clone。
- Firebase / Vercel / GitHub 已登入。
- `/Volumes/提姆接案碟` 已可讀。
- Host Harness 手動 dry-run 通過。
- Host Harness 常駐 LaunchAgent 已安裝並觀察穩定。
- Chrome / Obsidian 可用。
- OpenClaw Telegram DM 低風險入口可用。
- Ollama + `gemma4:12b` 本地摘要 PoC 通過。
- Command Center 本機 dry-run、正式只讀與混合顯示修正通過。
- Command Center 只讀使用 SOP 已建立。

## 每日開工流程

### 1. 新筆電主控

提姆先生或阿順先在新筆電確認：

- Codex 主窗口可用。
- `Ewalk.ai Brain` Git 狀態可讀。
- 昨日每日工作與總控文件已同步。
- 需要沉澱的文件、SOP、Prompt 仍由 Codex 主窗口處理。

### 2. Mac Studio 狀態確認

在 Mac Studio 確認：

- Host Harness 常駐仍在。
- Chrome / Obsidian 可開。
- OpenClaw Telegram DM 可回覆低風險文字任務。
- Ollama `gemma4:12b` 可用於人工貼入摘要。
- Command Center 可開本機 dry-run。

正式上工前，依 [[../08_自動化/新筆電接手驗收/2026-06-06_MacStudio_B7A實機開工檢查單|B7A 實機開工檢查單]] 執行一次只讀檢查，並將 Desktop 報告帶回給阿順判讀。

### 3. Git 同步

Mac Studio 開工前先做：

```zsh
git pull
```

目的：

- 接收新筆電上整理好的 SOP、Prompt、每日工作與 Command Center 修正。
- 不在 Mac Studio 手動重做新筆電已完成的文件工作。
- 避免兩台機器出現不同版本的 Brain。

### 4. 選擇入口

依任務選入口：

| 任務 | 入口 |
| --- | --- |
| 寫 SOP、整理 Prompt、更新 Obsidian、Git commit / push | Codex 主窗口 |
| 手機端快速文字整理、每日交接、風險分類 | OpenClaw Telegram DM |
| Mac Studio 本地長文摘要、貼入文字整理 | Ollama Gemma |
| 看客戶、佇列、批准、AI 執行紀錄 | Command Center 只讀看板 |
| 長時間低風險排程與主機狀態 | Host Harness |

## 日中工作規則

可以直接做：

- 整理文件、SOP、Prompt。
- 根據人工貼入文字做摘要、分類、待辦。
- 使用 Command Center 只讀看板判讀營運狀態。
- 更新每日工作紀錄。
- Git commit / push 已確認範圍的文件變更。
- 執行已批准的 dry-run 或只讀檢查。

需要提姆先生批准：

- Command Center 正式寫入。
- Firestore 寫入或 rules 部署。
- Vercel production 部署。
- Meta 發文或廣告 API。
- 廣告預算、金流、帳務或訂閱異動。
- 接正式客戶通道。
- 讓 OpenClaw、Ollama 或 Host Harness 直接讀寫正式資料。

禁止：

- 不把 token、secret、API key、OAuth code 或密碼寫進 Obsidian。
- 不把低風險 PoC 視為正式自動化批准。
- 不讓 Telegram 或 Gemma 宣稱已讀檔、已寫檔、已搜尋或已操作工具。
- 不把新筆電當成 24H 常駐自動化主機。
- 不在未確認範圍時一次 commit 大量 dirty。

## 收工流程

每天收工前：

1. 用 Codex 主窗口或 OpenClaw Telegram DM 整理今日交接。
2. 更新 `14_每日工作/YYYY-MM-DD.md`。
3. 標出明日最重要的一件事。
4. 標出仍需提姆先生批准的事項。
5. 將 SOP、Prompt、總控或每日工作等文字變更 commit / push。
6. Mac Studio 若有本機 server，使用後需關閉。

## Mac Studio 不必重做的事

以下工作可在新筆電完成後由 GitHub 同步，不必在 Mac Studio 重新操作：

- SOP 文件整理。
- Prompt 整理。
- 每日工作與交接紀錄。
- Command Center 前端顯示修正。
- 只讀流程與批准邊界文件。
- 客戶文字資料整理。

Mac Studio 只需要：

- `git pull` 接收成果。
- 實機驗收常駐、登入、外接碟、背景服務與效能。

## Mac Studio 必須實機確認的事

以下一定要在 Mac Studio 本機確認：

- Host Harness 是否常駐。
- OpenClaw Gateway / Telegram bot 是否穩定。
- Ollama / Gemma 本地模型是否可用且效能可接受。
- Command Center 本機 server 與 Firebase OAuth 是否可用。
- `/Volumes/提姆接案碟` 是否掛載。
- 電源、睡眠、LaunchAgent、port、背景程序是否正常。
- 任何 24H 自動化是否真的穩定。

## 異常處理

| 狀況 | 處理 |
| --- | --- |
| Git pull 衝突 | 停止操作，回 Codex 主窗口判讀，不 reset。 |
| Command Center 登入失敗 | 先回只讀 SOP，確認用 Chrome 與公司帳號。 |
| OpenClaw 回覆越權 | 回復到低風險 Telegram DM，只允許人工貼入文字。 |
| Ollama 輸出 thinking | 先執行 `/set nothink`，再重跑。 |
| Host Harness 異常 | 只做狀態紀錄，不直接啟用高風險任務。 |
| 發文 / 部署 / 金流要求 | 回到提姆先生批准流程。 |

## 驗收標準

Mac Studio 上工模式通過的標準：

- 新筆電能主控文件與 Git。
- Mac Studio 能承接實機常駐與低風險工具。
- 三入口分工清楚，不互相越權。
- Command Center 只讀看板可協助判讀，但不執行正式操作。
- 每日交接能沉澱回 Obsidian。
- 所有高風險外部副作用都會回到提姆先生批准。

## 關聯文件

- [[阿順三入口分工手動SOP]]
- [[OpenClaw Telegram 每日交接手動SOP]]
- [[Ollama Gemma 本地摘要手動SOP]]
- [[Command Center 只讀使用SOP]]
- [[../08_自動化/新筆電接手驗收/2026-06-05_接下來行動總控]]
- [[../08_自動化/新筆電接手驗收/2026-06-06_MacStudio_B7A實機開工檢查單]]
- [[../14_每日工作/2026-06-06]]
