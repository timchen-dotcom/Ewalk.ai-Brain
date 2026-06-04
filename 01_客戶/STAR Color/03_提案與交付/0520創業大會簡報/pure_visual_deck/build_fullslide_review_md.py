from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PROMPTS = ROOT / "gpt_image2_fullslide_prompts.json"

ROLE_LABELS = {
    "cover": "封面",
    "content": "內容頁",
    "system": "系統頁",
    "process": "流程頁",
    "finance": "財務頁",
    "finance-franchise": "財務加盟",
    "action": "行動頁",
    "machine-vendor": "機器廠商出場",
    "ad-performance": "廣告投手數據",
    "marketing-bridge": "行銷銜接頁",
    "chairman-policy": "理事長政策經費",
}


def role_label(role: str) -> str:
    return ROLE_LABELS.get(role, role or "未分類")


def md_list(items: list[str]) -> str:
    if not items:
        return "- （無）"
    return "\n".join(f"- {item}" for item in items)


def page_title(page: dict) -> str:
    headline = page.get("headline", "").replace("\n", "<br>")
    return f"Page {int(page['page']):02d}｜{headline}"


def main() -> int:
    spec = json.loads(PROMPTS.read_text(encoding="utf-8"))
    pages = spec["pages"]
    out = ROOT.parent / f"STAR_Color_0520加盟簡報0511_完整{len(pages)}頁_生成前查閱.md"
    lines: list[str] = []

    lines.extend(
        [
            f"# STAR Color 0520 加盟簡報 0511｜完整 {len(pages)} 頁生成前查閱稿",
            "",
            "用途：生成 GPT Image 2 整頁烘字版之前，供提姆快速查閱每頁內容、順序、講者、可見文字與視覺方向。",
            "",
            f"- 來源 prompt：`{PROMPTS}`",
            f"- 模型：`{spec.get('model', '')}`",
            f"- 規格：`{spec.get('size', '')}` / `{spec.get('quality', '')}`",
            f"- 頁數：`{len(pages)}`",
            "- 狀態：尚未生成圖片，僅供生成前審稿。",
            "",
            "## 本版調整",
            "",
            "- 第 1–8 頁：幻色鏡方執行長 Kenny。",
            "- 第 9 頁：Kenny 交棒至 Akemi 的轉場頁。",
            "- 第 10–20 頁：雙師 Akemi。",
            "- 舊版第 21–30 頁已移到新版第 27–36 頁，放在新版第 37 頁前，定位為財務加盟段落，由業務部經理講。",
            "- 第 37–40 頁：展店分潤、手牽手地圖、適合對象與加盟流程，延續由業務部經理講。",
            "- 第 41–44 頁：許文元理事長，補充政策、認證、經費來源與行動提醒。",
            "- 講者標註為後台審稿資訊，不會要求 GPT Image 2 印在頁面上。",
            "",
            "## 插入段落位置",
            "",
            "- 第 10–12 頁：機器廠商上台 / AI 染髮機出場，插在原稿 Slide 8 後、Slide 9 前。",
            "- 第 21–23 頁：廣告投手專家 / 投放數據段落，插在原稿 Slide 24 後、Slide 25 前。",
            "- 第 27–36 頁：財務加盟段落，由舊版第 21–30 頁移入，接在行銷大腦段落後、展店分潤段落前。",
            "- 第 41–44 頁：許文元理事長 / 政策經費段落，插在加盟流程後、現場行動結尾前。",
            "",
            "## 頁面總覽",
            "",
            "| 頁碼 | 來源 | 講者 | 角色 | 主標 |",
            "|---:|---|---|---|---|",
        ]
    )

    for page in pages:
        lines.append(
            "| {page} | {source} | {presenter} | {role} | {headline} |".format(
                page=int(page["page"]),
                source=page.get("source_slide", ""),
                presenter=page.get("presenter", "待確認"),
                role=role_label(page.get("role", "")),
                headline=page.get("headline", "").replace("\n", "<br>"),
            )
        )

    lines.extend(["", "---", "", "## 逐頁查閱", ""])

    for page in pages:
        lines.extend(
            [
                f"## {page_title(page)}",
                "",
                f"- 來源：`{page.get('source_slide', '')}`",
                f"- 講者：{page.get('presenter', '待確認')}",
                f"- 角色：{role_label(page.get('role', ''))}",
                f"- 輔助說明：{page.get('supporting_text', '')}",
                "",
                "### 可見文字",
                "",
                md_list(page.get("must_include_text", [])),
                "",
                "### 視覺方向",
                "",
                page.get("visual_scene", ""),
                "",
                "### 圖表 / 結構",
                "",
                page.get("chart_or_structure", ""),
                "",
                "---",
                "",
            ]
        )

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")
    print(f"Pages: {len(pages)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
