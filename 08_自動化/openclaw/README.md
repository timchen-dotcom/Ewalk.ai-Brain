# OpenClaw 工具

用途：存放 OpenClaw 低風險 PoC 與逐步放權用的本機輔助工具。

## 目前工具

- `scripts/build-b2-readonly-context.mjs`：建立 OpenClaw B2A 精選只讀鏡像，只複製治理、SOP 與 OpenClaw 規則文件到 test workspace。

## 邊界

- 不複製客戶資料。
- 不複製接案碟。
- 不複製 `.env`、token、secret、API key。
- 不啟用正式寫入。

