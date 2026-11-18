import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  ARTIST_NAME,
  HERO_LINE,
  HERO_BIO,
  HERO_CTA,
  HERO_IMAGE,
  HERO_IMAGE_MOBILE,
  HERO_CUTOUT,
  IDENTITY_WORDS,
  SITE_TAGLINE,
  SITE_LOCATION,
} from "@/data/site";
import { useIsMobile } from "@/hooks/useIsMobile";

// Scroll to enter, using only his real photo (no generated footage).
//
// Same pinned mechanism as Sierra's Portal -> Hero: a tall section with a
// sticky full-screen viewport, scroll progress p (0..1) drives every layer,
// so it's reversible and has no timeline to get out of sync.
//
//   p 0.00  Threshold: the photo is dim, soft and pulled back behind morning
//           mist, with his logo cube and "Scroll to enter".
//   p ->    You move into the scene: the camera pushes in, the mist parts,
//           the light comes up, the focus sharpens.
//   p 0.55+ He's fully there, full-bleed, and his name and words rise over
//           the photo.
//
// The 3D: a gentle perspective tilt that follows the cursor on desktop, plus
// true parallax when HERO_CUTOUT is set (him cut out of the same photo at the
// same canvas size). The cutout pushes in faster than the trees behind him,
// so he separates from the background. Without the cutout it's a single-
// layer push-in, which still reads as entering.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);

