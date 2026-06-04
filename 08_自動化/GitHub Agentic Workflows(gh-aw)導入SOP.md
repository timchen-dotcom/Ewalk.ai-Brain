# GitHub Agentic Workflows（gh-aw）導入 SOP

用途：把「每天固定要做但容易拖延」的 repo 工作，變成 **可排程、可 review、可回溯** 的 GitHub Actions 工作流（由 AI 產出草稿，再由人審核）。

> 來源：  
> - gh-aw 官方網站：https://github.github.com/gh-aw/  
> - gh-aw repo：https://github.com/github/gh-aw  

---

## 這適合解決什麼問題？

- 每天早上自動產出「repo 現況報告」（issue 形式）：新 PR/issue/失敗的 CI、待處理風險、建議下一步。
- 例行維護：文件一致性檢查、CI 失敗診斷摘要、測試缺口清單、重複 issue 盤點。
- 把 AI 產出從「聊天」落成「可 review 的 Issue / PR」，提升交付可控性。

---

## 安全原則（Ewalk.ai 必守）

1. **先 read-only**：第一版工作流只允許建立 issue / 留言，不直接寫 code、不自動開 PR。  
2. **必要才寫入**：若要開 PR，先加「人類批准門檻」（例如只允許特定 maintainer 手動觸發或 review 後才能 merge）。  
3. **最小權限**：只開必需的 `toolsets`（issues/pull_requests/actions/repos…），避免全開。  
4. **只允許 safe-outputs 的寫入**：所有寫入動作都走可被清洗與限制的 safe-outputs。  

> gh-aw 官方文件本身也強調：早期開發中、需要安全監督、仍可能出錯，需謹慎使用。

---

## 導入步驟（建議順序）

### Step 0｜先選「試跑 repo」

- 建議建立一個內部測試 repo（或用低風險 repo），先跑 3～7 天觀察。

### Step 1｜安裝 gh-aw extension（在可連外的開發機）

```bash
gh extension install github/gh-aw
```

### Step 2｜新增第一個工作流（Markdown）

- 位置：`.github/workflows/<name>.md`
- 結構：YAML frontmatter + Markdown 指令內容（由 gh-aw 轉譯成 `.lock.yml`）

### Step 3｜編譯 lock file

```bash
gh aw compile
```

會產生：`.github/workflows/<name>.lock.yml`（**不要手改**）

### Step 4｜提交並啟用

- `git add` 兩個檔案（`.md` + `.lock.yml`）
- push 後到 GitHub Actions 看是否成功執行

### Step 5｜設定 secrets（視選用的 agent 而定）

- 先從「只讀、只產 issue」的 workflow 開始，降低 secrets/權限風險。

---

## Ewalk.ai 建議的第一個工作流：每日 Repo 狀態報告（Issue）

目標：每天早上自動開一張 issue，內容是「近期變動摘要 + 風險/阻塞 + 建議下一步」，讓提姆只要看 issue 就能決策。

### 規格（建議）

- 觸發：schedule（每日）+ workflow_dispatch（手動）
- 工具權限：只開 `issues` + 讀取 repo 資訊（必要再加 `pull_requests`、`actions`）
- 輸出：只允許 `safe-outputs.create-issue`

### Issue 內容欄位（固定模板）

- 今日摘要（3～7 點）
- 需要決策（提姆要做的 1～3 件事）
- 需要人類介入（例如權限、金鑰、風險）
- 建議下一步（具體 TODO）

---

## 對「每日 GitHub 自我升級情報」的落地方式（建議）

目前我們的流程是：阿順蒐集→寫 Obsidian→（Discord 通知）→提姆允許→才進入 `/自我升級`。

gh-aw 可以做的「下一階段」：

- 讓 workflow 每天自動產出一張 issue：列出最近 24h～7d 的候選升級項，並把「可升級/先觀察」分類好。
- 仍由提姆批准後，阿順才落地到 Obsidian 的 SOP/Prompt/規則（避免 AI 未經允許直接改系統）。

---

## 待提姆確認（才能往下）

- 是否允許在某個測試 repo 試跑 gh-aw（read-only、只開 issue）？
- 允許的執行頻率：每日 / 每週？
- 允許的輸出型態：只開 issue / 可開 PR 草稿？

