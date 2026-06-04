from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json
import math

ROOT = Path(__file__).resolve().parent
IMG_DIR = ROOT / "images"
AI_BG_DIR = ROOT / "ai_backgrounds"
IMG_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080
FONT_PATH = "/System/Library/Fonts/STHeiti Medium.ttc"
FALLBACK_FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

BLACK = (30, 34, 38)
CHARCOAL = (48, 52, 57)
PAPER = (250, 248, 244)
PAPER_2 = (242, 238, 232)
MAGENTA = (216, 20, 95)
TEAL = (0, 104, 100)
GOLD = (210, 160, 74)
PINK = (255, 210, 223)
WHITE = (255, 255, 255)
MUTED = (132, 137, 142)


def font(size):
    for fp in (FONT_PATH, FALLBACK_FONT):
        try:
            return ImageFont.truetype(fp, size=size)
        except Exception:
            pass
    return ImageFont.load_default()


def lerp(a, b, t):
    return int(a + (b - a) * t)


def gradient_bg(c1, c2, c3=None):
    img = Image.new("RGB", (W, H), c1)
    px = img.load()
    c3 = c3 or c2
    for y in range(H):
        ty = y / max(1, H - 1)
        for x in range(W):
            tx = x / max(1, W - 1)
            t = (tx * 0.72 + ty * 0.28)
            mid = tuple(lerp(c1[i], c2[i], min(1, t * 1.4)) for i in range(3))
            col = tuple(lerp(mid[i], c3[i], max(0, t - 0.55) / 0.45) for i in range(3))
            px[x, y] = col
    return img


def add_texture(img, dark=False):
    d = ImageDraw.Draw(img, "RGBA")
    line = (255, 255, 255, 18) if dark else (30, 34, 38, 10)
    for x in range(0, W, 96):
        d.line([(x, 0), (x, H)], fill=line, width=1)
    for y in range(0, H, 96):
        d.line([(0, y), (W, y)], fill=line, width=1)
    accent = (216, 20, 95, 38) if dark else (216, 20, 95, 20)
    teal = (0, 104, 100, 25) if dark else (0, 104, 100, 14)
    for i in range(7):
        y = 130 + i * 120
        d.line([(0, y), (W, y - 380)], fill=accent if i % 2 == 0 else teal, width=3)
    return img


def bg(theme):
    if theme == "dark":
        return add_texture(gradient_bg((22, 24, 27), (49, 54, 58), (21, 23, 25)), True)
    return add_texture(gradient_bg(PAPER, PAPER_2, (253, 252, 249)), False)


def crop_cover(img, target_w=W, target_h=H):
    img = img.convert("RGB")
    src_w, src_h = img.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, src_h))
    elif src_ratio < target_ratio:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        img = img.crop((0, top, src_w, top + new_h))
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)


def ai_or_bg(idx, theme):
    ai_path = AI_BG_DIR / f"page_{idx:02d}.png"
    if not ai_path.exists():
        return bg(theme)

    base = crop_cover(Image.open(ai_path)).filter(ImageFilter.GaussianBlur(radius=1.2))
    d = ImageDraw.Draw(base, "RGBA")
    if theme == "dark":
        d.rectangle([0, 0, W, H], fill=(16, 18, 20, 154))
        d.rectangle([0, 0, W, H], fill=(216, 20, 95, 18))
    else:
        d.rectangle([0, 0, W, H], fill=(250, 248, 244, 196))
        d.rectangle([0, 0, W, H], fill=(0, 104, 100, 10))
    return add_texture(base, theme == "dark")


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_multiline(draw, xy, text, fnt, fill, line_spacing=1.18, anchor="la", align="left"):
    x, y = xy
    lines = str(text).split("\n")
    line_h = int(fnt.size * line_spacing)
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill, anchor=anchor, align=align)
        y += line_h
    return y


def wrap_text(draw, text, fnt, max_w):
    lines = []
    current = ""
    for ch in str(text):
        test = current + ch
        if text_size(draw, test, fnt)[0] <= max_w or not current:
            current = test
        else:
            lines.append(current)
            current = ch
    if current:
        lines.append(current)
    return lines


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def header(draw, eyebrow, theme):
    color = MAGENTA
    x, y = 92, 72
    draw.rectangle([x, y + 3, x + 6, y + 58], fill=color)
    draw.text((x + 24, y), eyebrow, font=font(19), fill=color, anchor="la")


def footer(draw, page, theme):
    fill = (255, 255, 255, 80) if theme == "dark" else (48, 52, 57, 92)
    draw.text((92, 1018), "STAR Color｜一個人的 AI 美業經濟", font=font(17), fill=fill, anchor="la")
    draw.text((1828, 1018), f"{page:02d}", font=font(17), fill=fill, anchor="ra")


