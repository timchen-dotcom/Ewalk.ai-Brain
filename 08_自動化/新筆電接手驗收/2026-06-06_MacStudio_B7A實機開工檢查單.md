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
| `git pull` | 通過 | Mac Studio 已同步到 `2861a70 docs: add mac studio startup check`。 |
| 上工檢查腳本 | 通過 | 已產生 `mac-studio-startup-check-20260606-004200` 報告。 |
| Host Harness | 部分通過，需 B7B 修正 | 主機狀態、客戶名冊、日報可產生；`command_center_local_data_refresh` 因缺 `ai-runs.dry-run.json` 失敗。 |
| OpenClaw Telegram DM | 基礎通過，人工 DM 回覆待回填 | Gateway running，Telegram channel configured；尚需提姆先生貼 `B7A_TELEGRAM_OK` 測試回覆。 |
| Ollama Gemma | 通過 | `gemma4:12b` 已下載，Ollama local API 可回應。 |
| Command Center dry-run | 通過 | app 檔案存在，`app.js` 語法檢查通過；`firebase-config.local.js` 缺少，Live Read 需另行重建本機 config。 |
| 外部副作用 | 未執行 | 報告確認未寫 Firestore、未部署、未發文、未動廣告或金流。 |

## B7A 回填判讀

報告資料夾：

```text
mac-studio-startup-check-20260606-004200
```

主要結論：

- Mac Studio 已拉到最新 Git 版本，branch 為 `main`，remote 為 `timchen-dotcom/Ewalk.ai-Brain`。
- 工具鏈可用：Git、Node、npm、Python、GitHub CLI、Firebase CLI、Vercel CLI、Ollama、OpenClaw。
- Firebase CLI 已登入 `tim.chen@ewalk.ai`；`firebase use` 報錯是因為檢查腳本在 Brain 根目錄執行，不在 Firebase project 目錄，非阻擋。
- OpenClaw Gateway 以 loopback-only 方式運作，port `18789` 正常 listening；Tailscale exposure 為 off。
- Ollama 以本機 port `11434` 運作，`gemma4:12b` 可用。
- Command Center 本機檔案與語法檢查通過。
- Mac Studio 內建資料碟可用空間約 `394Gi`，`/Volumes/提姆接案碟` 已掛載且約 `2.2Ti` 可用。
- 主機 sleep 為 `0`，但 disksleep 為 `10`，後續若要長時間處理外接碟任務，建議再評估是否改成 `0`。

阻擋點：

- `command_center_local_data_refresh` 失敗，原因是 `build-ai-runs-app-data.mjs` 找不到 `firebase/output/ai-runs.dry-run.json`。
- `firebase-config.local.js` 不存在，因此 Mac Studio 目前不能直接做 Command Center Live Read；本機 dry-run 不受影響。

## B7B 修正

B7B 已在新筆電端準備修正：

- `build-ai-runs-app-data.mjs`：缺 `ai-runs.dry-run.json` 時改產生空 AI runs app data，不讓 Host Harness 失敗。
- `build-approval-queue-app-data.mjs`：缺 `approval-queue.dry-run.json` 時改產生空 Approval Queue app data，避免同型問題。

本修正只影響本機 dry-run app data，不寫 Firestore、不部署、不發文、不動廣告或金流。

## B7B 二次回報

報告資料夾：

```text
mac-studio-startup-check-20260606-010211
```

二次回報結論：

- Mac Studio 已拉到 `0202633 fix: tolerate missing command center dry-run data`，代表 B7B 程式碼已同步到 Mac Studio。
- Command Center 本機檔案存在，`data/approval-queue.js`、`data/ai-runs.js`、`data/host-status.js` 均存在，`app.js` 語法檢查通過。
- `firebase-config.local.js` 仍未建立，因此 Mac Studio 的 Command Center Live Read 仍維持「未開放」，本機 dry-run 不受影響。
- OpenClaw Gateway、Telegram channel 設定、Ollama `gemma4:12b`、本機 port `18789` / `11434` 均正常。
- Host Harness output 最後更新時間為 `2026/06/06 00:55`；這份檢查報告本身只印出 `harness-runs.json` 前 120 行，因此看到的是歷史舊失敗，不能直接判定 B7B 最新任務是否已成功。

判定：

- B7B「程式碼已部署到 Mac Studio」通過。
- B7B「Host Harness 最新一輪成功」尚需重跑或等待下一輪排程後再驗證。

補強：

- 已更新 `mac_studio_startup_check.sh`，下一版報告會同時輸出 `harness-runs.json` 最後 160 行與最近 20 筆任務摘要，讓 `command_center_local_data_refresh` 的最新狀態可直接判讀。

## B7A 暫定結論

B7A 判定為「條件通過」。

Mac Studio 可以開始承接低風險人工上工與只讀判讀；但在 B7B 修正拉回 Mac Studio 並重跑 Host Harness 前，不應把 Host Harness Command Center 本機資料刷新視為完全穩定。

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
