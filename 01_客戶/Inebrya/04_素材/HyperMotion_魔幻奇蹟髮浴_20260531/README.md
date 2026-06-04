# Hyper Motion 測試｜Inebrya 魔幻奇蹟髮浴 300ml

## 用途

測試 Higgsfield Marketing Studio / Hyper Motion 是否適合將 Inebrya Blondesse Blonde Miracle 魔幻奇蹟髮浴轉成 9:16 產品主角 CGI 短影音。

## 素材來源

- 商品頁：<https://www.glamourology.com.tw/products/dc71083d-b22f-4d9d-a93d-054ef874d115>
- 商品圖：`raw/魔幻奇蹟髮浴_300ml_商品圖.webp`
- 產品：Inebrya Blondesse Blonde Miracle Shampoo／魔幻奇蹟髮浴 300ml
- 系列：Inebrya Blondesse Blonde Miracle／魔幻奇蹟系列

## 注意事項

- 商品頁目前會出現 Cloudflare challenge，CLI / curl 無法穩定讀取商品頁內容。
- 本次優先用提姆先生提供的商品圖建立 Hyper Motion brief。
- 不讓 AI 重畫瓶身文字、容量、Logo；影片應以真實商品圖作為產品參考。
- 任何正式影片生成都會消耗 Higgsfield credits，需先試算並經提姆先生批准。

## Hyper Motion 創意方向

### 方向 A｜漂後髮色保鮮艙

9:16 vertical premium CGI product commercial. Use the provided product image as the hero product reference. A pale lavender shampoo bottle appears inside a clean salon-laboratory preservation chamber. Camera starts in macro close-up on transparent crystal water streams and ash-blonde hair strands, then fast dolly-in reveals the product floating upright in the center. Metallic impurity particles and warm yellow tones are pulled away from the hair by a translucent cleansing ring. Soft lavender, milky white, crystal blue, and champagne highlights. Product remains sharp and label-faithful. No people, no hands, no voiceover, no readable new text, no fake packaging, no extra bottles. Pure CGI, dynamic camera, premium lighting, physics-driven water and hair motion, product as hero.

### 方向 B｜髒黃感被洗掉

9:16 vertical Hyper Motion product reveal. Use the provided Inebrya Blondesse Blonde Miracle Shampoo bottle as the hero. Start with dull yellow-blonde hair strands suspended in cloudy water. A high-speed wave of crystal blue cleansing energy sweeps across the frame, carrying away tiny metallic particles and yellow haze. Camera crash-zooms through the water stream and resolves on the product pack shot, standing in a luminous lavender-white studio. Elegant salon beauty advertising, not medical, not fantasy, no people, no text overlays, no fake label changes.

### 方向 C｜精品髮品揭曉

9:16 vertical CGI luxury beauty product reveal. The product bottle assembles from soft lavender light, crystal water droplets, and glossy ash-blonde hair ribbons. The camera circles the bottle with a controlled product-reveal move, then lands on a clean pack shot. Environment: minimal white salon studio, lavender glass, subtle champagne reflections. The product is the only hero. No person, no voiceover, no extra claims, no text, no invented logo.

## 建議先跑設定

- 模式：Hyper Motion（若 CLI 尚未暴露，先用 Marketing Studio `product_showcase` 或 `tv_spot` 替代測試）
- 比例：`9:16`
- 長度：先用 4-6 秒測試，不直接做 15 秒。
- 解析度：先用 `480p` 或最低可用解析度做驗證。
- 音訊：先關閉。

## 驗收標準

- 瓶身比例、顏色、瓶蓋與標籤方向大致正確。
- 不出現錯字、假 Logo、錯容量、額外產品。
- 影片有 Hyper Motion 的快速鏡頭、產品主角、CGI 水流 / 髮絲 / 光效。
- 不出現真人、手部、醫療化或誇大宣稱。
- 可作為後續 Inebrya 商品短影音流程的第一個案例。

