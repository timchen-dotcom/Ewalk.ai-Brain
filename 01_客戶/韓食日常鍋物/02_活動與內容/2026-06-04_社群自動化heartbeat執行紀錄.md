# 2026-06-04｜韓食日常鍋物社群自動化 heartbeat 執行紀錄

執行時間：2026-06-04 10:00（Asia/Taipei）  
自動化 ID：automation-5  
主管：阿順

## 本次判斷

- Facebook：本地排程有多篇已完成視覺但尚未發布的貼文，最早未發布項目為 2026-05-22「韓式牛肉拌飯」。
- Instagram：2026-06-03「豬肉湯飯」已正式發布，IG Media ID 已回寫。
- 接下來 7 天內容：2026-06-05、2026-06-07 已有文案與 GPT Image 2 最終視覺；2026-06-09「海鮮豆腐湯」原狀態為待製作。

## API 檢查結果

- `check-page.mjs`：失敗，回傳 `fetch failed`。
- `check-instagram.mjs`：失敗，回傳 `fetch failed`。
- 判斷：目前執行環境無法連線 Meta API，因此不得呼叫 Facebook 或 Instagram 正式發布工具。

## 本次已完成

- 新增 2026-06-09「海鮮豆腐湯」純 caption 檔。
- 新增 2026-06-09「海鮮豆腐湯」GPT Image 2 prompt 檔。
- 新增 2026-06-09「海鮮豆腐湯」草稿檔。
- 更新排程表狀態為：`文案與 GPT Image 2 指令完成，待 GPT Image 2 最終視覺`。
- 更新一週三更手動發文包，加入 6/9 補充項目。

## GPT Image 2 產圖狀態

- 已依規則呼叫：
  - prompt：`2026-06-09_GPTImage2_海鮮豆腐湯_prompt.txt`
  - 參考圖：`04_素材/產品圖/海鮮豆腐湯.png`
  - 預定輸出：`04_素材/Generated/2026-06-09_海鮮豆腐湯_GPTImage2.png`
- API 呼叫超過合理等待時間仍未回應。
- 未產出最終圖。
- 未使用產品原圖替代。

## 待處理

- [ ] 待可用網路 / API 連線恢復後，重新執行 Meta Page 檢查。
- [ ] 待可用網路 / API 連線恢復後，重新執行 GPT Image 2 產圖。
- [ ] 6/9 最終視覺完成後，另存 IGReady JPEG 並更新公開圖片 URL 清單。
- [ ] 若提姆先生批准 IG 正式同步，發布前仍需先執行 IG dry-run。
- [ ] Facebook 尚未發布項目需由自動發文工具依排程順序處理，不得跳篇。
