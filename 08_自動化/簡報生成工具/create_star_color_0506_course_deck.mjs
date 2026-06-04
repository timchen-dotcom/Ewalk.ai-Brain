import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = "/Users/chenjinting/Desktop/Ewalk.ai 自動化系統";
const OUT_DIR = path.join(
  ROOT,
  "Ewalk.ai Brain/01_客戶/STAR Color/03_提案與交付/0506_AI染髮師課程簡報",
);
const SKILL_DIR =
  "/Users/chenjinting/.codex/plugins/cache/openai-primary-runtime/presentations/26.430.10722/skills/presentations";
const NODE = "/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node";
const PYTHON = "/Users/chenjinting/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const threadId = process.env.CODEX_THREAD_ID || `manual-${Date.now()}`;
const workspace = path.join("/private/tmp/codex-presentations", threadId, "star-color-0506-course");
const slidesDir = path.join(workspace, "slides");
const assetDir = path.join(workspace, "assets");
const previewDir = path.join(workspace, "preview");
const layoutDir = path.join(workspace, "layout");
const pptxPath = path.join(OUT_DIR, "STAR_Color_0506_AI染髮師社群行銷課程.pptx");
const contactSheetPath = path.join(OUT_DIR, "STAR_Color_0506_AI染髮師社群行銷課程_預覽.png");
const sourcePoster = "/Users/chenjinting/Downloads/5:6課程DM.png";
const poster = path.join(assetDir, "course-dm.png");

