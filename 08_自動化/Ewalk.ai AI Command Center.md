# Ewalk.ai AI Command Center

## 定位

Ewalk.ai AI Command Center 是一套 AI 虛擬員工與任務指揮中心，也是 Ewalk.ai 朝 AI 行銷整合公司前進的營運中樞。

它的目標不是讓單一 AI 做所有事，而是讓阿順作為總控大腦，將任務分派給不同角色的 AI Agent，形成一個可管理、可追蹤、可擴張的工作系統。

公司級組織架構見：[[../00_系統說明/Ewalk.ai AI行銷整合公司組織架構|Ewalk.ai AI行銷整合公司組織架構]]

## Harness 定位

Command Center 不是單純 UI，而是 Ewalk.ai Agent Harness 的操作面板。

核心公式：

```text
Agent = LLM + Harness
```

阿順目前已具備 LLM、Prompt、Skills、Tools、Memory 與部分 Security / Governance。下一階段要補齊 Harness Runtime，讓每次任務都能留下：

- 任務來源
- 啟動角色
- 使用上下文
- 工具呼叫
- 判斷與風險
- 產出與驗證
- 批准狀態
- 成本與錯誤
- 記憶沉澱

詳細架構見：[[Agent Harness 阿順自我完成架構]]

## Boss

- Boss：陳勁廷
- 英文名：Tim
- 正式稱呼：提姆先生
- 身份：Ewalk.ai 數位漫步有限公司負責人
- 權責：最終決策者、交付把關者、AI 員工任務方向與優先級設定者

## 阿順職責

- 職稱：Ewalk.ai 數位漫步有限公司專業經理人
- 回報對象：提姆先生
- 核心職責：統籌任務、判斷優先級、分派 Sub-agent、整合成果、維護 SOP、把關交付品質

## 第一版角色

| 角色 | 任務 | 入職手冊 | 狀態 |
| --- | --- | --- | --- |
| 阿順 | 專業經理人、總控、策略、判斷、分派、整合、把關 | `AGENTS.md` | 啟用中 |
| 工讀生 Gemma | 整理、分類、摘要、待辦格式化 | [[本地AI-Gemma/Gemma入職手冊\|Gemma入職手冊]] | 啟用中 |
| 專案助理 | 拆任務、排時程、追進度、整理每日 / 每週待辦 | [[AI員工入職手冊/專案助理入職手冊\|專案助理入職手冊]] | 啟用中 |
| 客戶成功經理 | 新客戶需求盤點、合作範圍、客戶窗口、待補資料 | [[AI員工入職手冊/客戶成功經理入職手冊\|客戶成功經理入職手冊]] | 啟用中 |
| 社群主編 | IG / FB 內容支柱、內容月曆、社群更新節奏 | [[AI員工入職手冊/社群主編入職手冊\|社群主編入職手冊]] | 啟用中 |
| 廣告投放專員 | Meta 廣告 Brief、受眾、素材、預算建議、優化紀錄 | [[AI員工入職手冊/廣告投放專員入職手冊\|廣告投放專員入職手冊]] | 啟用中 |
| 數據分析師 | 週成效摘要、月報、廣告與社群洞察 | [[AI員工入職手冊/數據分析師入職手冊\|數據分析師入職手冊]] | 啟用中 |
| 設計企劃 | 視覺需求、圖像 Prompt、素材規格、品牌一致性檢查 | [[AI員工入職手冊/設計企劃入職手冊\|設計企劃入職手冊]] | 啟用中 |
| 訂閱稽核員 | 每月訂閱費用整理、重複工具檢查、取消建議 | [[AI員工入職手冊/訂閱稽核員入職手冊\|訂閱稽核員入職手冊]] | 啟用中 |
| 勞健保勞退專員 | 勞保、健保、勞退繳款紀錄、附件歸檔、期限提醒 | [[AI員工入職手冊/勞健保勞退專員入職手冊\|勞健保勞退專員入職手冊]] | 啟用中 |
| GitHub 研究員 | 自我升級情報、高討論 Repo、Agent 工作流研究 | [[AI員工入職手冊/GitHub研究員入職手冊\|GitHub研究員入職手冊]] | 啟用中 |
| 影片腳本拆解員 | 外部影片腳本拆段、抽取敘事骨架、轉成客戶可拍攝短影音腳本 | [[AI員工入職手冊/影片腳本拆解員入職手冊\|影片腳本拆解員入職手冊]] | 草稿測試中 |

