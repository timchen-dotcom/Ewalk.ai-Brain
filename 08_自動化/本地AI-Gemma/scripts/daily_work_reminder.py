#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo


BASE_DIR = Path(os.environ.get("ASHUN_BASE_DIR", Path(__file__).resolve().parents[3]))
AUTOMATION_DIR = BASE_DIR / "08_自動化" / "本地AI-Gemma"
DAILY_DIR = BASE_DIR / "14_每日工作"
CONFIG_PATH = Path(os.environ.get("ASHUN_CONFIG_PATH", AUTOMATION_DIR / "config.local.json"))
OUTPUT_DIR = Path(os.environ.get("ASHUN_OUTPUT_DIR", AUTOMATION_DIR / "output"))
DISCORD_DRAFT_DIR = Path(
    os.environ.get(
        "ASHUN_DISCORD_DRAFT_DIR",
        BASE_DIR / "08_自動化" / "Discord通知草稿" / "daily_handoff",
    )
)


def section(text: str, heading: str) -> str:
    pattern = rf"^## {re.escape(heading)}\s*$"
    lines = text.splitlines()
    start = None
    for i, line in enumerate(lines):
        if re.match(pattern, line):
            start = i + 1
            break
    if start is None:
        return ""
    end = len(lines)
    for i in range(start, len(lines)):
        if lines[i].startswith("## "):
            end = i
            break
    return "\n".join(lines[start:end]).strip()


def unfinished_tasks(raw: str) -> list[str]:
    tasks: list[str] = []
    for line in raw.splitlines():
        cleaned = line.strip()
        if not cleaned or cleaned in {"-", "- [ ]", "- [x]"}:
            continue
        if re.match(r"^- \[[ xX]\]\s*", cleaned):
            if re.match(r"^- \[[xX]\]\s*", cleaned):
                continue
            cleaned = re.sub(r"^- \[[ ]\]\s*", "", cleaned).strip()
        elif cleaned.startswith("- "):
            cleaned = cleaned[2:].strip()
        if cleaned:
            tasks.append(cleaned)
    return tasks


def bullet_lines(raw: str) -> list[str]:
    items: list[str] = []
    for line in raw.splitlines():
        cleaned = line.strip()
        if not cleaned or cleaned == "-":
            continue
        if cleaned.startswith("- "):
            items.append(cleaned[2:].strip())
        else:
            items.append(cleaned)
    return [item for item in items if item]


def dedupe_keep_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        ordered.append(item)
    return ordered


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def pick_daily_handoff_webhook(config: dict) -> str:
    enabled = str(config.get("discord_daily_handoff_enabled", "")).lower() == "true"
    if not enabled:
        return ""
    webhooks = config.get("discord_webhooks", {})
    webhook_url = ""
    if isinstance(webhooks, dict):
        webhook_url = str(webhooks.get("daily_handoff", "")).strip()
    if not webhook_url:
        webhook_url = str(config.get("discord_webhook_url", "")).strip()
    if not webhook_url or webhook_url.startswith("貼上"):
        return ""
    return webhook_url


def notify_discord(content: str) -> tuple[bool, str]:
    config = load_config()
    webhook_url = pick_daily_handoff_webhook(config)
    if not webhook_url:
        return False, "daily_handoff webhook is not configured or disabled"
    payload = {
        "content": content,
        "username": str(config.get("discord_username", "阿順｜Ewalk.ai")),
    }
    avatar_url = str(config.get("discord_avatar_url", "")).strip()
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
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            ok = 200 <= res.status < 300
            return ok, "" if ok else f"Discord returned HTTP {res.status}"
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}"


def fmt_block(title: str, items: list[str], empty_text: str = "（空）") -> str:
    if not items:
        return f"## {title}\n- {empty_text}"
    body = "\n".join(f"- {item}" for item in items)
    return f"## {title}\n{body}"


def safe_read(path: Path, errors: list[str]) -> str:
    try:
        if not path.exists():
            return ""
        return path.read_text(encoding="utf-8")
    except Exception as exc:
        errors.append(f"{path}: {type(exc).__name__}: {exc}")
        return ""


