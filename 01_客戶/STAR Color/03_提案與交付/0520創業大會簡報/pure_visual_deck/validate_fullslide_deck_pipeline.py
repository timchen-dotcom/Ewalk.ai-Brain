from __future__ import annotations

import argparse
import json
import os
import re
import struct
import zipfile
from pathlib import Path

try:
    from PIL import Image
except ModuleNotFoundError:
    Image = None


ROOT = Path(__file__).resolve().parent
SECRET_PATH = Path.home() / ".config" / "ewalk" / "openai.env"
LOCAL_ENV = ROOT / ".env"
PROMPTS = ROOT / "gpt_image2_fullslide_prompts.json"
BRAND_KIT = ROOT.parents[2] / "01_品牌資料" / "簡報生成品牌包" / "brand_kit.json"
IMG_DIR = ROOT / "fullslide_images"
DEFAULT_IMG_DIR = ROOT / "fullslide_images_1536_confirm"
DEFAULT_PPTX = ROOT / "STAR_Color_0520加盟簡報0511_GPT_Image_2_整頁烘字_完整確認版_1536.pptx"


def load_env(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    values = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def parse_pages(raw: str) -> list[int] | None:
    if not raw.strip():
        return None
    return [int(item.strip()) for item in raw.split(",") if item.strip()]


def check_pngs(folder: Path, expected: int, required: bool, pages: list[int] | None = None) -> tuple[bool, list[str]]:
    messages = []
    if pages:
        files = [folder / f"page_{page:02d}.png" for page in pages]
        existing = [path for path in files if path.exists()]
        missing = [path.name for path in files if not path.exists()]
        if required and missing:
            return False, [f"FAIL {folder.name}: missing {', '.join(missing)}"]
        files = existing
        messages.append(f"OK {folder.name}: found requested pages {', '.join(str(p) for p in pages)}")
    else:
        files = sorted(folder.glob("page_*.png"))
        if required and len(files) != expected:
            messages.append(f"FAIL {folder.name}: expected {expected} PNG files, found {len(files)}")
            return False, messages
        if not files:
            messages.append(f"WARN {folder.name}: no PNG files yet")
            return (not required), messages
        messages.append(f"OK {folder.name}: found {len(files)} PNG files")

    ok = True
    for path in files:
        try:
            size = read_image_size(path)
        except Exception as exc:
            ok = False
            messages.append(f"FAIL {path.name}: unreadable image ({type(exc).__name__})")
            continue
        if size[0] < 1280 or size[1] < 720:
            ok = False
            messages.append(f"FAIL {path.name}: image too small {size}")
        else:
            messages.append(f"OK {path.name}: {size[0]}x{size[1]} {path.stat().st_size} bytes")
    return ok, messages


def read_image_size(path: Path) -> tuple[int, int]:
    if Image:
        img = Image.open(path)
        return img.size
    with path.open("rb") as fh:
        header = fh.read(24)
    if header.startswith(b"\x89PNG\r\n\x1a\n") and header[12:16] == b"IHDR":
        return struct.unpack(">II", header[16:24])
    raise ValueError("Pillow is not installed and file is not a readable PNG")


def expected_pages_from_prompts() -> int:
    if not PROMPTS.exists():
        return 36
    return len(json.loads(PROMPTS.read_text(encoding="utf-8")).get("pages", [])) or 36


def check_stage_plan() -> tuple[bool, list[str]]:
    if not PROMPTS.exists():
        return False, ["FAIL stage plan: prompt spec missing"]
    pages = json.loads(PROMPTS.read_text(encoding="utf-8")).get("pages", [])
    messages = []
    ok = True
    expected_sources = {
        21: "AD-1",
        22: "AD-2",
        23: "AD-3",
        27: "16",
        28: "17",
        29: "18",
        30: "19",
        31: "20",
        32: "21",
        33: "21-1",
        34: "22",
        35: "23",
        36: "24",
        37: "28",
        38: "29",
        39: "30",
        40: "31",
        41: "CH-1",
        42: "CH-2",
        43: "CH-3",
        44: "CH-4",
        45: "32",
        46: "33",
    }
    for page_no, source in expected_sources.items():
        actual = str(pages[page_no - 1].get("source_slide", "")) if len(pages) >= page_no else ""
        if actual != source:
            ok = False
            messages.append(f"FAIL stage order: page {page_no} expected source {source}, found {actual}")
    checks = [
        (1, 8, "幻色鏡方執行長 Kenny"),
        (10, 20, "雙師 Akemi"),
        (27, 40, "業務部經理"),
        (41, 44, "許文元理事長"),
    ]
    for start, end, presenter in checks:
        matched = len(pages) >= end and all(page.get("presenter") == presenter for page in pages[start - 1 : end])
        if matched:
            messages.append(f"OK presenter {start}-{end}: {presenter}")
        else:
            ok = False
            messages.append(f"FAIL presenter {start}-{end}: expected {presenter}")
    if ok:
        messages.insert(0, "OK stage order: ad section, marketing bridge, finance/franchise block, chairman policy section, then closing")
    return ok, messages


def check_pptx(expected: int, required: bool, pptx: Path) -> tuple[bool, list[str]]:
    if not pptx.exists():
        message = f"FAIL pptx: missing {pptx.name}" if required else f"WARN pptx: missing {pptx.name}"
        return (not required), [message]
    with zipfile.ZipFile(pptx) as zf:
        slides = [name for name in zf.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)]
        media = [name for name in zf.namelist() if name.startswith("ppt/media/") and not name.endswith("/")]
    messages = [f"OK pptx: {pptx.name} ({pptx.stat().st_size} bytes)"]
    if len(slides) != expected:
        messages.append(f"FAIL pptx: expected {expected} slides, found {len(slides)}")
        return False, messages
    messages.append(f"OK pptx: {len(slides)} slides, {len(media)} media files")
    return True, messages


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate GPT Image 2 full-slide baked deck pipeline outputs.")
    parser.add_argument("--expect-pages", type=int, default=None)
    parser.add_argument("--img-dir", type=Path, default=DEFAULT_IMG_DIR)
    parser.add_argument("--pptx", type=Path, default=DEFAULT_PPTX)
    parser.add_argument("--require-images", action="store_true")
    parser.add_argument("--require-pptx", action="store_true")
    parser.add_argument("--pages", default="", help="Comma-separated full-slide pages to require, e.g. 1 or 1,5,10")
    args = parser.parse_args()
    expected_pages = args.expect_pages or expected_pages_from_prompts()

    all_ok = True

    central = load_env(SECRET_PATH)
    local = load_env(LOCAL_ENV)
    key = os.environ.get("OPENAI_API_KEY") or central.get("OPENAI_API_KEY") or local.get("OPENAI_API_KEY")

    print("Prompts")
    print(f"OK prompt spec exists: {PROMPTS.exists()} ({PROMPTS})")
    if not PROMPTS.exists():
        all_ok = False
    print(f"OK brand kit exists: {BRAND_KIT.exists()} ({BRAND_KIT})")
    if not BRAND_KIT.exists():
        all_ok = False

    ok, messages = check_stage_plan()
    all_ok = all_ok and ok
    print("\n".join(messages))

    print("\nSecrets")
    print(f"OK central secret exists: {SECRET_PATH.exists()} ({SECRET_PATH})")
    print(f"OK local .env exists: {LOCAL_ENV.exists()} ({LOCAL_ENV})")
    if key:
        print("OK OPENAI_API_KEY configured: yes")
    else:
        print("FAIL OPENAI_API_KEY configured: no")
        all_ok = False
    if local.get("OPENAI_API_KEY"):
        print("WARN local .env contains OPENAI_API_KEY; prefer central secret only")

    print("\nFull-Slide Images")
    ok, messages = check_pngs(args.img_dir, expected_pages, args.require_images, parse_pages(args.pages))
    all_ok = all_ok and ok
    print("\n".join(messages))

    print("\nPPTX")
    ok, messages = check_pptx(expected_pages, args.require_pptx, args.pptx)
    all_ok = all_ok and ok
    print("\n".join(messages))

    print("\nManual QA")
    print("CHECK each generated page for Chinese typos, wrong numbers, extra English, tiny unreadable text, and fake logos.")
    print("CHECK AI machine metrics exactly: 50 秒 and 單次精準調配 < 0.2G.")
    print("CHECK machine vendor pages exactly: 3 大自研晶片, 12 色自研配色體系, 20 項國家專利, 50 秒調配完成配方, 711+ 色彩資料庫.")
    print("CHECK ad expert pages exactly: 曝光 287,109, 觸及 128,021, 傳訊 609, 貼文互動 56,475, 心情 364.")
    print("CHECK chairman policy pages do not imply guaranteed subsidy, guaranteed certification, guaranteed franchise success, or guaranteed income.")

    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
