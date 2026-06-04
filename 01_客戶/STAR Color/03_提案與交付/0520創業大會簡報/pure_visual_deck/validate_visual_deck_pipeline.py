from __future__ import annotations

import argparse
import os
import re
import zipfile
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
SECRET_PATH = Path.home() / ".config" / "ewalk" / "openai.env"
LOCAL_ENV = ROOT / ".env"
AI_BG_DIR = ROOT / "ai_backgrounds"
IMG_DIR = ROOT / "images"
PPTX = ROOT / "STAR_Color_0520加盟簡報0511_10頁版_純視覺.pptx"


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
            messages.append(f"FAIL {folder.name}: missing {', '.join(missing)}")
            return False, messages
        files = existing
        messages.append(f"OK {folder.name}: found requested pages {', '.join(str(p) for p in pages)}")
    else:
        files = sorted(folder.glob("page_*.png"))
        if required and len(files) != expected:
            messages.append(f"FAIL {folder.name}: expected {expected} PNG files, found {len(files)}")
        elif not required and not files:
            messages.append(f"WARN {folder.name}: no AI background PNG files yet")
            return True, messages
        else:
            messages.append(f"OK {folder.name}: found {len(files)} PNG files")

    if required and not pages and len(files) != expected:
        return False, messages
    elif not required and not files:
        messages.append(f"WARN {folder.name}: no AI background PNG files yet")
        return True, messages

    ok = True
    for path in files:
        try:
            img = Image.open(path)
            size = img.size
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


def check_pptx(expected: int) -> tuple[bool, list[str]]:
    if not PPTX.exists():
        return False, [f"FAIL pptx: missing {PPTX.name}"]
    with zipfile.ZipFile(PPTX) as zf:
        slides = [name for name in zf.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)]
        media = [name for name in zf.namelist() if name.startswith("ppt/media/") and not name.endswith("/")]
    messages = [f"OK pptx: {PPTX.name} ({PPTX.stat().st_size} bytes)"]
    if len(slides) != expected:
        messages.append(f"FAIL pptx: expected {expected} slides, found {len(slides)}")
        return False, messages
    messages.append(f"OK pptx: {len(slides)} slides, {len(media)} media files")
    return True, messages


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate GPT Image 2 visual deck pipeline outputs.")
    parser.add_argument("--expect-pages", type=int, default=10)
    parser.add_argument("--require-ai-backgrounds", action="store_true")
    parser.add_argument("--ai-pages", default="", help="Comma-separated AI background pages to require, e.g. 1 or 1,5,10")
    args = parser.parse_args()

    all_ok = True

    central = load_env(SECRET_PATH)
    local = load_env(LOCAL_ENV)
    key = os.environ.get("OPENAI_API_KEY") or central.get("OPENAI_API_KEY") or local.get("OPENAI_API_KEY")
    print("Secrets")
    print(f"OK central secret exists: {SECRET_PATH.exists()} ({SECRET_PATH})")
    print(f"OK local .env exists: {LOCAL_ENV.exists()} ({LOCAL_ENV})")
    if key:
        print("OK OPENAI_API_KEY configured: yes")
    else:
        print("FAIL OPENAI_API_KEY configured: no")
        all_ok = False
    if local.get("OPENAI_API_KEY"):
        print("WARN local .env contains OPENAI_API_KEY; prefer central secret only")

    print("\nAI Backgrounds")
    ok, messages = check_pngs(AI_BG_DIR, args.expect_pages, args.require_ai_backgrounds, parse_pages(args.ai_pages))
    all_ok = all_ok and ok
    print("\n".join(messages))

    print("\nFinal Slide Images")
    ok, messages = check_pngs(IMG_DIR, args.expect_pages, True)
    all_ok = all_ok and ok
    print("\n".join(messages))

    print("\nPPTX")
    ok, messages = check_pptx(args.expect_pages)
    all_ok = all_ok and ok
    print("\n".join(messages))

    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
