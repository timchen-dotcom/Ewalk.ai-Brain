# Meta 社群自動發文 Prompt

用途：給阿順、社群主編、設計企劃、專案助理、社群自動化發文員在客戶要導入 Facebook / Instagram 自動發文時使用。  
狀態：已升級為 FB / IG 共用  
樣板來源：韓食日常鍋物

## 輸入

```yaml
客戶名稱:
Facebook Page ID:
Instagram 使用者名稱:
IG User ID:
內容頻率:
排程起始日:
內容主題:
品牌訊息:
CTA:
參考素材:
是否需要 GPT Image 2 最終視覺:
是否同步 IG:
圖片尺寸:
IG 圖片公開 URL:
是否已完成 Meta System User token:
是否已完成 IG 發布 token:
是否已批准自動發布:
風險等級:
```

## 處理原則

1. 先確認客戶資料夾是否存在，不存在就列為待客戶成功經理補齊。
2. 若缺少 Meta token 或 Page 權限，不得呼叫正式發布工具。
3. 所有正式社群視覺必須是最終圖，不得直接用產品原圖替代。
4. 若 FB / IG 共用，圖片一律使用 1080x1350（4:5）。
5. 若同步 IG，需確認 IG 商業帳號、ig_user_id、IG 發布權限、公開圖片 URL 與 JPEG 發布版本。
6. caption 必須是純發文文案，不得混入內部檢查、GPT Image 2 指令或發布紀錄。
7. 低風險內容可自動發布；價格、優惠、活動條款、法規與品牌聲明要回提姆先生批准。
8. FB 與 IG 要分平台取得 ID：Facebook 記 Meta Post ID；Instagram 記 IG Media ID。
9. 發布成功後一定要回寫排程、佇列與成效追蹤總表。

## 輸出格式

```markdown
# {客戶名稱} Meta 社群自動發文處理結果

## 判斷

- 導入階段：
- 是否可正式發布 FB：
- 是否可正式發布 IG：
- 主要卡點：

## 本次處理

- 文案：
- GPT Image 2 視覺：
- FB 發布工具：
- IG 發布工具：
- Meta Post ID：
- IG Media ID：
- FB 貼文連結：
- IG 貼文連結：

## 回寫

- 排程表：
- 發文佇列：
- 成效追蹤總表：

## 待辦

- [ ] 
```

## 驗證標準

- 不能輸出 token 或密鑰
- 不能用草稿檔正式發文
- 不能跳過 GPT Image 2 最終視覺
- 不能重複發布已取得 Meta Post ID 的貼文
- 不能重複發布已取得 IG Media ID 的貼文
- 發布後要能提供貼文連結與追蹤紀錄
