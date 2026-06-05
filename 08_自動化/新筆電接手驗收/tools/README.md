# Mac Studio Check Tools

## 工具

- `mac_studio_pre_reset_audit.sh`：重置前只讀盤點。
- `執行MacStudio原機稽核.command`：重置前只讀盤點雙擊入口。
- `mac_studio_startup_check.sh`：重置後上工只讀檢查。
- `執行MacStudio上工檢查.command`：重置後上工只讀檢查雙擊入口。

## 用途

在 Mac Studio 上執行只讀盤點或上工檢查，產生 Desktop 報告。

目前主要使用：

- 重置前：`mac_studio_pre_reset_audit.sh`
- 重置後上工：`mac_studio_startup_check.sh`

## 執行方式

### 重置前只讀盤點

在 Mac Studio 開啟 Terminal：

```zsh
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/新筆電接手驗收/tools"
./mac_studio_pre_reset_audit.sh
```

或在 Mac Studio 直接雙擊：

```text
執行MacStudio原機稽核.command
```

報告會輸出到 Mac Studio 桌面：

```text
~/Desktop/mac-studio-pre-reset-audit-YYYYMMDD-HHMMSS
```

### 重置後上工檢查

在 Mac Studio 開啟 Terminal：

```zsh
cd "$HOME/Ewalk.ai Brain/08_自動化/新筆電接手驗收/tools"
./mac_studio_startup_check.sh
```

若 Brain 放在 Desktop 工作資料夾，則改用實際路徑：

```zsh
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/新筆電接手驗收/tools"
./mac_studio_startup_check.sh
```

或在 Mac Studio 直接雙擊：

```text
執行MacStudio上工檢查.command
```

報告會輸出到 Mac Studio 桌面：

```text
~/Desktop/mac-studio-startup-check-YYYYMMDD-HHMMSS
```

## 安全原則

- 只讀檢查。
- 不刪除、不停用、不搬移。
- 不執行 `git pull`。
- 不寫 Firestore。
- 不部署、不發文、不動廣告預算或金流。
- 不讀取 secret、token、密碼、API key 內容。
- 只列出敏感候選檔案路徑，供提姆先生確認如何保管。
