# 2026-06-06 Command Center B8A 只讀營運觀察

## 一句話結論

B8A 通過。Mac Studio 已能進入低風險人工上工；Command Center 目前適合做只讀營運觀察、客戶名冊盤點、批准事項分類與下一步排序，但仍不代表批准正式寫入、部署、發文、廣告預算、金流或正式客戶通道。

## 本輪資料來源

- `mac-studio-startup-check-20260606-011553`
- `08_自動化/firebase/command-center-app/data/client-registry.js`
- `08_自動化/firebase/command-center-app/data/approval-queue.js`
- `08_自動化/firebase/command-center-app/data/ai-runs.js`
- `08_自動化/firebase/command-center-app/data/host-status.js`

## 觀察範圍

允許：

- 只讀本機 dry-run app data。
- 判讀 Mac Studio B7B 檢查報告。
- 整理客戶名冊、批准佇列、AI 執行紀錄與主機狀態。
- 產出下一步低風險待辦。

禁止：

- 不寫 Firestore。
- 不部署 Firebase rules / hosting。
- 不發 Facebook / Instagram。
- 不操作 Meta 廣告預算。
- 不操作金流、帳務或訂閱。
- 不接正式客戶通道。
- 不把本機 dry-run 觀察當成正式執行批准。

## 看板狀態摘要

| 區塊 | 觀察 | 判讀 |
| --- | --- | --- |
| Mac Studio Host Harness | 最新批次 `4` 成功、`0` 失敗、`0` 阻塞 | 低風險常駐鏈路可用。 |
| Command Center 本機資料刷新 | `command_center_local_data_refresh` 已連續成功 | B7B 缺檔容錯已驗證通過。 |
| 客戶名冊 | 共 `17` 位客戶 | 可進入只讀盤點與優先排序。 |
| 客戶資料 readiness | `ready_profile: 9`、`ready_profile_and_content: 7`、`ready_content_queue: 1` | 多數可先做客戶基本資料整理，少數可進內容佇列樣板。 |
| Approval Queue | `4` 件 pending，`3` 件 high risk | 只能整理與提請批准，不可自動執行。 |
| AI Runs | `5` 件 success，`0` pending approval | Command Center 建置工作目前無卡關。 |
| Command Center Live Read | Mac Studio 缺 `firebase-config.local.js` | Mac Studio 本機維持 dry-run；Live Read 需另行本機 config 與手動登入。 |

## 客戶名冊觀察

目前客戶名冊有 `17` 位客戶：

- `9` 位適合先匯入或整理基本資料。
- `7` 位具備基本資料與內容資料，可進一步做內容欄位整理。
- `1` 位具備內容佇列樣板價值。

優先可觀察的低風險客戶：

| 客戶 | 狀態 | readiness | 建議 |
| --- | --- | --- | --- |
| 韓食日常鍋物 | 待確認 | `ready_content_queue` | 可作為內容佇列樣板，但正式發文必須另行批准。 |
| 嘉昱隔熱膜 | 執行中 | `ready_profile_and_content` | 適合先整理客戶基本資料與內容欄位。 |
| The Vision Hair Salon | 待確認 | `ready_profile_and_content` | 可整理內容與客戶資料，不碰廣告預算。 |
| S.Color 芯 STAR Color | 待確認 | `ready_profile_and_content` | 資料量大，可先做結構盤點。 |
| STAR SPA | 待確認 | `ready_profile_and_content` | 可先整理內容資料與素材狀態。 |

## Approval Queue 觀察

目前有 `4` 件待批准：

| 項目 | 風險 | 判斷 |
| --- | --- | --- |
| 韓食日常鍋物品牌日常貼文進入正式發文流程 | L4 / 對外發布 | 不自動執行；等 Meta 發文工具與標示規則後再批准。 |
| 每日 04:00 GitHub 自我升級情報研究 | L3 / 排程研究 | 可改提案為每週一次摘要；未批准前不跑正式排程。 |
| Firebase Blaze / Storage 啟用 | L4 / 付費與儲存 | 目前不批准；等預算監控與 rules 完成。 |
| TheVision Meta 廣告月預算上限設定 | L4 / 廣告預算 | 只做內部建議，不接正式廣告帳戶。 |

## AI 執行紀錄觀察

目前 AI runs 共 `5` 件，皆為 success：

- Command Center 改成提姆先生審核視角。
- Command Center Ewalk.ai 視覺品牌化改版。
- Command Center 建立 Approval Queue 本機 dry-run。
- Command Center 接入 AI 執行紀錄區。
- 小公司可控版 Agent Harness 開工。

判斷：

- Command Center 基礎建置沒有待批准卡關。
- 下一步應從建置轉向營運觀察與低風險工作節奏。

## 主機狀態觀察

B7B 三次回報確認：

- Mac Studio Git 已同步到 `4ac0918`。
- OpenClaw Gateway 正常。
- Ollama `gemma4:12b` 正常。
- 本機 ports `18789` / `11434` 正常。
- `/Volumes/提姆接案碟` 已掛載。
- Host Harness 最新批次成功。

注意：

- 新筆電 repo 內的 `data/host-status.js` 可能不是 Mac Studio 最新狀態，因為 Host Harness 產生的本機 app data 屬於 Mac Studio local output，不應直接拿來當 Git 文字資料提交。
- 若要看主機即時狀態，以 Mac Studio Command Center 本機畫面或最新 `mac-studio-startup-check` 報告為準。

## 可直接做

- 整理 17 位客戶的「基本資料優先級」。
- 整理 `ready_profile_and_content` 客戶的內容欄位需求。
- 把 Approval Queue 四件事項改寫成提姆先生決策摘要。
- 針對韓食日常鍋物整理「內容佇列樣板」，但不發文。
- 針對嘉昱隔熱膜整理客戶基本資料與內容欄位，不對外操作。
- 建立「新筆電主控、Mac Studio 實機上工」第一個日常任務紀錄。

## 需要提姆先生批准

- 韓食日常鍋物正式發文。
- GitHub 自我升級情報研究排程化。
- Firebase Blaze / Storage 啟用。
- TheVision 廣告預算或 Meta 廣告帳戶串接。
- Command Center 正式寫入。
- Firestore rules / hosting 部署。
- 任何正式客戶通道連接。

## 禁止

- 不自動執行 Approval Queue。
- 不把 pending 視為 approved。
- 不把本機 dry-run 視為正式資料寫入。
- 不用 Mac Studio local output 直接污染 Git。
- 不讓 OpenClaw、Ollama 或 Host Harness 直接讀寫正式資料。

## B8A 判定

B8A 判定為「通過」。

下一步可進入 B8B：低風險客戶名冊優先級整理。

## B8B 建議題目

建議第一個真正日常任務：

```text
B8B：整理 17 位客戶的低風險上工優先級，只產出客戶名冊判讀與下一步，不讀接案碟、不發文、不寫 Firebase、不接正式客戶通道。
```

原因：

- 只依據 Command Center dry-run 與 Vault 文字資料整理。
- 可以立刻幫 Ewalk.ai 回到客戶營運。
- 不牽涉外部副作用。
- 能測新筆電主控、Mac Studio 實機上工後的第一個工作節奏。

## 關聯文件

- [[2026-06-05_接下來行動總控]]
- [[2026-06-06_MacStudio_B7A實機開工檢查單]]
- [[../../13_SOP流程/Command Center 只讀使用SOP]]
- [[../../13_SOP流程/Mac Studio 阿順上工啟動SOP]]
- [[../../14_每日工作/2026-06-06]]
