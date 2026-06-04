# Claude Code Workflows（skills-only）試點 SOP

## 目的

用最低干擾方式，把 Claude Code 的「最佳實務 ruleset」疊加到既有工作流，提升交付一致性（測試、文件、設計對齊），並降低上下文膨脹風險。

## 使用時機

- 工程/腳本任務需要更穩定的：設計對齊、測試、驗證與收尾品質
- 不想一次導入整套多 agent orchestration，只想先要「規則守門員」

## 來源

- shinpr/claude-code-workflows：https://github.com/shinpr/claude-code-workflows

## 安裝與啟用（skills-only）

1. 開啟 Claude Code：
   - `claude`
2. 新增 marketplace：
   - `/plugin marketplace add shinpr/claude-code-workflows`
3. 安裝 skills-only plugin：
   - `/plugin install dev-skills@claude-code-workflows`
4. 重新載入 plugins：
   - `/reload-plugins`

## 重要限制（避免 skills 被默默忽略）

- **不要同時安裝**：`dev-skills` 與 `dev-workflows` / `dev-workflows-frontend` / `dev-workflows-fullstack`
  - 原因：skills 描述重複會吃 context budget，超過上限時會被「靜默忽略」（看起來像沒生效）

## 試點範圍（建議）

- 只針對 1–2 類任務：
  - 自動化腳本修修補補（Python/Node）
  - 小工具 CLI（單一 repo / 小範圍改動）
- 不要先用在「客戶交付/對外」任務（先內部驗證）

## 驗收標準（最小）

- 連續 3 次任務：
  - 測試或自檢步驟更完整（至少包含可重跑的檢查方式）
  - 需求/設計/實作的對齊描述更清楚（能被第三人看懂）
  - 交付內容更穩（減少反覆修正輪數）

## 回退方式

- 移除 skills-only：
  - `/plugin uninstall dev-skills@claude-code-workflows`
- 若要改用全流程 orchestration（另開試點）：
  - `/plugin install dev-workflows@claude-code-workflows`（或依任務選 frontend/fullstack）

