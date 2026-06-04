# 腳本

這裡放 Vault 的同步工具。

## 同步到GitHub.sh

用途：把 Obsidian Vault 的變更提交到 Git，並推送到 GitHub。

使用前請先設定 GitHub 遠端：

```sh
git remote add origin https://github.com/你的帳號/你的repo.git
```

手動同步：

```sh
./腳本/同步到GitHub.sh
```

如果要自動同步，可以用 macOS 排程工具定時執行這支腳本。

## meta-facebook

用途：Meta / Facebook Page 自動發文測試工具。

目前樣板客戶：韓食日常鍋物。

安全規則：

- token 只放本機 `.env.local` 或正式後端環境變數。
- 預設只做 dry-run，不會真的發文。
- 正式發文前必須由提姆先生批准。

說明文件：[[meta-facebook/README|Meta Facebook 發文工具]]
