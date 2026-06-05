# Mac Studio 稽核報告暫存區

用途：暫時放 Mac Studio 原機只讀稽核輸出的 `mac-studio-pre-reset-audit-*` 報告資料夾。

## 規則

- 報告資料夾不進 Git。
- 阿順只讀取報告內容並回填檢查表。
- 若報告列出 token、secret、API key 候選路徑，只記錄路徑與處理方式，不貼內容。

## 放置方式

在 Mac Studio 原機上執行：

```bash
mkdir -p "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/新筆電接手驗收/reports"
cp -R "$HOME/Desktop"/mac-studio-pre-reset-audit-* "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/新筆電接手驗收/reports/"
```

放好後，等新筆電同步到這個資料夾，阿順就可以判讀。
