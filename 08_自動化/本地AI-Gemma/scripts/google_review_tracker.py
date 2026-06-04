#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Optional
from zoneinfo import ZoneInfo


BASE_DIR = Path(__file__).resolve().parents[3]
AUTOMATION_DIR = BASE_DIR / "08_自動化" / "本地AI-Gemma"
DEFAULT_CONFIG_PATH = AUTOMATION_DIR / "config.local.json"
DEFAULT_OUTPUT_DIR = AUTOMATION_DIR / "output"

TRUE_VALUES = {"1", "true", "yes", "y", "on", "啟用", "是", "有"}
STAR_MAP = {
    "ONE": "1",
    "TWO": "2",
    "THREE": "3",
    "FOUR": "4",
    "FIVE": "5",
}
RISK_KEYWORDS = [
    "受傷",
    "過敏",
    "燙壞",
    "染壞",
    "毀",
    "退款",
    "退費",
    "投訴",
    "客訴",
    "消保",
    "法律",
    "提告",
    "告消保",
    "詐騙",
]


class ConfigError(RuntimeError):
    pass


def read_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ConfigError(f"JSON 格式錯誤：{path}") from exc


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def as_bool(value, default: bool = False) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in TRUE_VALUES


def as_int(value, default: int) -> int:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return default


def as_float(value, default: float) -> float:
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return default


def resolve_path(value: Optional[str], default: Path, base: Path = AUTOMATION_DIR) -> Path:
    if not value:
        return default
    path = Path(str(value).strip())
    if path.is_absolute():
        return path
    return (base / path).resolve()


def load_config(path: Path) -> dict:
    raw = read_json(path, {})
    tracker = raw.get("google_review_tracker", {})
    return {
        "root": raw,
        "tracker": tracker if isinstance(tracker, dict) else {},
    }


def config_value(config: dict, key: str, default=None):
    return config.get("tracker", {}).get(key, default)


def oauth_value(oauth: dict, key: str, default_env: str) -> str:
    env_name = str(oauth.get(f"{key}_env", default_env)).strip()
    if env_name and os.environ.get(env_name):
        return os.environ[env_name].strip()
    value = str(oauth.get(key, "")).strip()
    if value.startswith("貼上"):
        return ""
    return value


def get_access_token(config: dict) -> str:
    tracker = config.get("tracker", {})
    oauth = tracker.get("oauth", {})
    if not isinstance(oauth, dict):
        oauth = {}

    direct_token = oauth_value(oauth, "access_token", "EWALK_GBP_ACCESS_TOKEN")
    if direct_token:
        return direct_token

    client_id = oauth_value(oauth, "client_id", "EWALK_GBP_CLIENT_ID")
    client_secret = oauth_value(oauth, "client_secret", "EWALK_GBP_CLIENT_SECRET")
    refresh_token = oauth_value(oauth, "refresh_token", "EWALK_GBP_REFRESH_TOKEN")
    if not all([client_id, client_secret, refresh_token]):
        raise ConfigError(
            "缺少 Google OAuth 設定。請設定 EWALK_GBP_CLIENT_ID、"
            "EWALK_GBP_CLIENT_SECRET、EWALK_GBP_REFRESH_TOKEN，或在 config.local.json 填入 oauth。"
        )

    data = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        body = json.loads(res.read().decode("utf-8"))
    token = str(body.get("access_token", "")).strip()
    if not token:
        raise ConfigError("Google OAuth refresh 成功但沒有取得 access_token。")
    return token