def title(draw, text, theme, size=72, x=92, y=148, max_w=1180):
    fill = WHITE if theme == "dark" else CHARCOAL
    return draw_multiline(draw, (x, y), text, font(size), fill, 1.12)


def bullet(draw, x, y, text, fill, dot=TEAL, size=32):
    draw.rectangle([x, y + 14, x + 13, y + 27], fill=dot)
    draw.text((x + 34, y), text, font=font(size), fill=fill, anchor="la")
    return y + int(size * 1.58)


def save(img, idx):
    out = IMG_DIR / f"page_{idx:02d}.png"
    img.save(out)
    print(out)
    return str(out)


def slide_01():
    img = ai_or_bg(1, "dark")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "STAR COLOR 0520", "dark")
    title(d, "AI 智能染髮\n創業大會", "dark", 96, 92, 210)
    d.text((92, 455), "一個人的 AI 美業經濟", font=font(40), fill=PINK, anchor="la")
    d.line([(92, 610), (650, 610)], fill=(255, 255, 255, 90), width=2)
    d.text((92, 660), "科技賦能・趨勢引領・創造美業新未來", font=font(26), fill=(255, 255, 255, 190), anchor="la")
    for r in range(4):
        for c in range(3):
            x = 1000 + c * 255
            y = 100 + r * 220
            rounded(d, [x, y, x + 218, y + 176], 10, (255, 255, 255, 15), (255, 255, 255, 35), 1)
            d.line([(x + 28, y + 32), (x + 28, y + 126)], fill=MAGENTA if (r + c) % 2 == 0 else TEAL, width=5)
            d.line([(x + 28, y + 126), (x + 170, y + 126)], fill=(255, 255, 255, 58), width=2)
            d.rectangle([x + 52, y + 68, x + 72, y + 126], fill=(216, 20, 95, 120))
            d.rectangle([x + 84, y + 46, x + 104, y + 126], fill=(0, 104, 100, 120))
            d.rectangle([x + 116, y + 88, x + 136, y + 126], fill=(210, 160, 74, 120))
    footer(d, 1, "dark")
    return save(img, 1)


def slide_02():
    img = ai_or_bg(2, "light")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "OPENING THESIS", "light")
    title(d, "今天，我們不只談染髮。", "light", 72)
    d.text((92, 255), "而是看懂一套新經濟", font=font(42), fill=TEAL, anchor="la")
    y = 380
    for b in ["一個人如何用 AI 進入美業", "一個人如何學會可複製的技術", "一個人如何建立穩定現金流", "一個人如何從服務者，走向經營者"]:
        y = bullet(d, 128, y, b, CHARCOAL, TEAL, 33)
    rounded(d, [1300, 250, 1700, 790], 8, (30, 34, 38, 255))
    d.text((1500, 360), "不是產品說明", font=font(44), fill=WHITE, anchor="ma")
    d.line([(1390, 470), (1610, 470)], fill=MAGENTA, width=3)
    d.text((1500, 555), "而是一套能被學習、營運\n與複製的創業系統", font=font(28), fill=(255, 255, 255, 210), anchor="ma", align="center")
    d.text((960, 912), "STAR Color 要創造的，是「一個人的 AI 美業經濟」。", font=font(34), fill=MAGENTA, anchor="mm")
    footer(d, 2, "light")
    return save(img, 2)


def slide_03():
    img = ai_or_bg(3, "dark")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "CORE FORMULA", "dark")
    title(d, "STAR Color = 一個人的經濟", "dark", 66)
    chips = ["AI 染髮技術", "標準化流程", "透明定價", "微型教育系統", "AI 行銷系統", "加盟營運模型"]
    x, y = 115, 430
    for i, c in enumerate(chips):
        if i:
            d.text((x - 28, y + 52), "+", font=font(38), fill=(255, 255, 255, 170), anchor="mm")
        w = 238
        rounded(d, [x, y, x + w, y + 112], 10, MAGENTA if i == 0 else (255, 255, 255, 35), (255, 255, 255, 42), 1)
        d.text((x + w / 2, y + 56), c, font=font(27), fill=WHITE, anchor="mm")
        x += w + 54
    d.text((1710, 720), "= 一個人的 AI 美業經濟", font=font(52), fill=WHITE, anchor="ra")
    d.text((960, 912), "把開店門檻拆小，把成功流程做大。", font=font(30), fill=(255, 255, 255, 220), anchor="mm")
    footer(d, 3, "dark")
    return save(img, 3)


