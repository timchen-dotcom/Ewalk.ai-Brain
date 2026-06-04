#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import socket
import smtplib
import subprocess
import sys
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path


AUTOMATION_DIR = Path(__file__).resolve().parents[1]
DEFAULT_BASE_DIR = AUTOMATION_DIR.parents[1]
DEFAULT_CONFIG_PATH = AUTOMATION_DIR / "config.local.json"
DEFAULT_OUTPUT_DIR = AUTOMATION_DIR / "output" / "aesthetic-trends-email"
TREND_DIR = Path("10_市場洞察/美感趨勢週報")
DAILY_DIR = TREND_DIR / "每日收集"
WEEKLY_DIR = TREND_DIR / "週報"

DEFAULT_FROM = "Tim.chen@ewalk.ai"
DEFAULT_TO = ["Han.chang@ewalk.ai"]


def read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def email_config(config: dict) -> dict:
    email = config.get("email_notifications", {})
    if not isinstance(email, dict):
        email = {}
    trends = email.get("aesthetic_trends", {})
    if not isinstance(trends, dict):
        trends = {}
    return {
        "enabled": trends.get("enabled", True),
        "method": str(trends.get("method", "smtp")).strip(),
        "from": str(trends.get("from", DEFAULT_FROM)).strip() or DEFAULT_FROM,
        "to": trends.get("to", DEFAULT_TO),
        "smtp_host": str(trends.get("smtp_host", "smtp.gmail.com")).strip(),
        "smtp_port": int(trends.get("smtp_port", 587)),
        "smtp_username": str(trends.get("smtp_username", trends.get("from", DEFAULT_FROM))).strip(),
        "smtp_password_env": str(trends.get("smtp_password_env", "EWALK_GMAIL_APP_PASSWORD")).strip(),
        "smtp_keychain_service": str(trends.get("smtp_keychain_service", "ewalk-gmail-smtp")).strip(),
    }


def normalize_recipients(value: object) -> list[str]:
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return DEFAULT_TO


def md_files(root: Path) -> list[Path]:
    if not root.exists():
        return []
    return sorted(path for path in root.glob("*.md") if path.is_file())


def file_digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def newest_daily_file(base_dir: Path) -> Path | None:
    files = md_files(base_dir / DAILY_DIR)
    if not files:
        return None
    return max(files, key=lambda path: (path.name[:10], path.stat().st_mtime))


def read_note(path: Path, base_dir: Path) -> str:
    rel = path.relative_to(base_dir)
    return f"\n\n---\n\n## {rel}\n\n{path.read_text(encoding='utf-8').strip()}\n"


def build_backfill(base_dir: Path) -> tuple[str, str, list[Path], str]:
    daily_files = md_files(base_dir / DAILY_DIR)
    weekly_files = md_files(base_dir / WEEKLY_DIR)
    files = daily_files + weekly_files
    today = datetime.now().strftime("%Y-%m-%d")
    subject = f"Ewalk.ai 美感趨勢資料總包（{today}）"
    intro = [
        "Han，這封信是目前 Ewalk.ai 已整理的美感趨勢資料總包。",
        "",
        f"- 每日收集：{len(daily_files)} 份",
        f"- 週報：{len(weekly_files)} 份",
        "",
        "用途：之後做社群內容、Reels 題材、客戶提案、素材方向時，先從這批趨勢資料找切角。",
        "",
        "提醒：這些資料只保存標題、來源、連結、摘要與趨勢判讀，不保存媒體全文。",
    ]
    body = "\n".join(intro)
    for path in files:
        body += read_note(path, base_dir)
    return subject, body, files, "backfill"


def build_latest(base_dir: Path) -> tuple[str, str, list[Path], str]:
    latest = newest_daily_file(base_dir)
    if latest is None:
        raise FileNotFoundError(f"找不到每日收集檔：{base_dir / DAILY_DIR}")
    date_label = latest.name[:10]
    subject = f"Ewalk.ai 美感趨勢每日更新（{date_label}）"
    intro = [
        "Han，今天的美感趨勢每日更新如下。",
        "",
        "用途：請先看「今日收集摘要」與「初步趨勢觀察」，可直接轉成內容企劃、Reels 題材或客戶提案素材。",
        "",
        f"完整 Obsidian 檔案：{latest.relative_to(base_dir)}",
    ]
    body = "\n".join(intro) + read_note(latest, base_dir)
    return subject, body, [latest], "latest"


