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

預計後續新增：

- `verify-rules.mjs`：測試不同角色權限。
- `export-schema.mjs`：輸出目前 Firestore collections 結構。
- `import-content-queue-live.mjs`：在 rules 測試完成後，把 Obsidian Meta 發文佇列轉進正式 Firestore。

規則：

- 正式寫入腳本必須先 dry-run。
- 任何讀取 token / secret 的腳本都不能把值印出來。
- 寫入正式 Firebase 前必須由提姆先生批准。
