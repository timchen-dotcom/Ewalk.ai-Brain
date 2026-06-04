# 2026-05-18 自我升級 - Claude Code 與 Gemini CLI 最小回歸落地

## 來源

- 今日情報總檔：[[2026-05-18_GitHub自我升級情報|2026-05-18 GitHub 自我升級情報]]
- Claude Code changelog：https://code.claude.com/docs/en/changelog
- Gemini CLI releases：https://github.com/google-gemini/gemini-cli/releases

## 可吸收重點

- Claude Code：2.1.143 的 plugin 相依性、projected context cost、`/bg`、worktree cleanup、hook loop cap 都應轉成「長任務最小回歸」檢查。
- Gemini CLI：v0.44.0-nightly 的 MCP Proxy/NO_PROXY、RAG snippets log、Sandbox/file parsing 修正，應轉成「MCP/RAG/檔案例外」檢查。

## 系統優化判斷

- 高價值：
  - Claude Code 回歸清單補強：讓長任務、背景 session、hooks 更可控。
  - Gemini CLI 回歸清單補強：讓未來接 MCP/RAG 時能先驗證代理、檢索證據與檔案權限。
- 暫不吸收：
  - 不直接升級或安裝 Gemini CLI；目前只更新驗收規則。
  - 不把 RAG snippets log 用於客戶資料；需先確認資料保護規則。

## 已更新

- 補強 SOP：[[../13_SOP流程/Claude Code CLI 升級與最小回歸驗證SOP|Claude Code CLI 升級與最小回歸驗證 SOP]]
- 補強知識卡：[[../Claude Code v2.1.143 升級重點與落地清單|Claude Code v2.1.143 升級重點與落地清單]]
- 補強 SOP：[[../13_SOP流程/Gemini CLI 安裝與最小回歸驗證SOP|Gemini CLI 安裝與最小回歸驗證 SOP]]
- 新增知識卡：[[../Gemini CLI v0.44.0-nightly 升級重點與落地清單|Gemini CLI v0.44.0-nightly 升級重點與落地清單]]

## 待確認

- Claude Code：是否允許用 1 個內部 repo 測 `/bg`、hooks、worktree cleanup 的長任務回歸？
- Gemini CLI：是否允許用內部測試資料跑一次 RAG snippets log 檢查？

