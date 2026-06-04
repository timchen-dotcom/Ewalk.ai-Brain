# 新筆電接手與 Mac Studio 重置清單

建立日期：2026-06-04
負責角色：阿順
最終決策者：提姆先生
狀態：新筆電日常阿順工作入口可接手，Mac Studio 暫保留為歷史 thread 與資料備援

## 核心原則

先讓新筆電接手 Ewalk.ai 系統。

新筆電驗收通過後，Mac Studio 才能重置。

在阿順明確回報「新筆電接手完成」以前，不重置、不清除、不刪除 Mac Studio。

## 今日目標

```text
MacBook Air 接手阿順與 Ewalk.ai 系統
Mac Studio 暫時保留完整資料
確認新筆電可正常工作後
再把 Mac Studio 重置成 OpenClaw 阿順主機
```

## 階段 1：Mac Studio 先暫停大施工

目前 Mac Studio 先做：

- 保留現有資料。
- 不重置。
- 不清除。
- 不安裝 OpenClaw 正式環境。
- 不啟用 24H 常駐 Harness。

Mac Studio 目前角色：

```text
舊工作環境 / 備援資料源
```

## 階段 2：新筆電基礎設定

新筆電先完成：

- 更新 macOS。
- 開啟 FileVault。
- 設定 Touch ID。
- 建立 Chrome Profile：
  - `Ewalk.ai｜阿順工作`
  - `提姆先生｜個人`
- 安裝：
  - Codex Desktop
  - Google Chrome
  - Obsidian
  - 必要時 Canva

## 階段 3：搬移 Ewalk.ai 自動化系統

從 Mac Studio 複製整個資料夾：

```text
/Users/chenjinting/Desktop/Ewalk.ai 自動化系統
```

到新筆電：

```text
/Users/chenjinting/Desktop/Ewalk.ai 自動化系統
```

注意：

- 這個資料夾含工作資料與部分本機設定。
- 新筆電必須先開 FileVault 再搬。
- 不要把這包上傳到公開雲端。
- Mac Studio 原資料先保留，不刪。

建議搬移方式：

1. 同網路用 Finder 檔案分享。
2. 或 AirDrop 整個資料夾。
3. 或用外接硬碟搬。

## 階段 4：新筆電驗收

在新筆電打開 Codex，選擇工作資料夾：

```text
~/Desktop/Ewalk.ai 自動化系統
```

然後對阿順說：

```text
阿順，新筆電已開好，開始驗收。
```

阿順要驗收：

- 能讀 `AGENTS.md`。
- 能讀 `Ewalk.ai Brain`。
- 能看到 `01_客戶`。
- 能看到 `08_自動化`。
- 能看到 `13_SOP流程`。
- 能建立測試文件。
- 能打開 Command Center 本機頁。
- 能讀客戶名冊。

## 2026-06-05 初驗結果

關聯紀錄：[[2026-06-05_新筆電接手驗收紀錄]]

目前結論：

- 新筆電已可作為提姆先生控制台使用。
- Codex 可讀 `AGENTS.md` 與 `Ewalk.ai Brain`。
- `01_客戶` 可讀，客戶資料夾共 17 位。
- `08_自動化` 與 `13_SOP流程` 可讀。
- 已建立驗收紀錄，確認新筆電可寫入 Vault。
- Command Center 本機頁可開：`http://localhost:8787/`。
- Command Center 本機資料可讀：17 位客戶、4 筆待批准、5 筆 AI 執行紀錄。
- Homebrew、Node.js / npm、GitHub CLI、Firebase CLI、Vercel CLI 已安裝完成。
- GitHub CLI 已登入 `timchen-dotcom`，Firebase CLI 已登入 `tim.chen@ewalk.ai`，Vercel CLI 已登入 `timchen-dotcom`。
- Firebase active project 已確認為 `ewalk-ai-system-prod`。
- Codex GitHub 入口已可讀 `timchen-dotcom/Ewalk.ai-Brain`。
- Codex Vercel 入口工具已出現，但讀目前 team/project 回 `403 Forbidden`，需補授權。
- FileVault、Touch ID、自動鎖定、尋找我的 Mac 已由提姆先生人工確認。
- Chrome Profile 已由提姆先生人工確認。
- Obsidian 已可開啟 `Ewalk.ai Brain`。
- 本次新筆電 Codex thread 已改名並釘選為 `Ewalk.ai 專業經理人 - 阿順｜新筆電接手`。
- 舊主機 Codex 釘選聊天室未自動同步到新筆電，已建立喚起清單。
- P0 / P1 工作接續摘要已建立，可從 Vault 承接日常管理脈絡。
- 新筆電可取代判定已建立：可取代日常阿順工作入口，不可取代 Mac Studio 歷史 thread 備援與未來 24H 主機。
- `Ewalk.ai Brain` Git 狀態已盤點：261 筆 dirty，其中 30 筆已追蹤修改、約 231 筆未追蹤。
- 霖老師線上車庫已在提姆先生批准後完成 Vercel production 部署，公開站驗證通過。

尚未完成：

- Vault 主副本策略需確認。
- Vercel Codex 入口需補 team/project 授權。
- 舊主機 P0 / P1 Codex 工作窗口完整歷史可選擇由 Mac Studio 舊 thread 輸出交接摘要補強。
- `Ewalk.ai Brain` dirty 狀態需分批整理，不可直接 reset 或一次性 commit。
- 正式 Firebase / Vercel 寫入與部署仍採逐次批准；霖老師線上車庫本次正式部署已完成。

管制判斷：

```text
新筆電可接手日常阿順工作入口。
Mac Studio 繼續保留，不可重置，直到舊釘選 thread 完整歷史與 Git-clean 主副本收尾。
```

## 階段 5：新筆電接手完成條件

以下都完成才算接手：

- Codex 在新筆電可正常讀寫 Ewalk.ai 系統。
- Obsidian 能開 Vault。
- Chrome 公司 Profile 可登入。
- Command Center 可打開。
- 重要文件與客戶資料可讀。
- 阿順能在新筆電建立一份測試紀錄。

## 階段 6：Mac Studio 重置前檢查

重置前確認：

- 新筆電已完整接手。
- Mac Studio 重要資料已有新筆電或備份。
- 提姆先生確認可以重置。
- 不需要保留個人資料。
- OpenClaw 主機安裝計畫已確認。

## 階段 7：Mac Studio 重置後定位

重置後 Mac Studio 定位：

```text
OpenClaw First 阿順專用主機
```

重置後安裝順序：

1. macOS 基礎安全設定。
2. 公司 Google 帳號。
3. OpenClaw。
4. Ollama。
5. Gemma 4 12B。
6. Ewalk.ai 系統資料。
7. Command Center。
8. Codex 工程員。
9. 24H 常駐排程。

## 禁止事項

在新筆電驗收前，禁止：

- 重置 Mac Studio。
- 刪除 Mac Studio 上的 Ewalk.ai 系統。
- 清除瀏覽器登入資料。
- 取消或撤銷仍可能需要的工作 token。
- 啟用 OpenClaw 正式自動化。
