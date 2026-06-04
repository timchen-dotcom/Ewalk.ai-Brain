import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = "/Users/chenjinting/Desktop/Ewalk.ai 自動化系統";
const DECK_DIR = path.join(
  ROOT,
  "Ewalk.ai Brain/01_客戶/STAR Color/03_提案與交付/0520創業大會簡報",
);
const SKILL_DIR =
  "/Users/chenjinting/.codex/plugins/cache/openai-primary-runtime/presentations/26.430.10722/skills/presentations";
const NODE = "/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node";
const PYTHON = "/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const threadId = process.env.CODEX_THREAD_ID || `manual-${Date.now()}`;
const workspace = path.join("/private/tmp/codex-presentations", threadId, "star-color-0520");
const slidesDir = path.join(workspace, "slides");
const assetDir = path.join(workspace, "assets");
const previewDir = path.join(workspace, "preview");
const layoutDir = path.join(workspace, "layout");
const outputDir = DECK_DIR;
const pptxPath = path.join(outputDir, "STAR_Color_0520_一個人的AI美業經濟.pptx");
const contactSheetPath = path.join(outputDir, "STAR_Color_0520_一個人的AI美業經濟_預覽.png");

const asset = (...parts) => path.join(ROOT, ...parts);

const SOURCE_ASSETS = {
  starOverview: asset(
    "Ewalk.ai Brain/01_客戶/STAR Color/03_提案與交付/0520創業大會簡報/STAR_Color_0520_素材總覽.jpg",
  ),
  academyBrand: asset("Ewalk.ai Brain/01_客戶/大美好學院/04_素材/品牌資料/大美好學院_品牌應用情境.png"),
  academyLogo: asset("Ewalk.ai Brain/01_客戶/大美好學院/04_素材/品牌資料/大美好學院_品牌規範_Logo色彩應用.png"),
  passport01: asset("Ewalk.ai Brain/01_客戶/大美好學院/04_素材/學習護照系統/大美好學院＿學習護照系統01.jpg"),
  passport02: asset("Ewalk.ai Brain/01_客戶/大美好學院/04_素材/學習護照系統/大美好學院＿學習護照系統02.jpg"),
  passport03: asset("Ewalk.ai Brain/01_客戶/大美好學院/04_素材/學習護照系統/大美好學院＿學習護照系統03.jpg"),
  passport05: asset("Ewalk.ai Brain/01_客戶/大美好學院/04_素材/學習護照系統/大美好學院＿學習護照系統05.jpg"),
  passport06: asset("Ewalk.ai Brain/01_客戶/大美好學院/04_素材/學習護照系統/大美好學院＿學習護照系統06.jpg"),
  microSystem: asset("Ewalk.ai Brain/01_客戶/大美好學院/04_素材/系統架構/大美好學院_微型教育系統架構.jpg"),
  groupSystem: asset("Ewalk.ai Brain/01_客戶/幻色鏡方美業控股集團/04_素材/架構圖/幻色鏡方_大美好學院微型教育系統架構.jpg"),
};

const ASSET_FILES = {
  starOverview: "star-overview.jpg",
  academyBrand: "academy-brand.png",
  academyLogo: "academy-logo.png",
  passport01: "passport-01.jpg",
  passport02: "passport-02.jpg",
  passport03: "passport-03.jpg",
  passport05: "passport-05.jpg",
  passport06: "passport-06.jpg",
  microSystem: "micro-system.jpg",
  groupSystem: "group-system.jpg",
};

const ASSETS = Object.fromEntries(
  Object.entries(ASSET_FILES).map(([key, file]) => [key, path.join(assetDir, file)]),
);

