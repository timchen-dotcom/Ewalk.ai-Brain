from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE_MD = ROOT.parent / "STAR_Color_0520加盟簡報0511.md"
OUT = ROOT / "gpt_image2_fullslide_prompts.json"
BRAND_KIT = "../../../01_品牌資料/簡報生成品牌包/brand_kit.json"

FINANCE_FRANCHISE_SOURCE_IDS = {"16", "17", "18", "19", "20", "21", "21-1", "22", "23", "24"}
BUSINESS_MANAGER_SOURCE_IDS = FINANCE_FRANCHISE_SOURCE_IDS | {"28", "29", "30", "31"}

MACHINE_VENDOR_PAGES = [
    {
        "source_slide": "MV-1",
        "role": "machine-vendor",
        "headline": "機器出場：芯色彩全新 AI 智能調色機",
        "supporting_text": "此段落由機器廠商上台，先讓觀眾理解 AI 染髮機不是展示道具，而是 STAR Color 標準化服務的技術核心。",
        "must_include_text": [
            "機器出場：芯色彩全新 AI 智能調色機",
            "機器廠商上台",
            "芯色彩 AI 智能色彩引擎系統",
            "全新染髮體驗",
            "八大特點",
        ],
        "visual_scene": (
            "Machine vendor stage reveal in STAR Color 0512 Keynote style: premium blue-violet conference stage, "
            "official white cylindrical AI hair-color machine, spotlight reveal, product closeups, color-formula interface."
        ),
        "chart_or_structure": "產品出場舞台 + 機器核心模組環繞，作為廠商上台的過場頁。",
    },
    {
        "source_slide": "MV-2",
        "role": "machine-vendor",
        "headline": "把調色從手感，變成可量測的系統。",
        "supporting_text": "廠商段落的技術重點：機器把配方、辨識、秤量與調配流程標準化，讓染髮服務更容易訓練與複製。",
        "must_include_text": [
            "把調色從手感，變成可量測的系統。",
            "3 大自研晶片",
            "12 色自研配色體系",
            "20 項國家專利",
            "50 秒調配完成配方",
            "智能識別",
            "精準電子秤",
            "自動調配",
        ],
        "visual_scene": (
            "Technical product keynote page: AI chip glow, formula canisters, machine screen, precision scale, "
            "automated color mixing modules, clean premium technology layout."
        ),
        "chart_or_structure": "八大特點中的技術重點卡片，最多用 3-4 個大數字與短標籤呈現。",
    },
    {
        "source_slide": "MV-3",
        "role": "machine-vendor",
        "headline": "配方不是存在腦袋，而是在雲端持續更新。",
        "supporting_text": "把機器連到雲端配色中心、色彩資料庫與門店後台，讓 AI 染髮機成為可累積資料、可管理、可更新的營運系統。",
        "must_include_text": [
            "配方不是存在腦袋，而是在雲端持續更新。",
            "雲端智能配色中心",
            "711+ 色彩資料庫",
            "色彩配方雲端自動更新",
            "終端門店後台管理系統",
            "智能色彩溝通營銷系統",
        ],
        "visual_scene": (
            "Cloud color formula system: AI hair-color machine connected to cloud color database, salon app screens, "
            "branch backend dashboard, color formula data streams, premium blue-violet galaxy network."
        ),
        "chart_or_structure": "機器 → 雲端配色中心 → 色彩資料庫 → 門店後台 → 顧客服務的資料流。",
    },
]

