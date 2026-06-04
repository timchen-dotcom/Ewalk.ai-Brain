# 2026-06-04 個人 Skills Description 壓縮提案

狀態：提案，尚未套用到 `~/.codex/skills`  
目的：降低個人 skills 的 prompt budget 壓力，同時避免 skill 觸發失效。

## 本次原則

- 只處理 Ewalk.ai / 個人維護 skills，不碰 system skills 與 plugin cache。
- 只壓縮 frontmatter `description`，不刪正文、不刪流程、不刪回歸資料。
- 保留使用者會說的觸發詞，例如 `/自我升級`、`製作簡報`、`HTML 簡報`、`PDF`、`Playwright`、`SOIL`。
- description 只做路由；完整操作步驟留在 `SKILL.md` 正文。
- 先產提案與回歸句，確認後再由可寫入 runtime skills 的環境套用。

## 壓縮候選

### 1. self-upgrade

- 檔案：`/Users/chenjinting/.codex/skills/self-upgrade/SKILL.md`
- 目前長度：約 411 字元
- 風險：中。這是高頻入口，必須保留中文觸發詞與「不直接改全域規則」邊界。
- 建議 description：

```yaml
description: "Use for Ewalk.ai / 阿順 self-upgrade when user says /自我升級, 自我升級, 自我進化, 學習一下, 吸收這份資料, or provides sources to distill into Vault notes, SOPs, Prompts, Skills, templates, automations, or system-rule proposals; confirm before global/runtime changes."
```

### 2. make-presentation

- 檔案：`/Users/chenjinting/.codex/skills/make-presentation/SKILL.md`
- 目前長度：約 364 字元
- 風險：中。必須保留 `/製作簡報` 與常見中文口語。
- 建議 description：

```yaml
description: "Route /製作簡報, 製作簡報, 幫我做簡報, 把資料變成簡報, or source-to-slides requests; choose SOIL editable PPTX, full-image PPTX, or interactive HTML deck from notes, transcripts, links, outlines, reports, lessons, or marketing material."
```

### 3. soil-image-deck

- 檔案：`/Users/chenjinting/.codex/skills/soil-image-deck/SKILL.md`
- 目前長度：約 440 字元
- 風險：低。正文已有完整 output modes，description 可短。
- 建議 description：

```yaml
description: >
  Create SOIL-style full-image PPTX decks for pure image, all-image, poster-like,
  livestream opening, social sharing, or low-edit decks; supports baked, plate,
  and baked-fullslide modes.
```

### 4. soil-teaching-deck

- 檔案：`/Users/chenjinting/.codex/skills/soil-teaching-deck/SKILL.md`
- 目前長度：約 426 字元
- 風險：低。保留 teaching slides / classroom / SOIL / editable PPTX 即可。
- 建議 description：

```yaml
description: >
  Create, improve, or review SOIL teaching/classroom PowerPoint decks from lesson
  materials; output editable PPTX with teaching flow, cognitive-load checks,
  optional AI illustrations, and geometry diagrams.
```

### 5. soil-html-deck

- 檔案：`/Users/chenjinting/.codex/skills/soil-html-deck/SKILL.md`
- 目前長度：約 394 字元
- 風險：低。保留 HTML / web / interactive / Reveal.js / Chart.js / PowerPoint contrast。
- 建議 description：

```yaml
description: >
  Create SOIL-style portable HTML/web/interactive/Reveal.js slides, livestream
  decks, Chart.js or clickable-table slides, and shareable decks beyond
  PowerPoint; output standalone HTML with inline CSS/JS and embedded images.
```

### 6. html-slide-builder

- 檔案：`/Users/chenjinting/.codex/skills/claude-html-slide-builder/SKILL.md`
- 目前長度：很長，且為中文多段 block
- 風險：中。這份有很多中文觸發語與 Reveal.js / GitHub Pages / Firebase / 互動元件，需要保留。
- 建議 description：

```yaml
description: >
  將教材、課綱、PDF、講義或口述主題轉成 Reveal.js HTML 互動簡報並可部署 GitHub Pages；當使用者說「幫我做 HTML 簡報」「把教材轉成互動簡報」「做 Reveal.js 簡報」「做成投影片」時使用，支援 AI 背景、圖標、Firebase 互動與視覺化演示。
```

### 7. pdf

- 檔案：`/Users/chenjinting/.codex/skills/pdf/SKILL.md`
- 目前長度：約 250 字元
- 風險：低。
- 建議 description：

```yaml
description: "Use for reading, creating, or reviewing PDFs when layout/rendering matters; render pages for visual checks and use pdfplumber, pypdf, or reportlab for extraction or generation."
```

### 8. playwright

- 檔案：`/Users/chenjinting/.codex/skills/playwright/SKILL.md`
- 目前長度：約 211 字元
- 風險：低。
- 建議 description：

```yaml
description: "Use Playwright from terminal for real-browser navigation, forms, screenshots, snapshots, data extraction, and UI-flow debugging via playwright-cli or bundled wrapper."
```

## 暫不處理

- `~/.codex/skills/.system/**`：system skills，不碰。
- `~/.codex/plugins/cache/**`：plugin cache，不碰。
- 任何需要刪除、停用、搬移的 skill：不在本輪處理。

## 回歸測試句

套用前後各測一次，確認仍會觸發正確 skill：

- `自我升級這篇文章，看看能不能沉澱成 SOP`
- `/自我升級 https://example.com/article`
- `製作簡報，把這份課綱變成教學投影片`
- `幫我做 HTML 簡報，要 Reveal.js`
- `做一份 SOIL image deck，適合直播開場`
- `請讀這份 PDF，檢查版面和文字`
- `用 Playwright 打開 localhost 測試登入流程`

## 建議套用順序

1. 先套 `pdf`、`playwright`，風險最低。
2. 再套 `soil-image-deck`、`soil-teaching-deck`、`soil-html-deck`。
3. 最後才套 `self-upgrade`、`make-presentation`、`html-slide-builder`。

## 驗收標準

- 回歸測試句仍能叫到正確 skill。
- 壓縮後 description 仍保留主要中文觸發詞。
- 不能出現兩個 skill description 過度相似，造成簡報相關路由混淆。
- 若任一高頻 skill 觸發變差，立即回退該 skill 的 description。
