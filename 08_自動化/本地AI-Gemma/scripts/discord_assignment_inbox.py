#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo


BASE_DIR = Path(os.environ.get("ASHUN_BASE_DIR", Path(__file__).resolve().parents[3]))
AUTOMATION_DIR = Path(
    os.environ.get("ASHUN_AUTOMATION_DIR", BASE_DIR / "08_自動化" / "本地AI-Gemma")
)
CONFIG_PATH = Path(os.environ.get("ASHUN_CONFIG_PATH", AUTOMATION_DIR / "config.local.json"))
STATE_PATH = Path(
    os.environ.get(
        "ASHUN_ASSIGNMENT_STATE_PATH",
        AUTOMATION_DIR / "output" / "discord-assignment-state.json",
    )
)
CHAT_STATE_PATH = Path(
    os.environ.get(
        "ASHUN_CHAT_STATE_PATH",
        AUTOMATION_DIR / "output" / "discord-ashun-conversation-state.json",
    )
)
INBOX_PATH = Path(
    os.environ.get("ASHUN_ASSIGNMENT_INBOX_PATH", BASE_DIR / "00_收件匣" / "Discord交辦收件匣.md")
)
INBOX_DIR = INBOX_PATH.parent
API_BASE = "https://discord.com/api/v10"
DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
DEFAULT_OLLAMA_MODEL = "gemma3:1b"
MAX_DISCORD_LENGTH = 1800
BOT_VERSION = "ashun-discord-chat-v1.1"


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def load_state() -> dict:
    if not STATE_PATH.exists():
        return {}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_chat_state() -> dict:
    if not CHAT_STATE_PATH.exists():
        return {"messages": []}
    try:
        state = json.loads(CHAT_STATE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"messages": []}
    if not isinstance(state, dict):
        return {"messages": []}
    messages = state.get("messages", [])
    if not isinstance(messages, list):
        messages = []
    return {"messages": messages[-12:]}


def save_chat_state(state: dict) -> None:
    CHAT_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    messages = state.get("messages", [])
    if isinstance(messages, list):
        state["messages"] = messages[-12:]
    CHAT_STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def request_json(path: str, token: str, method: str = "GET", payload: dict | None = None):
    data = None
    headers = {
        "Authorization": f"Bot {token}",
        "Content-Type": "application/json",
        "User-Agent": "Ewalk.ai-Automation/1.0",
    }
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(f"{API_BASE}{path}", data=data, headers=headers, method=method)
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=20) as res:
                raw = res.read().decode("utf-8")
                if not raw:
                    return None
                return json.loads(raw)
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempt == 0:
                retry_after = 5.0
                try:
                    body = exc.read().decode("utf-8")
                    retry_after = float(json.loads(body).get("retry_after", retry_after))
                except Exception:
                    header_value = exc.headers.get("Retry-After", "")
                    if header_value:
                        try:
                            retry_after = float(header_value)
                        except ValueError:
                            pass
                time.sleep(min(max(retry_after, 1.0), 30.0))
                continue
            raise
    return None


def normalize_channel_name(name: str) -> str:
    return re.sub(r"\s+", "", name).lower()


def find_assignment_channel(config: dict, token: str) -> tuple[str, str]:
    configured_id = str(config.get("discord_assignment_channel_id", "")).strip()
    if configured_id:
        channel = request_json(f"/channels/{configured_id}", token)
        return configured_id, str(channel.get("name", configured_id))

    desired = normalize_channel_name(str(config.get("discord_assignment_channel_name", "專業經理人🤖阿順")))
    guilds = request_json("/users/@me/guilds", token)
    for guild in guilds:
        channels = request_json(f"/guilds/{guild['id']}/channels", token)
        for channel in channels:
            if int(channel.get("type", -1)) != 0:
                continue
            if normalize_channel_name(str(channel.get("name", ""))) == desired:
                return str(channel["id"]), str(channel.get("name", ""))
    raise RuntimeError("找不到交辦頻道，請確認 Bot 已加入伺服器且能檢視頻道。")


