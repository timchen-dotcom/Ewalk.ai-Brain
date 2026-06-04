const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const pptxgen = require("pptxgenjs");

const OUT_DIR = __dirname;
const IMG_DIR = path.join(OUT_DIR, "images");
const HTML_DIR = path.join(OUT_DIR, "html");
const PPTX_PATH = path.join(OUT_DIR, "STAR_Color_0520加盟簡報0511_10頁版_純視覺.pptx");
const MANIFEST_PATH = path.join(OUT_DIR, "STAR_Color_0520加盟簡報0511_10頁版_純視覺_manifest.json");

fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(HTML_DIR, { recursive: true });

const slides = [
  {
    eyebrow: "STAR COLOR 0520",
    title: "AI 智能染髮\n創業大會",
    subtitle: "一個人的 AI 美業經濟",
    footer: "科技賦能・趨勢引領・創造美業新未來",
    theme: "dark",
    layout: "cover",
  },
  {
    eyebrow: "OPENING THESIS",
    title: "今天，我們不只談染髮。",
    subtitle: "而是看懂一套新經濟",
    bullets: ["一個人用 AI 進入美業", "一個人學會可複製技術", "一個人建立穩定現金流", "從服務者，走向經營者"],
    statement: "STAR Color 要創造的，是「一個人的 AI 美業經濟」。",
    theme: "light",
    layout: "thesis",
  },
  {
    eyebrow: "CORE FORMULA",
    title: "STAR Color = 一個人的經濟",
    chips: ["AI 染髮技術", "標準化流程", "透明定價", "微型教育系統", "AI 行銷系統", "加盟營運模型"],
    statement: "把開店門檻拆小，把成功流程做大。",
    theme: "dark",
    layout: "formula",
  },
  {
    eyebrow: "SYSTEM MAP",
    title: "加入的不是一間店，\n而是會學習的 AI 美業生命體。",
    nodes: [
      ["骨架", "幻色鏡方美業控股集團"],
      ["大腦", "Ewalk.ai 行銷與資料中樞"],
      ["神經", "大美好學院微型教育系統"],
      ["血肉", "STAR Color / STAR SPA"],
      ["心臟", "一個人的經濟"],
      ["血液", "資料・顧客・內容・現金流"],
    ],
    theme: "light",
    layout: "organism",
  },
  {
    eyebrow: "PROMISE",
    title: "90 分鐘後，\n你會看懂三件事",
    cards: [
      ["01", "趨勢", "為什麼美業正在進入 AI 與微型創業時代"],
      ["02", "系統", "STAR Color 如何把染髮變成可複製的經營模型"],
      ["03", "加入", "你如何從學習、就業、創業到加盟進入系統"],
    ],
    theme: "dark",
    layout: "promise",
  },
  {
    eyebrow: "MARKET SHIFT",
    title: "美業不是沒有需求，\n是傳統供給方式正在失效。",
    cards: [
      ["人才難找", "師徒制慢，訓練依賴個人經驗"],
      ["技術難複製", "品質靠手感，分店越多越難一致"],
      ["成本提高", "人力、庫存、租金壓力壓縮利潤"],
      ["顧客變聰明", "價格透明、結果可預期、效率更重要"],
    ],
    statement: "下一波機會，不是更大的店，而是更可複製的系統。",
    theme: "light",
    layout: "market",
  },
  {
    eyebrow: "HUMAN DEPENDENCY",
    title: "傳統染髮生意，\n最大的風險不是沒有客人。",
    subtitle: "真正的風險是：太依賴人",
    risks: ["顏色判斷靠師傅經驗", "服務品質靠個人手感", "價格說明靠現場話術", "訓練速度靠師徒制", "顧客回訪靠記憶與關係"],
    theme: "dark",
    layout: "risk",
  },
  {
    eyebrow: "CUSTOMER TRUTH",
    title: "現在的消費者，\n不只想變美，更想安心。",
    worries: ["價格能不能先知道", "髮色會不會翻車", "會不會被推銷", "下次能不能染回同色", "服務流程是不是清楚"],
    answers: ["先知道價格", "配方被記錄", "流程標準化", "回訪可提醒"],
    statement: "AI 的價值不是炫技，而是讓美變得更可預期。",
    theme: "light",
    layout: "customer",
  },
  {
    eyebrow: "STAR COLOR SYSTEM",
    title: "把染髮從靠經驗，\n變成靠系統。",
    modules: ["AI 智能染髮機", "App 配方調色", "標準化 SOP", "顧客色彩紀錄", "透明均一價", "大美好學院", "AI 髮色顧問", "數位營運導流"],
    theme: "light",
    layout: "solution",
  },
  {
    eyebrow: "OPERATING PROOF",
    title: "50 秒，完成一份\n可被記錄的染髮配方。",
    metrics: [
      ["50 秒", "快速調配顧客所需髮色"],
      ["< 0.2G", "單次精準調配"],
      ["可記錄", "配方與顧客色彩資料沉澱"],
      ["可複製", "服務品質更容易訓練"],
    ],
    statement: "複雜配方，變成穩定流程。",
    theme: "dark",
    layout: "machine",
  },
];