AD_PERFORMANCE_PAGES = [
    {
        "source_slide": "AD-1",
        "role": "ad-performance",
        "headline": "不是還沒開始，市場已經在回應。",
        "supporting_text": "用目前廣告數據證明 STAR Color 的 AI 智能染髮、透明價格與主視覺已經取得市場注意，作為行銷大腦段落的前導。",
        "must_include_text": [
            "不是還沒開始，市場已經在回應。",
            "曝光 287,109",
            "觸及 128,021",
            "傳訊 609",
            "貼文互動 56,475",
            "心情 364",
        ],
        "visual_scene": (
            "Advertising performance command center in STAR Color 0512 Keynote style: blue-violet data stage, "
            "Meta ads inspired metric dashboard, galaxy data streams, premium AI beauty marketing energy."
        ),
        "chart_or_structure": "大型 KPI 數字卡 + 星河資料流，只呈現現有投放數據，不寫保證成效。",
    },
    {
        "source_slide": "AD-2",
        "role": "ad-performance",
        "headline": "女性 25–44，是目前最明確的市場訊號。",
        "supporting_text": "投放回應顯示女性客群為主，25–44 區間明顯，35–44 歲表現突出，代表白髮補染、價格透明與穩定品質具有切入點。",
        "must_include_text": [
            "女性 25–44，是目前最明確的市場訊號。",
            "女性觸及為主",
            "25–44 歲區間明顯",
            "35–44 歲表現突出",
            "價格透明",
            "穩定品質",
        ],
        "visual_scene": (
            "Audience insight slide in premium AI beauty keynote style: female audience profile, age-band light spectrum, "
            "hair-color energy ribbons, clean analytics cards, no stock-photo feeling."
        ),
        "chart_or_structure": "受眾雷達 / 年齡帶光譜 / 女性主力客群卡，避免密集表格。",
    },
    {
        "source_slide": "AD-3",
        "role": "marketing-bridge",
        "headline": "下一步，不是只投更多廣告，而是把數據變成系統。",
        "supporting_text": "廣告段落的結尾要把投手專家分享接到 Ewalk.ai 行銷大腦：從素材、受眾、傳訊與回訪資料，變成分店可以執行與優化的行銷系統。",
        "must_include_text": [
            "下一步，不是只投更多廣告，而是把數據變成系統。",
            "素材測試",
            "受眾洞察",
            "傳訊追蹤",
            "回訪資料",
            "分店優化",
            "Ewalk.ai 行銷大腦",
        ],
        "visual_scene": (
            "Bridge from ad data to AI marketing brain: glowing data pipeline from ad dashboard into Ewalk.ai central brain, "
            "then to STAR Color branch nodes, blue-violet galaxy network, premium and clear."
        ),
        "chart_or_structure": "廣告資料 → 受眾洞察 → 內容包 → 分店行動 → 行銷大腦。",
    },
]

CHAIRMAN_POLICY_PAGES = [
    {
        "source_slide": "CH-1",
        "role": "chairman-policy",
        "headline": "政策不是遠方，而是正在發生的資源。",
        "supporting_text": "此段落由許文元理事長在結尾前補強政策與人才升級脈絡，讓 STAR Color 的 AI 美業機會連到 2026 政策、學習不斷與產業人才資源。",
        "must_include_text": [
            "政策不是遠方，而是正在發生的資源。",
            "2026 政策",
            "三年 10 萬",
            "學習不斷",
            "AI 科技",
            "產業人才",
        ],
        "visual_scene": (
            "Chairman keynote stage before closing: premium blue-violet STAR Color conference stage, "
            "policy resources, talent upgrade, AI technology nodes, credible association tone."
        ),
        "chart_or_structure": "政策資源 → 學習不斷 → AI 科技 → 產業人才的四節點資源圖。",
    },
    {
        "source_slide": "CH-2",
        "role": "chairman-policy",
        "headline": "教育要被相信，就要有系統與認證。",
        "supporting_text": "用 TTQS、iCAP 與已通過的培訓課程補強教育可信度，讓前面的學院與訓練段落更有制度基礎。",
        "must_include_text": [
            "教育要被相信，就要有系統與認證。",
            "TTQS 證書銅牌",
            "iCAP 認證",
            "假髮造型設計班通過",
            "頭皮調理與養髮培訓班通過",
            "中華整體造型技能培訓協會",
        ],
        "visual_scene": (
            "Certification credibility slide: abstract certificate frames, training path, beauty skill nodes, "
            "silver and blue-violet association keynote style, no fake certificate details."
        ),
        "chart_or_structure": "協會 → TTQS / iCAP → 培訓課程 → 學習可信度的認證路徑。",
    },
    {
        "source_slide": "CH-3",
        "role": "chairman-policy",
        "headline": "錢從哪裡來？從學習資源與人才計畫開始。",
        "supporting_text": "呼應 PDF 的經費段落，把錢從哪裡來轉成學習資源、產業人才投資計畫與勞工自主學習計畫的行動線索。",
        "must_include_text": [
            "錢從哪裡來？",
            "學習資源",
            "產業人才投資計畫",
            "勞工自主學習計畫",
            "115 年度上半年",
            "核定課程明細",
        ],
        "visual_scene": (
            "Resource flow keynote slide: policy resource streams flowing into learning, certification, skill upgrade, "
            "and entrepreneurship readiness, premium and credible, no guarantee language."
        ),
        "chart_or_structure": "政策資源 → 學習課程 → 認證 → 技能升級 → 創業準備的資源流。",
    },
    {
        "source_slide": "CH-4",
        "role": "chairman-policy",
        "headline": "你不是沒有機會，你是在等一個開始。",
        "supporting_text": "用理事長結語把聽眾從理解商機推向行動，銜接最後主持收束與現場 CTA。",
        "must_include_text": [
            "你不是沒有機會，你是在等一個開始。",
            "你目前是在用命拼？",
            "還是保留實力？",
            "那你在等什麼？",
            "現在，就是進場學習的時間。",
        ],
        "visual_scene": (
            "Emotional but premium closing-before-closing stage: a blue-violet light path into the STAR Color AI beauty system, "
            "large negative space, dignified chairman closing tone."
        ),
        "chart_or_structure": "理事長結語式舞台頁，光路指向最後行動，不做複雜圖表。",
    },
]


