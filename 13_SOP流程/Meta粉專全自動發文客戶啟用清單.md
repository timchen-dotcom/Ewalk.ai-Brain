# Meta 粉專全自動發文客戶啟用清單

建立日期：2026-06-02  
建立人：阿順  
樣板來源：韓食日常鍋物  
狀態：已建立，可套用到新客戶

## 用途

只要有客戶要開始自動化發 Facebook 粉專內容，就用這份清單判斷是否能進入：

```text
Stage 1：內容與視覺自動化，發布人工確認
Stage 2：Meta System User token 完成，低風險內容自動發布
Stage 3：規則內全自動內容生產、發佈與成效歸檔
```

韓食日常鍋物已完成 Stage 2 驗證：System User token、Page token、圖片貼文發布、排程回寫與成效追蹤建檔皆成功。

## 一、客戶准入條件

導入前先確認：

- [ ] 客戶有 Facebook 粉絲專頁
- [ ] 粉專可被 Meta Business Portfolio 管理
- [ ] Ewalk.ai 或客戶授權帳號有足夠管理權限
- [ ] 客戶同意固定內容頻率，例如一週三更、每兩天一篇
- [ ] 客戶有品牌資料、素材或可由 GPT Image 2 生成最終視覺
- [ ] 客戶接受發布後由成效追蹤員建檔
- [ ] 若要同步 IG，IG 已是專業 / 商業帳號並連結 Facebook Page

不適合立即全自動：

- 權限不完整
- 活動條款常變動
- 內容高度敏感或需法務審核
- 客戶尚未確認品牌語氣與禁用語
- 沒有穩定素材來源

## 二、Meta 權限設定

每個客戶建立正式自動發布前，要完成：

- [ ] Meta Business Portfolio 已確認
- [ ] Facebook Page 已確認 Page ID
- [ ] Meta App 已建立或已選定
- [ ] System User 已建立
- [ ] System User 已取得粉專完整控制權
- [ ] System User 已取得 App 權限
- [ ] token 到期時間選擇長期或永不到期
- [ ] token 權限至少包含：
  - `pages_show_list`
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `read_insights`
  - 必要時加 `business_management`

安全原則：

- token 不得寫入 Obsidian、聊天、截圖、公開 repo
- token 只能寫入本機安全 env 或後端密鑰管理
- Graph API Explorer token 只能測試，不可作為正式自動化

## 三、客戶資料夾建置

客戶資料夾至少要有：

```text
Ewalk.ai Brain/01_客戶/{客戶名稱}/
  01_品牌資料/
  02_活動與內容/
  04_素材/
    產品圖/
    Generated/
```

必備文件：

- [ ] 社群排程表
- [ ] Meta 自動發文佇列
- [ ] caption 純文案檔
- [ ] GPT Image 2 prompt 檔
- [ ] GPT Image 2 最終圖
- [ ] 客戶 Meta 憑證升級紀錄

建議命名：

```text
{日期}_FB貼文_{主題}_caption.md
{日期}_FB貼文_{主題}_草稿.md
{日期}_GPTImage2_{主題}_prompt.txt
04_素材/Generated/{日期}_{主題}_GPTImage2.png
```

## 四、內容與視覺規格

每篇貼文必須具備：

- [ ] 排程日期
- [ ] 主題
- [ ] 品牌訊息
- [ ] CTA
- [ ] 純 caption 檔
- [ ] GPT Image 2 prompt 檔
- [ ] GPT Image 2 最終圖

禁止：

- 用草稿檔當正式 message-file
- 發布含內部檢查、GPT Image 2 指令、製作紀錄的文案
- 用產品原圖直接當最終社群視覺
- 發布未確認價格、期限或優惠條件

## 五、發布前檢查

正式發布前必做：

- [ ] `check-page.mjs` 可讀取目標粉專
- [ ] 發布器 dry-run 通過
- [ ] dry-run 抓到正確日期與主題
- [ ] Page ID 與客戶粉專一致
- [ ] caption 是純文案
- [ ] 圖片是 GPT Image 2 最終圖
- [ ] 若 FB / IG 共用，圖片尺寸是 1080x1350（4:5）
- [ ] 若同步 IG，圖片已有公開 URL 與 JPEG 發布版本
- [ ] 低風險內容已納入自動發布規則
- [ ] 高風險內容已有提姆先生批准

## 六、發布後回寫

正式發布成功後必做：

- [ ] 回寫排程表狀態
- [ ] 寫入 Meta Photo ID
- [ ] 寫入 Meta Post ID
- [ ] 寫入貼文連結
- [ ] 追加 `Meta自動發文佇列.md`
- [ ] 成效追蹤總表建檔
- [ ] 下一篇 dry-run 不會抓到已發布內容

## 七、成效追蹤建檔

發布後交成效追蹤員建立：

```yaml
客戶:
平台: Facebook
類型:
自動化來源: Meta System User 自動排程發布器
排程日期:
實際發布時間:
文案檔案:
素材檔案:
Meta Photo ID:
Meta Post ID:
貼文連結:
追蹤狀態: 已建檔
追蹤節點: 1 小時、24 小時、72 小時、7 天
資料來源: Meta Graph API
待補權限: read_insights 成效讀取確認
交接對象: 數據分析師
```

## 八、客戶導入狀態表

| 客戶 | 導入狀態 | Meta 權限 | 內容排程 | GPT Image 2 視覺 | 發布工具 | 成效追蹤 | 備註 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 韓食日常鍋物 | Stage 2 已完成 | 已完成 | 已建立 | 已建立 | 已發布成功 | 已建檔 | 第一個樣板客戶 |

## 九、阿順判斷原則

可以先進 Stage 1：

- 客戶內容穩定，但 Meta token 尚未完成
- 可先累積文案、prompt、GPT Image 2 圖與發文包

可以進 Stage 2：

- System User token 完成
- `check-page.mjs` 成功
- 第一篇低風險內容 dry-run 成功
- 提姆先生已批准該客戶自動發布規則

暫停自動發布：

- token 失效或權限異常
- 客戶臨時更改活動條款
- 發文失敗但原因未明
- 出現品牌、法規或客訴風險
