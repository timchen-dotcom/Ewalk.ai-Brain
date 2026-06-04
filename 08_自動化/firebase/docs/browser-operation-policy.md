# 阿順瀏覽器操作原則

建立日期：2026-05-23  
負責角色：阿順  
最終決策者：提姆先生

## 原則

阿順操作網頁時分成兩種模式：

| 模式 | 適合任務 | 是否佔用提姆先生畫面 |
| --- | --- | --- |
| 背景 / 本機工具 | 產生文件、轉資料、產生看板、寫 SOP、檢查檔案、跑 dry-run | 不佔用 |
| Chrome 前景操作 | Google / Firebase / Meta Console 登入、授權、需要既有 cookie 的設定 | 會短暫佔用 |

## 為什麼不能全部背景操作

Google、Firebase、Meta 這類平台會把登入、2FA、OAuth 同意畫面綁在使用者目前的瀏覽器 Session。  
阿順如果要使用提姆先生已登入的公司帳號，就必須透過 Chrome 前景操作。

這不是 Ewalk.ai 系統架構問題，而是平台安全機制。

## 之後怎麼減少干擾

- 優先把可重複動作做成 `.command` 一鍵工具。
- 能用本機資料處理的，不打開 Chrome。
- 只有登入、授權、正式 Console 設定才借用 Chrome。
- 每次借用 Chrome 前，先講清楚目的、會做什麼、不會做什麼。
- 可用 `localhost` 的本機頁面，不使用 `127.0.0.1`，避免 Firebase Auth 擋登入來源。
- 高風險動作仍回到提姆先生批准：正式發文、部署 rules、金流、廣告預算、取消訂閱。

## 目前 Firebase 狀態

- 已取得提姆先生 Firebase Auth UID：`wGhBDfhD1RQB2AObEXNUTL5yhwR2`
- Email：`tim.chen@ewalk.ai`
- 已透過 Google OAuth + Firestore REST API 建立 owner role 文件
- Owner role 回查成功：`projects/ewalk-ai-system-prod/databases/(default)/documents/users/wGhBDfhD1RQB2AObEXNUTL5yhwR2`
- 已透過 Google OAuth + Firebase Rules REST API 部署 Firestore rules
- Command Center Live Read 已成功：`tim.chen@ewalk.ai` 通過 `role=owner`，可讀正式 Firestore 資料
- 本機 Firebase CLI 曾因沙盒網路 DNS 限制與部署程序卡住，因此保留瀏覽器 OAuth 備援流程

## 下一步

Command Center 已可讀正式 Firestore。後續若要再改 rules，仍優先使用 `部署FirebaseRules.command` 的 `FIRESTORE` 模式；若 CLI 卡住，再使用 `command-center-app/deploy-firestore-rules.html` 走瀏覽器 OAuth 備援部署。

不要輸入 `ALL`，因為 Storage 正式 bucket / Blaze 決策尚未完成。
