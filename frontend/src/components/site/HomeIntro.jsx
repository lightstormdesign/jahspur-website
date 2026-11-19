import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";
import { HERO_LINE, HERO_BIO, HERO_BIO_MOBILE } from "@/data/site";
import { useIsMobile } from "@/hooks/useIsMobile";

// What you land on after scrolling past his picture, full screen: his
// world from the Prophecy answer ("misty, mystic, sunrise, half-moon,
// mountain tops"), drawn in code (no AI): night at the top running into
// first light at the horizon, a half-moon, layered ridgelines of the
// Sangre de Cristos with mist drifting between them. Over it, his logo, his
// line, a short bio and Read My Story (-> /about). No footer on Home.
const RIDGES = [
  { d: "M0 250 L90 222 L170 238 L260 180 L330 196 L420 132 L500 168 L590 104 L660 140 L740 92 L820 128 L900 118 L990 170 L1080 112 L1170 150 L1260 128 L1350 170 L1440 150 L1440 400 L0 400 Z", fill: "#3a2530", h: "34%" },
  { d: "M0 292 L120 252 L230 282 L340 222 L450 262 L560 206 L680 268 L790 232 L900 278 L1030 222 L1150 262 L1270 236 L1440 270 L1440 400 L0 400 Z", fill: "#24161b", h: "27%" },
  { d: "M0 338 L180 330 L250 318 L420 322 L520 304 L700 308 L770 326 L980 320 L1070 302 L1260 310 L1330 330 L1440 324 L1440 400 L0 400 Z", fill: "#0e0908", h: "18%" },
];

export const HomeIntro = () => {
  const isMobile = useIsMobile();
  return (
    <section data-testid="home-intro" className="relative z-10 flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-24 text-center">
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

      {/* a soft dark pool behind the words */}
      <div aria-hidden className="js-pool absolute left-1/2 top-1/2 h-[80%] w-[110%] max-w-[46rem] -translate-x-1/2 -translate-y-1/2" />

      <Reveal className="relative mx-auto flex max-w-xl flex-col items-center">
        <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="h-auto w-[min(11rem,44vw)] drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]" />
        <div className="tricolor-rule mt-8" />
        <p className="font-accent mt-6 text-[1.45rem] italic leading-snug text-[var(--js-text)] text-legible sm:text-2xl">{HERO_LINE}</p>
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