def http_json(url: str, token: str, method: str = "GET", body: Optional[dict] = None, retries: int = 2) -> dict:
    data = None
    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "Ewalk.ai-Google-Review-Tracker/1.0",
    }
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    last_error = None
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=40) as res:
                raw = res.read().decode("utf-8")
            return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code in {429, 500, 502, 503, 504} and attempt < retries:
                time.sleep(2 * (attempt + 1))
                continue
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Google API 錯誤 {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(2 * (attempt + 1))
                continue
            raise RuntimeError(f"Google API 連線錯誤：{exc}") from exc
    raise RuntimeError(f"Google API 呼叫失敗：{last_error}")


def read_clients(path: Path, default_sla_days: int, default_channel: str) -> list[dict]:
    if not path.exists():
        raise ConfigError(f"找不到客戶設定表：{path}")
    clients: list[dict] = []
    with path.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if not as_bool(row.get("active")):
                continue
            account_id = str(row.get("account_id", "")).strip().replace("accounts/", "")
            location_id = str(row.get("location_id", "")).strip().replace("locations/", "")
            if not account_id or not location_id:
                continue
            clients.append(
                {
                    "client_name": str(row.get("client_name", "")).strip() or "未命名客戶",
                    "brand_name": str(row.get("brand_name", "")).strip(),
                    "account_id": account_id,
                    "location_id": location_id,
                    "location_display_name": str(row.get("location_display_name", "")).strip()
                    or location_id,
                    "google_maps_url": str(row.get("google_maps_url", "")).strip(),
                    "owner": str(row.get("owner", "")).strip(),
                    "sla_days": as_int(row.get("sla_days"), default_sla_days),
                    "alert_channel": str(row.get("alert_channel", "")).strip() or default_channel,
                    "notes": str(row.get("notes", "")).strip(),
                }
            )
    return clients


def review_parent(client: dict) -> str:
    return f"accounts/{client['account_id']}/locations/{client['location_id']}"


def fetch_reviews(client: dict, token: str, max_pages: int, delay_seconds: float) -> dict:
    parent = review_parent(client)
    all_reviews: list[dict] = []
    page_token = ""
    page = 0
    average_rating = None
    total_review_count = None
    while True:
        params = {
            "pageSize": "50",
            "orderBy": "updateTime desc",
        }
        if page_token:
            params["pageToken"] = page_token
        url = f"https://mybusiness.googleapis.com/v4/{parent}/reviews?{urllib.parse.urlencode(params)}"
        data = http_json(url, token)
        all_reviews.extend(data.get("reviews", []))
        average_rating = data.get("averageRating", average_rating)
        total_review_count = data.get("totalReviewCount", total_review_count)
        page += 1
        page_token = str(data.get("nextPageToken", "")).strip()
        if delay_seconds > 0:
            time.sleep(delay_seconds)
        if not page_token:
            break
        if max_pages > 0 and page >= max_pages:
            break
    return {
        "reviews": all_reviews,
        "averageRating": average_rating,
        "totalReviewCount": total_review_count,
    }


def load_mock_reviews(path: Path) -> dict:
    raw = read_json(path, {})
    if not isinstance(raw, dict):
        raise ConfigError("mock reviews 必須是 JSON object。")
    return raw


def fetch_reviews_from_mock(client: dict, mock: dict) -> dict:
    parent = review_parent(client)
    data = mock.get(parent, {})
    if isinstance(data, list):
        return {"reviews": data, "averageRating": None, "totalReviewCount": len(data)}
    if isinstance(data, dict):
        return {
            "reviews": data.get("reviews", []),
            "averageRating": data.get("averageRating"),
            "totalReviewCount": data.get("totalReviewCount", len(data.get("reviews", []))),
        }
    return {"reviews": [], "averageRating": None, "totalReviewCount": 0}


def parse_time(value: str, timezone: ZoneInfo) -> Optional[dt.datetime]:
    if not value:
        return None
    cleaned = value.strip().replace("Z", "+00:00")
    try:
        parsed = dt.datetime.fromisoformat(cleaned)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(timezone)


def review_name(review: dict) -> str:
    return str(review.get("name") or review.get("reviewName") or review.get("review_id") or "").strip()


def review_id(review: dict) -> str:
    return str(review.get("reviewId") or review.get("review_id") or review_name(review).split("/")[-1]).strip()


def reviewer_name(review: dict) -> str:
    reviewer = review.get("reviewer", {})
    if isinstance(reviewer, dict):
        return str(reviewer.get("displayName") or reviewer.get("profilePhotoUrl") or "未顯示姓名").strip()
    return "未顯示姓名"


def star_text(review: dict) -> str:
    raw = str(review.get("starRating") or review.get("star_rating") or "").strip()
    if raw in STAR_MAP:
        return STAR_MAP[raw]
    return raw or "-"


def star_number(value: str) -> int:
    try:
        return int(str(value).strip())
    except ValueError:
        return 0


def reply_info(review: dict) -> tuple[bool, str]:
    reply = review.get("reviewReply") or review.get("review_reply") or {}
    if not isinstance(reply, dict):
        return False, ""
    comment = str(reply.get("comment", "")).strip()
    state = str(reply.get("reviewReplyState") or reply.get("review_reply_state") or "").strip()
    return bool(comment), state


def short_text(value: str, limit: int = 90) -> str:
    cleaned = " ".join(str(value or "").split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 1] + "..."


def due_label(days_remaining: int) -> str:
    if days_remaining < 0:
        return f"逾期 {abs(days_remaining)} 天"
    if days_remaining == 0:
        return "今天到期"
    return f"剩 {days_remaining} 天"


def contains_risk_keyword(comment: str) -> bool:
    return any(keyword in comment for keyword in RISK_KEYWORDS)


def is_thevision(item: dict) -> bool:
    combined = f"{item.get('client_name', '')} {item.get('brand_name', '')}".lower()
    return "thevision" in combined or "the vision" in combined


def suggested_reply(item: dict) -> str:
    star = star_number(item.get("star_rating", ""))
    reviewer = item.get("reviewer") or "您"
    owner = item.get("owner") or "設計師"
    comment = item.get("comment", "")
    high_risk = star <= 2 or contains_risk_keyword(comment)

    if high_risk:
        return (
            "需提姆先生確認後才能對外回覆。建議草稿：謝謝您願意留下真實感受，"
            "我們很重視這次服務沒有讓您滿意的地方，會盡快和現場團隊確認細節，"
            "也希望能有機會進一步了解您的狀況並協助處理。"
        )

    if is_thevision(item):
        if star == 3:
            return (
                f"謝謝 {reviewer} 願意分享這次的真實感受，我們會把您的回饋交給現場團隊確認，"
                f"也會持續調整服務流程，讓每一次來 The Vision 都能更舒服、更安心。"
                "期待下次回訪時，能讓您感受到更好的體驗。"
            )
        if "第一次" in comment and "燙" in comment:
            return (
                f"謝謝 {reviewer} 的喜愛與肯定，可以把第一次的燙髮交給我們，"
                f"是我們莫大的榮幸。{owner} 是一位相當有耐心的髮型師，"
                "不管在溝通、細節或整理建議上都希望讓您安心，燙後也要記得保濕和護髮喔～"
                "期待您的下次回訪。"
            )
        return (
            f"謝謝 {reviewer} 的喜愛與回覆，能遇到適合自己的設計師真的很珍貴，"
            f"{owner} 看到您的回覆也非常開心。定期整理頭髮真的很重要喔，"
            "能讓好看的髮型和髮質狀態一直維持著，期待您下次回訪再跟我們分享喔～"
        )

    if star >= 4:
        return (
            f"謝謝 {reviewer} 的喜愛與肯定，很開心這次服務能帶給您好的體驗。"
            "我們會繼續用心維持服務品質，也期待下次再為您服務。"
        )
    return (
        f"謝謝 {reviewer} 願意留下回饋，我們會把您的意見交給團隊檢視，"
        "持續調整服務流程，期待下次能帶給您更好的體驗。"
    )


def analyze_reviews(
    clients: list[dict],
    fetched: dict[str, dict],
    state: dict,
    today: dt.date,
    timezone: ZoneInfo,
    default_sla_days: int,
    warning_days: int,
    baseline_first_run: bool,
) -> dict:
    known_reviews = state.setdefault("known_reviews", {})
    first_run = not bool(known_reviews)
    suppress_new = first_run and baseline_first_run
    summaries: list[dict] = []
    new_reviews: list[dict] = []
    unreplied: list[dict] = []
    errors: list[dict] = []

    for client in clients:
        parent = review_parent(client)
        data = fetched.get(parent, {})
        if data.get("error"):
            errors.append({"client": client, "error": data["error"]})
            continue
        reviews = data.get("reviews", [])
        location_new = 0
        location_unreplied = 0
        location_due_today = 0
        location_overdue = 0
        nearest_due: Optional[str] = None
        nearest_days: Optional[int] = None
        for review in reviews:
            name = review_name(review)
            if not name:
                continue
            created_at = parse_time(str(review.get("createTime") or review.get("create_time") or ""), timezone)
            created_date = created_at.date() if created_at else today
            sla_days = as_int(client.get("sla_days"), default_sla_days)
            due_date = created_date + dt.timedelta(days=sla_days)
            days_remaining = (due_date - today).days
            replied, reply_state = reply_info(review)
            is_new = name not in known_reviews
            if is_new and not suppress_new:
                location_new += 1
                new_reviews.append(
                    review_record(client, review, created_date, due_date, days_remaining, reply_state)
                )
            if not replied:
                location_unreplied += 1
                if days_remaining == 0:
                    location_due_today += 1
                if days_remaining < 0:
                    location_overdue += 1
                if nearest_days is None or days_remaining < nearest_days:
                    nearest_days = days_remaining
                    nearest_due = due_date.isoformat()
                item = review_record(client, review, created_date, due_date, days_remaining, reply_state)
                item["needs_warning"] = days_remaining <= warning_days
                unreplied.append(item)
            known_reviews[name] = {
                "first_seen": known_reviews.get(name, {}).get("first_seen") or today.isoformat(),
                "last_seen": today.isoformat(),
                "last_update_time": str(review.get("updateTime") or review.get("update_time") or ""),
                "replied": replied,
                "reply_state": reply_state,
            }
        summaries.append(
            {
                "client_name": client["client_name"],
                "brand_name": client["brand_name"],
                "location_display_name": client["location_display_name"],
                "owner": client["owner"],
                "alert_channel": client["alert_channel"],
                "average_rating": data.get("averageRating"),
                "total_review_count": data.get("totalReviewCount", len(reviews)),
                "fetched_count": len(reviews),
                "new_count": location_new,
                "unreplied_count": location_unreplied,
                "due_today_count": location_due_today,
                "overdue_count": location_overdue,
                "nearest_due": nearest_due or "",
                "nearest_due_label": due_label(nearest_days) if nearest_days is not None else "",
            }
        )

    new_reviews.sort(key=lambda item: (item["client_name"], item["created_date"]))
    unreplied.sort(key=lambda item: (item["days_remaining"], item["created_date"], item["client_name"]))
    return {
        "baseline_mode": suppress_new,
        "summaries": summaries,
        "new_reviews": new_reviews,
        "unreplied": unreplied,
        "errors": errors,
        "totals": {
            "locations": len(summaries),
            "new_reviews": len(new_reviews),
            "unreplied": len(unreplied),
            "due_today": sum(1 for item in unreplied if item["days_remaining"] == 0),
            "overdue": sum(1 for item in unreplied if item["days_remaining"] < 0),
            "warning": sum(1 for item in unreplied if item["needs_warning"]),
            "errors": len(errors),
        },
    }


def review_record(client: dict, review: dict, created_date: dt.date, due_date: dt.date, days_remaining: int, reply_state: str) -> dict:
    item = {
        "client_name": client["client_name"],
        "brand_name": client["brand_name"],
        "location_display_name": client["location_display_name"],
        "owner": client["owner"],
        "alert_channel": client["alert_channel"],
        "google_maps_url": client["google_maps_url"],
        "review_name": review_name(review),
        "review_id": review_id(review),
        "reviewer": reviewer_name(review),
        "star_rating": star_text(review),
        "comment": str(review.get("comment", "")).strip(),
        "created_date": created_date.isoformat(),
        "due_date": due_date.isoformat(),
        "days_remaining": days_remaining,
        "due_label": due_label(days_remaining),
        "reply_state": reply_state,
    }
    item["suggested_reply"] = suggested_reply(item)
    item["requires_approval"] = (
        "是" if star_number(item["star_rating"]) <= 2 or contains_risk_keyword(item["comment"]) else "否"
    )
    return item


def markdown_table(headers: list[str], rows: list[list[str]]) -> str:
    if not rows:
        return "目前沒有資料。"
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(str(cell).replace("\n", " ") for cell in row) + " |")
    return "\n".join(lines)


