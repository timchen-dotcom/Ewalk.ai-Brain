# Firestore Schema｜Ewalk.ai 完整版系統底座

建立日期：2026-05-23  
用途：定義 Ewalk.ai Firebase 雲端營運資料結構  
狀態：Phase 1 初版

## 設計原則

- 一開始用完整版 Ewalk.ai 系統視角設計 schema。
- 實際功能分階段啟用，不一次開放全部自動化。
- 所有重要狀態都要可追蹤、可審核、可回滾。
- 客戶資料、素材、貼文、AI 執行、成本、批准紀錄要能串在一起。
- API key、Page token、App secret、付款資訊不進 Firestore。

## Collections 總覽

| Collection | 用途 | 第一階段是否啟用 |
| --- | --- | --- |
| `users` | 使用者與角色 | 是 |
| `clients` | 客戶資料 | 是 |
| `departments` | AI 部門 | 是 |
| `agents` | AI 員工 / sub-agent 定義 | 是 |
| `tasks` | 任務與交辦 | 是 |
| `content_queue` | 社群貼文佇列 | 是，先給韓食日常鍋物 |
| `approvals` | 批准紀錄 | 是 |
| `assets` | 素材索引 | 是 |
| `publishing_logs` | 發文紀錄 | Phase 2 |
| `ad_accounts` | 廣告帳號資料索引 | Phase 3 |
| `campaign_reports` | 廣告 / 社群成效報表 | Phase 3 |
| `ai_runs` | AI 執行紀錄 | Phase 2 Harness dry-run，正式寫入待批准 |
| `usage_costs` | AI / API 成本 | Phase 2 Harness dry-run，正式寫入待批准 |
| `subscriptions` | 訂閱費用稽核 | Phase 5 |
| `client_portals` | 客戶入口設定 | Phase 6 |
| `settings` | 系統設定 / 功能開關 | 是 |
| `audit_logs` | 操作稽核紀錄 | 是 |

## users

用途：管理登入者與權限。

```json
{
  "display_name": "陳勁廷",
  "email": "tim@ewalk.ai",
  "role": "owner",
  "status": "active",
  "client_ids": [],
  "department_ids": ["management"],
  "created_at": "serverTimestamp",
  "updated_at": "serverTimestamp"
}
```

角色：

- `owner`：提姆先生，最終批准者。
- `admin`：系統管理者。
- `manager`：阿順 / 專案主管。
- `staff`：人類員工。
- `agent`：AI 員工或自動化服務帳號。
- `client`：客戶入口使用者。

## clients

用途：客戶主資料。

```json
{
  "name": "韓食日常鍋物",
  "slug": "hansik-daily-hotpot",
  "status": "active",
  "industry": "餐飲",
  "owner_uid": "uid",
  "brand_voice": "溫暖、日常、生活感",
  "social_accounts": {
    "facebook_page_id": "1082884688247950",
    "instagram_business_id": null
  },
  "notes": "Firebase 第一個 Meta 發文佇列樣板",
  "created_at": "serverTimestamp",
  "updated_at": "serverTimestamp"
}
```

## departments

用途：定義 Ewalk.ai AI 行銷整合公司部門。

```json
{
  "name": "社群內容部",
  "description": "負責社群策略、貼文、短影音腳本與素材需求",
  "lead_agent_id": "ashun",
  "status": "active",
  "created_at": "serverTimestamp"
}
```

## agents

用途：定義 AI 員工與權限。

```json
{
  "name": "社群主編",
  "department_id": "social_content",
  "role": "content_editor",
  "status": "active",
  "can_publish": false,
  "can_spend_budget": false,
  "requires_approval_for": ["publish", "ad_budget", "billing", "client_commitment"],
  "skill_docs": [
    "Ewalk.ai Brain/08_自動化/AI員工入職手冊/社群主編入職手冊.md"
  ],
  "created_at": "serverTimestamp"
}
```

## tasks

用途：任務管理與跨部門交辦。

