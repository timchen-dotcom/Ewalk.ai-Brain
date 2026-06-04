# 2026-05-13 自我升級 - Codex Vim 模式 + Gemini CLI 最小回歸

## 來源

- Codex CLI Releases（Vim modal editing 相關）
  - https://github.com/openai/codex/releases
- Gemini CLI Releases（OAuth headless hang 修復、untrusted folder 的 `mcp list` UX 改善等）
  - https://github.com/google-gemini/gemini-cli/releases
- 今日情報彙整
  - [[2026-05-13_GitHub自我升級情報|2026-05-13 GitHub 自我升級情報]]

## 可吸收重點

- Codex：把「composer 的 Vim modal editing」納入日常使用與回歸檢查，提升長任務（SOP/清單/Obsidian 版型）編輯效率與穩定度。
- Gemini CLI：建立「安裝與最小回歸」SOP，讓它能在需要時（長文件/多模態/Google 生態整合）被安全納入工具鏈；重點避坑是 OAuth/headless 與 MCP 在 untrusted folder 的行為。

## 系統優化判斷

- 高價值：
  - Codex：**把 Vim 模式加入回歸清單**（避免升級後輸入/貼上/格式變形）
  - Gemini CLI：**先文件化再導入**（先讓「怎麼裝、怎麼驗」可複製，之後提姆允許再真正安裝）
- 暫不吸收：
  - 不做任何全域規則或自動化行為調整（不改 AGENTS.md、不改既有自動化流程）

## 已更新

- 更新 SOP：[[../13_SOP流程/Codex CLI 升級與回歸驗證SOP|Codex CLI 升級與回歸驗證 SOP]]（新增 Vim composer 回歸項目）
- 新增 SOP：[[../13_SOP流程/Gemini CLI 安裝與最小回歸驗證SOP|Gemini CLI 安裝與最小回歸驗證 SOP]]

## 待確認

- 提姆是否要把 Gemini CLI 納入「優先工具」的實際安裝清單（目前本機尚未安裝，僅先把 SOP 準備好）？
- Codex 目前版本為 `codex-cli 0.130.0-alpha.5`；若提姆希望改走 stable（例如 0.129.x），需要另外定義「升級/降級」策略與回滾方式。