## 狀態

- 素材已歸檔。
- Brief 已完成。
- 商品頁由 Cloudflare 擋住，尚未用 URL-to-Ad。
- 已改走純 CLI 流程，不需要再手動進 Higgsfield 網頁放圖。
- CLI 商品圖上傳成功：
  - Upload ID：`2bf7b657-1771-48ca-9f76-bc0a03fdbfd4`
  - URL：<https://d2ol7oe51mr4n9.cloudfront.net/user_3A6naJxkXWB382DzkVmFwqVUX33/2bf7b657-1771-48ca-9f76-bc0a03fdbfd4.png>
- `marketing-studio products create` 目前回傳 `Method Not Allowed`，因此本次不建立 Marketing Studio product record，改由 `marketing_studio_video --image <upload_id>` 直接吃商品圖。
- 2026-05-31 22:29 CLI 試算：
  - 模型：`marketing_studio_video`
  - 模式：`product_showcase`（對應網頁上的 Hyper Motion / Highlight your product）
  - 設定：`9:16`、`5s`、`480p`、`generate_audio=false`
  - 估算點數：`17.5 credits`
  - 帳戶餘額：`9.35 credits`
  - 結論：目前點數不足，尚未送出正式生成。

## CLI 指令備份

### 成本試算

```bash
HOME="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/.higgsfield-home" \
perl -e 'alarm shift; exec @ARGV' 90 \
.tools/higgsfield-cli/pkg/vendor/hf generate cost marketing_studio_video \
  --prompt '9:16 vertical premium Hyper Motion CGI product commercial. Use the provided Inebrya Blondesse Blonde Miracle Shampoo bottle as the hero product reference. A pale lavender shampoo bottle appears inside a clean salon-laboratory preservation chamber. Camera starts in macro close-up on transparent crystal water streams and ash-blonde hair strands, then fast dolly-in reveals the product floating upright in the center. Metallic impurity particles and warm yellow tones are pulled away from the hair by a translucent cleansing ring. Soft lavender, milky white, crystal blue, and champagne highlights. Product remains sharp and label-faithful. No people, no hands, no voiceover, no readable new text, no fake packaging, no extra bottles. Pure CGI, dynamic camera, premium lighting, physics-driven water and hair motion, product as hero.' \
  --image '2bf7b657-1771-48ca-9f76-bc0a03fdbfd4' \
  --mode product_showcase \
  --aspect_ratio 9:16 \
  --duration 5 \
  --resolution 480p \
  --generate_audio false \
  --json --no-color
```

### 補點後正式生成

```bash
HOME="/Users/chenjinting/Desktop/Ewalk.ai 自動化系統/.higgsfield-home" \
perl -e 'alarm shift; exec @ARGV' 1800 \
.tools/higgsfield-cli/pkg/vendor/hf generate create marketing_studio_video \
  --prompt '9:16 vertical premium Hyper Motion CGI product commercial. Use the provided Inebrya Blondesse Blonde Miracle Shampoo bottle as the hero product reference. A pale lavender shampoo bottle appears inside a clean salon-laboratory preservation chamber. Camera starts in macro close-up on transparent crystal water streams and ash-blonde hair strands, then fast dolly-in reveals the product floating upright in the center. Metallic impurity particles and warm yellow tones are pulled away from the hair by a translucent cleansing ring. Soft lavender, milky white, crystal blue, and champagne highlights. Product remains sharp and label-faithful. No people, no hands, no voiceover, no readable new text, no fake packaging, no extra bottles. Pure CGI, dynamic camera, premium lighting, physics-driven water and hair motion, product as hero.' \
  --image '2bf7b657-1771-48ca-9f76-bc0a03fdbfd4' \
  --mode product_showcase \
  --aspect_ratio 9:16 \
  --duration 5 \
  --resolution 480p \
  --generate_audio false \
  --wait \
  --json --no-color
```
