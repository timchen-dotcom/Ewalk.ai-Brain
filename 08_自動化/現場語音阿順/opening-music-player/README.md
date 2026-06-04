# 活動開場音樂播放器

## 用途

給 2026-05-20 STAR Color 創業大會活動開始前使用。畫面使用活動場景圖作為背景，中間播放循環動畫，下方保留小型音樂控制列。音樂可播放多首 Suno 歌曲，支援順播、清單循環、單曲循環與字幕顯示。

## 現場使用

1. 開啟 `index.html` 或用本機伺服器開啟播放器。
2. 按「匯入歌曲」選擇 Suno 音樂檔，或直接把歌曲拖進畫面。
3. 按「匯入字幕」選擇 `.lrc`、`.vtt` 或 `.txt` 字幕檔。
4. 選擇播放模式：順播、清單循環、單曲循環。
5. 按「全螢幕」後接投影或大螢幕。

字幕若比歌聲快，按「字幕 -1s」讓字幕延後；字幕若比歌聲慢，按「字幕 +1s」讓字幕提前。

## 固定播放清單設定

把音樂檔放進：

```text
audio/
```

把字幕檔放進：

```text
lyrics/
```

然後編輯 `playlist.js`：

```js
window.EVENT_PLAYLIST = [
  {
    title: "歌曲名稱",
    artist: "Ewalk.ai / Suno",
    src: "./audio/song-01.mp3",
    lyrics: "./lyrics/song-01.lrc"
  }
];
```

## 字幕格式

建議使用 LRC：

```text
[00:00.00]第一句歌詞
[00:05.20]第二句歌詞
[00:11.80]第三句歌詞
```

也可使用 WebVTT。匯入字幕時，檔名要盡量和歌曲檔名一致，播放器會用檔名配對。

## Whisper 對字幕

《褪色配方》與《剪髮漫長流浪》已使用 OpenAI Whisper 產生時間碼，再套回正式歌詞。之後若更換歌曲，可執行：

```bash
node scripts/generate-whisper-lrc.mjs --slug "歌曲檔名" --audio "audio/歌曲檔名.mp3" --prompt "歌曲辨識提示詞"
```

產生的原始 Whisper 結果會放在 `lyrics/*.whisper.json` 與 `lyrics/*.whisper.lrc`，正式上場字幕仍以 `playlist.js` 指向的 `.lrc` 為準。

## 檔案說明

- `index.html`：播放器頁面
- `styles.css`：現場大螢幕樣式
- `app.js`：播放、切歌、循環、字幕邏輯
- `playlist.js`：固定播放清單
- `scripts/generate-whisper-lrc.mjs`：OpenAI Whisper 字幕時間碼產生工具
- `assets/stage-background.png`：活動場景背景圖
- `assets/opening-loop.mp4`：中間循環動畫影片
- `audio/`：放 Suno 歌曲
- `lyrics/`：放字幕檔

## 待補資料

- [ ] 放入正式 Suno 歌曲檔
- [ ] 補上每首歌的正式字幕
- [ ] 現場彩排時確認投影比例、音量與音響輸出
