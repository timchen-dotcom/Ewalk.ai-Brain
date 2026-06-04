# Ewalk.ai Host Harness

用途：把 Mac Studio 固定成阿順專用主機，負責長任務、排程、工作紀錄、批准佇列與 Command Center 監控。

## 目前版本

版本：`phase0_controlled_autonomy`

第一版只允許低風險內部動作：

- 主機狀態檢查
- 客戶名冊 dry-run 更新
- AI 執行紀錄與 Approval Queue 本機資料更新
- 阿順主機日報產出
- Command Center 主機狀態資料更新

不允許：

- 對外發文
- 調整廣告預算
- 金流 / 訂閱變更
- 正式網站部署
- 正式 Firestore 高風險寫入
- 高權限 API token 新增
- 核心規則修改

## 資料夾

| 位置 | 用途 |
| --- | --- |
| `config/` | Harness 設定與權限策略 |
| `queue/` | 低風險任務佇列 |
| `scripts/` | 狀態檢查、runner、日報與安裝工具 |
| `output/` | 本機輸出資料 |
| `status/` | 主機狀態 Markdown 紀錄 |
| `logs/` | launchd 或 runner log |
| `launchd/` | 常駐排程設定草案 |

## 一鍵指令

根目錄會放：

```text
阿順主機Harness立即檢查.command
安裝阿順主機Harness常駐.command
解除阿順主機Harness常駐.command
```

## 提姆先生看什麼

Command Center 會新增「阿順主機狀態」區塊，讓提姆先生用筆電打開時能看到：

- Mac Studio 是否正常工作
- 最近一次檢查時間
- 主機剩餘空間
- 低風險任務完成數
- 待批准事項
- 是否有阻塞或風險

