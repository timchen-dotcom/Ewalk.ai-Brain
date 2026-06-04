# Firebase 導入與系統優化路線圖

建立日期：2026-05-23  
負責角色：阿順  
最終決策者：提姆先生  
狀態：Phase 0 / Phase 1 本機骨架已建立，公司 Firebase project、Firestore、Firebase CLI 串接、本機 Java、本機 emulator 啟動測試已完成；正式 Authentication 已啟用 Email/Password 與 Google 登入；正式 Storage 因 Google 目前要求 Blaze 付費方案，需提姆先生另行批准後再啟用；rules 尚未部署正式 project

## 目的

把 Firebase 作為 Ewalk.ai 的雲端後勤底座，逐步承接：

- 客戶資料
- 任務與審核流程
- Meta 發文佇列
- 素材庫
- AI 執行紀錄
- 成本控管
- 客戶入口網站
- 阿順 Command Center

原則：先做可觀察、可回滾、低風險功能，再逐步接上自動化。

## Firebase 在 Ewalk.ai 的定位

Firebase 不是取代 Codex、Gemini、ChatGPT，而是作為系統底層：

- `Firestore`：營運資料庫、任務佇列、審核狀態
- `Authentication`：提姆、員工、客戶登入與權限
- `Cloud Storage`：客戶素材、圖片、影片、LOGO、AI 生成素材
- `Cloud Functions`：自動化後端、排程、webhook
- `Hosting / App Hosting`：內部後台或客戶入口
- `Remote Config`：功能開關、成本止血開關
- `Analytics / BigQuery`：報表與趨勢分析

## 導入階段

### Phase 0：專案建立與安全底座

目標：先把 Firebase 專案建立好，但不接正式客戶流程。

目前進度：

- [x] 建立本機 Firebase 設定資料夾：`Ewalk.ai Brain/08_自動化/firebase`
- [x] 建立 `firebase.json`
- [x] 建立 `.firebaserc`
- [x] 建立 `firestore.rules`
- [x] 建立 `storage.rules`
- [x] 建立 `firestore.indexes.json`
- [x] 建立 Phase 0 seed 資料規格
- [x] 建立 Firestore schema 文件
- [x] 建立 security model 文件
- [x] 建立 setup SOP
- [x] 建立正式 Firebase project：`ewalk-ai-system-prod`
- [x] 啟用 Firestore：Standard 版、Production mode、`asia-east1 (Taiwan)`
- [x] 安裝 / 登入 Firebase CLI
- [x] 啟動 emulator 測試
- [x] 啟用 Authentication Email/Password
- [x] 確認 Authentication Google 登入是否完成啟用
- [ ] 啟用正式 Storage：目前需 Blaze 付費方案，待提姆先生批准
- [ ] 部署 rules 到正式 project
- [x] 建立本機 emulator 測試資料匯入工具

2026-05-23 執行紀錄：

- 已建立可雙擊工具：
  - `開啟FirebaseConsole.command`
  - `安裝FirebaseCLI.command`
  - `Firebase登入.command`
  - `啟動FirebaseEmulator.command`
  - `部署FirebaseRules.command`
- 已開啟 Firebase Console。
- 已改用公司帳號 `tim.chen@ewalk.ai` 建立正式 Firebase project。
- 正式 Firebase project：`Ewalk AI System` / `ewalk-ai-system-prod`。
- Firestore 已建立：Standard 版、Production mode、`asia-east1 (Taiwan)`。
- 目前仍維持 Spark 免費方案，未升級 billing。
- Firebase CLI 已改用官方獨立版安裝，版本 `15.18.0`。
- Firebase CLI 已登入公司帳號 `tim.chen@ewalk.ai`。
- Firebase CLI 已切到正式 project：`ewalk-ai-system-prod`。
- Firebase CLI 本機入口：`.tools/bin/firebase`。
- CLI 大型執行檔、本機登入快取與連線紀錄已加入 `.gitignore`。
- 本機 Java 已改用專案內 Temurin JDK 21，放在 `.tools/jdk`，不安裝到 macOS 系統層。
- Emulator 已成功啟動並由 Chrome 驗證 UI：<http://127.0.0.1:14000/>
- Emulator ports：
  - Auth：19099
  - Firestore：18080
  - Storage：19199
  - Firestore websocket：19150
