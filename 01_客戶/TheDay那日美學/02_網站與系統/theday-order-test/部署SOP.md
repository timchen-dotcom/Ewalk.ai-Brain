# TheDay 訂購系統穩健部署 SOP

## 用途

讓 TheDay 訂購系統不要依賴本機 Vercel CLI 臨時上傳，改成可重複、可檢查、可回滾的部署流程。

## 首選流程：GitHub 連動 Vercel

1. 在 GitHub 建立 repo：`theday-order-test`
2. 將本資料夾內容推到 `main` 分支。
3. 到 Vercel 匯入 GitHub repo。
4. Vercel 專案設定：
   - Framework Preset：Other
   - Build Command：留空
   - Output Directory：留空
   - Install Command：留空或 `npm install`
   - Production Branch：`main`
5. 之後每次更新品項或功能，只要推到 GitHub，Vercel 會自動部署。
6. 部署後開啟 `https://theday-order-test.vercel.app/` 檢查登入畫面是否出現「已匯入 TheDay 品項、人員與分店資料」。

## 本機更新檢查

每次更新後先執行：

```bash
npm run verify
```

若本機沒有 `npm`，可以直接執行：

```bash
node scripts/verify.mjs
```

檢查項目：

- `app.js` 語法
- 首頁是否載入 `seed-data.js`
- 分店數是否為 5
- 人員數是否為 31
- 品項數是否為 359
- 品牌 / 系列數是否為 14
- 價格欄是否仍標註待補
- Vercel 是否維持 noindex

## CLI 卡住時的備援

若 `vercel deploy` 卡住，改用：

```bash
VERCEL_TOKEN=你的_token npm run deploy:api
```

這支腳本直接呼叫 Vercel API，並有重試機制。若本機 DNS 或網路完全不通，仍會失敗；此時應改走 GitHub 自動部署或換網路。

## 外出提案前檢查

1. 開無痕視窗或手機網路開啟公開網址。
2. 確認分店選單有：太一、烏日、甲一、甲二、苑裡。
3. 確認分店登入後可選叫貨人員。
4. 下 1 筆測試訂單。
5. 用管理者登入確認訂單彙總與明細有人員欄位。

## 正式版下一步

目前公開版仍是展示用 localStorage 架構。若要讓各分店真實共用訂單資料，下一階段應升級：

- Firebase Auth：分店與管理者登入
- Firestore：訂單、品項、分店、人員資料庫
- 管理者後台：價格維護、品項上下架、匯出採購表
- 權限：分店只能看自己的訂單，管理者看全部