def build_report(result: dict, today: dt.date) -> str:
    totals = result["totals"]
    lines: list[str] = [
        f"# Google 評論每日追蹤｜{today.isoformat()}",
        "",
        "## 今日總覽",
        "",
        f"- 追蹤分店：{totals['locations']}",
        f"- 新增評論：{totals['new_reviews']}",
        f"- 未回覆評論：{totals['unreplied']}",
        f"- 今天到期：{totals['due_today']}",
        f"- 已逾期：{totals['overdue']}",
        f"- API 錯誤：{totals['errors']}",
    ]
    if result.get("baseline_mode"):
        lines.extend(["", "> 本次為首次基準建立，歷史評論不會列為今日新增。"])

    summary_rows = [
        [
            item["client_name"],
            item["location_display_name"],
            str(item["average_rating"] or "-"),
            str(item["total_review_count"] or "-"),
            str(item["new_count"]),
            str(item["unreplied_count"]),
            str(item["due_today_count"]),
            str(item["overdue_count"]),
            item["nearest_due_label"],
            item["owner"],
        ]
        for item in result["summaries"]
    ]
    lines.extend(
        [
            "",
            "## 分店摘要",
            "",
            markdown_table(
                ["客戶", "分店", "評分", "總評論", "新增", "未回覆", "今天到期", "逾期", "最急", "負責人"],
                summary_rows,
            ),
        ]
    )

    urgent = [item for item in result["unreplied"] if item["needs_warning"]]
    urgent_rows = [
        [
            item["client_name"],
            item["location_display_name"],
            f"{item['star_rating']} 星",
            item["reviewer"],
            item["created_date"],
            item["due_date"],
            item["due_label"],
            short_text(item["comment"]),
        ]
        for item in urgent
    ]
    lines.extend(
        [
            "",
            "## 今日需處理",
            "",
            markdown_table(["客戶", "分店", "星等", "評論者", "建立日", "到期日", "倒數", "摘要"], urgent_rows),
        ]
    )

    new_rows = [
        [
            item["client_name"],
            item["location_display_name"],
            f"{item['star_rating']} 星",
            item["reviewer"],
            item["created_date"],
            item["due_date"],
            short_text(item["comment"]),
        ]
        for item in result["new_reviews"]
    ]
    lines.extend(
        [
            "",
            "## 新增評論",
            "",
            markdown_table(["客戶", "分店", "星等", "評論者", "建立日", "到期日", "摘要"], new_rows),
        ]
    )

    unreplied_rows = [
        [
            item["client_name"],
            item["location_display_name"],
            f"{item['star_rating']} 星",
            item["reviewer"],
            item["due_date"],
            item["due_label"],
            item["owner"],
            short_text(item["comment"]),
        ]
        for item in result["unreplied"]
    ]
    lines.extend(
        [
            "",
            "## 未回覆明細",
            "",
            markdown_table(["客戶", "分店", "星等", "評論者", "到期日", "倒數", "負責人", "摘要"], unreplied_rows),
        ]
    )

    reply_targets: list[dict] = []
    seen_reviews: set[str] = set()
    for item in result["new_reviews"] + result["unreplied"]:
        key = item["review_name"]
        if key in seen_reviews:
            continue
        seen_reviews.add(key)
        reply_targets.append(item)
    reply_rows = [
        [
            item["client_name"],
            item["reviewer"],
            f"{item['star_rating']} 星",
            item["requires_approval"],
            short_text(item["comment"], 70),
            item["suggested_reply"],
        ]
        for item in reply_targets
    ]
    lines.extend(
        [
            "",
            "## 建議回覆草稿",
            "",
            markdown_table(["客戶", "評論者", "星等", "需確認", "評論摘要", "建議回覆"], reply_rows),
        ]
    )

    if result["errors"]:
        error_rows = [
            [item["client"]["client_name"], item["client"]["location_display_name"], short_text(item["error"], 140)]
            for item in result["errors"]
        ]
        lines.extend(["", "## API 異常", "", markdown_table(["客戶", "分店", "錯誤"], error_rows)])

    lines.extend(
        [
            "",
            "## 下一步",
            "",
            "- [ ] 負責人確認今日需處理評論。",
            "- [ ] 檢查建議回覆草稿，必要時使用 Google 評論回覆追蹤 Prompt 改寫。",
            "- [ ] 負評、爭議、醫療、法律或高風險評論先給提姆先生或客戶確認。",
            "- [ ] 回覆完成後，明日追蹤應自動從未回覆清單移除。",
        ]
    )
    return "\n".join(lines).rstrip() + "\n"