def get_new_messages(channel_id: str, token: str, after_id: str = "") -> list[dict]:
    query = urllib.parse.urlencode({"limit": 20, **({"after": after_id} if after_id else {})})
    messages = request_json(f"/channels/{channel_id}/messages?{query}", token)
    return list(reversed(messages))


def classify(content: str) -> str:
    text = content.lower()
    if any(keyword in text for keyword in ["自我升級", "升級", "codex", "prompt", "sop", "agent"]):
        return "自我升級"
    if any(keyword in text for keyword in ["美感", "趨勢", "時尚", "美妝", "美髮", "潮流"]):
        return "美感趨勢"
    if any(keyword in text for keyword in ["客戶", "素材", "月報", "報價", "合約", "star spa", "star color", "oc hair", "創業大會", "加盟"]):
        return "客戶待辦"
    if any(keyword in text for keyword in ["提醒", "截止", "明天", "今天", "下週", "會議", "幾點"]):
        return "重要提醒"
    if any(keyword in text for keyword in ["想到", "想法", "靈感", "可以做", "企劃"]):
        return "想法收件匣"
    return "待整理"


def read_brief(path: Path, limit: int = 1800) -> str:
    if not path.exists():
        return ""
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return ""
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + "\n..."


def ashun_context() -> str:
    paths = [
        BASE_DIR.parent / "AGENTS.md",
        BASE_DIR / "08_自動化" / "阿順交辦規則.md",
        BASE_DIR / "08_自動化" / "Ewalk.ai AI Command Center.md",
        BASE_DIR / "08_自動化" / "Discord阿順即時對談窗口升級方案.md",
    ]
    sections: list[str] = []
    for path in paths:
        brief = read_brief(path)
        if brief:
            sections.append(f"【{path.name}】\n{brief}")
    return "\n\n".join(sections)


def fallback_reply(content: str, category: str) -> str:
    if category == "自我升級":
        next_step = "我會先把它放到自我升級線，適合後續整理成 SOP、Prompt 或系統改善建議。"
    elif category == "美感趨勢":
        next_step = "我會先把它放到美感趨勢線，後續可整理成內容靈感、Reels 題材或客戶提案素材。"
    elif category == "客戶待辦":
        next_step = "我會先把它當成客戶追蹤事項，後續適合整理到客戶資料夾或每日工作。"
    elif category == "重要提醒":
        next_step = "我會先把它當成重要提醒；如果你有明確日期和時間，我再協助整理成可追蹤事項。"
    elif category == "想法收件匣":
        next_step = "我會先把它收進想法池，之後可以再抽成企劃、Prompt 或 SOP。"
    else:
        next_step = "我會先放進待整理，等資訊更完整再分流到客戶、提醒、SOP 或知識庫。"
    if "?" in content or "？" in content:
        opening = "收到，我先用安全模式回覆："
    else:
        opening = "收到，已先寫進 Obsidian 交辦收件匣。"
    return f"{opening}\n初步分類：{category}。\n{next_step}\n（{BOT_VERSION}）"


def build_prompt(content: str, category: str, author: str, channel_name: str, chat_state: dict) -> str:
    return (
        "你是 Ewalk.ai 的阿順，提姆的專業經理人與工作系統窗口。"
        "請使用繁體中文，務實、清楚、可執行。"
        "你正在 Discord #專業經理人🤖阿順 回覆提姆或團隊。"
        "目前第一版能力：可以即時回覆、整理下一步，並已把訊息寫入 Obsidian 交辦收件匣。"
        "重要安全規則：除了「已寫入 Obsidian 交辦收件匣」之外，不要說你已完成、新增、更新、建立、分組、整理、寫入任何其他文件或任務。"
        "如果使用者問你現在能做什麼，請回答目前能力，不要引用過去任務。"
        "如果使用者交辦任務，請只說你已收件、初步分類、建議下一步；不要假裝已經完成任務。"
        "涉及寄信、行事曆異動、刪除檔案、客戶承諾、付款、公開發布、修改全域規則時，必須先請提姆確認。"
        f"回覆請控制在 6 行內，適合貼在 Discord。最後一行附上版本：{BOT_VERSION}\n\n"
        f"系統規則摘要：\n{ashun_context()}\n\n"
        f"來源頻道：#{channel_name}\n"
        f"發話者：{author}\n"
        f"初步分類：{category}\n"
        f"最新訊息：\n{content}\n\n"
        "請直接輸出要回覆到 Discord 的內容，不要加引號，不要輸出分析過程。"
    )


