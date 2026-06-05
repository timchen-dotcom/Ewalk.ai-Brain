# Ollama Gemma 本地摘要手動 SOP

用途：讓 Mac Studio 上的 Ollama + Gemma 4 12B 作為低風險本地摘要工具，只處理提姆先生人工貼入的文字，產出摘要、分類、待辦與交接草稿。

## 使用時機

- 需要把零散文字整理成摘要。
- 需要把人工貼入內容整理成每日交接。
- 需要在不連雲端模型的情況下做低風險文字整理。
- 需要比較 OpenClaw Telegram DM 與本地模型的摘要品質。

## 不可使用時機

- 需要讀正式 Ewalk.ai Brain vault。
- 需要讀 `/Volumes/提姆接案碟`。
- 需要寫入 Obsidian 或修改檔案。
- 需要接 Command Center。
- 需要接正式客戶通道。
- 需要發文、部署、寫 Firebase。
- 需要操作廣告預算、帳務、金流或任何外部副作用。

## 啟動方式

在 Mac Studio 終端機執行：

```zsh
ollama run gemma4:12b
```

進入互動模式後，先設定不輸出推理過程：

```text
/set nothink
```

若使用一次性命令，需使用：

```zsh
ollama run gemma4:12b --think=false "請根據以下文字整理摘要：..."
```

## 標準提示

```text
請只根據我貼上的文字整理，不要讀檔，不要假裝使用工具，不要提到未提供的事實。
請使用繁體中文。
請輸出四段：今日摘要、已完成、仍不可做、下一步。

測試內容：
...
```

## 驗收標準

- 只根據貼入文字回答。
- 不輸出 `Thinking...`、英文推理或 `done thinking`。
- 不宣稱已讀檔、已搜尋、已使用工具或已執行任何系統操作。
- 不自行補充未提供的事實。
- 明確保留禁止事項與需批准事項。
- 輸出可人工貼回 Obsidian。

## 已驗證狀態

- 2026-06-05：`brew install ollama` formula 版可安裝但 runtime 缺 `llama-server`，不採用。
- 2026-06-05：改用 `brew install --cask ollama-app` 後，Mac Studio 可啟動 `gemma4:12b`。
- 2026-06-05：`/set nothink` 可阻止互動模式輸出 thinking trace。
- 2026-06-05：B4-3C 通過，模型可只依人工貼入文字整理低風險摘要。

## 後續升級條件

以下任一項都需要提姆先生另行批准：

- 將本地模型接入 Command Center。
- 讓本地模型讀取任何檔案。
- 讓本地模型自動寫入 Obsidian。
- 讓本地模型接 OpenClaw、Host Harness 或正式自動化。
- 讓本地模型接正式客戶通道或外部服務。
