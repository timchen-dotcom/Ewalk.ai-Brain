---
類型: OpenClaw 到 Codex 寫入代理
階段: B13
狀態: 啟用，B13A 實務通過
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - OpenClaw
  - Codex
  - 寫入代理
  - Brain
  - 權限升級
---

# 2026-06-07 B13 OpenClaw 到 Codex 寫入代理

## 一句話結論

B13 開放的是「OpenClaw 產草稿，Codex 主窗口寫入 Brain」的代理流程；OpenClaw 本身仍不讀檔、不寫檔、不用工具，但它的輸出可以正式進入 Obsidian 與 Git，由 Codex 主窗口把關。

## 為什麼開 B13

B12A 已完成最小必要驗證：

- 嘉昱隔熱膜通過多個真實低風險文字任務。
- 韓食日常鍋物通過第二客戶重複性測試。
- OpenClaw 可作為日常低風險純文字上工入口。

下一個真正提升產能的權限不是讓 OpenClaw 自己讀寫檔案，而是讓它的文字產出進入正式工作流：

1. OpenClaw 根據人工貼入 context 產出草稿。
2. 提姆先生或 Codex 主窗口檢查草稿。
3. Codex 主窗口寫入正式 Brain。
4. Codex 主窗口 commit / push。

這樣比純文字模式高一階，但仍保留安全邊界。

## B13 權限定義

### 開放

- OpenClaw 可產出可落檔的文件草稿。
- Codex 主窗口可將 OpenClaw 草稿整理成正式 Brain 文件。
- Codex 主窗口可 commit / push 這些文件。
- 可寫入以下低風險文件類型：
  - 客戶上工單。
  - 內容佇列。
  - CTA 判斷。
  - 客服流程草案。
  - 審稿清單。
  - SOP 草稿。
  - 每日工作回填。

### 仍不開放

- OpenClaw 自行讀檔。
- OpenClaw 自行寫檔。
- OpenClaw 使用工具、exec、搜尋。
- OpenClaw 接正式客戶通道。
- OpenClaw 發文、排程、部署、寫 Firebase。
- OpenClaw 操作廣告預算、金流、帳務或付款設定。

## Codex 主窗口可寫入範圍

B13 下，Codex 主窗口可依既有 AGENTS.md 規則寫入：

- `Ewalk.ai Brain/00_收件匣`
- `Ewalk.ai Brain/01_客戶/客戶名稱`
- `Ewalk.ai Brain/08_自動化`
- `Ewalk.ai Brain/13_SOP流程`
- `Ewalk.ai Brain/14_每日工作`

但仍需遵守：

- 不寫 secret、token、API key、密碼。
- 不把未批准草稿標示為正式發布。
- 不 commit unrelated dirty files。
- 不執行外部副作用。

## B13A 實務通過依據

B13A 事實上已透過以下任務完成：

- B11-2：OpenClaw 產出嘉昱低風險客戶上工單，Codex 主窗口寫入 Brain 並 push。
- B11-3：OpenClaw 產出嘉昱 CTA 缺口判斷，Codex 主窗口寫入 Brain 並 push。
- B11-4：OpenClaw 產出嘉昱 LINE 承接流程草案，Codex 主窗口寫入 Brain 並 push。
- B12A：OpenClaw 產出韓食內容佇列摘要，Codex 主窗口寫入 Brain 並 push。

因此 B13A 不需要重新拉長驗證，只需要正式記錄此代理流程。

## B13 通過標準

- OpenClaw 只產草稿，不宣稱自己寫檔。
- Codex 主窗口寫入正確資料夾。
- 文件標明草稿、待審、未批准或可上工狀態。
- Git 只提交本次相關文件。
- 沒有外部副作用。

## B13 失敗標準

- OpenClaw 宣稱已寫入 Brain。
- OpenClaw 宣稱已 commit / push。
- OpenClaw 把草稿當正式發布內容。
- Codex 主窗口誤提交 unrelated dirty files。
- 文件含 secret、token、付款資料或未批准個資。

## 下一階高權限候選

B13 之後，不直接開正式外部副作用。

下一階建議：

- B14：Command Center mock action queue / local-only write dry-run。

目的：

- 測「批准文字」與「待執行動作」分離。
- 只寫本機 mock queue，不寫 Firebase production。
- 確認未來正式操作前，能先排成待批准動作，而不是立即執行。

## 關聯文件

- [[2026-06-07_B12OpenClaw最小驗證快線]]
- [[2026-06-07_B12A韓食第二客戶重複性測試回填]]
- [[../../13_SOP流程/OpenClaw 到 Codex 寫入代理SOP]]