def extract_slides(markdown: str) -> list[dict]:
    matches = list(re.finditer(r"^## Slide ([^\n]+)$", markdown, flags=re.MULTILINE))
    slides = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(markdown)
        raw_title = match.group(1).strip()
        block = markdown[start:end].strip()
        slide_id, title = split_slide_title(raw_title)
        slides.append(
            {
                "source_id": slide_id,
                "source_title": title,
                "block": block,
            }
        )
    return slides


def split_slide_title(raw: str) -> tuple[str, str]:
    if "｜" in raw:
        slide_id, title = raw.split("｜", 1)
        return slide_id.strip(), title.strip()
    return raw.strip(), raw.strip()


def field(block: str, heading: str) -> str:
    pattern = rf"^### {re.escape(heading)}\n+(.*?)(?=^### |\Z)"
    match = re.search(pattern, block, flags=re.MULTILINE | re.DOTALL)
    return match.group(1).strip() if match else ""


def clean_text(value: str) -> str:
    value = re.sub(r"```(?:text)?\n?", "", value)
    value = value.replace("```", "")
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def bullets(value: str) -> list[str]:
    found = []
    skip_labels = {
        "--",
        "---",
        "項目",
        "金額",
        "說明",
        "情境",
        "每日客數",
        "月營收",
        "成本",
        "預估淨利",
        "適合狀態",
    }
    for line in clean_text(value).splitlines():
        stripped = line.strip()
        if stripped in skip_labels or set(stripped) <= {"-", "—"}:
            continue
        if stripped.startswith(("-", "*")):
            found.append(stripped[1:].strip())
        elif re.match(r"^\d+\.\s+", stripped):
            found.append(re.sub(r"^\d+\.\s+", "", stripped).strip())
        elif stripped.startswith("|") and stripped.endswith("|"):
            cells = [cell.strip() for cell in stripped.strip("|").split("|")]
            if not cells or all((not cell or set(cell) <= {"-", ":"}) for cell in cells):
                continue
            if cells[0] in skip_labels:
                continue
            short_cells = [cell for cell in cells if cell and cell not in skip_labels and set(cell) - {"-", ":"}]
            if len(short_cells) >= 2:
                found.append(" / ".join(short_cells[:3]))
            found.extend(short_cells)
        elif stripped and len(stripped) <= 26 and not stripped.startswith("|"):
            found.append(stripped)
    return dedupe([item for item in found if item])


def dedupe(items: list[str]) -> list[str]:
    out = []
    seen = set()
    for item in items:
        normalized = item.strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        out.append(normalized)
    return out


def first_paragraph(value: str) -> str:
    for part in re.split(r"\n\s*\n", clean_text(value)):
        part = " ".join(line.strip() for line in part.splitlines() if line.strip())
        if part and not part.startswith("|"):
            return part
    return ""


