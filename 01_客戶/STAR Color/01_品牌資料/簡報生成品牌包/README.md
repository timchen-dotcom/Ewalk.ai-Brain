# STAR Color 簡報生成品牌包

用途：供 STAR Color 0520 創業大會與後續簡報生成使用，讓 AI 生成投影片時固定遵守品牌色彩、Logo、產品圖、版面語氣與禁忌。

## 使用方式

生成簡報前，先讀：

1. `STAR_Color_簡報生成品牌規範.md`
2. `STAR_Color_0512_Keynote風格基準.md`
3. `STAR_Color_0511內容與圖表資料庫.md`
4. `STAR_Color_加盟資訊系統資料庫.md`
5. `STAR_Color_機器廠商出場資料庫.md`
6. `STAR_Color_廣告投放數據資料庫.md`
7. `STAR_Color_許文元理事長政策經費資料庫.md`
8. `brand_kit.json`
9. `prompt_guardrails.md`
10. `assets_manifest.json`
11. `STAR_Color_門店設計資產資料庫.md`

若是 GPT Image 2 整頁烘字簡報，prompt 必須套用 `brand_kit.json` 內的 `image_generation_prompt_guardrails`。

## 資料夾

- `assets/logo`：正式 Logo 檔放這裡。
- `assets/product`：產品圖、機器圖、App UI、店面照放這裡。
- `assets/reference`：既有簡報與素材總覽抽出的參考圖。
- `assets/reference/keynote_0512_current_style`：提姆目前做到的 0512 Keynote 視覺基準與抽出素材。
- `assets/reference/machine_vendor_keynote`：機器廠商出場 Keynote 來源檔與抽出素材。
- `assets/reference/franchise_system_pptx`：加盟體系資訊系統架構簡報來源檔。
- `assets/reference/ad_performance_pptx`：廣告投放數據簡報來源檔與抽出媒體。
- `assets/reference/chairman_policy_pdf`：許文元理事長政策、認證與經費來源 PDF。
- `assets/reference/store_design`：STAR Color 店觀設計、門面招牌、玻璃腰帶、NT$999 立牌與室內模擬圖。
- `assets/generated_style_samples`：已滿意的 GPT Image 2 風格樣張。

## 目前狀態

- CIS 色彩規範：已建立。
- 0512 Keynote 視覺基準：已建立，後續簡報以此風格為主。
- 每頁頁首 / 頁尾圖形規範：已建立，頁首與頁尾不放文字。
- 0511 內容與圖表資料庫：已建立，可作為擴寫、數據與圖表來源。
- 機器廠商出場資料庫：已建立，安排於 AI 染髮機章節，供廠商上台介紹機器與雲端配色系統使用。
- 加盟資訊系統資料庫：已建立，供後半段加盟、數位營運、分潤系統使用。
- 廣告投放數據資料庫：已建立，安排於加盟系統後、Ewalk.ai 行銷大腦前，供廣告投手專家段落使用。
- 許文元理事長政策經費資料庫：已建立，安排於結尾行動頁前，供政策、認證、經費來源與行動提醒段落使用。
- 門店設計資產資料庫：已建立，供微型門店、店型空間、加盟落地與實體門面可信度段落使用。
- 整頁烘字 prompt guardrails：已建立。
- 正式透明 Logo：已補。
- AI 染髮機正式產品圖：已補。
- 目前可用素材：0512 Keynote 抽圖、素材總覽、既有 PPTX 抽圖、前 5 頁 GPT Image 2 樣張。