const css = `
* { box-sizing: border-box; }
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; }
body {
  font-family: "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", Arial, sans-serif;
  letter-spacing: 0;
  color: #303439;
  background: #f7f4ef;
}
.slide {
  position: relative;
  width: 1920px;
  height: 1080px;
  padding: 78px 92px;
  overflow: hidden;
}
.dark {
  color: #ffffff;
  background:
    linear-gradient(135deg, #171a1d 0%, #2e3337 58%, #171a1d 100%);
}
.light {
  color: #303439;
  background:
    linear-gradient(135deg, #fbfaf7 0%, #f3efea 62%, #fbfaf7 100%);
}
.dark::before, .light::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(216,20,95,.13), transparent 36%, rgba(0,104,100,.08) 72%, transparent),
    repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, transparent 1px 96px);
  opacity: .75;
}
.light::before {
  background:
    linear-gradient(90deg, rgba(216,20,95,.07), transparent 36%, rgba(0,104,100,.045) 72%, transparent),
    repeating-linear-gradient(90deg, rgba(31,36,41,.035) 0 1px, transparent 1px 96px);
}
.content { position: relative; z-index: 2; height: 100%; }
.eyebrow {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 18px;
  font-weight: 800;
  color: #d8145f;
  text-transform: uppercase;
  margin-bottom: 34px;
}
.eyebrow::before {
  content: "";
  width: 5px;
  height: 50px;
  background: #d8145f;
}
h1 {
  margin: 0;
  font-size: 74px;
  line-height: 1.08;
  font-weight: 900;
  max-width: 1120px;
}
.cover h1 { font-size: 96px; max-width: 780px; }
.subtitle {
  margin-top: 28px;
  font-size: 36px;
  line-height: 1.28;
  color: #006864;
  font-weight: 800;
}
.dark .subtitle { color: #ffd2df; }
.statement {
  position: absolute;
  left: 0;
  bottom: 42px;
  right: 0;
  font-size: 31px;
  font-weight: 900;
  color: #006864;
  text-align: center;
}
.dark .statement { color: #ffffff; }
.page {
  position: absolute;
  right: 92px;
  bottom: 56px;
  color: rgba(48,52,57,.44);
  font-size: 16px;
  font-weight: 700;
}
.dark .page { color: rgba(255,255,255,.35); }
.brand {
  position: absolute;
  left: 92px;
  bottom: 56px;
  color: rgba(48,52,57,.44);
  font-size: 16px;
  font-weight: 700;
}
.dark .brand { color: rgba(255,255,255,.35); }
.accent { color: #d8145f; }
.teal { color: #006864; }
.gold { color: #d2a04a; }

.cover-grid {
  position: absolute;
  right: 80px;
  top: 70px;
  width: 780px;
  height: 930px;
  opacity: .72;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  gap: 18px;
}
.tile {
  border: 1px solid rgba(255,255,255,.13);
  background: rgba(255,255,255,.06);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}
.tile::before {
  content: "";
  position: absolute;
  inset: 22px;
  border-left: 4px solid #d8145f;
  border-bottom: 2px solid rgba(255,255,255,.24);
}
.tile:nth-child(even)::before { border-left-color: #006864; }
.cover-line {
  width: 560px;
  height: 1px;
  background: rgba(255,255,255,.35);
  margin-top: 70px;
}
.cover-footer {
  margin-top: 34px;
  font-size: 24px;
  color: rgba(255,255,255,.72);
}

.thesis-wrap {
  display: grid;
  grid-template-columns: 1fr 430px;
  gap: 86px;
  margin-top: 54px;
}
.bullets {
  display: grid;
  gap: 28px;
  margin-top: 36px;
  font-size: 32px;
  line-height: 1.32;
}
.bullet {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 20px;
  align-items: start;
}
.bullet::before {
  content: "";
  width: 12px;
  height: 12px;
  background: #006864;
  margin-top: 15px;
}
.black-card {
  height: 530px;
  background: #202326;
  color: #fff;
  border-radius: 6px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 54px;
  font-size: 38px;
  font-weight: 900;
}
.black-card small {
  display: block;
  margin-top: 80px;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 700;
  color: rgba(255,255,255,.78);
}

.formula-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  margin-top: 150px;
}
.chip {
  min-width: 185px;
  height: 104px;
  border-radius: 8px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.08);
  display: grid;
  place-items: center;
  padding: 18px;
  text-align: center;
  font-size: 25px;
  line-height: 1.2;
  font-weight: 900;
}
.chip.primary { background: #d8145f; }
.plus { font-size: 38px; color: rgba(255,255,255,.72); font-weight: 900; }
.equals {
  margin-top: 118px;
  text-align: right;
  font-size: 50px;
  font-weight: 900;
}

.organism-map {
  position: absolute;
  left: 200px;
  right: 200px;
  top: 395px;
  bottom: 150px;
}
.core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 290px;
  height: 290px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #303439;
  color: #fff;
  display: grid;
  place-items: center;
  text-align: center;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.18;
}
.node {
  position: absolute;
  width: 285px;
  min-height: 108px;
  border: 1px solid rgba(48,52,57,.17);
  border-radius: 8px;
  background: rgba(255,255,255,.78);
  padding: 20px 22px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(30,34,38,.06);
}
.node b {
  display: block;
  color: #d8145f;
  font-size: 26px;
  margin-bottom: 8px;
}
.node span { font-size: 18px; line-height: 1.2; }
.n1{ left:0; top:58px; } .n2{ left:380px; top:0; } .n3{ right:380px; top:0; }
.n4{ right:0; top:58px; } .n5{ left:215px; bottom:0; } .n6{ right:215px; bottom:0; }

.promise-grid, .market-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 110px;
}
.promise-card {
  min-height: 390px;
  border-radius: 8px;
  padding: 42px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.09);
}
.promise-card .num {
  font-size: 28px;
  color: #d2a04a;
  font-weight: 900;
}
.promise-card h2 {
  margin: 42px 0 22px;
  font-size: 48px;
  color: #ffd2df;
}
.promise-card p {
  font-size: 26px;
  line-height: 1.38;
  color: rgba(255,255,255,.78);
}

.market-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 34px 48px;
  margin-top: 80px;
}
.market-card {
  min-height: 150px;
  border-radius: 8px;
  background: rgba(255,255,255,.82);
  border: 1px solid rgba(48,52,57,.14);
  padding: 35px 42px;
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 28px;
  align-items: center;
}
.market-card h2 {
  color: #d8145f;
  font-size: 36px;
  margin: 0;
}
.market-card p {
  margin: 0;
  font-size: 24px;
  line-height: 1.28;
}

.risk-stage {
  position: absolute;
  left: 98px;
  right: 98px;
  bottom: 190px;
  height: 310px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.risk-item {
  width: 305px;
  min-height: 142px;
  border-radius: 8px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.08);
  padding: 28px;
  text-align: center;
  font-size: 25px;
  line-height: 1.25;
  font-weight: 800;
}
.risk-arrow {
  width: 34px;
  height: 2px;
  background: rgba(255,255,255,.45);
}

.customer-grid {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 80px;
  margin-top: 76px;
}
.worry-box, .answer-box {
  border-radius: 8px;
  padding: 46px 54px;
  min-height: 455px;
}
.worry-box {
  background: rgba(255,255,255,.82);
  border: 1px solid rgba(48,52,57,.14);
}
.answer-box {
  background: #303439;
  color: #fff;
}
.list-title {
  font-size: 34px;
  font-weight: 900;
  color: #d8145f;
  margin-bottom: 28px;
}
.answer-box .list-title { color: #fff; }
.list {
  display: grid;
  gap: 22px;
  font-size: 27px;
}
.list div::before {
  content: "•";
  color: #d8145f;
  font-weight: 900;
  margin-right: 16px;
}
.answer-box .list div::before { color: #d2a04a; }

.solution-map {
  position: absolute;
  inset: 338px 110px 150px;
}
.solution-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 410px;
  height: 210px;
  transform: translate(-50%, -50%);
  border-radius: 110px;
  background: #303439;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 48px;
  font-weight: 900;
}
.module {
  position: absolute;
  width: 290px;
  height: 92px;
  border-radius: 8px;
  background: rgba(255,255,255,.85);
  border: 1px solid rgba(48,52,57,.15);
  display: grid;
  place-items: center;
  font-size: 23px;
  font-weight: 900;
  text-align: center;
  padding: 14px;
}
.m1{ left:0; top:0; } .m2{ left:370px; top:0; } .m3{ right:370px; top:0; } .m4{ right:0; top:0; }
.m5{ left:0; bottom:0; } .m6{ left:370px; bottom:0; } .m7{ right:370px; bottom:0; } .m8{ right:0; bottom:0; background:#d8145f; color:#fff; }

.metric-grid {
  position: absolute;
  left: 170px;
  right: 170px;
  bottom: 240px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 72px;
}
.metric {
  text-align: center;
}
.metric b {
  display: block;
  font-size: 64px;
  color: #ffd2df;
  margin-bottom: 28px;
}
.metric span {
  display: block;
  border-top: 1px solid rgba(255,255,255,.25);
  padding-top: 22px;
  font-size: 24px;
  line-height: 1.3;
  color: rgba(255,255,255,.82);
}
`;

