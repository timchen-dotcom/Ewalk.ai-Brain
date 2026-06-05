# 2026-06-05 OpenClaw 低風險 PoC 手順

負責角色：阿順
最終決策者：提姆先生
用途：讓 Mac Studio 重建 OpenClaw test workspace，但不碰正式 Ewalk.ai Brain、正式客戶資料、正式通道或高風險工具。

## 目前定位

OpenClaw 是阿順未來的多通道 agent gateway 候選，不是立刻接管公司的正式自主中樞。

第一階段只允許：

- 安裝或檢查 OpenClaw CLI。
- 建立隔離測試 workspace。
- 在本機 loopback 開 dashboard。
- 用測試訊息確認 gateway 與模型可用。

第一階段禁止：

- 接正式 WhatsApp、LINE、Slack、Gmail、Google Drive 或客戶通道。
- 把 `Ewalk.ai Brain` 當 OpenClaw 預設 workspace。
- 讓 OpenClaw 讀取接案碟或大量客戶素材。
- 開放 LAN / 公網 / Tailscale 外部存取。
- 啟用 shell、檔案、瀏覽器或自動化高風險工具。
- 安裝未驗證的 ClawHub skills 或第三方 plugins。

## 依據

- OpenClaw 官方文件說明：需要 Node 24 或 Node 22.19+，可用 `npm install -g openclaw@latest` 安裝，`openclaw onboard --install-daemon` 進入 onboarding。
- OpenClaw 官方文件說明：Gateway 預設本機 port 為 `18789`，Control UI 可在 `127.0.0.1:18789` 打開。
- OpenClaw 官方文件說明：workspace 預設為 `~/.openclaw/workspace`，onboarding 可設定 workspace location。
- OpenClaw 官方安全文件建議：Gateway 優先使用 loopback bind、token auth、workspaceOnly、禁止或詢問 exec，高風險工具需額外管制。

## Mac Studio 第六批後半完成標準

- [ ] OpenClaw CLI 可執行，版本可讀。
- [ ] `OpenClaw Test Workspace` 已建立，內含測試用 `AGENTS.md`。
- [ ] Onboarding 使用測試 workspace，不使用正式 `Ewalk.ai Brain`。
- [ ] Gateway 僅本機 loopback，dashboard 可開。
- [ ] 測試訊息可回應。
- [ ] 沒有接正式通道、正式資料或高風險工具。

## 完成回報格式

```text
Mac Studio 第六批後半完成，OpenClaw test workspace 可用
```

