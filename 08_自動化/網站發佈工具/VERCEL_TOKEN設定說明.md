# VERCEL_TOKEN 設定說明

## 用途

讓 `deploy-site-preview.command` 可以穩定部署 Vercel Preview，不再依賴會過期的本機 OAuth 登入。

Vercel 官方支援兩種 CLI token 用法：

- `vercel deploy --token <token>`
- 設定環境變數 `VERCEL_TOKEN`

## 建議做法

使用設定腳本：

```bash
./設定VercelToken.command
```

或手動在工作區根目錄的 `.env.local` 加上：

在工作區根目錄的 `.env.local` 加上：

```text
VERCEL_TOKEN=你的_Vercel_Token
```

`.env.local` 已在根目錄 `.gitignore`，不會進入版本控管。

## 權限原則

- Preview 發佈可以走 `deploy-site-preview.command`。
- Production 發佈仍需提姆先生明確批准。
- Token 不要貼進 Obsidian 文件、README、Prompt 或網站前端。

## 後續升級

更完整的免手動發佈方式是 GitHub + Vercel Git Integration：

1. 把 `sites/` 內正式專案推到 GitHub。
2. Vercel 綁定 GitHub repo。
3. push 分支自動產生 Preview。
4. merge main 自動發佈正式站。

這會比本機 CLI 更穩定，也更符合團隊協作。