def canned_reply(content: str, category: str) -> str | None:
    text = content.lower()
    capability_keywords = [
        "能做什麼",
        "可以做什麼",
        "你會什麼",
        "新版已啟動",
        "收到的話",
        "測試",
    ]
    if any(keyword in text for keyword in capability_keywords):
        return (
            "收到，新版阿順已啟動。\n"
            "目前我可以即時回覆、把交辦寫進 Obsidian、做初步分類，並提醒下一步。\n"
            "我還不會直接完成高風險操作；涉及對外發送、行事曆、客戶承諾或改系統規則，會先問提姆確認。\n"
            f"（{BOT_VERSION}）"
        )
    return None


def sanitize_reply(reply_text: str) -> str:
    risky_patterns = [
        r"(?m)^已完成[:：]?",
        r"(?m)^完成[:：]?",
        r"(?m)^- 新增",
        r"(?m)^- 更新",
        r"(?m)^- 建立",
        r"(?m)^- 分成",
        r"(?m)^Obsidian[:：]\s*\.\.\.",
    ]
    if any(re.search(pattern, reply_text) for pattern in risky_patterns):
        return (
            "收到，已寫進 Obsidian 交辦收件匣。\n"
            "我目前先做初步理解與下一步整理，不會假裝已完成未實際執行的任務。\n"
            "如果要我正式整理成文件或待辦，請直接交辦主題，我會回報實際新增或修改的位置。\n"
            f"（{BOT_VERSION}）"
        )
    if BOT_VERSION not in reply_text:
        reply_text = reply_text.rstrip() + f"\n（{BOT_VERSION}）"
    return reply_text


def ask_ashun(config: dict, content: str, category: str, author: str, channel_name: str, chat_state: dict) -> str:
    canned = canned_reply(content, category)
    if canned:
        return canned

    enabled = bool(config.get("ashun_chat_enabled", True))
    if not enabled:
        return fallback_reply(content, category)

    model = str(config.get("ashun_chat_model", DEFAULT_OLLAMA_MODEL)).strip() or DEFAULT_OLLAMA_MODEL
    url = str(config.get("ashun_chat_ollama_url", DEFAULT_OLLAMA_URL)).strip() or DEFAULT_OLLAMA_URL
    timeout = int(config.get("ashun_chat_timeout_seconds", 25) or 25)
    prompt = build_prompt(content, category, author, channel_name, chat_state)
    payload = json.dumps(
        {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.25, "num_predict": 320},
        },
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "Ewalk.ai-Ashun/1.0"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            body = json.loads(res.read().decode("utf-8"))
    except Exception as exc:
        return fallback_reply(content, category) + f"\n（本地 AI 暫時沒回應，已先安全收件：{exc.__class__.__name__}）"

    reply_text = str(body.get("response", "")).strip()
    if not reply_text:
        return fallback_reply(content, category)
    reply_text = re.sub(r"\n{3,}", "\n\n", reply_text)
    reply_text = sanitize_reply(reply_text)
    if len(reply_text) > MAX_DISCORD_LENGTH:
        reply_text = reply_text[:MAX_DISCORD_LENGTH - 20].rstrip() + "\n...（略）"
    return reply_text


