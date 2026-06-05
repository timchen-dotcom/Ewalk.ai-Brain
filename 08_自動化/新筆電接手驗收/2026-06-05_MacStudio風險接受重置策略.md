# 2026-06-05 Mac Studio 風險接受重置策略

## 用途

把 Mac Studio 重置策略從「追求 100% 完整稽核」改為「核心已接手、殘留風險可接受、重置後補做」。

這份文件是為了避免阿順把提姆先生卡在無限驗收裡。

## 提姆先生決策

提姆先生判斷：

- 追求 100% 重置前稽核的時間成本過高。
- 系統升級與主機優化的價值，高於繼續追查每一個舊機細節。
- 新筆電已能承接日常工作，文字資料已完成 GitHub snapshot。
- 舊機殘留的 thread、排程、憑證、素材等風險，改成升級後再補做。

阿順接受此決策，後續不再以完整稽核作為重置前硬性阻擋。

## 新策略

原策略：

```text
100% 稽核完成後，才可進入重置。
```

新策略：

```text
核心工作已接手，已知風險可接受，先重置升級，升級後按清單補齊。
```

## 已足夠支撐重置的基礎

| 項目 | 狀態 | 說明 |
| --- | --- | --- |
| 新筆電日常工作入口 | 已完成 | Codex、Obsidian、Chrome、工具鏈可用。 |
| Ewalk.ai Brain 文字資料 | 已完成 | 系統文件、SOP、Prompt、客戶文字、每日交接已分批推上 GitHub。 |
| P0 / P1 / P2 接續摘要 | 已完成基礎版 | 已用 Vault 脈絡預回填，可支撐日常接續。 |
| 新筆電非敏感 dirty 備份 | 已完成 | 已建立本機備份，排除已知私密設定。 |
| Mac Studio Host Harness 狀態 | 已讀取 | 主機仍可運作，低風險 Harness 最近一批成功。 |
| 高風險商業動作 | 有邊界 | 發文、廣告預算、金流、正式 Firebase 寫入仍需提姆先生批准。 |

## 接受的殘留風險

| 風險 | 接受方式 |
| --- | --- |
| 舊 Codex thread 有未沉澱決策 | 升級後以 Vault、GitHub、截圖與需求回憶補做；不再卡重置。 |
| Mac Studio 本機排程未完整盤點 | 升級後重建需要的排程，不追求搬移舊排程。 |
| 私密憑證可能需重新登入或重取 | 走官方登入、重新產 key、重新授權，不明文搬移。 |
| Browser Profile / app 登入狀態遺失 | 升級後重新登入。 |
| 舊機素材未逐一抽查 | 以 GitHub 文字資料、外接碟、iCloud / Google Drive 與日後需求補查。 |
| Host Harness 舊狀態中斷 | 升級後重建為新版阿順主機，不追求原樣復刻。 |

## 重置前只保留的最小確認

這不是完整稽核，只是避免誤傷。

1. 確認重置目標是 Mac Studio 內建系統碟，不是 `/Volumes/提姆接案碟`。
2. 確認提姆先生知道重置後舊機登入、排程、thread、本機設定可能需要重建。
3. 確認新筆電仍可開啟 `Ewalk.ai Brain`，且 GitHub `origin/main` 已同步。
4. 確認正式發文、廣告預算、金流、Firebase 正式寫入不會因重置自動啟用。

完成以上，即可進入風險接受重置。

## 重置後補做

2026-06-05 提姆先生回報：Mac Studio 已重置完成。

重置或系統升級後，阿順依序補：

1. 安裝 Homebrew、Node.js / npm、GitHub CLI、Firebase CLI、Vercel CLI。已完成。
2. 還原或 clone `Ewalk.ai Brain`。已完成。
3. 重新登入 GitHub、Firebase、Vercel、Chrome、Obsidian。GitHub / Firebase / Vercel 已完成；Chrome / Obsidian 待人工確認。
4. 重建 Host Harness，不原樣搬舊排程。手動 dry-run 已通過；常駐 LaunchAgent 已由提姆先生批准並完成安裝初驗。
5. OpenClaw 先接 test workspace，再逐步驗收。待批准。
6. 重建 Command Center 本機資料更新。
7. 只對仍有價值的舊 automation 重新設計，不盲目復活。
8. 需要 token / secret 時，走重新授權或安全憑證流程。

## 阿順判斷

阿順原本的「不可重置」是保守系統稽核觀點；現在依提姆先生的經營判斷，改為：

```text
可進入風險接受重置，不再追求 100% 稽核。
```

這代表可以前進，但不是沒有風險。風險由「重置前全部排除」改為「重置後按價值補做」。

## 後續口徑

- 不再說「缺完整六份只讀稽核，所以不能重置」。
- 改說「完整稽核改為重置後補做」。
- 不再要求逐個舊 thread 補完才重置。
- 重置後以新筆電與 GitHub 為主線，Mac Studio 作為新版 OpenClaw / 24H 阿順主機重建。
- 所有正式對外動作仍需提姆先生批准。

## 重建進度更新

2026-06-05 提姆先生回報：Mac Studio 第四批完成，Host Harness 手動 dry-run 通過。

阿順判斷：

- Mac Studio 已具備阿順主機的低風險手動執行能力。
- Host Harness 常駐 LaunchAgent 已完成安裝初驗；下一步觀察至少一輪 15 分鐘排程穩定性。
- 下一步應補 Chrome / Obsidian 人工確認，並重建 OpenClaw test workspace。

2026-06-05 提姆先生回報：Mac Studio 第五批完成，Host Harness 常駐已安裝。

阿順判斷：

- 阿順已回到 Mac Studio 作為定時主機，但仍保持低風險權限邊界。
- 常駐任務不代表正式發文、廣告、金流、正式部署或 Firebase 高風險寫入已被批准。
- 後續需驗收常駐 log、Command Center 狀態更新與 OpenClaw test workspace。

2026-06-05 提姆先生回報：Mac Studio 第六批前半完成，常駐排程穩定，Chrome / Obsidian 可用。

阿順判斷：

- Mac Studio 已恢復為可用的阿順定時主機與人工工作入口。
- 下一步是 OpenClaw test workspace，但此步會安裝或啟動 agent gateway，需另行批准。
- OpenClaw 第一階段只能跑本機測試 workspace，不得接正式 Ewalk.ai Brain、正式客戶資料、正式通道或高風險工具。

2026-06-05 提姆先生批准：OpenClaw 低風險 PoC。

阿順判斷：

- 可在 Mac Studio 安裝或啟動 OpenClaw，但只能使用隔離測試 workspace。
- PoC 期間不得把 OpenClaw 接到正式 `Ewalk.ai Brain`、提姆接案碟、正式客戶通道或高風險工具。
- 若 onboarding 要求 Gateway / auth / channels / skills 選項，優先選 loopback、token auth、skip channels、skip third-party skills。

2026-06-05 提姆先生回報：OpenClaw test workspace 已啟動，安全邊界問答與 DuckDuckGo web search 初驗通過。

阿順判斷：

- OpenClaw 已能在 `/Users/ashun/OpenClaw Test Workspace` 內運作，並能說明不得碰正式 Brain、接案碟、正式通道與高風險操作。
- Web search 初驗能查到 Gateway port `18789`，符合目前 `127.0.0.1:18789` loopback-only 設定。
- 聊天頻道、hooks、第三方 plugins、正式 Brain read-only 與 daemon 常駐仍需分批批准。