const slides = [
  {
    kind: "cover",
    kicker: "STAR COLOR｜AI HAIRSTYLIST COURSE",
    title: "從零開始的 AI 染髮師社群行銷課",
    subtitle: "用 ChatGPT、AI 圖像與 LINE 色彩顧問，讓染髮服務連動業績開發",
    meta: "3 小時實作課｜10:00 - 13:00",
  },
  {
    kind: "statement",
    kicker: "WHY THIS CLASS",
    title: "今天不是學發文，而是學會讓客人因為內容願意走進店裡。",
    points: ["染髮技術在現場完成價值", "社群內容負責把陌生人變成準客人", "AI 工具負責補足企劃、文案、圖像與判斷速度"],
    conclusion: "目標很簡單：讓每位 AI 染髮師，都能開始經營自己的客源。",
  },
  {
    kind: "agenda",
    kicker: "3-HOUR ROADMAP",
    title: "三小時只做一件事：建立可持續執行的業績開發流程。",
    blocks: [
      ["00:00-00:25", "社群觀念重置", "知道 2026 社群怎麼打"],
      ["00:25-01:10", "ChatGPT 文案規劃", "產出 7 天內容計畫"],
      ["01:10-01:50", "AI 圖像製作", "做出社群圖與活動海報"],
      ["01:50-02:25", "LINE 色彩顧問", "把底色判斷接回服務"],
      ["02:25-03:00", "業績開發與客單提升", "練一套可用話術"],
    ],
  },
  {
    kind: "outcomes",
    kicker: "TODAY'S OUTPUT",
    title: "下課前，每個人都要帶走 5 個可用成果。",
    items: ["一份 STAR Color 專屬 ChatGPT 指令", "一份 7 天社群內容表", "一組社群圖 / 海報生圖指令", "一套 LINE 色彩顧問使用 SOP", "一套現場客戶開發與加價話術"],
  },
  {
    kind: "mindset",
    kicker: "MINDSET RESET",
    title: "社群不是作品集，是店裡每天的客源開發機。",
    before: ["今天有空才發", "只放完工照", "文案想到什麼寫什麼", "客人看完沒有下一步"],
    after: ["每天有固定主題", "每篇內容都回答一個疑慮", "文案用 AI 先規劃再修正", "每篇都導向諮詢、預約或回訪"],
  },
  {
    kind: "strategy2026",
    kicker: "2026 SOCIAL STRATEGY",
    title: "2026 社群經營，AI 可以提高效率，但信任一定要來自真人現場。",
    rules: [
      ["原創優先", "平台更重視原創與即時內容，少做複製貼上。"],
      ["短影音先行", "用 15-30 秒回答一個問題，比長篇說明更容易被看完。"],
      ["保存與分享", "內容要能被收藏：髮色知識、避雷、保養、價格透明。"],
      ["現場真實感", "AI 圖可以做視覺，但真人髮況、過程、對話才建立信任。"],
      ["導回 LINE", "社群負責引起興趣，LINE 負責諮詢、判斷、預約與回訪。"],
    ],
  },
  {
    kind: "pillars",
    kicker: "STAR COLOR CONTENT PILLARS",
    title: "之後每一篇內容，都從這 6 類裡面選一類。",
    pillars: [
      ["AI 染髮知識", "讓客人理解我們不是傳統染髮"],
      ["髮色案例", "前後對比、底色、目標色、過程"],
      ["價格透明", "$999、加價項目、適合族群"],
      ["髮質保養", "染前、中、後的照顧與客單提升"],
      ["設計師 IP", "讓客人認識人，不只認識服務"],
      ["顧客疑慮", "白髮、布丁頭、漂髮、失敗修正"],
    ],
  },
  {
    kind: "skill",
    kicker: "CHATGPT SKILL",
    title: "先把 ChatGPT 訓練成 STAR Color 的社群助理。",
    blocks: [
      ["角色", "你是 STAR Color AI 染髮師的社群企劃助理"],
      ["任務", "幫我規劃文案、圖像、活動與客戶開發話術"],
      ["語氣", "專業、親切、透明、降低客人不安"],
      ["限制", "不誇大效果、不保證結果、不寫醫療式宣稱"],
    ],
    conclusion: "AI 不是代替你經營，而是讓你少卡住、快一點開始。",
  },
  {
    kind: "prompt",
    kicker: "PROMPT 01",
    title: "7 天文案規劃指令：先讓 AI 幫你排一週。",
    promptTitle: "複製這段給 ChatGPT",
    prompt: "請你成為 STAR Color AI 染髮師的社群企劃助理。我要經營在地染髮客源，客群是想快速、安全、價格透明染髮的上班族與白髮補染客。請幫我規劃 7 天 IG/FB 貼文與 Reels 主題，每天包含：主題、鉤子、文案大綱、畫面建議、CTA、LINE 諮詢引導。語氣要專業親切，避免誇大。",
    side: ["每天只解決一個問題", "每篇都要有 CTA", "先產出，再用自己的現場語氣修正"],
  },
  {
    kind: "quality",
    kicker: "QUALITY CONTROL",
    title: "AI 產出後，不是直接貼上，要用 5 個標準檢查。",
    checks: ["有沒有符合 STAR Color：AI、透明、專業、效率", "有沒有講人話，客人看得懂嗎", "有沒有現場感，不像罐頭文", "有沒有下一步：留言、私訊、LINE、預約", "有沒有避開誇大承諾與過度保證"],
  },
  {
    kind: "caption",
    kicker: "CAPTION FORMULA",
    title: "一篇社群文案，只要照這個 5 段式。",
    steps: [
      ["1 秒鉤子", "你是不是每次染完都怕退色？"],
      ["問題共鳴", "很多人不是不想染，是怕顏色跟想像不同。"],
      ["專業解法", "STAR Color 會先看底色，再用 AI 配方建立紀錄。"],
      ["現場證據", "今天這位客人原本是 X 底色，目標是 Y。"],
      ["行動引導", "想知道你適合什麼髮色，可以傳照片到 LINE。"],
    ],
  },
  {
    kind: "imageflow",
    kicker: "AI IMAGE WORKFLOW",
    title: "用 ChatGPT 做圖，不是叫它變漂亮，而是先把商業目的講清楚。",
    flow: ["目的", "受眾", "主訊息", "畫面元素", "尺寸", "品牌風格", "CTA"],
    conclusion: "先定策略，再做圖，圖片才會幫你賣服務。",
  },
  {
    kind: "prompt",
    kicker: "PROMPT 02",
    title: "社群圖 / 海報生圖指令：維持一致風格。",
    promptTitle: "複製這段給 ChatGPT Images",
    prompt: "請製作一張 STAR Color AI 染髮師社群圖，尺寸 1080x1350。視覺風格：藍紫科技感、透明玻璃資訊卡、柔和霓虹光、專業美業質感。主標題：『先判斷底色，再決定髮色』。畫面有一位自然時尚的染髮客人、AI 髮色分析介面、色環元素。文字要少、清楚、可閱讀。下方 CTA：『傳照片到 LINE，先做髮色分析』。不要過度科幻，不要廉價促銷感。",
    side: ["尺寸先講清楚", "主標題只留一句", "每張圖只放一個 CTA"],
  },
  {
    kind: "advisor",
    kicker: "LINE COLOR ADVISOR",
    title: "LINE 色彩顧問的價值：降低底色判斷失誤，讓配方更穩。",
    left: ["髮型師現場拍攝客人頭髮", "AI 協助判斷目前底色", "回推目標色與可能風險", "降低 AI 染髮機配方錯誤機率"],
    right: ["它不是取代專業判斷", "它是第二雙眼睛", "讓新手更穩，讓資深更快", "也讓顧客感覺更安心"],
  },
  {
    kind: "sop",
    kicker: "SOP",
    title: "LINE 色彩顧問使用流程：現場照這 6 步走。",
    steps: ["拍攝自然光髮況", "避開濾鏡與強反光", "傳給 LINE 色彩顧問", "讀取底色判斷", "與肉眼判斷交叉確認", "再進入 AI 配方與服務說明"],
  },
  {
    kind: "funnel",
    kicker: "BUSINESS LINK",
    title: "三個工具怎麼跟業績連動？用這條線看就懂。",
    steps: ["社群內容引起興趣", "LINE 收照片做分析", "底色判斷建立專業感", "推薦目標色與保養方案", "預約到店", "染前中後加值", "回訪再消費"],
  },
  {
    kind: "analysis",
    kicker: "HAIR COLOR ANALYSIS",
    title: "髮色分析內容，是 2026 最適合 AI 染髮師的客戶開發入口。",
    cards: [
      ["為什麼有效", "客人不用先預約，就能得到一個專業回饋。"],
      ["怎麼拍", "請客人傳自然光髮況、正面、側面、髮尾近照。"],
      ["怎麼回", "先說目前底色，再說適合方向，最後邀約諮詢。"],
      ["怎麼變現", "把分析結果接到染前護理、染中保養、染後居家護理。"],
    ],
  },
  {
    kind: "script",
    kicker: "SALES SCRIPT",
    title: "提升客單，不是硬賣，是把風險講清楚。",
    rows: [
      ["底色不均", "你的髮尾跟髮根底色差比較大，若直接染容易有色差。", "染前修護 / 分段處理"],
      ["髮質偏乾", "這次目標色需要讓髮質看起來有光澤，建議染中加保養。", "染中保養"],
      ["退色風險", "這類色系漂亮，但回家後保養會影響持色度。", "居家護理"],
    ],
  },
  {
    kind: "calendar",
    kicker: "7-DAY EXECUTION",
    title: "第一週不要想太多，先照這張表執行。",
    days: [
      ["Day 1", "自我介紹", "我是誰、我能幫你解決什麼"],
      ["Day 2", "底色知識", "為什麼染前要判斷底色"],
      ["Day 3", "案例分享", "一位客人的髮色分析"],
      ["Day 4", "價格透明", "$999 適合誰、不適合誰"],
      ["Day 5", "保養提醒", "染後怎麼讓髮色更持久"],
      ["Day 6", "LINE 分析", "邀請客人傳照片"],
      ["Day 7", "本週回顧", "整理 3 個常見問題"],
    ],
  },
  {
    kind: "dashboard",
    kicker: "MANAGER VIEW",
    title: "身為經營者，每週只看 6 個數字。",
    metrics: ["發文數", "短影音數", "私訊 / LINE 數", "照片分析數", "預約數", "加值服務數"],
    conclusion: "有紀錄，才知道社群有沒有真的帶來業績。",
  },
  {
    kind: "workshop",
    kicker: "IN-CLASS WORKSHOP",
    title: "現場實作：每個人完成自己的 7 天社群啟動包。",
    tasks: ["把 STAR Color 指令貼進 ChatGPT", "產出自己的 7 天內容表", "選 1 天做成完整文案", "產出 1 張社群圖指令", "練習一段髮色分析回覆話術"],
    note: "做完才算學會；能重複做，才算開始經營。",
  },
  {
    kind: "closing",
    kicker: "NEXT STEP",
    title: "AI 染髮師的價值，不只在會染，而是在能持續讓客人理解你。",
    lines: ["技術讓客人變美", "內容讓客人相信你", "AI 讓你更快開始", "系統讓你可以持續"],
    conclusion: "今天開始，每一位染髮師都要變成自己的客源經營者。",
  },
];

