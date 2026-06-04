---
name: ops-skill-cleaner-audit
description: Audit Codex/OpenClaw skill prompt budget, duplicate skills, long descriptions, and unused skill candidates before manual cleanup.
---

# ops-skill-cleaner-audit

## 目的

用 `skill-cleaner` 思路檢查 Codex / OpenClaw skills 是否造成不必要的 prompt budget 浪費。此 skill 只做掃描與報告，不直接刪除或改寫任何 runtime skill。

上游來源：

- `steipete/agent-scripts`：https://github.com/steipete/agent-scripts
- `skill-cleaner`：https://github.com/steipete/agent-scripts/tree/main/skills/skill-cleaner

## 使用時機

- 新增、安裝或啟用多個 skills 後
- Codex / OpenClaw 上下文變重、技能觸發不穩、技能清單明顯膨脹時
- 每月做一次 Ewalk.ai Skills 治理檢查
- 要判斷某些 skills 是否描述過長、重複或長期未使用時

## 操作流程

### 1. 先抓上游 analyzer 到暫存區

```bash
mkdir -p /tmp/skill-cleaner/scripts
curl -L "https://raw.githubusercontent.com/steipete/agent-scripts/main/skills/skill-cleaner/SKILL.md" -o "/tmp/skill-cleaner/SKILL.md"
curl -L "https://raw.githubusercontent.com/steipete/agent-scripts/main/skills/skill-cleaner/scripts/skill-cleaner.ts" -o "/tmp/skill-cleaner/scripts/skill-cleaner.ts"
```

### 2. 先跑不掃 logs 的快速檢查

```bash
node --experimental-strip-types /tmp/skill-cleaner/scripts/skill-cleaner.ts --no-logs --context-tokens 272000 --budget-percent 2
```

### 3. 需要判斷使用率時，再掃最近 3 個月 logs

```bash
node --experimental-strip-types /tmp/skill-cleaner/scripts/skill-cleaner.ts --months 3 --max-log-mb 300
```

若 logs 很大，先不要跑 `--deep-logs`。只有在提姆先生明確要求完整盤點時才使用：

```bash
node --experimental-strip-types /tmp/skill-cleaner/scripts/skill-cleaner.ts --months 6 --max-log-mb 800 --deep-logs
```

## 報告解讀順序

1. `Skill Budget`：看技能清單是否超過 2% context budget。
2. `Description Candidates`：優先處理描述過長的 skills。
3. `Duplicates`：確認是否真的重複，不因同名就刪。
4. `Unused Candidates`：只當線索；沒有 log 命中不代表一定沒用。
5. `Root Summary`：確認 skills 來自個人、system、plugin cache 或 repo。

## Ewalk.ai 清理原則

- 只先出報告，不自動刪 skill。
- system skills 與 plugin cache skills 不直接改。
- 個人 skills 若要壓縮 description，先保留 trigger nouns：工具名、動作、物件、場景。
- 如果要刪除或停用 skill，先建立一份清理紀錄，說明保留哪份、刪哪份、如何回退。
- 涉及 `~/.codex/skills`、`~/.openclaw/skills` 或 plugin cache 的寫入，需提姆先生批准。

## 輸出格式

```md
# Skill Cleaner 掃描紀錄 - YYYY-MM-DD

## 掃描範圍

## 主要結果

## 建議處理

## 不處理原因

## 待提姆確認
```

## 2026-06-04 基準結果

- 掃描模式：`--no-logs --context-tokens 272000 --budget-percent 2`
- 發現 skills：184
- description chars：47,187
- rendered line chars：74,806
- unbudgeted full tokens：18,934
- 2% budget tokens：5,440
- budgeted tokens used：5,433
- omitted skills after budget：49

判斷：Ewalk.ai 目前 skill 描述已經足以造成 skill budget 壓力。下一步應先壓縮個人 skills description，不碰 system / plugin cache。
