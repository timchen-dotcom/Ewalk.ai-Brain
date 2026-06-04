# 每日 Discord 提醒檢查

建立日期：2026-05-05

## 事件

使用者回報：早上 10:00 Discord 沒收到每日通知。

## 檢查結果

- 2026-05-05 10:03 有產生 `2026-05-05-daily-work-reminder.json`
- 該檔案顯示 `discord_sent: false`
- Discord webhook 設定存在
- 手動測試每日接續頻道發送成功

## 判斷

Discord webhook 本身正常。問題比較可能發生在 10:00 自動化執行環境：提醒內容有整理，但 Discord 發送沒有成功。

## 已修正

- `daily_work_reminder.py` 增加 `discord_error` 記錄，之後若失敗會留下原因
- 新增 `run_daily_discord_reminder.sh`
- 新增 `com.ewalk.ashun.daily-reminder.plist`

## 下一步

優先把每日 Discord 提醒改成 macOS 本機 LaunchAgent 直接執行，避免 Codex 排程環境無法送出 Discord。

## 2026-05-05 後續處理

- Codex 沙盒無法寫入 `~/Library/LaunchAgents`
- 直接 `launchctl bootstrap` 被 macOS 回覆 `Bootstrap failed: 5`
- `crontab` 寫入也被系統權限擋住
- 已建立一鍵安裝檔：`安裝每日Discord提醒.command`

使用者只要在 Finder 雙擊這個 `.command` 檔，即可用自己的 macOS 使用者權限安裝每日 10:00 排程。

## 2026-05-05 驗收修正

- 使用者已執行安裝檔後，LaunchAgent 成功掛上
- 手動觸發時發現 `runs = 1`、`last exit code = 127`
- 錯誤原因：LaunchAgent 執行含中文路徑時發生路徑亂碼，導致找不到腳本
- 已建立純英文執行路徑：`/Users/chenjinting/.ashun/daily-reminder/`
- 已更新 `安裝每日Discord提醒.command`，之後會把 LaunchAgent 指向純英文執行腳本

## 2026-05-05 第二次修正

- 檔案已更新，但 LaunchAgent 記憶體內仍留舊路徑
- 重新載入時發現 plist 的 `StandardOutPath` / `StandardErrorPath` 也含中文路徑，仍可能造成 `Bootstrap failed: 5`
- 已改成純英文 log 路徑：`/Users/chenjinting/.ashun/daily-reminder/logs/`
- 需要使用者再執行一次 `安裝每日Discord提醒.command`，讓 `~/Library/LaunchAgents` 內的 plist 更新
