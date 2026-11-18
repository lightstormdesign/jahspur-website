import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Fireflies } from "@/components/site/Fireflies";
import { SOCIALS, NAME_STORY, CALL_TO_ACTION } from "@/data/site";
import { useIsMobile } from "@/hooks/useIsMobile";

// Mobile-only discrete slide gesture tuning. Desktop's continuous
// scroll-scrub (stageOpacity/p below) is completely untouched by any of
// this — mobile just picks a different opacity source per stage at render
// time (see `op` in the map below) and drives `slide` via its own
// touch/wheel handlers instead of `p`.
const SWIPE_THRESHOLD_PX = 60;
const WHEEL_THRESHOLD_PX = 35;
const CROSSFADE_MS = 500;

// Pinned documentary: the template's About mechanism (chapter crossfades
// driven by scroll on desktop, one-at-a-time swipe slides on mobile,
// feathered + graded photos), filled with Jah Spur's story. Copy is his own
// intake answers in first person, lightly trimmed and ordered for flow; the
// two bridge lines are short connective beats, not new facts.
//
// Photos are his "About Section" uploads. No ambient audio: no music files
// were provided yet.

const GRADE_DREAM = "saturate(1.05) brightness(1.04) contrast(0.97) sepia(0.12)";
const GRADE_WARM = "saturate(1.12) brightness(1.03) contrast(1.04) sepia(0.06)";
const gradeFor = (i) => (i <= 2 ? GRADE_DREAM : GRADE_WARM);

const FEATHER =
  "radial-gradient(ellipse 70% 72% at 50% 50%, #000 50%, rgba(0,0,0,0.55) 76%, rgba(0,0,0,0) 100%)";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

// Four corner-fade overlays for the plain gallery-grid photos below (the
// pinned-stage photos already get a full elliptical feather via FEATHER
// above) — each is a small radial gradient anchored exactly on one corner,
// opaque at the corner point and fading to transparent moving inward, so
// that corner blends into the page's black background instead of showing
// a hard rectangular line.
const CORNER_FADES = [
  { key: "tl", style: { top: 0, left: 0, background: "radial-gradient(circle at top left, #000 0%, transparent 70%)" } },
  { key: "tr", style: { top: 0, right: 0, background: "radial-gradient(circle at top right, #000 0%, transparent 70%)" } },
  { key: "bl", style: { bottom: 0, left: 0, background: "radial-gradient(circle at bottom left, #000 0%, transparent 70%)" } },
  { key: "br", style: { bottom: 0, right: 0, background: "radial-gradient(circle at bottom right, #000 0%, transparent 70%)" } },
];

// Subtle, understated scroll-continuation cue — same restrained spirit as
// the Portal page's own scroll indicator, not a bold "scroll down" banner.
// Used after each chapter, where it
// would otherwise be ambiguous whether the page has more content below.
const ScrollChevron = () => (
  <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center" aria-hidden>
    <ChevronDown size={20} className="text-[var(--js-gold)]/70" style={{ animation: "breathe 2.4s ease-in-out infinite" }} />
  </div>
);

// A few faint dust specks hugging the photo's inner edge, masked by the same
// FEATHER as the photo itself so they fade out together at the boundary —
// a light "stardust border" rather than a decorative frame.
const DUST_BORDER =
  "radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.55), transparent), radial-gradient(1px 1px at 92% 18%, rgba(243,208,138,0.5), transparent), radial-gradient(1px 1px at 15% 88%, rgba(243,208,138,0.45), transparent), radial-gradient(1px 1px at 85% 82%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 50% 6%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 6% 50%, rgba(255,255,255,0.4), transparent)";

