# Firebase Security Model｜Ewalk.ai 權限模型

建立日期：2026-05-23  
用途：定義 Firebase Authentication、Firestore Rules、Storage Rules 的權限邏輯

## 角色

| Role | 說明 | 代表 |
| --- | --- | --- |
| `owner` | 最終決策者，可批准高風險動作 | 提姆先生 |
| `admin` | 系統管理者，可管理使用者、設定與資料 | 技術管理員 |
| `manager` | 專案主管，可管理任務與審核流程 | 阿順 |
| `staff` | 一般員工，可建立任務與草稿 | 人類員工 |
| `agent` | AI 員工 / 自動化服務帳號 | 社群主編、設計企劃 |
| `client` | 客戶入口使用者，只能看自己的資料 | 客戶 |

## 權限原則

### owner / admin

可做：

- 管理使用者
- 修改角色
- 修改系統設定
- 刪除資料
- 查看 audit logs
- 批准高風險事項

限制：

- 仍不應把 API key、token、付款卡資料存進 Firestore。

### manager

可做：

- 建立 / 更新客戶資料
- 管理任務
- 審核內容
- 查看 AI 成本與執行紀錄
- 建立發文佇列

不可做：

- 刪除 audit logs
- 直接修改 owner 權限
- 未經批准調整金流 / 廣告預算

### staff / agent

可做：

- 建立任務
- 建立內容草稿
- 上傳素材
- 建立 AI 執行紀錄

不可做：

- 直接正式發文
- 修改系統設定
- 刪除客戶資料
- 改變批准紀錄
- 調整預算或付款

### client

可做：

- 查看自己 client_id 相關資料
- 上傳素材到自己的資料夾
- 查看 / 回覆待審內容

不可做：

- 查看其他客戶資料
- 查看 AI 成本總表
- 查看內部 audit logs
- 直接發文

## Firestore 安全規則重點

- 未登入者全部拒絕。
- `users` 只能本人讀取或 admin 讀取。
- `clients` 允許內部讀取，客戶只能讀自己的資料。
- `content_queue` 只有內部可建立與更新；客戶可讀自己的待審內容。
- `approvals` 由內部建立，批准由 owner / admin / manager 管理。
- `audit_logs` 只能新增，不可修改或刪除。
- `settings` 只有 admin 可寫。

## Storage 安全規則重點

Storage 路徑規劃：

```text
clients/{clientId}/brand/
clients/{clientId}/social/
clients/{clientId}/ads/
clients/{clientId}/reports/
system/
tmp/{uid}/
```

規則：

- 客戶只能讀寫自己的 `clients/{clientId}`。
- 內部員工可讀寫客戶素材。
- `system/` 只有 admin 可讀寫。
- `tmp/{uid}` 只有本人可讀寫。

## 高風險動作

以下動作必須建立 `approvals`，且要由提姆先生或授權 manager 批准：

- 正式發布 Meta 貼文
- 調整廣告預算
- 取消訂閱 / 變更付費方案
- 寄送大量 Email
- 對外承諾客戶交付
- 開啟 AI 自動批量任務
- 開啟語音 / 即時 API 高消耗功能

## 服務帳號規則

AI 員工與自動化服務不使用提姆先生個人帳號。

建議：

- 每個自動化建立獨立 service identity。
- service identity 的 role 使用 `agent`。
- 只給必要 collection 權限。
- 所有操作寫 `audit_logs`。

## 第一階段限制

Phase 0 / Phase 1 不允許：

- 正式 Meta 發文
- 正式客戶入口
- 正式廣告操作
- 保存任何長效 token
- 開啟 AI 自動批量任務

第一階段只允許：

- 建立 schema
- 建立 rules
- 本機 emulator 測試
- 寫入測試資料
- 驗證權限邏輯

## Command Center 內部後台讀取

Command Center Live Read 第一版只允許以下 role 進入：

- `owner`
- `admin`
- `manager`
- `staff`

`agent` 雖然在 Firestore rules 中屬於內部工作身份，但第一版不開放 AI 員工直接登入管理後台。AI 員工後續應透過受控服務流程執行任務，並寫入 `audit_logs`。
