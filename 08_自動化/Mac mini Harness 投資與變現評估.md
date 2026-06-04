# Mac mini Harness 投資與變現評估

建立日期：2026-06-02  
負責角色：阿順  
最終決策者：提姆先生  
評估設備：Mac mini M4 / 24GB 統一記憶體 / 1TB SSD / 10Gb Ethernet  
截圖價格：NT$44,400  
狀態：可作為 Ewalk.ai 第一台專用 Harness 主機

## 結論

這台 Mac mini 對 Ewalk.ai 的價值，不是單純「多一台電腦」。

它會把 Ewalk.ai 從：

```text
提姆先生的個人工作電腦 + 阿順臨時操作
```

升級成：

```text
乾淨隔離的 AI 營運主機 + 可追蹤 Harness + Command Center
```

這會直接改善三件事：

1. 安全性：公司 AI 系統不再混用提姆先生私人工作機。
2. 穩定性：自動化可以長時間跑，不干擾提姆先生日常工作。
3. 變現能力：可以包裝成客戶服務，而不是只靠阿順手工處理。

## 這台規格適合做什麼

適合：

- Ewalk.ai Harness 主機
- OpenHarness / OpenClaw PoC
- Command Center 本機管理
- `ai_runs` 任務紀錄
- Discord / Web UI / 手機交辦入口
- GitHub 自我升級情報整理
- 美感趨勢週報自動化
- Google 評論追蹤
- Gmail / 訂閱稽核輔助
- 小量瀏覽器自動化
- 客戶資料 dry-run、月報草稿、內容佇列整理

不適合當第一優先：

- 大型本地 LLM 長時間推理
- 大量影片生成
- 多客戶大量平行瀏覽器自動化
- 圖像 / 影片重型生成主機

如果未來要把大量本地模型與影像工作也丟進主機，才需要考慮 M4 Pro / 48GB 以上。

## 對工作流的差異

### 購買前

```text
提姆先生交辦
  -> 阿順在主工作機處理
  -> 文件 / 工具 / 瀏覽器混在一起
  -> 高風險操作需要臨時判斷
  -> 成本與紀錄不一定完整
```

### 購買後

```text
提姆先生交辦
  -> Mac mini 收任務
  -> Ewalk.ai Harness 建立 ai_run
  -> 自動選 SOP / Prompt / Skill / AI 員工
  -> 產出 dry-run
  -> Command Center 顯示待審
  -> 提姆先生批准
  -> 才執行外部動作
  -> 寫回記憶、成本、錯誤與成果
```

## 可帶來的具體好處

| 面向 | 具體好處 |
| --- | --- |
| 安全 | 私人資料與公司 AI 主機隔離 |
| 穩定 | 任務可長時間跑，不佔用提姆先生工作視窗 |
| 可回查 | 每次任務都有 `ai_runs` 紀錄 |
| 可批准 | 發文、預算、金流全部進 Command Center 批准閘 |
| 可複製 | 韓食、The Vision、TG、STAR SPA 等客戶能套同一流程 |
| 可教學 | 可以對外展示「AI 行銷營運主機」概念 |
| 可交付 | 從臨時做事變成可包裝服務 |

## 變現能力

### 1. AI 社群營運系統費

對客戶賣的不只是貼文，而是：

- 內容佇列
- 審核流程
- 發文前檢查
- 成效追蹤
- 月報
- AI 員工分工

可包裝：

```text
AI 社群營運系統建置費 + 每月維護費
```

### 2. Google 評論 / Google 商家自動化

可以變成：

- 每日評論追蹤
- 負評提醒
- 回覆建議
- Google 商家貼文建議
- 每週摘要

可包裝：

```text
Google 商家 AI 管理月費
```

### 3. 美感趨勢週報

可以變成：

- 美髮 / 美妝 / 時尚 / 潮流趨勢週報
- 客戶品牌套用建議
- 每週社群主題推薦

可包裝：

```text
趨勢情報訂閱 / 客戶加值服務
```

### 4. AI 營運主機建置服務

未來可以對外賣：

- 美業品牌 AI 工作流建置
- AI 社群 Command Center
- AI 員工分工 SOP
- 發文審核系統
- 月報自動化

這會讓 Ewalk.ai 不只是代操公司，而是 AI 行銷系統建置公司。

### 5. 內部節省時間

保守估算：

- 每月少 10 小時重複整理：價值約 NT$10,000 到 NT$20,000
- 每月少 20 小時重複整理：價值約 NT$20,000 到 NT$40,000
- 若因此多接一位月費客戶，回本會更快

以 NT$44,400 的設備來看，只要能：

- 節省 2 到 4 個月重複工時，或
- 多帶來 1 位月費客戶，或
- 支撐 1 個 AI 系統建置案，

就有機會回本。

以上是營運估算，不是保證收益。

