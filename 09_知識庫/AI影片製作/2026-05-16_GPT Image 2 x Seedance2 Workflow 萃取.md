---
類型: AI影片製作研究
狀態: 已萃取
日期: 2026-05-16
來源:
  - KOC 電腦王阿達
  - EvoLinkAI GitHub
標籤:
  - AI影片
  - GPTImage2
  - Seedance2
  - 分鏡
  - 影片腳本拆解員
---

# GPT Image 2 x Seedance 2.0 Workflow 萃取

## 用途

把 KOC 文章與 EvoLinkAI GitHub repo 的工作流，轉成 Ewalk.ai 影片腳本拆解員可直接使用的規則，用來強化「拆解影片後，產出可餵給影片 AI 的分鏡腳本包」。

## 來源

- KOC 文章：[整理大量 GPT Image 2 + Seedance 2.0 提示詞使用案例，教你做出連貫性與角色一致性高的 AI 影片](https://www.koc.com.tw/archives/642095)
- GitHub repo：[EvoLinkAI/GPT-Image-2-Seedance2-Workflow](https://github.com/EvoLinkAI/GPT-Image-2-Seedance2-Workflow/tree/main)

## 核心結論

這份工作流最值得吸收的不是單一 prompt，而是生產順序：

```text
影片 / 腳本拆解
↓
文字分鏡腳本包
↓
GPT Image 2 / Images 2.0 生成角色表、產品圖、分鏡宮格或視覺開發板
↓
檢查並鎖定分鏡
↓
Seedance 2.0 依照分鏡參考圖做 Image-to-Video
↓
剪輯、字幕、音樂、品牌收尾
```

GPT Image 2 / Images 2.0 負責「畫面長什麼樣」與一致性；Seedance 2.0 負責「畫面怎麼動」。影片腳本拆解員要把這兩段分開寫清楚，不能只產出一段泛用影片 prompt。

## 必須吸收的工作流規則

### 1. Storyboard-first 才進影片生成

- 先在圖片階段修分鏡、角色、產品、場景與構圖。
- 等分鏡被阿順或提姆先生確認後，才進 Seedance 2.0。
- 原因：影片重抽成本遠高於圖片重抽，先修圖片能省成本，也能降低角色跑掉、產品變形與鏡頭混亂。

### 2. 用單張分鏡宮格給 Seedance 讀時間軸

優先把分鏡整理成單張 grid，而不是零散多張圖。

| 影片長度 | 建議分鏡 |
| --- | --- |
| 15 秒 | 4-5 格、8 格橫向、或 3x3 grid |
| 30 秒 | 8-10 格、3x3 grid、3x4 grid |
| 60 秒 | 15-18 格、4x4 grid 或分段生成 |

Seedance prompt 必須明確寫出：

```text
Follow the storyboard sequence of the reference frames in reading order.
No new shots, no reordering, preserve exact composition and continuity.
```

### 3. 產品廣告要鎖死產品外觀

商品、Logo、瓶身、包裝、價格表與品牌字容易被影片插值改寫。產品影片要優先使用「鏡頭動，不動產品」。

Seedance 約束語：

```text
Keep the product appearance completely unchanged, camera movement only, no rotation.
```

產品短片每段建議控制在 3 秒內，降低長時間動態造成的細節漂移。

### 4. 角色一致性要先做三視圖

若影片有固定人物或 AI 角色，Images 2.0 需先生成角色設定：

- 正面
- 側面
- 背面
- 臉部特寫
- 服裝與髮型

每一格 storyboard 都要重複短角色描述，避免角色長相漂移。

### 5. 流程型影片用 timestamp shotlist

產品展示、開箱、食物、染髮流程、教學影片，適合用 2 秒為單位的時間軸 prompt。

範例結構：

```text
[0-2s] 俯拍特寫：主角拿起產品 / 工具，環境清楚。
[2-4s] 側面近景：開始第一個動作，慢動作呈現細節。
[4-6s] 微距：關鍵質地、顏色或變化。
```

每段要同時寫清楚「景別 / 鏡頭角度」與「動作」。

### 6. Seedance prompt 要短而明確

Seedance 不需要過長文案，重點是動態意圖、順序、連續性與限制。

優先寫：

- 影片長度與比例
- 依照哪張 storyboard reference
- shot order / reading order
- 鏡頭運動
- 角色 / 產品一致性
- 不要新增鏡頭、不要重排、不要變形

## 導入到 Ewalk.ai 的標準輸出

影片腳本拆解員每次完成拆解後，最後要補兩段 prompt：

### A. GPT Image 2 / Images 2.0 分鏡圖 Prompt

用途：生成視覺開發板、角色表、產品圖或 storyboard grid。

必填：

- 專案 metadata
- 角色設定 / 產品 reference
- Sequence A/B/C
- shot-by-shot
- 色彩、燈光、鏡頭參數
- grid 規格：3x3、3x4、4x4、8 格橫向

### B. Seedance 2.0 動態生成 Prompt

用途：把已鎖定分鏡圖轉成影片。

必填：

- reference image：`@storyboard_grid`、`@character_sheet`、`@product_reference`
- 影片長度、比例、fps
- follow storyboard sequence / reading order
- camera movement
- continuity rules
- negative constraints

## 適合 STAR Color 的套用

STAR Color 影片可以套用「產品 / 服務廣告 + 流程型 timestamp shotlist」：

- Images 2.0 先產出：角色表、店內諮詢場景、3x3 分鏡宮格。
- Seedance 2.0 再生成：15 秒直式 Reels。
- 每 2 秒一段：痛點、價目表、AI 色彩紀錄、諮詢、LINE 預約、品牌收尾。
- 服務畫面要避免 Logo / 價格字被改寫，正式字卡建議在剪輯階段疊上。

## 風險與授權

- KOC 文章是二次報導，技術導入以 GitHub repo README 為主。
- GitHub README badge 顯示 CC BY 4.0，但 repo 內 LICENSE 檔為 Apache License 2.0，授權標示不一致；導入 Ewalk.ai 時只萃取方法，不直接複製案例素材、圖片或長段 prompt。
- 使用第三方創作者案例時，只能做內部研究與方法拆解，不可直接商用搬運。
