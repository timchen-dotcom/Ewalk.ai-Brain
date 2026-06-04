---
name: ops-github-self-upgrade-daily
description: 產出每日 GitHub 自我升級情報（只做蒐集/摘要/建議），並嘗試送 Discord（失敗則保留草稿）。
---

# ops-github-self-upgrade-daily

## 目的

把「每日 GitHub 自我升級情報」流程做成可重跑的 Vault skill：蒐集 → 篩選 → 產檔 → Discord 通知（或草稿）。

## 使用時機

- 每天固定跑一次（或補跑某一天）
- 需要把結果寫進 Obsidian，並提醒提姆審核「可升級項」

## Canonical（以 Vault 文件為準）

- 流程規則：`Ewalk.ai Brain/08_自動化/GitHub自我升級情報自動化.md`
- 情報庫規則：`Ewalk.ai Brain/09_知識庫/自我升級情報/README.md`
- 優先追蹤清單：`Ewalk.ai Brain/09_知識庫/自我升級情報/優先AI工具追蹤清單.md`
- Discord 通知工具（若可用）：`Ewalk.ai Brain/08_自動化/skills/ops-discord-notify/SKILL.md`

## 輸入

- 時間範圍：近 24 小時到 7 天內（以「高品質 GitHub 公開內容」為主）
- 優先工具關鍵字：Codex / Claude Code / Gemini / ChatGPT / Images 2.0 / 即夢 / Nano Banana
- 通用自我升級主題：prompt compression、context engineering、token optimization、memory、RAG、multi-agent workflow…

## 輸出

- 當日檔案：`Ewalk.ai Brain/09_知識庫/自我升級情報/YYYY-MM-DD_GitHub自我升級情報.md`
- Discord：能發就發；不能發就把「Discord 通知草稿」留在當日檔案

## 品質標準（每則情報必備）

- 來源標題、來源連結、工具標籤
- 若是 repo：熱度/討論理由
- 重點摘要、對 Ewalk.ai 的白話幫助、建議狀態（可升級/先觀察/暫不吸收）

## 風險邊界

- 只做情報蒐集與整理：**不直接修改** AGENTS/SOP/Prompt/Skill/全域規則（除非提姆明確指示進入 `/自我升級` 落地）
- 任何 token/webhook 不得寫入 repo 或筆記內容