def visible_text(slide: dict) -> list[str]:
    block = slide["block"]
    title = field(block, "主標") or field(block, "標題") or slide["source_title"]
    subtitle = field(block, "副標")
    helper = field(block, "輔助文案")
    conclusion = field(block, "結論句")
    candidate_fields = [
        "內容",
        "三點",
        "重點",
        "流程",
        "族群",
        "CTA",
        "系統組成",
        "公式",
        "學習邏輯",
        "費用架構",
        "建議表格",
        "三槓桿",
        "反向篩選",
        "補充",
    ]
    points = []
    for name in candidate_fields:
        points.extend(bullets(field(block, name)))
    numbers = bullets(field(block, "可用數字"))

    texts = [clean_text(title)]
    texts.extend(known_text_overrides(slide["source_id"]))
    if subtitle:
        texts.extend([line.strip() for line in clean_text(subtitle).splitlines() if line.strip()])
    if helper:
        texts.append(first_paragraph(helper))
    if conclusion:
        texts.append(first_paragraph(conclusion))
    for item in numbers + points:
        if item and len(item) <= 38:
            texts.append(item)
    return dedupe([t for t in texts if t])[:7]


def known_text_overrides(source_id: str) -> list[str]:
    overrides = {
        "21-1": ["加盟費 29.9 萬", "營運金 10 萬", "合計約 40 萬"],
        "22": [
            "保守版：每日約 3 人｜月營收 8 萬｜打平",
            "標準版：每日約 4 人｜月營收 12 萬｜淨利 4 萬",
            "積極版：每日約 5 人｜月營收 15 萬｜淨利 7 萬",
            "暴衝版：每日約 7 人｜月營收 20 萬｜淨利 12 萬",
        ],
        "14": ["學習護照", "L1-L6 技術模組", "AI 染髮師培訓", "實作與考核", "就業 / 創業 / 加盟"],
        "8": ["AI 智能染髮機", "App 配方調色", "標準化服務流程", "顧客色彩紀錄", "透明均一價", "AI 髮色顧問"],
        "19": ["雲端資料與 API 服務層", "GADM 總部中心", "OPS 店家端", "CSM 會員端", "交易同步", "分潤規則引擎"],
        "24": ["GADM 總部中心", "OPS 店家端", "CSM 會員端", "BONUS 獎金分潤", "可管理、可追蹤、可擴張"],
        "28": ["加盟組織樹", "A/B/C 代", "組織領導紅利", "月結資料匯入", "報表與撥款"],
    }
    return overrides.get(source_id, [])


def supporting_text(slide: dict) -> str:
    block = slide["block"]
    conclusion = first_paragraph(field(block, "結論句"))
    if conclusion:
        return conclusion
    content = first_paragraph(field(block, "內容"))
    if content:
        return content
    return slide["source_title"]


def chart_type(slide: dict, texts: list[str]) -> str:
    title = slide["source_title"]
    joined = " ".join(texts)
    if any(k in title for k in ("數位營運", "加盟", "分潤", "組織")):
        return "加盟資訊系統圖，雲端 API 中心連接 GADM / OPS / CSM / BONUS 四個模組。"
    if any(k in title for k in ("公式", "解法總覽", "系統", "生命體", "行銷大腦")):
        return "發光模組系統圖，中心節點加周圍模組。"
    if any(k in title for k in ("流程", "運作", "加盟流程", "服務流程")):
        return "水平或弧形流程圖，步驟以發光節點呈現。"
    if any(k in title for k in ("四情境", "試算", "投入", "財務", "回本", "獲利")):
        return "簡化財務圖表或四格情境卡，使用大數字與短標籤。"
    if any(k in joined for k in ("50 秒", "0.2G", "12 款", "800+", "$999", "36 小時", "30 天", "40 萬")):
        return "大型數字卡與產品科技視覺，最多三個指標。"
    if any(k in title for k in ("市場", "風險", "顧客", "需求", "傳統")):
        return "問題到解法的對比圖，使用四張壓力卡或信任卡。"
    if any(k in title for k in ("誰適合", "行動", "結尾", "封面")):
        return "大會舞台式主視覺，強行動感與留白。"
    return "簡單圖表：三到五個重點卡片，保持清楚可讀。"


