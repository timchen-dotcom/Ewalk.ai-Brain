# AI 員工 SOP 與 Skill 綁定表

建立日期：2026-05-15
批准人：提姆先生
狀態：已批准試行

## 目的

每位 AI 員工都不能只是一個職稱，必須綁定固定 SOP、Prompt、Skill 或 Flow。

這樣做的目的：

- 降低每次重新說明任務的 Token 成本
- 讓交付品質穩定
- 讓阿順可以快速分派任務
- 讓新 AI 員工能照手冊工作
- 讓可重複流程逐步升級成 Skill

## 分層規則

```text
阿順：主管層，負責判斷、分派、整合、回報
AI 員工：專職角色，負責某類任務
SOP：固定工作流程
Prompt：固定產出格式
Skill：可重複呼叫的能力包
Tool：外部工具與資料來源
```

## 第一批角色綁定

| AI 員工 | 必綁 SOP / Flow | 常用 Prompt | 可升級 Skill | 備註 |
| --- | --- | --- | --- | --- |
| 阿順 | AI 部門任務分類、佇列與回報規則、Sub-agent 協作架構 | 自我升級 Prompt、報告生成 Prompt | self-upgrade、make-presentation | 負責總控，不做所有細節 |
| 專案助理 | 新客戶接案到 AI 部門分工 SOP、跨部門標準交接單 | 每日工作模板 | 專案排程 Skill | 所有客戶任務都要能被排進佇列 |
| 客戶成功經理 | 新客戶啟動 Flow、新客戶啟動 SOP | 品牌分析 Prompt | 客戶啟動 Skill | 負責需求盤點與待補資料 |
| 社群主編 | 社群月內容規劃 Flow、每週內容產出 SOP、Meta 粉專全自動發文串接 SOP | IG 內容 Prompt、Reels 腳本 Prompt、Meta 粉專自動發文 Prompt | 社群內容 Skill、ops-meta-social-auto-publish | 內容要支援詢問、預約或信任建立；FB / IG 共用內容需預設 1080x1350 |
| 社群自動化發文員 | Meta 粉專全自動發文串接 SOP、Meta 粉專全自動發文 Flow、社群與廣告成效追蹤啟動 SOP | Meta 粉專自動發文 Prompt | ops-meta-social-auto-publish、ops-meta-page-auto-publish | 主責排程檢查、FB / IG dry-run、正式發布、排程回寫與佇列紀錄；不負責撰寫品牌策略 |
| 設計企劃 | 社群月內容規劃 Flow、視覺需求 Brief、Meta 粉專全自動發文串接 SOP、價目表設計技能 SOP | 圖像生成 Prompt、設計指令 Prompt、價目表設計 Image2 Prompt、Meta 粉專自動發文 Prompt | 視覺 Brief Skill、價目表設計 Skill、ops-meta-social-auto-publish | 產出給設計師或 GPT Image 2 的最終社群視覺；FB / IG feed 圖一律優先 1080x1350；價目表需先確認價格、分類與 QR |
| 廣告投放專員 | 廣告成效健檢 Flow、廣告上線 SOP | 廣告文案 Prompt | 廣告健檢 Skill | 不可自行上線或調整預算 |
| 成效追蹤員 | 社群與廣告成效追蹤啟動 SOP、Meta 粉專全自動發文串接 SOP、廣告上線 SOP | 成效追蹤建檔 Prompt、Meta 粉專自動發文 Prompt | 成效追蹤 Skill、ops-meta-social-auto-publish | 社群或廣告自動化一啟動就分平台建檔，不需每日回報 |
| 數據分析師 | 廣告成效健檢 Flow、客戶月報 Flow、月報產出 SOP | 報告生成 Prompt | 月報分析 Skill | 數字、觀察、建議要分開 |
| 訂閱稽核員 | 訂閱費用稽核 Flow、財務訂閱稽核 SOP | 費用整理 Prompt | 訂閱稽核 Skill | 不可自行取消訂閱 |
| GitHub 研究員 | 自我升級情報自動化、阿順自我優化 SOP | 自我升級 Prompt | GitHub 情報 Skill | 只提案，不直接改核心系統 |