const slides = [
  {
    kind: "cover",
    kicker: "STAR COLOR 0520",
    title: "一個人的 AI 美業經濟",
    subtitle: "AI 智能染髮創業大會",
    note: "科技賦能・教育複製・行銷大腦・加盟展店",
    image: ASSETS.starOverview,
  },
  {
    kind: "statement",
    kicker: "OPENING THESIS",
    title: "今天不是聽一台染髮機，而是看懂一套新經濟。",
    body: [
      "一個人如何用 AI 進入美業",
      "一個人如何被訓練、被驗證、被升級",
      "一個人如何從服務者走向經營者",
    ],
    conclusion: "STAR Color 要創造的，是「一個人的 AI 美業經濟」。",
  },
  {
    kind: "formula",
    kicker: "CORE FORMULA",
    title: "STAR Color = 一個人的經濟。",
    formula: ["AI 染髮技術", "標準化流程", "透明定價", "微型教育系統", "加盟營運模型"],
    conclusion: "把開店門檻拆小，把成功流程做大。",
  },
  {
    kind: "organism",
    kicker: "SYSTEM MAP",
    title: "你加入的不是一間店，而是一個會學習的 AI 美業生命體。",
    parts: [
      ["骨架", "幻色鏡方美業控股集團"],
      ["大腦", "Ewalk.ai 行銷與資料中樞"],
      ["神經", "大美好學院微型教育系統"],
      ["血肉", "STAR Color / STAR SPA"],
      ["心臟", "一個人的經濟"],
      ["血液", "資料、顧客、內容與現金流"],
    ],
  },
  {
    kind: "market",
    kicker: "MARKET SHIFT",
    title: "美業不是沒有需求，是傳統供給方式正在失效。",
    cards: [
      ["人才難找", "師徒制慢，訓練依賴個人經驗"],
      ["技術難複製", "品質靠手感，分店越多越難一致"],
      ["成本提高", "人力、庫存、租金壓力壓縮利潤"],
      ["顧客變聰明", "價格透明、結果可預期、效率變重要"],
    ],
    conclusion: "下一波機會，不是更大的店，而是更可複製的系統。",
  },
  {
    kind: "expectation",
    kicker: "CUSTOMER TRUTH",
    title: "現在的消費者，不只想變美，更想安心。",
    leftTitle: "顧客怕什麼",
    left: ["價格不透明", "髮色翻車", "被推銷", "下次染不回同樣顏色"],
    rightTitle: "STAR Color 給什麼",
    right: ["先知道價格", "配方被記錄", "流程被標準化", "回訪可被提醒"],
    conclusion: "AI 的價值不是炫技，而是讓美變得更可預期。",
  },
  {
    kind: "system",
    kicker: "STAR COLOR SYSTEM",
    title: "把染髮從靠經驗，變成靠系統。",
    center: "STAR Color",
    modules: ["AI 智能染髮機", "App 配方調色", "顧客色彩紀錄", "透明均一價", "標準化 SOP", "大美好學院", "數位營運", "Ewalk.ai 行銷大腦"],
  },
  {
    kind: "metrics",
    kicker: "OPERATING PROOF",
    title: "50 秒、12 款髮膏、800+ 色，讓微型門店有機會成立。",
    metrics: [
      ["50 秒", "完成一份可被記錄的染髮配方"],
      ["12 款", "降低傳統染膏庫存壓力"],
      ["800+ 色", "用配方邏輯延伸色彩變化"],
      ["$999", "透明均一價降低第一次進店壓力"],
    ],
    conclusion: "低庫存不代表選擇少；透明定價不是促銷，是信任設計。",
  },
  {
    kind: "flow",
    kicker: "SERVICE FLOW",
    title: "一套服務能被教會，才有機會被複製。",
    steps: ["顧客諮詢", "髮況判斷", "App 配方", "AI 調色", "標準操作", "色彩紀錄", "回訪再消費"],
    conclusion: "制度讓人知道規則；流程讓人知道下一步。",
  },
  {
    kind: "academy",
    kicker: "EDUCATION SYSTEM",
    title: "不是找會的人加盟，而是讓想做的人學會。",
    image: ASSETS.microSystem,
    bullets: ["學習護照", "L1-L6 技術模組", "實作與考核", "就業 / 創業 / 加盟", "資料回到 AI 大腦"],
    conclusion: "大美好學院，是承載一個人的經濟的微型教育系統。",
  },
  {
    kind: "passport",
    kicker: "LEARNING PASSPORT",
    title: "學習護照，讓每個人知道自己下一步在哪裡。",
    images: [ASSETS.passport01, ASSETS.passport02, ASSETS.passport05],
    bullets: ["課程完成度", "技術等級", "實作紀錄", "考核結果", "晉升資格", "就業 / 創業 / 加盟路徑"],
  },
  {
    kind: "timeline",
    kicker: "CAREER PATH",
    title: "從實習染髮師，到能創業的 AI 染髮人才。",
    stages: [
      ["Month 1", "實習染髮師", "完成 L1-L2 理論"],
      ["Month 2-3", "初級 AI 染髮師", "實機操作 L3-L4"],
      ["Month 6", "資深 AI 染髮師", "完成 50 位真人測試"],
      ["Year 1", "AI 染髮大師", "具備修正與教學力"],
      ["Year 2", "店經理 / 合夥人", "店鋪管理與分紅"],
    ],
  },
  {
    kind: "replication",
    kicker: "REPLICATION LOGIC",
    title: "複製的根本，不是制度，而是流程。",
    ladder: [
      ["制度", "知道規則"],
      ["流程", "知道下一步"],
      ["教育", "學會流程"],
      ["數據", "優化流程"],
      ["加盟", "複製流程"],
    ],
    conclusion: "STAR Color 要讓每家店，都能長出下一個會開店的人。",
  },
  {
    kind: "storemodel",
    kicker: "MICRO STORE",
    title: "小坪數、低人力、低庫存，才適合一個人的經濟。",
    cards: [
      ["低人力", "一個人也能啟動服務單位"],
      ["低庫存", "12 款核心髮膏降低管理壓力"],
      ["高頻剛需", "染髮與白髮補染帶來循環消費"],
      ["數位輔助", "色彩紀錄、預約、回訪與營運資料"],
    ],
    conclusion: "不是把傳統髮廊縮小，而是重新設計一個更輕的 AI 美業單位。",
  },
  {
    kind: "brainloop",
    kicker: "EWALK.AI BRAIN",
    title: "一個人可以開始，但你不是一個人作戰。",
    loop: ["市場資料", "AI 分析", "季度策略", "總部活動", "分店內容包", "業績診斷", "下月行動"],
    conclusion: "透過集團的力量，結合每家分店一起跟市場打群架。",
  },
  {
    kind: "brainmodules",
    kicker: "MARKETING OPERATING SYSTEM",
    title: "每家店都能擁有接近總部級的行銷品質。",
    modules: [
      ["市場情報", "競品、趨勢、商圈、評論"],
      ["策略企劃", "季度主題、月活動、新客導流"],
      ["內容工廠", "貼文、Reels、LINE、Google 商家"],
      ["業績分析", "營收、客數、客單、回訪、轉換"],
      ["弱店救援", "30 天修正方案與素材包"],
      ["90 天開幕包", "預熱、開幕、評論、回訪、會員沉澱"],
    ],
  },
  {
    kind: "franchise",
    kicker: "JOINING PATH",
    title: "加入 STAR Color 的 6 個步驟。",
    steps: ["會後諮詢", "適性評估", "加盟方案說明", "大美好學院訓練", "開店籌備與系統導入", "試營運與正式營運"],
    conclusion: "加盟不是買招牌，而是進入一套 AI 美業系統。",
  },
  {
    kind: "fit",
    kicker: "QUALIFICATION",
    title: "我們要找的不是單純加盟主，而是願意跟系統一起成長的人。",
    good: ["想創業但不想從零摸索", "美業工作者想升級成經營者", "沙龍 / 快剪店想轉型 AI 美業", "願意照流程學習與執行", "想投資可複製美業模型"],
    bad: ["只想買一台機器", "不想學系統", "不願意照標準流程", "只想短期套利"],
  },
  {
    kind: "demo",
    kicker: "LIVE AI MOMENT",
    title: "5/20 現場要讓大家看見：AI 大腦不是概念，而是真的可以對話。",
    bullets: ["阿順讀取 STAR Color / 大美好 / 幻色鏡方知識庫", "現場回答一個人的經濟、微型教育、行銷大腦", "展示 Ewalk.ai 能成為集團資料與決策中樞"],
    conclusion: "這一刻，是把簡報從招商說明，升級成 AI 美業生命體展示。",
  },
  {
    kind: "cta",
    kicker: "NEXT STEP",
    title: "今天不是聽完一場簡報，而是決定你要不要擁有一套 AI 美業經濟。",
    body: ["掃描 QR Code，預約會後一對一諮詢。", "你不需要現在就決定開店。", "你只需要先看懂：這套系統適不適合你。"],
    conclusion: "一個人，也可以開始一個新的美業時代。",
  },
];

