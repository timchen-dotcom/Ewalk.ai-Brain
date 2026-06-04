#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from pathlib import Path


AUTOMATION_DIR = Path(__file__).resolve().parents[1]
CONFIG_PATH = AUTOMATION_DIR / "config.local.json"
DEFAULT_CHANNEL = "daily_handoff"


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def webhook_for(config: dict, channel: str) -> str:
    webhooks = config.get("discord_webhooks", {})
    if isinstance(webhooks, dict):
        url = str(webhooks.get(channel, "")).strip()
        if url and not url.startswith("貼上"):
            return url
    if channel == DEFAULT_CHANNEL:
        return str(config.get("discord_webhook_url", "")).strip()
    return ""


def send_discord(webhook_url: str, content: str, username: str, avatar_url: str = "") -> bool:
    payload = {"content": content, "username": username}
    if avatar_url:
        payload["avatar_url"] = avatar_url
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        webhook_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Ewalk.ai-Automation/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as res:
        return 200 <= res.status < 300


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--message", required=True)
    args = parser.parse_args()

    config = load_config()
    webhook_url = webhook_for(config, args.channel)
    if not webhook_url:
        print(f"Discord webhook not configured for channel: {args.channel}", file=sys.stderr)
        return 1

    username = str(config.get("discord_username", "阿順｜Ewalk.ai"))
    avatar_url = str(config.get("discord_avatar_url", ""))
    if send_discord(webhook_url, args.message, username, avatar_url):
        print("Discord 通知已送出。")
        return 0
    print("Discord 通知送出失敗。", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())

