import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";
import { LASTING_MESSAGE, HERO_BIO, HERO_BIO_MOBILE, SITE_TAGLINE, SITE_LOCATION } from "@/data/site";
import { useIsMobile } from "@/hooks/useIsMobile";

// What you land on after scrolling past his picture, full screen: his
// world from the Prophecy answer ("misty, mystic, sunrise, half-moon,
// mountain tops"), drawn in code (no AI): night at the top running into
// first light at the horizon, a half-moon, layered ridgelines of the
// Sangre de Cristos with mist drifting between them. Over it, his logo (phones),
// his lasting message as the headline, a short bio and Read My Story (-> /about). No footer on Home.
// Drawn after the real view from the mesa west of town: the Sangre de
// Cristos along the horizon with Taos Mountain as the big, broad, rounded
// massif (not spiky peaks), the flat sagebrush mesa in front, and the Rio
// Grande Gorge as a dark gash cut into the mesa nearest you.
const RIDGES = [
  {
    // the range, Taos Mountain left of centre
    d: "M0 300 C 60 290 110 270 170 262 C 230 254 260 232 300 214 C 360 186 400 150 450 128 C 500 108 560 104 610 118 C 650 130 670 150 700 160 C 730 170 760 150 800 146 C 850 142 880 170 930 182 C 990 196 1040 186 1100 196 C 1170 208 1230 224 1290 232 C 1350 240 1400 236 1440 240 L1440 400 L0 400 Z",
    fill: "#3a2530",
    h: "40%",
  },
  {
    // the mesa: nearly flat, a gentle swell
    d: "M0 318 C 200 312 360 316 520 312 C 700 307 860 314 1040 310 C 1200 307 1320 312 1440 309 L1440 400 L0 400 Z",
    fill: "#24161b",
    h: "26%",
  },
  {
    // the gorge rim nearest you, with the gorge cut into it
    d: "M0 336 L 760 332 C 800 331 820 334 836 340 L 872 372 L 900 392 L 940 392 L 972 370 L 1004 342 C 1020 335 1040 332 1080 332 L1440 334 L1440 400 L0 400 Z",
    fill: "#0e0908",
    h: "20%",
  },
];

export const HomeIntro = () => {
  const isMobile = useIsMobile();
  return (
    <section data-testid="home-intro" className={`relative z-10 flex min-h-[100svh] justify-center overflow-hidden px-6 text-center ${isMobile ? "items-start pb-10 pt-[max(88px,12svh)]" : "items-center py-24"}`}>
      {isMobile ? (
        // Phones: the world's landing frame (the end frame the transition
        // will land on), dimmed at the top for the words
        <>
          <img src="/jahspur-world-mobile.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "70% 100%" }} />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,8,6,0.7) 0%, rgba(11,8,6,0.4) 30%, rgba(11,8,6,0.12) 58%, rgba(11,8,6,0) 75%, rgba(11,8,6,0.35) 100%)" }} />
        </>
      ) : (
        <>
      {/* sky: night above, first light warming the horizon */}
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0b0806 0%, #0d0f1c 22%, #1d1a2e 46%, #4a2c3a 66%, #a2563f 80%, #e09a52 90%, #f2c879 100%)" }} />
          <div aria-hidden className="starfield absolute inset-x-0 top-0 h-[55%]" style={{ backgroundColor: "transparent", opacity: 0.9 }} />
          {/* half-moon */}
          <div aria-hidden className="absolute right-[12%] top-[14%] h-12 w-12 rounded-full md:right-[16%] md:h-16 md:w-16" style={{ background: "linear-gradient(90deg, transparent 50%, #f3ead2 50%)", boxShadow: "0 0 40px 6px rgba(243,234,210,0.1)", opacity: 0.85 }} />
          {/* the sun, just under the ridges */}
          <div aria-hidden className="absolute bottom-[14%] left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,226,160,0.55) 0%, rgba(246,190,106,0.25) 35%, transparent 68%)" }} />

          {/* ridges with mist between them */}
          {RIDGES.map((r, i) => (
            <div key={i} aria-hidden className="absolute inset-x-[-2%] bottom-0" style={{ height: r.h }}>
              <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full">
                <path d={r.d} fill={r.fill} />
              </svg>
              {i < 2 && <div className={`${i === 0 ? "mist-a" : "mist-b"} absolute top-[45%] h-[60%]`} style={{ opacity: 0.55 }} />}
            </div>
          ))}
        </>
      )}

      {/* a soft dark pool behind the words */}
      <div aria-hidden className={`js-pool absolute left-1/2 h-[80%] w-[110%] max-w-[46rem] -translate-x-1/2 -translate-y-1/2 ${isMobile ? "top-[36%]" : "top-1/2"}`} />

      <Reveal className="relative mx-auto flex max-w-xl flex-col items-center md:max-w-2xl">
        {/* desktop: no logo here (the hero already showed it once); his
            words lead. Phones keep the logo (their hero shows only the photo). */}
        {isMobile && (
          <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="mb-8 h-auto w-[min(11rem,44vw)] drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]" />
        )}
        {!isMobile && (
          <p className="font-display mb-6 text-xs uppercase tracking-[0.42em] text-[var(--js-gold)] text-legible">
            {SITE_TAGLINE} · {SITE_LOCATION}
          </p>
        )}
        <div className="tricolor-rule" />
        <h2 className={`font-accent mt-6 italic leading-snug [text-wrap:balance] text-[var(--js-text)] text-legible ${isMobile ? "text-[1.45rem]" : "text-[2.6rem]"}`}>{LASTING_MESSAGE[0]}</h2>
        <p className={`font-display mt-3 uppercase tracking-[0.3em] text-gold-grad ${isMobile ? "text-sm" : "text-lg"}`}>{LASTING_MESSAGE[1]}</p>
        <p className="font-body mt-4 text-sm font-light leading-relaxed text-white/80 text-legible sm:text-[0.95rem]">{isMobile ? HERO_BIO_MOBILE : HERO_BIO}</p>
        <Link
          to="/about"
          data-testid="home-read-story"
          className="animate-glow-pulse mt-8 inline-flex rounded-full bg-[var(--js-gold)] px-8 py-3.5 font-body text-sm font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)]"
        >
          Read My Story
        </Link>
      </Reveal>
    </section>
  );
};