const MemoryMedia = ({ src, alt = "", scale, grade }) => {
  const mask = { WebkitMaskImage: FEATHER, maskImage: FEATHER };
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Soft starlight glow behind the photo, so it feels integrated into
          the starry background rather than sitting on top of it. */}
      <div
        aria-hidden
        className="animate-breathe pointer-events-none absolute h-[70%] w-[85%] max-w-[90%]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(243,208,138,0.16) 0%, rgba(255,255,255,0.06) 45%, transparent 75%)",
          filter: "blur(28px)",
        }}
      />
      <img
        src={src}
        alt={alt}
        className="relative max-h-full max-w-full w-auto select-none"
        style={{ ...mask, filter: grade, transform: `scale(${scale})`, transition: "transform 0.12s linear" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ ...mask, backgroundImage: GRAIN, opacity: 0.1, mixBlendMode: "overlay" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ ...mask, backgroundImage: DUST_BORDER, backgroundRepeat: "no-repeat" }}
      />
    </div>
  );
};

const STAGES = [
  {
    id: "the-blood",
    kicker: "His Story",
    title: "Music Is in the Blood",
    opening: true,
    media: "/jahspur-about-01.jpg",
    alt: "Jah Spur with family in the mountains above Taos",
    body: [
      "Music is in my blood. I come from a multi-generational, music-filled family.",
      "Growing up, I was playing and reading music before I could read English. First violin, then trumpet, now guitar and beyond.",
    ],
    showChevron: true,
  },
  {
    id: "bridge-1",
    bridge: true,
    body: "Then, at thirteen, a new sound found me.",
    showChevron: true,
  },
  {
    id: "roots",
    title: "Roots & Culture",
    media: "/jahspur-about-02.jpg",
    alt: "Jah Spur at a gate painted with the words Unity and One Love",
    body: [
      "At thirteen I began steeping in Jamaican music through my mother, my father, and their close friends. Through high school and college I played in a touring Jamaican music band.",
      "Music put me in beautiful places, brought me into incredible experiences, and helped forge me into the man I am today.",
    ],
    showChevron: true,
  },
  {
    id: "wings",
    title: "Unfurling the Wings",
    media: "/jahspur-about-08.jpg",
    alt: "Jah Spur on a mountain summit",
    body: [
      "After thirteen years it was time to unfurl my wings. I left the group to pursue my dreams across the nation and abroad, to learn about different cultures.",
      "It became a fertile time for growth. Over the last decade I have kept writing songs about my experiences, teachings, and creation.",
    ],
    showChevron: true,
  },
  {
    id: "bridge-2",
    bridge: true,
    body: "My music is my divine action.",
    showChevron: true,
  },
  {
    id: "strongbacks",
    title: "The Strongbacks",
    media: "/jahspur-about-07.jpg",
    alt: "Jah Spur on stage with acoustic guitar and his band",
    body: [
      "Today I lead my own band, The Strongbacks, out of Taos, New Mexico, and record in a studio of my own. Those are the two things I'm proudest of.",
      "I have devoted more than half of my life to bringing roots and culture music to the people: spreading love and unity through word and sound.",
    ],
    showChevron: true,
  },
  {
    id: "why",
    title: "Why I Sing",
    media: "/jahspur-about-06.jpg",
    alt: "Jah Spur with family at sunset over the Rio Grande Gorge",
    body: [
      "I make music to share my spiritual fruits and gifts: to uplift, encourage, and empower the ones I can touch with my offerings.",
      "My prayer is that others may find inspiration to find, do, and share their purpose.",
    ],
    showChevron: true,
  },
  {
    id: "in-stone",
    title: NAME_STORY.title,
    media: "/jahspur-hero-04.jpg",
    alt: "Jah Spur singing with his eyes closed",
    body: NAME_STORY.body,
    showChevron: true,
  },
  {
    id: "now",
    media: "/jahspur-hero-03.jpg",
    alt: "Jah Spur singing on stage",
    body: [
      "It is imperative that I share my music with the world. My debut album, Written in Stone, is my chance to introduce myself the way I mean to be known.",
      "Every song has its own destiny. Like water, it finds the crevices and makes its way.",
    ],
    showChevron: true,
  },
  {
    id: "invitation",
    cta: true,
  },
];

const N = STAGES.length;

