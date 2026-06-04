# Ewalk.ai 客戶匯入路線圖

建立日期：2026-05-23  
負責角色：阿順  
最終決策者：提姆先生  
狀態：本報告為客戶名冊掃描結果；正式寫入狀態以 Command Center Live Read 與 client-import-roadmap.md 為準

## 目的

韓食日常鍋物只是第一個樣板客戶。接下來要把 Command Center 變成 Ewalk.ai 全公司營運系統，先把 `01_客戶` 裡的客戶整理成統一名冊，再逐步匯入正式資料庫。

## 目前掃描結果

- 客戶資料夾總數：17
- 可直接作為內容佇列樣板：1
- 有客戶總覽與內容資料：7
- 有基本客戶資料：9
- 需先整理：0
- 空資料夾：0

## 匯入原則

- 第一階段只匯入客戶名冊，不匯入任務、不發文、不改預算。
- 第二階段才把有 `Meta自動發文佇列.md` 的客戶轉成 `content_queue`。
- 第三階段才建立成效追蹤、批准佇列與跨部門分工。
- 正式寫入 Firestore 前，必須由提姆先生批准。

## 客戶清單

| 客戶 | 產業 | 狀態 | 匯入分級 | 下一步 |
| --- | --- | --- | --- | --- |
| 大美好學院 | 教育 / 美業學院 | 待確認 | ready_profile | 先匯入客戶名冊，不匯入任務 |
| 中古車補教名師-霖老師 | 中古車 / 個人品牌 | 待確認 | ready_profile | 先匯入客戶名冊，不匯入任務 |
| 幻色鏡方美業控股集團 | 教育 / 美業學院 | 待確認 | ready_profile | 先匯入客戶名冊，不匯入任務 |
| 幻策數位行銷整合股份有限公司 | 待分類 | 待確認 | ready_profile | 先匯入客戶名冊，不匯入任務 |
| 正官庄高麗蔘 | 保健食品 / 法規稽核 | 提案中 | ready_profile | 先匯入客戶名冊，不匯入任務 |
| 嘉昱隔熱膜 - 客戶檔案 | 教育 / 美業學院 | 執行中 | ready_profile_and_content | 先建立客戶基本資料，再補內容佇列欄位 |
| 歐卡 OC HAIR VOGUE | 美業 / 髮廊 | 待確認 | ready_profile_and_content | 先建立客戶基本資料，再補內容佇列欄位 |
| 髮染快染專門 | 教育 / 美業學院 | 待確認 | ready_profile | 先匯入客戶名冊，不匯入任務 |
| 韓食日常鍋物 | 餐飲 | 待確認 | ready_content_queue | 可作為正式匯入樣板，先由提姆先生審核 |
| Fanatic F6 | 美業 / 髮廊 | 待確認 | ready_profile | 先匯入客戶名冊，不匯入任務 |
| Inebrya | 美業 / 髮廊 | 待確認 | ready_profile | 先匯入客戶名冊，不匯入任務 |
| KaDou 卡豆髮藝 | 美業 / 髮廊 | 待確認 | ready_profile_and_content | 先建立客戶基本資料，再補內容佇列欄位 |
| S.Color 芯 STAR Color | 美業 / 髮廊 | 待確認 | ready_profile_and_content | 先建立客戶基本資料，再補內容佇列欄位 |
| STAR SPA | 美業 / 髮廊 | 待確認 | ready_profile_and_content | 先建立客戶基本資料，再補內容佇列欄位 |
| TG hair salon | 美業 / 髮廊 | 待確認 | ready_profile_and_content | 先建立客戶基本資料，再補內容佇列欄位 |
| The Vision Hair Salon | 美業 / 髮廊 | 待確認 | ready_profile_and_content | 先建立客戶基本資料，再補內容佇列欄位 |
| TheDay 那日美學 | 待分類 | 待確認 | ready_profile | 先匯入客戶名冊，不匯入任務 |

## 下一步

1. 提姆先生確認客戶名冊與分類。
2. 阿順建立正式 `clients` 匯入包。
3. 提姆先生批准後，才正式寫入 Firestore。
4. 寫入後 Command Center 從「韓食樣板」升級成「Ewalk.ai 全客戶系統」。
