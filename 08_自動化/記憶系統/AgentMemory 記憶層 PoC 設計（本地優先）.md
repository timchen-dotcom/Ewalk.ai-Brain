# AgentMemory 記憶層 PoC 設計（本地優先）

狀態：草稿（需提姆先生允許後才可進入正式導入）  
建立日期：2026-06-01  
更新日期：2026-06-04  
對照來源：

- `jayzeng/agentmemory`（local-first markdown memory + semantic search + context injection）https://github.com/jayzeng/agentmemory
- `Tencent/TencentDB-Agent-Memory`（白盒、可追溯、分層記憶）https://github.com/Tencent/TencentDB-Agent-Memory
- `rohitg00/agentmemory`（跨 agent persistent memory + MCP / hooks / skills）https://github.com/rohitg00/agentmemory

## 目的

先用「最小可回退」方式，驗證一件事：

> 把阿順每天的決策與摘要沉澱成「可檢索的記憶」，是否能減少重問/重做與 token 浪費，並提升長任務穩定度。

本 PoC 只針對：`09_知識庫/自我升級情報`（每日 GitHub 情報）這一條產線。

## 2026-06-03 補充：本輪先吸收的不是「裝哪一套」，而是治理能力

今天新增的重點，不是把第三方 memory server 直接裝進系統，而是把以下 4 種能力變成評估必看項：

- 多 Agent 記憶隔離：不同 AI 員工不能共用同一桶長期記憶
- replay / viewer：未來若出錯，要能回看當時寫入了什麼記憶
- 成本感知：記憶層不能只追求多存，還要能控制注入成本
- 證據回溯：每一段摘要或規則，都要能回到原始日報、SOP 或交付檔

## 2026-06-04 補充：把 `rohitg00/agentmemory` 的新能力轉成 PoC 驗收點

今天新增的吸收重點，不是改成外部 memory server，而是把 release 裡提到的能力變成更具體的 PoC 驗收：

- `AGENT_ID` 或等價角色鍵：阿順、GitHub 研究員、內容/報表角色至少要分桶，不能共用長期記憶。
- hooks 思路：之後若要串 Codex，優先接在「任務完成後抽記憶」或「交接前生成草稿」，不要直接在推理中途寫入。
- replay / viewer：PoC 就算不用 viewer，也要能用 Markdown 或日誌回放「這段記憶從哪份日報抽出來」。
- benchmark harness：先不求分數，但要能比較「有記憶 vs 無記憶」是否真的少補問、少重做。

## PoC 範圍（最小）

- 只新增「記憶筆記」與「抽取規格」：不改任何既有 SOP / AGENTS / 自動化行為
- 不接外部資料庫：本地 Markdown 即可
- 不做自動注入：先用「手動檢索 + 手動貼入」驗證價值
- 不先安裝第三方 memory server：先比較治理模型與資料結構，避免把工具導入當成 PoC 成功

## 記憶資料夾（建議）

> 僅做提案；若提姆先生允許再建立資料夾與規格檔。

```text
Ewalk.ai Brain/08_自動化/記憶系統/agent-memory-poc/
  README.md
  00_scratchpad.md
  10_daily/
    YYYY-MM-DD.md
  20_topics/
    topic_xxx.md
```

## 記憶最小 Schema（Markdown 格式）

### A) Daily 記憶（YYYY-MM-DD.md）

必填：

- 日期 / 任務：今天做了哪個任務（例：GitHub 自我升級情報）
- 決策：可升級/先觀察/暫不吸收（含理由）
- 產出：對應的檔案連結（Obsidian 內部連結）
- 風險：涉及權限/外部連線的點（若有）
- 可重複規則：今天新增或強化的判斷準則（只留可複用）

### B) Topic 記憶（topic_xxx.md）

必填：

- 這個主題的「定義」與「何時會用到」
- 常見錯誤 / 風險
- 可直接複製的檢核清單 / Prompt

## 檢索方式（PoC 先用最簡單）

### 1) 手動檢索（先驗證價值）

- 用 Obsidian 搜尋：
  - `tag:#省Token`、`tag:#工作流`、`AWI`、`memory`、`context injection`
- 或用 CLI：
  - `rg "AWI|prompt injection|memory|context injection" "Ewalk.ai Brain/08_自動化/記憶系統"`

