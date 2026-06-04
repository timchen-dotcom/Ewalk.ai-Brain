const audio = document.querySelector("#audioPlayer");
const backgroundVideo = document.querySelector(".background-video");
const stage = document.querySelector(".stage");
const titleEl = document.querySelector("#trackTitle");
const metaEl = document.querySelector("#trackMeta");
const playlistEl = document.querySelector("#playlist");
const trackCountEl = document.querySelector("#trackCount");
const playBtn = document.querySelector("#playBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const seekBar = document.querySelector("#seekBar");
const currentTimeEl = document.querySelector("#currentTime");
const durationEl = document.querySelector("#duration");
const lyricPreviousEl = document.querySelector("#lyricPrevious");
const lyricCurrentEl = document.querySelector("#lyricCurrent");
const lyricNextEl = document.querySelector("#lyricNext");
const audioPicker = document.querySelector("#audioPicker");
const lyricsPicker = document.querySelector("#lyricsPicker");
const fullscreenBtn = document.querySelector("#fullscreenBtn");
const lyricBackBtn = document.querySelector("#lyricBackBtn");
const lyricForwardBtn = document.querySelector("#lyricForwardBtn");
const modeButtons = [...document.querySelectorAll(".mode-btn")];

let tracks = normalizePlaylist(window.EVENT_PLAYLIST || []);
let currentIndex = 0;
let mode = "sequence";
let lyricsCache = new Map();
let objectUrls = [];
let isSeeking = false;
let lyricOffset = Number(localStorage.getItem("openingPlayerLyricOffset") || "0");

function normalizePlaylist(items) {
  return items.map((item, index) => ({
    id: item.id || `track-${index + 1}`,
    title: item.title || `歌曲 ${index + 1}`,
    artist: item.artist || "Suno",
    src: item.src,
    lyrics: item.lyrics || "",
    lyricsText: item.lyricsText || "",
    cues: []
  }));
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  trackCountEl.textContent = String(tracks.length);

  tracks.forEach((track, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === currentIndex ? "active" : "";
    button.dataset.index = String(index);
    button.innerHTML = `
      <span class="playlist-index">${String(index + 1).padStart(2, "0")}</span>
      <span>
        <span class="playlist-title">${escapeHtml(track.title)}</span>
        <span class="playlist-artist">${escapeHtml(track.artist)}</span>
      </span>
    `;
    button.addEventListener("click", () => loadTrack(index, true));
    item.append(button);
    playlistEl.append(item);
  });
}

async function loadTrack(index, shouldPlay = false) {
  if (!tracks.length) {
    setEmptyState();
    return;
  }

  currentIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentIndex];
  titleEl.textContent = track.title;
  metaEl.textContent = track.artist;
  audio.src = track.src;
  seekBar.value = "0";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  setLyrics([], 0);
  renderPlaylist();

  try {
    track.cues = await loadLyrics(track);
    setLyrics(track.cues, 0);
  } catch {
    track.cues = [];
    setLyrics([], 0);
  }

  if (shouldPlay) {
    await playAudio();
  }
}

async function loadLyrics(track) {
  if (track.lyricsText) {
    return parseLyrics(track.lyricsText);
  }

  if (!track.lyrics) {
    return [];
  }

  if (lyricsCache.has(track.lyrics)) {
    return lyricsCache.get(track.lyrics);
  }

  const response = await fetch(track.lyrics);
  if (!response.ok) {
    return [];
  }
  const cues = parseLyrics(await response.text());
  lyricsCache.set(track.lyrics, cues);
  return cues;
}

function parseLyrics(text) {
  const normalized = text.replace(/\r/g, "");

  if (/WEBVTT/i.test(normalized)) {
    return parseVtt(normalized);
  }

  return normalized
    .split("\n")
    .flatMap((line) => {
      const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
      const words = line.replace(/\[[^\]]+\]/g, "").trim();
      if (!matches.length || !words) return [];
      return matches.map((match) => ({
        time: Number(match[1]) * 60 + Number(match[2]) + Number((match[3] || "0").padEnd(3, "0")) / 1000,
        text: words
      }));
    })
    .sort((a, b) => a.time - b.time);
}

function parseVtt(text) {
  return text
    .split("\n\n")
    .flatMap((block) => {
      const lines = block.split("\n").filter(Boolean);
      const timeLine = lines.find((line) => line.includes("-->"));
      if (!timeLine) return [];
      const [start] = timeLine.split("-->");
      const cueText = lines.slice(lines.indexOf(timeLine) + 1).join(" ").trim();
      if (!cueText) return [];
      return [{ time: parseTimestamp(start.trim()), text: cueText }];
    })
    .filter((cue) => Number.isFinite(cue.time))
    .sort((a, b) => a.time - b.time);
}

function parseTimestamp(value) {
  const parts = value.replace(",", ".").split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number.NaN;
}

function setLyrics(cues, time) {
  if (!cues.length) {
    lyricPreviousEl.textContent = "";
    lyricCurrentEl.textContent = "字幕待補";
    lyricNextEl.textContent = "";
    return;
  }

  const adjustedTime = time + lyricOffset;
  const activeIndex = Math.max(0, cues.findIndex((cue, index) => {
    const next = cues[index + 1];
    return adjustedTime >= cue.time && (!next || adjustedTime < next.time);
  }));

  lyricPreviousEl.textContent = cues[activeIndex - 1]?.text || "";
  lyricCurrentEl.textContent = cues[activeIndex]?.text || cues[0].text;
  lyricNextEl.textContent = cues[activeIndex + 1]?.text || "";
}

