# CAO 多 Agent 編排試點計畫（awslabs/cli-agent-orchestrator）

狀態：提案草稿（未執行）

目的：把「每日 GitHub 自我升級情報」這種**可回退、低風險**流程，改成可控的多 agent 拆工（收集/摘要/驗證/產檔），降低單一對話 context 汙染與 token 浪費。

> 注意：此文件只定義試點範圍與驗收；不直接更改任何自動化行為。實際導入/安裝需提姆先生允許後再做。

---

## 來源

- Repo：awslabs/cli-agent-orchestrator（CAO）
  - https://github.com/awslabs/cli-agent-orchestrator

---

## 試點範圍（Scope）

只做：

- 「每日情報蒐集 → 產檔 → Discord 通知（或草稿）」這條流程的**拆工與排程**
- 分工目標：把工作拆成 3–4 個 worker（各自乾淨 context）再由 supervisor 統整

不做（明確禁止）：

- 不碰對外發布（社群發文/客戶訊息）
- 不碰金流/訂閱取消
- 不碰廣告預算/投放操作
- 不修改任何全域規則（AGENTS/SOP/權限隔離），只允許產生「草稿」與「建議」

---

## 建議角色拆分（最小可用）

- Supervisor（阿順/總控）
  - 收斂今日要找的 3 類內容（優先工具 / 高度討論 repo / 通用自我升級）
  - 整合 3 位 worker 回報，產出每日檔案與 Discord 草稿

- Worker A：優先工具研究員（Codex / Claude / Gemini）
  - 搜尋「最近 7 天」與工作流/省 token/長任務治理相關更新
  - 產出 2–3 則候選（含來源與白話價值）

- Worker B：高度討論 Repo 掃描員
  - 找 1–2 個「近期成長/討論活躍」repo
  - 補上熱度與討論理由（stars/forks、issues/discussions、release）

- Worker C：方法論與研究掃描員
  - 找 1–2 則 context engineering / compression / memory / RAG optimization 的高品質內容
  - 只留能落地的規則/模板/檢核點

---

## 驗收標準（最小）

- 連續 3 次 run：
  - 能產出每日檔案（格式/路徑不變）
  - 「可升級/先觀察」判斷品質不退化（主觀檢核：提姆先生可快速決策）
  - 失敗可定位原因（哪個 worker/哪一步）

---

## 風險與控制

- 風險：多 agent 可能造成重複搜尋/重複摘要 → 反而更貴
  - 控制：Supervisor 先定義「每個 worker 只允許輸出 2–3 則候選」

- 風險：資料分散導致統整成本增加
  - 控制：統一回報格式（每則情報固定欄位：標題/連結/摘要/白話幫助/建議狀態）

- 風險：工具鏈安裝/環境差異導致流程中斷
  - 控制：只在可回退流程試點；保留現行一次性流程作為 fallback

---

## 待提姆先生確認（必填）

- 是否允許啟動 CAO 試點（僅限「每日自我升級情報」）？
- 試點期：要跑 3 次還是 7 天？
- 失敗時：是否直接回退到現行一次性流程（不做修復）？