function stageOpacity(p, i) {
  const center = (i + 0.5) / N;
  const plateau = 0.3 / N;
  const half = 0.7 / N;
  let d = Math.abs(p - center);
  if (i === 0 && p < center) d = 0;
  if (i === N - 1 && p > center) d = 0;
  if (d <= plateau) return 1;
  if (d >= half) return 0;
  return (half - d) / (half - plateau);
}

export default function About() {
  const ref = useRef(null);
  const stickyRef = useRef(null);
  const [p, setP] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const section = ref.current;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const prog = Math.min(1, Math.max(0, -rect.top / total));
      setP(prog);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile: discrete slide index, advanced one at a time by a swipe/scroll
  // gesture rather than tied proportionally to scroll distance. The section
  // itself keeps the exact same DOM (tall spacer + sticky viewport, one
  // persistent fixed background) as desktop — only the gesture handling and
  // the opacity source per stage (see `op` below) differ.
  const [slide, setSlide] = useState(0);
  const lockedRef = useRef(false);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    if (!isMobile) return;
    const el = stickyRef.current;
    if (!el) return;

    const exitForward = () => {
      const section = ref.current;
      const rect = section.getBoundingClientRect();
      // Section's bottom edge (absolute doc position) minus one viewport
      // height is exactly where the sticky viewport fully un-pins; a small
      // buffer past that guarantees the next section is clearly in view
      // rather than landing exactly on the pixel boundary.
      const unpinAt = window.scrollY + rect.bottom - window.innerHeight;
      window.scrollTo({ top: unpinAt + 80, behavior: "smooth" });
    };

    const advance = (dir) => {
      if (lockedRef.current) return;
      if (dir > 0) {
        if (slide < N - 1) {
          lockedRef.current = true;
          setSlide((s) => s + 1);
          setTimeout(() => (lockedRef.current = false), CROSSFADE_MS);
        } else {
          exitForward();
        }
      } else if (dir < 0 && slide > 0) {
        lockedRef.current = true;
        setSlide((s) => s - 1);
        setTimeout(() => (lockedRef.current = false), CROSSFADE_MS);
      }
      // slide === 0, dir < 0: first-slide-backward is an explicit no-op.
    };

    const onTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      e.preventDefault();
    };
    const onTouchEnd = (e) => {
      const delta = touchStartYRef.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
      advance(delta > 0 ? 1 : -1);
    };

    let wheelAccum = 0;
    let wheelResetTimer = null;
    const onWheel = (e) => {
      e.preventDefault();
      wheelAccum += e.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => (wheelAccum = 0), 200);
      if (Math.abs(wheelAccum) < WHEEL_THRESHOLD_PX) return;
      advance(wheelAccum > 0 ? 1 : -1);
      wheelAccum = 0;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      clearTimeout(wheelResetTimer);
    };
  }, [isMobile, slide]);

  const pe = (o) => (o > 0.5 ? "auto" : "none");

  return (
    <div data-testid="about-page" className="relative bg-[var(--js-black)]">
      {/* Fixed environment: high-desert dusk (no About footage exists yet),
          the same ridgelines as the Home dawn, held at twilight. */}
      <div aria-hidden className="fixed inset-0 z-0" style={{ background: "linear-gradient(180deg, #07080f 0%, #141322 40%, #2a1c26 72%, #3a2420 100%)" }}>
        <div className="starfield absolute inset-0" style={{ backgroundColor: "transparent", opacity: 0.8 }} />
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[38%] w-full">
          <path d="M0 250 L90 222 L170 238 L260 180 L330 196 L420 132 L500 168 L590 104 L660 140 L740 92 L820 128 L900 118 L990 170 L1080 112 L1170 150 L1260 128 L1350 170 L1440 150 L1440 400 L0 400 Z" fill="#2a1d24" />
          <path d="M0 292 L120 252 L230 282 L340 222 L450 262 L560 206 L680 268 L790 232 L900 278 L1030 222 L1150 262 L1270 236 L1440 270 L1440 400 L0 400 Z" fill="#1a1217" />
          <path d="M0 338 L180 330 L250 318 L420 322 L520 304 L700 308 L770 326 L980 320 L1070 302 L1260 310 L1330 330 L1440 324 L1440 400 L0 400 Z" fill="#0d0908" />
        </svg>
        <div className="mist-a absolute top-[68%] h-[18%]" style={{ opacity: 0.6 }} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <div className="haze-drift" />
      </div>
      <Fireflies />

      <Navbar />

      {/* 55vh per stage (down from 90vh) — shorter scroll distance per
          section transition, since the previous ratio made scrolling feel
          almost unresponsive. */}
      <section ref={ref} className="relative z-10" style={{ height: `${N * 55}vh` }}>
        <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
          {STAGES.map((s, i) => {
            const op = isMobile ? (slide === i ? 1 : 0) : stageOpacity(p, i);
            const segStart = i / N;
            const segEnd = (i + 1) / N;
            const local = Math.min(1, Math.max(0, (p - segStart) / (segEnd - segStart)));
            const contentScale = 0.95 + 0.05 * op;
            const imgScale = 1 + 0.07 * local;

            // Invitation beat — closing CTA, routes to Community (the
            // text-list signup landing page), not Contact.
            if (s.cta) {
              return (
                <div
                  key={s.id}
                  data-testid={`about-stage-${s.id}`}
                  className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center"
                  style={{ opacity: op, pointerEvents: pe(op), transition: isMobile ? `opacity ${CROSSFADE_MS}ms ease` : "none" }}
                >
                  <div
                    className="relative flex flex-col items-center"
                    style={{ transform: `scale(${contentScale})`, transition: "transform 0.1s linear" }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[160%] w-[150%] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.42) 45%, rgba(0,0,0,0) 74%)",
                        filter: "blur(18px)",
                      }}
                    />
                    <img src="/jahspur-logo-light.png" alt="" aria-hidden className="h-24 w-auto object-contain opacity-95" />
                    <h2 className="font-display mt-8 max-w-xl text-3xl font-normal leading-tight text-white sm:text-4xl text-legible">
                      {CALL_TO_ACTION.lead} <span className="text-gold-grad">{CALL_TO_ACTION.follow}</span>
                    </h2>
                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        to="/community"
                        data-testid="about-cta"
                        className="animate-glow-pulse inline-flex rounded-full bg-[var(--js-gold)] px-8 py-3.5 font-body text-sm font-medium text-black transition-colors hover:bg-[var(--js-gold-light)]"
                      >
                        Join the Family
                      </Link>
                      <Link
                        to="/album"
                        className="inline-flex rounded-full border border-white/30 px-8 py-3.5 font-body text-sm text-white/90 transition-colors hover:border-[var(--js-gold)] hover:text-[var(--js-gold-light)]"
                      >
                        Written in Stone
                      </Link>
                    </div>
                    <p className="font-display mt-10 text-lg font-normal text-white text-legible">— Jah Spur</p>
                  </div>
                </div>
              );
            }

            // Bridging beat — minimal, text-only, no image.
            if (s.bridge) {
              return (
                <div
                  key={s.id}
                  data-testid={`about-stage-${s.id}`}
                  className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center"
                  style={{ opacity: op, pointerEvents: pe(op), transition: isMobile ? `opacity ${CROSSFADE_MS}ms ease` : "none" }}
                >
                  <p
                    className="font-accent max-w-lg text-2xl font-normal italic leading-snug text-white/85 text-legible sm:text-3xl"
                    style={{ transform: `scale(${contentScale})`, transition: "transform 0.1s linear" }}
                  >
                    {s.body}
                  </p>
                  {s.showChevron && <ScrollChevron />}
                </div>
              );
            }

            return (
              <div
                key={s.id}
                data-testid={`about-stage-${s.id}`}
                className="absolute inset-0 z-10 overflow-y-auto"
                style={{ opacity: op, pointerEvents: pe(op) }}
              >
                <div className="mx-auto grid min-h-full max-w-7xl grid-cols-1 items-start gap-7 px-6 pb-16 pt-24 lg:h-full lg:grid-cols-5 lg:items-center lg:gap-16 lg:px-8 lg:pb-12 lg:pt-16">
                  <div className="order-2 lg:order-1 lg:col-span-2">
                    <div
                      className="relative"
                      style={{ transform: `scale(${contentScale})`, transition: "transform 0.1s linear", transformOrigin: "left center" }}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 rounded-[40%]"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.32) 50%, rgba(0,0,0,0) 78%)",
                          filter: "blur(20px)",
                        }}
                      />
                      {s.opening && (
                        <span className="font-accent block text-[0.6rem] uppercase tracking-[0.4em] text-[var(--js-gold)] sm:text-xs">
                          {s.kicker}
                        </span>
                      )}
                      {s.title && (
                        <h2
                          className={`font-display text-2xl font-normal text-[var(--js-text)] text-legible sm:text-3xl ${s.opening ? "mt-2" : ""}`}
                        >
                          {s.title}
                        </h2>
                      )}
                      {/* Body/paragraph text: Cormorant Garamond (font-accent),
                          a genuine reading serif — Cinzel (font-display) is
                          reserved for headlines/titles only, since a display
                          face styled at paragraph length is what made this
                          not read right in the previous pass. */}
                      <div className={`${s.opening || s.title ? "mt-4" : ""} space-y-4`}>
                        {s.body.map((para, j) => (
                          <p
                            key={j}
                            className="font-accent text-lg font-normal leading-relaxed text-white/90 text-legible sm:text-xl lg:text-2xl"
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2 lg:col-span-3">
                    <div className="relative flex h-[36vh] items-center justify-center sm:h-[46vh] lg:h-[78vh]">
                      <MemoryMedia src={s.media} alt={s.alt} scale={imgScale} grade={gradeFor(i)} />
                    </div>
                  </div>
                  {s.showChevron && <ScrollChevron />}
                </div>
              </div>
            );
          })}

          <div
            className="absolute bottom-0 left-0 z-40 h-[2px] bg-gradient-to-r from-[var(--js-gold-accent)] to-[var(--js-gold-light)]"
            style={{
              width: isMobile ? `${((slide + 1) / N) * 100}%` : `${p * 100}%`,
              opacity: 0.7,
              transition: isMobile ? `width ${CROSSFADE_MS}ms ease` : "none",
            }}
          />
        </div>
      </section>

      {/* Remaining childhood photos (only the strongest one is used above in
          Section 1) — overflow destination now that the standalone Photos
          page has been folded into EPK's gallery instead. Applies to both
          mobile and desktop: unlike the pinned-stage photos above (which
          already get a full elliptical feather + starlight glow via
          MemoryMedia), these had a plain hard-edged rectangular border —
          now get the same starlight glow behind them, plus each of the
          four corners fading into the background instead of a hard line. */}
      <div className="relative z-10 bg-[var(--js-black)] py-24 text-center">
        <span className="overline">A Few More Moments</span>
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-4 px-6">
          {["/jahspur-about-10.jpg", "/jahspur-about-04.jpg", "/jahspur-about-03.jpg", "/jahspur-about-05.jpg", "/jahspur-about-09.jpg"].map((src) => (
            <div key={src} className="relative w-56">
              <div
                aria-hidden
                className="animate-breathe pointer-events-none absolute -inset-4"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(232,207,154,0.18) 0%, rgba(255,255,255,0.06) 45%, transparent 75%)",
                  filter: "blur(20px)",
                }}
              />
              <div className="relative overflow-hidden rounded-lg">
                <img src={src} alt="Jah Spur, a moment from his life" className="w-full object-cover" />
                {CORNER_FADES.map((corner) => (
                  <div key={corner.key} aria-hidden className="pointer-events-none absolute h-16 w-16" style={corner.style} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex items-center justify-center gap-7">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-accent text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-[var(--js-gold-light)]"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
