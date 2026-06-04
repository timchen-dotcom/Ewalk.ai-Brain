# 本地 AI Gemma

這套流程用本地 Ollama 執行 Gemma，負責低風險的整理工作，例如每日筆記接續、待辦抽取與摘要。

## 目前設定

- 執行工具：`tools/Ollama.app`
- 模型：`gemma3:1b`
- 模型資料：`models`
- 服務位置：`http://127.0.0.1:11434`

## 工作分工

- Gemma：初步整理、摘要、將接續事項轉成乾淨待辦
- 阿順：檢查結果、提醒、判斷是否需要放進 Google Calendar

## 入職手冊

- [[Gemma入職手冊]]

Gemma 被定位為本地工讀生，只負責低風險的初步整理與草稿產出。正式判斷、外部發送、行事曆異動與客戶承諾都要交給阿順或使用者確認。

## 使用方式

第一次使用 Discord 通知時，建立本機設定檔：

```bash
cp config.example.json config.local.json
```

然後把 Discord Webhook URL 填進 `config.local.json`。這個檔案已排除版本控管，不會被同步進 Git。

先啟動本地 AI：

```bash
./scripts/start_ollama.sh
```

整理每日接續：

```bash
./scripts/daily_handoff.py
```

每日自動化會優先使用這個流程，把昨天每日筆記的 `明天接續` 整理到今天的 `今日待辦`。

啟動 Discord 交辦常駐收件：

```bash
./scripts/start_assignment_bot.sh
```

常駐服務會每 15 秒檢查 `專業經理人🤖阿順` 頻道的新訊息，寫入 `00_收件匣/Discord交辦收件匣.md`，並用本地 Gemma 產生一段安全回覆。

即時對談設定：

```json
{
  "ashun_chat_enabled": true,
  "ashun_chat_model": "gemma3:1b",
  "ashun_chat_ollama_url": "http://127.0.0.1:11434/api/generate",
  "ashun_chat_timeout_seconds": 25
}
```

本地模擬阿順回覆：

```bash
./scripts/discord_assignment_inbox.py --simulate "阿順，幫我整理 STAR Color 5/20 接下來待辦"
```

如果本地 AI 暫時沒有啟動，阿順仍會先把訊息寫入 Obsidian，並用安全模式回覆，不會讓交辦漏掉。

若要安裝成 macOS 背景服務，回到專案根目錄後執行或雙擊：

```bash
./安裝Discord交辦收件.command
```

這會把執行檔複製到 `~/.ashun/assignment-bot`，再由 launchd 常駐執行，避免路徑含中文或 macOS 權限造成服務載入失敗。

macOS 背景服務設定檔：

```bash
com.ewalk.ashun.assignment-bot.plist
```

若要設定成登入後自動啟動，將此檔案安裝到 `~/Library/LaunchAgents/` 後用 launchd 載入。

## Discord 通知

若 `config.local.json` 有設定 `discord_webhook_url`，每日接續整理完成後會自動發送 Discord 通知。

若要允許每日待辦內容送到 Discord，需將 `config.local.json` 裡的 `discord_daily_handoff_enabled` 改為 `true`。

建議在 Discord 建立專用頻道，例如：

- `每日接續`：每天 10:00 的工作接續
- `重要提醒`：有明確時間或不能漏掉的提醒
- `客戶待辦`：客戶相關追蹤事項
- `系統通知`：自動化成功、失敗、異常
- `想法收件匣`：臨時靈感、待整理想法
- `自我升級`：每日自我升級情報與可升級項目
- `美感趨勢搜集`：每日美感趨勢收集與每週週報摘要

多頻道設定使用 `discord_webhooks`：

```json
{
  "discord_webhooks": {
    "daily_handoff": "貼上 #每日接續 Webhook URL",
    "important": "貼上 #重要提醒 Webhook URL",
    "customer_tasks": "貼上 #客戶待辦 Webhook URL",
    "system": "貼上 #系統通知 Webhook URL",
    "inbox": "貼上 #想法收件匣 Webhook URL",
    "self_upgrade": "貼上 #自我升級 Webhook URL",
    "aesthetic_trends": "貼上 #美感趨勢搜集 Webhook URL"
  }
}
```

手動測試某個頻道：

```bash
./scripts/discord_notify.py --channel system --message "阿順測試：系統通知已接通。"
```

新增頻道與通知串聯流程見：[[../../13_SOP流程/Discord頻道新增與通知串聯SOP|Discord 頻道新增與通知串聯 SOP]]
