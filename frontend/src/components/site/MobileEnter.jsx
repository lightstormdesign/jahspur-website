import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { HERO_IMAGE_MOBILE, HERO_CUTOUT_MOBILE, HERO_PLATE_MOBILE } from "@/data/site";
import { tilt } from "@/utils/motion";

// Phone home: scroll to enter (Trev's flow, without the tap to enter).
//
// Two layers made in Canva on the same 1080x1920 canvas: the plate (trees
// and sky, Jah and the mic removed) and the cutout (Jah with the mic). All
// motion is applied imperatively in one rAF loop (no React re-renders):
//
//  - Always on, no scrolling needed: a slow 3D drift like Trev's hero. He
//    comes toward you on a diagonal to one side and back, pauses, then the
//    mirror to the other side (24s cycle); the trees drift the other way and
//    by less, so the two planes separate.
//  - Phone tilt (once motion access is allowed at the speaker or the menu)
//    leads the drift: tilt and he leans that way, nearer the further you go.
//  - Scroll: he pushes in faster than the trees (parallax), the scene darkens,
//    and the page carries on down into his story (About), with no tap.
const MOVE_S = 8;
const PAUSE_S = 4;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

export const MobileEnter = () => {
  const sectionRef = useRef(null);
  const plateRef = useRef(null);
  const meRef = useRef(null);
  const shadeRef = useRef(null);
  const cueRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    let t0 = null;
    let last = 0;
    let px = 0, py = 0, vx = 0, vy = 0; // the drift, spring-smoothed
    let sp = 0; // eased scroll progress

    const frame = (now) => {
      if (t0 === null) { t0 = now; last = now; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      // scroll progress through the pinned section
      const s = sectionRef.current;
      let p = 0;
      if (s) {
        const r = s.getBoundingClientRect();
        p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      }
      sp += (p - sp) * Math.min(1, dt * 10);

      // the automatic drift (Trev's): toward you and to one side, back, pause, mirrored
      const half = MOVE_S + PAUSE_S;
      const ph = t % (2 * half);
      const u = (ph % half) / MOVE_S;
      const autoNear = ph % half < MOVE_S ? (1 - Math.cos(2 * Math.PI * u)) / 2 : 0;
      const autoSide = (ph < half ? -1 : 1) * autoNear;
      const led = tilt.live;
      const w = led ? 0.45 : 1; // with tilt, the drift carries on beneath, smaller
      const aSide = clamp(autoSide * w + (led ? tilt.x : 0), -1, 1);
      const aNear = clamp(autoNear * w + (led ? Math.abs(tilt.x) * 0.8 + Math.max(0, -tilt.y) * 0.4 : 0));
      vx += ((aSide - px) * 22 - vx * 8) * dt;
      vy += ((aNear - py) * 22 - vy * 8) * dt;
      px += vx * dt;
      py += vy * dt;

      const m = reduce ? 0 : 1;
      const e = smooth(sp);
      // him: drifts most, pushes in most
      const meScale = 1.06 + 0.05 * py * m + 0.24 * e * m;
      const meX = px * 16 * m;
      const meY = (1 - py) * 8 * m - 30 * e * m;
      // the trees: the other way, and by less
      const bgScale = 1.08 + 0.015 * py * m + 0.08 * e * m;
      const bgX = -px * 7 * m;
      const bgY = -py * 3 * m;
      if (meRef.current) meRef.current.style.transform = `translate3d(${meX.toFixed(1)}px, ${meY.toFixed(1)}px, 0) scale(${meScale.toFixed(4)})`;
      if (plateRef.current) {
        plateRef.current.style.transform = `translate3d(${bgX.toFixed(1)}px, ${bgY.toFixed(1)}px, 0) scale(${bgScale.toFixed(4)})`;
        plateRef.current.style.filter = `blur(${(0.6 + 1.8 * e).toFixed(2)}px)`;
      }
      if (shadeRef.current) shadeRef.current.style.opacity = (0.15 + 0.85 * smooth(clamp((sp - 0.45) / 0.55))).toFixed(3);
      if (cueRef.current) cueRef.current.style.opacity = (1 - clamp(sp / 0.12)).toFixed(3);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const plate = HERO_PLATE_MOBILE || HERO_IMAGE_MOBILE;

  return (
    <section ref={sectionRef} data-testid="mobile-enter" data-nav-clear className="relative" style={{ height: "190svh" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[var(--js-black)]">
        <img
          ref={plateRef}
          src={plate}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ objectPosition: "50% 62%", transformOrigin: "50% 55%" }}
        />
        {HERO_CUTOUT_MOBILE && (
          <img
            ref={meRef}
            src={HERO_CUTOUT_MOBILE}
            alt="Jah Spur singing and playing guitar"
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{ objectPosition: "50% 62%", transformOrigin: "45% 70%" }}
          />
        )}

        {/* warm grade, a little mist, legibility at top and bottom */}
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: "rgba(226,140,60,0.18)" }} />
        <div aria-hidden className="mist-a pointer-events-none absolute top-[30%] h-[40%]" style={{ opacity: 0.35 }} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(11,8,6,0.55) 0%, rgba(11,8,6,0) 18%, rgba(11,8,6,0) 72%, rgba(11,8,6,0.75) 100%)" }}
        />
        {/* darkens as you scroll on, so the story below arrives out of the dark */}
        <div ref={shadeRef} aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--js-black)]" style={{ opacity: 0.15 }} />

        <div ref={cueRef} className="absolute inset-x-0 bottom-[max(28px,env(safe-area-inset-bottom))] flex flex-col items-center gap-2">
          <span className="font-display text-[0.66rem] uppercase tracking-[0.45em] text-[var(--js-text)] [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]">Scroll to enter</span>
          <ChevronDown size={18} className="text-[var(--js-gold)]" style={{ animation: "scroll-cue 2.2s ease-out infinite" }} />
        </div>
      </div>
    </section>
  );
};
