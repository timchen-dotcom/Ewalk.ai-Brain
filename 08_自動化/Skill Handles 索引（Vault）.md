# Skill Handles 索引（Vault）

> 目的：先在 Vault 內建立「可提及入口（handle）」的索引，讓阿順/提姆在對話中用短名稱就能指向 canonical 流程文件；不建立 `~/.codex/skills` runtime handle，避免環境與權限風險。

## 命名規則（暫定）

- 格式：`$<領域>-<動詞>-<物件>-<場景>`（全小寫、`-` 分隔）
- 例：`$ops-discord-notify`、`$ops-github-self-upgrade-daily`

## 使用規則

- 這份索引只負責「入口 → 指向」，不複製 SOP 內容（避免漂移）。
- 一個 handle 對應一條 canonical 流程（或一個主入口 + 子入口）。
- 每個 handle 必須寫：使用時機、輸入、輸出、驗收/回歸。
- 任何涉及 webhook/token/API key 的內容：只允許寫「設定檔路徑與注意事項」，不得把值寫進文件。

---

## Handle 清單（第一批 5 條）

### 1) `$ops-github-self-upgrade-daily`

- 狀態：`stable`
- 用途：每日 GitHub 自我升級情報蒐集 → 產檔 → Discord 通知（或草稿）
- Vault skill（路徑呼叫）：
  - `Ewalk.ai Brain/08_自動化/skills/ops-github-self-upgrade-daily/SKILL.md`
- Canonical：
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/GitHub自我升級情報自動化.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/GitHub自我升級情報自動化.md)
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/09_知識庫/自我升級情報/README.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/09_知識庫/自我升級情報/README.md)
- 輸入：公開 GitHub / 開源內容（近 24h–7d）
- 輸出：
  - 每日檔案：`Ewalk.ai Brain/09_知識庫/自我升級情報/YYYY-MM-DD_GitHub自我升級情報.md`
  - Discord 通知（失敗則保留草稿區塊）
- 驗收/回歸：
  - 必須產出當日檔案
  - 必須有「Discord 通知草稿」或「發送成功」其一

### 2) `$ops-discord-notify`

- 狀態：`stable`
- 用途：用 webhook 發送 Discord 通知（支援多 channel key）
- Vault skill（路徑呼叫）：
  - `Ewalk.ai Brain/08_自動化/skills/ops-discord-notify/SKILL.md`
- Canonical：
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/本地AI-Gemma/scripts/discord_notify.py`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/本地AI-Gemma/scripts/discord_notify.py)
  - 設定檔（含敏感資訊，勿貼出值）：
    - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/本地AI-Gemma/config.local.json`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/本地AI-Gemma/config.local.json)
- 輸入：`--channel <key>`、`--message <text>`
- 輸出：Discord 訊息（或失敗錯誤日誌）
- 驗收/回歸：
  - 用 `system` channel 測試 1 則短訊息成功（或明確記錄失敗原因：DNS/網路）

### 3) `$ops-voice-note-triage`

- 狀態：`stable`
- 用途：語音逐字稿/會議紀錄 → 摘要 → 待辦 → 歸檔
- Canonical：
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/語音筆記整理SOP.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/語音筆記整理SOP.md)
- 輸入：逐字稿（文字/檔案/段落）
- 輸出：可直接貼進 Obsidian 的整理稿 + 下一步待辦
- 驗收/回歸：
  - 必須含：重點摘要、待辦清單、歸檔位置建議

### 4) `$ops-monthly-report-produce`

- 狀態：`stable`
- 用途：月報產出（資料整理 → 結論 → 建議 → 交付）
- Canonical：
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/月報產出SOP.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/月報產出SOP.md)
- 輸入：月度數據、投放截圖、重點事件、目標
- 輸出：月報草稿（可交付版）
- 驗收/回歸：
  - 必須含：本月總結、亮點/問題、下月建議、行動清單

### 5) `$ops-images2-browser-generate-and-archive`

- 狀態：`beta`
- 用途：ChatGPT Images 2.0 瀏覽器生成 → 落檔 → 可追溯命名/歸檔
- Canonical：
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/ChatGPT Images 2.0 瀏覽器生成與落檔SOP.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/ChatGPT Images 2.0 瀏覽器生成與落檔SOP.md)
- 輸入：設計需求（尺寸、風格、文案、用途、品牌限制）
- 輸出：圖片檔 + Obsidian 記錄（含 prompt/用途/版本）
- 驗收/回歸：
  - 必須能回溯：這張圖的用途、來源 prompt、放置位置

---

### 6) `$ops-meta-page-auto-publish`

- 狀態：`stable`
- 用途：Meta Facebook Page 自動發文子流程導入、dry-run、正式發布、排程回寫與成效追蹤建檔。若要 IG 同步，改用 `$ops-meta-social-auto-publish`。
- Vault skill（路徑呼叫）：
  - `Ewalk.ai Brain/08_自動化/skills/ops-meta-page-auto-publish/SKILL.md`
- Canonical：
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文串接SOP.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文串接SOP.md)
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文客戶啟用清單.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文客戶啟用清單.md)
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/腳本/meta-facebook/README.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/腳本/meta-facebook/README.md)
- 輸入：客戶名稱、Page ID、排程表、caption 檔、GPT Image 2 最終圖、正式 Meta token 狀態
- 輸出：Meta Post ID、貼文連結、排程回寫、佇列紀錄、成效追蹤總表建檔
- 驗收/回歸：
  - `check-page.mjs` 成功
  - 發布器 dry-run 抓到正確下一篇
  - 正式發布後取得 Meta Post ID
  - 下一次 dry-run 不重複抓已發布貼文

---

### 7) `$ops-meta-social-auto-publish`

- 狀態：`stable`
- 用途：Meta Facebook / Instagram 跨平台自動發文導入、GPT Image 2 最終視覺、1080x1350 共用圖、公開 IG 圖片 URL、FB / IG dry-run、正式發布、排程回寫與成效追蹤建檔
- Vault skill（路徑呼叫）：
  - `Ewalk.ai Brain/08_自動化/skills/ops-meta-social-auto-publish/SKILL.md`
- Canonical：
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文串接SOP.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/13_SOP流程/Meta粉專全自動發文串接SOP.md)
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/營運Flows/Meta粉專全自動發文Flow.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/營運Flows/Meta粉專全自動發文Flow.md)
  - [`/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/腳本/meta-facebook/README.md`](/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/腳本/meta-facebook/README.md)
- 輸入：客戶名稱、Page ID、IG 使用者名稱、IG User ID、排程表、caption 檔、GPT Image 2 最終圖、IGReady JPEG、公開圖片 URL、正式 Meta token 狀態
- 輸出：Facebook Meta Post ID、Instagram IG Media ID、貼文連結、排程回寫、佇列紀錄、成效追蹤總表分平台建檔
- 驗收/回歸：
  - `check-page.mjs` 成功
  - `check-instagram.mjs` 成功取得 `ig_user_id`
  - FB / IG dry-run 通過
  - 正式發布後取得 Meta Post ID 或 IG Media ID
  - 下一次 dry-run 不重複抓已發布貼文
  - token 未出現在文件、聊天或公開 repo

---

## 下一步（第二批候選）

- `$ops-codex-skill-upgrade-regression`：Codex skill 改動後的最小回歸（讀檔→產檔/通知草稿）
- `$ops-discord-inbox-triage`：Discord 交辦收件匣 → 任務佇列 → 回報
