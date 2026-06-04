# 小公司可控版 Agent Harness 開工計畫

建立日期：2026-06-02  
負責角色：阿順  
最終決策者：提姆先生  
狀態：可立即開始，不需等待硬體更新

## 結論

小公司可控版現在就能開始。

```text
不需要等 Mac Studio 重置
不需要先導入 OpenShell / NemoClaw
不需要一次裝完所有 agent framework
```

目前 Ewalk.ai 已經具備：

- Obsidian `Ewalk.ai Brain`
- Firebase project：`ewalk-ai-system-prod`
- Command Center 文件與初版 app
- AI 員工權限隔離規則
- Agent Harness 架構文件
- `ai_runs` schema 草案
- 韓食日常鍋物 Firebase 樣板

現在缺的是把這些東西收斂成「每次任務都照這個制度跑」。

## 小公司可控版定義

小公司可控版不是大型企業 sandbox，而是：

```text
阿順可以工作
AI 員工可以分工
每次任務有紀錄
高風險動作會停下來
提姆先生只看摘要與批准
出了問題能回查
花費能逐步估算
```

## 第一階段要做到的 7 件事

| 模組 | 目的 | 目前狀態 | 是否需等新硬體 |
| --- | --- | --- | --- |
| `ai_runs` dry-run | 每次 AI 任務都有執行紀錄 | schema 已有草案 | 否 |
| 工具權限表 | 確認每個工具能做什麼、不能做什麼 | 權限隔離規則已存在 | 否 |
| Approval Gate | 發文、金流、預算、核心規則前停下 | 規則已存在，需整理成流程 | 否 |
| Command Center AI 執行紀錄區 | 讓提姆先生看任務狀態 | 本機 dry-run 版已新增，首次 Firestore 正式寫入已完成 | 否 |
| Approval Queue | 讓提姆先生集中審核高風險事項 | 本機 dry-run 版已新增，正式 Firestore 寫入待批准 | 否 |
| 任務分流規則 | 低風險自動做，高風險等批准 | 已有 AI 員工與部門規則 | 否 |
| 每日摘要 | 讓提姆先生不用追每件小事 | 可用 Obsidian 先做 | 否 |
| 硬體隔離 | 讓阿順長期穩定、安全長跑 | 待 Mac Studio 重置後做 | 是，長期需要 |

## 現在就能做

### 1. 建立 Run Log 制度

每次阿順任務都建立一筆內部紀錄，先寫 Obsidian，之後再寫 Firestore。

必填欄位：

- `ai_run_id`
- 任務來源
- 任務目標
- 使用角色
- 使用 Skill / 文件
- 使用工具
- 權限等級
- 是否需要提姆先生批准
- 實際產出
- 驗證方式
- 下一步

### 2. 建立工具權限表

先把工具分級：

| 等級 | 工具類型 | 範例 | 規則 |
| --- | --- | --- | --- |
| L0 | 讀取 / 摘要 | 讀 Obsidian、整理資料 | 可自動 |
| L1 | 內部寫檔 | 寫 SOP、任務紀錄、草稿 | 可自動，但需留紀錄 |
| L2 | 內部建議 | 行銷建議、廣告建議、採購建議 | 可自動 |
| L3 | 對外交付草稿 | 客戶簡報、社群草稿、月報草稿 | 阿順整合後送審 |
| L4 | 對外發布 / 預算 / 金流 | FB 發文、廣告預算、取消訂閱 | 必須提姆先生批准 |
| L5 | 系統核心規則 | AGENTS、Skill、自動化長期規則 | 必須提姆先生批准 |

### 3. 建立批准閘

任何任務如果碰到下列項目，阿順必須停下：

- 對外發布
- 對客戶正式承諾
- 調整廣告預算
- 取消或變更訂閱
- 改付款方式
- 寫入正式 Firebase 高風險資料
- 新增外部工具高權限 token
- 修改核心規則

### 4. Command Center 先做內部版

第一版不用追求漂亮 UI，先能看到：

- 最近任務
- 等待批准
- 今日完成
- 風險提醒
- AI 執行紀錄
- 客戶待辦

### 5. 每日摘要

每天阿順給提姆先生一份白話摘要：

```text
今天完成了什麼
卡在哪裡
需要你批准什麼
有什麼風險
明天會做什麼
```

## 需要安裝或接上的工具

### 第一波：必要

| 工具 | 目的 | 狀態 |
| --- | --- | --- |
| Firebase CLI | Command Center / Firestore | 已有 |
| Obsidian Vault | 記憶與 SOP | 已有 |
| Codex | 阿順工作入口 | 已有 |
| GitHub | 自我升級與程式版本 | 可逐步接 |
| Google / Gmail | 訂閱稽核與資料整理 | 需要依任務授權 |

### 第二波：有用，但不急

