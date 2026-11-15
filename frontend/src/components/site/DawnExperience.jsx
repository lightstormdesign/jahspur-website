import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import {
  ARTIST_NAME,
  SITE_TAGLINE,
  SITE_LOCATION,
  HERO_LINE,
  HERO_BIO,
  HERO_BIO_MOBILE,
  HERO_CTA,
  HERO_ANNOUNCEMENT,
  SPUR_DEFINITION,
  IDENTITY_WORDS,
} from "@/data/site";
import { useIsMobile } from "@/hooks/useIsMobile";
import { HalfMoonGlyph } from "./Glyphs";

// The Home page's pinned Portal -> Hero sequence, rebuilt for Jah Spur.
//
// Same architecture as the template's CinematicExperience: a tall section
// with a sticky 100svh viewport, scroll progress `p` (0..1) driving every
// layer through seg(a, b) envelopes, so the whole thing is a pure function
// of scroll position and reverses for free. The difference is material:
// there's no footage for Jah yet, so the "transition video" is built from
// layers instead, taken from his Prophecy answer ("misty, mystic, sunrise,
// half-moon, mountain tops"): a half-moon night over layered ridgelines
// (the Sangre de Cristos above Taos), mist drifting through the valleys, and
// a sun that rises as you scroll, until the day opens onto him on stage.
//
// Beats:
//   0.00-0.30  Portal: night, half-moon, his logo cube glowing, "scroll"
//   0.05-0.60  Dawn: sky warms, sun rises, moon sets, mist thins
//   0.30-0.60  Interlude: the dictionary meaning of "spur"
//   0.62-0.85  Hero: performance photo fades up, name / line / bio / CTAs

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);

