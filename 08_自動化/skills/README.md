# Vault Skills（不安裝版）

> 目的：把常用流程做成 `SKILL.md`，但不安裝到 `~/.codex/skills`；需要時直接用「檔案路徑」呼叫（避免權限問題）。

## 使用方式

- 在 Codex 對話中直接貼這種連結呼叫：
  - `[$skill-name](<SKILL.md 的檔案路徑>)`
  - 例：`[$ops-meta-page-auto-publish](Ewalk.ai Brain/08_自動化/skills/ops-meta-page-auto-publish/SKILL.md)`

## 目前可用 Skills

| Skill | 用途 | 主要使用員工 |
| --- | --- | --- |
| `ops-meta-social-auto-publish` | Facebook / Instagram 跨平台社群自動發文，含 GPT Image 2 視覺、Meta API 發布、回寫與成效追蹤 | 社群自動化發文員、社群主編、設計企劃、成效追蹤員 |
| `ops-meta-page-auto-publish` | Facebook Page 自動發文子流程；若客戶需要 IG 同步，改用 `ops-meta-social-auto-publish` | 社群自動化發文員 |
| `ops-meta-ads-auto-launch` | Meta 廣告自動建稿 / 投放準備 | 廣告投放專員 |
| `ops-discord-notify` | Discord 通知與交辦 | 專案助理、阿順 |
| `ops-github-self-upgrade-daily` | GitHub / 自我升級情報例行追蹤 | GitHub 研究員、阿順 |
| `ops-skill-cleaner-audit` | Codex / OpenClaw skills prompt budget、重複與過長描述掃描 | 阿順、GitHub 研究員 |

## 治理原則

- Canonical 永遠在 Vault：`Ewalk.ai Brain/08_自動化/skills/**`
- 若未來要做成可提及 `$handle` 的 runtime skills：
  - 只做「投影/同步」，不要複製改兩份
  - runtime 壞了就重建，canonical 不動