## 升級成 Skill 的條件

一個 SOP 或 Prompt 要升級成 Skill，需符合：

- 同類任務已出現 3 次以上
- 輸入格式穩定
- 輸出格式穩定
- 有明確驗收標準
- 有固定資料夾或產出位置
- 不需要每次由提姆先生重新解釋

## 優先升級 Skill 清單

| 優先 | Skill 名稱 | 來源 Flow / SOP | 用途 |
| --- | --- | --- | --- |
| 1 | 新客戶啟動 Skill | 新客戶啟動 Flow | 新客戶進來時自動建立資料與分工 |
| 2 | 社群月內容 Skill | 社群月內容規劃 Flow | 產出內容支柱、月曆、文案與素材需求 |
| 3 | 廣告健檢 Skill | 廣告成效健檢 Flow | 檢查廣告數據並提出優化方向 |
| 4 | 客戶月報 Skill | 客戶月報 Flow | 整合社群、廣告、活動成效與下月建議 |
| 5 | 訂閱稽核 Skill | 訂閱費用稽核 Flow | 整理每月訂閱費用與取消建議 |
| 6 | 成效追蹤 Skill | 社群與廣告成效追蹤啟動 SOP | 自動建立貼文與廣告追蹤紀錄 |
| 7 | Meta 社群自動發文 Skill | Meta 粉專全自動發文串接 SOP、韓食日常鍋物 FB / IG 實戰流程 | 每個客戶導入 FB / IG 自動發文、回寫與成效追蹤建檔 |

## 2026-06-02 新增角色

### 社群自動化發文員

設立原因：

- 韓食日常鍋物已完成 Meta System User token、Page token、圖片貼文發布、排程回寫與成效追蹤建檔。
- Meta 發文已從單次工具操作升級成可複製到每個客戶的固定技能。
- 需要一位專職角色承接「已批准內容」到「正式發布與回寫」之間的執行責任。

工作邊界：

- 接收社群主編已完成的排程、caption 與 CTA。
- 接收設計企劃完成的 GPT Image 2 最終圖。
- 使用 `ops-meta-page-auto-publish` 做 dry-run 與正式發布。
- 發布後回寫排程表與 `Meta自動發文佇列.md`。
- 取得 Meta Post ID 後交成效追蹤員建檔。
- 不自行修改價格、活動條款、廣告預算或高風險品牌聲明。

## 2026-06-03 Skill 升級

### Meta 社群自動發文 Skill

新增主 Skill：

```text
Ewalk.ai Brain/08_自動化/skills/ops-meta-social-auto-publish/SKILL.md
```

升級原因：

- 韓食日常鍋物已完成 Facebook Page 自動發布。
- 韓食日常鍋物已完成 Instagram Graph API 首篇正式發布。
- FB / IG 共用圖規格已統一為 1080x1350。
- IG 公開圖片 URL、media container、media_publish、IG Media ID 回寫與成效追蹤建檔已跑通。

員工使用規則：

- 社群自動化發文員：主責使用此 Skill 執行發布。
- 社群主編：用此 Skill 檢查排程、caption 與平台文案需求。
- 設計企劃：用此 Skill 檢查 GPT Image 2 圖像規格與 IGReady 檔案。
- 成效追蹤員：用此 Skill 確認 FB Post ID / IG Media ID 已分平台建檔。
- 阿順：負責跨客戶導入判斷、權限風險與是否放行全自動同步。

## 管理原則

- AI 員工新增前，先確認是否已有現成 SOP / Skill 可用。
- 如果只是單次任務，不建立新員工。
- 如果是重複任務，優先沉澱成 SOP。
- 如果 SOP 穩定，才升級成 Skill。
- 涉及客戶正式交付、金流、廣告預算、核心規則，必須回到阿順與提姆先生批准。