const common = String.raw`
const W = 1280;
const H = 720;
const C = {
  ink: "#34373A",
  deep: "#222427",
  pale: "#F4F2EF",
  paper: "#FBFAF8",
  line: "#D5D2CD",
  slate: "#6F777B",
  mist: "#E7ECEF",
  magenta: "#D71963",
  rose: "#F3D4DE",
  teal: "#0C6B68",
  gold: "#C69A5B",
  white: "#FFFFFF",
};
const FONT = "Arial";
function fixed(v){ return {mode:"fixed", value:v}; }
function frame(left, top, width, height){ return {left, top, width, height}; }
function add(slide, node, f){ return slide.compose(node, { frame: f }); }
function shape(slide, f, fill, opts = {}) {
  const line = opts.line === "none" || opts.line === undefined
    ? undefined
    : (typeof opts.line === "string" ? {fill:opts.line, width:1} : opts.line);
  return add(slide, {kind:"shape", geometry: opts.geometry || "rect", width:fixed(f.width), height:fixed(f.height), fill, line, borderRadius: opts.radius || 0, shadow: opts.shadow}, f);
}
function text(slide, f, value, opts = {}) {
  const style = {
    typeface: opts.typeface || FONT,
    fontSize: opts.size || 28,
    color: opts.color || C.ink,
    bold: !!opts.bold,
    italic: !!opts.italic,
    alignment: opts.align || "left",
    insets: opts.insets || {top:0,right:0,bottom:0,left:0},
    autoFit: opts.autoFit || "shrinkText",
  };
  return add(slide, {kind:"text", value, width:fixed(f.width), height:fixed(f.height), style}, f);
}
async function image(slide, ctx, f, source, opts = {}) {
  return ctx.addImage(slide, {
    path: source,
    left: f.left,
    top: f.top,
    width: f.width,
    height: f.height,
    fit: opts.fit || "cover",
    alt: opts.alt || "",
  });
}
function bg(slide, color = C.paper) {
  shape(slide, frame(0,0,W,H), color);
}
function footer(slide, n) {
  text(slide, frame(54, 674, 320, 22), "STAR Color｜一個人的 AI 美業經濟", {size:12, color:C.slate});
  text(slide, frame(1190, 674, 36, 22), String(n).padStart(2,"0"), {size:12, color:C.slate, align:"right"});
}
function chrome(slide, s, n, dark=false) {
  text(slide, frame(54, 42, 260, 22), s.kicker || "", {size:13, color: dark ? C.rose : C.magenta, bold:true});
  shape(slide, frame(42, 40, 4, 34), dark ? C.rose : C.magenta);
  footer(slide, n);
}
function title(slide, value, y = 74, dark=false) {
  text(slide, frame(54, y, 820, 104), value, {size:43, bold:true, color: dark ? C.white : C.ink, autoFit:"shrinkText"});
}
function bulletList(slide, items, x, y, w, opts = {}) {
  items.forEach((item, i) => {
    const yy = y + i * (opts.gap || 42);
    shape(slide, frame(x, yy + 9, 8, 8), opts.dot || C.magenta, {radius:4});
    text(slide, frame(x + 22, yy, w - 24, opts.h || 34), item, {size:opts.size || 23, color:opts.color || C.ink, bold:!!opts.bold});
  });
}
function pill(slide, f, label, opts={}) {
  shape(slide, f, opts.fill || C.white, {radius:18, line: opts.line || C.line});
  text(slide, frame(f.left+18, f.top+10, f.width-36, f.height-20), label, {size:opts.size || 20, color:opts.color || C.ink, bold:!!opts.bold, align:"center"});
}
function sectionBar(slide, y, label) {
  shape(slide, frame(54, y, 54, 2), C.magenta);
  text(slide, frame(122, y-11, 280, 24), label, {size:13, color:C.slate, bold:true});
}
async function cover(presentation, ctx, s, n) {
  const slide = presentation.slides.add();
  bg(slide, C.deep);
  await image(slide, ctx, frame(710, 0, 570, 720), s.image, {fit:"cover"});
  shape(slide, frame(0,0,1280,720), "rgba(34,36,39,0.44)");
  shape(slide, frame(54,68,4,74), C.magenta);
  text(slide, frame(74, 70, 320, 26), s.kicker, {size:14, color:C.rose, bold:true});
  text(slide, frame(72, 148, 620, 156), s.title, {size:64, bold:true, color:C.white, autoFit:"shrinkText"});
  text(slide, frame(76, 330, 520, 44), s.subtitle, {size:28, color:C.white});
  shape(slide, frame(76, 420, 560, 1), "rgba(255,255,255,0.34)");
  text(slide, frame(76, 454, 560, 36), s.note, {size:20, color:"#D7D2CA"});
  text(slide, frame(76, 640, 380, 26), "Ewalk.ai × 幻色鏡方 × 大美好學院", {size:14, color:"#BEB8AF"});
  return slide;
}
function statement(presentation, ctx, s, n) {
  const slide = presentation.slides.add(); bg(slide); chrome(slide, s, n); title(slide, s.title);
  bulletList(slide, s.body, 86, 242, 640, {size:30, gap:66, dot:C.teal});
  shape(slide, frame(792, 152, 360, 360), C.deep, {radius:0});
  text(slide, frame(838, 206, 268, 96), "不是產品說明", {size:38, color:C.white, bold:true, align:"center"});
  shape(slide, frame(884, 326, 180, 2), C.magenta);
  text(slide, frame(830, 364, 282, 82), "而是一套能被學習、營運與複製的創業系統", {size:25, color:"#EFEAE2", align:"center"});
  text(slide, frame(86, 598, 1000, 44), s.conclusion, {size:30, bold:true, color:C.magenta});
  return slide;
}
function formula(presentation, ctx, s, n) {
  const slide = presentation.slides.add(); bg(slide, C.ink); chrome(slide, s, n, true); title(slide, s.title, 82, true);
  const xs = [70, 300, 530, 760, 990];
  s.formula.forEach((item, i) => {
    shape(slide, frame(xs[i], 260, 170, 112), i===0 ? C.magenta : "#4A4D50", {radius:8});
    text(slide, frame(xs[i]+16, 292, 138, 48), item, {size:24, color:C.white, bold:true, align:"center"});
    if (i < s.formula.length - 1) text(slide, frame(xs[i]+184, 302, 40, 40), "+", {size:34, color:"#D6C0C8", bold:true, align:"center"});
  });
  text(slide, frame(258, 452, 760, 56), "= 一個人的 AI 美業經濟", {size:44, color:C.white, bold:true, align:"center"});
  text(slide, frame(252, 574, 780, 34), s.conclusion, {size:24, color:"#E7DFD3", align:"center"});
  return slide;
}
function organism(presentation, ctx, s, n) {
  const slide = presentation.slides.add(); bg(slide); chrome(slide, s, n); title(slide, s.title);
  const cx=640, cy=392;
  shape(slide, frame(cx-126, cy-126, 252, 252), C.ink, {radius:126});
  text(slide, frame(cx-90, cy-36, 180, 72), "AI 美業\n生命體", {size:34, color:C.white, bold:true, align:"center"});
  const pts = [[190,260],[470,238],[810,238],[1070,260],[322,520],[902,520]];
  s.parts.forEach((p,i)=>{
    const [x,y]=pts[i];
    shape(slide, frame(x, y, 188, 82), C.white, {radius:8, line:C.line});
    text(slide, frame(x+18,y+14,152,24), p[0], {size:18, color:C.magenta, bold:true, align:"center"});
    text(slide, frame(x+16,y+42,156,28), p[1], {size:17, color:C.ink, align:"center"});
  });
  return slide;
}
function market(presentation, ctx, s, n) {
  const slide = presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.cards.forEach((c,i)=>{
    const x = 72 + (i%2)*570, y = 230 + Math.floor(i/2)*170;
    shape(slide, frame(x,y,500,126), C.white, {radius:8, line:C.line});
    text(slide, frame(x+28,y+26,170,34), c[0], {size:28, color:C.magenta, bold:true});
    text(slide, frame(x+220,y+28,235,58), c[1], {size:21, color:C.ink});
  });
  text(slide, frame(118,620,1040,32), s.conclusion, {size:25, color:C.teal, bold:true, align:"center"});
  return slide;
}
function expectation(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide,C.paper); chrome(slide,s,n); title(slide,s.title);
  shape(slide, frame(76,210,512,360), C.white, {radius:10, line:C.line});
  shape(slide, frame(692,210,512,360), C.ink, {radius:10});
  text(slide, frame(116,244,430,34), s.leftTitle, {size:30, bold:true, color:C.magenta});
  bulletList(slide, s.left, 124, 318, 380, {size:24,gap:48});
  text(slide, frame(732,244,430,34), s.rightTitle, {size:30, bold:true, color:C.white});
  bulletList(slide, s.right, 740, 318, 380, {size:24,gap:48,color:C.white,dot:C.gold});
  text(slide, frame(190,622,900,34), s.conclusion, {size:25, bold:true, color:C.teal, align:"center"});
  return slide;
}
function system(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  shape(slide, frame(505,270,270,150), C.ink, {radius:75});
  text(slide, frame(540,312,200,54), s.center, {size:36, color:C.white, bold:true, align:"center"});
  const coords=[[116,224],[350,220],[812,220],[1040,224],[116,472],[350,500],[812,500],[1040,472]];
  s.modules.forEach((m,i)=>pill(slide, frame(coords[i][0],coords[i][1],170,58), m, {fill:i===7?C.magenta:C.white, color:i===7?C.white:C.ink, bold:true, size:18}));
  return slide;
}
function metrics(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide,C.ink); chrome(slide,s,n,true); title(slide,s.title,80,true);
  s.metrics.forEach((m,i)=>{
    const x=80+i*300;
    text(slide, frame(x,260,240,74), m[0], {size:56, color:i===3?C.gold:C.rose, bold:true, align:"center"});
    shape(slide, frame(x+28,350,184,1), "rgba(255,255,255,0.32)");
    text(slide, frame(x+8,378,224,82), m[1], {size:22, color:C.white, align:"center"});
  });
  text(slide, frame(172,590,936,42), s.conclusion, {size:25, color:"#E7DFD3", bold:true, align:"center"});
  return slide;
}
function flow(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  const w=145, y=316;
  s.steps.forEach((st,i)=>{
    const x=54+i*172;
    shape(slide, frame(x,y,w,88), i===0?C.magenta:C.white, {radius:8, line:i===0?"none":C.line});
    text(slide, frame(x+12,y+24,w-24,40), st, {size:20, color:i===0?C.white:C.ink, bold:true, align:"center"});
    if(i<s.steps.length-1) shape(slide, frame(x+w+9,y+43,18,2), C.line);
  });
  text(slide, frame(250,560,780,42), s.conclusion, {size:28, color:C.teal, bold:true, align:"center"});
  return slide;
}
async function academy(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  await image(slide, ctx, frame(720, 196, 430, 296), s.image, {fit:"contain", radius:8});
  bulletList(slide, s.bullets, 86, 232, 520, {size:27,gap:52,dot:C.magenta});
  text(slide, frame(86,612,850,34), s.conclusion, {size:25, color:C.teal, bold:true});
  return slide;
}
async function passport(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  await image(slide, ctx, frame(70,220,260,294), s.images[0], {fit:"cover", radius:8});
  await image(slide, ctx, frame(360,220,390,212), s.images[1], {fit:"cover", radius:8});
  await image(slide, ctx, frame(780,220,390,212), s.images[2], {fit:"cover", radius:8});
  bulletList(slide, s.bullets, 380, 480, 760, {size:20,gap:34,h:30,dot:C.teal});
  return slide;
}
function timeline(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  shape(slide, frame(132,386,1010,3), C.line);
  s.stages.forEach((st,i)=>{
    const x=132+i*252;
    shape(slide, frame(x-10,375,22,22), C.magenta, {radius:11});
    const top=i%2===0?420:260;
    text(slide, frame(x-70, top, 160,24), st[0], {size:20, color:C.ink, bold:true, align:"center"});
    text(slide, frame(x-92, top+36, 204,28), st[1], {size:22, color:C.magenta, bold:true, align:"center"});
    text(slide, frame(x-94, top+72, 208,42), st[2], {size:18, color:C.slate, align:"center"});
  });
  return slide;
}
function replication(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide,C.ink); chrome(slide,s,n,true); title(slide,s.title,78,true);
  s.ladder.forEach((r,i)=>{
    const x=120+i*220, y=276+i*22;
    shape(slide, frame(x,y,170,88), i===0?"#575A5E":(i===4?C.magenta:"#44474A"), {radius:6});
    text(slide, frame(x+20,y+18,130,28), r[0], {size:28,color:C.white,bold:true,align:"center"});
    text(slide, frame(x+18,y+52,134,22), r[1], {size:18,color:"#E9E3DA",align:"center"});
    if(i<4) text(slide, frame(x+174,y+20,44,34), "→", {size:30,color:C.rose,align:"center"});
  });
  text(slide, frame(202,584,876,34), s.conclusion, {size:25,color:C.white,bold:true,align:"center"});
  return slide;
}
function storemodel(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.cards.forEach((c,i)=>{
    const x=92+(i%2)*548, y=232+Math.floor(i/2)*160;
    shape(slide, frame(x,y,468,118), C.white, {radius:8,line:C.line});
    text(slide, frame(x+26,y+24,140,30), c[0], {size:28,color:C.magenta,bold:true});
    text(slide, frame(x+190,y+25,236,56), c[1], {size:20,color:C.ink});
  });
  text(slide, frame(156,622,968,34), s.conclusion, {size:24,color:C.teal,bold:true,align:"center"});
  return slide;
}
function brainloop(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide,C.deep); chrome(slide,s,n,true); title(slide,s.title,82,true);
  const cx=640, cy=420, r=168;
  s.loop.forEach((m,i)=>{
    const a=(-90+i*360/s.loop.length)*Math.PI/180;
    const x=cx+Math.cos(a)*r-76, y=cy+Math.sin(a)*r-34;
    pill(slide, frame(x,y,152,60), m, {fill:i===1?C.magenta:C.white,color:i===1?C.white:C.ink,bold:true,size:17});
  });
  shape(slide, frame(cx-94,cy-70,188,140), "#4A4D50", {radius:70});
  text(slide, frame(cx-70,cy-28,140,56), "Ewalk.ai\n行銷大腦", {size:28,color:C.white,bold:true,align:"center"});
  text(slide, frame(210,624,860,34), s.conclusion, {size:25,color:"#E7DFD3",bold:true,align:"center"});
  return slide;
}
function brainmodules(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.modules.forEach((m,i)=>{
    const x=82+(i%3)*390, y=220+Math.floor(i/3)*170;
    shape(slide, frame(x,y,340,122), C.white, {radius:8,line:C.line});
    text(slide, frame(x+24,y+22,292,30), m[0], {size:25,color:C.magenta,bold:true});
    text(slide, frame(x+24,y+62,286,42), m[1], {size:19,color:C.ink});
  });
  return slide;
}
function franchise(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.steps.forEach((st,i)=>{
    const x=92+(i%3)*372, y=238+Math.floor(i/3)*154;
    shape(slide, frame(x,y,304,104), i===0?C.magenta:C.white, {radius:8,line:i===0?"none":C.line});
    text(slide, frame(x+22,y+18,42,32), String(i+1).padStart(2,"0"), {size:26,color:i===0?C.white:C.magenta,bold:true});
    text(slide, frame(x+78,y+28,194,42), st, {size:24,color:i===0?C.white:C.ink,bold:true});
  });
  text(slide, frame(260,620,760,34), s.conclusion, {size:25,color:C.teal,bold:true,align:"center"});
  return slide;
}
function fit(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  shape(slide, frame(80,210,500,380), C.white, {radius:10,line:C.line});
  shape(slide, frame(700,210,420,380), "#F5E9ED", {radius:10,line:C.rose});
  text(slide, frame(118,246,390,34), "適合加入", {size:30,color:C.teal,bold:true});
  bulletList(slide, s.good, 124, 318, 390, {size:21,gap:42,dot:C.teal});
  text(slide, frame(738,246,300,34), "不適合", {size:30,color:C.magenta,bold:true});
  bulletList(slide, s.bad, 744, 328, 300, {size:21,gap:48,dot:C.magenta});
  return slide;
}
function demo(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide,C.ink); chrome(slide,s,n,true); title(slide,s.title,78,true);
  shape(slide, frame(90,250,420,250), "#46494C", {radius:10});
  text(slide, frame(124,300,350,52), "現場提問", {size:38,color:C.white,bold:true,align:"center"});
  text(slide, frame(124,368,350,58), "阿順即時回答\n加盟、教育、行銷大腦", {size:24,color:"#E7DFD3",align:"center"});
  bulletList(slide, s.bullets, 620, 246, 500, {size:24,gap:58,color:C.white,dot:C.gold});
  text(slide, frame(150,594,980,40), s.conclusion, {size:26,color:C.rose,bold:true,align:"center"});
  return slide;
}
function cta(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide,C.deep); chrome(slide,s,n,true); title(slide,s.title,76,true);
  shape(slide, frame(852,238,210,210), C.white, {radius:8});
  text(slide, frame(886,318,142,58), "QR\nCODE", {size:32,color:C.ink,bold:true,align:"center"});
  bulletList(slide, s.body, 118, 300, 620, {size:28,gap:62,color:C.white,dot:C.gold});
  text(slide, frame(110,600,780,50), s.conclusion, {size:38,color:C.white,bold:true});
  return slide;
}
const renderers={cover,statement,formula,organism,market,expectation,system,metrics,flow,academy,passport,timeline,replication,storemodel,brainloop,brainmodules,franchise,fit,demo,cta};
export function createDeckSlide(presentation, ctx, slideData, n){ return renderers[slideData.kind](presentation, ctx, slideData, n); }
export const slideData = __SLIDES__;
`;