def append_inbox(message: dict, channel_name: str) -> None:
    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    if not INBOX_PATH.exists():
        INBOX_PATH.write_text("# Discord 交辦收件匣\n\n", encoding="utf-8")

    now = dt.datetime.now(ZoneInfo("Asia/Taipei")).strftime("%Y-%m-%d %H:%M")
    author = message.get("author", {}).get("global_name") or message.get("author", {}).get("username", "未知使用者")
    content = str(message.get("content", "")).strip()
    category = classify(content)
    block = (
        f"## {now}｜{category}\n\n"
        f"- 來源：Discord `#{channel_name}`\n"
        f"- Discord 訊息 ID：`{message.get('id', '')}`\n"
        f"- 交辦者：{author}\n"
        f"- 狀態：待整理\n\n"
        f"### 原始交辦\n"
        f"{content}\n\n"
    )
    with INBOX_PATH.open("a", encoding="utf-8") as f:
        f.write(block)


def reply(channel_id: str, token: str, message: dict, reply_text: str) -> None:
    payload = {
        "content": reply_text,
        "message_reference": {
            "message_id": message["id"],
            "channel_id": channel_id,
        },
        "allowed_mentions": {"replied_user": False},
    }
    request_json(f"/channels/{channel_id}/messages", token, method="POST", payload=payload)


def should_skip(message: dict, bot_user_id: str) -> bool:
    author = message.get("author", {})
    return bool(author.get("bot")) or str(author.get("id", "")) == bot_user_id or not str(message.get("content", "")).strip()


def poll_once() -> int:
    config = load_config()
    token = str(config.get("discord_bot_token", "")).strip()
    if not token:
        print("Discord Bot Token 尚未設定。", file=sys.stderr)
        return 1

    me = request_json("/users/@me", token)
    bot_user_id = str(me["id"])
    channel_id, channel_name = find_assignment_channel(config, token)
    state = load_state()
    after_id = str(state.get("last_message_id", ""))
    messages = get_new_messages(channel_id, token, after_id)
    chat_state = load_chat_state()

    processed = 0
    last_seen = after_id
    for message in messages:
        last_seen = str(message["id"])
        if should_skip(message, bot_user_id):
            continue
        content = str(message.get("content", "")).strip()
        author = message.get("author", {}).get("global_name") or message.get("author", {}).get("username", "未知使用者")
        category = classify(content)
        append_inbox(message, channel_name)
        reply_text = ask_ashun(config, content, category, str(author), channel_name, chat_state)
        try:
            reply(channel_id, token, message, reply_text)
        except Exception as exc:
            print(f"Discord 回覆失敗，但已寫入收件匣：{exc}", file=sys.stderr)
        chat_state.setdefault("messages", []).append({"role": "user", "content": content})
        chat_state.setdefault("messages", []).append({"role": "assistant", "content": reply_text})
        save_chat_state(chat_state)
        processed += 1

    if last_seen:
        state["last_message_id"] = last_seen
        state["channel_id"] = channel_id
        state["channel_name"] = channel_name
        save_state(state)

    print(f"交辦頻道：#{channel_name}")
    print(f"本次處理：{processed} 則")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Run one polling pass.")
    parser.add_argument("--interval", type=int, default=15, help="Polling interval in seconds.")
    parser.add_argument("--simulate", help="Generate an Ashun reply locally without touching Discord.")
    args = parser.parse_args()

    if args.simulate:
        config = load_config()
        chat_state = load_chat_state()
        content = str(args.simulate).strip()
        category = classify(content)
        print(ask_ashun(config, content, category, "提姆", "專業經理人🤖阿順", chat_state))
        return 0

    if args.once:
        return poll_once()

    interval = max(5, args.interval)
    print(f"阿順 Discord 交辦收件常駐中，每 {interval} 秒檢查一次。版本：{BOT_VERSION}")
    while True:
        try:
            poll_once()
        except Exception as exc:
            print(f"交辦收件暫時失敗，稍後重試：{exc}", file=sys.stderr)
        time.sleep(interval)


if __name__ == "__main__":
    sys.exit(main())