- 已新增 `關閉FirebaseEmulator.command`，用來清掉本機 emulator 背景服務。
- Authentication 已啟用 Email/Password。
- Authentication 已啟用 Google 登入。
- Storage 頁面已檢查；Google 官方自 2024-10 起要求新專案升級 Blaze 才能建立 Cloud Storage for Firebase default bucket。Ewalk.ai 目前維持 Spark 免費方案，因此先不啟用 Storage，避免未批准的付費風險。
- 已新增本機測試資料匯入工具：
  - `匯入FirebaseEmulator測試資料.command`
  - `Ewalk.ai Brain/08_自動化/firebase/scripts/seed-emulator.mjs`
- 已新增韓食日常鍋物發文佇列轉換工具：
  - `轉換韓食發文佇列.command`
  - `Ewalk.ai Brain/08_自動化/firebase/scripts/import-content-queue.mjs`
  - 輸出 `Ewalk.ai Brain/08_自動化/firebase/output/hansik-content-queue.dry-run.json`
- 已新增 Ewalk.ai Command Center 只讀預覽：
  - `產生CommandCenter預覽.command`
  - `Ewalk.ai Brain/08_自動化/firebase/scripts/build-command-center.mjs`
  - 輸出 `Ewalk.ai Brain/08_自動化/firebase/output/command-center-preview.html`
- 已新增成效追蹤員 dry-run 佇列：
  - `產生成效追蹤佇列.command`
  - `Ewalk.ai Brain/08_自動化/firebase/scripts/build-performance-followups.mjs`
  - 輸出 `Ewalk.ai Brain/08_自動化/firebase/output/hansik-performance-followups.dry-run.json`
- 已新增一鍵更新工作流與 Phase 1 工作板：
  - `更新CommandCenter資料.command`
  - `Ewalk.ai Brain/08_自動化/firebase/docs/phase1-workboard.md`
- 已新增正式 Firestore 寫入工具：
  - `寫入FirebaseCommandCenter.command`
  - `Ewalk.ai Brain/08_自動化/firebase/scripts/write-firestore-command-center.mjs`
  - `Ewalk.ai Brain/08_自動化/firebase/docs/2026-05-23_firestore正式寫入執行紀錄.md`
- 提姆先生已批准韓食 Command Center 資料正式寫入 Firestore；已透過本機 Chrome 完成 12 筆正式寫入並回查 `clients/hansik-daily-hotpot` 成功。
- 已建立內部 Command Center App snapshot 版：
  - `Ewalk.ai Brain/08_自動化/firebase/command-center-app/index.html`
  - `產生CommandCenterApp.command`
  - `Ewalk.ai Brain/08_自動化/firebase/docs/phase2-command-center-webapp.md`

要做：

- 啟用 Storage 前先取得提姆先生批准 Blaze 與預算警示
- 建立開發 / 正式環境分流
- 啟用正式 Storage
- 建立 `.env.local` 與密鑰保護規則
- 設定預算警示
- 建立本機 emulator 測試流程

交付：

- Firebase 專案連線成功
- 本機可讀寫測試資料
- 不含正式客戶資料

需要提姆先生批准：

- Firebase project 名稱
- 是否開啟 billing
- 預算上限

### Phase 1：Ewalk.ai 核心資料結構

目標：定義雲端資料庫結構，先只做內部管理。

核心 collections：

| Collection | 用途 |
| --- | --- |
| `clients` | 客戶資料 |
| `tasks` | 任務與交辦 |
| `content_queue` | 社群貼文與發文佇列 |
| `approvals` | 提姆先生批准紀錄 |
| `assets` | 素材索引 |
| `ai_runs` | AI 執行紀錄與成本 |
| `audit_logs` | 系統操作紀錄 |
| `settings` | 功能開關與系統設定 |

交付：

- Firestore schema 文件
- 安全規則初版
- 測試資料寫入 / 查詢工具

### Phase 2：Meta 自動發文佇列上雲

