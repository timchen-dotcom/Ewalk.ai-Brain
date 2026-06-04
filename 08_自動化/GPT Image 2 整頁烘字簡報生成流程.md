# GPT Image 2 整頁烘字簡報生成流程

用途：針對 Markdown 內容，先由 AI 擴寫成更豐富的逐頁簡報內容，再把「視覺、文字、圖表、重點」整頁交給 GPT Image 2 生成，最後直接放入 PPTX。

## 核心概念

這是一條實驗型高視覺路線：

```text
Markdown 原稿
-> AI 擴寫成逐頁簡報設計稿
-> 每頁產生 full-slide image prompt
-> GPT Image 2 直接生成含文字、圖表與視覺的整頁 PNG
-> 圖片檢查
-> 打包成純圖像 PPTX
```

和目前穩定版不同：

- 穩定版：GPT Image 2 生無字背景，程式疊正確中文。
- 整頁烘字版：GPT Image 2 直接生整張投影片，包含文字、圖表、重點與視覺。

## 使用時機

- 想要強烈海報感、視覺衝擊、社群感或活動大螢幕效果。
- 文字量不多，但希望畫面更像專業設計稿。
- 可以接受需要人工挑圖、重生與局部修正。
- 用於發想、提案氣氛稿、開場簡報、招商視覺版。

## 不適合

- 合約、報價、數字、日期、法規、課程細節必須 100% 正確的簡報。
- 需要後續在 PowerPoint 裡直接改字。
- 長段文字、複雜表格、密集財務數據。

## 輸入規格

從 Markdown 抽出：

- 簡報目的
- 目標聽眾
- 每頁主標
- 每頁一句核心訊息
- 可視覺化素材：數字、流程、對比、角色、場景、圖表
- 品牌風格：色彩、語氣、畫面質感

## 擴寫規則

每頁輸出以下欄位：

- `page`
- `role`
- `headline`
- `supporting_text`
- `visual_scene`
- `chart_or_structure`
- `must_include_text`
- `avoid`

文字控制原則：

- 每頁最多 1 個主標、1 個副標、3 到 5 個重點。
- 中文短句優先，避免長段落。
- 數字不超過 4 組。
- 圖表以簡單長條圖、流程圖、四象限、環狀系統圖、時間軸為主。

## Image Prompt 原則

給 GPT Image 2 的 prompt 必須包含：

1. 版面：16:9 slide, full presentation page, professional keynote design。
2. 內容：指定主標、副標、重點、圖表。
3. 視覺：場景、人物、產品、光線、品牌色。
4. 字體：clean Traditional Chinese typography, high contrast, large readable text。
5. 限制：不要亂碼、不要英文、不要 logo、不要多餘小字。

## 風險控管

GPT Image 2 直接烘中文字時，可能出現：

- 中文錯字
- 數字錯誤
- 字距或行距不穩
- 圖表標籤不準
- 文字太小或糊掉
- 多出不需要的英文或假 logo

因此流程一定要：

1. 先跑 1 頁 smoke test。
2. 人眼檢查文字與圖表。
3. 再跑完整頁數。
4. 有錯字就重生該頁，不要手動疊字修。

若頁面是基於既有產品圖、人物圖或品牌圖去做編修式生成，另套用：[[../13_SOP流程/AI生成素材結構保真QA SOP|AI生成素材結構保真 QA SOP]]。重點不是只看「夠不夠漂亮」，而是先確保結構、文字、Logo、產品輪廓沒有被模型改壞。

## 長任務續跑與 API 抖動處理

40 頁以上完整簡報容易遇到 API 暫時性錯誤，例如 `502`、`503`、`504` 或短時間 rate limit。

生成程式必須具備：

- 已存在的 `page_XX.png` 自動跳過，不重複燒錢。
- 單頁失敗時可以重新執行同一條 pipeline，從缺頁續跑。
- 對 `429`、`500`、`502`、`503`、`504` 做等待重試，建議至少 5 次。
- 每輪完成後先檢查圖片數量，再打包 PPTX。

執行過程中若遇到 billing hard limit、organization verification 或 API key 問題，不要重試，先回到 OpenAI Platform 修正帳務、認證或金鑰。

## 認證與資料外送規則

此流程會把簡報內容、逐頁 prompt、品牌與文字需求送到 OpenAI Images API 生成圖片。

