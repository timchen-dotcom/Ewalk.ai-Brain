# Claude Platform on AWS 導入盤點清單（IAM / 帳務 / 治理）

## 目的

把「未來若要把 Claude API/Agents 放到 AWS 治理」這件事，先變成可審核的盤點清單，避免一上雲就卡在：

- 權限邊界不清
- 帳務歸屬不明
- 金鑰與資料流風險
- 工具/沙箱無法稽核

本文件只做盤點與決策準備，不包含任何金鑰、webhook URL、token，也不改動任何既有自動化行為。

## 來源

- Claude Platform release notes（May 11, 2026：Claude Platform on AWS）
  - https://platform.claude.com/docs/en/release-notes/overview

## 何時使用

- 我們要做「雲端常駐 agent」或「在雲端跑批次產出」前（例如月報、素材批次處理、資料彙整）
- 客戶/合作方要求：必須用 AWS IAM 與 AWS billing 走帳與控權
- 需要把 agent 的工具、sandbox、檔案處理做成可稽核的機制

## 盤點清單（最小）

### A) 權限與身份（IAM）

- [ ] 誰是操作員（人/服務）？權限最小化怎麼做？
- [ ] 是否需要分環境（dev/staging/prod）與分帳號/分 workspace？
- [ ] 是否需要把「可用工具」做白名單（tool allowlist）？

### B) 帳務與成本（Billing）

- [ ] 走 AWS billing 的目的：統一帳務？客戶代付？成本拆帳？
- [ ] 成本歸屬：按「客戶/專案/工作流」切帳的方式
- [ ] 成本觀測：至少能記錄 run 次數、耗時、輸出量（有 token 更好）

### C) 資料與證據（Artifacts）

- [ ] 哪些資料允許上雲？哪些只能留本地？
- [ ] 產出物與中間產物（logs/artifacts）放哪裡？保留多久？
- [ ] 原始證據（逐字稿/原始檔/決策紀錄）是否能做到 append-only？

### D) 工具與沙箱（Tool use / Code execution）

- [ ] 需要哪些工具能力？（讀檔、跑腳本、抓資料、寫檔、上傳）
- [ ] 危險工具有哪些？（對外發送、金流、刪除、廣告預算相關）如何硬隔離？
- [ ] 若 agent 失控/卡死，如何中止與回滾？（kill switch / runbook）

### E) 稽核與風控（Audit）

- [ ] 是否能保存「每次 run 的輸入來源、工具呼叫、產出摘要」？
- [ ] 敏感資訊防洩漏：日誌/記憶/輸出文件不得包含金鑰、webhook、token
- [ ] 需要提姆先生批准的範圍：任何對外發布、金流、廣告預算、取消訂閱、核心系統規則

## 待確認（需要提姆先生決策）

- 雲端常駐 agent 的第一個試點流程要選哪一條？（低風險、可回退）
- 我們要以「客戶」還是以「工作流」作為 IAM/帳務的切分主軸？