const common = String.raw`
const W = 1280;
const H = 720;
const C = {
  navy: "#061142",
  deep: "#081B5C",
  indigo: "#182EA8",
  purple: "#7B45FF",
  violet: "#B083FF",
  cyan: "#59D8FF",
  ice: "#EAF3FF",
  white: "#FFFFFF",
  ink: "#081252",
  line: "rgba(255,255,255,0.36)",
  glass: "rgba(255,255,255,0.16)",
  glass2: "rgba(255,255,255,0.24)",
  darkGlass: "rgba(5,18,70,0.62)",
  gold: "#FFE07A",
};
const FONT = "Arial";
function fixed(v){ return {mode:"fixed", value:v}; }
function frame(left, top, width, height){ return {left, top, width, height}; }
function add(slide, node, f){ return slide.compose(node, { frame: f }); }
function shape(slide, f, fill, opts = {}) {
  const line = opts.line === "none" || opts.line === undefined ? undefined : {fill:opts.line, width:opts.lineWidth || 1};
  return add(slide, {kind:"shape", geometry:opts.geometry || "rect", width:fixed(f.width), height:fixed(f.height), fill, line, borderRadius:opts.radius || 0}, f);
}
function text(slide, f, value, opts = {}) {
  return add(slide, {kind:"text", value, width:fixed(f.width), height:fixed(f.height), style:{
    typeface:opts.typeface || FONT,
    fontSize:opts.size || 26,
    color:opts.color || C.white,
    bold:!!opts.bold,
    alignment:opts.align || "left",
    insets:opts.insets || {top:0,right:0,bottom:0,left:0},
    autoFit:opts.autoFit || "shrinkText",
  }}, f);
}
async function image(slide, ctx, f, source, opts = {}) {
  return ctx.addImage(slide, {path:source, left:f.left, top:f.top, width:f.width, height:f.height, fit:opts.fit || "cover", alt:opts.alt || ""});
}
function bg(slide){
  shape(slide, frame(0,0,W,H), C.navy);
  shape(slide, frame(0,0,W,H), "rgba(60,100,255,0.22)");
  shape(slide, frame(0,632,W,88), "rgba(255,255,255,0.08)");
}
function footer(slide,n){
  text(slide, frame(56,674,420,22), "Ewalk.ai × STAR Color｜AI 染髮師社群行銷課", {size:12,color:"rgba(255,255,255,0.68)"});
  text(slide, frame(1194,674,34,22), String(n).padStart(2,"0"), {size:12,color:"rgba(255,255,255,0.68)",align:"right"});
}
function chrome(slide,s,n){
  text(slide, frame(56,42,360,22), s.kicker || "", {size:13,color:C.cyan,bold:true});
  shape(slide, frame(42,39,5,38), C.violet, {radius:3});
  footer(slide,n);
}
function title(slide,value,y=80,w=930){
  text(slide, frame(56,y,w,104), value, {size:42,color:C.white,bold:true,autoFit:"shrinkText"});
}
function glass(slide,f,opts={}){
  shape(slide, f, opts.fill || C.glass, {radius:opts.radius || 18, line:opts.line || C.line});
}
function bulletList(slide, items, x, y, w, opts={}){
  items.forEach((item,i)=>{
    const yy=y+i*(opts.gap || 44);
    shape(slide, frame(x,yy+11,9,9), opts.dot || C.cyan, {radius:5});
    text(slide, frame(x+24,yy,w-24,opts.h || 36), item, {size:opts.size || 23,color:opts.color || C.white,bold:!!opts.bold});
  });
}
function chip(slide,f,label,opts={}){
  glass(slide,f,{fill:opts.fill || "rgba(255,255,255,0.12)", line:opts.line || "rgba(255,255,255,0.32)", radius:18});
  text(slide, frame(f.left+18,f.top+10,f.width-36,f.height-20), label, {size:opts.size || 19,color:opts.color || C.white,bold:!!opts.bold,align:"center"});
}
function neonNumber(slide,x,y,n){
  shape(slide, frame(x,y,64,64), "rgba(89,216,255,0.24)", {radius:32,line:"rgba(255,255,255,0.42)"});
  text(slide, frame(x,y+14,64,32), n, {size:25,bold:true,align:"center"});
}
async function cover(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide);
  await image(slide,ctx,frame(760,0,520,720),ctx.assets.poster,{fit:"cover"});
  shape(slide, frame(720,0,560,720), "rgba(8,15,65,0.32)");
  shape(slide, frame(0,0,1280,720), "rgba(6,17,66,0.10)");
  text(slide, frame(58,58,320,48), "EWALK.ai", {size:42,bold:true});
  text(slide, frame(62,122,470,34), s.kicker, {size:15,color:C.cyan,bold:true});
  text(slide, frame(62,204,640,150), s.title, {size:58,bold:true,autoFit:"shrinkText"});
  text(slide, frame(66,380,610,64), s.subtitle, {size:25,color:C.ice});
  glass(slide, frame(66,504,486,78), {fill:"rgba(255,255,255,0.15)"});
  text(slide, frame(96,528,426,30), s.meta, {size:24,bold:true,align:"center"});
  text(slide, frame(62,674,420,22), "Ewalk.ai × STAR Color｜AI 染髮師社群行銷課", {size:12,color:"rgba(255,255,255,0.68)"});
  return slide;
}
function statement(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title,86,920);
  bulletList(slide,s.points,90,260,650,{size:28,gap:62});
  glass(slide, frame(790,218,360,270), {fill:C.darkGlass});
  text(slide, frame(828,268,284,48), "社群的任務", {size:34,bold:true,align:"center"});
  shape(slide, frame(872,338,196,2), C.cyan);
  text(slide, frame(826,374,288,66), "把還沒見面的客人\n先帶到你的專業裡", {size:24,align:"center",color:C.ice});
  text(slide, frame(98,594,1000,36), s.conclusion, {size:29,bold:true,color:C.gold,align:"center"});
  return slide;
}
function agenda(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title,78,980);
  s.blocks.forEach((b,i)=>{
    const y=200+i*84;
    glass(slide, frame(76,y,1128,62), {fill:i===0?"rgba(123,69,255,0.35)":C.glass});
    text(slide, frame(106,y+18,150,24), b[0], {size:18,bold:true,color:C.cyan});
    text(slide, frame(292,y+14,260,30), b[1], {size:24,bold:true});
    text(slide, frame(590,y+16,520,28), b[2], {size:21,color:C.ice});
  });
  return slide;
}
function outcomes(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.items.forEach((item,i)=>{
    const x=90+(i%3)*370, y=220+Math.floor(i/3)*150;
    glass(slide, frame(x,y,312,104), {fill:i===0?"rgba(89,216,255,0.18)":C.glass});
    neonNumber(slide,x+22,y+20,String(i+1).padStart(2,"0"));
    text(slide, frame(x+104,y+26,178,50), item, {size:23,bold:true});
  });
  return slide;
}
function mindset(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  glass(slide, frame(90,226,480,350), {fill:"rgba(255,255,255,0.12)"});
  glass(slide, frame(710,226,480,350), {fill:"rgba(89,216,255,0.17)"});
  text(slide, frame(130,260,360,34), "以前的發文", {size:31,bold:true,color:C.violet});
  bulletList(slide,s.before,140,330,360,{size:24,gap:50,dot:C.violet});
  text(slide, frame(750,260,360,34), "之後的經營", {size:31,bold:true,color:C.cyan});
  bulletList(slide,s.after,760,330,360,{size:24,gap:50,dot:C.cyan});
  return slide;
}
function strategy2026(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title,74,1040);
  s.rules.forEach((r,i)=>{
    const x=74+(i%2)*570, y=208+Math.floor(i/2)*130;
    glass(slide, frame(x,y,510,98), {fill:i===4?"rgba(255,224,122,0.16)":C.glass});
    text(slide, frame(x+26,y+20,136,30), r[0], {size:27,bold:true,color:i===4?C.gold:C.cyan});
    text(slide, frame(x+188,y+20,282,44), r[1], {size:20,color:C.ice});
  });
  return slide;
}
function pillars(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.pillars.forEach((p,i)=>{
    const x=72+(i%3)*390, y=218+Math.floor(i/3)*165;
    glass(slide, frame(x,y,340,118), {fill:C.glass});
    text(slide, frame(x+24,y+22,260,30), p[0], {size:26,bold:true,color:C.cyan});
    text(slide, frame(x+24,y+62,286,40), p[1], {size:19,color:C.ice});
  });
  return slide;
}
function skill(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.blocks.forEach((b,i)=>{
    const x=100+(i%2)*540, y=228+Math.floor(i/2)*150;
    glass(slide, frame(x,y,450,108), {fill:i===0?"rgba(123,69,255,0.26)":C.glass});
    text(slide, frame(x+28,y+22,92,30), b[0], {size:27,bold:true,color:C.cyan});
    text(slide, frame(x+140,y+24,270,42), b[1], {size:22,color:C.ice});
  });
  text(slide, frame(170,598,940,36), s.conclusion, {size:27,bold:true,color:C.gold,align:"center"});
  return slide;
}
function prompt(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title,76,980);
  glass(slide, frame(72,214,770,360), {fill:"rgba(255,255,255,0.92)", line:"rgba(255,255,255,0.60)"});
  text(slide, frame(106,244,280,28), s.promptTitle, {size:20,bold:true,color:C.indigo});
  text(slide, frame(106,292,684,206), s.prompt, {size:22,color:C.ink});
  glass(slide, frame(900,228,280,320), {fill:C.darkGlass});
  bulletList(slide,s.side,928,282,220,{size:22,gap:72,dot:C.gold});
  return slide;
}
function quality(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.checks.forEach((c,i)=>{
    const y=210+i*78;
    glass(slide, frame(110,y,1060,56), {fill:i%2===0?"rgba(89,216,255,0.14)":C.glass});
    text(slide, frame(142,y+14,50,24), String(i+1).padStart(2,"0"), {size:22,bold:true,color:C.cyan});
    text(slide, frame(220,y+12,860,28), c, {size:23,color:C.ice});
  });
  return slide;
}
function caption(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.steps.forEach((st,i)=>{
    const x=82+i*236;
    glass(slide, frame(x,238,194,270), {fill:i===0?"rgba(123,69,255,0.28)":C.glass});
    text(slide, frame(x+20,264,154,30), st[0], {size:25,bold:true,color:C.cyan,align:"center"});
    shape(slide, frame(x+42,316,110,2), C.violet);
    text(slide, frame(x+20,352,154,100), st[1], {size:20,color:C.ice,align:"center"});
  });
  return slide;
}
function imageflow(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title,80,1020);
  s.flow.forEach((f,i)=>{
    const x=80+i*166;
    chip(slide, frame(x,320,126,62), f, {fill:i===0?"rgba(89,216,255,0.24)":C.glass,bold:true,size:21});
    if(i<s.flow.length-1) shape(slide, frame(x+136,350,28,2), C.cyan);
  });
  text(slide, frame(212,564,856,38), s.conclusion, {size:30,bold:true,color:C.gold,align:"center"});
  return slide;
}
function advisor(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title,78,1020);
  glass(slide, frame(92,226,500,350), {fill:C.glass});
  glass(slide, frame(688,226,500,350), {fill:"rgba(89,216,255,0.17)"});
  text(slide, frame(132,260,400,32), "它幫你做什麼", {size:30,bold:true,color:C.cyan});
  bulletList(slide,s.left,142,330,370,{size:23,gap:48,dot:C.cyan});
  text(slide, frame(728,260,400,32), "它不是什麼", {size:30,bold:true,color:C.gold});
  bulletList(slide,s.right,738,330,370,{size:23,gap:48,dot:C.gold});
  return slide;
}
function sop(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.steps.forEach((st,i)=>{
    const x=86+(i%3)*384, y=222+Math.floor(i/3)*170;
    glass(slide, frame(x,y,318,112), {fill:i===0?"rgba(89,216,255,0.20)":C.glass});
    text(slide, frame(x+22,y+20,50,30), String(i+1).padStart(2,"0"), {size:27,bold:true,color:C.cyan});
    text(slide, frame(x+88,y+28,200,40), st, {size:24,bold:true,color:C.ice});
  });
  return slide;
}
function funnel(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.steps.forEach((st,i)=>{
    const x=56+i*174, y=326;
    glass(slide, frame(x,y,138,88), {fill:i===0?"rgba(123,69,255,0.32)":C.glass});
    text(slide, frame(x+12,y+20,114,44), st, {size:19,bold:true,align:"center"});
    if(i<s.steps.length-1) shape(slide, frame(x+146,y+44,20,2), C.cyan);
  });
  return slide;
}
function analysis(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title,76,1040);
  s.cards.forEach((c,i)=>{
    const x=90+(i%2)*550, y=226+Math.floor(i/2)*158;
    glass(slide, frame(x,y,460,112), {fill:C.glass});
    text(slide, frame(x+28,y+22,140,30), c[0], {size:27,bold:true,color:C.cyan});
    text(slide, frame(x+190,y+20,220,52), c[1], {size:20,color:C.ice});
  });
  return slide;
}
function script(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  const y0=220;
  ["情境","建議說法","加值方向"].forEach((h,i)=>{
    const xs=[72,252,840][i], ws=[150,540,300][i];
    text(slide, frame(xs,y0,ws,30), h, {size:21,bold:true,color:C.cyan,align:i===1?"left":"center"});
  });
  s.rows.forEach((r,i)=>{
    const y=y0+54+i*112;
    glass(slide, frame(58,y-12,1120,86), {fill:i===1?"rgba(89,216,255,0.14)":C.glass});
    text(slide, frame(84,y+14,118,28), r[0], {size:23,bold:true,color:C.gold,align:"center"});
    text(slide, frame(252,y+4,530,44), r[1], {size:20,color:C.ice});
    text(slide, frame(862,y+14,230,28), r[2], {size:23,bold:true,color:C.white,align:"center"});
  });
  return slide;
}
function calendar(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.days.forEach((d,i)=>{
    const x=58+(i%4)*304, y=214+Math.floor(i/4)*160;
    glass(slide, frame(x,y,256,118), {fill:i===0?"rgba(123,69,255,0.28)":C.glass});
    text(slide, frame(x+22,y+18,74,24), d[0], {size:20,bold:true,color:C.cyan});
    text(slide, frame(x+22,y+50,120,28), d[1], {size:25,bold:true,color:C.white});
    text(slide, frame(x+22,y+78,205,24), d[2], {size:16,color:C.ice});
  });
  return slide;
}
function dashboard(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  s.metrics.forEach((m,i)=>{
    const x=112+(i%3)*356, y=240+Math.floor(i/3)*156;
    glass(slide, frame(x,y,280,104), {fill:C.glass});
    text(slide, frame(x+24,y+20,52,34), String(i+1), {size:32,bold:true,color:C.cyan});
    text(slide, frame(x+92,y+30,150,30), m, {size:25,bold:true});
  });
  text(slide, frame(210,604,860,32), s.conclusion, {size:26,bold:true,color:C.gold,align:"center"});
  return slide;
}
function workshop(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title);
  bulletList(slide,s.tasks,128,230,770,{size:28,gap:64,dot:C.cyan});
  glass(slide, frame(870,260,260,220), {fill:C.darkGlass});
  text(slide, frame(904,312,192,78), "30 分鐘\n完成第一版", {size:35,bold:true,align:"center"});
  text(slide, frame(150,612,980,34), s.note, {size:28,bold:true,color:C.gold,align:"center"});
  return slide;
}
function closing(presentation,ctx,s,n){
  const slide=presentation.slides.add(); bg(slide); chrome(slide,s,n); title(slide,s.title,82,960);
  s.lines.forEach((line,i)=>{
    chip(slide, frame(140+i*250,310,190,70), line, {fill:i===2?"rgba(89,216,255,0.24)":C.glass,bold:true,size:24});
  });
  text(slide, frame(124,560,1030,48), s.conclusion, {size:36,bold:true,color:C.gold,align:"center"});
  return slide;
}
const renderers={cover,statement,agenda,outcomes,mindset,strategy2026,pillars,skill,prompt,quality,caption,imageflow,advisor,sop,funnel,analysis,script,calendar,dashboard,workshop,closing};
export async function createDeckSlide(presentation, ctx, slideData, n){ return renderers[slideData.kind](presentation, ctx, slideData, n); }
export const slideData = __SLIDES__;
`;

