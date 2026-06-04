# 筆電控制台與 Mac Studio 阿順主機升級 SOP

建立日期：2026-06-04
主管：阿順
最終決策者：提姆先生
狀態：草案，待第一次筆電與主機分工驗收後轉正式版

## 本次設備決策紀錄

更新日期：2026-06-04

| 項目 | 決策 |
| --- | --- |
| 新筆電 | 13 吋 MacBook Air，M5 晶片，作為提姆先生控制台 |
| 記憶體 | 24GB 統一記憶體 |
| 儲存空間 | 1TB 內建 SSD |
| 出場日期 | 2026-05-26 |
| 阿順主機 | Mac Studio，作為 Ewalk.ai 主要執行主機 |
| Ewalk.ai 自動化系統主位置 | 放在 Mac Studio 內，作為正式工作源頭 |
| 新筆電資料角色 | 可放同步副本、審核文件與外出急件，不作為主要自動化執行環境 |
| 新筆電專用外接硬碟 | 目前未購買，後續作為外出備份與大型素材副本 |
| Mac Studio 主要工作身份 | 公司 Google 帳號，作為阿順主機身份 |
| 新筆電身份 | 公司 Google 帳號 + 個人 Google 帳號分 Profile |
| 溝通模式 | 提姆先生用筆電與阿順溝通，阿順主要在 Mac Studio 執行任務 |

本次不走整台系統搬移。新筆電採乾淨設定，定位為提姆先生控制台；Mac Studio 作為阿順主機，負責 Ewalk.ai 自動化系統、長任務、排程、工具執行與主要權限環境。

## Mac Studio 主機確認

更新日期：2026-06-04

| 項目 | 現況 |
| --- | --- |
| 機型 | Mac Studio |
| 晶片 | Apple M1 Max |
| 記憶體 | 32GB |
| macOS | 26.2 |
| 主機用途 | 阿順專用主機 |
| 內建資料碟可用空間 | 約 62GB |
| Ewalk.ai Vault 大小 | 約 4.8GB |
| 已掛載大型磁碟 | `/Volumes/提姆接案碟` |
| 大型磁碟剩餘空間 | 約 2.3TB |

關聯規劃：[[Mac Studio 阿順專用主機完全體升級計畫]]

## 目的

把 Ewalk.ai 工作架構調整成「提姆先生用筆電溝通與審核，阿順在 Mac Studio 主機內執行」的分工模式，讓日常工作可以被遠端交辦、在固定主機執行、可追蹤、可備份、可逐步自動化。

這次不建議把阿順主機搬到筆電。筆電適合當提姆先生的控制台與外出工作機；Mac Studio 適合當阿順的固定執行主機，承接 Codex、Firebase、Vercel、GitHub、排程、Command Center 與長任務。

## 建議策略

採用「筆電乾淨設定 + Mac Studio 主機固定化 + 遠端溝通/操作 + 驗收後切換」。

不採用「把 Ewalk.ai 主環境搬到筆電」。除非 Mac Studio 不可用，否則正式工作源頭留在 Mac Studio。

## 機器定位

| 設備 | 定位 | 用途 |
| --- | --- | --- |
| 新筆電 | 提姆先生控制台 | 日常溝通、審核、Canva、文件、外出急件、遠端連回阿順主機 |
| Mac Studio | 阿順主機 | Codex、Obsidian Vault、Firebase、Vercel、GitHub、Command Center、長任務與排程 |
| 外接 SSD | Ewalk 資料倉與素材倉 | 客戶素材、影片、圖片、大型專案、封存資料 |

## 搬移原則

- 不把阿順主環境搬到筆電。
- Mac Studio 保持為 Ewalk.ai 自動化系統正式源頭。
- 筆電可以有同步副本，但不能取代主機源頭。
- 不直接複製整包瀏覽器快取。
- 不把舊 token、API key、`.env` 內容貼進聊天或 Obsidian。
- 需要保留的金鑰與 token 只用密碼管理器、系統鑰匙圈或重新產生。
- 舊主機至少保留 7-14 天，不急著重置。
- 新筆電完成驗收前，不取消舊機任何登入與環境。

