# Open Design 產物工作流試點 SOP

## 目的

用「可版本控、可複製」的方式產出設計交付物（提案簡報 / Landing page / 廣告視覺版型），降低每次都重新提示、重做版型的成本。

本 SOP 僅做「試點」：產出 2 份可交付產物，驗證值不值得正式導入 Ewalk.ai 工作流。

## 適用時機

- 需要快速做「客戶提案 PPTX / PDF」的第一版骨架
- 需要量產「同風格」的 Landing page / DM / 視覺版型（先求一致，再求精修）
- 想把設計輸出變成可重跑、可迭代、可 review 的流程（而不是單次手工）

## 不適用 / 風險

- 需要高度精修的品牌主視覺（仍建議設計師收尾）
- 不可把客戶機密資料直接丟進任何外部模型或未授權的 API（BYOK/本機代理也要遵守資料規範）

## 來源

- Open Design repo：https://github.com/nexu-io/open-design
- Quickstart：https://github.com/nexu-io/open-design/blob/main/QUICKSTART.md

## 試點目標（本次一定要交付）

1. 產出 1 份「客戶提案」簡報（PPTX 或可轉 PPTX 的 HTML deck）
2. 產出 1 組「廣告視覺版型」：至少 3 種尺寸/版型（例如 1080x1080、1080x1920、1200x628）

> 驗收標準：可以拿去給提姆/PM/客戶看「方向 + 結構」，並且能在同流程下快速改 2 版。

## 環境需求（照抄 Quickstart）

- Node.js：24.x
- pnpm：10.33.2（用 Corepack 讓 repo 自動鎖版本）
- OS：macOS / Linux / WSL2

## 執行步驟（最小可行）

### 1) 下載與啟動

1. `git clone` 專案到本機（建議放在工作資料夾，不要放 Vault 內）
2. 依 Quickstart：
   - `corepack enable`
   - `pnpm install`
   - `pnpm tools-dev run web`（前景啟動 daemon + web）

### 2) 設定「Agent / 模型」模式

Open Design 支援兩種路線：

- 本機代理 CLI：Codex / Claude Code / Gemini CLI…（Open Design 會自動偵測）
- BYOK API：在 Settings 指定 API Key（需遵守 Ewalk.ai 資安規範）

建議試點先用「本機代理 CLI」跑出第一版，避免先卡在 API 設定與權限。

### 3) 產出「提案 deck」

建議用 deck mode 的 skill（Quickstart 提到有 `simple-deck`、`magazine-web-ppt` 等技能）：

1. 選擇 mode：Deck / PPT
2. 選擇 skill：先用預設（通常是可直接出 deck 的那個）
3. 選擇 design system：先用 `Neutral Modern` 或一個最貼近客戶的品牌語言
4. 丟入 prompt（建議用 Ewalk.ai 既有提案結構，或先用以下模板）

**提案 Prompt 模板（可直接複製）**

- 客戶：{{客戶名稱}}
- 目的：{{本次提案要解決什麼}}
- 受眾：{{誰會看}}
- 需要的頁面（至少 8-12 頁）：
  1) 封面（標題+一句話價值）
  2) 現況/痛點
  3) 目標（KPI）
  4) 策略（3-5 點）
  5) 執行路線圖（4 週/8 週）
  6) 內容/廣告素材方向（示意版型）
  7) 預期成效與衡量方式
  8) 團隊分工/交付物
  9) 報價/方案（如需）
  10) QA / 下一步
- 輸出：可展示的 deck（可水平滑動）+ 每頁一句講稿（speaker notes 或頁下注解）

### 4) 產出「廣告視覺版型」

1. mode：Prototype / Template（以能輸出 HTML/CSS 結構為優先）
2. prompt 要求：
   - 產出 3 種尺寸布局（方形/直式/橫式）
   - 每種布局都預留：主標、輔標、CTA、品牌識別區（Logo/店名）
   - 規範字級與留白（方便後續套文案）

### 5) 儲存與歸檔（Ewalk.ai Vault）

Open Design 的 artifact 會存到 repo 的 `./.od/artifacts/.../index.html`（依 Quickstart 描述）。

試點建議在 Vault 做「只存交付物版本」：

- 建議歸檔路徑（可依實際再調整）：
  - `Ewalk.ai Brain/06_素材/OpenDesign/提案/`（放 deck 輸出）
  - `Ewalk.ai Brain/06_素材/OpenDesign/廣告版型/`（放版型輸出）
- 每次存檔命名：`YYYY-MM-DD_客戶_產物類型_v1`

## 驗收與回報給提姆

- 本次試點交付物連結（Vault 內路徑）
- 產出成本（花多久 / 改了幾版）
- 哪些 prompt/skill/design system 最好用（下一次能直接複製）
- 哪些地方需要設計師收尾（邊界清楚）

## 待確認

- 試點的「目標客戶」是哪一個？（避免做出來放不進既有交付）
- 我們是否要建立「設計助理」入職手冊？（若試點結果好再做）