def visual_scene(slide: dict, page_no: int) -> str:
    title = slide["source_title"]
    if page_no == 1 or "封面" in title:
        return "0512 Keynote style opening stage: cosmic blue-violet AI beauty conference, AI hair-color machine, elegant presenter figure, luminous galaxy ribbons."
    if any(k in title for k in ("微型門店", "店型", "空間")):
        return "STAR Color store-design landing scene based on STAR_Color_門店設計資產資料庫.md: compact white and gray salon, S.Color signage, NT / 999 vertical acrylic signboards, glass door waist band, sofa waiting area, clean reproducible franchise store."
    if "染髮機" in title or "髮膏" in title:
        return "Premium product-stage scene with a sleek AI hair-color machine, color formula UI, glowing blue-violet platform, magenta hair-color energy."
    if "學院" in title or "教育" in title or "訓練" in title or "學習" in title:
        return "Futuristic beauty academy learning path, glowing passport or certification nodes, AI training network, premium conference style."
    if "財務" in title or "試算" in title or "投入" in title or "回本" in title:
        return "Premium investor-style financial slide with glowing metric cards and calm confidence, no guarantee language."
    if "加盟" in title or "分潤" in title or "數位營運" in title:
        return "Franchise information system stage visual: cloud API core, GADM headquarters, OPS store, CSM member, BONUS profit-sharing backend, glowing data streams."
    if "行銷" in title or "Ewalk.ai" in title:
        return "AI marketing brain network, central intelligence hub connected to STAR Color branch nodes, data streams and content modules."
    if "流程" in title or "加盟" in title:
        return "Blue-violet galaxy roadmap with numbered glowing steps, clean and readable."
    if "市場" in title or "顧客" in title or "風險" in title:
        return "Market transformation scene from traditional salon pressure to AI-enabled beauty system, cinematic but business-professional."
    return "STAR Color 0512 Keynote style: cosmic deep-blue conference stage, blue-violet galaxy ribbons, magenta hair-color energy, silver tech header and footer."


def page_role(slide: dict, page_no: int) -> str:
    title = slide["source_title"]
    if slide["source_id"] in BUSINESS_MANAGER_SOURCE_IDS:
        return "finance-franchise"
    if page_no == 1:
        return "cover"
    if any(k in title for k in ("行動", "結尾")):
        return "action"
    if any(k in title for k in ("財務", "試算", "投入", "回本")):
        return "finance"
    if any(k in title for k in ("流程", "運作")):
        return "process"
    if any(k in title for k in ("系統", "生命體", "解法")):
        return "system"
    return "content"


def build_page(slide: dict, page_no: int) -> dict:
    texts = visible_text(slide)
    headline = texts[0] if texts else slide["source_title"]
    support = supporting_text(slide)
    chart = chart_type(slide, texts)
    scene = visual_scene(slide, page_no)
    source_id = slide["source_id"]
    prompt = (
        f"Create slide {page_no:02d} based on source {source_id}: {slide['source_title']}. "
        f"Use the STAR Color 0512 Keynote visual system. Main headline must be 「{headline}」. "
        "Include only the exact visible Traditional Chinese text listed in must_include_text. "
        "Build a clear conference slide with a non-text graphic header and non-text graphic footer. "
        f"Use this visual direction: {scene} Use this chart/structure: {chart}"
    )
    return {
        "page": page_no,
        "source_slide": source_id,
        "source_title": slide["source_title"],
        "role": page_role(slide, page_no),
        "headline": headline,
        "supporting_text": support[:120],
        "must_include_text": texts,
        "visual_scene": scene,
        "chart_or_structure": chart,
        "prompt": prompt,
    }


def reorder_for_stage_flow(pages: list[dict]) -> list[dict]:
    """Move the current pages 21-30 finance/franchise block before source Slide 28."""
    moved_block = [page for page in pages if page.get("source_slide") in FINANCE_FRANCHISE_SOURCE_IDS]
    remaining = [page for page in pages if page.get("source_slide") not in FINANCE_FRANCHISE_SOURCE_IDS]
    insert_at = next(
        (index for index, page in enumerate(remaining) if page.get("source_slide") == "28"),
        len(remaining),
    )
    return remaining[:insert_at] + moved_block + remaining[insert_at:]


def presenter_for(page: dict, page_no: int) -> str:
    source_slide = str(page.get("source_slide", ""))
    role = page.get("role", "")
    if 1 <= page_no <= 8:
        return "幻色鏡方執行長 Kenny"
    if page_no == 9:
        return "轉場頁：Kenny 交棒至 Akemi"
    if 10 <= page_no <= 20:
        return "雙師 Akemi"
    if role in {"ad-performance", "marketing-bridge"}:
        return "廣告投手專家"
    if source_slide in {"25", "26", "27"}:
        return "Ewalk.ai 行銷大腦段落（待確認講者）"
    if source_slide in BUSINESS_MANAGER_SOURCE_IDS:
        return "業務部經理"
    if role == "chairman-policy":
        return "許文元理事長"
    if source_slide in {"32", "33"}:
        return "主持收束（待確認）"
    return "待確認"


