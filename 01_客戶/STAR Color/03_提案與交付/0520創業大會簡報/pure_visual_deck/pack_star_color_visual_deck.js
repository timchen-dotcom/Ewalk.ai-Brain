const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const ROOT = __dirname;
const IMG_DIR = path.join(ROOT, "images");
const OUT = path.join(ROOT, "STAR_Color_0520加盟簡報0511_10頁版_純視覺.pptx");

const images = fs
  .readdirSync(IMG_DIR)
  .filter((name) => /^page_\d+\.png$/.test(name))
  .sort()
  .map((name) => path.join(IMG_DIR, name));

if (!images.length) {
  throw new Error(`No page_*.png files found in ${IMG_DIR}`);
}

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Ewalk.ai";
pptx.company = "Ewalk.ai";
pptx.subject = "STAR Color 0520 加盟簡報 10頁純視覺版";
pptx.title = "STAR Color 0520 加盟簡報0511 10頁版 純視覺";
pptx.lang = "zh-TW";
pptx.theme = {
  headFontFace: "Microsoft JhengHei",
  bodyFontFace: "Microsoft JhengHei",
  lang: "zh-TW",
};

for (const img of images) {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addImage({ path: img, x: 0, y: 0, w: 13.333, h: 7.5 });
}

pptx.writeFile({ fileName: OUT }).then(() => {
  const manifest = {
    mode: "baked",
    output: OUT,
    slide_count: images.length,
    images,
    note: "每張投影片皆是一張滿版 PNG 圖，文字不可在 PowerPoint 內直接編輯。",
  };
  fs.writeFileSync(
    path.join(ROOT, "STAR_Color_0520加盟簡報0511_10頁版_純視覺_manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(OUT);
});
