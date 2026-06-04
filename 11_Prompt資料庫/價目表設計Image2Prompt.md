# 價目表設計 Image2 Prompt

## 用途

給設計企劃在製作價目表、服務菜單、加購表、A4 店內海報時使用。此 Prompt 目標是讓 image2 生成符合品牌調性的視覺成品或視覺底稿。

搭配 SOP：[[../13_SOP流程/價目表設計技能SOP|價目表設計技能 SOP]]

## 使用前必填

```text
客戶名稱：
產物尺寸：
使用場景：
品牌 CIS：
參考版型：
主要分類：
服務項目：
加購項目：
是否需要 QR：
不可出現：
```

## A4 價目表 Prompt 模板

```text
Use case: infographic-diagram
Asset type: A4 portrait premium service price list poster.

Primary request:
Generate a premium A4 portrait price list for {客戶名稱}. Keep the information clear like a service menu: main brand header, 3 to 4 category sections, service cards with prices, and add-on table at the bottom. Follow the provided reference layout rhythm, but redesign it to match the client CIS.

Brand / CIS:
- Brand name: {品牌名稱}
- Brand positioning: {品牌定位}
- Visual keywords: {例如：韓系極簡、高端、清透、溫潤科技感}
- Color palette: {色碼}
- Typography feeling: {字體感}
- Avoid: {品牌禁忌}

Canvas:
- A4 portrait ratio.
- Print-ready poster feeling.
- Clear hierarchy, strong readability, premium whitespace.

Layout:
- Top: brand logo area and main title.
- Middle: category sections with rounded service cards.
- Bottom: add-on table.
- Use thin hairline dividers, refined rounded panels, soft shadows, subtle brand motifs.

Exact text:
Title: {主標題}
Subtitle: {副標題}

SECTION 01 heading: {分類一}
Service card:
{服務名稱}
重點：{服務重點}
原價 {原價}
會員價 {會員價}

SECTION 02 heading: {分類二}
Service card:
{服務名稱}
重點：{服務重點}
原價 {原價}
會員價 {會員價}

SECTION 03 heading: {分類三}
Service card:
{服務名稱}
重點：{服務重點}
原價 {原價}
會員價 {會員價}

Add-on title: 加購項目
Add-on table:
{加購項目一}｜原價 {原價}｜會員價 {會員價}
{加購項目二}｜原價 {原價}｜會員價 {會員價}
{加購項目三}｜原價 {原價}｜會員價 {會員價}

Bottom note:
實際服務內容與價格依門市公告為準

Critical constraints:
- Keep Traditional Chinese text as readable and correct as possible.
- Keep all prices exactly as written.
- Do not add unprovided phone number, address, Instagram, LINE, discount claims, fake QR, or fake barcode.
- Do not use medical treatment claims, guaranteed effects, before-after claims, or exaggerated wording.
- Make the design premium, not salesy.
```

## QR 海報 Prompt 模板

QR 類海報必須使用「佔位框」策略。image2 不可生成或重畫 QR。

```text
Use case: infographic-diagram
Asset type: A4 portrait premium poster background and layout.

Primary request:
Generate a premium A4 portrait poster for {客戶名稱} inviting customers to join the official LINE account. Do not draw or invent a QR code. Leave one large clean white rounded square QR placeholder in the lower-middle area. The real QR code will be placed there later.

Brand / CIS:
- Brand name: {品牌名稱}
- Visual keywords: {品牌視覺關鍵字}
- Color palette: {色碼}
- Avoid: {禁忌}

Composition:
- A4 portrait ratio.
- Top: logo / brand mark area.
- Middle: large invitation headline and service benefits.
- Lower-middle: large empty white rounded square QR placeholder.
- Bottom: subtle brand decorative band, no contact details unless explicitly provided.

Exact text:
加入 {品牌名稱} 官方 LINE
掃碼加入好友
{利益點一}｜{利益點二}｜{利益點三}

Critical constraints:
- No QR code.
- No fake barcode.
- No phone number, address, Instagram, or booking CTA unless provided.
- Leave the QR placeholder empty white.
- Premium, clean, readable, suitable for print.
```

## STAR SPA 範例 Prompt 摘要

```text
Generate a premium A4 portrait price menu for STAR SPA K-LAB. Preserve the original liked layout rhythm: large top logo/title, section 01 with two side-by-side service cards, section 02 one wide card, section 03 one wide card, centered add-on title, two compact add-on tables, soft translucent aqua-peach wave bottom.

Use STAR SPA CIS: misty ivory, marble white, warm taupe, rose nude, peach nude, mint mist, aqua clear, charcoal. Korean minimalist, high-end, translucent, calm, warm tech-aesthetic.

Remove contact information unless requested. If QR is required, leave placeholder only; overlay real official QR after generation.
```

## 驗證提醒

image2 生成後，設計企劃必須人工檢查：

- 課程名稱是否正確。
- 價格是否正確。
- 加購標題是否破字。
- 是否偷加了 QR、地址、電話或不存在的資訊。
- 是否符合品牌 CIS。
- 若要正式交付，建議另存正字版或人工後製校稿。
