# Ewalk.ai Firebase 底座

建立日期：2026-05-23  
主管：阿順  
最終決策者：提姆先生  
狀態：Phase 0 / Phase 1 本機骨架已建立；正式 Firebase project、Firestore、Authentication、CLI、本機 emulator 已串接；韓食 Command Center 第一批資料已正式寫入；Storage 正式啟用待 Blaze 批准

## 目的

這個資料夾是 Ewalk.ai 完整雲端營運系統的 Firebase 底座。它先不接正式發文、不碰金流、不保存敏感 token，而是先定義：

- Firebase project 結構
- Firestore collections
- Storage 素材路徑
- Authentication / roles 權限模型
- Security Rules
- Emulator 本機測試方式
- 後續 Meta 發文佇列與 Command Center 的資料底層

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `.firebaserc` | Firebase project 對應設定，正式 project 建好後更新 project id |
| `firebase.json` | Firebase CLI / Emulator 設定 |
| `firestore.rules` | Firestore 安全規則初版 |
| `firestore.indexes.json` | Firestore indexes 初版 |
| `storage.rules` | Cloud Storage 安全規則初版 |
| `docs/firestore-schema.md` | 完整版 Ewalk.ai 資料結構 |
| `docs/security-model.md` | 權限模型與角色設計 |
| `docs/setup-sop.md` | Firebase 建置與連線 SOP |
| `docs/role-write-log-template.md` | 使用者角色寫入紀錄模板 |
| `docs/phase2-command-center-webapp.md` | Command Center Web App 與 Live Read 路線 |
| `docs/live-read-test-checklist.md` | Command Center Live Read 測試清單 |
| `docs/rules-audit-report.md` | Firebase Rules 部署前權限稽核報告 |
| `seed/phase0-sample-data.json` | 本機測試資料規格 |
| `config/system-settings.json` | 系統功能開關定義 |
| `scripts/seed-emulator.mjs` | 只寫入本機 emulator 的測試資料匯入工具 |

## 目前策略

資料架構使用完整版 Ewalk.ai 系統設計，但功能分階段啟用：

1. 先建立 Firebase 安全底座。
2. 再建立 Firestore schema。
3. 先用韓食日常鍋物做 Meta 發文佇列樣板。
4. 接著做 AI 成本控管與 Remote Config 功能開關。
5. 最後才做客戶入口、排程自動化與報表分析。

## 目前可用工具

| 工具 | 用途 |
| --- | --- |
| `產生CommandCenterApp.command` | 產生內部 Command Center snapshot 預覽 |
| `更新CommandCenter資料.command` | 重新整理韓食內容佇列、成效追蹤與預覽資料 |
| `寫入FirebaseCommandCenter.command` | 將已批准的 Command Center 資料正式寫入 Firestore |
| `建立CommandCenterFirebaseConfig.command` | 建立 Command Center 本機 Firebase Web App config |
| `開啟FirebaseAuthUsers.command` | 打開 Firebase Authentication 使用者頁 |
| `寫入Firebase使用者角色.command` | 建立 `users/{uid}` 權限文件與稽核紀錄 |
| `產生Firebase權限稽核報告.command` | 產生 Rules 部署前靜態稽核報告 |
| `產生Firebase系統開關.command` | 產生系統功能開關 dry-run |

## 重要安全原則

- API key / access token 不進 Firestore。
- 客戶端不可直接正式發文。
- 發文、廣告預算、金流、取消訂閱都必須經提姆先生批准。
- 所有 AI 執行、發文、審核、權限變更都要寫入 `audit_logs`。
- 所有正式部署前先用 Emulator 測試。