const promptPack = `# STAR Color AI 染髮師社群行銷 Skill v1

用途：給 STAR Color 染髮師複製到 ChatGPT，讓後續文案、社群圖、海報、髮色分析話術維持一致。

## 一次貼上的角色設定

你是 STAR Color AI 染髮師的社群企劃助理。
你要協助染髮師經營在地客源，內容必須符合 STAR Color 的品牌方向：AI 智能染髮、價格透明、底色判斷、配方紀錄、專業但親切、降低客人第一次染髮的不安。

請遵守：
- 用一般客人聽得懂的語言，不要太學術。
- 不誇大效果，不保證染出指定成果。
- 每篇內容都要有一個明確 CTA：留言、私訊、傳 LINE、預約、到店諮詢。
- 內容要能帶回業績：新客、回訪、加值保養、居家護理。

## 指令 1：規劃 7 天社群內容

請幫我規劃 STAR Color AI 染髮師的 7 天 IG/FB 內容表。目標客群是想快速、安全、價格透明染髮的上班族、白髮補染客、對髮色不確定的人。每天請包含：
1. 主題
2. 1 秒鉤子
3. 文案大綱
4. Reels 畫面建議
5. 圖像建議
6. CTA
7. LINE 諮詢引導

## 指令 2：寫單篇文案

請根據以下主題寫一篇 STAR Color 社群文案：
主題：
客人情境：
希望引導的服務：

格式請用：
1. 1 秒鉤子
2. 問題共鳴
3. STAR Color 專業解法
4. 現場說明
5. CTA

## 指令 3：產生社群圖 / 海報提示詞

請幫我產生一段 ChatGPT Images 可用的生圖提示詞。
主題：
主標題：
CTA：
尺寸：

視覺風格請固定：藍紫科技感、透明玻璃資訊卡、柔和霓虹光、專業美業質感、AI 髮色分析介面、色環元素。文字要少、清楚、可閱讀，不要過度科幻，不要廉價促銷感。

## 指令 4：髮色分析回覆話術

請根據客人的髮況照片描述，幫我產生一段 LINE 回覆話術。
目前底色：
目標色：
髮質狀態：
可能風險：

格式：
1. 先肯定客人想要的方向
2. 說明目前底色
3. 說明達成目標色的注意事項
4. 建議是否需要染前 / 染中 / 染後保養
5. 引導預約或現場諮詢

## 指令 5：每週成效檢討

請根據我這週的數字，幫我判斷下週內容怎麼修正：
發文數：
短影音數：
私訊 / LINE 數：
照片分析數：
預約數：
加值服務數：

請輸出：
1. 本週問題
2. 下週內容方向
3. 三個可立即發布的主題
4. 一個業績開發動作
`;