def slide_04():
    img = ai_or_bg(4, "light")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "SYSTEM MAP", "light")
    title(d, "加入的不是一間店，\n而是會學習的 AI 美業生命體。", "light", 62)
    cx, cy, r = 960, 610, 150
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=CHARCOAL)
    d.text((cx, cy - 32), "AI 美業", font=font(38), fill=WHITE, anchor="mm")
    d.text((cx, cy + 28), "生命體", font=font(38), fill=WHITE, anchor="mm")
    nodes = [
        (330, 430, "骨架", "幻色鏡方美業控股集團"),
        (730, 365, "大腦", "Ewalk.ai\n行銷與資料中樞"),
        (1130, 365, "神經", "大美好學院微型教育系統"),
        (1530, 430, "血肉", "STAR Color / STAR SPA"),
        (560, 800, "心臟", "一個人的經濟"),
        (1360, 800, "血液", "資料・顧客・內容・現金流"),
    ]
    for x, y, h, b in nodes:
        d.line([(cx, cy), (x, y)], fill=(48, 52, 57, 50), width=3)
    for x, y, h, b in nodes:
        rounded(d, [x-150, y-58, x+150, y+58], 8, (255, 255, 255, 218), (48, 52, 57, 50), 1)
        d.text((x, y-26), h, font=font(27), fill=MAGENTA, anchor="mm")
        d.text((x, y+18), b, font=font(18), fill=CHARCOAL, anchor="mm", align="center")
    footer(d, 4, "light")
    return save(img, 4)


def slide_05():
    img = ai_or_bg(5, "dark")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "PROMISE", "dark")
    title(d, "90 分鐘後，\n你會看懂三件事", "dark", 70)
    cards = [
        ("01", "趨勢", "為什麼美業正在進入 AI 與微型創業時代"),
        ("02", "系統", "STAR Color 如何把染髮變成可複製的經營模型"),
        ("03", "加入", "你如何從學習、就業、創業到加盟進入系統"),
    ]
    for i, (num, h, body) in enumerate(cards):
        x = 150 + i * 555
        y = 485
        rounded(d, [x, y, x + 470, y + 330], 10, (255, 255, 255, 28), (255, 255, 255, 42), 1)
        d.text((x + 42, y + 55), num, font=font(29), fill=GOLD, anchor="la")
        d.text((x + 42, y + 140), h, font=font(50), fill=PINK, anchor="la")
        lines = wrap_text(d, body, font(25), 380)
        draw_multiline(d, (x + 42, y + 222), "\n".join(lines), font(25), (255, 255, 255, 205), 1.25)
    footer(d, 5, "dark")
    return save(img, 5)


def slide_06():
    img = ai_or_bg(6, "light")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "MARKET SHIFT", "light")
    title(d, "美業不是沒有需求，\n是傳統供給方式正在失效。", "light", 62)
    cards = [
        ("人才難找", "師徒制慢，訓練依賴個人經驗"),
        ("技術難複製", "品質靠手感，分店越多越難一致"),
        ("成本提高", "人力、庫存、租金壓力壓縮利潤"),
        ("顧客變聰明", "價格透明、結果可預期、效率更重要"),
    ]
    for i, (h, body) in enumerate(cards):
        x = 190 + (i % 2) * 810
        y = 420 + (i // 2) * 205
        rounded(d, [x, y, x + 710, y + 150], 8, (255, 255, 255, 220), (48, 52, 57, 45), 1)
        d.text((x + 42, y + 55), h, font=font(37), fill=MAGENTA, anchor="lm")
        d.text((x + 270, y + 55), body, font=font(25), fill=CHARCOAL, anchor="lm")
    d.text((960, 912), "下一波機會，不是更大的店，而是更可複製的系統。", font=font(31), fill=TEAL, anchor="mm")
    footer(d, 6, "light")
    return save(img, 6)


def slide_07():
    img = ai_or_bg(7, "dark")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "HUMAN DEPENDENCY", "dark")
    title(d, "傳統染髮生意，\n最大的風險不是沒有客人。", "dark", 64)
    d.text((92, 330), "真正的風險是：太依賴人", font=font(42), fill=PINK, anchor="la")
    risks = ["顏色判斷\n靠師傅經驗", "服務品質\n靠個人手感", "價格說明\n靠現場話術", "訓練速度\n靠師徒制", "顧客回訪\n靠記憶與關係"]
    for i, r in enumerate(risks):
        x = 105 + i * 350
        y = 560
        rounded(d, [x, y, x + 285, y + 150], 10, (255, 255, 255, 30), (255, 255, 255, 45), 1)
        draw_multiline(d, (x + 142, y + 43), r, font(25), WHITE, 1.2, anchor="ma", align="center")
        if i < len(risks) - 1:
            d.line([(x + 305, y + 75), (x + 340, y + 75)], fill=(255, 255, 255, 95), width=3)
    d.text((960, 912), "當一門生意太依賴人，它就很難快速複製。", font=font(31), fill=WHITE, anchor="mm")
    footer(d, 7, "dark")
    return save(img, 7)