def discord_message(result: dict, today: dt.date, report_path: Path, urgent_only: bool = False) -> str:
    totals = result["totals"]
    title = f"Google 評論每日追蹤｜{today.isoformat()}"
    if urgent_only:
        title = f"Google 評論到期提醒｜{today.isoformat()}"
    summary = (
        f"追蹤 {totals['locations']} 間分店｜新增 {totals['new_reviews']}｜"
        f"未回覆 {totals['unreplied']}｜今天到期 {totals['due_today']}｜逾期 {totals['overdue']}"
    )
    targets = [item for item in result["unreplied"] if item["needs_warning"]] if urgent_only else result["unreplied"]
    lines = [title, summary]
    if result.get("baseline_mode"):
        lines.append("首次基準建立：歷史評論已記錄，不列為今日新增。")
    if targets:
        lines.append("")
        lines.append("最需要處理：")
        for item in targets[:8]:
            lines.append(
                f"- {item['client_name']} / {item['location_display_name']}："
                f"{item['star_rating']}星，{item['due_label']}，{short_text(item['comment'], 45)}"
            )
        if len(targets) > 8:
            lines.append(f"- 另有 {len(targets) - 8} 則請看報表")
    elif not urgent_only:
        lines.append("今天沒有需要立即處理的評論。")
    lines.append("")
    lines.append(f"報表：{report_path.name}")
    message = "\n".join(lines)
    return message[:1900]


