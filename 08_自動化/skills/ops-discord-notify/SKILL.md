---
name: ops-discord-notify
description: 用本地 webhook 設定發送 Discord 通知（Vault skills 版，不需安裝到 ~/.codex/skills）。
---

# ops-discord-notify

## 目的

用 `config.local.json` 裡的 webhook 設定，把訊息發到指定 Discord channel key（例如 `self_upgrade`、`system`），並保留「失敗可診斷」的錯誤輸出。

## 使用時機

- 需要把「草稿通知」送到 Discord
- 不想把 webhook 值寫進任何文件或 repo

## 來源（canonical）

- 腳本：`Ewalk.ai Brain/08_自動化/本地AI-Gemma/scripts/discord_notify.py`
- 設定（含敏感資訊，禁止貼出值）：`Ewalk.ai Brain/08_自動化/本地AI-Gemma/config.local.json`

## 輸入

- `channel`：webhook key（例：`self_upgrade`、`system`）
- `message`：要發送的文字（建議先用短訊息測試）

## 輸出

- 成功：Discord 出現訊息
- 失敗：終端輸出錯誤（常見：DNS/網路、webhook 不存在、timeout）

## 操作步驟

1. 先確認 `config.local.json` 有對應 channel key。
2. 執行：
   - `python3 "Ewalk.ai Brain/08_自動化/本地AI-Gemma/scripts/discord_notify.py" --channel <channel> --message "<message>"`
3. 若發送失敗：
   - 不要重試太多次（避免刷 webhook）
   - 回到任務輸出文件，保留「Discord 通知草稿」區塊，並記錄錯誤原因（例如 DNS）

## 驗收 / 回歸

- 用 `system` channel 發 1 則短訊息（例如「ping」）成功
- 若失敗，至少能定位到：DNS/網路 or 設定缺少 key or webhook 失效

## 風險邊界

- 禁止在任何筆記中貼出 webhook/token 值
- 禁止把客戶敏感資訊直接發到公開頻道

