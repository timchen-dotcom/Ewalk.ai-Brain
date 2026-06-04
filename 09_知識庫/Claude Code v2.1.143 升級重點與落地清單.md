# Claude Code v2.1.143 升級重點與落地清單

用途：把 Claude Code 的版本更新「轉成可執行的習慣與檢查」，降低長任務卡死、plugin 管理混亂與上下文成本失控的風險。

來源（官方 changelog）：https://code.claude.com/docs/en/changelog

> 參考日期：2026-05-17（對應 changelog：May 15, 2026 / 2.1.143）

---

## 可吸收重點（轉成我們的用法）

### 1) plugin disable/enable 會處理依賴鏈（避免誤關）

可落地的好處：

- 減少「關掉一個 plugin → 連帶把其他能力弄壞」的風險。
- 適合用在「多插件並存、需要可回退」的工作流治理（特別是 skills-only / workflow plugin 這類）。

落地規範（建議）：

- 把「plugin 變更」納入每次長任務的起手式檢查：
  - 變更前先記錄 `/plugin list`
  - 變更後再記錄一次（留下可追溯差異）

### 2) `/plugin` marketplace 顯示 projected context cost（成本可視化）

可落地的好處：

- 在安裝前就能估算「這個 plugin 會吃多少 context」，降低「裝了才發現沒生效/被靜默忽略」。
- 對 Ewalk.ai 來說，這是建立「省 token、可治理」工具鏈的關鍵訊號。

落地規範（建議）：

- 只要 projected context cost 顯示偏高，就先做二選一：
  - 只裝 skills-only（規則守門員）
  - 或縮小試點範圍（只針對 1–2 類任務）

### 3) 背景任務隔離策略可調（`worktree.bgIsolation: "none"`）

可落地的好處：

- 有些 repo 不適合 worktree（例如：大量生成檔、或工作目錄狀態很複雜）；此設定讓背景 session 不必強制進 worktree。

落地規範（建議）：

- 先只在「測試環境/試點任務」使用並記錄結果；不要直接套到主力交付 repo。

### 4) reactive compaction 改善（降低反覆 summarize 的浪費）

可落地的好處：

- 對長任務而言，最貴的不是一次 output，而是「快爆 context → summarize 失敗 → 再試一次」的重跑浪費。
- 這類改動若有效，能直接降低成本與卡關率。

落地規範（建議）：

- 把「10 分鐘低風險長任務」納入每次升級的最小回歸（見 SOP）。

### 5) `/bg`、worktree cleanup、hook loop cap 屬於長任務穩定性檢核

可落地的好處：

- `/bg` 與 background session 的修正，影響長任務是否能穩定接續、維持指定模型/effort。
- worktree cleanup 保護可降低背景任務誤刪工作目錄的風險。
- hook loop cap 可避免 hooks 設計不當時造成反覆觸發與 token 浪費。

落地規範（建議）：

- 有用 `/bg` 或 hooks 的 repo，升級後必跑對應檢核；沒有使用則記錄「不適用」，不要為了測試引入新複雜度。

---

## 建議升級與驗收方式（不改規則版）

- 依 SOP 跑最小回歸：[[../13_SOP流程/Claude Code CLI 升級與最小回歸驗證SOP|Claude Code CLI 升級與最小回歸驗證 SOP]]

---

## 待提姆確認

- projected context cost 是否要納入「每次導入新 plugin 的必要檢核」？
- plugin 治理是否要導入「每週凍結插件清單」的輕量做法（只記錄，不強制全員一致）？
- 若未來要跑 Claude Code 長任務排程，是否允許先用 1 個內部 repo 測 `/bg` 與 hooks 回歸？