## 基礎架構

```text
Discord 交辦入口
        ↓
阿順判斷與分派
        ↓
AI Agent 執行
        ↓
Obsidian 知識庫 / 任務紀錄
        ↓
Discord / Calendar / 報告回覆
```

## 協作層級

```text
Agent：阿順，統籌任務與主對話
Sub-agent：專門分工與摘要回報
Skills：封裝可重複使用的流程
Tools：連接外部服務與資料
```

詳細規則見：[[Sub-agent協作架構]]

任務分派、佇列與回報規則見：[[AI部門任務分類、佇列與回報規則]]

已批准落地的營運規則：

- [[AI員工SOP與Skill綁定表]]
- [[跨部門標準交接單]]
- [[AI員工權限隔離規則]]
- [[營運Flows/README|營運 Flows]]

## 下一步

- [x] 設計 Agent 角色與權限
- [x] 建立 AI 員工入職 SOP
- [x] 建立 Gemma 入職手冊
- [x] 建立 Sub-agent 協作架構
- [x] 建立 AI 行銷整合公司組織架構
- [x] 建立新客戶接案到 AI 部門分工 SOP
- [x] 建立 TheVision AI 部門分工樣板
- [x] 建立財務訂閱稽核 SOP
- [x] 建立第一批 AI 員工入職手冊
- [x] 設計任務分類規則
- [x] 設計任務佇列
- [x] 設計回報格式
- [x] 建立 AI 員工 SOP 與 Skill 綁定表
- [x] 建立跨部門標準交接單
- [x] 建立 AI 員工權限隔離規則
- [x] 建立第一批 5 條高頻營運 Flow
- [x] 建立 Meta 粉專全自動發文 Flow 與韓食日常鍋物樣板
- [x] 建立 GitHub 自我升級情報自動化規則
- [x] 吸收 `Agent = LLM + Harness` 架構，建立阿順 Harness 完成路線
- [x] 建立小公司可控版 Agent Harness 開工計畫
- [x] 建立 Agent Harness 工具權限表
- [x] 建立 Agent Harness Approval Gate
- [x] 建立 `ai_runs` 任務執行紀錄 dry-run 產生器
- [x] 在 Command Center 新增 AI 執行紀錄區塊（本機 dry-run 版）
- [x] 正式寫入 Firestore `ai_runs`
- [x] 建立 Command Center Approval Queue（本機 dry-run 版）
- [ ] 正式寫入 Firestore `approvals`
- [ ] 升級 `#專業經理人🤖阿順` 為即時對談與任務交辦窗口
- [ ] 決定第一版 UI
- [ ] 決定哪些功能先自動化

Discord 對談窗口升級方案見：[[Discord阿順即時對談窗口升級方案]]

## 最近一次 Firestore 寫入

- 時間：2026-06-02 23:40（Asia/Taipei）
- Project：`ewalk-ai-system-prod`
- 寫入身份：`tim.chen@ewalk.ai`
- 批准人：提姆先生
- 結果：成功寫入 2 筆 `ai_runs`，並新增 1 筆 `audit_logs`
- 稽核紀錄：`audit_logs/ai-runs-sync-20260602154020`
- 驗證文件：`ai_runs/airun_20260602_command_center_接入_ai_執行紀錄區_145054`
- 本機結果檔：`Ewalk.ai Brain/08_自動化/firebase/output/ai-runs-browser-write-result.json`

## Approval Queue

狀態：本機 dry-run 已接入 Command Center，尚未正式寫入 Firestore。

第一批待批准樣板：

- 韓食日常鍋物品牌日常貼文進入正式發文流程
- 每日 04:00 GitHub 自我升級情報研究
- Firebase Blaze / Storage 啟用
- TheVision Meta 廣告月預算上限設定

詳細規格見：[[Command Center Approval Queue 小公司可控版]]

## 入職規則

每一位新的 AI 員工進入 Command Center 前，都要先建立入職手冊。入職手冊需說明角色定位、主管、可做與不可做的任務、權限範圍、輸出格式、品質標準與交接規則。

通用流程見：[[../13_SOP流程/AI員工入職SOP|AI員工入職SOP]]

通用模板見：[[../模板/AI員工入職手冊模板|AI員工入職手冊模板]]