## 第一階段：新筆電控制台安全打底

### 1. macOS 基礎設定

- 更新到最新穩定版 macOS。
- 開啟 FileVault 磁碟加密。
- 設定強密碼與 Touch ID。
- 開啟尋找我的 Mac。
- 設定自動鎖定螢幕。
- 確認時區為台灣。

### 2. 帳號分層

建議至少分清楚：

- Apple ID：提姆先生個人或公司政策決定。
- Google Workspace：優先使用 `ewalk.ai` 公司帳號。
- Chrome Profile：
  - `Ewalk 工作`
  - `提姆先生個人`
- Codex / GitHub / Firebase / Vercel：以公司工作帳號或已批准帳號登入。

## 第二階段：Ewalk 工作環境安裝

### Mac Studio 必裝工具

| 工具 | 用途 |
| --- | --- |
| Codex Desktop / Codex CLI | 阿順主要執行環境 |
| Obsidian | Ewalk.ai Brain 主 Vault |
| Google Chrome | Meta、Firebase、Vercel、Canva 等登入操作 |
| GitHub CLI | Repo、版本、研究員工作流 |
| Node.js | Command Center、網站、Firebase 腳本 |
| Firebase CLI | Ewalk Command Center 與 Firestore 操作 |
| Vercel CLI | 網站部署與預覽 |
| Python | 表格、PDF、資料處理 |
| Canva | 視覺製作與審核 |
| Discord | 通知與交辦，若仍保留 |

### 新筆電建議安裝工具

| 工具 | 用途 |
| --- | --- |
| Chrome | 公司帳號與個人帳號分 Profile |
| Codex Desktop | 與阿順溝通、必要時處理外出急件 |
| Obsidian | 讀取或同步 Ewalk.ai Brain |
| 遠端桌面或 SSH 工具 | 連回 Mac Studio 阿順主機 |
| Canva | 外出審核與快速修改 |

### Mac Studio 建議安裝順序

1. Chrome + 公司帳號登入
2. Codex Desktop
3. Obsidian
4. Node.js / Python / Git
5. GitHub CLI
6. Firebase CLI
7. Vercel CLI
8. Ewalk 自動化腳本驗收

## 第三階段：Ewalk.ai Vault 與主機策略

### 建議資料配置

| 類型 | 建議位置 |
| --- | --- |
| 目前正在執行的 Ewalk.ai Vault | Mac Studio 內建 SSD |
| 新筆電 Ewalk.ai Vault | 同步副本或外出急件副本 |
| 大型素材、影片、客戶原始檔 | 外接 SSD |
| 封存專案 | 外接 SSD |
| 自動化腳本與 Command Center | 跟 Vault 同位置，避免路徑斷掉 |

若新筆電容量是 1TB，建議：

- 內建 SSD 放系統、App、審核文件與 Ewalk.ai Vault 同步副本。
- 不把長任務、排程與正式自動化改放筆電。
- 外接 SSD 後續補上後，作為大型圖片、影片、舊專案與封存素材倉。

若提姆先生希望筆電也能外出處理急件：

- 筆電保留 Ewalk.ai Vault 的讀寫副本。
- 正式排程與自動化仍以 Mac Studio 為準。
- 回家後要同步回 Mac Studio，避免雙主機資料分裂。

## 第四階段：權限與密鑰重建

### 需要重新登入或確認的服務

| 服務 | 檢查重點 |
| --- | --- |
| GitHub | Repo 存取、研究員工作流 |
| Firebase | `ewalk-ai-system-prod` 專案權限 |
| Vercel | 部署權限與 token |
| OpenAI | API Key 不貼明文，必要時重新建立 |
| Google Workspace | Gmail、Drive、Calendar 權限 |
| Meta Business | 粉專、IG、廣告帳號權限 |
| Canva | 品牌素材與設計存取 |
| Discord | 通知 Webhook 或 Bot 權限 |

### 密鑰處理原則

