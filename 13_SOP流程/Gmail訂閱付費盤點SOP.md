# Gmail 訂閱付費盤點 SOP

建立日期：2026-05-18
負責角色：財務助理
主管：阿順
最終決策者：提姆先生

## 目的

每月從 Gmail 找出公司可能正在付費的訂閱服務，整理成財務支出表，協助提姆先生判斷哪些工具要保留、降級或取消。

## 使用時機

- 提姆先生要求盤點訂閱費。
- 每月結帳前檢查固定支出。
- 公司新增 AI 工具、設計工具、廣告工具後。
- 懷疑有不必要訂閱持續扣款時。

## 搜尋範圍

建議搜尋近 2 年信件，排除垃圾信與垃圾桶。

主要關鍵字：

```text
subscription OR invoice OR receipt OR payment OR billing OR renewal
訂閱 OR 續訂 OR 發票 OR 收據 OR 付款 OR 帳單 OR 月費 OR 年費 OR 扣款
```

常見來源：

- OpenAI / ChatGPT
- Anthropic / Claude
- Google / Gemini / Workspace / Ads
- Adobe
- Canva
- Figma
- Notion
- Vercel
- GitHub
- Stripe
- PayPal
- Paddle
- Lemon Squeezy
- Xsolla
- Apple
- Meta / Facebook / Instagram
- LINE
- TikTok

## 執行步驟

1. 搜尋候選信件。
2. 不刪信、不封存、不取消訂閱。
3. 對候選信件套用 `Ewalk財務/訂閱候選` 標籤。
4. 先產出候選清單。
5. 逐封確認服務名稱、金額、週期、最近扣款日。
6. 先分財務性質，再分必要性。
7. 對可取消或可降級項目提出建議。
8. 提交給提姆先生審核。
9. 只有在提姆先生批准後，才進行取消或降級。

## 財務分類

盤點時先拆成三類，避免誤判：

| 分類 | 說明 | 範例 | 處理方式 |
| --- | --- | --- | --- |
| 公司工具成本 | 公司自用 SaaS 或 AI 工具 | Google Workspace、Claude、Obsidian、Grok | 納入固定營運成本 |
| API / 用量制支出 | 依使用量或儲值扣款 | OpenAI API、Google Cloud、Gemini API | 設定預算警示與用量追蹤 |
| 客戶廣告費 | 替客戶投放產生的媒體費 | Meta Ads、Google Ads、TikTok Ads | 獨立做客戶對帳，不列入工具訂閱 |

## 最終輸出格式

```text
服務名稱｜財務分類｜付款週期｜金額｜幣別｜最近扣款日｜是否必要｜建議動作｜取消入口｜備註
```

## 判斷標準

### 必要保留

- 直接支撐公司交付。
- 有客戶專案正在使用。
- 停用會造成營運中斷。

### 可降級

- 使用頻率下降。
- 只有少數功能需要。
- 有更便宜替代方案。

### 可取消

- 近 30 至 60 天沒有使用。
- 功能重複。
- 沒有明確負責人。
- 已被其他工具取代。

## 權限與安全

- 不讀取與任務無關的私人信件。
- 不輸出完整信用卡資訊。
- 不輸出驗證碼、token、密碼。
- 不自動修改付款設定。
- 不自動取消訂閱。
- 客戶廣告費不得直接視為公司工具浪費，需回到客戶應收款對帳。
