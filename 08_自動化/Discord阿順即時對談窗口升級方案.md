# Discord 阿順即時對談窗口升級方案

## 目的

把 Discord `#專業經理人🤖阿順` 從「交辦收件匣」升級成提姆和阿順的日常工作窗口：可以即時對談、交辦任務、回覆處理狀態，並把重要內容寫回 Obsidian。

## 目前狀態

目前 `#專業經理人🤖阿順` 已能做到：

- 每 15 秒檢查一次新訊息。
- 將提姆交辦內容寫入 `Ewalk.ai Brain/00_收件匣/Discord交辦收件匣.md`。
- 用固定文字回覆「收到，已放進 Obsidian 交辦收件匣」。
- 做簡單分類：客戶待辦、重要提醒、想法收件匣、待整理。

目前尚未做到：

- 不能像 ChatGPT / Codex 一樣理解上下文並即時對談。
- 不能真正執行複雜任務後回覆完成結果。
- 不能主動讀取相關 Obsidian 文件後整理答案。
- 不能把「待辦、文件產出、客戶資料更新、SOP 更新」串成完整任務生命週期。

## 目標體驗

提姆在 `#專業經理人🤖阿順` 說：

```text
阿順，幫我整理 STAR Color 5/20 創業大會接下來待辦。
```

阿順應該能回覆：

```text
收到，我會先看 STAR Color、0520 創業大會、現場語音阿順三份資料，整理成今日可執行待辦。

已完成：
- 新增 5/20 創業大會待辦到 Obsidian
- 分成簡報、現場 Demo、物料、客戶確認四類
- 有 3 件需要提姆決策

Obsidian：...
```

## 建議分階段

### 第 1 階段：即時對談回覆

目標：讓 Discord 訊息能得到阿順的白話回覆，而不是只有固定收件文字。

功能：

- 讀取 `AGENTS.md` 與核心系統文件。
- 對提姆訊息做簡短理解與回覆。
- 一律同步寫入 Discord 交辦收件匣。
- 對高風險任務只提出下一步，不直接執行。

需要：

- Discord Bot Token：已具備。
- AI 模型：第一版先使用本地 Ollama `gemma3:1b`，不依賴外部 API Key。
- 一個常駐本機服務：可沿用目前 `discord_assignment_inbox.py` 改造。

狀態：已完成第一版安全對談。

落地內容：

- `discord_assignment_inbox.py` 會讀取 `AGENTS.md`、阿順交辦規則、Command Center 與本升級方案。
- 新訊息仍會寫入 `Discord交辦收件匣.md`。
- 回覆改由本地 Gemma 生成。
- 若本地 AI 無法回覆，會退回安全收件模式。
- 對談記憶保存在 `output/discord-ashun-conversation-state.json`。
- 背景服務版本已同步到 `~/.ashun/assignment-bot`。

重啟方式：

- 雙擊專案根目錄的 `安裝Discord交辦收件.command`，會重新安裝並重啟背景服務。
- 或在 Terminal 執行：

```bash
launchctl kickstart -k "gui/$(id -u)/com.ewalk.ashun.assignment-bot"
```

備註：Codex 沙盒無法直接重啟 macOS launchd 服務，需由提姆本機使用者權限執行。

### 第 2 階段：任務交辦與回報

目標：阿順能判斷任務類型，寫入正確 Obsidian 文件，並回覆完成狀態。

功能：

- 客戶事項寫入客戶資料夾或待辦。
- 靈感想法寫入收件匣。
- 可重複流程沉澱成 SOP / Prompt。
- 需要提姆決策的事項回覆「待確認」。
- 完成後回覆新增 / 修改了哪些文件。

限制：

- 涉及對外發送、行事曆異動、客戶承諾、刪除資料、修改全域規則時，必須先問提姆確認。
- 不能讓 Discord 訊息直接無限制執行本機指令。

### 第 3 階段：Codex 工作窗口

目標：讓 Discord 成為提姆和 Codex / 阿順的工作入口。

可行做法：

- Discord 收到任務後，建立任務紀錄。
- 阿順判斷是否需要進入 Codex 工作流。
- 可執行的任務由本機 agent 產出文件或修改 Vault。
- 執行結果回覆 Discord，並附 Obsidian 路徑。

注意：

- 這不等於把目前這個 Codex 對話視窗原封不動搬到 Discord。
- 比較穩定的做法是建立一個「Discord → 本機阿順服務 → Obsidian / Codex 任務」的橋接層。

## 建議技術架構

```text
Discord #專業經理人🤖阿順
        ↓
Discord Bot 常駐收件
        ↓
阿順任務路由器
        ↓
判斷：聊天 / 收件 / 文件任務 / 高風險確認
        ↓
Obsidian 寫入 + AI 回覆
        ↓
Discord 回覆提姆
```

## 回覆模式

- `聊天`：直接白話回覆，保留簡短上下文。
- `交辦`：寫入 Obsidian，回覆分類與後續狀態。
- `文件任務`：建立或更新文件，回覆檔案位置。
- `待確認`：需要權限、外部工具、客戶承諾或高風險操作時，先問提姆。
- `轉人工 / 轉 Codex`：任務太大或需要完整專案修改時，先建立任務摘要，等待 Codex 接手。

## 權限與風險

- Discord Bot 只能監聽指定頻道。
- Webhook / Bot Token / API Key 只放在 `config.local.json`，不進 Git。
- 初期不開放刪除、搬移大量檔案、發送郵件、修改行事曆。
- 所有外部可見操作都要先取得提姆確認。
- 每次執行都要留下 Obsidian 紀錄，避免任務只存在 Discord 對話裡。

## 下一步

- [x] 決定第 1 階段使用本地 Ollama `gemma3:1b`。
- [x] 不使用外部 API Key，先走本機安全版。
- [x] 將 `discord_assignment_inbox.py` 加入 AI 回覆與 Obsidian 寫入流程。
- [x] 加入對談記憶檔：`output/discord-ashun-conversation-state.json`。
- [ ] 先做只回覆、只寫收件匣的安全版 Discord 實測。
- [ ] 測試穩定後，再開放文件更新與任務回報。
