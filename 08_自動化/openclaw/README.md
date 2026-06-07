# OpenClaw 工具

用途：存放 OpenClaw 低風險 PoC 與逐步放權用的本機輔助工具。

## 目前工具

- `scripts/build-b2-readonly-context.mjs`：建立 OpenClaw B2A 精選只讀鏡像，只複製治理、SOP 與 OpenClaw 規則文件到 test workspace。
- `config/openclaw-controlled-work.allowlist.json`：B27/B28 受控上工 allowlist，定義可讀資料夾、可寫草稿區與禁止外部副作用。
- `scripts/prepare-controlled-draft-write.mjs`：B27 限定草稿區寫入測試，確認 OpenClaw 可把成果落到指定 draft 區。
- `scripts/review-brain-scoped-readonly.mjs`：B28 指定資料 read-only 探針，只讀 allowlist 內資料夾並產生本機 review。
- `B26-B28OpenClaw受控上工啟動.command`：一次跑完 B26、B27、B28 三個受控上工必做關卡。
- `B27OpenClaw限定草稿寫入.command`：單獨執行 B27。
- `B28OpenClaw指定資料只讀.command`：單獨執行 B28。
- `config/openclaw-external-ops.policy.json`：B29 高權限總閘門政策，將發文、部署、production Firebase、正式通道、廣告與金流改為 approval gate。
- `scripts/prepare-external-ops-gate.mjs`：B29 高權限總閘門檢查，產生本機 review、queue 與 playbook。
- `B29OpenClaw高權限總閘門.command`：單獨執行 B29。
- `B26-B29OpenClaw受控上工與高權限總啟動.command`：一次跑完 B26-B29，通過後停止擴驗證並開始受控上工。
- `scripts/install-authoritative-rules.mjs`：B30 將 B26-B29 受控上工規則寫入 OpenClaw Test Workspace 的 `AGENTS.md`。
- `B30OpenClaw載入B26-B29權限規則.command`：單獨執行 B30，讓 Telegram 新 session 讀到新版 authoritative rules。

## 邊界

- B28 通過後，只允許 read-only 讀取指定 Brain 資料夾。
- B27 通過後，只允許寫入指定草稿區。
- 不複製接案碟。
- 不複製 `.env`、token、secret、API key。
- 不啟用正式寫入、發文、部署、正式客戶通道、廣告預算、金流或帳務付款設定。
- B29 通過後，上述高權限能力改為 `enabled_with_explicit_approval`：可準備、preview、送審，取得提姆先生針對單一 action 批准後才執行。

## 受控上工讀寫範圍

允許讀取：

- `01_客戶`
- `02_內容`
- `03_廣告`
- `13_SOP流程`
- `14_每日工作`

允許寫入草稿：

- `00_收件匣/OpenClaw草稿`
- `14_每日工作/OpenClaw草稿回填`
- `08_自動化/openclaw/action-queue`

## 高權限總閘門

B29 開啟後，高權限能力不再永久封鎖，而是進入 approval gate：

- 發文 / 排程發文
- 部署
- production Firebase 改狀態
- 正式客戶通道
- 廣告預算
- 金流 / 帳務 / 付款設定

沒有 approval 時只能 preview。要執行必須有 `approval_id`、`approval_text`、`approved_by`、風險摘要、preview/diff 與 rollback/recovery plan。

## Telegram session 同步

GitHub / Brain 更新不會自動灌進既有 Telegram session。若 OpenClaw 仍回覆 B10A/B10B：

1. 在 Mac Studio 執行 `B30OpenClaw載入B26-B29權限規則.command`。
2. 在 Telegram 傳 `/new`。
3. 要求 OpenClaw 重新讀取 `AGENTS.md`。