def write_bundle(output_dir: Path, body: str, tag: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = output_dir / f"{stamp}-{tag}.md"
    path.write_text(body, encoding="utf-8")
    return path


def add_attachments(msg: EmailMessage, attachments: list[Path]) -> None:
    for path in attachments:
        msg.add_attachment(
            path.read_bytes(),
            maintype="text",
            subtype="markdown",
            filename=path.name,
        )


def write_eml(
    output_dir: Path,
    sender: str,
    recipients: list[str],
    subject: str,
    body: str,
    tag: str,
    attachments: list[Path],
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    msg = EmailMessage()
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = subject
    msg.set_content(body)
    add_attachments(msg, attachments)
    path = output_dir / f"{stamp}-{tag}.eml"
    path.write_bytes(bytes(msg))
    return path


def keychain_password(service: str, account: str) -> str:
    if not service:
        return ""
    commands = [
        ["/usr/bin/security", "find-generic-password", "-w", "-s", service, "-a", account],
        [
            "/usr/bin/security",
            "find-generic-password",
            "-w",
            "-s",
            service,
            "-a",
            account,
            str(Path.home() / "Library/Keychains/login.keychain-db"),
        ],
    ]
    for command in commands:
        result = subprocess.run(
            command,
            text=True,
            capture_output=True,
            check=False,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    return ""


def smtp_password(cfg: dict) -> str:
    password_env = cfg["smtp_password_env"]
    password = os.environ.get(password_env, "")
    if password:
        return "".join(password.split())
    password = keychain_password(cfg["smtp_keychain_service"], cfg["smtp_username"])
    if password:
        return "".join(password.split())
    raise RuntimeError(
        f"SMTP 密碼未設定。請設定環境變數 {password_env}，或把 Gmail app password 存進 Keychain service={cfg['smtp_keychain_service']} account={cfg['smtp_username']}。"
    )


def classify_send_error(exc: Exception) -> str:
    if isinstance(exc, socket.gaierror):
        return "DNS / 網路不可用：目前無法解析 SMTP 主機名稱，請確認本機網路、VPN 或 DNS。"
    if isinstance(exc, TimeoutError):
        return "SMTP 連線逾時：目前無法在時限內連到郵件伺服器。"
    if isinstance(exc, OSError) and getattr(exc, "errno", None) in {8, 60, 61, 64, 65}:
        return f"SMTP 網路錯誤：{exc}"
    return f"{type(exc).__name__}: {exc}"


def send_smtp(cfg: dict, recipients: list[str], subject: str, body: str, attachments: list[Path]) -> None:
    password = smtp_password(cfg)

    msg = EmailMessage()
    msg["From"] = cfg["from"]
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = subject
    msg.set_content(body)
    add_attachments(msg, attachments)

    try:
        with smtplib.SMTP(cfg["smtp_host"], cfg["smtp_port"], timeout=30) as smtp:
            smtp.starttls()
            smtp.login(cfg["smtp_username"], password)
            smtp.send_message(msg)
    except smtplib.SMTPAuthenticationError as exc:
        if exc.smtp_code == 534:
            raise RuntimeError(
                "Gmail SMTP 拒絕登入：請確認 Keychain 內存的是 Gmail app password，不是一般登入密碼；若 app password 顯示含空格，腳本會自動移除空格。"
            ) from exc
        raise


def applescript_quote(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def send_apple_mail(cfg: dict, recipients: list[str], subject: str, body: str, attachments: list[Path]) -> None:
    recipient_lines = "\n".join(
        f'make new to recipient at end of to recipients with properties {{address:"{applescript_quote(recipient)}"}}'
        for recipient in recipients
    )
    attachment_lines = "\n".join(
        f'make new attachment with properties {{file name:(POSIX file "{applescript_quote(str(path))}")}} at after last paragraph'
        for path in attachments
    )
    script = f'''
with timeout of 600 seconds
set senderAddress to "{applescript_quote(cfg["from"])}"
set theSubject to "{applescript_quote(subject)}"
set theContent to "{applescript_quote(body)}"
tell application "Mail"
  set newMessage to make new outgoing message with properties {{subject:theSubject, content:theContent, visible:false}}
  tell newMessage
    set sender to senderAddress
    {recipient_lines}
    {attachment_lines}
    send
  end tell
end tell
end timeout
'''
    subprocess.run(["/usr/bin/osascript", "-e", script], check=True)


def send_message(method: str, cfg: dict, recipients: list[str], subject: str, body: str, attachments: list[Path]) -> None:
    if method == "smtp":
        send_smtp(cfg, recipients, subject, body, attachments)
        return
    if method == "apple_mail":
        send_apple_mail(cfg, recipients, subject, body, attachments)
        return
    if method in {"dry_run", "none", ""}:
        return
    raise ValueError(f"未知 Email 發送方式：{method}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["latest", "backfill"], default="latest")
    parser.add_argument("--send", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--base-dir", default=os.environ.get("ASHUN_BASE_DIR", str(DEFAULT_BASE_DIR)))
    parser.add_argument("--config", default=os.environ.get("ASHUN_CONFIG_PATH", str(DEFAULT_CONFIG_PATH)))
    parser.add_argument("--output-dir", default=os.environ.get("ASHUN_OUTPUT_DIR", str(DEFAULT_OUTPUT_DIR)))
    args = parser.parse_args()

    base_dir = Path(args.base_dir)
    output_dir = Path(args.output_dir)
    config = read_json(Path(args.config))
    cfg = email_config(config)
    recipients = normalize_recipients(cfg["to"])
    state_path = output_dir / "aesthetic-trends-email-state.json"
    state = read_json(state_path)

    if not cfg["enabled"]:
        print("美感趨勢 Email 通知已停用。")
        return 0

    if args.mode == "backfill":
        subject, body, files, tag = build_backfill(base_dir)
    else:
        subject, body, files, tag = build_latest(base_dir)

    digest = hashlib.sha256("\n".join(file_digest(path) for path in files).encode("utf-8")).hexdigest()
    state_key = f"{args.mode}_digest"
    if args.mode == "latest" and not args.force and state.get(state_key) == digest:
        print("最新美感趨勢每日收集已寄送過，略過。")
        return 0

    state[f"{args.mode}_last_attempt_at"] = datetime.now().isoformat(timespec="seconds")
    state[f"{args.mode}_last_recipients"] = recipients
    state[f"{args.mode}_last_subject"] = subject
    state[f"{args.mode}_last_status"] = "prepared"
    state.pop(f"{args.mode}_last_error", None)
    write_json(state_path, state)

    attachments: list[Path] = []
    send_body = body
    if args.mode == "backfill":
        bundle_path = write_bundle(output_dir, body, tag)
        attachments.append(bundle_path)
        send_body = "\n".join(
            [
                "Han，這封信是目前 Ewalk.ai 已整理的美感趨勢資料總包。",
                "",
                "完整資料已整理成 Markdown 附件，內容包含目前所有每日收集與週報。",
                "",
                "用途：之後做社群內容、Reels 題材、客戶提案、素材方向時，先從這批趨勢資料找切角。",
                "",
                "提醒：這些資料只保存標題、來源、連結、摘要與趨勢判讀，不保存媒體全文。",
            ]
        )

    eml_path = write_eml(output_dir, cfg["from"], recipients, subject, send_body, tag, attachments)
    print(f"已產生 Email 備份：{eml_path}")

    should_send = args.send and not args.dry_run
    sent_successfully = False
    if should_send:
        try:
            send_message(cfg["method"], cfg, recipients, subject, send_body, attachments)
        except Exception as exc:
            state[f"{args.mode}_last_status"] = "failed"
            state[f"{args.mode}_last_error"] = classify_send_error(exc)
            write_json(state_path, state)
            raise
        if cfg["method"] in {"dry_run", "none", ""}:
            print("目前發送方式為 dry_run，未實際寄出。")
            state[f"{args.mode}_last_status"] = "dry_run"
        else:
            print(f"美感趨勢 Email 已送出：{', '.join(recipients)}")
            sent_successfully = True
            state[f"{args.mode}_last_status"] = "sent"
    else:
        print("dry-run 模式，未實際寄出。")
        state[f"{args.mode}_last_status"] = "dry_run"

    if sent_successfully:
        state[state_key] = digest
        state[f"{args.mode}_last_run_at"] = datetime.now().isoformat(timespec="seconds")
        state[f"{args.mode}_last_eml"] = str(eml_path)
    write_json(state_path, state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