async function playAudio() {
  if (!tracks.length) return;
  try {
    await audio.play();
    playBtn.textContent = "Pause";
    playBtn.setAttribute("aria-label", "暫停");
  } catch {
    playBtn.textContent = "Play";
  }
}

function pauseAudio() {
  audio.pause();
  playBtn.textContent = "Play";
  playBtn.setAttribute("aria-label", "播放");
}

function handleEnded() {
  if (mode === "single") {
    audio.currentTime = 0;
    playAudio();
    return;
  }

  if (currentIndex < tracks.length - 1) {
    loadTrack(currentIndex + 1, true);
    return;
  }

  if (mode === "playlist") {
    loadTrack(0, true);
    return;
  }

  pauseAudio();
}

function setMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

function updateTime() {
  if (!Number.isFinite(audio.duration)) return;
  if (!isSeeking) {
    seekBar.value = String((audio.currentTime / audio.duration) * 1000 || 0);
  }
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
  setLyrics(tracks[currentIndex]?.cues || [], audio.currentTime);
}

function adjustLyricOffset(delta) {
  lyricOffset += delta;
  localStorage.setItem("openingPlayerLyricOffset", String(lyricOffset));
  setLyrics(tracks[currentIndex]?.cues || [], audio.currentTime);
  lyricNextEl.textContent = lyricOffset > 0
    ? `字幕提前 ${lyricOffset}s`
    : lyricOffset < 0
      ? `字幕延後 ${Math.abs(lyricOffset)}s`
      : "字幕同步";
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function setEmptyState() {
  titleEl.textContent = "活動開場音樂播放器";
  metaEl.textContent = "等待音樂檔";
  lyricPreviousEl.textContent = "";
  lyricCurrentEl.textContent = "等待第一首歌";
  lyricNextEl.textContent = "";
  renderPlaylist();
}

function startBackgroundVideo() {
  if (!backgroundVideo || !backgroundVideo.paused) return;
  backgroundVideo.play().catch(() => {});
}

function importAudioFiles(files) {
  const imported = [...files]
    .filter((file) => file.type.startsWith("audio/"))
    .map((file, index) => {
      const src = URL.createObjectURL(file);
      objectUrls.push(src);
      return {
        id: `local-${Date.now()}-${index}`,
        title: cleanFileName(file.name),
        artist: "本機匯入",
        src,
        lyrics: "",
        lyricsText: "",
        cues: []
      };
    });

  if (!imported.length) return;
  tracks = imported;
  currentIndex = 0;
  loadTrack(0, false);
}

async function importLyricsFiles(files) {
  const lyricFiles = [...files].filter((file) => /\.(lrc|txt|vtt)$/i.test(file.name));
  if (!lyricFiles.length) return;

  const textByName = new Map();
  for (const file of lyricFiles) {
    textByName.set(cleanFileName(file.name), await file.text());
  }

  tracks = tracks.map((track) => {
    const match = textByName.get(track.title) || textByName.get(track.title.replace(/\s+/g, " "));
    return match ? { ...track, lyricsText: match, cues: parseLyrics(match) } : track;
  });

  loadTrack(currentIndex, !audio.paused);
}

function cleanFileName(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

playBtn.addEventListener("click", () => {
  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
});

prevBtn.addEventListener("click", () => loadTrack(currentIndex - 1, !audio.paused));
nextBtn.addEventListener("click", () => loadTrack(currentIndex + 1, !audio.paused));
audio.addEventListener("timeupdate", updateTime);
audio.addEventListener("loadedmetadata", updateTime);
audio.addEventListener("ended", handleEnded);
audio.addEventListener("pause", () => {
  playBtn.textContent = "Play";
});
audio.addEventListener("play", () => {
  playBtn.textContent = "Pause";
});

seekBar.addEventListener("input", () => {
  isSeeking = true;
});

seekBar.addEventListener("change", () => {
  if (Number.isFinite(audio.duration)) {
    audio.currentTime = (Number(seekBar.value) / 1000) * audio.duration;
  }
  isSeeking = false;
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

audioPicker?.addEventListener("change", (event) => importAudioFiles(event.target.files));
lyricsPicker?.addEventListener("change", (event) => importLyricsFiles(event.target.files));

fullscreenBtn?.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
});

lyricBackBtn?.addEventListener("click", () => adjustLyricOffset(-1));
lyricForwardBtn?.addEventListener("click", () => adjustLyricOffset(1));

stage.addEventListener("dragover", (event) => {
  event.preventDefault();
  stage.classList.add("dragging");
});

stage.addEventListener("dragleave", () => stage.classList.remove("dragging"));

stage.addEventListener("drop", (event) => {
  event.preventDefault();
  stage.classList.remove("dragging");
  const files = [...event.dataTransfer.files];
  importAudioFiles(files);
  importLyricsFiles(files);
});

window.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT") return;

  if (event.code === "Space") {
    event.preventDefault();
    playBtn.click();
  }
  if (event.code === "ArrowRight") nextBtn.click();
  if (event.code === "ArrowLeft") prevBtn.click();
});

backgroundVideo?.addEventListener("canplay", startBackgroundVideo);
window.addEventListener("pointerdown", startBackgroundVideo, { once: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) startBackgroundVideo();
});
startBackgroundVideo();

if (tracks.length) {
  loadTrack(0, false);
} else {
  setEmptyState();
}

window.addEventListener("beforeunload", () => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
});