async function main() {
  await fs.rm(workspace, { recursive: true, force: true });
  await fs.mkdir(slidesDir, { recursive: true });
  await fs.mkdir(assetDir, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.copyFile(sourcePoster, poster);

  await fs.writeFile(path.join(workspace, "profile-plan.txt"), [
    "task mode: create / training deck",
    "deck-profile: education-workshop + consumer-retail",
    "visual target: user-provided Ewalk.ai AI hairstylist DM; blue-purple futuristic, glass panels, AI analytics UI",
    "audience: STAR Color dye stylists who are also store operators, zero foundation in social marketing",
    "must-have: ChatGPT 7-day copy plan, AI image creation, LINE color advisor, sales linkage, 2026 social strategy, upsell scripts",
    "",
  ].join("\n"));
  await fs.writeFile(path.join(workspace, "source-notes.txt"), [
    "User-provided poster: /Users/chenjinting/Downloads/5:6課程DM.png",
    "Current social strategy references checked: Meta 2026 AI performance, TikTok Next 2026, Sprout Social Instagram trends 2026, Metricool 2026 Social Media Study.",
    "",
  ].join("\n"));
  await fs.writeFile(
    path.join(workspace, "claim-spine.txt"),
    slides.map((s, i) => `${String(i + 1).padStart(2, "0")} ${s.kicker}: ${s.title}`).join("\n") + "\n",
  );
  await fs.writeFile(
    path.join(slidesDir, "common.mjs"),
    common.replace("__SLIDES__", JSON.stringify(slides, null, 2)),
  );
  for (let i = 0; i < slides.length; i += 1) {
    const n = String(i + 1).padStart(2, "0");
    await fs.writeFile(
      path.join(slidesDir, `slide-${n}.mjs`),
      `import { createDeckSlide, slideData } from "./common.mjs";\nexport default async function slide${n}(presentation, ctx) { ctx.assets = { poster: ${JSON.stringify(poster)} }; return createDeckSlide(presentation, ctx, slideData[${i}], ${i + 1}); }\n`,
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
    { env: { ...process.env, PYTHON }, encoding: "utf8" },
  );
  if (build.status !== 0) {
    console.error(build.stdout);
    console.error(build.stderr);
    process.exit(build.status || 1);
  }
  console.log(build.stdout);

  await fs.writeFile(path.join(OUT_DIR, "STAR_Color_AI染髮師社群行銷Skill_學員指令包.md"), promptPack);
  await fs.writeFile(path.join(OUT_DIR, "STAR_Color_0506_課程製作說明.md"), [
    "# STAR Color 0506 AI 染髮師社群行銷課程製作說明",
    "",
    `產出時間：${new Date().toISOString()}`,
    "",
    "## 已產出",
    "",
    "- `STAR_Color_0506_AI染髮師社群行銷課程.pptx`",
    "- `STAR_Color_0506_AI染髮師社群行銷課程_預覽.png`",
    "- `STAR_Color_AI染髮師社群行銷Skill_學員指令包.md`",
    "",
    "## 課程設計",
    "",
    "- 對象：STAR Color 染髮師，同時也是門店經營者",
    "- 時間：3 小時",
    "- 目標：讓零基礎學員能用 ChatGPT 建立 7 天內容、做圖、使用 LINE 色彩顧問，並接回業績開發",
    "- 視覺：沿用使用者提供的藍紫 AI 髮型師 DM 風格",
    "",
    "## 待確認",
    "",
    "- LINE 色彩顧問實際操作畫面是否要補截圖",
    "- STAR Color 正式 Logo / 店家 QR Code 是否要放入最後頁",
    "- 是否需要加入現場作業紙本版",
    "",
  ].join("\n"));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