def build_summary(today: dt.date, tz: str) -> tuple[str, dict]:
    yesterday = today - dt.timedelta(days=1)
    tomorrow = today + dt.timedelta(days=1)

    today_path = DAILY_DIR / f"{today.isoformat()}.md"
    yesterday_path = DAILY_DIR / f"{yesterday.isoformat()}.md"
    tomorrow_path = DAILY_DIR / f"{tomorrow.isoformat()}.md"

    read_errors: list[str] = []
    today_raw = safe_read(today_path, read_errors)
    yesterday_raw = safe_read(yesterday_path, read_errors)
    tomorrow_raw = safe_read(tomorrow_path, read_errors)

    today_focus = unfinished_tasks(section(today_raw, "今日重點"))
    today_todos = unfinished_tasks(section(today_raw, "今日待辦"))
    today_designer = unfinished_tasks(section(today_raw, "設計師追蹤"))
    yesterday_designer = unfinished_tasks(section(yesterday_raw, "設計師追蹤"))
    today_designer = dedupe_keep_order(today_designer + yesterday_designer)
    today_meetings = bullet_lines(section(today_raw, "會議與溝通"))
    today_waiting = unfinished_tasks(section(today_raw, "等待回覆"))
    today_tomorrow_handoff = unfinished_tasks(section(today_raw, "明天接續"))

    y_unfinished = []
    y_unfinished.extend(unfinished_tasks(section(yesterday_raw, "今日重點")))
    y_unfinished.extend(unfinished_tasks(section(yesterday_raw, "今日待辦")))
    y_unfinished.extend(unfinished_tasks(section(yesterday_raw, "設計師追蹤")))
    y_unfinished.extend(unfinished_tasks(section(yesterday_raw, "等待回覆")))
    y_unfinished = [item for item in y_unfinished if item]

    t_focus = unfinished_tasks(section(tomorrow_raw, "今日重點"))
    t_meetings = bullet_lines(section(tomorrow_raw, "會議與溝通"))

    header = (
        f"早安｜{today.isoformat()}（{tz}）今日工作提醒\n"
        f"Obsidian：{today_path.name if today_path.exists() else '（找不到今日每日筆記）'}"
    )

    parts = [header]
    if read_errors:
        parts.extend(
            [
                "",
                "## 系統狀態",
                "- 每日提醒排程已啟動，但 macOS 目前不允許它讀取 Obsidian 每日筆記。",
                "- 請到 系統設定 > 隱私權與安全性 > 完整磁碟取用權，允許 Terminal 或 Python 讀取桌面資料夾。",
                "- 阿順會先發這則提醒，避免每日通知安靜失敗。",
            ]
        )
    parts.extend(
        [
            "",
            fmt_block("今日重點", today_focus, empty_text="今天先補上 1–3 個最重要的結果"),
            "",
            fmt_block("今日待辦", today_todos, empty_text="今天把昨天接續/臨時事項補進來"),
            "",
            fmt_block("設計師 / 準師 / 店長追蹤", today_designer, empty_text="（無）"),
            "",
            fmt_block("會議與溝通", today_meetings, empty_text="（無）"),
            "",
            fmt_block("等待回覆", today_waiting, empty_text="（無）"),
            "",
            fmt_block("明天接續（今天先記著）", today_tomorrow_handoff, empty_text="（無）"),
            "",
            fmt_block(f"昨天未完成（{yesterday.isoformat()}）", y_unfinished, empty_text="（無）"),
        ]
    )

    if tomorrow_raw:
        parts.extend(
            [
                "",
                fmt_block(f"明日預告（{tomorrow.isoformat()}）重點", t_focus, empty_text="（無）"),
                "",
                fmt_block(f"明日預告（{tomorrow.isoformat()}）會議", t_meetings, empty_text="（無）"),
            ]
        )

    meta = {
        "today": today.isoformat(),
        "yesterday": yesterday.isoformat(),
        "tomorrow": tomorrow.isoformat(),
        "today_path": str(today_path),
        "yesterday_path": str(yesterday_path),
        "tomorrow_path": str(tomorrow_path),
        "counts": {
            "today_focus": len(today_focus),
            "today_todos": len(today_todos),
            "today_designer": len(today_designer),
            "today_meetings": len(today_meetings),
            "today_waiting": len(today_waiting),
            "today_tomorrow_handoff": len(today_tomorrow_handoff),
            "yesterday_unfinished": len(y_unfinished),
            "tomorrow_focus": len(t_focus),
            "tomorrow_meetings": len(t_meetings),
        },
        "read_errors": read_errors,
    }
    return "\n".join(parts).strip() + "\n", meta


def write_discord_draft(today: dt.date, content: str) -> Path:
    DISCORD_DRAFT_DIR.mkdir(parents=True, exist_ok=True)
    path = DISCORD_DRAFT_DIR / f"{today.isoformat()}.md"
    path.write_text(content, encoding="utf-8")
    return path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="Today in YYYY-MM-DD. Defaults to Asia/Taipei today.")
    parser.add_argument("--no-discord", action="store_true", help="Do not send Discord notification.")
    parser.add_argument("--timezone", default="Asia/Taipei", help="IANA TZ name. Default Asia/Taipei.")
    args = parser.parse_args()

    try:
        tz = ZoneInfo(args.timezone)
    except Exception:
        print(f"Invalid timezone: {args.timezone}", file=sys.stderr)
        return 2

    today = dt.date.fromisoformat(args.date) if args.date else dt.datetime.now(tz).date()
    summary, meta = build_summary(today, args.timezone)

    print(summary, end="")
    draft_path = write_discord_draft(today, summary)
    discord_sent = False
    discord_error = ""
    if not args.no_discord:
        discord_sent, discord_error = notify_discord(summary)

    meta["discord_sent"] = discord_sent
    meta["discord_error"] = discord_error
    meta["discord_draft_path"] = str(draft_path)
    meta["timezone"] = args.timezone
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / f"{today.isoformat()}-daily-work-reminder.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