執行前必須確認：

- `OPENAI_API_KEY` 已放在中央 secret：`/Users/chenjinting/.config/ewalk/openai.env`
- OpenAI organization 已完成 verification。
- 若在 Codex 內執行，使用者已明確同意把該份客戶簡報內容送到 OpenAI Images API。
- 若 Codex 安全審查擋下資料外送，不要用繞路方式執行；改由使用者雙擊 `.command` 或在明確授權後重跑。

## 交付標準

- 最終 PPTX 每頁為一張滿版圖片。
- 每頁文字肉眼可讀。
- 主標、數字、品牌名稱不可錯。
- 每頁只有一個主要訊息。
- 若有任何錯字，標記該頁重生。

## 與穩定版的選擇

| 需求 | 建議 |
|---|---|
| 客戶正式交付、文字必須正確 | 無字背景＋程式疊字 |
| 提案氣氛稿、海報感、視覺衝擊 | 整頁烘字 |
| 要快速探索風格 | 整頁烘字先跑 1 頁 |
| 要可編輯 PPT | 不用純圖像，改走 editable deck |

## STAR Color 實驗位置

```text
Ewalk.ai Brain/01_客戶/STAR Color/03_提案與交付/0520創業大會簡報/pure_visual_deck
```

STAR Color 簡報生成品牌包：

```text
Ewalk.ai Brain/01_客戶/STAR Color/01_品牌資料/簡報生成品牌包
```

生成 GPT Image 2 整頁烘字簡報時，必須讀取：

- `brand_kit.json`
- `STAR_Color_簡報生成品牌規範.md`
- `STAR_Color_0512_Keynote風格基準.md`
- `STAR_Color_0511內容與圖表資料庫.md`
- `prompt_guardrails.md`
- `assets_manifest.json`

2026-05-12 起，STAR Color 0520 創業大會簡報以 `STAR_Color_0520 大會簡報0512.key` 的視覺為主：星河科技舞台、藍紫光流、粉紫髮色能量、AI 染髮機與人物同台。每頁必須有圖形化頁首與頁尾，但頁首 / 頁尾不得放文字、頁碼、口號、QR Code 或假 Logo。內容依 `STAR_Color_0520加盟簡報0511.md` 擴寫與圖表化。

建議新增：

- `gpt_image2_fullslide_prompts.json`
- `generate_gpt_image2_fullslides.py`
- `pack_fullslide_deck.js`
- `fullslide_images/page_XX.png`
- `STAR_Color_0520加盟簡報0511_10頁版_GPT_Image_2_整頁烘字.pptx`

本次已實作檔案：

- `gpt_image2_fullslide_prompts.json`：10 頁整頁烘字 prompt 規格。
- `generate_gpt_image2_fullslides.py`：呼叫 GPT Image 2 生成整頁 PNG。
- `validate_fullslide_deck_pipeline.py`：檢查 prompt、secret、圖片與 PPTX。
- `pack_fullslide_deck.js`：把 `fullslide_images/page_XX.png` 打包成 PPTX。
- `run_gpt_image2_fullslide_pipeline.sh`：完整生成流程。
- `雙擊_1_先測試封面_GPT_Image_2_整頁烘字.command`：只跑第 1 頁 smoke test。
- `雙擊_2_完整生成10頁_GPT_Image_2_整頁烘字.command`：完整生成 10 頁並打包。

2026-05-12 STAR Color 46 頁確認版已跑通：

- 模式：`1536x1024`、`high`、GPT Image 2 整頁烘字。
- 結果：46 張 PNG、46 頁 PPTX。
- 流程中曾遇到 `502`，補上 transient error retry 後成功續跑。
- 最終檔案：`STAR_Color_0520加盟簡報0511_GPT_Image_2_整頁烘字_完整確認版_1536.pptx`。
- 必做人工 QA：逐頁檢查中文字、數字、Logo、政策經費是否有過度保證語氣。

## `/製作簡報` Skill 記錄

已把此流程補入：

- `/Users/chenjinting/.codex/skills/make-presentation/SKILL.md`
- `/Users/chenjinting/.codex/skills/soil-image-deck/SKILL.md`

未來只要使用者說「整頁烘字」、「視覺文字都給 GPT Image 2」、「純視覺簡報但讓圖像模型直接排文字與圖表」，就走 `baked-fullslide` 變體。
