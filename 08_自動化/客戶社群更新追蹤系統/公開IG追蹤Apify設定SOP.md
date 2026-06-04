# 公開 IG 追蹤 Apify 設定 SOP

建立日期：2026-06-03
主管：阿順
最終決策者：提姆先生
狀態：腳本已支援，APIFY_TOKEN 已於本機設定，已完成公開 IG 小批次真實抓取

## 用途

讓 Ewalk.ai 不取得客戶 Meta 授權，也能針對公開 IG 帳號做每週發文頻率巡檢。

適用例子：

- `thevision_olivia`
- 設計師公開 IG
- 客戶公開品牌 IG
- 對標帳號公開貼文頻率觀察

## 資料來源

使用 Apify Instagram Scraper 類 Actor。

目前腳本預設 Actor：

```text
apify~instagram-scraper
```

可用環境變數改成其他相容 Actor：

```env
APIFY_INSTAGRAM_ACTOR=prodiger~instagram-scraper
```

## 安全原則

- 只追公開帳號。
- 不追私人帳號。
- 不抓私訊。
- 不抓粉絲名單。
- 不抓留言明細。
- 報告只保存發文時間、貼文連結、貼文 ID、帳號 handle。
- Apify token 不可寫入 Obsidian 文件。

## 設定步驟

1. 到 Apify 建立 API token。
2. 在本機建立：

```text
Ewalk.ai Brain/腳本/social-frequency-tracker/.env.local
```

3. 內容填入：

```env
APIFY_TOKEN=你的_apify_token
APIFY_INSTAGRAM_ACTOR=apify~instagram-scraper
APIFY_INSTAGRAM_RESULTS_LIMIT=12
APIFY_TIMEOUT_SECONDS=180
```

4. 執行公開 IG 週檢：

```sh
node "Ewalk.ai Brain/腳本/social-frequency-tracker/run-social-frequency-tracker.mjs" \
  --clients "Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/clients.public-ig.example.json" \
  --env-file "Ewalk.ai Brain/腳本/social-frequency-tracker/.env.local" \
  --output-dir "Ewalk.ai Brain/04_報表/社群更新追蹤" \
  --label "公開IG週檢"
```

也可以雙擊：

```text
Ewalk.ai Brain/腳本/social-frequency-tracker/run-public-ig-tracker.command
```

## 帳號設定

設定檔：

```text
Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/clients.public-ig.example.json
```

目前試點帳號：

```json
{
  "clientName": "TheVision",
  "staff": [
    {
      "staffName": "Olivia",
      "role": "髮型師 / 創始人",
      "platforms": [
        {
          "displayName": "Olivia IG",
          "source": "apify_instagram_public",
          "handle": "thevision_olivia",
          "profileUrl": "https://www.instagram.com/thevision_olivia/",
          "targetPerWeek": 3,
          "targetPerMonth": 12,
          "resultsLimit": 12
        }
      ]
    }
  ]
}
```

## 狀態說明

| 狀態 | 意義 | 處理 |
| --- | --- | --- |
| 正常 | 已達本週與本月至今目標 | 歸檔 |
| 稍微落後 | 缺 1 到 2 篇 | 提醒社群主編或客戶成功 |
| 嚴重落後 | 缺 3 篇以上 | 阿順列入週會追蹤 |
| 待設定 | 尚未設定 APIFY_TOKEN 或工具設定 | 補本機 `.env.local` |
| 待確認 | 帳號不可讀、非公開、handle 錯誤或 API 讀取失敗 | 確認帳號狀態與工具設定 |

## Owner 防呆規則

公開 IG 外部抓取工具可能回傳被標註、合作、主帳號或相關帳號的貼文，因此每次抓取後必須檢查貼文 `ownerUsername`。

系統規則：

- 若 `ownerUsername` 等於目標 handle，貼文可納入 KPI。
- 若 `ownerUsername` 為空，先保留，但需要持續觀察工具回傳品質。
- 若 `ownerUsername` 不等於目標 handle，該貼文不納入 KPI。
- 主帳號標註髮型師不算髮型師本人發文。
- owner 不符只做排除註記，不會因此標記為 `待確認`。
- 若排除後本人帳號本週未達標，依缺口判定為 `稍微落後` 或 `嚴重落後`。
- 報表會在 `需要處理` 區塊列出被排除的 owner，方便追蹤資料來源品質。

## 驗收標準

- 能讀取 `thevision_olivia` 最近公開貼文。
- 能計算本週與本月發文數。
- 報告不包含敏感資料。
- 失敗時能清楚顯示待設定或待確認。

## 2026-06-03 實測紀錄

- `thevision_olivia` 公開貼文讀取成功。
- 報告：`Ewalk.ai Brain/04_報表/社群更新追蹤/2026-06-03_公開IG實測_客戶社群更新追蹤報告.md`
- 結果：本週已發 0 篇，本月已發 0 篇，最新抓到公開貼文為 2026-01-21。
- 狀態：嚴重落後。

## 2026-06-03 分層報表

- 已支援 `客戶 → 髮型師 → IG`。
- 報告：`Ewalk.ai Brain/04_報表/社群更新追蹤/2026-06-03_客戶髮型師公開IG實測_客戶社群更新追蹤報告.md`
- CSV 已包含 `staffId`、`staffName`、`role` 欄位。

## 2026-06-03 小批次驗證

- 已建立 TheVision 與 OC hair Vogue 的髮型師 IG 分層設定。
- 小批次先驗證 5 個帳號：Olivia、Nana、Luke、Akiwang、Lyra。
- 報告：`Ewalk.ai Brain/04_報表/社群更新追蹤/2026-06-03_公開IG小批次驗證_含owner防呆_客戶社群更新追蹤報告.md`
- 發現：Olivia、Nana、Akiwang 有 owner 不符資料，系統已排除不屬於目標 handle 的貼文。
- 2026-06-03 規則確認：提姆先生決定「主帳號標註髮型師不算本人發文」，因此 owner 不符不再造成 `待確認`，而是排除後照缺口判定落後狀態。
