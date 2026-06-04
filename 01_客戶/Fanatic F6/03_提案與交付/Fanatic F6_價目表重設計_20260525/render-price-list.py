from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
OUT_PNG = ROOT / "Fanatic F6_價目表重設計_20260525.png"
OUT_PDF = ROOT / "Fanatic F6_價目表重設計_20260525.pdf"

S = 2
W, H = 1240 * S, 1754 * S

INK = "#3f2c1e"
MUTED = "#866e5b"
LINE = "#b79473"
ACCENT = "#684321"
PAPER = (248, 241, 231)
PAPER_SOFT = (255, 250, 242)


def sc(value: float) -> int:
    return int(round(value * S))


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, sc(size), index=index)


FONT_SERIF = "/System/Library/AssetsV2/com_apple_MobileAsset_Font8/86ba2c91f017a3749571a82f2c6d890ac7ffb2fb.asset/AssetData/PingFang.ttc"
FONT_SERIF_LATIN = "/System/Library/Fonts/Supplemental/Times New Roman.ttf"
FONT_SERIF_LATIN_BOLD = "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"
FONT_SANS = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_SCRIPT = "/System/Library/Fonts/Supplemental/SnellRoundhand.ttc"

song = font(FONT_SERIF, 22, index=2)
song_small = font(FONT_SERIF, 16, index=2)
song_bold = font(FONT_SERIF, 22, index=10)
title_en = font(FONT_SERIF_LATIN_BOLD, 28)
title_en_small = font(FONT_SERIF_LATIN_BOLD, 25)
chinese_title = font(FONT_SERIF, 25, index=10)
brand_script = font(FONT_SCRIPT, 118)
brand_name = font(FONT_SERIF_LATIN, 45)
brand_sub = font(FONT_SANS, 15)
price_font = font(FONT_SANS, 22)
price_small = font(FONT_SANS, 21)
tier_font = font(FONT_SANS, 23)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_centered(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fnt, fill=INK) -> None:
    x, y = xy
    tw, th = text_size(draw, text, fnt)
    draw.text((x - tw // 2, y), text, font=fnt, fill=fill)


def blend(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_background() -> Image.Image:
    img = Image.new("RGB", (W, H), PAPER)
    px = img.load()
    for y in range(H):
        t = y / H
        for x in range(W):
            radial = math.hypot((x - W * 0.52) / W, (y - H * 0.10) / H)
            glow = max(0, 1 - radial * 3.6)
            base = blend(PAPER_SOFT, (243, 231, 216), t * 0.76)
            px[x, y] = blend(base, (255, 255, 252), glow * 0.38)

    random.seed(66)
    noise = Image.new("L", (W, H), 0)
    npx = noise.load()
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            val = random.randint(0, 34)
            npx[x, y] = val
            if x + 1 < W:
                npx[x + 1, y] = val
            if y + 1 < H:
                npx[x, y + 1] = val
            if x + 1 < W and y + 1 < H:
                npx[x + 1, y + 1] = val
    grain = Image.new("RGB", (W, H), (95, 67, 45))
    img = Image.composite(grain, img, noise.point(lambda v: min(26, v)))
    return img


def overlay_shape(img: Image.Image, bbox: tuple[int, int, int, int], fill: tuple[int, int, int, int], angle=0) -> None:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse(bbox, fill=fill)
    if angle:
        layer = layer.rotate(angle, resample=Image.Resampling.BICUBIC, center=((bbox[0] + bbox[2]) // 2, (bbox[1] + bbox[3]) // 2))
    img.alpha_composite(layer)


def bezier(p0, p1, p2, p3, steps=42):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t**2 * p2[0] + t**3 * p3[0]
        y = (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t**2 * p2[1] + t**3 * p3[1]
        pts.append((int(x), int(y)))
    return pts


def draw_leaf(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1, flip: bool = False) -> None:
    def p(pt):
        px, py = pt
        if flip:
            px = 260 - px
        return (x + int(px * scale * S), y + int(py * scale * S))

    color = (125, 91, 63, 132)
    width = max(1, sc(2.2 * scale))
    paths = [
        ((42, 238), (48, 180), (70, 106), (124, 26)),
        ((58, 188), (26, 174), (18, 135), (27, 94)),
        ((58, 188), (62, 117), (74, 150), (27, 94)),
        ((83, 134), (48, 116), (39, 75), (52, 38)),
        ((83, 134), (91, 67), (100, 100), (52, 38)),
        ((111, 86), (88, 56), (94, 25), (130, 4)),
        ((111, 86), (143, 39), (137, 67), (130, 4)),
        ((83, 158), (125, 127), (166, 124), (212, 146)),
        ((83, 158), (171, 178), (123, 184), (212, 146)),
        ((105, 104), (143, 70), (186, 60), (232, 72)),
        ((105, 104), (194, 108), (149, 123), (232, 72)),
    ]
    for path in paths:
        draw.line([p(pt) for pt in bezier(*path)], fill=color, width=width)
    veins = [
        ((55, 187), (80, 168), (103, 158), (132, 156)),
        ((83, 134), (102, 116), (121, 106), (148, 102)),
        ((111, 86), (124, 65), (134, 48), (141, 26)),
    ]
    for path in veins:
        draw.line([p(pt) for pt in bezier(*path, steps=24)], fill=color, width=max(1, width - 1))


def draw_spark(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, fill=INK) -> None:
    pts = [
        (cx, cy - r),
        (cx + r * 0.18, cy - r * 0.18),
        (cx + r, cy),
        (cx + r * 0.18, cy + r * 0.18),
        (cx, cy + r),
        (cx - r * 0.18, cy + r * 0.18),
        (cx - r, cy),
        (cx - r * 0.18, cy - r * 0.18),
    ]
    draw.polygon([(int(x), int(y)) for x, y in pts], fill=fill)


def draw_icon(draw: ImageDraw.ImageDraw, kind: str, x: int, y: int, filled: bool = False) -> None:
    cx, cy = x + sc(23), y + sc(23)
    col = (104, 67, 33, 255)
    if filled:
        draw.ellipse((x, y, x + sc(46), y + sc(46)), fill=ACCENT)
        col = (255, 248, 239, 255)
    w = sc(2)
    if kind == "bottle":
        draw.rectangle((x + sc(12), y + sc(14), x + sc(23), y + sc(35)), outline=col, width=w)
        draw.rectangle((x + sc(15), y + sc(9), x + sc(20), y + sc(14)), outline=col, width=w)
        draw.rectangle((x + sc(26), y + sc(22), x + sc(33), y + sc(35)), outline=col, width=w)
        draw.rectangle((x + sc(28), y + sc(18), x + sc(31), y + sc(22)), outline=col, width=w)
    elif kind == "scissors":
        draw.line((x + sc(10), y + sc(10), x + sc(34), y + sc(34)), fill=col, width=w)
        draw.line((x + sc(34), y + sc(10), x + sc(10), y + sc(34)), fill=col, width=w)
        draw.ellipse((x + sc(6), y + sc(30), x + sc(15), y + sc(39)), outline=col, width=w)
        draw.ellipse((x + sc(27), y + sc(30), x + sc(36), y + sc(39)), outline=col, width=w)
    elif kind == "drop":
        pts = [(cx, y + sc(6)), (x + sc(30), y + sc(22)), (cx, y + sc(37)), (x + sc(10), y + sc(22))]
        draw.line(pts + [pts[0]], fill=col, width=w)
        draw.arc((x + sc(15), y + sc(16), x + sc(29), y + sc(32)), 30, 120, fill=col, width=w)
    elif kind == "leaf":
        draw.line([x + sc(10), y + sc(31), x + sc(31), y + sc(9)], fill=col, width=w)
        draw.arc((x + sc(11), y + sc(10), x + sc(34), y + sc(32)), 200, 25, fill=col, width=w)
        draw.line([x + sc(14), y + sc(25), x + sc(29), y + sc(18)], fill=col, width=w)
    elif kind == "wave":
        for off in [11, 20, 29]:
            pts = bezier((off, 35), (off + 10, 24), (off - 8, 18), (off + 2, 8), steps=24)
            draw.line([(x + sc(px), y + sc(py)) for px, py in pts], fill=col, width=w)
    elif kind == "brush":
        draw.line((x + sc(9), y + sc(33), x + sc(30), y + sc(12)), fill=col, width=sc(4))
        draw.rectangle((x + sc(22), y + sc(8), x + sc(35), y + sc(21)), outline=col, width=w)
    elif kind == "spark":
        draw_spark(draw, cx, cy, sc(17), fill=col)
    elif kind == "palette":
        draw.ellipse((x + sc(8), y + sc(7), x + sc(37), y + sc(35)), outline=col, width=w)
        for dx, dy in [(14, 14), (23, 12), (29, 23), (16, 27)]:
            draw.ellipse((x + sc(dx - 2), y + sc(dy - 2), x + sc(dx + 2), y + sc(dy + 2)), fill=col)
    elif kind == "tube":
        draw.rectangle((x + sc(13), y + sc(8), x + sc(27), y + sc(34)), outline=col, width=w)
        draw.line((x + sc(15), y + sc(15), x + sc(25), y + sc(15)), fill=col, width=w)
        draw.rectangle((x + sc(28), y + sc(11), x + sc(33), y + sc(28)), outline=col, width=w)
    elif kind == "strand":
        for off in [12, 20, 28]:
            pts = bezier((off, 33), (off + 8, 24), (off - 7, 20), (off + 1, 14), steps=18)
            draw.line([(x + sc(px), y + sc(py)) for px, py in pts], fill=col, width=w)
            draw.ellipse((x + sc(off - 2), y + sc(34), x + sc(off + 2), y + sc(38)), outline=col, width=w)


def dot_line(draw: ImageDraw.ImageDraw, x1: int, x2: int, y: int) -> None:
    if x2 <= x1:
        return
    step = sc(9)
    r = sc(1.1)
    x = x1
    while x < x2:
        draw.ellipse((x, y - r, x + r * 2, y + r), fill=(157, 122, 92, 120))
        x += step


def draw_section_title(draw, x, y, w, english, chinese="", icon="leaf", filled=False, compact=False, note=""):
    icon_size = 34 if compact else 46
    draw_icon(draw, icon, sc(x), sc(y), filled=filled)
    text_x = sc(x + icon_size + 16)
    baseline = sc(y + (15 if compact else 14))
    has_cjk = any(ord(ch) > 127 for ch in english)
    f_en = chinese_title if has_cjk else (title_en_small if compact else title_en)
    draw.text((text_x, baseline), english, font=f_en, fill=INK)
    en_w, _ = text_size(draw, english, f_en)
    if chinese:
        draw.text((text_x + en_w + sc(10), baseline + sc(5)), chinese, font=song_bold, fill=INK)
    if note:
        note_x = text_x + en_w + sc(12)
        if chinese:
            note_x += text_size(draw, chinese, song_bold)[0]
        draw.text((note_x, baseline + sc(8)), note, font=song_small, fill=MUTED)
    line_y = sc(y + (55 if not compact else 50))
    draw.line((sc(x), line_y, sc(x + w), line_y), fill=(134, 95, 62, 145), width=sc(1.8))
    return y + (70 if not compact else 64)


def row(draw, x, y, w, label, price, small=False):
    f_label = song_small if small else song
    f_price = price_small if small else price_font
    label_w, _ = text_size(draw, label, f_label)
    price_w, _ = text_size(draw, price, f_price)
    draw.text((sc(x), sc(y)), label, font=f_label, fill=INK)
    draw.text((sc(x + w) - price_w, sc(y)), price, font=f_price, fill=(53, 39, 25))
    dot_line(draw, sc(x) + label_w + sc(17), sc(x + w) - price_w - sc(16), sc(y + 25))
    return y + 41


def tier(draw, x, y, label, prices):
    draw.text((sc(x), sc(y)), label, font=song, fill=INK)
    draw.text((sc(x), sc(y + 38)), prices, font=tier_font, fill=(53, 39, 25))
    return y + 87


img = make_background().convert("RGBA")
overlay_shape(img, (sc(-165), sc(-105), sc(545), sc(310)), (218, 197, 174, 118), angle=-8)
overlay_shape(img, (sc(760), sc(-105), sc(1390), sc(305)), (122, 92, 65, 108), angle=8)
overlay_shape(img, (sc(-145), sc(1490), sc(345), sc(1812)), (111, 80, 53, 112), angle=4)
overlay_shape(img, (sc(790), sc(1478), sc(1390), sc(1810)), (229, 218, 205, 178), angle=-8)
img = img.filter(ImageFilter.GaussianBlur(radius=0.2))
draw = ImageDraw.Draw(img, "RGBA")

draw.rectangle((sc(30), sc(30), sc(1210), sc(1724)), outline=(123, 88, 58, 142), width=sc(1.5))
draw.rectangle((sc(40), sc(40), sc(1200), sc(1714)), outline=(123, 88, 58, 110), width=sc(1))
draw_leaf(draw, sc(34), sc(34), scale=0.96, flip=False)
draw_leaf(draw, sc(945), sc(1490), scale=0.92, flip=True)

center_x = sc(620)
draw_spark(draw, sc(495), sc(204), sc(16), fill=INK)
draw_spark(draw, sc(745), sc(204), sc(16), fill=INK)
draw_centered(draw, (center_x, sc(82)), "f6", brand_script, fill="#4a2e18")
draw_centered(draw, (center_x, sc(205)), "fanatic", brand_name, fill="#4a2e18")
draw_centered(draw, (center_x, sc(267)), "HAIR SALON", brand_sub, fill=MUTED)

draw.line((sc(620), sc(340), sc(620), sc(1616)), fill=(117, 83, 56, 150), width=sc(1.3))

lx, rx = 126, 690
cw = 432
y = 345
y = draw_section_title(draw, lx, y, cw, "SHAMPOO", "洗髮 & CUT 剪髮", "bottle")
y = row(draw, lx, y, cw, "質感洗髮修剪到海", "600")
y = row(draw, lx, y, cw, "質感洗髮", "500")
y = row(draw, lx, y, cw, "醫美 SPA 洗髮", "1000")
y = row(draw, lx, y, cw, "剪髮", "800 / 900 / 1000 / 1200")

y += 34
y = draw_section_title(draw, lx, y, cw, "STYLE", "造型", "scissors", filled=True)
y = row(draw, lx, y, cw, "造型", "400~1200")
y = row(draw, lx, y, cw, "電棒造型", "200~600")

y += 37
y = draw_section_title(draw, lx, y, cw, "TREATMENT", "結構式護髮", "drop", filled=True)
y = tier(draw, lx, y, "短 / 中 / 長 / 超長", "1500 / 1800 / 2100 / 2300")

y += 18
y = draw_section_title(draw, lx, y, cw, "京喚羽護髮", "", "leaf", compact=True)
y = tier(draw, lx, y, "短 / 中 / 長 / 超長", "1500 / 1800 / 2100 / 2300")

y += 18
y = draw_section_title(draw, lx, y, cw, "PERM", "燙髮", "wave", compact=True)
y = tier(draw, lx, y, "短 / 中 / 長 / 超長", "3000 / 3500 / 4000 / 4500")

y += 18
y = draw_section_title(draw, lx, y, cw, "HOT PERM", "", "wave", compact=True)
y = tier(draw, lx, y, "短 / 中 / 長 / 超長", "4100 / 4600 / 5100 / 5600")
y = row(draw, lx, y, cw, "局部燙髮（不打折扣）", "1100", small=True)
y = row(draw, lx, y, cw, "染燙前保養", "1400", small=True)

y = 345
y = draw_section_title(draw, rx, y, cw, "SCALP CARE", "頭皮護理療程", "leaf")
y = row(draw, rx, y, cw, "頭皮賦活", "1000")
y = row(draw, rx, y, cw, "頭皮養護", "1000")
y = row(draw, rx, y, cw, "頭皮菁華", "1000")
y = row(draw, rx, y, cw, "頭皮隔離", "1000")
y = row(draw, rx, y, cw, "抗敏菁萃", "1000")

y += 30
y = draw_section_title(draw, rx, y, cw, "COLOR", "染髮", "brush")
y = row(draw, rx, y, cw, "短", "2000")
y = row(draw, rx, y, cw, "中", "2500")
y = row(draw, rx, y, cw, "長", "3000")
y = row(draw, rx, y, cw, "超長", "3400")

y += 26
y = draw_section_title(draw, rx, y, cw, "去色處理", "", "spark", compact=True, note="（不打折扣）")
y = row(draw, rx, y, cw, "短", "2000")
y = row(draw, rx, y, cw, "中", "2500")
y = row(draw, rx, y, cw, "長", "3000")
y = row(draw, rx, y, cw, "超長", "3400")

y += 28
y = draw_section_title(draw, rx, y, cw, "挑染 / 補染", "", "palette", filled=True, compact=True)
y = row(draw, rx, y, cw, "局部挑染", "1000")
y = row(draw, rx, y, cw, "髮根補染（不打折扣）", "1700", small=True)

y += 28
y = draw_section_title(draw, rx, y, cw, "色彩保養", "", "tube", compact=True, note="（不打折扣）")
y = row(draw, rx, y, cw, "短", "1800")
y = row(draw, rx, y, cw, "長", "2000")

y += 34
draw_icon(draw, "strand", sc(rx), sc(y), filled=False)
draw.text((sc(rx + 54), sc(y + 9)), "接髮服務", font=chinese_title, fill=INK)
draw.text((sc(rx + 182), sc(y + 17)), "（價格面議）", font=song_small, fill=MUTED)

footer_y = sc(1686)
draw.line((sc(392), footer_y + sc(8), sc(553), footer_y + sc(8)), fill=(128, 91, 61, 70), width=sc(1))
draw_centered(draw, (center_x, footer_y), "FANATIC F6 PRICE LIST", brand_sub, fill=(83, 58, 39, 122))
draw.line((sc(687), footer_y + sc(8), sc(848), footer_y + sc(8)), fill=(128, 91, 61, 70), width=sc(1))

rgb = img.convert("RGB")
rgb.save(OUT_PNG, quality=96)
rgb.save(OUT_PDF, "PDF", resolution=300.0)

print(OUT_PNG)
print(OUT_PDF)
