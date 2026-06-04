# 2026-05-10 Codex app-server 常駐試點追蹤（7 天）

> 試點目標：把「每日 GitHub 自我升級情報」流程改為可控/可重啟的常駐服務形態，觀察 7 天穩定性與維運成本。
>
> 注意：目前本機 Codex CLI 版本為 `0.129.0-alpha.15`，尚未看到 `remote-control` 子命令；先用 `codex app-server` 進行等價試點（命名與細節之後可再對齊 `0.130.x`）。

## 試點範圍

- 僅針對：`Ewalk.ai Brain/09_知識庫/自我升級情報/YYYY-MM-DD_GitHub自我升級情報.md` 產檔 + Discord 通知草稿（若網路限制無法送 Discord，仍以產出草稿為成功）

## 成功/失敗定義

- 成功：能產生當日檔案（含「Discord 通知草稿」）
- 失敗：無法產檔、寫檔路徑錯、或卡住無法完成

## 7 天追蹤表

| 日期 | 是否產檔成功 | Discord 是否送出 | 失敗原因（若有） | 修正/備註 |
| --- | --- | --- | --- | --- |
| 2026-05-10 | 否 | 否 | `codex app-server --listen ws://127.0.0.1:8787` 回 `Operation not permitted (os error 1)` | 先改為「安裝可更新的 Codex CLI」後再試；見 [[../13_SOP流程/Codex Remote-control 常駐自動化試點SOP\|試點 SOP]] |
| 2026-05-11 |  |  |  |  |
| 2026-05-12 |  |  |  |  |
| 2026-05-13 |  |  |  |  |
| 2026-05-14 |  |  |  |  |
| 2026-05-15 |  |  |  |  |
| 2026-05-16 |  |  |  |  |

## 試點操作指令（本機）

- 啟動常駐服務：`Ewalk.ai Brain/08_自動化/本地AI-Gemma/scripts/start_codex_app_server.sh`
- 檢查狀態：`Ewalk.ai Brain/08_自動化/本地AI-Gemma/scripts/codex_app_server_status.sh`
- 停止常駐服務：`Ewalk.ai Brain/08_自動化/本地AI-Gemma/scripts/stop_codex_app_server.sh`