function esc(text) {
  return String(text || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function textLines(text) {
  return esc(text).replace(/\n/g, "<br>");
}

function chrome(slide, index, inner) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
  <section class="slide ${slide.theme} ${slide.layout}">
    <div class="content">
      <div class="eyebrow">${esc(slide.eyebrow)}</div>
      ${inner}
    </div>
    <div class="brand">STAR Color｜一個人的 AI 美業經濟</div>
    <div class="page">${String(index + 1).padStart(2, "0")}</div>
  </section>
  </body></html>`;
}

function renderSlide(slide, index) {
  if (slide.layout === "cover") {
    const tiles = Array.from({ length: 12 }, () => `<div class="tile"></div>`).join("");
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="subtitle">${esc(slide.subtitle)}</div>
      <div class="cover-line"></div>
      <div class="cover-footer">${esc(slide.footer)}</div>
      <div class="cover-grid">${tiles}</div>
    `);
  }
  if (slide.layout === "thesis") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="thesis-wrap">
        <div class="bullets">${slide.bullets.map((b) => `<div class="bullet">${esc(b)}</div>`).join("")}</div>
        <div class="black-card">不是產品說明<small>而是一套能被學習、營運與複製的創業系統</small></div>
      </div>
      <div class="statement">${esc(slide.statement)}</div>
    `);
  }
  if (slide.layout === "formula") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="formula-row">
        ${slide.chips.map((c, i) => `${i ? '<div class="plus">+</div>' : ""}<div class="chip ${i === 0 ? "primary" : ""}">${esc(c)}</div>`).join("")}
      </div>
      <div class="equals">= 一個人的 AI 美業經濟</div>
      <div class="statement">${esc(slide.statement)}</div>
    `);
  }
  if (slide.layout === "organism") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="organism-map">
        <div class="core">AI 美業<br>生命體</div>
        ${slide.nodes.map((n, i) => `<div class="node n${i + 1}"><b>${esc(n[0])}</b><span>${esc(n[1])}</span></div>`).join("")}
      </div>
    `);
  }
  if (slide.layout === "promise") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="promise-grid">
        ${slide.cards.map((c) => `<div class="promise-card"><div class="num">${esc(c[0])}</div><h2>${esc(c[1])}</h2><p>${esc(c[2])}</p></div>`).join("")}
      </div>
    `);
  }
  if (slide.layout === "market") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="market-grid">
        ${slide.cards.map((c) => `<div class="market-card"><h2>${esc(c[0])}</h2><p>${esc(c[1])}</p></div>`).join("")}
      </div>
      <div class="statement">${esc(slide.statement)}</div>
    `);
  }
  if (slide.layout === "risk") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="subtitle">${esc(slide.subtitle)}</div>
      <div class="risk-stage">
        ${slide.risks.map((r, i) => `<div class="risk-item">${esc(r)}</div>${i < slide.risks.length - 1 ? '<div class="risk-arrow"></div>' : ""}`).join("")}
      </div>
      <div class="statement">當一門生意太依賴人，它就很難快速複製。</div>
    `);
  }
  if (slide.layout === "customer") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="customer-grid">
        <div class="worry-box"><div class="list-title">顧客怕什麼</div><div class="list">${slide.worries.map((w) => `<div>${esc(w)}</div>`).join("")}</div></div>
        <div class="answer-box"><div class="list-title">STAR Color 給什麼</div><div class="list">${slide.answers.map((a) => `<div>${esc(a)}</div>`).join("")}</div></div>
      </div>
      <div class="statement">${esc(slide.statement)}</div>
    `);
  }
  if (slide.layout === "solution") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="solution-map">
        <div class="solution-core">STAR Color</div>
        ${slide.modules.map((m, i) => `<div class="module m${i + 1}">${esc(m)}</div>`).join("")}
      </div>
    `);
  }
  if (slide.layout === "machine") {
    return chrome(slide, index, `
      <h1>${textLines(slide.title)}</h1>
      <div class="metric-grid">
        ${slide.metrics.map((m) => `<div class="metric"><b>${esc(m[0])}</b><span>${esc(m[1])}</span></div>`).join("")}
      </div>
      <div class="statement">${esc(slide.statement)}</div>
    `);
  }
  throw new Error(`Unknown layout: ${slide.layout}`);
}

