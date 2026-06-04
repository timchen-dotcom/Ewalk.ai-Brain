#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo


BASE_DIR = Path(__file__).resolve().parents[3]
AUTOMATION_DIR = BASE_DIR / "08_自動化" / "本地AI-Gemma"
DAILY_DIR = BASE_DIR / "14_每日工作"
TEMPLATE_PATH = BASE_DIR / "模板" / "每日工作模板.md"
OUTPUT_DIR = AUTOMATION_DIR / "output"
CONFIG_PATH = AUTOMATION_DIR / "config.local.json"
MODEL = "gemma3:1b"
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"


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


def ask_gemma(tasks: list[str]) -> list[str]:
    if not tasks:
        return []
    prompt = (
        "你是 Ewalk.ai 的本地工作整理助理。"
        "請把以下明天接續事項整理成繁體中文待辦清單。"
        "只輸出 JSON array of strings，不要解釋。\n\n"
        + json.dumps(tasks, ensure_ascii=False)
    )
    payload = json.dumps(
        {"model": MODEL, "prompt": prompt, "stream": False, "options": {"temperature": 0.1}},
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(
        OLLAMA_URL, data=payload, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            body = json.loads(res.read().decode("utf-8"))
        response = body.get("response", "").strip()
        match = re.search(r"\[[\s\S]*\]", response)
        if not match:
            return tasks
        parsed = json.loads(match.group(0))
        return [str(item).strip() for item in parsed if str(item).strip()]
    except Exception:
        return tasks


def ensure_today_note(path: Path, date_text: str) -> None:
    if path.exists():
        return
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    path.write_text(template.replace("{{date:YYYY-MM-DD}}", date_text), encoding="utf-8")


def add_tasks_to_today(path: Path, tasks: list[str]) -> list[str]:
    if not tasks:
        return []
    text = path.read_text(encoding="utf-8")
    existing = set(unfinished_tasks(section(text, "今日待辦")))
    new_tasks = [task for task in tasks if task not in existing]
    if not new_tasks:
        return []
    lines = text.splitlines()
    insert_at = None
    for i, line in enumerate(lines):
        if line.strip() == "## 今日待辦":
            insert_at = i + 1
            while insert_at < len(lines) and lines[insert_at].strip() == "":
                insert_at += 1
            break
    if insert_at is None:
        lines.extend(["", "## 今日待辦"])
        insert_at = len(lines)
    placeholder_indexes = [
        i for i in range(insert_at, len(lines))
        if lines[i].strip() in {"- [ ]", "-"}
    ]
    if placeholder_indexes:
        del lines[placeholder_indexes[0]]
        if placeholder_indexes[0] < insert_at:
            insert_at -= 1
    additions = [f"- [ ] {task}" for task in new_tasks]
    lines[insert_at:insert_at] = additions
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return new_tasks


def load_config() -> dict[str, str]:
    if not CONFIG_PATH.exists():
        return {}
    try:
        raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return {str(key): str(value) for key, value in raw.items() if value}


def discord_message(today: dt.date, added: list[str], tasks: list[str], today_path: Path) -> str:
    title = f"早安，今天是 {today.isoformat()} 的工作接續"
    if added:
        task_lines = "\n".join(f"- {task}" for task in added)
        body = f"已從昨天的 `明天接續` 放進今天的 `今日待辦`：\n{task_lines}"
    elif tasks:
        body = "昨天的接續事項已經在今天待辦中，沒有重複新增。"
    else:
        body = "昨天沒有明天接續事項，今天可以先規劃 `今日重點`。"
    return f"{title}\n\n{body}\n\nObsidian：{today_path.name}"


def notify_discord(content: str) -> bool:
    config = load_config()
    enabled = str(config.get("discord_daily_handoff_enabled", "")).lower() == "true"
    if not enabled:
        return False
    webhooks = config.get("discord_webhooks", {})
    webhook_url = ""
    if isinstance(webhooks, dict):
        webhook_url = str(webhooks.get("daily_handoff", "")).strip()
    if not webhook_url:
        webhook_url = config.get("discord_webhook_url", "").strip()
    if not webhook_url or webhook_url.startswith("貼上"):
        return False
    payload = {
        "content": content,
        "username": config.get("discord_username", "阿順｜Ewalk.ai"),
    }
    avatar_url = config.get("discord_avatar_url", "").strip()
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
            return 200 <= res.status < 300
    except Exception:
        return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="Today in YYYY-MM-DD. Defaults to Asia/Taipei today.")
    args = parser.parse_args()

    today = (
        dt.date.fromisoformat(args.date)
        if args.date
        else dt.datetime.now(ZoneInfo("Asia/Taipei")).date()
    )
    yesterday = today - dt.timedelta(days=1)
    today_path = DAILY_DIR / f"{today.isoformat()}.md"
    yesterday_path = DAILY_DIR / f"{yesterday.isoformat()}.md"

    ensure_today_note(today_path, today.isoformat())
    raw = yesterday_path.read_text(encoding="utf-8") if yesterday_path.exists() else ""
    tasks = unfinished_tasks(section(raw, "明天接續"))
    normalized = ask_gemma(tasks)
    added = add_tasks_to_today(today_path, normalized)
    message = discord_message(today, added, tasks, today_path)
    discord_sent = notify_discord(message)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    summary_path = OUTPUT_DIR / f"{today.isoformat()}-daily-handoff.json"
    summary_path.write_text(
        json.dumps(
            {
                "today": today.isoformat(),
                "yesterday": yesterday.isoformat(),
                "source": str(yesterday_path),
                "target": str(today_path),
                "found": tasks,
                "added": added,
                "discord_sent": discord_sent,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    if added:
        print("今天接續：")
        for task in added:
            print(f"- {task}")
    elif tasks:
        print("昨天的接續事項已經在今天待辦中。")
    else:
        print("昨天沒有明天接續事項，今天可以先規劃今日重點。")
    if discord_sent:
        print("Discord 通知已送出。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