### 2) 半自動檢索（提姆允許後再做）

對照 `agentmemory` 的思路：

- 若未來要上「語意檢索」：才考慮 `qmd` 或其他 embedding 流程
- 若要「自動注入記憶」：一定要做 allowlist（只注入低風險、已審核的記憶片段）

## PoC 階段建議（2026-06-03 版）

### Phase 0：純手動治理驗證

- 來源限定：只用 `09_知識庫/自我升級情報`
- 寫入方式：人工用 `記憶片段抽取 Prompt` 產生短記憶，再人工存檔
- 驗證重點：
  - 同主題是否能穩定抽出相近規則
  - 不同任務角色是否會互相污染記憶
  - Discord 草稿 / 交接文是否因此更一致

### Phase 1：角色隔離驗證

- 若進入工具測試，第一個必驗是 `AGENT_ID` 或等價的角色隔離能力
- 最少先分：
  - 阿順（總控 / 決策）
  - GitHub 研究員（情報 / repo / 升級研究）
  - 內容或報表角色（避免混入研究記憶）
- 若單一工具做不到角色隔離，PoC 先退回「分資料夾 + 分索引 + 分人工檢索」模式，不勉強自動化

### Phase 2：可回放與成本驗證

- 若候選工具支援 replay / viewer / import-export，先驗證：
  - 是否能回看單次記憶寫入
  - 是否能刪除錯誤片段
  - 是否能看出注入成本或至少觀察上下文膨脹
- viewer 一律先限本機，不開公開埠、不對外分享

### Phase 3：低風險 hooks 驗證

- 只允許在兩個節點試做：
  - 每日情報寫完後，產出 1 份「記憶片段草稿」
  - 交接 / Discord 草稿完成後，產出 1 份「可複用規則草稿」
- 不允許在任務進行中自動改寫記憶
- 任一 hooks 若無法清楚標示來源檔案與日期，就視為不通過

## 候選工具評估準則

> 這裡只定義怎麼評估，不代表已批准安裝或導入。

### A) 治理與稽核

- 記憶片段是否能回到原始證據（source / file / date）
- 摘要是否可覆核，且不得覆蓋 raw evidence
- 錯誤記憶是否能刪除、回退、標記失效

### B) 權限與資料落地

- 是否能完全本機運行
- 是否需要外部 API、資料庫、viewer 或 server
- 是否能限制只讀取指定資料夾，且不碰客戶敏感資料

### C) 注入與檢索

- 是否支援手動檢索優先，避免一開始就自動注入
- 若支援自動注入，是否能列出「本次注入了哪些記憶」
- 是否能區分 persona / scenario / atom / conversation 或等價分層，避免把暫時任務寫成永久規則

### D) 候選比較（初步）

| 候選 | 可吸收重點 | 目前處置 |
| --- | --- | --- |
| `jayzeng/agentmemory` | local-first Markdown、語意檢索、選擇性注入 | 作為本 PoC 的本地優先基準 |
| `TencentDB-Agent-Memory` | 白盒可追溯、分層記憶、hybrid retrieval | 先學資料結構與 evidence chain，不導入 |
| `rohitg00/agentmemory` | MCP / hooks / skills、AGENT_ID 隔離、replay/viewer、成本感知 | 先學跨 Codex / Claude Code / Gemini 的治理方式，不導入 |

## 驗收標準（PoC）

以下至少 2 項成立，才值得進下一階段：

- 重複問答下降：同一類每日情報，重複搜尋/重複判斷次數下降
- 交付更穩：摘要更聚焦、Discord 通知更一致（即使發送失敗也能保留草稿）
- token 觀感下降：同等品質下，來回補問次數下降（不用硬算 token）
- 角色不污染：研究記憶不會跑進內容 / 報表任務的交接輸出
- 能回放：至少能從 1 段記憶回查到對應的原始日報或 SOP

## 風險與防線（必讀）

- 「記憶」只能存可公開/可重複的規則與結論；不存客戶敏感資訊
- 若記憶要被自動注入：必須先做「來源分級」與「不可執行指令」隔離（見：AWI 防線）
- 若有 viewer / server：一律先視為高風險觀察介面，只能本機測試，不做公開分享