async function renderImages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const outputs = [];
  for (let i = 0; i < slides.length; i += 1) {
    const html = renderSlide(slides[i], i);
    const htmlPath = path.join(HTML_DIR, `page_${String(i + 1).padStart(2, "0")}.html`);
    const imgPath = path.join(IMG_DIR, `page_${String(i + 1).padStart(2, "0")}.png`);
    fs.writeFileSync(htmlPath, html);
    await page.goto(`file://${htmlPath}`);
    await page.screenshot({ path: imgPath, fullPage: false });
    outputs.push({ page: i + 1, title: slides[i].title, image: imgPath, html: htmlPath });
    console.log(`[image] page_${String(i + 1).padStart(2, "0")}.png`);
  }
  await browser.close();
  return outputs;
}

async function buildPptx(images) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Ewalk.ai";
  pptx.subject = "STAR Color 0520 加盟簡報 10頁純視覺版";
  pptx.title = "STAR Color 0520 加盟簡報0511 10頁版 純視覺";
  pptx.company = "Ewalk.ai";
  pptx.lang = "zh-TW";
  pptx.theme = {
    headFontFace: "Microsoft JhengHei",
    bodyFontFace: "Microsoft JhengHei",
    lang: "zh-TW",
  };
  for (const item of images) {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addImage({ path: item.image, x: 0, y: 0, w: 13.333, h: 7.5 });
  }
  await pptx.writeFile({ fileName: PPTX_PATH });
}

(async () => {
  const images = await renderImages();
  await buildPptx(images);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
    mode: "baked",
    source: "STAR_Color_0520加盟簡報0511_10頁版.md",
    output: PPTX_PATH,
    pages: images,
    note: "每頁皆為滿版 PNG 圖像，適合純視覺交付；文字不可在 PowerPoint 內直接編輯。",
  }, null, 2));
  console.log(`[pptx] ${PPTX_PATH}`);
})();
