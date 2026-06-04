from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
import socket
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DEFAULT_PROMPTS = ROOT / "gpt_image2_prompts.json"
DEFAULT_OUT = ROOT / "ai_backgrounds"
API_URL = "https://api.openai.com/v1/images/generations"
SECRET_PATHS = [
    Path.home() / ".config" / "ewalk" / "openai.env",
    ROOT / ".env",
]


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_env_files() -> list[Path]:
    loaded = []
    for path in SECRET_PATHS:
        if path.exists():
            load_dotenv(path)
            loaded.append(path)
    return loaded


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def post_json(url: str, api_key: str, payload: dict, timeout: int = 180) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        if exc.code == 403 and "must be verified" in body:
            raise RuntimeError(
                "NEEDS_ORG_VERIFICATION: OpenAI organization must be verified before using gpt-image-2.\n"
                "Open https://platform.openai.com/settings/organization/general\n"
                "Click Verify Organization, then wait up to 15 minutes and run this script again."
            ) from exc
        raise RuntimeError(f"OpenAI Images API error {exc.code}: {body}") from exc


def extract_image_bytes(result: dict, api_key: str) -> bytes:
    data = result.get("data") or []
    if data:
        first = data[0]
        if first.get("b64_json"):
            return base64.b64decode(first["b64_json"])
        if first.get("url"):
            req = urllib.request.Request(first["url"], headers={"Authorization": f"Bearer {api_key}"})
            with urllib.request.urlopen(req, timeout=180) as resp:
                return resp.read()

    # Defensive support in case a future image endpoint returns an output array.
    for item in result.get("output", []):
        for content in item.get("content", []):
            image_b64 = content.get("b64_json") or content.get("image_base64")
            if image_b64:
                return base64.b64decode(image_b64)

    raise RuntimeError(f"Could not find image bytes in API response keys: {sorted(result.keys())}")


def build_prompt(shared_style: str, negative: str, page: dict) -> str:
    return (
        f"{page['prompt']}\n\n"
        f"Style requirements: {shared_style}.\n"
        f"Negative requirements: {negative}.\n"
        "Important: generate a text-free presentation background only. "
        "Do not place any readable text, letters, numbers, captions, labels, or logos in the image."
    )


def selected_pages(pages: list[dict], only: set[int] | None) -> list[dict]:
    if not only:
        return pages
    return [page for page in pages if int(page["page"]) in only]


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate STAR Color slide backgrounds with OpenAI GPT Image 2.")
    parser.add_argument("--prompts", type=Path, default=DEFAULT_PROMPTS)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--model", default=None, help="Default: value from prompts JSON, usually gpt-image-2")
    parser.add_argument("--size", default=None, help="Default: value from prompts JSON, e.g. 3840x2160")
    parser.add_argument("--quality", default=None, help="Default: value from prompts JSON, e.g. high")
    parser.add_argument("--only", default="", help="Comma-separated page numbers, e.g. 1,3,10")
    parser.add_argument("--force", action="store_true", help="Overwrite existing ai_backgrounds/page_XX.png")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts without calling the API")
    parser.add_argument("--check-auth", action="store_true", help="Check that an API key is configured without calling the image API")
    parser.add_argument("--sleep", type=float, default=0.0, help="Seconds to wait between API calls")
    args = parser.parse_args()

    spec = read_json(args.prompts)
    model = args.model or spec.get("model") or "gpt-image-2"
    size = args.size or spec.get("size") or "3840x2160"
    quality = args.quality or spec.get("quality") or "high"
    shared_style = spec["shared_style"]
    negative = spec["negative"]
    only = {int(x.strip()) for x in args.only.split(",") if x.strip()} or None
    pages = selected_pages(spec["pages"], only)

    args.out_dir.mkdir(parents=True, exist_ok=True)

    if args.dry_run:
        for page in pages:
            prompt = build_prompt(shared_style, negative, page)
            print(f"\n--- page_{int(page['page']):02d} / {page.get('role', '')} ---\n{prompt}")
        return 0

    loaded_envs = load_env_files()
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print(
            "OPENAI_API_KEY is not configured. Expected one of:\n"
            + "\n".join(f"- {path}" for path in SECRET_PATHS),
            file=sys.stderr,
        )
        return 2
    if args.check_auth:
        print("OPENAI_API_KEY configured: yes")
        print("Loaded env files:")
        for path in loaded_envs:
            print(f"- {path}")
        return 0

    for index, page in enumerate(pages):
        page_no = int(page["page"])
        out_path = args.out_dir / f"page_{page_no:02d}.png"
        if out_path.exists() and not args.force:
            print(f"[skip] {out_path}")
            continue

        prompt = build_prompt(shared_style, negative, page)
        payload = {
            "model": model,
            "prompt": prompt,
            "size": size,
            "quality": quality,
            "n": 1,
        }
        print(f"[generate] page_{page_no:02d} model={model} size={size} quality={quality}")
        try:
            result = post_json(API_URL, api_key, payload)
        except RuntimeError as exc:
            print(str(exc), file=sys.stderr)
            return 4
        except urllib.error.URLError as exc:
            if isinstance(exc.reason, socket.gaierror):
                print(
                    "Network error: this environment cannot resolve api.openai.com. "
                    "The OpenAI API key is configured, but GPT Image 2 generation needs network access.",
                    file=sys.stderr,
                )
                return 3
            raise
        out_path.write_bytes(extract_image_bytes(result, api_key))
        print(f"[ok] {out_path}")

        if args.sleep and index < len(pages) - 1:
            time.sleep(args.sleep)

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Interrupted by user.", file=sys.stderr)
        raise SystemExit(130)