目標：先把「韓食日常鍋物」當樣板，讓貼文流程進 Firebase。

流程：

1. 阿順產出貼文草稿
2. 寫入 `content_queue`
3. 狀態為 `pending_review`
4. 提姆先生批准後改為 `approved`
5. 發文工具只讀取 `approved`
6. 發文後寫回 `published` 與 Meta post id

交付：

- Firebase 貼文佇列表
- 本機發文工具改讀 Firebase
- 發文前仍需提姆先生批准

需要提姆先生批准：

- 是否允許韓食日常鍋物先做第一個 Firebase 樣板

### Phase 3：素材庫與客戶資料庫

目標：把客戶素材與資料管理雲端化。

要做：

- 客戶基本資料
- 品牌語氣
- LOGO / 圖片 / 影片素材
- 社群帳號資料
- 活動檔期
- 禁用詞 / 注意事項

交付：

- 客戶資料表
- 素材上傳流程
- 素材與貼文佇列關聯

### Phase 4：Ewalk.ai Command Center

目標：做一個內部後台，讓阿順與 AI 員工的工作可視化。

功能：

- 今日任務
- 客戶待辦
- 貼文待審
- 發文排程
- AI 成本紀錄
- 異常提醒
- 每日 / 每週回報

交付：

- 內部管理頁
- Firestore 即時資料
- 角色權限：提姆先生 / 阿順 / 員工

### Phase 5：AI 執行紀錄與成本控管

目標：每次 AI 自動化都留下紀錄，避免看不到成本。

要記錄：

- 使用模型
- 任務類型
- 輸入摘要
- 輸出摘要
- 花費 token / API 成本
- 是否被採用
- 是否產生交付成果

交付：

- `ai_runs` 紀錄表
- 成本月報
- 預算警示
- Remote Config 功能開關

### Phase 6：客戶入口網站

目標：讓客戶能補資料、看草稿、批准內容。

功能：

- 客戶登入
- 上傳素材
- 查看貼文草稿
- 批准 / 退回修改
- 查看月報
- 留言補充需求

交付：

- 客戶 portal MVP
- 客戶只看得到自己的資料
- 所有批准紀錄寫入 `approvals`

### Phase 7：自動化與排程

目標：把固定工作交給 Cloud Functions / Scheduler。

可自動化：

- 每日檢查待審貼文
- 每週產社群週報
- 每月訂閱費檢查
- Meta 發文結果回寫
- 廣告異常提醒
- 客戶補資料提醒

交付：

- Cloud Functions
- 排程任務
- Discord / Email 通知

### Phase 8：報表與資料分析

目標：讓 Firebase 資料能變成公司經營報表。

可做：

- 客戶月報
- 社群成效趨勢
- AI 成本報表
- 工具訂閱費報表
- 任務完成率
- 客戶回覆速度

交付：

- Firestore 匯出 / BigQuery 串接
- 自動月報基礎資料
- Ewalk.ai 經營儀表板

## 優先順序建議

最穩順序：

1. Phase 0：Firebase 安全底座
2. Phase 1：核心資料結構
3. Phase 2：韓食日常鍋物 Meta 發文佇列
4. Phase 5：AI 成本與功能開關
5. Phase 4：內部 Command Center
6. Phase 6：客戶入口
7. Phase 7：排程自動化
8. Phase 8：報表分析

## 風險控管

- 不把 API key 放進前端
- 不讓客戶端直接執行發文
- 發文、金流、取消訂閱、廣告預算調整都要提姆先生批准
- 先用 Firebase emulator 測試
- 每個自動化都要有 audit log
- 每個 AI 任務都要有成本紀錄
- 任何功能都要能用 Remote Config 關閉

## 下一步

建議先執行 Phase 0。

提姆先生需要決定：

1. Firebase project 名稱：已建立為 `Ewalk AI System`
2. Firebase project ID：公司正式專案為 `ewalk-ai-system-prod`
3. 是否允許開啟 billing：目前先維持 Spark 免費方案，升級前需批准
4. 預算警示上限
5. 第一個樣板是否使用「韓食日常鍋物」