| 工具 | 目的 | 何時導入 |
| --- | --- | --- |
| Langfuse | 成本、trace、錯誤回放 | `ai_runs` dry-run 穩定後 |
| OpenAI Agents SDK | 正式 agent loop / handoff | 第一批流程穩定後 |
| LangGraph | 長任務、人審、恢復 | 週報 / 月報流程穩定後 |
| n8n | Gmail、RSS、Webhook 通知橋接 | 固定流程明確後 |
| Dify | 固定 AI 工具 UI | 需要給員工或客戶操作時 |

### 第三波：先觀摩，不導入

| 工具 | 判斷 |
| --- | --- |
| OpenShell | 企業級安全 runtime，現在先學概念 |
| NemoClaw | NVIDIA 企業 stack，現在不需要 |
| OpenClaw / OpenHarness | 可低風險 PoC，但不能先接發文、金流、預算 |

## 硬體更新後再做

等 Mac Studio 重置成阿順專用主機後，再做：

- 常駐背景任務
- 多瀏覽器自動化
- 長時間 Firebase / Command Center 服務
- 更嚴格的本機資料隔離
- OpenClaw / OpenHarness 低風險 PoC
- Langfuse / agent trace 長期保存
- 真正「爸爸模式」日常接管

## 今天可以開始的施工順序

### Step 1：建立小公司可控版文件

狀態：已完成本文件。

### Step 2：建立工具權限表文件

輸出：

```text
Ewalk.ai Brain/08_自動化/Agent Harness 工具權限表.md
```

### Step 3：建立 Approval Gate 文件

輸出：

```text
Ewalk.ai Brain/08_自動化/Agent Harness Approval Gate.md
```

### Step 4：建立第一版 `ai_runs` dry-run 模板

輸出：

```text
Ewalk.ai Brain/08_自動化/AI執行紀錄/
Ewalk.ai Brain/08_自動化/firebase/scripts/create-ai-run-dry-run.mjs
Ewalk.ai Brain/08_自動化/firebase/output/ai-runs.dry-run.json
```

狀態：已建立本機 dry-run 產生器，不會寫入正式 Firebase。

### Step 5：把 Command Center 下一步改成小公司可控版

更新：

```text
Ewalk.ai Brain/08_自動化/Ewalk.ai AI Command Center.md
```

狀態：已新增 Command Center 本機 `AI 執行紀錄` 區塊，可讀取 `ai-runs.dry-run.json` 轉出的 App 資料。

### Step 6：準備正式 Firestore 寫入預覽

輸出：

```text
Ewalk.ai Brain/08_自動化/firebase/output/ai-runs-firestore-commit.preview.json
```

狀態：已產生預覽檔，不會自動提交；正式寫入需提姆先生再次確認執行。

### Step 7：正式寫入 Firestore `ai_runs`

輸出：

```text
Ewalk.ai Brain/08_自動化/firebase/output/ai-runs-browser-write-result.json
```

狀態：已完成。2026-06-02 23:40 使用公司帳號 `tim.chen@ewalk.ai` 寫入 `ewalk-ai-system-prod`，共寫入 2 筆 `ai_runs`，並新增 1 筆 `audit_logs`。

### Step 8：建立 Command Center Approval Queue

輸出：

```text
Ewalk.ai Brain/08_自動化/Command Center Approval Queue 小公司可控版.md
Ewalk.ai Brain/08_自動化/firebase/output/approval-queue.dry-run.json
Ewalk.ai Brain/08_自動化/firebase/command-center-app/data/approval-queue.js
```

狀態：已完成本機 dry-run 與 Command Center 顯示；正式 Firestore `approvals` 寫入尚未執行。

## 提姆先生需要批准的地方

第一階段不需要批准：

- 寫內部文件
- 建立 dry-run 紀錄
- 整理權限表
- 整理 Approval Gate
- 更新 Command Center 文件

需要批准：

- 正式寫入 Firestore `ai_runs`
  - 狀態：已由提姆先生批准並完成首次正式寫入。
  - 正式寫入工具：`Ewalk.ai Brain/08_自動化/firebase/scripts/write-ai-runs-firestore.mjs`
  - 手動入口：`寫入FirebaseAIRuns.command`
- 正式寫入 Firestore `approvals`
  - 狀態：本機 dry-run 已完成，尚未提交。
- 接 Langfuse
- 接 OpenAI Agents SDK 自動執行工具
- 接 Gmail / Google 高權限自動化
- 接 Meta 發文或廣告
- 啟用任何定時自動執行
- Mac Studio 重置

## 阿順判斷

小公司可控版現在就該開始。

硬體更新只影響「長期穩定與安全隔離」，不影響第一階段制度建立。

```text
今天開始建制度
Mac Studio 重置後接常駐
工具穩定後再自動化
提姆先生只批准高風險
```
