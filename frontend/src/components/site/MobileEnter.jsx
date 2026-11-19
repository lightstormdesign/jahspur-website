import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  HERO_IMAGE_MOBILE,
  HERO_CUTOUT_MOBILE,
  HERO_PLATE_MOBILE,
  HERO_IMAGE_DESKTOP,
  HERO_CUTOUT_DESKTOP,
  HERO_PLATE_DESKTOP,
} from "@/data/site";
import { tilt } from "@/utils/motion";
import { useIsMobile } from "@/hooks/useIsMobile";

// Home: scroll to enter (Trev's flow, without the tap to enter), on phones
// and desktop, each with its own Canva frames (phone 1080x1920, desktop
// 1920x1080).
//
// Layers: the plate (trees and sky, Jah and the mic removed) and the cutout
// (Jah with the mic). Without a cutout the full photo is one layer. All
// motion runs imperatively in one rAF loop (no React re-renders):
//
//  - Always on: a slow 3D drift like Trev's hero. He comes toward you on a
//    diagonal to one side and back, pauses, then the mirror to the other side
//    (24s cycle); the trees drift the other way and by less.
//  - Leading it: phone tilt (once motion access is allowed at the speaker or
//    the menu), or the mouse on desktop.
//  - Scroll: he pushes in faster than the trees (parallax), the scene
//    darkens, and the page carries on down into his story (About).
const MOVE_S = 8;
const PAUSE_S = 4;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

const SETS = {
  mobile: {
    full: HERO_IMAGE_MOBILE,
    cutout: HERO_CUTOUT_MOBILE,
    plate: HERO_PLATE_MOBILE,
    pos: "50% 62%",
    meOrigin: "45% 70%",
    plateOrigin: "50% 55%",
    drift: 16,
  },
  desktop: {
    full: HERO_IMAGE_DESKTOP,
    cutout: HERO_CUTOUT_DESKTOP,
    plate: HERO_PLATE_DESKTOP,
    pos: "0% 35%",
    meOrigin: "8% 40%",
    plateOrigin: "40% 45%",
    drift: 26,
  },
};