def refresh_prompt(page: dict) -> str:
    source_slide = page.get("source_slide", "")
    page_no = int(page["page"])
    if page.get("role") == "machine-vendor":
        context = "as an inserted machine-vendor stage section inside the AI hair-color machine chapter"
        extra = "Treat this as the machine supplier presenting the technology on stage; keep it premium, technical, and credible. "
    elif page.get("role") in {"ad-performance", "marketing-bridge"}:
        context = "as an inserted advertising-performance expert section before the marketing chapter"
        extra = "Treat the metrics as current advertising data and initial market response, not guaranteed future results. "
    elif page.get("role") == "chairman-policy":
        context = "as an inserted chairman policy-and-funding section before the closing call to action"
        extra = "Frame this as policy resources, talent training, certification, and learning motivation; do not promise guaranteed subsidy, certification, franchise success, or income. "
    elif page.get("role") == "finance-franchise":
        context = "as a finance and franchise operation section for the business manager"
        extra = "Frame this as financial franchise logic, operating readiness, and systemized joining criteria; do not promise guaranteed profit. "
    else:
        context = f"based on source {source_slide}: {page.get('source_title', page.get('headline', ''))}"
        extra = ""
    return (
        f"Create slide {page_no:02d} {context}. "
        f"Main headline must be 「{page.get('headline', '')}」. "
        "Include only the exact visible Traditional Chinese text listed in must_include_text. "
        "Build a clear conference slide with a non-text graphic header and non-text graphic footer. "
        "Presenter names are metadata only and must not be rendered as visible slide text. "
        f"{extra}"
        f"Use this visual direction: {page.get('visual_scene', '')} "
        f"Use this chart/structure: {page.get('chart_or_structure', '')}"
    )


def finalize_pages(pages: list[dict]) -> list[dict]:
    pages = reorder_for_stage_flow(pages)
    for index, page in enumerate(pages, start=1):
        page["page"] = index
        page["presenter"] = presenter_for(page, index)
        page["prompt"] = refresh_prompt(page)
    return pages


def build_machine_vendor_page(template: dict, page_no: int) -> dict:
    prompt = (
        f"Create slide {page_no:02d} as an inserted machine-vendor stage section inside the AI hair-color machine chapter. "
        f"Main headline must be 「{template['headline']}」. "
        "Include only the exact visible Traditional Chinese text listed in must_include_text. "
        "Build a clear conference slide with a non-text graphic header and non-text graphic footer. "
        "Treat this as the machine supplier presenting the technology on stage; keep it premium, technical, and credible. "
        f"Use this visual direction: {template['visual_scene']} Use this chart/structure: {template['chart_or_structure']}"
    )
    page = dict(template)
    page.update(
        {
            "page": page_no,
            "source_slide": template["source_slide"],
            "prompt": prompt,
        }
    )
    return page


def build_ad_page(template: dict, page_no: int) -> dict:
    prompt = (
        f"Create slide {page_no:02d} as an inserted advertising-performance expert section before the marketing chapter. "
        f"Main headline must be 「{template['headline']}」. "
        "Include only the exact visible Traditional Chinese text listed in must_include_text. "
        "Build a clear conference slide with a non-text graphic header and non-text graphic footer. "
        "Treat the metrics as current advertising data and initial market response, not guaranteed future results. "
        f"Use this visual direction: {template['visual_scene']} Use this chart/structure: {template['chart_or_structure']}"
    )
    page = dict(template)
    page.update(
        {
            "page": page_no,
            "source_slide": template["source_slide"],
            "prompt": prompt,
        }
    )
    return page


def build_chairman_policy_page(template: dict, page_no: int) -> dict:
    prompt = (
        f"Create slide {page_no:02d} as an inserted chairman policy-and-funding section before the closing call to action. "
        f"Main headline must be 「{template['headline']}」. "
        "Include only the exact visible Traditional Chinese text listed in must_include_text. "
        "Build a clear conference slide with a non-text graphic header and non-text graphic footer. "
        "Treat this as 許文元理事長 speaking from a policy, association, certification, and learning-resource perspective. "
        "Do not promise guaranteed subsidy, certification, franchise success, or income. "
        f"Use this visual direction: {template['visual_scene']} Use this chart/structure: {template['chart_or_structure']}"
    )
    page = dict(template)
    page.update(
        {
            "page": page_no,
            "source_slide": template["source_slide"],
            "prompt": prompt,
        }
    )
    return page


