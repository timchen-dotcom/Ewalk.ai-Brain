# 客戶社群更新追蹤系統

建立日期：2026-06-02
主管：阿順
最終決策者：提姆先生
狀態：MVP 已建立，已完成 Meta API 與公開 IG Apify 小批次驗證，公開 IG 週檢排程草稿已建立

## 用途

追蹤 Ewalk.ai 客戶的 IG / FB 是否依約定頻率持續更新，並自動計算：

- 本週已發幾篇
- 本週應發幾篇
- 本週還差幾篇
- 本月已發幾篇
- 本月應發幾篇
- 本月至今應發幾篇
- 本月至今還差幾篇
- 月底前仍需幾篇
- 是否需要提醒客戶或內部社群人員

## 使用時機

- 客戶有固定社群代營運合約
- 客戶需要追蹤髮型師、設計師、分店或品牌帳號發文頻率
- 客戶月報需要加入「內容更新穩定度」
- 阿順要建立每週社群營運巡檢
- 未來要把 IG / FB 更新狀態接進 Command Center

## 系統架構

```text
客戶設定檔
  - 客戶
    - 髮型師 / 設計師
      - IG / FB 帳號
  ↓
資料來源
  - Meta Facebook Page API
  - Instagram Business API
  - 手動 JSON / CSV
  - Apify 公開 IG Scraper
  ↓
發文頻率追蹤腳本
  ↓
週 / 月缺口計算
  ↓
Markdown 報告與 CSV 明細
  ↓
Discord / Email / Command Center / 客戶月報
```

## 第一版可用範圍

目前先支援：

- 使用範例資料 dry-run
- 讀取客戶設定檔
- 讀取客戶底下多位髮型師 / 設計師 IG
- 計算本週與本月缺口
- 產出 Markdown 報告
- 產出 CSV 明細
- 標記正常、稍微落後、嚴重落後

後續升級：

- 接 Facebook Page 發文讀取
- 接 Instagram Business 帳號媒體讀取
- 接 launchd 或 GitHub Actions 排程
- 接 Discord 通知
- 接 Firebase Command Center

## 主要檔案

- 系統說明：`Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/README.md`
- 客戶設定範例：`Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/clients.example.json`
- 範例貼文資料：`Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/sample-posts.json`
- 執行腳本：`Ewalk.ai Brain/腳本/social-frequency-tracker/run-social-frequency-tracker.mjs`
- 報表輸出：`Ewalk.ai Brain/04_報表/社群更新追蹤`
- SOP：`Ewalk.ai Brain/13_SOP流程/客戶社群更新頻率追蹤SOP.md`
- Flow：`Ewalk.ai Brain/08_自動化/營運Flows/客戶社群更新追蹤Flow.md`
- Prompt：`Ewalk.ai Brain/11_Prompt資料庫/客戶社群更新追蹤Prompt.md`

## 執行方式

先用範例資料測試：

```sh
node "Ewalk.ai Brain/腳本/social-frequency-tracker/run-social-frequency-tracker.mjs" \
  --clients "Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/clients.example.json" \
  --sample-posts "Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/sample-posts.json" \
  --output-dir "Ewalk.ai Brain/04_報表/社群更新追蹤" \
  --date "2026-06-02"
```

正式環境未來改成：

```sh
node "Ewalk.ai Brain/腳本/social-frequency-tracker/run-social-frequency-tracker.mjs" \
  --clients "Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/clients.local.json" \
  --output-dir "Ewalk.ai Brain/04_報表/社群更新追蹤"
```

## 權限與安全

- token 不可寫入 Obsidian 文件。
- token 只放 `.env.local` 或安全環境變數。
- 追蹤系統只讀取發文資料，不負責發布貼文。
- 若要對客戶或群組發送提醒，需另接通知流程並設定提醒等級。
- 對外通知、客戶責任歸因、合約異動仍需提姆先生批准。

## 狀態判斷

