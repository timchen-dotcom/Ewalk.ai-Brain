# Codex Skills 治理與分發 SOP

## 目的

把「可重複的工作流程」從零散指令，升級成可治理的 skills（可版本控、可回滾、可分發、可限制可見範圍），降低阿順與 AI 員工的操作風險與漂移。

## 使用時機

- 某條流程每週至少出現 2 次，且輸出格式需要穩定
- 想把 SOP 的關鍵步驟「工具化」：讀檔、產檔、查資料、格式化、對外通知（草稿）
- 團隊要把內部 workflow 分享給其他環境/其他機器/其他人使用

## 來源（上游參考）

- openai/skills（Skills Catalog）：https://github.com/openai/skills

## 進階：Handle / 投影式治理（Agent-Skills Kit 思路）

> 目標：讓「可提及的 skill 名稱」變成小型入口（handle），避免把整套 workflow 全塞進上下文；同時把來源、生成物、runtime 投影分離，做到可驗證、可回滾。

上游參考：

- jscraik/Agent-Skills：https://github.com/jscraik/Agent-Skills

核心概念（用白話講）：

- **Canonical Source（真實來源）**：真正要維護的 `SKILL.md`（流程本體）只放在一個地方，避免到處複製後漂移。
- **Command Handle（可提及入口）**：在 runtime 只暴露「很短的指標檔」，讓 agent 能用 `$xxx` 提及，但不代表把整個流程載入。
- **Runtime Projection（投影）**：把「可用表面（surface）」做成可重建的投影資料夾；投影壞了就重建，不直接手改。
- **Surface Validation（表面驗證）**：用清單/檢查命令驗證目前暴露了哪些 handle、數量是否符合預期、是否有違規（例如重複暴露或命名衝突）。

Ewalk.ai 的落地方式（不依賴外部工具也能先做）：

1. **把 workflow 本體固定放在 Vault**
   - `Ewalk.ai Brain/13_SOP流程`：SOP/治理規則
   - `Ewalk.ai Brain/模板` 或對應資料夾：模板、fixture、回歸資料
2. **建立「Skill Handle 索引」作為入口**
   - Vault 內先用「索引筆記」列出：handle 名稱 → canonical 檔案路徑 → 使用時機 → 驗收
   - 等環境允許時再把 handle 同步到 `~/.codex/skills`（或 `$CODEX_HOME/skills`）作為 runtime surface
3. **把驗收/回歸固定化**
   - 每個 skill（或 handle）至少 1 個回歸案例：讀檔 → 產檔（或產草稿）成功
   - 建議把回歸資料放在 `Ewalk.ai Brain/tmp` 或 skill 的 `resources/fixtures`

## Skills 的最小定義（Ewalk.ai）

一個 skill 至少要包含：

- `SKILL.md`：用途、使用時機、輸入/輸出、驗收標準、風險邊界
- `scripts/`（可選）：把關鍵步驟腳本化（避免每次手打）
- `resources/`（可選）：模板、範例輸入、測試資料

## 命名與分類規則

- 命名：用「動詞 + 物件 + 場景」  
  - 例：`github-self-upgrade-daily`、`discord-notify`、`deck-remake`  
- 分類（建議三層）：
  - `stable/`：已驗收且可長期用（預設只允許這類在正式交付流程中被採用）
  - `beta/`：試點中（允許小範圍使用，需回歸清單）
  - `scratch/`：臨時實驗（不進入正式流程）

## 治理原則（避免 skill 失控）

- **可見範圍**：預設只允許內部使用；要分享/公開必須先做脫敏（移除 webhook、token、客戶資料）
- **變更最小化**：先新增新版本資料夾，不直接覆蓋舊版本（方便回滾）
- **回歸必跑**：每次改 skill，至少跑 1 個固定回歸案例（例如產出一個測試檔案）
- **輸出固定**：明確規定輸出檔名、標題、區塊（避免每次格式飄）
- **描述要短**：`description` 是路由提示，不是完整教學。完整流程放正文、SOP 或 references，避免每次都把長說明載進 context。

## 2026-06-04 補充：Skill Cleaner 掃描治理

上游參考：

- `steipete/agent-scripts`：https://github.com/steipete/agent-scripts
- `skill-cleaner`：https://github.com/steipete/agent-scripts/tree/main/skills/skill-cleaner

Skill Cleaner 的重點是先找出 prompt budget 壓力，不是自動刪技能。Ewalk.ai 採用方式如下：

1. 每月或新增大量 skills 後，使用 [[../08_自動化/skills/ops-skill-cleaner-audit/SKILL|ops-skill-cleaner-audit]] 跑一次掃描。
2. 先看 `Skill Budget`，再看 `Description Candidates`，最後才看重複與未使用候選。
3. 個人 skills 可優先壓縮 description；system skills 與 plugin cache skills 只記錄，不直接改。
4. 未使用候選只當線索，必須人工確認，不能只因 logs 沒命中就刪除。
5. 真要刪除、停用或搬移 runtime skills，需建立清理紀錄並由提姆先生批准。

2026-06-04 基準掃描：

- 發現 skills：184
- description chars：47,187
- unbudgeted full tokens：18,934
- 2% budget tokens：5,440
- budgeted tokens used：5,433
- omitted skills after budget：49

判斷：目前最值得先處理的是個人 skills 的 description 壓縮與重複檢查，不做自動刪除。

## 分發方式（兩條路）

### A) 內部 Vault 分發（最穩）

把 skill 的「設計文件與模板」放在 Vault：

- SOP：`Ewalk.ai Brain/13_SOP流程`
- 模板/資源：`Ewalk.ai Brain/模板` 或對應資料夾

優點：不碰環境設定、不受沙盒/權限影響；缺點：仍需人工照 SOP 操作。

### B) Codex Skills Catalog 分發（可規模化）

把 skill 做成可安裝的 bundle（對照 openai/skills 的結構），再用安裝器或固定來源拉取。

注意：

- 若要動到 `$CODEX_HOME/skills` 或 `~/.codex/skills`，需確認目前執行環境是否允許寫入（沙盒/權限可能限制）
- 任何包含外部連線（Discord webhook / API key）的設定，必須分離到 `config.local.json` 類似的本地設定檔，不可進 repo

## 驗收標準

- 新 skill 能在 10 分鐘內由「沒看過的人」照文件跑成功
- 至少 1 個回歸案例通過（讀檔→產檔 / 產通知草稿）
- 有明確回滾方式（保留上一版或可快速停用）