async function main() {
  await fs.rm(workspace, { recursive: true, force: true });
  await fs.mkdir(slidesDir, { recursive: true });
  await fs.mkdir(assetDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  for (const [key, sourcePath] of Object.entries(SOURCE_ASSETS)) {
    await fs.copyFile(sourcePath, ASSETS[key]);
  }
  await fs.writeFile(
    path.join(workspace, "profile-plan.txt"),
    [
      "task mode: create / source-driven",
      "primary deck-profile: gtm-growth",
      "secondary gates: consumer-retail, strategy-leadership",
      "required proof objects: growth loop, education pathway, operating metrics, joining path",
      "brand constraints: use user-provided assets only; no invented logo mark",
      "missing inputs: exact franchise fee, rent, materials, expected gross margin, QR code",
      "",
    ].join("\n"),
  );
  await fs.writeFile(
    path.join(workspace, "claim-spine.txt"),
    slides
      .map((s, i) => `${String(i + 1).padStart(2, "0")} ${s.kicker}: ${s.title}`)
      .join("\n") + "\n",
  );
  await fs.writeFile(
    path.join(workspace, "source-notes.txt"),
    [
      "Sources: Obsidian notes created from user-provided STAR Color, 幻色鏡方, 大美好學院資料.",
      "Identity assets: user-provided screenshots and extracted reference images only.",
      "No external logos or pseudo marks generated.",
      "",
    ].join("\n"),
  );
  await fs.writeFile(
    path.join(slidesDir, "common.mjs"),
    common.replace("__SLIDES__", JSON.stringify(slides, null, 2)),
  );
  for (let i = 0; i < slides.length; i += 1) {
    const n = String(i + 1).padStart(2, "0");
    await fs.writeFile(
      path.join(slidesDir, `slide-${n}.mjs`),
      `import { createDeckSlide, slideData } from "./common.mjs";\nexport default function slide${n}(presentation, ctx) { return createDeckSlide(presentation, ctx, slideData[${i}], ${i + 1}); }\n`,
    );
  }

  const build = spawnSync(
    NODE,
    [
      path.join(SKILL_DIR, "scripts/build_artifact_deck.mjs"),
      "--slides-dir",
      slidesDir,
      "--out",
      pptxPath,
      "--preview-dir",
      previewDir,
      "--layout-dir",
      layoutDir,
      "--contact-sheet",
      contactSheetPath,
      "--slide-count",
      String(slides.length),
      "--workspace",
      workspace,
      "--scale",
      "1",
    ],
    {
      env: {
        ...process.env,
        PYTHON,
      },
      encoding: "utf8",
    },
  );
  if (build.status !== 0) {
    console.error(build.stdout);
    console.error(build.stderr);
    process.exit(build.status || 1);
  }
  console.log(build.stdout);
  await fs.writeFile(
    path.join(outputDir, "STAR_Color_0520_簡報製作說明.md"),
    [
      "# STAR Color 0520 簡報製作說明",
      "",
      `產出時間：${new Date().toISOString()}`,
      "",
      "## 已產出",
      "",
      "- `STAR_Color_0520_一個人的AI美業經濟.pptx`",
      "- `STAR_Color_0520_一個人的AI美業經濟_預覽.png`",
      "",
      "## 內容策略",
      "",
      "- 主軸：STAR Color = 一個人的 AI 美業經濟",
      "- 大美好學院：承載一個人的經濟的微型教育系統",
      "- Ewalk.ai：支援分店與總部作戰的行銷大腦",
      "- 幻色鏡方：AI 美業生命體的骨架",
      "",
      "## 待補資料",
      "",
      "- 正式 QR Code",
      "- 加盟費、租金、人力、材料成本、毛利率等財務試算",
      "- 5/20 現場時間、場地、流程",
      "",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
