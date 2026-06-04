# Higgsfield CLI 安裝與最小回歸驗證 SOP

## 目的

把 Higgsfield CLI 納入 Ewalk.ai 的 AI 視覺與短影音生產工具鏈，讓產品棚拍、素材變體、Marketplace 商品卡、短影音生成與 Hook 分析可以被 Codex/阿順呼叫、追蹤與驗收。

## 使用時機

- 客戶需要快速產出產品圖、情境圖、Hero Banner、社群輪播、廣告靜態素材。
- 需要把品牌素材轉成短影音、UGC、開箱、產品展示或 TV spot 概念片。
- 需要訓練固定人物形象或品牌代言人，並跨素材保持一致。
- 需要在正式投放前評估影片 Hook、注意力與留存風險。

## 官方依據

- 官方 CLI 頁面：<https://higgsfield.ai/cli>
- 官方 CLI npm 套件：`@higgsfield/cli`
- 官方 agent skills repo：<https://github.com/higgsfield-ai/skills>

## 本機安裝位置

- CLI wrapper：`.tools/bin/higgsfield`、`.tools/bin/higgs`
- CLI 套件：`.tools/higgsfield-cli/`
- Higgsfield 登入資料：`.higgsfield-home/`
- Codex plugin：`~/.codex/plugins/higgsfield`
- 串接 log：`higgsfield-cli-link.log`

## 安裝流程

> 目前本機 npm cache 有權限問題，因此 Ewalk.ai 安裝腳本不依賴 `npm install -g`，改用官方 npm tarball 與 GitHub release binary 安裝到專案 `.tools`，避免使用 sudo 或污染全域環境。

1. 雙擊 `安裝HiggsfieldCLI.command`。
2. 驗收畫面需看到 `higgsfield 0.1.40` 或更新版本。
3. 安裝完成後不要立刻生成素材，先進行登入串接。

## 登入串接流程

1. 雙擊 `串接HiggsfieldCLI.command`。
2. 瀏覽器開啟 Higgsfield 授權頁後，使用公司要綁定的帳號登入。
3. 等待終端機回到 `account status`，確認 email、plan、credits 可讀取。
4. 把結果保留在 `higgsfield-cli-link.log`，作為日後稽核紀錄。

## 最小回歸驗證

每次安裝、更新或換機後至少驗證下列項目：

1. CLI 版本
- `.tools/bin/higgsfield version`
- 驗收：能回傳版本與 build 資訊。

2. 登入狀態
- `.tools/bin/higgsfield account status`
- 驗收：能看到帳號、方案與 credits。

3. 模型清單
- `.tools/bin/higgsfield model list`
- 驗收：能列出可用模型，不出現 401 或 session expired。

4. 成本試算
- `.tools/bin/higgsfield generate cost nano_banana_2 --prompt "minimal product photo test"`
- 驗收：只回傳預估 credits，不建立生成工作。

5. 小型生成測試
- 只有在提姆先生批准可消耗 credits 後才執行：
  `.tools/bin/higgsfield generate create z_image --prompt "minimal test image" --wait`
- 驗收：stdout 回傳結果 URL，並記錄花費。

## 權限與風險控管

- 任何會消耗 Higgsfield credits 的生成、訓練、影片工作，都需要提姆先生批准。
- 客戶真人照片、產品未公開素材、品牌識別檔需先確認可上傳到 Higgsfield。
- 對外發布、投放廣告、使用人物肖像、生成代言人內容前，需經客戶與提姆先生確認。
- Soul ID 類人物訓練要建立素材來源紀錄，避免未授權肖像混入。
- 若出現 `Session expired`、401 或登入失效，先重新跑 `串接HiggsfieldCLI.command`。

## 常用任務對應

| 任務 | 優先工具 |
|---|---|
| 一般圖片 / 影片生成 | `higgsfield-generate` |
| 產品棚拍 / 情境照 / Hero Banner | `higgsfield-product-photoshoot` |
| Marketplace 主圖 / 副圖 / A+ 模組 | `higgsfield-marketplace-cards` |
| 固定人物或代言人一致性 | `higgsfield-soul-id` |
| 影片 Hook 與注意力分析 | `higgsfield-generate` 的 Virality Predictor |

## 交付標準

- 每次正式產出需留下 prompt、使用模型、輸入素材、結果 URL、credits 成本、客戶名稱與批准人。
- 可重複使用的 prompt 要沉澱到 `11_Prompt資料庫`。
- 成功案例或高轉換素材要沉澱到 `12_案例庫`。
- 若形成穩定批次流程，下一步抽成 `08_自動化` 的營運 Flow。
