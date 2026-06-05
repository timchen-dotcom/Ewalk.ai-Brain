# 2026-06-05 Mac Studio 原機操作手順

建立時間：2026-06-05
負責角色：阿順
最終決策者：提姆先生
用途：在 Mac Studio 重置前，於原主機完成舊 Codex thread、常駐自動化與完整備份檢查。

## 使用時機

當提姆先生坐到 Mac Studio 原主機前，請照這份手順執行。

這份手順不是重置批准。它的目的，是把 Mac Studio 上可能只有原機才看得到的資料完整交接出來。

## 操作總結

```text
先交接舊 Codex thread
再盤點本機自動化與排程
再做完整備份並抽查
最後才回到新筆電請阿順判定是否可重置
```

## 第 1 段：舊 Codex thread 交接摘要

回填資料夾：

```text
Ewalk.ai Brain/08_自動化/新筆電接手驗收/舊主機thread交接摘要
```

原機檢查總表：

```text
Ewalk.ai Brain/08_自動化/新筆電接手驗收/2026-06-05_MacStudio原機檢查回填表.md
```

### 需要處理的 thread

優先處理 P0 / P1：

1. 工作交辦窗口
2. Ewalk.ai 專業經理人 - 阿順
3. 【霖老師】線上車庫
4. 【韓食日常鍋物】自動發文系統
5. 【韓食日常鍋物】規劃韓式鍋物六月開幕廣告
6. 【TheVision】官網重做
7. 【TheDay那日美學】建立分店訂購管理系統
8. 【正官庄】行銷稽核系統
9. 【Ewalk.ai】阿順語音系統

時間允許再處理 P2：

- 建構阿順語音系統
- 簡報AI自動化系統
- 影片腳本模板作業員
- 【Ewalk.ai】自動化製作教案簡報系統
- 【Ewalk.ai】串接 Higgsfield CLI
- 【Ewalk.ai】五星評論輔助工具
- 【Ewalk.ai】建立社群發文追蹤系統
- Ewalk.ai & 幻色鏡方
- 【STAR COLOR】建立音樂播放網站
- 【STAR SPA】設計文宣
- 髮染官網建置
- 研究 inebrya 產品頁圖像需求
- 優化韓食鍋物餐點圖

### 貼給每個舊 thread 的 prompt

```text
阿順，這是 Mac Studio 舊主機的釘選工作窗口。請你輸出一份可搬到新筆電 Ewalk.ai Brain 的交接摘要。

請用繁體中文，格式如下：

# 交接摘要｜{工作名稱}

## 目前狀態

## 已完成事項

## 待補資料

## 風險與需提姆先生批准事項

## 下一步可執行清單

## 相關檔案與連結

## 建議歸檔位置

注意：
- 不要輸出 token、secret、密碼、API key。
- 涉及對外發布、廣告預算、正式部署、金流或核心規則，標註「需提姆先生批准」。
- 如果你能讀到本機檔案，請只引用路徑與摘要，不要貼出敏感內容。
```

### 摘要存放位置

每份摘要先放到：

```text
Ewalk.ai Brain/08_自動化/新筆電接手驗收/舊主機thread交接摘要/
```

若是客戶工作，摘要內再標註對應客戶資料夾。
完成後同步更新 `2026-06-05_MacStudio原機檢查回填表.md` 的狀態欄位。

## 第 2 段：常駐自動化與排程盤點

### 貼給 Mac Studio Codex 的 prompt

```text
阿順，請在 Mac Studio 原主機上盤點是否有本機常駐自動化或排程，目標是判斷這台能不能重置。

請只做只讀檢查，不停用、不刪除、不修改。

請檢查並回報：
1. Codex Automations 是否有本機依賴
2. macOS Login Items / LaunchAgents / LaunchDaemons
3. crontab
4. pmset schedule
5. 目前常駐的 node / python / firebase / vercel / ollama / openclaw 相關程序
6. Chrome / 瀏覽器登入狀態是否支撐 Meta、Google、Firebase、Vercel 或 Discord 工作
7. 是否有任何每日交接、Discord 通知、Google Ads、Meta 發文、Command Center、OpenClaw、Ollama、Gemma 相關本機流程

請輸出：
- 發現項目
- 可能影響
- 是否可停用
- 搬移建議
- 需提姆先生批准事項

不要讀取或輸出 secret、token、密碼或 API key。
```

### 可用只讀檢查命令

以下命令僅供 Mac Studio 原機執行：

```bash
launchctl list
ls ~/Library/LaunchAgents
ls /Library/LaunchAgents
ls /Library/LaunchDaemons
crontab -l
pmset -g sched
ps aux | egrep 'node|python|firebase|vercel|ollama|openclaw|codex|discord' | grep -v egrep
```

## 第 3 段：完整備份驗證

### 備份範圍

Mac Studio 重置前至少確認以下資料已備份：

- `~/Desktop/Ewalk.ai 自動化系統`
- `~/Desktop`
- `~/Documents`
- `~/Downloads`
- 重要瀏覽器 Profile
- Obsidian Vault 與本機工作設定
- 需要保留的 `.env.local`、token、secret 設定，但不得明文放入 Vault
- 舊 Codex thread 交接摘要

### 貼給 Mac Studio Codex 的 prompt

```text
阿順，請協助我在 Mac Studio 原主機做重置前備份盤點。

請只做只讀檢查，不刪除、不搬移、不覆蓋。

請回報：
1. Ewalk.ai 自動化系統資料夾位置與大小
2. Desktop / Documents / Downloads 是否有未歸檔 Ewalk.ai 客戶素材
3. 是否已有 Time Machine 或外接硬碟備份
4. 是否有 iCloud / Google Drive 同步中的重要資料
5. 是否有本機私密憑證檔案需要提姆先生另行保管
6. 重置前還需要人工複製或確認的資料

不要輸出任何 secret、token、密碼、API key。
```

### 可用只讀檢查命令

以下命令僅供 Mac Studio 原機執行：

```bash
du -sh ~/Desktop/"Ewalk.ai 自動化系統"
du -sh ~/Desktop ~/Documents ~/Downloads
tmutil latestbackup
find ~/Desktop ~/Documents ~/Downloads -maxdepth 3 -iname '*Ewalk*' -o -iname '*客戶*' -o -iname '*素材*'
```

## 完成後回到新筆電

完成以上三段後，在新筆電這個主 thread 回報：

```text
阿順，Mac Studio 原機檢查完成。
已完成：
1. 舊 Codex thread 交接摘要
2. 常駐自動化與排程盤點
3. 完整備份驗證

請重新判定 Mac Studio 是否可重置。
```

## 可重置門檻

只有以下全部完成，才可進入重置批准：

- P0 / P1 舊 thread 已輸出交接摘要。
- 本機自動化、排程與常駐程序已盤點。
- Mac Studio 完整備份已完成並抽查可讀。
- 私密憑證已有安全保管或重新取得方案。
- 提姆先生明確批准重置。

## 禁止事項

在阿順回報可重置前，禁止：

- 重置 Mac Studio。
- 清除瀏覽器 Profile。
- 刪除 `Ewalk.ai 自動化系統`。
- 移除 token、secret、憑證、登入狀態。
- 停用任何仍可能支撐正式工作的自動化。