def webhook_for(root_config: dict, channel: str) -> str:
    webhooks = root_config.get("discord_webhooks", {})
    if isinstance(webhooks, dict):
        url = str(webhooks.get(channel, "")).strip()
        if url and not url.startswith("貼上"):
            return url
    if channel == "daily_handoff":
        return str(root_config.get("discord_webhook_url", "")).strip()
    return ""


def send_discord(root_config: dict, channel: str, message: str) -> bool:
    webhook_url = webhook_for(root_config, channel)
    if not webhook_url:
        return False
    payload = {
        "content": message,
        "username": str(root_config.get("discord_username", "阿順｜Ewalk.ai")),
    }
    avatar_url = str(root_config.get("discord_avatar_url", "")).strip()
    if avatar_url:
        payload["avatar_url"] = avatar_url
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        webhook_url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "Ewalk.ai-Automation/1.0"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return 200 <= res.status < 300
    except Exception:
        return False


def discover_locations(token: str, output_path: Optional[Path]) -> int:
    rows: list[dict] = []
    account_token = ""
    while True:
        params = {"pageSize": "20"}
        if account_token:
            params["pageToken"] = account_token
        accounts_data = http_json(
            "https://mybusinessaccountmanagement.googleapis.com/v1/accounts?"
            + urllib.parse.urlencode(params),
            token,
        )
        for account in accounts_data.get("accounts", []):
            account_name = str(account.get("name", "")).strip()
            account_id = account_name.split("/")[-1]
            loc_token = ""
            while True:
                loc_params = {
                    "pageSize": "100",
                    "readMask": "name,title,storeCode,metadata",
                }
                if loc_token:
                    loc_params["pageToken"] = loc_token
                loc_data = http_json(
                    f"https://mybusinessbusinessinformation.googleapis.com/v1/{account_name}/locations?"
                    + urllib.parse.urlencode(loc_params),
                    token,
                )
                for loc in loc_data.get("locations", []):
                    location_name = str(loc.get("name", "")).strip()
                    rows.append(
                        {
                            "active": "FALSE",
                            "client_name": "",
                            "brand_name": str(loc.get("title", "")).strip(),
                            "account_id": account_id,
                            "location_id": location_name.split("/")[-1],
                            "location_display_name": str(loc.get("title", "")).strip(),
                            "google_maps_url": "",
                            "owner": "",
                            "sla_days": "",
                            "alert_channel": "customer_tasks",
                            "notes": f"account={account.get('accountName', account_name)} storeCode={loc.get('storeCode', '')}",
                        }
                    )
                loc_token = str(loc_data.get("nextPageToken", "")).strip()
                if not loc_token:
                    break
        account_token = str(accounts_data.get("nextPageToken", "")).strip()
        if not account_token:
            break

    fieldnames = [
        "active",
        "client_name",
        "brand_name",
        "account_id",
        "location_id",
        "location_display_name",
        "google_maps_url",
        "owner",
        "sla_days",
        "alert_channel",
        "notes",
    ]
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        fh = output_path.open("w", encoding="utf-8", newline="")
        close = True
    else:
        fh = sys.stdout
        close = False
    try:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    finally:
        if close:
            fh.close()
    print(f"已匯出 {len(rows)} 筆可見分店。", file=sys.stderr)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=os.environ.get("ASHUN_CONFIG_PATH", str(DEFAULT_CONFIG_PATH)))
    parser.add_argument("--date", help="指定今天日期，格式 YYYY-MM-DD。預設使用 Asia/Taipei 今日。")
    parser.add_argument("--clients-file")
    parser.add_argument("--state-file")
    parser.add_argument("--report-dir")
    parser.add_argument("--mock-reviews-json")
    parser.add_argument("--dry-run", action="store_true", help="不寫入 state，不送 Discord。")
    parser.add_argument("--send", action="store_true", help="送出 Discord 通知。")
    parser.add_argument("--discover-locations", action="store_true", help="列出授權帳號可讀取的 Google 商家分店。")
    parser.add_argument("--discover-output", help="搭配 --discover-locations 輸出 CSV。")
    args = parser.parse_args()

    config_path = Path(args.config).expanduser().resolve()
    config = load_config(config_path)
    tracker = config["tracker"]
    timezone = ZoneInfo(str(config_value(config, "timezone", "Asia/Taipei")))
    today = dt.date.fromisoformat(args.date) if args.date else dt.datetime.now(timezone).date()

    if args.discover_locations:
        token = get_access_token(config)
        output_path = Path(args.discover_output).expanduser().resolve() if args.discover_output else None
        return discover_locations(token, output_path)

    if not args.mock_reviews_json and not as_bool(config_value(config, "enabled", False), False):
        print("Google 評論追蹤尚未啟用；請在 config.local.json 將 google_review_tracker.enabled 設為 true。")
        return 0

    default_sla_days = as_int(config_value(config, "default_sla_days", 2), 2)
    warning_days = as_int(config_value(config, "warning_days_remaining", 1), 1)
    default_channel = str(config_value(config, "default_alert_channel", "customer_tasks"))
    max_pages = as_int(config_value(config, "max_review_pages", 0), 0)
    delay_seconds = as_float(config_value(config, "request_delay_seconds", 0.15), 0.15)
    baseline_first_run = as_bool(config_value(config, "baseline_first_run", True), True)
    summary_channel = str(config_value(config, "summary_channel", default_channel))
    urgent_channel = str(config_value(config, "urgent_channel", "important"))

    clients_file = resolve_path(
        args.clients_file or config_value(config, "clients_file"),
        AUTOMATION_DIR.parent / "Google評論每日追蹤系統" / "clients.csv",
    )
    state_file = resolve_path(
        args.state_file or config_value(config, "state_file"),
        DEFAULT_OUTPUT_DIR / "google-review-tracker-state.json",
    )
    report_dir = resolve_path(
        args.report_dir or config_value(config, "report_dir"),
        BASE_DIR / "04_報表" / "Google評論追蹤",
    )
    clients = read_clients(clients_file, default_sla_days, default_channel)
    state = read_json(state_file, {"known_reviews": {}})
    state.setdefault("known_reviews", {})

    mock = load_mock_reviews(Path(args.mock_reviews_json).expanduser().resolve()) if args.mock_reviews_json else None
    token = "" if mock is not None or not clients else get_access_token(config)
    fetched: dict[str, dict] = {}
    for client in clients:
        parent = review_parent(client)
        try:
            fetched[parent] = (
                fetch_reviews_from_mock(client, mock)
                if mock is not None
                else fetch_reviews(client, token, max_pages=max_pages, delay_seconds=delay_seconds)
            )
        except Exception as exc:
            fetched[parent] = {"error": str(exc), "reviews": []}

    result = analyze_reviews(
        clients=clients,
        fetched=fetched,
        state=state,
        today=today,
        timezone=timezone,
        default_sla_days=default_sla_days,
        warning_days=warning_days,
        baseline_first_run=baseline_first_run,
    )
    state["last_run"] = dt.datetime.now(timezone).isoformat(timespec="seconds")
    state["last_report_date"] = today.isoformat()

    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / f"{today.isoformat()}.md"
    json_report_path = report_dir / f"{today.isoformat()}.json"
    report_md = build_report(result, today)
    report_path.write_text(report_md, encoding="utf-8")
    write_json(
        json_report_path,
        {
            "date": today.isoformat(),
            "clients_file": str(clients_file),
            "baseline_mode": result["baseline_mode"],
            "totals": result["totals"],
            "summaries": result["summaries"],
            "new_reviews": result["new_reviews"],
            "unreplied": result["unreplied"],
            "errors": [
                {
                    "client_name": item["client"]["client_name"],
                    "location_display_name": item["client"]["location_display_name"],
                    "error": item["error"],
                }
                for item in result["errors"]
            ],
        },
    )
    if not args.dry_run:
        write_json(state_file, state)

    discord_sent = False
    urgent_sent = False
    if args.send and not args.dry_run:
        discord_sent = send_discord(config["root"], summary_channel, discord_message(result, today, report_path))
        if result["totals"]["due_today"] or result["totals"]["overdue"]:
            urgent_sent = send_discord(
                config["root"],
                urgent_channel,
                discord_message(result, today, report_path, urgent_only=True),
            )

    totals = result["totals"]
    print(
        f"Google 評論追蹤完成：分店 {totals['locations']}，新增 {totals['new_reviews']}，"
        f"未回覆 {totals['unreplied']}，今天到期 {totals['due_today']}，逾期 {totals['overdue']}。"
    )
    print(f"報表：{report_path}")
    if args.send and not args.dry_run:
        print(f"Discord 摘要：{'已送出' if discord_sent else '未送出'}")
        if totals["due_today"] or totals["overdue"]:
            print(f"Discord 急件：{'已送出' if urgent_sent else '未送出'}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ConfigError as exc:
        print(f"設定錯誤：{exc}", file=sys.stderr)
        sys.exit(2)
