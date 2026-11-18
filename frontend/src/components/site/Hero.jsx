import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import {
  ARTIST_NAME,
  HERO_LINE,
  HERO_BIO,
  HERO_BIO_MOBILE,
  HERO_CTA,
  HERO_ANNOUNCEMENT,
  IDENTITY_WORDS,
} from "@/data/site";
import { useIsMobile } from "@/hooks/useIsMobile";

// Home hero: the visitor lands directly on Jah, the standard LightStorm
// flow at this package tier. (The illustrated dawn-world intro,
// DawnExperience.jsx, is built but switched off; it's the "World upgrade".)
//
// Headroom without AI: jah1 is framed tight to the top of his beanie, which
// left the beanie under the header (and cut off on phones). Instead of
// generating extra sky, the photo starts a little below the header and its
// top edge fades into the night background, so the hat clears the nav on
// every screen and every pixel shown is his real photo.
export const Hero = () => {
  const isMobile = useIsMobile();
  const [bubble, setBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBubble(true), HERO_ANNOUNCEMENT.appearDelayMs);
    return () => clearTimeout(t);
  }, []);

  const fadeTop = "linear-gradient(to bottom, transparent 0%, #000 5%, #000 100%)";

  return (
    <section data-testid="home-hero" data-nav-clear className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[var(--js-black)]">
      {/* night sky behind the faded top edge, with a warm sunrise glow */}
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, #07080f 0%, #1a1420 30%, #2a1b18 60%, var(--js-black) 100%)" }} />
      <div aria-hidden className="starfield absolute inset-x-0 top-0 h-[30%]" style={{ backgroundColor: "transparent", opacity: 0.7 }} />

      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden"
        style={{ top: isMobile ? "60px" : "44px", WebkitMaskImage: fadeTop, maskImage: fadeTop }}
      >
        <img
          src="/jahspur-hero-01.jpg"
          alt="Jah Spur singing and playing guitar on an outdoor stage"
          className="animate-kenburns h-full w-full object-cover"
          style={{ objectPosition: isMobile ? "4% 0%" : "30% 0%" }}
        />
      </div>

      {/* legibility + warm grade */}
      <div aria-hidden className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(11,8,6,0) 30%, rgba(11,8,6,0.72) 58%, rgba(11,8,6,0.92) 100%)" }} />
      <div aria-hidden className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(180deg, rgba(11,8,6,0) 34%, rgba(11,8,6,0.85) 60%, rgba(11,8,6,0.97) 100%)" }} />
      <div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ background: "rgba(226,140,60,0.18)" }} />
      {/* a little of his misty-morning world, as atmosphere only */}
      <div aria-hidden className="mist-a absolute bottom-[4%] h-[30%]" style={{ opacity: 0.45 }} />
      <div aria-hidden className="pointer-events-none absolute -left-[10%] bottom-[-30%] h-[70vmin] w-[70vmin] rounded-full" style={{ background: "radial-gradient(circle, rgba(246,196,106,0.16) 0%, rgba(246,196,106,0) 65%)" }} />

      <div className="relative flex h-full items-end md:items-center md:justify-end">
        <div className="w-full px-6 pb-10 md:w-[48%] md:px-0 md:pb-0 md:pr-[6vw]" style={{ animation: "fade-in-up 1.1s ease-out 0.3s both" }}>
          <p className="font-display text-[0.62rem] uppercase tracking-[0.45em] text-[var(--js-gold)] md:text-xs">{IDENTITY_WORDS.join(" · ")}</p>
          <h1 className="font-display text-stone mt-3 text-6xl uppercase leading-none tracking-[0.12em] md:text-8xl">{ARTIST_NAME}</h1>
          <div className="tricolor-rule mt-5" />
          <p className="font-accent mt-5 text-2xl italic leading-snug text-[var(--js-text)] text-legible md:text-3xl">{HERO_LINE}</p>
          <p className="font-body mt-4 max-w-xl text-sm font-light leading-relaxed text-white/75 text-legible md:text-[0.95rem]">
            {isMobile ? HERO_BIO_MOBILE : HERO_BIO}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to={HERO_CTA.to}
              data-testid="hero-cta"
              className="animate-glow-pulse rounded-full bg-[var(--js-gold)] px-7 py-3 font-body text-sm font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)]"
            >
              {HERO_CTA.label}
            </Link>
            <Link
              to="/album"
              data-testid="hero-album-link"
              className="rounded-full border border-white/30 px-7 py-3 font-body text-sm text-white/90 transition-colors hover:border-[var(--js-gold)] hover:text-[var(--js-gold-light)]"
            >
              Written in Stone
            </Link>
          </div>
        </div>
      </div>

      <div aria-hidden className="absolute inset-x-0 bottom-4 hidden justify-center md:flex">
        <ChevronDown size={18} className="text-[var(--js-gold)]/80" style={{ animation: "scroll-cue 2.2s ease-out infinite" }} />
      </div>

      {bubble && !dismissed && (
        <div
          data-testid="hero-announcement"
          className="absolute bottom-6 right-6 hidden max-w-xs items-center gap-3 rounded-2xl border border-white/15 bg-[rgba(11,8,6,0.82)] p-3 pr-9 shadow-2xl backdrop-blur-md md:flex"
          style={{ animation: "fade-in-up 0.7s ease-out both" }}
        >
          <img src={HERO_ANNOUNCEMENT.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          <div>
            <p className="font-body text-xs leading-snug text-white/85">{HERO_ANNOUNCEMENT.message}</p>
            <Link to={HERO_ANNOUNCEMENT.to} className="font-body mt-1 inline-block text-xs text-[var(--js-gold-light)] underline underline-offset-2">
              {HERO_ANNOUNCEMENT.linkLabel}
            </Link>
          </div>
          <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="absolute right-2 top-2 text-white/40 transition-colors hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}
    </section>
  );
};