```json
{
  "title": "產出韓食日常鍋物 6/1 貼文草稿",
  "client_id": "hansik-daily-hotpot",
  "status": "todo",
  "priority": "normal",
  "assigned_to": ["social_editor"],
  "created_by": "ashun",
  "due_at": "2026-06-01T10:00:00+08:00",
  "source": "manual",
  "result_refs": [],
  "created_at": "serverTimestamp",
  "updated_at": "serverTimestamp"
}
```

狀態：

- `todo`
- `in_progress`
- `waiting_approval`
- `approved`
- `done`
- `blocked`
- `cancelled`

## content_queue

用途：社群貼文佇列。這是 Phase 2 第一個實戰核心。

```json
{
  "client_id": "hansik-daily-hotpot",
  "platforms": ["facebook"],
  "status": "pending_review",
  "content_type": "post",
  "title": "馬鈴薯排骨湯日常貼文",
  "copy": "貼文文案",
  "hashtags": ["韓食日常鍋物", "馬鈴薯排骨湯"],
  "asset_ids": ["asset_001"],
  "scheduled_at": "2026-06-01T12:00:00+08:00",
  "approval_id": null,
  "publishing_log_id": null,
  "created_by": "ashun",
  "review_notes": "",
  "created_at": "serverTimestamp",
  "updated_at": "serverTimestamp"
}
```

狀態：

- `draft`
- `pending_review`
- `revision_requested`
- `approved`
- `scheduled`
- `published`
- `failed`
- `cancelled`

規則：

- 只有 `approved` 才能被發文工具讀取。
- 發文工具執行後必須寫 `publishing_logs`。
- `pending_review` 不能自動發文。

## approvals

用途：保存提姆先生或授權主管的批准紀錄。

```json
{
  "target_type": "content_queue",
  "target_id": "content_001",
  "client_id": "hansik-daily-hotpot",
  "client_name": "韓食日常鍋物",
  "category": "publish",
  "permission_level": "L4",
  "status": "approved",
  "requested_by": "ashun",
  "final_approver": "提姆先生",
  "approved_by": "tim_uid",
  "title": "批准 6/1 FB 貼文",
  "request_summary": "允許已審過的貼文進入正式發文流程",
  "business_value": "維持社群更新節奏",
  "risk_summary": "會對外發布，消費者看得到",
  "reject_impact": "內容維持草稿，不會發布",
  "rollback_plan": "發布後需人工刪除或隱藏貼文",
  "ashun_recommendation": "批准",
  "approval_note": "可發布",
  "created_at": "serverTimestamp",
  "requested_at": "serverTimestamp",
  "expires_at": "serverTimestamp",
  "decided_at": "serverTimestamp"
}
```

狀態：

- `pending`
- `approved`
- `rejected`
- `changes_requested`

## assets

用途：素材索引，不直接存檔案本體。檔案本體放 Cloud Storage。

```json
{
  "client_id": "hansik-daily-hotpot",
  "type": "image",
  "storage_path": "clients/hansik-daily-hotpot/social/2026-06/post-001.jpg",
  "public_url": null,
  "title": "馬鈴薯排骨湯照片",
  "tags": ["餐點", "湯品", "社群"],
  "source": "client_upload",
  "created_by": "tim_uid",
  "created_at": "serverTimestamp"
}
```

## publishing_logs

用途：記錄發文結果。

```json
{
  "client_id": "hansik-daily-hotpot",
  "content_queue_id": "content_001",
  "platform": "facebook",
  "status": "success",
  "external_post_id": "facebook_post_id",
  "published_at": "serverTimestamp",
  "error_message": null,
  "created_at": "serverTimestamp"
}
```

## ad_accounts

用途：廣告帳號索引。不存付款卡完整資料。

```json
{
  "client_id": "tg-hair",
  "platform": "meta",
  "account_name": "Ewalk數位漫步廣告帳號",
  "external_account_id": "act_xxx",
  "status": "active",
  "notes": "付款方式與 token 不存 Firestore",
  "created_at": "serverTimestamp"
}
```

## campaign_reports