const lerp = (a, b, t) => a + (b - a) * t;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (c1, c2, t) => {
  const a = hex(c1);
  const b = hex(c2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",")})`;
};

// Ridgelines, back to front. viewBox 0 0 1440 400, anchored to the bottom.
const RIDGES = [
  {
    d: "M0 250 L90 222 L170 238 L260 180 L330 196 L420 132 L500 168 L590 104 L660 140 L740 92 L820 128 L900 118 L990 170 L1080 112 L1170 150 L1260 128 L1350 170 L1440 150 L1440 400 L0 400 Z",
    night: "#1d1b2c",
    dawn: "#8a5560",
    depth: 10,
    top: "38%",
  },
  {
    d: "M0 292 L120 252 L230 282 L340 222 L450 262 L560 206 L680 268 L790 232 L900 278 L1030 222 L1150 262 L1270 236 L1440 270 L1440 400 L0 400 Z",
    night: "#15131f",
    dawn: "#5a3534",
    depth: 22,
    top: "48%",
  },
  {
    // flat mesa / gorge rim in front, like the Rio Grande Gorge photo
    d: "M0 338 L180 330 L250 318 L420 322 L520 304 L700 308 L770 326 L980 320 L1070 302 L1260 310 L1330 330 L1440 324 L1440 400 L0 400 Z",
    night: "#0d0a09",
    dawn: "#22150f",
    depth: 40,
    top: "60%",
  },
];

const Ridge = ({ ridge, dawn, rise, fx }) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-x-[-4%] bottom-0"
    style={{
      top: ridge.top,
      transform: `translate3d(${fx.x * -ridge.depth * 0.4}px, ${rise * ridge.depth}px, 0)`,
    }}
  >
    <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full">
      <path d={ridge.d} fill={mix(ridge.night, ridge.dawn, dawn)} />
    </svg>
  </div>
);

export const DawnExperience = () => {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const [p, setP] = useState(0);
  const [fx, setFx] = useState({ x: 0, y: 0 });
  const [bubble, setBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const vh = stickyRef.current ? stickyRef.current.clientHeight : window.innerHeight;
        const total = rect.height - vh;
        setP(clamp(-rect.top / total));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Gentle cursor parallax on the ridges (fine pointers only, eased).
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    let raf;
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      eased.x += (target.x - eased.x) * 0.06;
      eased.y += (target.y - eased.y) * 0.06;
      setFx({ x: eased.x, y: eased.y });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const heroIn = ease(seg(p, 0.62, 0.85));

  // Announcement bubble: appears a few seconds after the hero is up.
  useEffect(() => {
    if (heroIn < 0.95 || bubble) return;
    const t = setTimeout(() => setBubble(true), HERO_ANNOUNCEMENT.appearDelayMs);
    return () => clearTimeout(t);
  }, [heroIn, bubble]);

  const dawn = ease(seg(p, 0.05, 0.58));
  const sunRise = ease(seg(p, 0.08, 0.6));
  const portalOut = ease(seg(p, 0.1, 0.3));
  const spurIn = ease(seg(p, 0.3, 0.4)) * (1 - ease(seg(p, 0.5, 0.6)));
  const mistThin = seg(p, 0.2, 0.75);
  const ridgeRise = seg(p, 0.55, 0.85);

  return (
    <section ref={sectionRef} data-testid="dawn-experience" className="relative" style={{ height: isMobile ? "300vh" : "340vh" }}>
      <div ref={stickyRef} className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[var(--js-black)]">
        {/* --- sky --- */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #05070f 0%, #0d1220 42%, #231a2c 78%, #2c1f2a 100%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: dawn,
            background: "linear-gradient(180deg, #1b1932 0%, #5b3a57 30%, #b9614a 56%, #eda552 74%, #f6d48a 100%)",
          }}
        />
        <div aria-hidden className="starfield absolute inset-0" style={{ opacity: 1 - dawn, backgroundColor: "transparent" }} />

        {/* half-moon, setting as the sun comes up */}
        <div
          aria-hidden
          className="absolute right-[12%] top-[12%] md:right-[16%]"
          style={{ opacity: 1 - ease(seg(p, 0.15, 0.45)), transform: `translateY(${sunRise * 18}vh)` }}
        >
          <div className="relative h-16 w-16 md:h-20 md:w-20">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent 50%, #f3ead2 50%)",
                boxShadow: "0 0 40px 6px rgba(243,234,210,0.12)",
              }}
            />
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 0 1px rgba(243,234,210,0.12)" }} />
          </div>
        </div>

        {/* sun */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: `${lerp(74, 30, sunRise)}%`, opacity: seg(p, 0.06, 0.2) }}
        >
          <div
            className="h-[34vmin] w-[34vmin] rounded-full"
            style={{
              background: "radial-gradient(circle, #fff4d4 0%, #f7d58a 34%, rgba(237,165,82,0.55) 52%, rgba(237,165,82,0) 72%)",
              filter: "blur(1px)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(246,196,106,0.28) 0%, rgba(246,196,106,0) 60%)" }}
          />
        </div>

        {/* ridges + mist between them */}
        <Ridge ridge={RIDGES[0]} dawn={dawn} rise={ridgeRise} fx={fx} />
        <div aria-hidden className="mist-a absolute top-[44%] h-[22%]" style={{ opacity: 1 - mistThin * 0.6 }} />
        <Ridge ridge={RIDGES[1]} dawn={dawn} rise={ridgeRise} fx={fx} />
        <div aria-hidden className="mist-b absolute top-[56%] h-[24%]" style={{ opacity: 1 - mistThin * 0.7 }} />
        <Ridge ridge={RIDGES[2]} dawn={dawn} rise={ridgeRise} fx={fx} />

        {/* --- portal: logo cube + name --- */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{
            opacity: 1 - portalOut,
            transform: `translateY(${-portalOut * 6}vh) scale(${1 - portalOut * 0.06})`,
            pointerEvents: portalOut > 0.5 ? "none" : "auto",
          }}
        >
          <div className="relative">
            <div
              aria-hidden
              className="animate-breathe absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(226,168,56,0.22) 0%, rgba(226,168,56,0) 65%)" }}
            />
            <img
              src="/jahspur-logo-light.png"
              alt="Jah Spur and The Strongbacks"
              className="animate-float-slow relative h-auto w-[62vw] max-w-[300px] md:max-w-[340px]"
              style={{ transform: `translate3d(${fx.x * 6}px, ${fx.y * 4}px, 0)` }}
            />
          </div>
          <p className="font-display mt-8 text-[0.68rem] uppercase tracking-[0.5em] text-[var(--js-text)]/80 md:text-xs">
            {SITE_TAGLINE} · {SITE_LOCATION}
          </p>
        </div>

        {/* scroll cue */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2"
          style={{ opacity: 1 - seg(p, 0.02, 0.12) }}
        >
          <span className="font-display text-[0.6rem] uppercase tracking-[0.45em] text-[var(--js-text)]/70">Scroll to rise</span>
          <ChevronDown size={18} className="text-[var(--js-gold)]" style={{ animation: "scroll-cue 2.2s ease-out infinite" }} />
        </div>

        {/* --- interlude: the word itself --- */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center"
          style={{ opacity: spurIn, transform: `translateY(${(1 - spurIn) * 2}vh)` }}
        >
          <div className="max-w-2xl">
            <p className="font-display text-5xl lowercase tracking-[0.08em] text-[var(--js-text)] text-legible md:text-7xl">
              {SPUR_DEFINITION.word}
            </p>
            <p className="font-accent mt-1 text-lg italic text-[var(--js-text)] text-legible md:text-xl">({SPUR_DEFINITION.part})</p>
            <p className="font-accent mt-5 text-2xl leading-snug text-[var(--js-text)] text-legible md:text-3xl">{SPUR_DEFINITION.meaning}</p>
          </div>
        </div>

        {/* --- hero --- */}
        <div className="absolute inset-0" style={{ opacity: heroIn, pointerEvents: heroIn > 0.6 ? "auto" : "none" }}>
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/jahspur-hero-01.jpg"
              alt="Jah Spur singing and playing guitar on an outdoor stage"
              className="animate-kenburns h-full w-full object-cover"
              style={{ objectPosition: isMobile ? "22% 8%" : "30% 6%" }}
            />
          </div>
          {/* warm grade + legibility gradients */}
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,8,6,0.55) 0%, rgba(11,8,6,0) 22%)" }} />
          <div
            aria-hidden
            className="absolute inset-0 hidden md:block"
            style={{ background: "linear-gradient(90deg, rgba(11,8,6,0) 30%, rgba(11,8,6,0.72) 58%, rgba(11,8,6,0.92) 100%)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 md:hidden"
            style={{ background: "linear-gradient(180deg, rgba(11,8,6,0) 30%, rgba(11,8,6,0.85) 58%, rgba(11,8,6,0.97) 100%)" }}
          />
          <div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ background: "rgba(226,140,60,0.18)" }} />

          <div className="relative flex h-full items-end md:items-center md:justify-end">
            <div
              className="w-full px-6 pb-10 md:w-[48%] md:px-0 md:pb-0 md:pr-[6vw]"
              style={{ transform: `translateY(${(1 - heroIn) * 3}vh)` }}
            >
              <p className="font-display text-[0.62rem] uppercase tracking-[0.45em] text-[var(--js-gold)] md:text-xs">
                {IDENTITY_WORDS.join(" · ")}
              </p>
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

          {/* announcement bubble */}
          {bubble && !bubbleDismissed && (
            <div
              data-testid="hero-announcement"
              className="absolute bottom-5 right-5 hidden max-w-xs items-center gap-3 rounded-2xl border border-white/15 bg-[rgba(11,8,6,0.82)] p-3 pr-9 shadow-2xl backdrop-blur-md md:flex"
              style={{ animation: "fade-in-up 0.7s ease-out both" }}
            >
              <img src={HERO_ANNOUNCEMENT.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
              <div>
                <p className="font-body text-xs leading-snug text-white/85">{HERO_ANNOUNCEMENT.message}</p>
                <Link to={HERO_ANNOUNCEMENT.to} className="font-body mt-1 inline-block text-xs text-[var(--js-gold-light)] underline underline-offset-2">
                  {HERO_ANNOUNCEMENT.linkLabel}
                </Link>
              </div>
              <button
                onClick={() => setBubbleDismissed(true)}
                aria-label="Dismiss"
                className="absolute right-2 top-2 text-white/40 transition-colors hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* faint half-moon watermark on the hero, his "half-moon" */}
        <div aria-hidden className="pointer-events-none absolute left-6 top-24 hidden text-[var(--js-gold-light)] md:block" style={{ opacity: heroIn * 0.12 }}>
          <HalfMoonGlyph size={56} strokeWidth={1.5} />
        </div>
      </div>
    </section>
  );
};