def main() -> int:
    markdown = SOURCE_MD.read_text(encoding="utf-8")
    slides = extract_slides(markdown)
    pages = []
    for slide in slides:
        pages.append(build_page(slide, len(pages) + 1))
        if slide["source_id"] == "8":
            for template in MACHINE_VENDOR_PAGES:
                pages.append(build_machine_vendor_page(template, len(pages) + 1))
        if slide["source_id"] == "24":
            for template in AD_PERFORMANCE_PAGES:
                pages.append(build_ad_page(template, len(pages) + 1))
        if slide["source_id"] == "31":
            for template in CHAIRMAN_POLICY_PAGES:
                pages.append(build_chairman_policy_page(template, len(pages) + 1))
    pages = finalize_pages(pages)
    spec = {
        "model": "gpt-image-2",
        "size": "1536x1024",
        "quality": "high",
        "brand_kit_path": BRAND_KIT,
        "source_markdown": "../STAR_Color_0520加盟簡報0511.md",
        "deck_title": "STAR Color 0520 加盟簡報0511 完整46頁 GPT Image 2 整頁烘字確認版",
        "brand_style": (
            "STAR Color presentation brand kit v1.5. Follow the 0512 Keynote visual system as the primary style reference: "
            "cosmic deep-blue AI beauty conference stage, blue-violet galaxy ribbons, star magenta hair-color energy waves, "
            "crystal white and silver tech line details, premium product-stage composition. Every slide must include a non-text "
            "graphic header and non-text graphic footer; all text stays in the main content area."
        ),
        "global_rules": [
            "Create one complete 16:9 presentation slide as a single finished image.",
            "All visible text must be Traditional Chinese only.",
            "Use only the exact Chinese text listed in each page's must_include_text and optional short labels.",
            "Do not add English, fake logos, fake QR codes, random watermarks, unreadable microtext, or extra captions.",
            "Keep the slide readable from a conference screen: large headline, clear spacing, few text groups.",
            "If making charts, use simple visual structures with short Chinese labels, not dense data tables.",
            "Every slide must include a non-text graphic header and a non-text graphic footer.",
            "Header and footer must contain no words, no slogan, no page number, no QR code, and no fake logo.",
            "Use STAR_Color_0520加盟簡報0511.md as the source of truth for content, numbers, and chartable data.",
            "After source Slide 8 and before source Slide 9, include three machine-vendor stage pages based on STAR_Color_機器廠商出場資料庫.md.",
            "Machine-vendor pages should introduce the AI hair-color machine, its measurable technical features, and the cloud color formula system.",
            "After source Slide 24 and before source Slide 25, include three advertising-performance expert pages based on STAR_Color_廣告投放數據資料庫.md.",
            "Stage order: pages 1-8 are presented by 幻色鏡方執行長 Kenny; page 9 is a handoff transition; pages 10-20 are presented by 雙師 Akemi.",
            "Move the finance/franchise block from the previous pages 21-30 to immediately before source Slide 28; this block is presented by 業務部經理.",
            "Before the closing action pages, include four chairman policy-and-funding pages based on STAR_Color_許文元理事長政策經費資料庫.md.",
            "Chairman policy pages should connect 2026 policy, 三年 10 萬, TTQS, iCAP, 產業人才投資計畫, and 勞工自主學習計畫 to learning action.",
            "Chairman policy pages must not promise guaranteed subsidy, guaranteed certification, guaranteed franchise success, or guaranteed income.",
            "For store model, small-space operation, and franchise landing pages, follow STAR_Color_門店設計資產資料庫.md.",
            "Store design pages may show S.Color signage, NT / 999 vertical acrylic signboards, glass door waist band, white/gray exterior, sofa wall artwork, and compact salon interiors.",
            "Store design pages must not invent new prices, fake logos, or unrelated luxury salon concepts.",
            "Presenter assignments are metadata only; do not render speaker names on the slide image.",
            "Advertising metrics must be shown as current data and initial market response, not guaranteed acquisition or guaranteed branch performance.",
        ],
        "negative": (
            "No English words, no random letters, no gibberish Chinese, no simplified Chinese, no fake brand marks, "
            "no extra tiny paragraphs, no misspelled STAR Color, no over-crowded dashboard, no stock-photo watermark, no QR code."
        ),
        "pages": pages,
    }
    OUT.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"Pages: {len(pages)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
