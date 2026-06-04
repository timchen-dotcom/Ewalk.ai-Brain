# 2026-06-03 TheVision / OC hair Vogue 髮型師 IG 名單建檔

執行日期：2026-06-03
主管：阿順
最終決策者：提姆先生
狀態：名單已建檔，尚未全量抓取

## 本次目標

將提姆先生提供的 TheVision 與 OC hair Vogue 髮型師公開 IG 帳號，整理成客戶底下的設計師追蹤清單。

## 建檔位置

- `Ewalk.ai Brain/08_自動化/客戶社群更新追蹤系統/clients.public-ig.example.json`

## 建檔結果

| 客戶 | 髮型師數 | IG 帳號數 |
| --- | ---: | ---: |
| TheVision | 11 | 11 |
| OC hair Vogue | 6 | 6 |

## TheVision

- Olivia：`thevision_olivia`
- Vanilla：`thevision_vanilla1009`
- Nana：`thevision_nana`
- Nico：`thevision_nico`
- Mandy：`thevision_mandy`
- Molly：`thevision_molly`
- Luke：`thevision_luke`
- KK：`kk_thevision`
- Hsu Mo：`thevision_hsu.mo`
- Luta：`thevision_luta`
- Berry：`thevision_berry`

## OC hair Vogue

- Akiwang：`oc_akiwang`
- Eide：`oc_eide_`
- Lyra：`oc_lyra`
- Xmei：`oc_xmei`
- Orange：`oc_orange071`
- Ron：`ron.dailyy_oc`

## 頻率設定

目前先統一：

- 每週目標：3 篇
- 每月目標：12 篇
- 每次最多抓取：12 筆公開貼文

後續若不同髮型師有不同營運目標，可個別調整 `targetPerWeek`、`targetPerMonth` 與 `resultsLimit`。

## 成本控管

本次只建檔，未全量呼叫 Apify。

如果全量跑一次：

```text
17 個帳號 × 12 筆 = 最多 204 results
```

以目前 Actor 顯示的 `$2.70 / 1,000 results` 粗估：

```text
204 / 1000 × 2.70 = 約 US$0.55 / 次
```

正式每週排程前，建議先做 3 到 5 個帳號的小批次驗證。

## 下一步

1. 選 3 到 5 個帳號做小批次抓取測試。
2. 確認每個帳號是否公開且可讀。
3. 再啟用 TheVision / OC hair Vogue 全量週檢。
4. 將嚴重落後名單接入 Discord 提醒草稿。
