---
類型: Mac Studio 低風險上工交接
客戶: 韓食日常鍋物
階段: B8D-9
狀態: 已建立
日期: 2026-06-06
負責角色: 阿順
最終決策者: 提姆先生
標籤:
  - 客戶
  - 韓食日常鍋物
  - MacStudio
  - 低風險上工
  - B8D
---

# 韓食日常鍋物 B8D-9 Mac Studio 低風險上工交接

## 一句話結論

B8D-8 已完成海鮮豆腐湯正式 LOGO 修正版；Mac Studio 拉回 GitHub 後，可以直接進入低風險內容製作，優先接 2026-06-11「泡菜烏龍麵」，不用再增加等待觀察關卡。

## Mac Studio 拉回指令

```bash
cd "$HOME/Ewalk.ai Brain"
git pull
ls -lh "01_客戶/韓食日常鍋物/04_素材/Generated/IGReady/2026-06-09_海鮮豆腐湯_image2深化_logo修正版_1080x1350.jpg"
```

## 拉回後應確認

- [ ] 可看到 B8D-8 文件：`01_客戶/韓食日常鍋物/2026-06-06_韓食日常鍋物_B8D-8海鮮豆腐湯Logo修正版.md`
- [ ] 可看到正式 LOGO：`01_客戶/韓食日常鍋物/04_素材/品牌識別/韓食日常鍋物LOGO.jpg`
- [ ] 可看到 Logo 修正版 PNG：`01_客戶/韓食日常鍋物/04_素材/Generated/2026-06-09_海鮮豆腐湯_image2深化_logo修正版.png`
- [ ] 可看到 Logo 修正版 IGReady JPEG：`01_客戶/韓食日常鍋物/04_素材/Generated/IGReady/2026-06-09_海鮮豆腐湯_image2深化_logo修正版_1080x1350.jpg`

## Mac Studio 下一個低風險任務

優先任務：建立 2026-06-11「泡菜烏龍麵」內容製作包。

允許範圍：

- 建立純文案草稿。
- 建立 Codex 內建 image2.0 視覺深化指令。
- 建立人工審核稿。
- 更新內容佇列與每日工作。
- 不自動發布、不排程、不呼叫 Meta / Instagram API。

## 快線標準

低風險內容製作只需要四個檢查：

- 視覺 QA 通過。
- 文件與素材入庫。
- GitHub push 完成。
- Mac Studio pull 回最新狀態。

四項完成即可進下一個低風險內容任務；正式發布、排程、廣告、Firebase 寫入與金流仍維持提姆先生批准制。

## 需要提姆先生批准

- APPROVAL：2026-06-09 海鮮豆腐湯正式發布或排程。
- APPROVAL：2026-06-11 泡菜烏龍麵正式發布或排程。
- APPROVAL：任何 Meta / Instagram API 呼叫。
- APPROVAL：任何廣告草稿、啟用或預算調整。
- APPROVAL：任何 Firebase / Firestore 寫入。

## 禁止事項

- BLOCKED：不把 Mac Studio 拉回視為正式發布批准。
- BLOCKED：不自動發文、不自動排程。
- BLOCKED：不使用廣告預算。
- BLOCKED：不寫 Firebase / Firestore。
- BLOCKED：不接正式客戶通道。

## B8D-10 建議

下一步建立 B8D-10「2026-06-11 泡菜烏龍麵內容製作包」，包含純文案、image2.0 指令、素材路徑與人工審核欄位。
