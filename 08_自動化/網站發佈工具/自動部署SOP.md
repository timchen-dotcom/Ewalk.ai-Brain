# 網站自動部署 SOP

## 用途

讓 Ewalk.ai 的低風險網站工具與 Demo 可以自動部署 Preview，減少每次人工批准與手動輸入部署指令。

## 核心規則

- 可部署檔案一律放在 `sites/`。
- 自動部署設定一律寫在 `sites/deploy.config.json`。
- 自動部署只做 Preview，不做 Production。
- 只有 `risk: "low"` 且 `autoDeployPreview: true` 的站台會被自動部署。
- 正式 Production 一律保留人工批准。

## 目前指令

列出可自動部署站台：

```bash
./auto-deploy-sites.command --list
```

檢查會部署哪些站台，但不真的部署：

```bash
./auto-deploy-sites.command --dry-run
```

部署所有有變更的低風險 Preview：

```bash
./auto-deploy-sites.command
```

強制部署所有低風險 Preview：

```bash
./auto-deploy-sites.command --all
```

安裝成 macOS 背景自動檢查，每 5 分鐘跑一次：

```bash
./安裝網站自動部署.command
```

解除背景自動檢查：

```bash
./解除網站自動部署.command
```

## 新增一個可自動部署站台

1. 在 `sites/` 建立專案資料夾。
2. 確認專案有 `index.html` 或 `package.json`。
3. 加入 `vercel.json`。
4. 在 `sites/deploy.config.json` 新增：

```json
{
  "key": "ewalk-tools/example-tool",
  "name": "工具名稱",
  "type": "ewalk-tool",
  "risk": "low",
  "autoDeployPreview": true,
  "autoDeployProduction": false,
  "productionRequiresApproval": true
}
```

5. 先跑：

```bash
./auto-deploy-sites.command --dry-run
```

6. 確認無誤後，交給自動部署。

## 必要憑證

自動部署需要 Vercel Token。根目錄 `.env.local` 需有：

```text
VERCEL_TOKEN=你的_Vercel_Token
```

可用以下腳本安全寫入：

```bash
./設定VercelToken.command
```

沒有 token 時，系統會快速停止，不會再無聲卡住。

## 風險分級

可以設為 low：

- 內部工具 Preview
- 靜態提案 Demo
- 無個資、無金流、無正式網域、無高風險聲明的測試頁

不可自動 Preview，需人工檢查：

- 客戶正式官網
- 有價格、優惠、療效、車況、財務、法律或合約承諾
- 有登入、會員資料、API key、金流或正式網域

## 長期最佳方案

本機自動部署可解決短期速度問題；長期應升級為 GitHub + Vercel Git Integration：

- push 自動產生 Preview。
- merge main 自動部署 Production。
- Vercel Dashboard 可追蹤每次部署來源。
- 團隊成員不需要共用本機 token。

## Codex 執行環境備註

2026-06-03 測試時，Codex sandbox 內的 Vercel CLI 會卡住，Node 子程序呼叫 curl 也會 DNS 失敗；已改用直接 curl + Vercel REST API 成功部署。

目前公開站：

```text
https://ewalk-tools-google-review-helper.vercel.app
```