export const EnterHero = () => {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const [p, setP] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const [reduce] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (reduce) {
      setP(1);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const s = sectionRef.current;
        if (!s) return;
        const r = s.getBoundingClientRect();
        const vh = stickyRef.current ? stickyRef.current.clientHeight : window.innerHeight;
        setP(clamp(-r.top / (r.height - vh)));
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
  }, [reduce]);

  // Cursor tilt (fine pointers only), eased.
  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
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
      setTilt({ x: eased.x, y: eased.y });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const enter = ease(seg(p, 0, 0.6)); // moving into the scene
  const thresholdOut = ease(seg(p, 0.02, 0.22));
  const textIn = ease(seg(p, 0.5, 0.78));

  const bgScale = 1.04 + 0.1 * enter;
  const fgScale = 1.04 + 0.18 * enter;
  const light = 0.42 + 0.58 * enter; // brightness
  const blur = (1 - enter) * 6 + (HERO_CUTOUT ? 1.2 * enter : 0); // depth of field once he's separated
  const mist = 1 - ease(seg(p, 0.05, 0.55));
  const objPos = isMobile ? "50% 62%" : "30% 42%";
  const heroSrc = isMobile && HERO_IMAGE_MOBILE ? HERO_IMAGE_MOBILE : HERO_IMAGE;

  // Tilt: small, in degrees, with layers shifting in opposite directions.
  const rx = -tilt.y * 2.2;
  const ry = tilt.x * 3;

  return (
    <section
      ref={sectionRef}
      data-testid="enter-hero"
      data-nav-clear
      className="relative"
      style={{ height: reduce ? "100svh" : isMobile ? "230vh" : "260vh" }}
    >
      <div ref={stickyRef} className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[var(--js-black)]" style={{ perspective: "1200px" }}>
        {/* --- photo layers --- */}
        <div className="absolute inset-0" style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg)`, transformStyle: "preserve-3d" }}>
          <img
            src={heroSrc}
            alt="Jah Spur singing and playing guitar on an outdoor stage"
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{
              objectPosition: objPos,
              transformOrigin: isMobile ? "45% 62%" : "50% 50%",
              transform: `scale(${bgScale}) translate3d(${-tilt.x * 6}px, ${-tilt.y * 4}px, 0)`,
              filter: `brightness(${light}) blur(${blur}px) saturate(${0.8 + 0.25 * enter})`,
            }}
          />
          {HERO_CUTOUT && (
            <img
              src={HERO_CUTOUT}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{
                objectPosition: objPos,
                transformOrigin: isMobile ? "25% 45%" : "28% 40%",
                transform: `scale(${fgScale}) translate3d(${tilt.x * 10}px, ${tilt.y * 6}px, 0)`,
                filter: `brightness(${light}) blur(${(1 - enter) * 6}px) saturate(${0.8 + 0.25 * enter})`,
              }}
            />
          )}
        </div>

        {/* warm grade, morning mist, vignette */}
        <div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ background: "rgba(226,140,60,0.2)" }} />
        <div aria-hidden className="mist-a absolute top-[18%] h-[50%]" style={{ opacity: mist }} />
        <div aria-hidden className="mist-b absolute top-[42%] h-[50%]" style={{ opacity: mist * 0.9 }} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 40% 45%, rgba(11,8,6,${0.15 + 0.45 * (1 - enter)}) 0%, rgba(11,8,6,${0.6 + 0.3 * (1 - enter)}) 100%)` }}
        />
        {/* legibility under the text, rising with it */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: textIn,
            background: isMobile
              ? "linear-gradient(180deg, rgba(11,8,6,0.9) 0%, rgba(11,8,6,0.72) 30%, rgba(11,8,6,0.25) 50%, rgba(11,8,6,0) 60%, rgba(11,8,6,0) 85%, rgba(11,8,6,0.55) 100%)"
              : "linear-gradient(90deg, rgba(11,8,6,0) 32%, rgba(11,8,6,0.66) 58%, rgba(11,8,6,0.88) 100%)",
          }}
        />
        <div aria-hidden className="absolute inset-x-0 top-0 h-28" style={{ background: "linear-gradient(180deg, rgba(11,8,6,0.65), rgba(11,8,6,0))" }} />

        {/* --- threshold --- */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: 1 - thresholdOut, transform: `scale(${1 + thresholdOut * 0.08})`, pointerEvents: thresholdOut > 0.5 ? "none" : "auto" }}
        >
          <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="animate-float-slow h-auto w-[54vw] max-w-[280px] drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]" />
          <p className="font-display mt-7 text-[0.62rem] uppercase tracking-[0.45em] text-[var(--js-text)]/85 md:text-xs">
            {SITE_TAGLINE} · {SITE_LOCATION}
          </p>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2" style={{ opacity: 1 - seg(p, 0.01, 0.1) }}>
          <span className="font-display text-[0.62rem] uppercase tracking-[0.45em] text-[var(--js-text)]/80">Scroll to enter</span>
          <ChevronDown size={18} className="text-[var(--js-gold)]" style={{ animation: "scroll-cue 2.2s ease-out infinite" }} />
        </div>

        {/* --- hero text, over the photo --- */}
        <div
          className="absolute inset-0 flex items-start md:items-center md:justify-end"
          style={{ opacity: textIn, pointerEvents: textIn > 0.6 ? "auto" : "none" }}
        >
          <div className="w-full px-6 pt-[max(84px,11svh)] max-md:[@media(max-height:720px)]:pt-[72px] md:w-[48%] md:px-0 md:pt-0 md:pr-[6vw]" style={{ transform: `translateY(${(1 - textIn) * 24}px)` }}>
            <p className="font-display text-[0.62rem] uppercase leading-relaxed tracking-[0.4em] text-[var(--js-gold)] md:text-xs md:tracking-[0.45em] max-md:[@media(max-height:720px)]:hidden">
              <span className="block md:inline">{IDENTITY_WORDS.slice(0, 3).join(" · ")}</span>
              <span className="hidden md:inline"> · </span>
              <span className="block md:inline">{IDENTITY_WORDS.slice(3).join(" · ")}</span>
            </p>
            <h1 className="font-display text-stone mt-3 max-md:[@media(max-height:720px)]:mt-0 text-[clamp(2.6rem,7.2svh,3.4rem)] uppercase leading-none tracking-[0.1em] md:text-8xl md:tracking-[0.12em]">{ARTIST_NAME}</h1>
            <div className="tricolor-rule mt-5" />
            <p className="font-accent mt-4 text-[1.45rem] max-md:[@media(max-height:720px)]:mt-3 max-md:[@media(max-height:720px)]:text-[1.2rem] italic leading-snug text-[var(--js-text)] text-legible md:mt-5 md:text-3xl">{HERO_LINE}</p>
            {/* Phones: the bio is dropped here so the text stays in the
                canopy, clear of his face; it's on About and in the EPK. */}
            {!isMobile && <p className="font-body mt-4 max-w-xl text-sm font-light leading-relaxed text-white/80 text-legible md:text-[0.95rem]">{HERO_BIO}</p>}
            <div className="mt-5 grid md:mt-7 grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
              <Link
                to={HERO_CTA.to}
                data-testid="hero-cta"
                className="animate-glow-pulse rounded-full bg-[var(--js-gold)] px-7 py-3 text-center font-body text-sm font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)]"
              >
                {HERO_CTA.label}
              </Link>
              <Link
                to="/album"
                data-testid="hero-album-link"
                className="rounded-full border border-white/35 bg-black/20 px-5 py-3 text-center font-body text-sm text-white/90 backdrop-blur-sm transition-colors hover:border-[var(--js-gold)] hover:text-[var(--js-gold-light)]"
              >
                Written in Stone
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