def slide_08():
    img = ai_or_bg(8, "light")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "CUSTOMER TRUTH", "light")
    title(d, "現在的消費者，\n不只想變美，更想安心。", "light", 62)
    rounded(d, [180, 400, 980, 800], 10, (255, 255, 255, 225), (48, 52, 57, 42), 1)
    rounded(d, [1120, 400, 1710, 800], 10, CHARCOAL)
    d.text((240, 465), "顧客怕什麼", font=font(35), fill=MAGENTA, anchor="la")
    d.text((1180, 465), "STAR Color 給什麼", font=font(35), fill=WHITE, anchor="la")
    y = 540
    for item in ["價格能不能先知道", "髮色會不會翻車", "會不會被推銷", "下次能不能染回同色", "服務流程是不是清楚"]:
        y = bullet(d, 250, y, item, CHARCOAL, MAGENTA, 28)
    y = 552
    for item in ["先知道價格", "配方被記錄", "流程標準化", "回訪可提醒"]:
        y = bullet(d, 1190, y, item, WHITE, GOLD, 29)
    d.text((960, 912), "AI 的價值不是炫技，而是讓美變得更可預期。", font=font(31), fill=TEAL, anchor="mm")
    footer(d, 8, "light")
    return save(img, 8)


def slide_09():
    img = ai_or_bg(9, "light")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "STAR COLOR SYSTEM", "light")
    title(d, "把染髮從靠經驗，\n變成靠系統。", "light", 64)
    cx, cy = 960, 620
    rounded(d, [cx-220, cy-100, cx+220, cy+100], 100, CHARCOAL)
    d.text((cx, cy), "STAR Color", font=font(52), fill=WHITE, anchor="mm")
    modules = ["AI 智能染髮機", "App 配方調色", "標準化 SOP", "顧客色彩紀錄", "透明均一價", "大美好學院", "AI 髮色顧問", "數位營運導流"]
    positions = [(250,420),(610,420),(1215,420),(1575,420),(250,780),(610,780),(1215,780),(1575,780)]
    for i, (m, (x, y)) in enumerate(zip(modules, positions)):
        d.line([(cx, cy), (x, y)], fill=(48, 52, 57, 36), width=3)
    for i, (m, (x, y)) in enumerate(zip(modules, positions)):
        fill = MAGENTA if i == 7 else (255, 255, 255, 225)
        text_fill = WHITE if i == 7 else CHARCOAL
        rounded(d, [x-155, y-45, x+155, y+45], 8, fill, (48, 52, 57, 45), 1)
        d.text((x, y), m, font=font(24), fill=text_fill, anchor="mm")
    footer(d, 9, "light")
    return save(img, 9)


def slide_10():
    img = ai_or_bg(10, "dark")
    d = ImageDraw.Draw(img, "RGBA")
    header(d, "OPERATING PROOF", "dark")
    title(d, "50 秒，完成一份\n可被記錄的染髮配方。", "dark", 64)
    metrics = [
        ("50 秒", "快速調配顧客所需髮色"),
        ("< 0.2G", "單次精準調配"),
        ("可記錄", "配方與顧客色彩資料沉澱"),
        ("可複製", "服務品質更容易訓練"),
    ]
    for i, (m, body) in enumerate(metrics):
        x = 260 + i * 455
        d.text((x, 590), m, font=font(60), fill=PINK if i < 3 else GOLD, anchor="mm")
        d.line([(x-130, 655), (x+130, 655)], fill=(255, 255, 255, 80), width=2)
        lines = wrap_text(d, body, font(24), 340)
        draw_multiline(d, (x, 700), "\n".join(lines), font(24), (255, 255, 255, 212), 1.25, anchor="ma", align="center")
    d.text((960, 912), "複雜配方，變成穩定流程。", font=font(32), fill=WHITE, anchor="mm")
    footer(d, 10, "dark")
    return save(img, 10)


def main():
    outputs = [
        slide_01(), slide_02(), slide_03(), slide_04(), slide_05(),
        slide_06(), slide_07(), slide_08(), slide_09(), slide_10(),
    ]
    manifest = {
        "mode": "baked",
        "slide_count": len(outputs),
        "images": outputs,
        "source": "STAR_Color_0520加盟簡報0511_10頁版.md",
        "note": "每頁皆為 1920x1080 PNG，適合純視覺 PPTX 打包。",
    }
    (ROOT / "STAR_Color_0520加盟簡報0511_10頁版_純視覺_images_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