- 舊機的 `.env` 先盤點，不直接整包複製。
- 已用過、貼過、疑似外洩的 key 一律重建。
- 新機只放目前需要的 key。
- 高風險 key 要記錄用途、建立日期、保存位置與撤銷方式。

## 第五階段：最小驗收

筆電與 Mac Studio 分工完成前，不算正式接手。至少要通過以下檢查：

### 1. Vault 驗收

- Obsidian 能開啟 Ewalk.ai Brain。
- `01_客戶`、`08_自動化`、`13_SOP流程` 能正常讀寫。
- 新增一份測試筆記後可保存。
- 確認 Mac Studio 版本是正式源頭。
- 確認筆電版本是同步副本或審核副本。

### 2. Codex 驗收

- Codex 能讀取 Ewalk.ai 自動化系統資料夾。
- Codex 能建立或修改一份測試文件。
- Codex 能沿用 AGENTS.md 角色規則。
- Mac Studio 可完成一次主要任務。
- 筆電可與 Mac Studio 連線或交辦。

### 3. Command Center 驗收

- 能開啟 Command Center 本機頁面。
- 能看到客戶名冊預覽資料。
- 能更新本機資料檔。
- 若要讀正式 Firebase，需提姆先生批准後再驗證。

### 4. Firebase 驗收

- Firebase CLI 能登入。
- 能確認目前專案是 `ewalk-ai-system-prod`。
- 只做讀取或 dry-run，不直接寫入正式資料。

### 5. Vercel 驗收

- Vercel CLI 能登入。
- 能讀取既有專案或部署測試預覽。
- 未批准前不覆蓋正式網站。

### 6. Meta / Google 驗收

- Meta Business 能進入 Ewalk 數位漫步資產。
- Google Workspace 能查信與 Drive。
- 高風險操作仍需提姆先生批准。

## 第六階段：切換日

切換當天做：

1. Mac Studio 作為正式阿順主機。
2. 新筆電執行日常溝通與審核：
   - 打開 Obsidian
   - 打開 Codex
   - 連回 Mac Studio
   - 打開 Command Center
   - 讀取一位客戶資料
   - 產生一份測試交付文件
3. 確認沒有路徑、權限、登入錯誤。
4. 記錄切換結果。

## 第七階段：備援與常駐策略

切換後 7-14 天內，不重置任何舊環境。

通過穩定期後再決定：

- 方案 A：Mac Studio 保持為阿順常駐主機。
- 方案 B：舊環境保留為備援機。
- 方案 C：舊環境整理後給其他用途。

若要重置成阿順常駐主機，重置前必做：

- 確認 Mac Studio 已完整接手阿順主機角色。
- 確認新筆電能穩定連回 Mac Studio。
- 備份舊機重要資料。
- 撤銷或重建舊機不需要的登入狀態。
- 不保留個人瀏覽資料與舊快取。

## 需要提姆先生提供或確認的資料

- 新筆電規格：晶片、記憶體、容量。
- 外接 SSD 名稱與資料夾位置。
- Mac Studio 目前規格與可用容量。
- 新筆電與 Mac Studio 要用哪種方式連線：螢幕共享、SSH、Tailscale、Chrome Remote Desktop 或其他。
- 是否要讓新筆電保留 Ewalk.ai Vault 同步副本。
- 是否使用公司 Google 帳號作為主要工作身份。
- 是否要保留 Discord 通知中心。
- 是否要把舊主機未來重置為阿順常駐主機。

## 阿順建議

目前最佳方案是：

1. Mac Studio 固定為阿順主機與 Ewalk.ai 正式執行環境。
2. 新筆電乾淨設定為提姆先生控制台。
3. Ewalk.ai Vault 正式源頭放 Mac Studio，筆電可放同步副本。
4. 外接 SSD 後續補上，作為大型素材倉與備份。
5. 長任務、排程、Firebase/Vercel/GitHub 自動化集中在 Mac Studio 或雲端執行，不放在筆電。

這樣能兼顧速度、安全、可控與未來擴充。
