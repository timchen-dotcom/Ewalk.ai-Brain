window.EWALK_APPROVAL_QUEUE = {
  "mode": "dry-run",
  "project_id": "ewalk-ai-system-prod",
  "generated_at": "2026-06-07T15:30:00.000Z",
  "summary": {
    "total": 6,
    "pending": 5,
    "approved_but_not_executed": 1,
    "approved": 0,
    "rejected": 0,
    "high_risk": 4
  },
  "approvals": [
    {
      "approval_id": "approval_20260607_jiayu_line_cta_followup_b14a",
      "target_type": "client_channel",
      "target_id": "jiayu-line-cta-followup",
      "client_id": "jiayu-window-film",
      "client_name": "嘉昱汽車/建築隔熱膜",
      "category": "client_channel",
      "permission_level": "L3",
      "status": "approved_but_not_executed",
      "requested_by": "ashun",
      "final_approver": "提姆先生",
      "title": "嘉昱隔熱膜 LINE 優先 CTA 承接流程進入待辦追蹤",
      "request_summary": "提姆先生批准將嘉昱 LINE 優先 CTA 承接流程整理進 Command Center 本機待辦追蹤。",
      "business_value": "讓嘉昱夏季隔熱膜快打方案的 LINE 承接流程可被追蹤，先沉澱客服分流與待確認事項。",
      "risk_summary": "本項只做本機 mock action queue 追蹤；不得延伸為正式廣告上線、正式發文、Firebase 寫入或 AI 接正式客戶通道。",
      "reject_impact": "若不追蹤，嘉昱 LINE CTA 流程仍停留在聊天紀錄與文件中，後續較難接上正式上線檢查。",
      "rollback_plan": "移除本機 dry-run queue 項目即可；不影響正式 Firebase、Meta、LINE 或客戶資料。",
      "ashun_recommendation": "保留為已批准未執行，下一步只由 Codex 主窗口整理本機 dry-run 與文件，不進正式外部操作。",
      "requested_at": "2026-06-07T15:30:00.000Z",
      "expires_at": "2026-06-14T15:30:00.000Z",
      "source_refs": [
        "Ewalk.ai Brain/08_自動化/新筆電接手驗收/2026-06-07_B14ACommandCenterMockQueue回填.md"
      ]
    },
    {
      "approval_id": "approval_20260607_meta_hansik_0609_publish_001",
      "target_type": "content_queue",
      "target_id": "meta-fb-hansik-20260609-seafood-tofu-soup",
      "client_id": "hansik-daily-hotpot",
      "client_name": "韓食日常鍋物",
      "category": "publish",
      "permission_level": "L4",
      "status": "pending",
      "requested_by": "ashun",
      "final_approver": "提姆先生",
      "title": "韓食日常鍋物 6/9 貼文正式發布到 Facebook",
      "request_summary": "是否允許韓食日常鍋物 2026-06-09 貼文進入正式 Facebook 發布流程。",
      "business_value": "可驗證韓食日常鍋物內容佇列從內部準備走向正式發文的批准流程。",
      "risk_summary": "會對外出現在 Facebook 粉專，屬於正式外部副作用；目前尚未批准，不能執行。",
      "reject_impact": "內容保留在內部候選佇列，不對外發布。",
      "rollback_plan": "若未來批准後發出且需撤回，只能由人工到粉專刪除或隱藏貼文。",
      "ashun_recommendation": "目前維持 pending，等待提姆先生逐案批准；B14/B15 不執行正式發布。",
      "requested_at": "2026-06-07T15:30:00.000Z",
      "expires_at": "2026-06-14T15:30:00.000Z",
      "source_refs": [
        "Ewalk.ai Brain/08_自動化/新筆電接手驗收/2026-06-07_B14ACommandCenterMockQueue回填.md"
      ]
    },
    {
      "approval_id": "approval_20260602_meta_hansik_publish_001",
      "target_type": "content_queue",
      "target_id": "meta-fb-hansik-20260518-004",
      "client_id": "hansik-daily-hotpot",
      "client_name": "韓食日常鍋物",
      "category": "publish",
      "permission_level": "L4",
      "status": "pending",
      "requested_by": "ashun",
      "final_approver": "提姆先生",
      "title": "韓食日常鍋物品牌日常貼文進入正式發文流程",
      "request_summary": "允許已審過的品牌日常內容進入 Meta 發文工具執行。",
      "business_value": "用韓食做全自動發文樣板，驗證 Ewalk.ai 客戶社群營運流程。",
      "risk_summary": "會對外出現在 Facebook 粉專，消費者看得到。",
      "reject_impact": "內容維持已批准待發布，不會對外發布。",
      "rollback_plan": "若發出後需要撤回，只能人工到粉專刪除或隱藏貼文。",
      "ashun_recommendation": "先不要自動發，等 Meta 發文工具與標示規則再做一次最終批准。",
      "requested_at": "2026-06-02T15:46:49.929Z",
      "expires_at": "2026-06-09T15:46:49.929Z",
      "source_refs": [
        "Ewalk.ai Brain/01_客戶/韓食日常鍋物/02_活動與內容/Meta自動發文佇列.md"
      ]
    },
    {
      "approval_id": "approval_20260602_github_research_daily_001",
      "target_type": "automation",
      "target_id": "github-self-upgrade-daily-research",
      "client_id": null,
      "client_name": "Ewalk.ai 系統",
      "category": "scheduled_research",
      "permission_level": "L3",
      "status": "pending",
      "requested_by": "ashun",
      "final_approver": "提姆先生",
      "title": "每日 04:00 GitHub 自我升級情報研究",
      "request_summary": "讓 GitHub 研究員定期整理 AI 工具、蒸餾、省 token、Agent 工作流等高討論內容。",
      "business_value": "把外部開源討論轉成 Ewalk.ai 的優化建議，減少提姆先生自己追資訊的時間。",
      "risk_summary": "會消耗自動化執行成本；若接 Discord 或 Email，會產生通知輸出。",
      "reject_impact": "維持人工研究，需要時再手動叫阿順查。",
      "rollback_plan": "停用排程即可，不會影響既有客戶資料。",
      "ashun_recommendation": "先做每週一次摘要，比每日跑更省 token；穩定後再改每日。",
      "requested_at": "2026-06-02T15:46:49.929Z",
      "expires_at": "2026-06-16T15:46:49.929Z",
      "source_refs": [
        "Ewalk.ai Brain/08_自動化/GitHub自我升級情報自動化規則.md"
      ]
    },
    {
      "approval_id": "approval_20260602_firebase_blaze_storage_001",
      "target_type": "system_setting",
      "target_id": "firebase_blaze_storage_enablement",
      "client_id": null,
      "client_name": "Ewalk.ai 系統",
      "category": "billing",
      "permission_level": "L4",
      "status": "pending",
      "requested_by": "ashun",
      "final_approver": "提姆先生",
      "title": "Firebase Blaze / Storage 啟用",
      "request_summary": "啟用正式 Storage，讓客戶素材可進雲端儲存與權限控管。",
      "business_value": "未來客戶素材、圖片、PDF、報表可以統一歸檔，Command Center 可直接引用。",
      "risk_summary": "會進入付費方案，若沒有預算警示與用量控管可能產生費用。",
      "reject_impact": "素材先維持本機與 Obsidian 檔案路徑管理。",
      "rollback_plan": "設定預算警示、限制 Storage rules；必要時停用新上傳流程。",
      "ashun_recommendation": "目前先不批准，等主機與預算監控建好後再開。",
      "requested_at": "2026-06-02T15:46:49.929Z",
      "expires_at": "2026-07-02T15:46:49.929Z",
      "source_refs": [
        "Ewalk.ai Brain/08_自動化/Firebase導入與系統優化路線圖.md"
      ]
    },
    {
      "approval_id": "approval_20260602_thevision_meta_budget_001",
      "target_type": "ad_budget",
      "target_id": "thevision-meta-monthly-budget",
      "client_id": "thevision",
      "client_name": "TheVision",
      "category": "ad_budget",
      "permission_level": "L4",
      "status": "pending",
      "requested_by": "ashun",
      "final_approver": "提姆先生",
      "title": "TheVision Meta 廣告月預算上限設定",
      "request_summary": "建立 TheVision 社群與廣告代操樣板時，先定義可被系統追蹤的預算上限。",
      "business_value": "讓廣告投放專員之後可以產出建議與月報，不會散在聊天紀錄裡。",
      "risk_summary": "若直接套用到廣告帳戶，會影響實際投放成本。",
      "reject_impact": "只保留內容與策略規劃，不進入預算追蹤。",
      "rollback_plan": "預算設定僅作內部紀錄；正式廣告帳戶仍需人工操作與再次批准。",
      "ashun_recommendation": "先做內部建議，不接正式廣告帳戶。",
      "requested_at": "2026-06-02T15:46:49.929Z",
      "expires_at": "2026-06-16T15:46:49.929Z",
      "source_refs": [
        "Ewalk.ai Brain/01_客戶/TheVision"
      ]
    }
  ]
};