| 狀態 | 條件 | 處理 |
| --- | --- | --- |
| 正常 | 本週與本月缺口皆為 0 | 不提醒 |
| 稍微落後 | 本週或本月至今缺口為 1 到 2 篇 | 提醒內部社群人員補排 |
| 嚴重落後 | 本週或本月至今缺口達 3 篇以上 | 阿順列入週會與客戶成功追蹤 |
| 待授權 | 缺 API 權限或帳號未授權 | 請客戶成功經理補授權 |
| 待確認 | 資料來源不完整、帳號不可讀、handle 可能錯誤或 API 讀取失敗 | 先人工確認帳號狀態與工具設定 |

## 下一步

1. 用完整 17 個 TheVision / OC hair Vogue 髮型師 IG 跑一次全名單驗證。
2. 若全名單執行時間過長，改成單帳號批次與逾時標記。
3. 啟用公開 IG 每週一 10:00 自動巡檢排程。
4. 將需提醒名單接成 Discord 或 Email 通知。
5. 將週檢摘要併入客戶月報 Flow。

## 2026-06-02 API 驗證

- Facebook Page API 讀取已用韓食日常鍋物驗證成功。
- 驗證設定：`clients.hansik-api.example.json`
- 驗證報告：`Ewalk.ai Brain/04_報表/社群更新追蹤/2026-06-02_韓食日常API驗證_客戶社群更新追蹤報告.md`
- 常駐排程草稿：`com.ewalk.ashun.social-frequency-tracker.plist`
- 尚未啟用系統常駐排程，啟用前需提姆先生確認。

## 2026-06-03 公開 IG 免授權追蹤研究

- 研究文件：`Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/2026-06-03_公開IG帳號免授權追蹤方案研究.md`
- 結論：官方 Meta API 不適合未授權公開帳號追蹤；公開 IG 發文頻率可用 Apify / Bright Data 類 Scraper API 做低風險試點。
- 建議：先用 Apify 追蹤少量公開帳號，只保存發文時間、貼文連結、貼文 ID 與帳號 handle。
- TheVision Olivia 試點設定：`clients.public-ig.example.json`
- Apify 設定 SOP：`公開IG追蹤Apify設定SOP.md`
- 2026-06-03 實測：`thevision_olivia` 可成功讀取公開貼文，最新抓到公開貼文為 2026-01-21。
- 2026-06-03 分層設定：已支援 `客戶 → 髮型師 → IG`，報表顯示 `TheVision / Olivia`。
- 2026-06-03 名單擴充：已建檔 TheVision 11 個設計師 IG、OC hair Vogue 6 個設計師 IG。
- 2026-06-03 小批次驗證：已驗證 5 個帳號，報告為 `Ewalk.ai Brain/04_報表/社群更新追蹤/2026-06-03_公開IG小批次驗證_含owner防呆_客戶社群更新追蹤報告.md`。
- 2026-06-03 owner 防呆：已排除 ownerUsername 不符的貼文，主帳號標註髮型師不計入本人 KPI。
- 2026-06-03 全名單驗證：已用併發版完成 TheVision 11 個帳號與 OC hair Vogue 6 個帳號，共 17 個公開 IG 帳號。
- 2026-06-03 全名單結果：17 個帳號皆需提醒；依新版規則，主帳號標註不計入本人 KPI，owner 不符只做排除註記，不再標成待確認。
- 2026-06-03 交辦版：`Ewalk.ai Brain/04_報表/社群更新追蹤/2026-06-03_TheVision_OC公開IG全名單追蹤交辦.md`。
- 2026-06-03 公開 IG 排程草稿：`com.ewalk.ashun.public-ig-staff-tracker.plist`，預設每週一 10:00 執行，尚未載入啟用。
- 2026-06-03 Codex 內建自動化：已建立並啟用「公開 IG 髮型師週檢」，每週一 10:00 在本工作區執行公開 IG 週檢。

## 已建檔公開 IG 客戶

| 客戶 | 已建檔帳號數 | 狀態 |
| --- | ---: | --- |
| TheVision | 11 | 已完成全名單驗證 |
| OC hair Vogue | 6 | 已完成全名單驗證 |

## 客戶底下髮型師設定格式

```json
{
  "clientId": "thevision",
  "clientName": "TheVision",
  "staff": [
    {
      "staffId": "olivia",
      "staffName": "Olivia",
      "role": "髮型師 / 創始人",
      "platforms": [
        {
          "platform": "instagram",
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
