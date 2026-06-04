# GPT Image 2 整頁烘字簡報 Prompt

用途：把 Markdown 簡報素材轉成 GPT Image 2 可直接生成整頁投影片的 prompt。

## 輸入

```text
簡報主題：
目標聽眾：
品牌/客戶：
頁數：
原始 Markdown：
品牌色：
輸出用途：
```

## 處理原則

你要先把原始 Markdown 擴寫成逐頁簡報設計稿，再輸出每頁的 GPT Image 2 prompt。

每頁要包含：

- 一個主標
- 一個副標或結論句
- 3 到 5 個短重點
- 一個明確視覺場景
- 一個簡單圖表或結構，如果內容適合

## 輸出格式

```json
{
  "model": "gpt-image-2",
  "size": "3840x2160",
  "quality": "high",
  "pages": [
    {
      "page": 1,
      "role": "cover",
      "headline": "",
      "supporting_text": "",
      "must_include_text": [],
      "visual_scene": "",
      "chart_or_structure": "",
      "prompt": ""
    }
  ]
}
```

## 每頁 prompt 模板

```text
Create a complete 16:9 professional keynote slide in Traditional Chinese.

Slide role:
{role}

Main headline, exact Traditional Chinese text:
「{headline}」

Supporting text, exact Traditional Chinese text:
「{supporting_text}」

Must include these short text elements exactly:
{must_include_text}

Visual scene:
{visual_scene}

Chart or structure:
{chart_or_structure}

Design style:
Premium commercial presentation, strong visual hierarchy, large readable Traditional Chinese typography, clean grid, high contrast, STAR Color-style magenta accent, deep teal accent, subtle gold highlights, beauty-tech and AI entrepreneurship mood.

Important constraints:
Use Traditional Chinese only. Do not add English words. Do not add fake logos. Do not add extra small unreadable paragraphs. Keep the slide clean and professional. Make all Chinese text large, sharp, and readable.
```

## 驗證標準

- 主標完全正確。
- 數字完全正確。
- 品牌名稱完全正確。
- 沒有亂碼、假中文、英文雜字。
- 沒有密密麻麻的小字。
- 圖表或流程能一眼看懂。

