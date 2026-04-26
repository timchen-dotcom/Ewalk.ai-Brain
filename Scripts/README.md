# Scripts

這裡放 Vault 的同步工具。

## sync-to-github.sh

用途：把 Obsidian Vault 的變更提交到 Git，並推送到 GitHub。

使用前請先設定 GitHub 遠端：

```sh
git remote add origin https://github.com/你的帳號/你的repo.git
```

手動同步：

```sh
./Scripts/sync-to-github.sh
```

如果要自動同步，可以用 macOS 排程工具定時執行這支腳本。

