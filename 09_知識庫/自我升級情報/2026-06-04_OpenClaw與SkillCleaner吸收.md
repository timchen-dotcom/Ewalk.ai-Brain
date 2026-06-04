# 2026-06-04 自我升級｜OpenClaw 與 Skill Cleaner 吸收

本次範圍：依提姆先生提供的 TechBang 文章，補充 `skill-cleaner` 技能治理方法，並將 OpenClaw 納入每日自我升級情報的固定重點追蹤名單。

原始交辦來源：

- TechBang：https://www.techbang.com/posts/129757-openclaw-skill-cleaner-ai-trim

交叉驗證來源：

- gihyo.jp：OpenClaw 作者公開 Skill Cleaner：https://gihyo.jp/article/2026/05/skill-cleaner
- Skill Cleaner GitHub：https://github.com/steipete/agent-scripts/tree/main/skills/skill-cleaner
- Skill Cleaner SKILL.md：https://github.com/steipete/agent-scripts/blob/main/skills/skill-cleaner/SKILL.md
- OpenClaw 官網：https://openclaw.ai/
- OpenClaw GitHub：https://github.com/openclaw/openclaw

---

## 可吸收重點

### A) Skill Cleaner：skill 描述會吃掉每次 context

- Skill Cleaner 的核心觀念是：skill `description` 不是完整說明書，而是讓 agent 正確路由的短提示。
- 描述過長、重複 skill、長期未使用 skill，都會讓每次任務更重，甚至讓技能清單被截斷。
- 清理方式應是「先報告、再人工確認」，不是讓工具自動刪。

### B) OpenClaw：納入每日追蹤重點

- OpenClaw 是個人 AI Agent / Gateway runtime 類工具，重點在通訊入口、常駐 Agent、Skills / Plugins、記憶、瀏覽器與檔案 / shell 操作。
- 對 Ewalk.ai 的價值不是立刻導入，而是持續觀察它如何做：
  - 常駐 AI 員工
  - Discord / WhatsApp / Slack 等入口
  - Skills / Plugins 生態
  - Skill 安全與 marketplace 治理
  - auto mode / approval guardrails

### C) Ewalk.ai 目前 skill budget 有壓力

本次用上游 `skill-cleaner` analyzer 做唯讀掃描：

```text
node --experimental-strip-types /tmp/skill-cleaner/scripts/skill-cleaner.ts --no-logs --context-tokens 272000 --budget-percent 2
```

掃描結果：

- skills：184
- description chars：47,187
- rendered line chars：74,806
- unbudgeted full tokens：18,934
- 2% budget tokens：5,440
- budgeted tokens used：5,433
- omitted skills after budget：49

判斷：目前 Ewalk.ai / Codex 環境的 skills 已經足以造成 prompt budget 壓力。後續應先壓縮個人 skills 的 description，暫不碰 system / plugin cache。

---

## 系統優化判斷

- 高價值：
  - OpenClaw 已納入每日追蹤清單與 repo 候選資料庫。
  - 已建立 Vault 版 `ops-skill-cleaner-audit`，方便下次重跑掃描。
  - Codex Skills 治理 SOP 已補上 skill-cleaner 掃描與 description 壓縮原則。
- 暫不吸收：
  - 不直接安裝 OpenClaw。
  - 不直接刪除或停用任何 Codex / OpenClaw skill。
  - 不直接改 `~/.codex/skills` 或 plugin cache。
  - 不把 GitHub / Reddit 的熱度當成導入理由，必須等 Ewalk.ai 有明確常駐 Agent 或跨通訊入口需求。

---

## 已更新

- 已更新：[[優先AI工具追蹤清單]]
- 已更新：[[README|自我升級情報 README]]
- 已更新：[[Repo候選資料庫/AI開源Repo候選資料庫|AI 開源 Repo 候選資料庫]]
- 已更新：[[../../08_自動化/GitHub自我升級情報自動化|GitHub 自我升級情報自動化]]
- 已更新：[[../../13_SOP流程/Codex Skills 治理與分發SOP|Codex Skills 治理與分發 SOP]]
- 已新增：[[../../08_自動化/skills/ops-skill-cleaner-audit/SKILL|ops-skill-cleaner-audit]]
- 已更新：[[../../08_自動化/skills/README|Vault Skills README]]

---

## 待確認

- 是否允許下一步針對 Ewalk.ai 的個人 skills 做第一輪 description 壓縮提案？
- 是否允許把 `ops-skill-cleaner-audit` 設成每月固定自我檢查項？
- OpenClaw 目前先追蹤，不導入；若之後要評估，建議先從「Discord 阿順常駐入口」做低風險 PoC。
