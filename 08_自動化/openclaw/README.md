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

## 邊界

- B28 通過後，只允許 read-only 讀取指定 Brain 資料夾。
- B27 通過後，只允許寫入指定草稿區。
- 不複製接案碟。
- 不複製 `.env`、token、secret、API key。
- 不啟用正式寫入、發文、部署、正式客戶通道、廣告預算、金流或帳務付款設定。

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