## 最大風險

| 風險 | 控制方式 |
| --- | --- |
| 買了但只是放著 | 第一週就完成 `ai_runs` dry-run |
| 工具太多反而亂 | 先只接 OpenHarness / OpenClaw PoC，不一次全裝 |
| 權限過大 | agent 只能讀寫指定資料夾 |
| 對外入口風險 | 先走 VPN / Tunnel，不開 router port |
| 成本失控 | 第一版就建立 usage log |
| 沒有變現產品 | 同步設計「AI 社群營運系統」服務包 |

## 阿順建議

如果這台是：

```text
Mac mini M4 / 24GB / 1TB / 10Gb Ethernet / NT$44,400
```

我認為可以買，適合作為 Ewalk.ai 第一台 AI Harness 主機。

但買回來後不要先亂裝一堆工具。

第一週只做：

1. 安全設定
2. Ewalk.ai 專用帳號
3. Harness 資料夾
4. `ai_runs` dry-run
5. Command Center AI 執行紀錄
6. OpenHarness / OpenClaw 低風險 PoC

## Option 2：512GB 內建碟 + 外接 SSD 怎麼搭

如果為了縮短到貨時間，改買：

```text
M4 / 24GB / 512GB / Gigabit Ethernet
```

可以，但外接 SSD 要搭對。

### 最推薦搭配

```text
內建 512GB：只放 macOS、App、開發工具、少量 cache
外接 Thunderbolt SSD 2TB 或 4TB：放 Ewalk.ai Harness、logs、Docker、agent outputs
另一顆備份碟或 NAS：做 Time Machine / 週備份
```

### SSD 優先順序

| 等級 | 建議 | 適合用途 |
| --- | --- | --- |
| 最穩 | Thunderbolt 4 NVMe 外接盒 + 2TB / 4TB NVMe SSD | 長期當 Ewalk.ai 工作碟 |
| 可用 | 品牌 Thunderbolt 外接 SSD | 少折騰、穩定，但價格較高 |
| 預算型 | USB-C 10Gb/s 外接 SSD | 跑文件、logs、一般工具可用 |
| 不優先 | USB 3.2 Gen 2x2 20Gb/s SSD | Mac 上常無法吃滿 20Gb/s，容易只跑 10Gb/s |

### 容量建議

- 最低：2TB
- 建議：4TB
- 不建議只買 1TB，因為 logs、瀏覽器快取、Docker、測試輸出很快會長大

### 格式化建議

外接 SSD 建議格式：

```text
APFS 加密
```

不要用 exFAT 當長期工作碟。

建議命名：

```text
EwalkHarnessSSD
```

資料夾結構：

```text
/Volumes/EwalkHarnessSSD/Ewalk.ai-system
/Volumes/EwalkHarnessSSD/Ewalk.ai-logs
/Volumes/EwalkHarnessSSD/Ewalk.ai-cache
/Volumes/EwalkHarnessSSD/Ewalk.ai-backups
```

### 實務設定

- Mac mini 後方 Thunderbolt 4 接外接 SSD。
- 前方 USB-C 留給臨時隨身碟、讀卡機或配件。
- Harness 主資料夾放外接 SSD。
- secrets / token 不放 Obsidian，也不放 logs。
- 每週把外接 SSD 備份到另一顆硬碟或 NAS。

### 阿順建議購買組合

如果採 Option 2，我建議：

```text
Mac mini M4 / 24GB / 512GB
  + Thunderbolt 4 NVMe 外接盒
  + 4TB NVMe SSD
  + 另一顆 4TB 或 8TB 備份碟
```

這比硬等 1TB / 10Gb Ethernet 版本更快開工，也比只買 512GB 裸機安全。

### 何時不建議 Option 2

如果你不想管理外接碟、備份與掛載路徑，那就等 1TB 內建版比較省心。

如果要長期大量跑本地模型或大量影片素材，外接碟可以解決容量，但不能解決記憶體需求，應考慮 M4 Pro / 48GB。

## 對提姆先生的白話建議

這台不是拿來取代你現在的 Mac Studio。

它是拿來讓 Ewalk.ai 有一台乾淨、專門、可控的 AI 公司主機。

它真正帶來的價值是：

```text
讓阿順從「在你電腦裡工作的助理」
變成「有自己主機與制度的 AI 營運經理」
```

這會讓 Ewalk.ai 未來比較容易對客戶說：

我們不是只會用 AI 寫文案。  
我們能幫你建立一套 AI 行銷營運系統。

## 參考

- Apple Mac mini 技術規格：https://www.apple.com/mac-mini/specs/
- Apple Platform Security：FileVault：https://support.apple.com/en-asia/guide/security/sec4c6dc1b6e/web
- Apple Platform Security：Secure Enclave：https://support.apple.com/en-euro/guide/security/secf020d1074/web
