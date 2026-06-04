# Firebase Phase 0 建置 SOP

建立日期：2026-05-23  
用途：把 Ewalk.ai Firebase 底座從本機骨架連到正式 Firebase project  
狀態：公司 Firebase project、Firestore、Firebase CLI 串接、本機 Java、本機 emulator 啟動測試已完成；正式 Authentication 已啟用 Email/Password 與 Google 登入；正式 Storage 因 Google 目前要求 Blaze 付費方案，待提姆先生批准；rules 尚未部署正式 project

## 目前完成

本機已建立：

- `.firebaserc`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- Firestore schema 文件
- Security model 文件
- Phase 0 測試資料規格
- Firebase CLI `15.18.0` 已安裝在專案本機工具資料夾
- Firebase CLI 已登入 `tim.chen@ewalk.ai`
- Firebase CLI default project 已切到 `ewalk-ai-system-prod`
- 本機 Java：Temurin JDK 21，放在 `.tools/jdk`
- 本機 emulator 已驗證可啟動：Auth / Firestore / Storage
- 正式 Authentication：Email/Password 已啟用
- 正式 Authentication：Google 登入已啟用，公開名稱 `Ewalk AI System`，支援信箱 `tim.chen@ewalk.ai`

## 需要提姆先生決策

| 項目 | 建議值 |
| --- | --- |
| Firebase project display name | Ewalk AI System |
| Firebase project id | `ewalk-ai-system-prod` |
| Firestore 地區 | `asia-east1 (Taiwan)` |
| Billing | 目前先維持 Spark 免費方案；升級前需提姆先生批准 |
| 月預算警示 | 第一階段 NT$500 / NT$1,000 / NT$2,000 三段 |
| 第一個樣板客戶 | 韓食日常鍋物 |

## 建立 Firebase Project

1. 前往 Firebase Console：<https://console.firebase.google.com/>
2. 建立 project：
   - Project name：`Ewalk AI System`
   - Project ID：`ewalk-ai-system-prod`
   - 父項資源：`ewalk.ai`
   - Google Analytics 帳戶：`數位漫步有限公司`
3. 啟用 Google Analytics：已開啟，後續報表會用到。
4. 建立後進入專案。

> 注意：`ewalk-ai-system` 曾誤建在個人帳號底下；公司正式專案一律使用 `ewalk-ai-system-prod`。

## 啟用產品

### Authentication

建議先啟用：

- Email / Password
- Google Sign-in

第一階段只建立內部帳號，不開客戶入口。

2026-05-23 狀態：

- Email / Password：已啟用。
- Google Sign-in：已啟用。

### Firestore

1. 建立 Firestore Database：已完成。
2. Mode：Production mode。
3. Location：`asia-east1 (Taiwan)`。
4. 建好後不要用測試規則覆蓋，改部署本資料夾的 `firestore.rules`。

### Storage

2026-05-23 狀態：

- Firebase Console 已檢查 Storage 頁面。
- Google 官方目前要求新專案升級 Blaze 付費方案，才能建立 Cloud Storage for Firebase default bucket。
- Ewalk.ai 目前維持 Spark 免費方案，因此先不啟用正式 Storage。
- 本機 Storage Emulator 仍可用於開發測試，不會產生雲端費用。

正式啟用條件：

1. 提姆先生批准升級 Blaze。
2. 先設定 Google Cloud / Firebase 預算警示。
3. 建立 Storage default bucket，地區優先與 Firestore 一致或選擇成本更低的適用區域。
4. 部署本資料夾的 `storage.rules`。

## 本機工具

確認是否安裝 Firebase CLI：

```bash
"/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/.tools/bin/firebase" --version
```

目前安裝方式：

- 官方獨立版 Firebase CLI 已放在 `.tools/firebase-cli/firebase-tools-macos`
- 專案入口為 `.tools/bin/firebase`
- Firebase CLI 快取與登入資料放在 `.firebase-home`
- `.firebase-home/`、`.tools/firebase-cli/`、`firebase-cli-link.log` 已加入 `.gitignore`

登入狀態：

```bash
"/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/.tools/bin/firebase" login:list
```

或直接雙擊根目錄：

- `安裝FirebaseCLI.command`
- `串接FirebaseCLI.command`

進入本資料夾：

```bash
cd "Ewalk.ai Brain/08_自動化/firebase"
```

確認 project：

```bash
"/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/.tools/bin/firebase" use
```

## 本機 Emulator 測試

啟動：

```bash
firebase emulators:start
```

預設：

- Emulator UI：<http://127.0.0.1:14000>
- Auth：19099
- Firestore：18080
- Storage：19199
- Firestore websocket：19150
- Functions：15001，Phase 0 暫不啟用

> 原先預設 `8080` 曾被殘留 emulator 佔用，因此改成 Ewalk.ai 專用高埠號，避免和其他本機服務互相卡住。

雙擊根目錄：

- `啟動FirebaseEmulator.command`
- `匯入FirebaseEmulator測試資料.command`

停止 emulator：

- 關閉啟動 emulator 的 Terminal 視窗，或雙擊 `關閉FirebaseEmulator.command`

測試目標：

- Firestore rules 可以載入
- Storage rules 可以載入
- Phase 0 測試資料可以匯入 Firestore Emulator
- 未登入者不能讀寫
- owner / admin 可以管理資料
- client 只能看自己的 client_id

## 部署 Rules

確認 emulator 測試沒問題後，再部署：

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

不要在 rules 未測試前直接部署到正式 project。

## 第一批使用者

建議手動建立：

| 使用者 | Role | 說明 |
| --- | --- | --- |
| 提姆先生 | `owner` | 最終批准者 |
| 阿順服務帳號 | `manager` 或 `agent` | 自動化 / 管理流程 |
| 測試員工 | `staff` | 測試任務與貼文 |
| 測試客戶 | `client` | 測試客戶入口權限 |

建立 Authentication user 後，要在 Firestore `users/{uid}` 補對應 role。

## 第一批資料

優先建立：

1. `settings/voice_ashun_enabled`
2. `settings/meta_auto_publish_enabled`
3. `clients/hansik-daily-hotpot`
4. `departments/social_content`
5. `agents/ashun`
6. `agents/social_editor`
7. `content_queue` 測試貼文 1 筆
8. `audit_logs` 初始化紀錄 1 筆

可參考：

```text
seed/phase0-sample-data.json
```

## Phase 0 驗收

完成標準：

- Firebase project 已建立。
- Firestore / Auth 已啟用。
- Storage 已有 rules 與本機 emulator；正式 Storage 待 Blaze 批准。
- 本機 emulator 可啟動。
- Rules 可部署或至少 emulator 可載入。
- 第一批測試資料可寫入。
- 未登入者不能讀寫。
- 客戶帳號不能讀其他客戶資料。
- `settings` 只有 admin / owner 能改。

## 不做事項

Phase 0 不做：

- 不接正式 Meta token。
- 不接正式發文。
- 不接付款資料。
- 不開客戶入口給真客戶。
- 不開 AI 批量自動化。

## 下一階段

Phase 0 通過後，進 Phase 1：

- 寫入正式 schema baseline。
- 建第一個韓食日常鍋物 `content_queue`。
- 修改 Meta 發文工具，讓它只讀取 `approved` 狀態的貼文。
