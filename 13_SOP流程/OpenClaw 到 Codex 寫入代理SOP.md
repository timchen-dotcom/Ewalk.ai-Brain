---
類型: SOP
狀態: 啟用
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - SOP
  - OpenClaw
  - Codex
  - 寫入代理
  - Brain
---

# OpenClaw 到 Codex 寫入代理 SOP

## 用途

讓 OpenClaw 的低風險文字草稿可以安全進入正式 Brain，而不是停在 Telegram 對話裡。

## 核心分工

| 角色 | 負責 | 不負責 |
| --- | --- | --- |
| OpenClaw | 根據貼入文字產出草稿、分類、待辦、檢查清單 | 讀檔、寫檔、工具、exec、搜尋、外部操作 |
| Codex 主窗口 | 整理草稿、寫入 Brain、commit / push | 未批准外部副作用 |
| 提姆先生 | 批准高風險事項與正式發布 | 不需手動整理所有草稿 |

## 使用時機

適用：

- 客戶上工單。
- 社群內容佇列。
- CTA 判斷。
- 客服流程草案。
- 審稿清單。
- 內部 SOP 草稿。
- 每日工作回填。

不適用：

- 正式發文。
- 排程發文。
- 寫 Firebase。
- 部署。
- 接正式客戶通道。
- 操作廣告預算、金流、帳務。
- 寫 secret、token、API key、密碼。

## 標準流程

### Step 1：交給 OpenClaw

貼給 OpenClaw 的任務必須包含：

```text
你只能根據我貼上的文字工作。
不要讀檔、不要使用工具、不要 exec、不要搜尋、不要寫檔、不要接正式通道、不要寫 Firebase、不要發文或部署、不要操作廣告預算或金流。
```

### Step 2：取得草稿

OpenClaw 回覆後，先檢查：

- 是否只根據貼入文字回答。
- 是否沒有宣稱讀檔。
- 是否沒有宣稱寫檔。
- 是否沒有宣稱已發文、部署、寫 Firebase 或啟用廣告。
- 是否有列出需批准與禁止事項。

### Step 3：交回 Codex 主窗口

將 OpenClaw 草稿貼回 Codex 主窗口。

Codex 主窗口負責：

- 修正文檔結構。
- 放到正確資料夾。
- 標示草稿 / 待審 / 未批准。
- 加上關聯文件。
- 精準 stage。
- commit / push。

### Step 4：回報提姆先生

Codex 主窗口回報：

- 寫入哪些文件。
- 最新 commit。
- 下一步是否需要批准。

## 文件狀態標示

若 OpenClaw 產出的內容尚未正式批准，文件狀態必須使用：

- `內部草案，待批准`
- `可低風險整理，未批准發文`
- `待提姆先生審稿`
- `未達正式上線`

避免使用：

- `已發布`
- `已上線`
- `正式啟用`
- `已投放`

除非提姆先生已明確批准且 Codex 主窗口完成對應正式流程。

## Git 規則

Codex 主窗口 commit 前必須：

- `git diff --cached --name-status`
- `git diff --cached --check`
- 只 stage 本次相關文件。
- 不帶 `.obsidian` unrelated dirty。
- 不帶素材大檔，除非任務明確需要。

## 升級限制

B13 不代表：

- OpenClaw 可以讀 Brain。
- OpenClaw 可以寫 Brain。
- OpenClaw 可以 commit / push。
- OpenClaw 可以接正式客戶通道。
- OpenClaw 可以發文、部署、寫 Firebase。
- OpenClaw 可以操作廣告預算或金流。

## 下一階

若 B13 穩定，下一階才討論：

- Command Center 本機 mock action queue。
- Firebase emulator / staging 寫入。
- 正式外部副作用仍需逐案批准。
