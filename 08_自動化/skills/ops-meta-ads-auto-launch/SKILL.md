---
name: ops-meta-ads-auto-launch
description: Ewalk.ai Vault skill for setting up Meta Ads automation. Use when a client needs Meta campaign/ad set/ad creative/ad creation, ads_management token validation, ad account checks, PAUSED draft creation, budget guardrails, approval gates, or performance handoff.
---

# ops-meta-ads-auto-launch

## 目的

把 Meta 廣告從人工建稿升級成可控自動化：讀取客戶建稿表、素材、預算與連結，產生 Campaign / Ad Set / Creative / Ad payload，通過檢查後建立 `PAUSED` 草稿。

本 skill 不負責直接啟用廣告。任何付費廣告從 `PAUSED` 改成 `ACTIVE`，都必須由提姆先生批准。

## 必讀文件

- 工具 README：`Ewalk.ai Brain/腳本/meta-facebook/README.md`
- 廣告上線 SOP：`Ewalk.ai Brain/13_SOP流程/廣告上線SOP.md`
- 成效追蹤 SOP：`Ewalk.ai Brain/13_SOP流程/社群與廣告成效追蹤啟動SOP.md`
- 韓食日常開幕慶投放設定：`Ewalk.ai Brain/01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動/2026-06-02_韓食日常鍋物_六月開幕慶正式投放設定.md`

## 啟動條件

任一條件成立就使用本 skill：

- 客戶要求 Meta / Facebook / Instagram 廣告自動建稿。
- 需要用 Meta Marketing API 建立 Campaign、Ad Set、Creative 或 Ad。
- 需要驗證 `META_AD_ACCOUNT_ID`、`META_ADS_ACCESS_TOKEN` 或 `ads_management` 權限。
- 需要把廣告建稿表轉成 dry-run payload。
- 需要建立 `PAUSED` 廣告草稿。

## 權限與憑證

正式廣告自動化至少需要：

- Meta Business Portfolio 權限
- 目標 Ad Account 權限
- Facebook Page 權限
- Meta App 已加入 Marketing API
- `META_AD_ACCOUNT_ID`
- `META_ADS_ACCESS_TOKEN`
- 權限：`ads_management`
- 若要讀成效：`ads_read`
- 常見 Business 資產查詢：`business_management`

禁止：

- 使用 Graph API Explorer 短期 token 作為正式自動投放憑證
- 把 token、App Secret、付款資訊寫進 Obsidian、聊天或公開 repo
- 未經批准將廣告設為 `ACTIVE`
- 缺少 Final URL、地理投放、素材或預算時強行建稿

## 標準流程

1. 讀取客戶正式投放設定與建稿表。
2. 確認素材為最終版，且沒有停用版本混入。
3. 確認預算合計不超過提姆先生批准金額。
4. 確認 Final URL、Google 商家導航、外送平台或私訊入口已補齊。
5. 確認店址經緯度與投放半徑。
6. 執行 `check-ad-account.mjs`。
7. 執行建稿 dry-run。
8. 所有 blocker 清空後，建立 `PAUSED` 草稿。
9. 回寫 Campaign / Ad Set / Creative / Ad ID。
10. 等提姆先生批准後，再由人工或二階段工具啟用。

## 韓食日常鍋物工具

安全設定廣告帳號、Ads token、經緯度與導流連結：

```text
Ewalk.ai Brain/腳本/meta-facebook/set-ads-config.command
```

檢查廣告帳號：

```text
node "Ewalk.ai Brain/腳本/meta-facebook/check-ad-account.mjs"
```

開幕慶廣告 dry-run：

```text
node "Ewalk.ai Brain/腳本/meta-facebook/prepare-hansik-opening-ads.mjs"
```

建立 PAUSED 草稿：

```text
node "Ewalk.ai Brain/腳本/meta-facebook/prepare-hansik-opening-ads.mjs" --create-paused --approved-by "提姆先生" --confirm-ad-account-id "act_你的廣告帳號ID"
```

## 驗收標準

- dry-run JSON 已產生。
- live blockers 全數清空。
- 廣告帳號檢查成功。
- 所有建稿物件預設 `PAUSED`。
- 沒有 token 明文出現在文件、聊天或輸出。
- 建立成功後有 ID 回寫紀錄。
- 成效追蹤員收到第 1 / 3 / 7 天追蹤任務。
