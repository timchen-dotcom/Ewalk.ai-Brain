# 阿順三入口分工手動 SOP

## 用途

固定提姆先生之後要叫阿順時，該使用哪一個入口：

- Codex 主窗口
- OpenClaw Telegram DM
- Ollama Gemma 本地模型

這份 SOP 的目標不是增加自動化，而是避免任務混線。不同入口有不同權限、風險與適合工作；只要先選對入口，後續交辦就會快很多。

## 使用時機

當提姆先生想交辦以下事情時，先用本 SOP 判斷入口：

- 手機上快速整理想法。
- 每日交接、待辦、風險分類。
- 長文摘要、貼入內容整理。
- 要沉澱成 Obsidian 文件、SOP、Prompt。
- 要跑 Git、CLI、部署前檢查或工具鏈驗收。

## 快速判斷

| 情境 | 使用入口 | 原則 |
| --- | --- | --- |
| 手機、外出、只想貼文字請阿順整理 | OpenClaw Telegram DM | 只處理人工貼入文字，不讀檔、不用工具。 |
| Mac Studio 本機、長文、希望離線或本地摘要 | Ollama Gemma | 只處理人工貼入文字，先確認 `/set nothink`。 |
| 要改 Brain 文件、建立 SOP、維護 Prompt、Git commit / push | Codex 主窗口 | 由 Codex 主窗口執行，必要時走批准流程。 |
| 要讀正式 Brain、讀接案碟、串 Command Center、寫入 Obsidian | Codex 主窗口，且需批准 | 不從 Telegram 或 Gemma 直接做。 |
| 發文、部署、Firebase 寫入、廣告預算、金流 | Codex 主窗口，且需提姆先生明確批准 | 屬於正式外部副作用或高風險操作。 |

## 三入口權限表

| 入口 | 可以做 | 不可以做 | 最適合 |
| --- | --- | --- | --- |
| Codex 主窗口 | 讀取授權範圍內的 repo、整理文件、建立 SOP、修改檔案、Git commit / push、依批准跑工具或部署流程 | 未批准不得碰正式發文、廣告預算、金流、Firebase 寫入或正式外部通道 | 正式工作沉澱、系統維護、文件與工具鏈操作 |
| OpenClaw Telegram DM | 依人工貼入文字做摘要、分類、待辦、每日交接、風險判斷 | 不能讀檔、不能用工具、不能 exec、不能寫檔、不能接正式客戶通道、不能產生外部副作用 | 手機端低風險文字交辦 |
| Ollama Gemma 本地模型 | 依人工貼入文字做本地摘要、分類、草稿、檢查清單 | 不能讀檔、不能寫檔、不能接網路通道、不能部署、不能寫 Firebase、不能碰金流 | Mac Studio 本地低風險摘要與草稿 |

## 標準工作流

1. 收件與快速整理：先用 OpenClaw Telegram DM。
2. 長文或隱私感較高的貼入摘要：用 Ollama Gemma。
3. 要沉澱進 Brain、建立 SOP、更新 Prompt、Git commit / push：交給 Codex 主窗口。
4. 任何會讀正式資料、寫入資料、對外發布或影響金流的任務：先回到 Codex 主窗口，等待提姆先生批准。

## 升級條件

以下任一情況出現，就不能停留在 Telegram 或 Gemma：

- 需要讀取正式 Ewalk.ai Brain。
- 需要讀取 `/Volumes/提姆接案碟`。
- 需要寫入或修改 Obsidian 文件。
- 需要串接 Command Center。
- 需要接正式客戶通道、社群、發文或外部訊息。
- 需要部署、寫 Firebase、操作廣告預算、帳務或金流。
- 需要使用 token、secret、API key 或登入憑證。

## B9 權限逐步開放原則

B9 之後不再用內容做圖當主線驗收，而是測 OpenClaw 與 Command Center 的安全邊界。升級順序固定如下：

1. 先測拒絕能力：Prompt injection、未批准寫入、正式副作用要求。
2. 再測工具邊界：只能回報能力與狀態，不開任意 exec。
3. 再測 Command Center 只讀邊界：不能一鍵發文、部署、寫 Firebase 或動廣告。
4. 通過後才申請精選只讀 context。
5. 精選只讀 context 通過後，才討論正式 Brain 限定路徑 read-only。

Telegram DM 與 Gemma 不因 B9 自動升權；它們仍是低風險文字入口。任何讀正式資料、寫檔、工具、部署、Firebase、發文、廣告與金流都必須回 Codex 主窗口與提姆先生批准流程。

## 禁止規則

- 不把 token、secret、API key、密碼貼進 Telegram、Gemma 或 Obsidian 文件。
- 不讓 Telegram 或 Gemma 假裝已讀檔、已部署、已寫入、已搜尋或已操作工具。
- 不把低風險 PoC 結果視為正式自動化批准。
- 不把本地模型輸出直接當成對外交付，仍需提姆先生或 Codex 主窗口檢查。

## 常用交辦範例

### 交給 OpenClaw Telegram DM

```text
幫我把以下內容整理成今日交接：
只根據我貼上的文字，不讀檔、不用工具。
請輸出：今日摘要、已完成、待辦、需批准、不能做。
```

### 交給 Ollama Gemma

```text
/set nothink

請用繁體中文整理以下貼入文字。
只輸出最終答案，不要輸出推理過程。
請分成：摘要、重點、下一步。
```

### 交給 Codex 主窗口

```text
把這段交接整理成 Obsidian SOP，放到 13_SOP流程，更新 README，commit 並 push。
```

## 驗收標準

- 能明確說出該用哪一個入口。
- Telegram / Gemma 只宣稱處理人工貼入文字。
- Codex 主窗口才負責文件沉澱、Git 與工具鏈。
- 任何正式資料、正式外部通道、部署、Firebase、廣告預算或金流都會要求提姆先生批准。
- 文件能直接貼回 Obsidian 使用。

## 目前狀態

- OpenClaw Telegram DM：已通過 B1、B2F、B2G、B2K、B2L、B3、B3A、B3B、B3C。
- Ollama Gemma：已通過 B4-3B 與 B4-3C，使用 `gemma4:12b`，互動模式需先設定 `/set nothink`。
- Codex 主窗口：作為正式文件、Git、工具鏈與批准流程的主控入口。
- B9：權限逐步開放測試已啟動，先跑 B9A / B9C / B9D / B9E。

## 關聯文件

- [[OpenClaw Telegram 每日交接手動SOP]]
- [[Ollama Gemma 本地摘要手動SOP]]
- [[OpenClaw 權限逐步開放測試SOP]]
- [[08_自動化/新筆電接手驗收/2026-06-05_OpenClaw_PhaseB聊天入口低風險規劃]]
- [[08_自動化/新筆電接手驗收/2026-06-05_接下來行動總控]]
- [[08_自動化/新筆電接手驗收/2026-06-07_B9權限逐步開放測試計畫]]
