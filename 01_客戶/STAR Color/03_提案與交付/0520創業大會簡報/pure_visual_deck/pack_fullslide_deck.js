const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const ROOT = __dirname;
const IMG_DIR = process.env.FULLSLIDE_IMG_DIR
  ? path.resolve(process.env.FULLSLIDE_IMG_DIR)
  : path.join(ROOT, "fullslide_images_1536_confirm");
const OUT = process.env.FULLSLIDE_OUT
  ? path.resolve(process.env.FULLSLIDE_OUT)
  : path.join(ROOT, "STAR_Color_0520加盟簡報0511_GPT_Image_2_整頁烘字_完整確認版_1536.pptx");

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
pptx.subject = "STAR Color 0520 加盟簡報 GPT Image 2 整頁烘字版";
pptx.title = "STAR Color 0520 加盟簡報0511 完整46頁 GPT Image 2 整頁烘字";
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
    mode: "baked-fullslide-gpt-image-2",
    output: OUT,
    slide_count: images.length,
    images,
    note: "每張投影片皆為 GPT Image 2 直接生成的滿版 PNG，包含視覺、文字、重點與圖表；此版為 1536x1024 high 內容確認版，文字不可在 PowerPoint 內直接編輯。",
  };
  fs.writeFileSync(
    path.join(ROOT, "STAR_Color_0520加盟簡報0511_GPT_Image_2_整頁烘字_完整確認版_1536_manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(OUT);
});
