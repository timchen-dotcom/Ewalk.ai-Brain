# 2026-06-06 Mac Studio B7A 實機開工檢查單

## 一句話結論

B7A 是 Mac Studio 進入低風險上工前的實機檢查。目標是確認 Mac Studio 已同步最新 Git、Host Harness / OpenClaw / Ollama / Command Center 可用，且仍未開放正式寫入、部署、發文、廣告預算或金流。

## 本輪範圍

允許：

- 在 Mac Studio 執行 `git pull`，同步最新 SOP 與 Command Center 修正。
- 執行只讀狀態檢查腳本。
- 產生本機 Desktop 檢查報告。
- 人工確認 Chrome、Obsidian、OpenClaw Telegram DM、Ollama、Command Center 可用。

禁止：

- 不寫 Firestore。
- 不部署 Firebase rules / hosting。
- 不發 Facebook / Instagram。
- 不操作廣告預算。
- 不操作金流、帳務或訂閱。
- 不接正式客戶通道。
- 不把 token、secret、API key、OAuth code 或密碼貼進 Obsidian。

## 操作步驟

### 1. 在 Mac Studio 同步最新 Git

在 Mac Studio 的 `Ewalk.ai Brain` 資料夾執行：

```zsh
git pull
```

預期結果：

- 取得 `Mac Studio 阿順上工啟動SOP`。
- 取得 `Command Center 只讀使用SOP`。
- 取得 Command Center Live Read / dry-run 混合顯示修正。
- 取得 `2026-06-06` 每日工作筆記。

若出現 git conflict：

- 立刻停止。
- 不要 `reset`。
- 不要自行合併大量檔案。
- 回 Codex 主窗口判讀。

### 2. 執行 B7A 上工檢查腳本

方式一：終端機執行：

```zsh
zsh "08_自動化/新筆電接手驗收/tools/mac_studio_startup_check.sh"
```

方式二：Finder 雙擊：

```text
08_自動化/新筆電接手驗收/tools/執行MacStudio上工檢查.command
```

腳本會在 Desktop 產生：

```text
mac-studio-startup-check-YYYYMMDD-HHMMSS
```

### 3. 檢查報告內容

報告應包含：

| 檔案 | 用途 |
| --- | --- |
| `00_system.txt` | macOS、磁碟、電源與提姆接案碟狀態 |
| `01_git_status.txt` | Brain branch、最新 commit、dirty 狀態 |
| `02_toolchain.txt` | git / node / npm / gh / firebase / vercel / ollama / openclaw 狀態 |
| `03_host_harness.txt` | Host Harness output、狀態檔與日報資料 |
| `04_runtime_and_ports.txt` | LaunchAgent、程序與 port |
| `05_command_center.txt` | Command Center 檔案、語法、只讀 adapter 檢查 |
| `06_ollama_openclaw_smoke.txt` | Ollama local API 與 OpenClaw 狀態 |

## 人工實機確認

### Chrome / Obsidian

- [ ] Chrome 可開啟。
- [ ] Obsidian 可開啟 `Ewalk.ai Brain`。
- [ ] `2026-06-06` 每日工作筆記可讀。
- [ ] `Mac Studio 阿順上工啟動SOP` 可讀。

### OpenClaw Telegram DM

- [ ] Telegram DM 測試 bot 可收到訊息。
- [ ] OpenClaw 可回覆低風險文字交辦。
- [ ] 回覆不宣稱讀檔、不宣稱使用工具、不做外部副作用。

測試文字：

```text
B7A 開工檢查。請只回覆：B7A_TELEGRAM_OK。不要讀檔、不要用工具、不要做任何外部操作。
```

### Ollama Gemma

- [ ] `ollama list` 看得到 `gemma4:12b`。
- [ ] `ollama run gemma4:12b` 可啟動。
- [ ] 互動模式先執行 `/set nothink`。
- [ ] 模型能只根據貼入文字做摘要。

測試文字：

```text
/set nothink

請只回覆：B7A_GEMMA_OK
```

### Command Center

- [ ] 可用本機 server 開啟 `http://localhost:17990/`。
- [ ] 預設顯示 `本機預覽資料`。
- [ ] 本機 dry-run 指標可讀。
- [ ] 若測 Live Read，需由提姆先生手動登入 Chrome。
- [ ] 正式 Live Read 不混用本機 dry-run approvals。

本階段不要求每次都測 Live Read；只要確認本機預覽可開，正式只讀留待需要時再測。

## 通過標準

B7A 通過需要：

- Mac Studio 已 `git pull` 到最新 commit。
- 上工檢查腳本可產生 Desktop 報告。
- Git 狀態沒有阻擋上工的 conflict。
- Host Harness 有狀態資料或可確認常駐狀態。
- OpenClaw Telegram DM 低風險回覆正常。
- Ollama Gemma 可用或可明確列為待修。
- Command Center 本機 dry-run 可開。
- 未執行任何正式寫入、部署、發文、廣告或金流操作。

## B7A 判定

| 項目 | 結果 | 備註 |
| --- | --- | --- |
| `git pull` | 待回填 |  |
| 上工檢查腳本 | 待回填 |  |
| Host Harness | 待回填 |  |
| OpenClaw Telegram DM | 待回填 |  |
| Ollama Gemma | 待回填 |  |
| Command Center dry-run | 待回填 |  |
| 外部副作用 | 應為未執行 |  |

## 下一步

若 B7A 通過：

- Mac Studio 可開始承接低風險日常任務。
- 新筆電繼續作為 Codex 主控與文件整理入口。
- Command Center 只讀看板可用於人工判讀營運狀態。
- 高風險工作仍回到提姆先生批准流程。

若 B7A 未通過：

- 先整理失敗報告。
- 不升級權限。
- 不啟用正式寫入或正式自動化。

## 關聯文件

- [[../../13_SOP流程/Mac Studio 阿順上工啟動SOP]]
- [[../../13_SOP流程/阿順三入口分工手動SOP]]
- [[../../13_SOP流程/Command Center 只讀使用SOP]]
- [[2026-06-05_接下來行動總控]]
- [[../../14_每日工作/2026-06-06]]