用途：廣告 / 社群月報資料。

```json
{
  "client_id": "tg-hair",
  "period": "2026-05",
  "platform": "meta",
  "spend_twd": 12820,
  "impressions": 0,
  "clicks": 0,
  "leads": 0,
  "summary": "5 月投放摘要",
  "created_at": "serverTimestamp"
}
```

## ai_runs

用途：每一次 AI 執行紀錄。這是 `Agent = LLM + Harness` 的核心補強欄位，先做 dry-run，提姆先生批准後才正式寫入。

```json
{
  "run_id": "airun_20260602_001",
  "client_id": "hansik-daily-hotpot",
  "task_id": "task_001",
  "source": "codex_chat",
  "owner_uid": "tim_uid",
  "lead_agent_id": "ashun",
  "agent_ids": ["ashun", "social_editor"],
  "skill_ids": ["self-upgrade"],
  "tool_ids": ["filesystem", "firebase_live_read"],
  "permission_level": "L1_write_vault",
  "approval_required": false,
  "approval_id": null,
  "provider": "openai",
  "model": "gpt-5",
  "purpose": "agent_harness_update",
  "context_refs": [
    "AGENTS.md",
    "Ewalk.ai Brain/08_自動化/Ewalk.ai AI Command Center.md"
  ],
  "observe_summary": "讀取現有 Command Center、Sub-agent、Harness、Firestore schema 文件",
  "reason_summary": "判斷目前缺口不是 LLM，而是 Harness Runtime、Run Log、Approval Gate 與工具註冊",
  "act_summary": "新增 Agent Harness 架構文件與任務執行紀錄模板",
  "verify_summary": "檢查文件已建立且索引已更新",
  "memory_refs": [
    "Ewalk.ai Brain/08_自動化/Agent Harness 阿順自我完成架構.md"
  ],
  "status": "success",
  "cost_usd_estimate": null,
  "used_in_delivery": true,
  "created_at": "serverTimestamp",
  "updated_at": "serverTimestamp"
}
```

## usage_costs

用途：成本控管。

```json
{
  "period": "2026-06",
  "provider": "openai",
  "service": "api",
  "cost_usd": 20.22,
  "cost_twd": 638,
  "category": "ai_api",
  "source": "manual_gmail_audit",
  "created_at": "serverTimestamp"
}
```

## subscriptions

用途：每月訂閱稽核。

```json
{
  "service": "Google Workspace",
  "category": "company_infra",
  "amount_usd": 88.2,
  "amount_twd_estimate": 2785,
  "billing_cycle": "monthly",
  "status": "active",
  "last_confirmed_at": "2026-05-18",
  "owner": "Ewalk.ai",
  "notes": "Business Starter + AI Expanded Access + 100GB",
  "created_at": "serverTimestamp"
}
```

## client_portals

用途：客戶入口設定。

```json
{
  "client_id": "hansik-daily-hotpot",
  "enabled": false,
  "allowed_features": ["upload_assets", "review_content"],
  "created_at": "serverTimestamp"
}
```

## settings

用途：系統設定與功能開關。

```json
{
  "key": "voice_ashun_enabled",
  "value": false,
  "description": "控制阿順語音服務是否可用",
  "updated_by": "tim_uid",
  "updated_at": "serverTimestamp"
}
```

建議功能開關：

- `voice_ashun_enabled`
- `meta_auto_publish_enabled`
- `ai_auto_run_enabled`
- `client_portal_enabled`
- `budget_guard_enabled`

## audit_logs

用途：不可修改的稽核紀錄。

```json
{
  "actor_uid": "tim_uid",
  "actor_role": "owner",
  "action": "approve_content",
  "target_type": "content_queue",
  "target_id": "content_001",
  "client_id": "hansik-daily-hotpot",
  "summary": "批准 6/1 FB 貼文",
  "created_at": "serverTimestamp"
}
```

規則：

- 只能新增，不能更新或刪除。
- 重要事件必須寫入。
- 後續可匯出做內部稽核與月報。
