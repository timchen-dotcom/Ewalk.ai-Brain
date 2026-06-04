# Firebase 使用者角色寫入紀錄模板

用途：每次新增或調整 Firebase `users/{uid}` 權限時，留下可查帳紀錄。

使用時機：

- 新增提姆先生 owner 權限
- 新增內部員工 / AI 員工 / 測試客戶權限
- 調整員工 role
- 停用離職員工或不再使用的測試帳號

## 紀錄格式

```markdown
## YYYY-MM-DD 使用者角色寫入紀錄

- Firebase Project：ewalk-ai-system-prod
- 執行人：阿順
- 批准者：提姆先生
- 操作工具：寫入Firebase使用者角色.command
- 操作類型：新增 / 調整 / 停用

| 欄位 | 內容 |
| --- | --- |
| UID |  |
| Email |  |
| 顯示名稱 |  |
| Role | owner / admin / manager / staff / agent / client |
| 狀態 | active / inactive |
| 對應客戶 |  |
| 對應部門 |  |
| 寫入結果 | 成功 / 失敗 |
| 回查文件 | users/{uid} |

## 風險檢查

- [ ] 是否由提姆先生批准
- [ ] 是否確認 Firebase Project 是 `ewalk-ai-system-prod`
- [ ] 是否沒有把 token / secret 放進文件
- [ ] 是否已建立 audit log
- [ ] 是否沒有部署 rules、沒有發文、沒有啟用 Blaze

## 備註

-
```

## Role 建議

| Role | 適用對象 | 說明 |
| --- | --- | --- |
| `owner` | 提姆先生 | 最終決策者，只允許 `tim.chen@ewalk.ai` |
| `admin` | 技術管理員 | 管理系統設定與使用者 |
| `manager` | 阿順 / 專案主管 | 管理任務、內容、審核流程 |
| `staff` | 內部員工 | 建立任務與草稿 |
| `agent` | AI 員工 / 自動化身份 | 執行指定流程，必須寫入 audit logs |
| `client` | 客戶窗口 | 只能看自己的客戶資料 |

## 下一步

建立第一位 owner 時，先到 Firebase Authentication 複製 `tim.chen@ewalk.ai` 的 UID，再執行：

```text
寫入Firebase使用者角色.command
```

完成後，把實際紀錄另存成：

```text
Ewalk.ai Brain/08_自動化/firebase/docs/YYYY-MM-DD_user-role-write-log.md
```
