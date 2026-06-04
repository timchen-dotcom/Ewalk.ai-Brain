# 2026-05-23 Firestore 正式寫入執行紀錄

執行日期：2026-05-23  
負責角色：阿順  
批准人：提姆先生  
目標 project：`ewalk-ai-system-prod`  
狀態：已完成，正式 Firestore 寫入與回查成功

## 本次批准範圍

允許把韓食日常鍋物 Command Center dry-run 資料正式寫入 Firebase Firestore。

允許寫入 collection：

- `clients`
- `content_queue`
- `campaign_reports`
- `audit_logs`

本次不包含：

- 不發文
- 不部署 rules
- 不啟用 Firebase Blaze
- 不處理廣告或金流
- 不新增正式客戶入口

## 已完成

- 已建立正式寫入工具：`寫入FirebaseCommandCenter.command`
- 已建立正式寫入腳本：`Ewalk.ai Brain/08_自動化/firebase/scripts/write-firestore-command-center.mjs`
- 已重新產生 dry-run 資料
- 已產生 Firestore commit 批次檔
- 已產生稽核 manifest
- 已清除暫存授權 token 檔案
- 已透過本機 Chrome 完成 Firestore commit
- 已回查 `clients/hansik-daily-hotpot` 成功

## 準備寫入資料

預計寫入 12 筆：

- `clients/hansik-daily-hotpot`
- 4 筆 `content_queue`
- 6 筆 `campaign_reports`
- 1 筆 `audit_logs`

最新稽核紀錄：

```text
audit_logs/firebase-sync-20260523074932
```

## 寫入結果

Chrome 回傳結果：

```json
{
  "ok": true,
  "project_id": "ewalk-ai-system-prod",
  "verified_document": "projects/ewalk-ai-system-prod/databases/(default)/documents/clients/hansik-daily-hotpot",
  "write_count": 12,
  "finished_at": "2026-05-23T07:58:22.716Z"
}
```

結果檔：

```text
/Users/chenjinting/Downloads/ewalk-firestore-result-20260523075808.json
```

## 過程備註

Codex 本機沙盒一度無法穩定解析或連線 Firestore API，因此改用本機 Chrome 送出 commit，並由瀏覽器自動下載結果檔供阿順回讀驗證。

敏感暫存檔已清除：

- `oauth-refresh-form.txt`
- `oauth-token.json`
- `access-token.txt`
- `firestore-commit.html`

## 下一步

1. 到 Firebase Console 抽查：
   - `clients/hansik-daily-hotpot`
   - `content_queue`
   - `campaign_reports`
   - `audit_logs/firebase-sync-*`
2. 下一步再決定是否部署 Firestore rules
3. 開始規劃 Command Center Web App 讀取正式 Firestore

## 阿順判斷

正式資料已進 Firestore。下一步不急著開放客戶入口，先做內部 Command Center 讀取與權限驗證，確保資料能看、能查、能控管。
