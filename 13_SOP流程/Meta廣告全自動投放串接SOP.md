# Meta 廣告全自動投放串接 SOP

建立日期：2026-06-03
狀態：Stage 0 dry-run 工具已建立
主管：阿順
最終決策者：提姆先生

## 目的

建立 Ewalk.ai 的 Meta 廣告自動建稿流程，讓廣告投放可以從建稿表、素材、預算、連結、地理投放、API 建立、ID 回寫到成效追蹤逐步自動化。

本 SOP 的核心原則是：系統可以自動建立 `PAUSED` 草稿，但不得未經批准啟用廣告。

## 使用時機

- 客戶要投放 Meta / Facebook / Instagram 廣告。
- 已有正式建稿表、素材、預算與投放期間。
- 需要用 Meta Marketing API 自動建立 Campaign / Ad Set / Creative / Ad。
- 需要把廣告建稿流程標準化，供 AI 廣告投放專員執行。

## 權限需求

正式自動建稿前必須具備：

- Meta Business Portfolio 權限
- 目標 Ad Account 權限
- Facebook Page 權限
- Meta App 已加入 Marketing API
- `META_AD_ACCOUNT_ID`
- `META_ADS_ACCESS_TOKEN`
- `ads_management`
- 若要讀成效，需 `ads_read`
- 若要查 Business 資產，常見需要 `business_management`

## 安全規則

- Access token、App Secret、付款資訊不得寫入 Obsidian、聊天紀錄或公開 repo。
- Graph API Explorer 短期 token 不可作為正式自動投放憑證。
- 所有 API 建立的 Campaign / Ad Set / Ad 預設 `PAUSED`。
- 從 `PAUSED` 改為 `ACTIVE` 需提姆先生另行批准。
- 缺 Final URL、素材、地理投放、預算或廣告帳號授權時，不可呼叫正式建稿 API。

## 標準流程

1. 廣告投放專員完成建稿表。
2. 視覺設計企劃確認素材為最終版，且停用素材不混入。
3. 阿順檢查預算合計與提姆先生批准金額一致。
4. 專案助理補齊 Google 商家導航、外送平台、菜單或私訊入口。
5. 專案助理補齊店址經緯度與投放半徑。
6. 執行廣告帳號檢查。
7. 執行 dry-run，產生 payload 與 blockers。
8. blockers 清空後，建立 `PAUSED` 草稿。
9. 回寫 Campaign / Ad Set / Creative / Ad ID。
10. 提姆先生批准後，才進入啟用流程。
11. 成效追蹤員建立第 1 / 3 / 7 天追蹤任務。

## 韓食日常鍋物 Stage 0 工具

工具資料夾：

```text
Ewalk.ai Brain/腳本/meta-facebook
```

安全設定廣告帳號、Ads token、經緯度與導流連結：

```text
Ewalk.ai Brain/腳本/meta-facebook/set-ads-config.command
```

檢查廣告帳號：

```text
node "Ewalk.ai Brain/腳本/meta-facebook/check-ad-account.mjs"
```

韓食日常鍋物開幕慶廣告 dry-run：

```text
node "Ewalk.ai Brain/腳本/meta-facebook/prepare-hansik-opening-ads.mjs"
```

正式建立 `PAUSED` 草稿：

```text
node "Ewalk.ai Brain/腳本/meta-facebook/prepare-hansik-opening-ads.mjs" --create-paused --approved-by "提姆先生" --confirm-ad-account-id "act_你的廣告帳號ID"
```

## Live Blocker 定義

以下任一項存在，就不可正式建稿：

- 缺 `META_AD_ACCOUNT_ID`
- 缺 `META_ADS_ACCESS_TOKEN`
- 缺 `META_HANSIK_LATITUDE` / `META_HANSIK_LONGITUDE`
- 建稿表 Destination 仍為待補
- 素材檔案不存在
- 預算欄位非有效數字
- 未加 `--approved-by "提姆先生"`
- 未加 `--confirm-ad-account-id`

## 驗收標準

- dry-run JSON 產出成功。
- blockers 可被清楚列出。
- 建稿工具預設不呼叫 Meta API。
- 正式呼叫前有雙重批准旗標。
- 正式建立物件狀態為 `PAUSED`。
- 無任何 token 明文落入文件。
- 可回寫 ID 與進入成效追蹤。
