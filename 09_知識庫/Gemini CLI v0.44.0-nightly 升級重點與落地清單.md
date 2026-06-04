# Gemini CLI v0.44.0-nightly 升級重點與落地清單

用途：把 Gemini CLI v0.44.0-nightly（2026-05-15）的 MCP、Proxy、Sandbox、RAG debug 更新，轉成 Ewalk.ai 可回歸的檢查項目。

來源（官方 GitHub releases）：https://github.com/google-gemini/gemini-cli/releases

> 參考日期：2026-05-18（對應 v0.44.0-nightly.20260515）

---

## 可吸收重點（轉成我們的用法）

### 1) MCP Proxy / NO_PROXY 行為要納入回歸

可落地的好處：

- 如果未來 Ewalk.ai 把內部素材庫、知識庫或報表資料接成 MCP server，代理設定錯誤會讓工具「看似可用，實際連錯地方」。
- `NO_PROXY` 正常生效，能降低內部服務被誤送到外部代理的風險。

落地規範（建議）：

- 有 network-based MCP server 時，升級後必記錄 proxy 相關環境變數。
- 代理/非代理各跑一次最小檢查；若環境沒有 proxy，標記「不適用」即可。

### 2) RAG snippets log 可讓檢索品質可稽核

可落地的好處：

- 月報、會議整理、素材歸檔最怕「模型引用錯資料但看不出來」。
- snippets 進 log 後，阿順可以追溯：這次回答到底是從哪些片段推導出來。

落地規範（建議）：

- 先只用內部測試資料驗證；若資料可能含客戶敏感資訊，不把 log 直接外傳或貼進公開系統。
- 交付前保留「檢索片段摘要」即可，不必把完整 snippets 塞進報告。

### 3) Sandbox / 檔案錯誤要看是否能優雅失敗

可落地的好處：

- 長文件、素材資料夾、批次檔案最常出現 permission denied、EISDIR、路徑不存在。
- 升級回歸應驗證錯誤是否能被看懂與重試，而不是讓任務卡死。

落地規範（建議）：

- 用 3 種路徑測試：正常檔案、資料夾路徑、不存在路徑。
- 如果錯誤訊息無法讓操作者判斷下一步，先不要把該版本放進主力流程。

---

## 建議升級與驗收方式（不改規則版）

- 依 SOP 跑最小回歸：[[../13_SOP流程/Gemini CLI 安裝與最小回歸驗證SOP|Gemini CLI 安裝與最小回歸驗證 SOP]]

---

## 待提姆確認

- Gemini CLI 是否要進入「可用但需回歸」工具清單（先不設為主力工具）？
- RAG snippets log 是否允許用在內部測試資料；客戶資料需另行確認資料保護規則。

