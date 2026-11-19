import { useEffect, useState } from "react";
import { sound } from "@/utils/sound";
import { requestMotion } from "@/utils/motion";

// The speaker, top left on every page (Trev's): slashed until the song
// plays. Pressing it is one of the two places iPhone's motion-access prompt
// is asked (the other is the menu button), while the tap is fresh.
export const SoundButton = ({ className = "" }) => {
  const [, force] = useState(0);
  useEffect(() => sound.subscribe(() => force((n) => n + 1)), []);
  const on = sound.playing;
  return (
    <button
      type="button"
      data-testid="sound-button"
      className={`js-sound ${on ? "on" : ""} ${className}`}
      aria-label={on ? "Mute the song" : "Play the song"}
      aria-pressed={on}
      onClick={() => {
        if (!sound.playing) requestMotion(); // first, inside the tap (iPhone only asks inside one)
        sound.toggle();
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4z" />
        <path className="wave" d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path className="wave" d="M18.5 5.5a9 9 0 0 1 0 13" />
        <path className="slash" d="M3 3l18 18" />
      </svg>
    </button>
  );
};
