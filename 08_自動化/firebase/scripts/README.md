# Firebase Scripts

這裡保留 Firebase 初始化、資料匯入、Emulator 測試腳本。

正式寫入腳本必須有 dry-run、專案確認、批准者確認與稽核紀錄。不要直接繞過 `.command` 工具執行正式寫入。

目前已新增：

- `seed-emulator.mjs`：只寫入本機 Firestore Emulator，匯入 `seed/phase0-sample-data.json`。
- `../seed/phase0-emulator-import.html`：當 Codex 沙盒無法連本機 emulator 時，用 Chrome 直接匯入 Phase 0 測試資料。
- `import-content-queue.mjs`：把韓食日常鍋物 Obsidian Meta 發文佇列轉成 Firebase `content_queue` dry-run JSON。
- `build-command-center.mjs`：把 Firebase `content_queue` dry-run JSON 產生成 Command Center 只讀 HTML 預覽。
- `build-performance-followups.mjs`：把已發布內容轉成 24 / 72 小時成效追蹤 dry-run 佇列。
- `build-command-center-app-data.mjs`：產生內部 Command Center App snapshot 資料。
- `write-firestore-command-center.mjs`：產生已批准的正式 Firestore Command Center 寫入批次。
- `prepare-user-role-write.mjs`：產生 `users/{uid}` role 與 `audit_logs` 寫入批次。
- `create-ai-run-dry-run.mjs`：產生 `ai_runs` 本機 dry-run JSON，不連正式 Firebase。
- `build-ai-runs-app-data.mjs`：把 `ai-runs.dry-run.json` 轉成 Command Center 可讀的本機資料。
- `prepare-ai-runs-firestore-write.mjs`：準備 `ai_runs` 正式 Firestore 寫入預覽批次，不會自動提交。
- `write-ai-runs-firestore.mjs`：在提姆先生批准後，正式寫入 `ai_runs` 與 `audit_logs`，並回查驗證。
- `prepare-ai-runs-curl-batch.mjs`：當 Node 子程序網路解析不穩時，產生可用 shell `curl` 送出的 Firestore commit 批次。
- `browser_firestore_commit_server.py`：當本機直連 Firestore 不穩時，透過 Chrome 完成已批准批次寫入與回查。
- `create-approval-queue-dry-run.mjs`：產生 `approvals` 待批准佇列本機 dry-run JSON，不連正式 Firebase。
- `build-approval-queue-app-data.mjs`：把 `approval-queue.dry-run.json` 轉成 Command Center 可讀的本機資料。
- `prepare-approval-queue-emulator-write.mjs`：B16A approvals 寫入前防線；預設只輸出預檢摘要，只允許本機 Firestore Emulator 寫入，不碰 production Firebase。
- `../B16B寫入ApprovalQueue到FirebaseEmulator.command`：B16B 一鍵啟動 Firestore Emulator、寫入 approvals、逐筆回查，僅限本機。
- `prepare-approval-queue-firestore-preview.mjs`：B17A 產生 approvals / audit_logs 正式 Firestore 寫入預覽，不提交 production。
- `review-internal-approval-workflow.mjs`：B18-B20 檢查 approval queue、audit log 與 Command Center 內部上工流程是否符合邊界。
- `ensure-approval-queue-app-data.mjs`：B17A 前置檢查；若本機 `approval-queue.js` 被空檔覆蓋，僅從 Git HEAD 還原這一個 generated snapshot。
- `../B17-B20內部ApprovalQueue批次審查.command`：一次執行 B17A preview 與 B18-B20 本機 review，不寫 production Firebase。
- `write-approval-queue-firestore.mjs`：B17B 只允許將 approvals / audit_logs 寫入 production Firebase，並逐筆回查；需明確 project、批准人、scope 與 `--write`。Firebase CLI 登入檔會依序找 `--firebase-auth`、專案 `.firebase-home`、使用者 `~/.config/configstore/firebase-tools.json`，並支援秒數、毫秒與 ISO 格式的 token 到期時間；若 token refresh 回傳 `invalid_rapt`、`reauth` 或 `invalid_grant`，會停止並要求重新登入 Firebase CLI，不再 fallback 到舊 access token。
- `review-approval-queue-firestore-write.mjs`：B17B-B22 寫後審查，確認正式寫入只限 approvals / audit_logs，且外部副作用仍封鎖。
- `../B17B-B22內部ApprovalQueue正式寫入批次驗證.command`：一次執行 B17A preview、B18-B20 review、B17B 正式內部寫入與 B21-B22 寫後審查。
- `read-approval-queue-firestore.mjs`：B23 只讀 production Firebase 的 approvals / audit_logs，產生 Command Center 本機 production-readonly snapshot 與 review，不寫 Firebase、不改 approval status。
- `../B23CommandCenter正式ApprovalQueue只讀驗收.command`：一次執行 B23 production approvals / audit_logs 只讀驗收，更新本機 Command Center approval queue data。
- `review-command-center-approval-queue-app.mjs`：B24 檢查 Command Center 主畫面、live adapter 與 production-readonly approval queue data，確認主畫面沒有 Firestore 寫入 API、高風險工具連結或外部執行入口。
- `../B24CommandCenter主畫面只讀安全驗收.command`：一次執行 B24 Command Center 主畫面只讀安全驗收。

預計後續新增：

- `verify-rules.mjs`：測試不同角色權限。
- `export-schema.mjs`：輸出目前 Firestore collections 結構。
- `import-content-queue-live.mjs`：在 rules 測試完成後，把 Obsidian Meta 發文佇列轉進正式 Firestore。

規則：

- 正式寫入腳本必須先 dry-run。
- 任何讀取 token / secret 的腳本都不能把值印出來。
- 寫入正式 Firebase 前必須由提姆先生批准。
