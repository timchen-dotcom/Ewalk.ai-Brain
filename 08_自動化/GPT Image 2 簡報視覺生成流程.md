# GPT Image 2 簡報視覺生成流程

用途：把 `/製作簡報` 的純視覺簡報升級為「GPT Image 2 生主視覺 + 程式疊正確中文 + PPTX 打包」。

## 使用時機

- 客戶簡報需要更強視覺質感。
- 純文字版型太像模板，需要生成更有品牌感的背景。
- 中文、數字、價格與品牌資訊必須正確，不能完全交給圖片模型烘字。

## 推薦模式

採用混合交付版：

```text
Markdown 簡報稿
-> 每頁 image prompt
-> GPT Image 2 生成無字背景
-> 本機程式疊中文標題、數字、卡片與頁碼
-> 產生 PNG
-> 打包成 PPTX
```

不建議預設使用「AI 直接生成整張含中文字投影片」，因為中文、數字與排版可能出錯。

## STAR Color 0520 已串接位置

資料夾：

```text
Ewalk.ai Brain/01_客戶/STAR Color/03_提案與交付/0520創業大會簡報/pure_visual_deck
```

核心檔案：

- `gpt_image2_prompts.json`：10 頁 GPT Image 2 無字背景 prompt。
- `generate_gpt_image2_backgrounds.py`：呼叫 OpenAI Images API，輸出 `ai_backgrounds/page_XX.png`。
- `generate_star_color_visual_images.py`：優先讀取 `ai_backgrounds/page_XX.png`，再疊中文與版型。
- `pack_star_color_visual_deck.js`：把 `images/page_XX.png` 打包成 PPTX。
- `validate_visual_deck_pipeline.py`：檢查 secret、背景圖、最終 PNG 與 PPTX 結構。
- `雙擊_1_先測試封面_GPT_Image_2.command`：先生成第 1 頁，確認權限與風格。
- `雙擊_2_完整生成10頁_GPT_Image_2.command`：完整生成 10 頁並打包。

## 認證與 Secret

OpenAI API key 不放客戶交付資料夾。

目前中央 secret 位置：

```text
/Users/chenjinting/.config/ewalk/openai.env
```

專案資料夾中的 `.env` 只保留提示文字，不放 key。

`gpt-image-2` 需要 OpenAI organization verification。如果 log 出現：

```text
NEEDS_ORG_VERIFICATION
```

請到：

```text
https://platform.openai.com/settings/organization/general
```

完成 Verify Organization，等待最多 15 分鐘後再跑。

## 執行流程

先測試 key 設定，不打 image API：

```bash
python3 generate_gpt_image2_backgrounds.py --check-auth
```

先確認 prompt，不打 API、不花費：

```bash
python3 generate_gpt_image2_backgrounds.py --dry-run
```

建議先只生成封面：

```bash
./雙擊_1_先測試封面_GPT_Image_2.command
```

封面成功後，再完整生成 10 頁：

```bash
./雙擊_2_完整生成10頁_GPT_Image_2.command
```

如果只想用命令列生成指定頁：

```bash
python3 generate_gpt_image2_backgrounds.py --only 1,5,10 --force
```

手動疊字並重產 PNG：

```bash
python3 generate_star_color_visual_images.py
```

手動打包 PPTX：

```bash
NODE_PATH=/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
pack_star_color_visual_deck.js
```

驗證整體輸出：

```bash
python3 validate_visual_deck_pipeline.py --require-ai-backgrounds
```

## 品質檢查

- AI 背景不得出現可讀文字、亂碼、假中文、logo 或浮水印。
- 中文標題、數字、價格、品牌名稱必須由疊字程式產生。
- 每頁保持一個核心訊息。
- 深色頁需確認文字對比足夠；淺色頁需確認背景不搶主標。
- 最終 PPTX 內每頁應是一張滿版圖片。

2026-06-04 起，若背景圖是由既有品牌圖、商品圖或人物圖編修而來，額外套用：[[../13_SOP流程/AI生成素材結構保真QA SOP|AI生成素材結構保真 QA SOP]]。先比對主體輪廓、品牌元素、文字與數字是否保真，再決定是否進入疊字與打包。

## 後續抽象化

可將這套流程抽進 `soil-image-deck`：

- 新增 `scripts/generate_gpt_image2_backgrounds.py`
- 新增 `references/gpt-image-2-workflow.md`
- 在 `/製作簡報` 中加入 `AI 視覺版` 路由

目前因已安裝 skill 資料夾未開放寫入，先以 STAR Color 專案流程落地。
