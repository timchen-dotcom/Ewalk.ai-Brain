# Mac Studio Pre-reset Tools

## 工具

- `mac_studio_pre_reset_audit.sh`

## 用途

在 Mac Studio 原機上執行只讀盤點，產生重置前檢查報告。

## 執行方式

在 Mac Studio 開啟 Terminal：

```bash
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/新筆電接手驗收/tools"
./mac_studio_pre_reset_audit.sh
```

報告會輸出到 Mac Studio 桌面：

```text
~/Desktop/mac-studio-pre-reset-audit-YYYYMMDD-HHMMSS
```

## 安全原則

- 只讀檢查。
- 不刪除、不停用、不搬移。
- 不讀取 secret、token、密碼、API key 內容。
- 只列出敏感候選檔案路徑，供提姆先生確認如何保管。