export const MobileEnter = () => {
  const isMobile = useIsMobile();
  const set = isMobile ? SETS.mobile : SETS.desktop;
  const layered = Boolean(set.cutout && set.plate);

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
    let mx = 0, my = 0, mouse = false; // the mouse, -1..1 from centre
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      mouse = true;
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const frame = (now) => {
      if (t0 === null) { t0 = now; last = now; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

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
      const ix = tilt.live ? tilt.x : mouse ? mx : 0;
      const iy = tilt.live ? tilt.y : mouse ? my : 0;
      const led = tilt.live || mouse;
      const w = led ? 0.45 : 1; // led: the drift carries on beneath, smaller
      const aSide = clamp(autoSide * w + (led ? ix : 0), -1, 1);
      const aNear = clamp(autoNear * w + (led ? Math.abs(ix) * 0.8 + Math.max(0, -iy) * 0.4 : 0));
      vx += ((aSide - px) * 22 - vx * 8) * dt;
      vy += ((aNear - py) * 22 - vy * 8) * dt;
      px += vx * dt;
      py += vy * dt;

      const m = reduce ? 0 : 1;
      const e = smooth(sp);
      const D = set.drift;
      if (layered) {
        // him: drifts most, pushes in most; the trees the other way, by less
        const meScale = 1.06 + 0.05 * py * m + 0.24 * e * m;
        if (meRef.current)
          meRef.current.style.transform = `translate3d(${(px * D * m).toFixed(1)}px, ${((1 - py) * 8 * m - 30 * e * m).toFixed(1)}px, 0) scale(${meScale.toFixed(4)})`;
        if (plateRef.current) {
          plateRef.current.style.transform = `translate3d(${(-px * D * 0.45 * m).toFixed(1)}px, ${(-py * 3 * m).toFixed(1)}px, 0) scale(${(1.08 + 0.015 * py * m + 0.08 * e * m).toFixed(4)})`;
          plateRef.current.style.filter = `blur(${(2.2 + 1.8 * e).toFixed(2)}px) brightness(0.72)`;
        }
      } else if (plateRef.current) {
        // one layer: a gentler version of his movement
        plateRef.current.style.transform = `translate3d(${(px * D * 0.6 * m).toFixed(1)}px, ${((1 - py) * 5 * m - 20 * e * m).toFixed(1)}px, 0) scale(${(1.06 + 0.035 * py * m + 0.16 * e * m).toFixed(4)})`;
      }
      if (shadeRef.current) shadeRef.current.style.opacity = (0.15 + 0.85 * smooth(clamp((sp - 0.45) / 0.55))).toFixed(3);
      if (cueRef.current) {
        cueRef.current.style.opacity = (1 - clamp(sp / 0.14)).toFixed(3);
        cueRef.current.style.translate = `${(px * 6 * m).toFixed(1)}px ${(-e * 40).toFixed(1)}px`;
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [layered, set]);

  return (
    <section ref={sectionRef} data-testid="mobile-enter" data-nav-clear className="relative" style={{ height: isMobile ? "190svh" : "200vh" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[var(--js-black)]">
        <img
          ref={plateRef}
          src={layered ? set.plate : set.full}
          alt={layered ? "" : "Jah Spur singing and playing guitar"}
          aria-hidden={layered || undefined}
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ objectPosition: set.pos, transformOrigin: layered ? set.plateOrigin : set.meOrigin }}
        />
        {layered && (
          <img
            ref={meRef}
            src={set.cutout}
            alt="Jah Spur singing and playing guitar"
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{ objectPosition: set.pos, transformOrigin: set.meOrigin }}
          />
        )}

        {/* warm grade, a little mist */}
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: "rgba(226,140,60,0.18)" }} />
        <div aria-hidden className="mist-a pointer-events-none absolute top-[30%] h-[40%]" style={{ opacity: 0.35 }} />
        {/* Vignette (Soleil's + Trev's): a dark fall-off from the top and a
            heavier one from the bottom, darkened sides; on desktop also a
            shade over the right, where the logo and the cue sit */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[48%]" style={{ background: "linear-gradient(to bottom, rgba(10,4,4,0.72) 0%, rgba(10,4,4,0.38) 45%, transparent 100%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%]" style={{ background: "linear-gradient(to top, rgba(10,4,4,0.8) 0%, rgba(10,4,4,0.4) 45%, transparent 100%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 85% 75% at 50% 48%, transparent 45%, rgba(10,4,4,0.6) 100%)" }} />
        {!isMobile && (
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, transparent 38%, rgba(10,4,4,0.35) 62%, rgba(10,4,4,0.55) 100%)" }} />
        )}
        {/* darkens as you scroll on, so the story below arrives out of the dark */}
        <div ref={shadeRef} aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--js-black)]" style={{ opacity: 0.15 }} />

        {isMobile ? (
          // Phones (Trev's placement): Scroll to Enter up top, in the space
          // between the header logo and the top of his head
          <div ref={cueRef} className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ top: "25.5svh", transform: "translateY(-50%)" }}>
            <div className="relative flex justify-center">
              <div aria-hidden className="js-pool absolute left-1/2 top-1/2 h-[260%] w-[130%] -translate-x-1/2 -translate-y-1/2" />
              <span className="relative flex items-center gap-3" style={{ animation: "breathe 3.2s ease-in-out infinite" }}>
                <span aria-hidden className="h-px w-7 bg-gradient-to-r from-transparent to-white/90" />
                <span className="js-cue text-[1.3rem]">Scroll to Enter</span>
                <span aria-hidden className="h-px w-7 bg-gradient-to-l from-transparent to-white/90" />
              </span>
            </div>
          </div>
        ) : (
          // Desktop: his logo, big, on the right, with Scroll to Enter under
          // it as the subtitle (him on the left, the sign on the right)
          <div ref={cueRef} className="pointer-events-none absolute inset-y-0 right-0 flex w-[38%] flex-col items-center justify-center">
            <div className="relative flex flex-col items-center">
              <div aria-hidden className="js-pool absolute left-1/2 top-1/2 h-[125%] w-[150%] -translate-x-1/2 -translate-y-1/2" />
              <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="js-logo-glow relative h-auto w-[min(22rem,25vw,42vh)]" />
              <span className="relative mt-[clamp(1.4rem,4vh,2.4rem)] flex items-center gap-5" style={{ animation: "breathe 3.2s ease-in-out infinite" }}>
                <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-white/90" />
                <span className="js-cue text-[clamp(1.2rem,1.6vw,1.9rem)]">Scroll to Enter</span>
                <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-white/90" />
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
