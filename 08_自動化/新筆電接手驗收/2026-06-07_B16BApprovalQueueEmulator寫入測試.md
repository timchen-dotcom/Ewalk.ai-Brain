---
類型: 權限逐步開放測試
階段: B16B
狀態: B16B-1 hotfix 已建立，待 Mac Studio 重跑
日期: 2026-06-07
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 自動化
  - Firebase
  - Command Center
  - Approval Queue
  - emulator
  - 權限測試
---

# 2026-06-07 B16B Approval Queue Emulator 寫入測試

## 一句話結論

B16B 是第一個「實際寫入」測試，但只寫 Mac Studio 本機 Firebase Emulator，不寫 production Firebase。

## B16B 目標

把 B15 的本機 Command Center dry-run approval queue 寫入 Firestore Emulator 的 `approvals` collection，並完成回查驗證。

預期寫入：

- approvals 共 6 筆。
- pending 共 5 筆。
- approved_but_not_executed 共 1 筆。

## 執行檔

```text
08_自動化/firebase/B16B寫入ApprovalQueue到FirebaseEmulator.command
```

## 執行方式

在 Mac Studio 的 `Ewalk.ai Brain` 中：

```zsh
cd "$HOME/Desktop/Ewalk.ai 自動化系統/Ewalk.ai Brain/08_自動化/firebase"
zsh "./B16B寫入ApprovalQueue到FirebaseEmulator.command"
```

也可以在 Finder 雙擊 `.command` 檔。

## 前置條件

- Firebase CLI 可用：`/opt/homebrew/bin/firebase`
- Node.js 可用。
- Java Runtime 可用。

若缺 Java，命令會停止並提示：

```text
BLOCKED：找不到 Java Runtime，Firestore Emulator 無法啟動。
```

此時不得改用 production Firebase。應先安裝 Java 或補工具鏈，再重跑 B16B。

## 安全防線

命令會依序執行：

1. 預檢 approvals queue，不寫入。
2. 用 `firebase emulators:exec --only firestore` 啟動本機 Firestore Emulator。
3. 在 emulator 環境內執行 approvals 寫入。
4. 寫入後逐筆回查。
5. emulator 自動關閉。

## 通過標準

B16B 通過需看到：

```text
wrote_to_emulator: 6
verified_from_emulator: 6
```

且沒有出現：

- production Firebase 寫入。
- Firestore rules 部署。
- 正式發文。
- 正式廣告上線。
- 正式客戶通道連接。
- 金流、帳務或付款設定操作。

## 目前狀態

Codex 主窗口已建立 B16B 命令與回查邏輯。

2026-06-07 第一次 Mac Studio 實跑失敗，原因不是 production Firebase 權限問題，而是兩個本機前置問題：

- Homebrew 已安裝 `openjdk`，但 macOS Java wrapper 仍找不到 JDK，導致 Firebase Emulator 的 `java -version` 失敗。
- 預檢讀到 `approval_count: 0`，不符合 B15 預期的 6 筆 approvals。

B16B-1 hotfix 已補上：

- `.command` 會自動設定 Homebrew OpenJDK 的 `JAVA_HOME` 與 `PATH`。
- `.command` 改用 `java -version` 做真檢查。
- 若 approval queue 為 0 筆，腳本會回覆 `B16B_BLOCKED_EMPTY_APPROVAL_QUEUE` 並中止，不進入 emulator 寫入。

## 下一步

- 提姆先生在 Mac Studio 執行 B16B command。
- 將輸出貼回 Codex 主窗口。
- 若 `wrote_to_emulator: 6` 與 `verified_from_emulator: 6` 都出現，回填 B16B 通過。
- 若仍顯示 Java 找不到，先執行 Homebrew 提示的 JDK symlink 後重跑。
- B17 才討論正式 Firestore approvals 寫入預覽；仍不等於正式寫入。

## 關聯文件

- [[2026-06-07_B16FirebaseEmulatorStaging寫入前防線]]
- [[2026-06-07_B15CommandCenter本機DryRunQueue寫入]]
