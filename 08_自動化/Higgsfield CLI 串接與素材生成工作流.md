# Higgsfield CLI 串接與素材生成工作流

## 用途

記錄 Ewalk.ai 將 Higgsfield CLI 接入 Codex/阿順的狀態、使用邊界與後續可產品化的視覺素材工作流。

## 串接狀態

- 日期：2026-05-31
- CLI：已安裝 `@higgsfield/cli` v0.1.40
- 本機入口：`.tools/bin/higgsfield`、`.tools/bin/higgs`
- Codex plugin：已安裝官方 `higgsfield-ai/skills` 到 `~/.codex/plugins/higgsfield`
- Codex plugin 補充：已加入 Ewalk.ai 本機 `.tools/bin` 路徑提示，避免誤跑全域安裝
- 登入狀態：已完成，帳號 `tim.chen@ewalk.ai`
- 目前方案與額度：free plan，9.5 credits（2026-05-31 驗證）
- 登入腳本：`串接HiggsfieldCLI.command`
- 安裝腳本：`安裝HiggsfieldCLI.command`

## 2026-05-31 驗收紀錄

- CLI 版本：通過，`higgsfield 0.1.40`
- 帳號狀態：通過，`tim.chen@ewalk.ai`
- 模型清單：通過，可列出圖片模型。
- 成本試算：通過，`nano_banana_2` 測試 prompt 預估 `2 credits`。
- 生成測試：已於提姆先生批准後執行低成本測試，見下方紀錄。

## 2026-05-31 低成本生成測試

- 狀態：通過
- 模型：`z_image`
- Prompt：`minimal AI operations desk, clean product-style test render, soft studio lighting, teal and lime accents, no people, no text`
- 試算成本：`0.15 credits`
- 實際扣款：`0.15 credits`
- 生成後 credits：`9.35 credits`
- 本機檔案：`Ewalk.ai Brain/08_自動化/Higgsfield CLI 測試/2026-05-31_z_image_低成本生成測試.png`
- 測試紀錄：[[Higgsfield CLI 測試/2026-05-31_z_image_低成本生成測試]]

## 可用能力

- 生成圖片與影片。
- 產品棚拍、生活情境圖、Hero Banner、社群輪播、廣告靜態素材。
- Marketplace 商品主圖、副圖與 A+ 模組。
- Soul ID 人物一致性訓練。
- Marketing Studio UGC、開箱、產品展示、TV spot 類短影音。
- 影片 Hook、注意力與互動潛力評估。

## Ewalk.ai 優先落地場景

1. 美業品牌產品棚拍
- 適用客戶：Inebrya、TheDay那日美學、STAR SPA、STAR Color。
- 目標：產品圖、情境圖、社群輪播、電商 Banner。

2. Google 商家與電商素材
- 適用任務：商品上架圖、活動促銷圖、Marketplace 商品卡。
- 目標：縮短設計初稿時間，建立多版本測試素材。

3. Meta / TikTok 廣告前測
- 適用任務：UGC、開箱、產品展示、短影音 Hook 測試。
- 目標：先產生概念片與 Hook 分析，再交給提姆先生決定是否正式投放。

## 標準流程

1. 收集素材
- 客戶名稱、產品照片、品牌色、禁用詞、活動檔期、目標平台、尺寸需求。

2. 權限確認
- 是否可把素材上傳 Higgsfield。
- 是否會使用真人肖像或客戶未公開素材。
- 是否會消耗 credits。

3. 生成前記錄
- 將 prompt、模型、輸入素材、預估 credits 寫入任務紀錄。

4. 生成與整理
- 先做低成本小樣，再做正式輸出。
- 產物放入對應客戶 `04_素材` 或 `03_提案與交付`。

5. 交付與沉澱
- 客戶可用版本放交付資料夾。
- Prompt 放入 `11_Prompt資料庫`。
- 成功組合放入 `12_案例庫`。

## 待提姆先生確認

- Higgsfield 要綁定哪一個公司帳號。
- 每月 credits 預算上限。
- 哪些客戶素材可上傳 Higgsfield。
- 是否要建立「Higgsfield 生成紀錄表」同步追蹤成本與成果。
