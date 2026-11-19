import { SONG_SRC } from "@/data/site";

// One player for the whole site (so the song keeps playing from page to
// page), modelled on Trev's: the speaker starts it from the top the first
// time, then pauses / resumes. Set the level in the file itself (iPhone
// ignores .volume). Nothing plays until someone presses the speaker.
let audio = null;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

function el() {
  if (audio || !SONG_SRC) return audio;
  audio = new Audio();
  audio.preload = "none";
  audio.loop = true;
  audio.src = SONG_SRC;
  ["play", "pause", "ended"].forEach((t) => audio.addEventListener(t, emit));
  return audio;
}

export const sound = {
  get available() {
    return Boolean(SONG_SRC);
  },
  get playing() {
    return !!audio && !audio.paused;
  },
  subscribe(f) {
    subs.add(f);
    return () => subs.delete(f);
  },
  toggle() {
    const a = el();
    if (!a) return Promise.resolve();
    if (a.paused) return a.play().catch(() => {});
    a.pause();
    return Promise.resolve();
  },
};
