# Gemini CLI 安裝與最小回歸驗證 SOP

## 目的

把 Gemini CLI 的導入變成「可回歸、可驗收」的小流程：需要它時能快速裝起來、驗證可用、避免 OAuth/headless 卡死或 MCP 信任資料夾踩雷。

## 使用時機

- 需要 Gemini 的長上下文 / 多模態（文件/圖片/影片理解）補位
- 需要 Google 生態整合（帳號登入、雲端工具）類工作流時
- 想把 Gemini CLI 納入 MCP 工具鏈（並遵守 untrusted folder 的信任模型）
- 需要驗證 MCP Proxy/NO_PROXY、Sandbox、RAG snippets log 等版本更新是否降低長任務風險時
- 想把 Gemini CLI 或 Gemini CLI GitHub Action 放進 headless / CI / 排程流程時（需先做安全檢核）

## 前置條件

- 這台機器允許對外網路（至少能連到 Google / GitHub）
- 已先閱讀本 Vault 的「自我升級情報」與本 SOP（避免直接在主力交付環境盲裝）
- 若用於 headless / CI / GitHub Actions：需先確認版本已避開已知 workspace trust / allowlist bypass 風險，並完成 secrets 隔離

## 安裝流程（概念版）

> 依官方文件為準；這裡只定義「安裝後要驗什麼」與「驗收門檻」。

### 1) 記錄安裝前狀態

- 記錄日期與環境（主力 / 測試）
- 記錄是否已安裝：`gemini --version`（或等價指令）

### 2) 安裝 / 升級

- 依官方安裝方式完成後，再次記錄版本號與日期

## 最小回歸（必跑）

至少跑 4 項；任一失敗就先暫緩導入：

1) 基本啟動
- `gemini` 能啟動並完成一次最短互動（輸入一行 → 回覆一段）

2) OAuth 登入（避免 headless 無聲卡住）
- 能完成一次登入流程（若在 headless/遠端環境，確認不會卡在 OAuth）

3) MCP / 工具列（配合信任資料夾）
- 在「受信任」資料夾中執行 `mcp list`（或等價）可正常列出
- 在「未受信任」資料夾中執行同樣命令，行為符合預期（不應默默放寬權限）

4) MCP Proxy / NO_PROXY（若環境有代理）
- 記錄是否有設定 `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY`
- 若有 network-based MCP servers：確認該走 proxy 的有走 proxy，`NO_PROXY` 內的 host 不被錯誤轉送

5) RAG snippets log（若使用檢索）
- 跑一次小型 RAG / 檢索任務
- 確認本地 log 能追到 snippets 內容或引用線索，方便之後稽核「模型到底看了什麼」

6) Sandbox / 檔案例外（若有檔案讀取）
- 測一次正常檔案讀取、一個資料夾路徑誤傳、一個不存在路徑
- 確認錯誤訊息可理解，且不會因 EISDIR / permission denied 類問題直接卡死

7) Headless / CI 安全（若用於 GitHub Actions 或無人值守流程）
- 確認不在不可信 PR / issue / comment 觸發流程中使用自動信任工作目錄
- 禁止 `--yolo` 或等價跳過確認模式處理外部輸入
- 確認 CI secrets 不會暴露給不可信 workflow；不可信輸入只能產生草稿/報告，不得直接執行 shell、部署或 webhook

## 風險檢查（必看）

- 是否出現長時間無輸出卡住（特別是 OAuth / headless 場景）
- MCP 工具清單是否因資料夾信任狀態而混亂（避免在不該用工具的地方誤用）
- RAG snippets log 是否可能記錄客戶敏感資料；若有，先只在內部測試資料使用
- Proxy / NO_PROXY 是否造成內部服務誤送到外部代理
- Headless / CI 是否處理外部輸入；若有，先依 [[../08_自動化/Agent Harness 治理 Checklist|Agent Harness 治理 Checklist]] 做 trust boundary 與 secrets 檢查

## 驗收標準

- 最小回歸 ≥ 4 項全過；若使用 MCP/RAG/sandbox 檔案讀取，對應檢查也必須通過
- 若使用 headless / CI / GitHub Actions，安全檢查必須全過；任何不確定項都先暫緩導入
- 留下可追溯記錄（版本、日期、通過/失敗、卡住點）
