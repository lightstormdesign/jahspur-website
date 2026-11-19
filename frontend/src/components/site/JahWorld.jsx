import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { WORLD, LASTING_MESSAGE, HERO_BIO, HERO_BIO_MOBILE, SITE_TAGLINE, SITE_LOCATION } from "@/data/site";
import { tilt } from "@/utils/motion";

// Jah Spur's home: portal -> transition -> world. Burnell's pattern
// (burnellwebsite docs/SCROLL_WORLD_PLAYBOOK.md), one component for both sets
// (WORLD.phone / WORLD.desktop; Home remounts it when the breakpoint flips).
//
//   portal      Ben (real photo cutout) over the mist loop, with the slow 3D
//               drift (phone tilt / mouse lead it). "Tap or scroll to enter".
//               Page can't scroll.
//   transition  tap, click, wheel, swipe or key: Ben dissolves and the Kling
//               clip plays through on its own (never scrubbed). Its first
//               second has the portal's dim + blur baked in, fading out, so
//               nothing snaps. It ends on the world's first frame.
//   world       the layered world (living sky video + 4 PNG layers), starting
//               exactly where the clip ended. Scroll drives the descent: the
//               sky stays, the mountains, valley and canopy rise past at their
//               own depths, the near leaves part. Jah's words arrive at the
//               bottom, over the trees, with Read My Story.
//
// Kept exactly from Burnell (each fixed a real iPhone failure): portal loads
// alone first; the transition downloads whole into memory (blob) shortly
// after; phone world layers only load once the world starts; afterFirstFrame
// before uncovering any video; stall watcher; picture-freeze detector with a
// fresh <video>; 9s failsafe; the rgba(0,0,0,0.012) overlay over the playing
// clip; visibility:hidden on anything finished; posters = exact first frames;
// one rAF loop with imperative style writes; no backdrop-filter / blend modes
// / animated filters over moving layers; parallax eased in after the swap.

const OVERSCAN = 1.05; // room for drift/tilt without showing an edge
const DESCENT_SVH = 220; // scroll distance of the descent
const SCROLL_EASE = 6; // how quickly the world catches up to the finger (per s)
const TILT_X = 28; // canvas px of sideways parallax at full tilt, nearest layer
const TILT_Y = 18;
const PAR_RAMP_S = 1.5; // parallax eases in after the swap (no sideways jump)
const STORY_DIM = 0.5; // how dark the trees get behind Jah's words
const TRANSITION_FAILSAFE_MS = 9000;
const WARM_DELAY_MS = 800;
const WARM_FALLBACK_MS = 3500;
const LAYERS_FALLBACK_MS = 6000;
const STALL_MS = 1200;
const MOVE_S = 8; // portal drift: toward you and to one side ...
const PAUSE_S = 4; // ... then a pause, then mirrored

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);

// Run cb once the video has actually drawn a frame (iOS reports `playing`
// before it has), whichever signal comes first.
const afterFirstFrame = (v, cb) => {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    v.removeEventListener("timeupdate", onTime);
    clearTimeout(t);
    cb();
  };
  const onTime = () => v.currentTime > 0 && go();
  v.addEventListener("timeupdate", onTime);
  const t = setTimeout(go, 150);
  if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(go);
};

export const JahWorld = ({ isMobile }) => {
  const S = isMobile ? WORLD.phone : WORLD.desktop;
  const [phase, setPhase] = useState("portal"); // portal | transition | world
  const [warm, setWarm] = useState(false);
  const [entered, setEntered] = useState(false); // tap happened (Ben fading)
  const [transitionShown, setTransitionShown] = useState(false);
  const [layersReady, setLayersReady] = useState(false);
  const [fading, setFading] = useState(false); // the held last frame is fading out
  const [holdGone, setHoldGone] = useState(false); // ... and gone (visibility: hidden)
  const [reduce] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const stageRef = useRef(null);
  const loopRef = useRef(null);
  const benRef = useRef(null);
  const transitionRef = useRef(null);
  const recoveredRef = useRef(null);
  const skyVideoRef = useRef(null);
  const layerRefs = useRef([]);
  const rectRefs = useRef({}); // portal loop / ben / transition / sky video wrappers
  const spacerRef = useRef(null);
  const shadeRef = useRef(null);
  const introRef = useRef(null);
  const cueRef = useRef(null);
  const enteringRef = useRef(false);
  const phaseRef = useRef("portal");
  const worldAtRef = useRef(0);
  const failsafeRef = useRef(null);
  const stallRef = useRef(null);
  const blobUrlRef = useRef(null);
  const layersLoaded = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "world") worldAtRef.current = performance.now();
  }, [phase]);

  const loadWorld = !isMobile ? warm : phase === "world"; // phones: only once in the world

  // --- loading order ---------------------------------------------------------
  useEffect(() => {
    if (warm) return;
    const t = setTimeout(() => setWarm(true), WARM_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [warm]);
  const onLoopPlaying = (e) => afterFirstFrame(e.currentTarget, () => setTimeout(() => setWarm(true), WARM_DELAY_MS));

  useEffect(() => {
    if (!warm) return;
    const v = transitionRef.current;
    if (!v) return;
    let cancelled = false;
    fetch(S.transition.src)
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((blob) => {
        if (cancelled || enteringRef.current) return;
        blobUrlRef.current = URL.createObjectURL(blob);
        v.src = blobUrlRef.current;
        v.load(); // load only: never prime with play/pause (froze iOS)
      })
      .catch(() => {
        if (cancelled || enteringRef.current) return;
        v.preload = "auto";
        v.load();
      });
    return () => {
      cancelled = true;
    };
  }, [warm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      clearInterval(stallRef.current);
      clearTimeout(failsafeRef.current);
    },
    []
  );

  const total = S.layers.length + 1; // + the sky video's poster
  const onLayerLoad = () => {
    layersLoaded.current += 1;
    if (layersLoaded.current >= total) setLayersReady(true);
  };
  useEffect(() => {
    if (phase !== "world" || layersReady) return;
    const t = setTimeout(() => setLayersReady(true), LAYERS_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [phase, layersReady]);

  // once the clip has ended and the layers are in: start the living sky, fade the held last frame out
  useEffect(() => {
    if (phase !== "world" || !layersReady) return;
    skyVideoRef.current?.play().catch(() => {});
    setFading(true);
    const t = setTimeout(() => setHoldGone(true), 1450);
    return () => clearTimeout(t);
  }, [phase, layersReady]);

  // --- page scroll: locked until the world ------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    if (phase === "world") {
      window.scrollTo(0, 0);
      root.style.overflow = "";
      root.style.overscrollBehaviorY = "none";
      document.body.style.overscrollBehaviorY = "none";
      loopRef.current?.pause();
    } else {
      root.style.overflow = "hidden";
    }
    return () => {
      root.style.overflow = "";
      root.style.overscrollBehaviorY = "";
      document.body.style.overscrollBehaviorY = "";
    };
  }, [phase]);

  // --- transition --------------------------------------------------------------
  const enterWorld = () => {
    clearTimeout(failsafeRef.current);
    clearInterval(stallRef.current);
    setPhase("world");
  };

  const playTransition = (v) =>
    v.play().catch(() => {
      if (!v.src.startsWith("blob:")) return enterWorld();
      v.src = S.transition.src;
      v.play().catch(enterWorld);
    });

  // every 250ms: resume if iOS paused it; if its clock is stuck, kick once, then move on
  const watchStall = (first) => {
    let lastT = -1;
    let lastMoveAt = performance.now();
    let kicks = 0;
    clearInterval(stallRef.current);
    stallRef.current = setInterval(() => {
      const v = recoveredRef.current || first;
      if (v.ended) return clearInterval(stallRef.current);
      const now = performance.now();
      if (v.paused) v.play().catch(() => {});
      if (v.currentTime !== lastT) {
        lastT = v.currentTime;
        lastMoveAt = now;
      }
      if (now - lastMoveAt < STALL_MS) return;
      if (kicks < 1) {
        kicks++;
        lastMoveAt = now;
        try {
          v.currentTime = v.currentTime + 0.001;
        } catch (e) {}
        v.play().catch(() => {});
      } else enterWorld();
    }, 250);
  };

  // a frozen picture (clock running, image stuck) gets a fresh player on top, from the same spot
  const recoverTransition = (v) => {
    const t = v.currentTime;
    const nv = document.createElement("video");
    nv.muted = true;
    nv.playsInline = true;
    nv.setAttribute("playsinline", "");
    nv.setAttribute("aria-hidden", "true");
    nv.preload = "auto";
    nv.className = v.className;
    nv.style.cssText = v.style.cssText;
    nv.style.opacity = "0";
    nv.src = v.src;
    nv.addEventListener(
      "loadedmetadata",
      () => {
        try {
          nv.currentTime = t;
        } catch (e) {}
        nv.play().catch(enterWorld);
      },
      { once: true }
    );
    nv.addEventListener(
      "playing",
      () =>
        afterFirstFrame(nv, () => {
          nv.style.opacity = "1";
          v.pause();
          v.style.visibility = "hidden";
        }),
      { once: true }
    );
    nv.addEventListener("ended", enterWorld);
    v.parentNode.insertBefore(nv, v.nextSibling);
    recoveredRef.current = nv;
    clearTimeout(failsafeRef.current);
    failsafeRef.current = setTimeout(enterWorld, TRANSITION_FAILSAFE_MS);
  };

  useEffect(() => {
    if (phase !== "transition") return;
    const cur = () => recoveredRef.current || transitionRef.current;
    const c = document.createElement("canvas");
    c.width = c.height = 24;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!cur() || !ctx) return;
    let prev = null;
    let sameSince = 0;
    const iv = setInterval(() => {
      const v = cur();
      if (v.readyState < 2 || v.paused || v.ended) return;
      let px;
      try {
        ctx.drawImage(v, 0, 0, 24, 24);
        px = ctx.getImageData(0, 0, 24, 24).data;
      } catch (e) {
        return clearInterval(iv);
      }
      let diff = Infinity;
      if (prev) {
        diff = 0;
        for (let i = 0; i < px.length; i += 4) diff += Math.abs(px[i] - prev[i]) + Math.abs(px[i + 1] - prev[i + 1]);
      }
      prev = px;
      const now = performance.now();
      // the clip's last second is nearly still on purpose: only judge while it should be moving
      if (diff > 24 || (v.duration && v.duration - v.currentTime < 1.2)) {
        sameSince = 0;
        return;
      }
      if (!sameSince) sameSince = now;
      if (now - sameSince < 600) return;
      if (!recoveredRef.current) {
        sameSince = 0;
        prev = null;
        recoverTransition(v);
      } else enterWorld();
    }, 300);
    return () => clearInterval(iv);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // a recovered player hands off like the original
  useEffect(() => {
    const nv = recoveredRef.current;
    if (phase !== "world" || !nv || !fading) return;
    nv.style.transition = "opacity 1.4s ease";
    nv.style.opacity = "0";
    const t = setTimeout(() => nv.remove(), 1500);
    return () => clearTimeout(t);
  }, [phase, fading]);

  const enter = () => {
    if (enteringRef.current || phaseRef.current !== "portal") return;
    enteringRef.current = true;
    setWarm(true);
    setEntered(true);
    const v = transitionRef.current;
    if (reduce || !v) return enterWorld();
    setPhase("transition");
    playTransition(v);
    watchStall(v);
    failsafeRef.current = setTimeout(enterWorld, TRANSITION_FAILSAFE_MS);
  };

  // --- enter triggers: tap / click / wheel / swipe / keys (not on the header) ----
  useEffect(() => {
    if (phase !== "portal") return;
    const inHeader = (e) => e.target?.closest?.("header");
    let y0 = null;
    let moved = false;
    const onWheel = (e) => e.deltaY > 4 && enter();
    const onTS = (e) => {
      if (inHeader(e)) return;
      y0 = e.touches[0].clientY;
      moved = false;
    };
    const onTM = (e) => {
      if (y0 == null) return;
      if (Math.abs(e.touches[0].clientY - y0) > 10) moved = true;
      if (y0 - e.touches[0].clientY > 24) enter();
    };
    const onTE = (e) => {
      if (y0 != null && !moved && !inHeader(e)) enter();
      y0 = null;
    };
    const onClick = (e) => {
      if (e.pointerType === "touch" || inHeader(e)) return;
      enter();
    };
    const onKey = (e) => ["ArrowDown", "PageDown", " ", "Enter"].includes(e.key) && !inHeader(e) && enter();
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchmove", onTM, { passive: true });
    window.addEventListener("touchend", onTE, { passive: true });
    window.addEventListener("pointerup", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", onTE);
      window.removeEventListener("pointerup", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- the engine: one rAF loop, imperative writes, nothing re-renders --------
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    let ys = window.scrollY;
    let mx = 0;
    let my = 0;
    let mouse = false;
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    let vx = 0;
    let vy = 0;
    let lastSize = "";
    let lastKey = "";
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      mouse = true;
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const [CW, CH] = S.canvas;
    const [RX, RY, RW, RH] = S.region;

    const placeRect = (el, rect, k, ox, oy) => {
      if (!el) return;
      el.style.width = `${(rect[2] * k).toFixed(1)}px`;
      el.style.height = `${(rect[3] * k).toFixed(1)}px`;
      el.style.left = `${(ox + rect[0] * k).toFixed(1)}px`;
      el.style.top = `${(oy + rect[1] * k).toFixed(1)}px`;
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const stage = stageRef.current;
      if (!stage) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const k = OVERSCAN * Math.max(W / RW, H / RH);
      const ox = (W - RW * k) / 2 - RX * k;
      const oy = (H - RH * k) / 2 - RY * k;
      const size = `${W}|${H}`;
      if (size !== lastSize) {
        lastSize = size;
        placeRect(rectRefs.current.loop, S.portal.rect, k, ox, oy);
        placeRect(rectRefs.current.ben, S.portal.rect, k, ox, oy);
        placeRect(rectRefs.current.transition, S.transition.rect, k, ox, oy);
        layerRefs.current.forEach((el) => el && (el.style.width = `${(CW * k).toFixed(1)}px`));
      }

      const reduceM = reduce ? 0 : 1;
      const ph = phaseRef.current;
      // lead: phone tilt (once allowed), else the mouse
      const ix = tilt.live ? tilt.x : mouse ? mx : 0;
      const iy = tilt.live ? tilt.y : mouse ? my : 0;

      if (ph !== "world") {
        // portal drift (Trev's): toward you to one side, back, pause, mirrored; tilt/mouse lead it
        const t = (now - t0) / 1000;
        const half = MOVE_S + PAUSE_S;
        const phs = t % (2 * half);
        const u = (phs % half) / MOVE_S;
        const autoNear = phs % half < MOVE_S ? (1 - Math.cos(2 * Math.PI * u)) / 2 : 0;
        const autoSide = (phs < half ? -1 : 1) * autoNear;
        const led = tilt.live || mouse;
        const w = led ? 0.45 : 1;
        const aSide = Math.max(-1, Math.min(1, autoSide * w + (led ? ix : 0)));
        const aNear = clamp01(autoNear * w + (led ? Math.abs(ix) * 0.8 + Math.max(0, -iy) * 0.4 : 0));
        vx += ((aSide - px) * 22 - vx * 8) * dt;
        vy += ((aNear - py) * 22 - vy * 8) * dt;
        px += vx * dt;
        py += vy * dt;
        const D = (isMobile ? 14 : 22) * reduceM;
        if (benRef.current)
          benRef.current.style.transform = `translate3d(${(px * D).toFixed(1)}px, ${((1 - py) * 6 * reduceM).toFixed(1)}px, 0) scale(${(1 + 0.045 * py * reduceM).toFixed(4)})`;
        if (loopRef.current)
          loopRef.current.style.transform = `translate3d(${(-px * D * 0.4).toFixed(1)}px, ${(-py * 2 * reduceM).toFixed(1)}px, 0) scale(${(1 + 0.012 * py * reduceM).toFixed(4)})`;
      }

      // world (also placed during the transition so it's ready underneath)
      const target = window.scrollY;
      ys += (target - ys) * (1 - Math.exp(-dt * SCROLL_EASE));
      if (Math.abs(target - ys) < 0.3) ys = target;
      const Dpx = spacerRef.current ? spacerRef.current.offsetHeight : H * (DESCENT_SVH / 100);
      const p = ph === "world" ? clamp01(ys / Dpx) : 0;
      const e = smooth(p);
      tx += (ix - tx) * 0.1;
      ty += (iy - ty) * 0.1;
      const ramp = ph === "world" ? smooth(clamp01((now - worldAtRef.current) / 1000 / PAR_RAMP_S)) : 0;
      const par = ramp * (1 - smooth(clamp01((p - 0.85) / 0.15))) * reduceM; // landed = still
      const key = `${size}|${ys.toFixed(1)}|${(tx * par).toFixed(3)}|${(ty * par).toFixed(3)}`;
      if (key !== lastKey) {
        lastKey = key;
        S.layers.forEach((L, i) => {
          const el = layerRefs.current[i];
          if (!el) return;
          let g;
          let ax;
          let ay;
          let dy = 0;
          if (isMobile) {
            // phones: grow from the bottom edge (it never rises into view), nearer faster
            g = L.part ? 1 + 0.7 * e : 1 + L.depth * 0.56 * e;
            ax = CW / 2;
            ay = L.part ? CH * 0.63 : CH;
          } else {
            // desktop: the tall canvas slides up past, nearer faster, and grows a little
            dy = -L.depth * 520 * e;
            g = L.part ? 1 + 0.6 * e : 1 + L.depth * 0.12 * e;
            ax = CW / 2;
            ay = L.part ? 800 : CH;
            if (L.part) dy = -200 * e;
          }
          const gx = ax * (1 - g) + tx * par * (L.depth - 0.3) * TILT_X;
          const gy = ay * (1 - g) + dy + ty * par * Math.max(0, L.depth - 0.1) * TILT_Y;
          el.style.transform = `translate3d(${(ox + gx * k).toFixed(1)}px, ${(oy + gy * k).toFixed(1)}px, 0) scale(${g.toFixed(4)})`;
          // the living sky rides with the sky layer
          if (L.key === "sky" && rectRefs.current.sky) {
            const sk = rectRefs.current.sky;
            const r = S.sky.rect;
            sk.style.width = `${(r[2] * k).toFixed(1)}px`;
            sk.style.height = `${(r[3] * k).toFixed(1)}px`;
            sk.style.transform = `translate3d(${(ox + (gx + r[0]) * k).toFixed(1)}px, ${(oy + (gy + r[1]) * k).toFixed(1)}px, 0)`;
          }
        });
        if (shadeRef.current) shadeRef.current.style.opacity = (STORY_DIM * smooth(clamp01((p - 0.55) / 0.4))).toFixed(3);
        if (introRef.current) {
          const o = smooth(clamp01((p - 0.7) / 0.25));
          introRef.current.style.opacity = o.toFixed(3);
          introRef.current.style.transform = `translate3d(0, ${((1 - o) * 26).toFixed(1)}px, 0)`;
          introRef.current.style.visibility = o > 0.01 ? "visible" : "hidden";
          introRef.current.style.pointerEvents = o > 0.6 ? "auto" : "none";
        }
        if (cueRef.current) cueRef.current.style.opacity = (1 - clamp01(p / 0.08)).toFixed(3);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  const inWorld = phase === "world";
  // the portal loop sits above the world: gone the moment the world phase starts (the held last frame covers it)
  const portalVisible = phase !== "world";
  const abs = "absolute left-0 top-0";

  return (
    <div data-testid="jah-world" data-nav-clear className="relative">
      {/* the descent's scroll length (the page can only scroll in the world) */}
      <div ref={spacerRef} style={{ height: `${DESCENT_SVH}svh` }} />
      <div style={{ height: "100svh" }} />

      <div ref={stageRef} className="fixed inset-x-0 top-0 z-10 overflow-hidden bg-[var(--js-black)]" style={{ height: "100lvh" }}>
        {/* ---------- world (underneath; hidden until it's needed) ---------- */}
        <div className="absolute inset-0" style={{ visibility: inWorld ? "visible" : "hidden" }}>
          {S.layers.map((L, i) => (
            <div key={L.key} className="contents">
              <img
                ref={(el) => (layerRefs.current[i] = el)}
                src={loadWorld ? L.src : undefined}
                alt=""
                aria-hidden
                draggable={false}
                onLoad={onLayerLoad}
                onError={onLayerLoad}
                className={`${abs} max-w-none select-none will-change-transform`}
                style={{ transformOrigin: "0 0", height: "auto" }}
              />
              {L.key === "sky" && (
                <div ref={(el) => (rectRefs.current.sky = el)} className={`${abs} will-change-transform`}>
                  <video
                    ref={skyVideoRef}
                    className="h-full w-full object-fill"
                    src={loadWorld ? S.sky.src : undefined}
                    poster={loadWorld ? S.sky.poster : undefined}
                    muted
                    loop
                    playsInline
                    preload={loadWorld ? "auto" : "none"}
                    aria-hidden
                    tabIndex={-1}
                    onLoadedData={onLayerLoad}
                    onError={onLayerLoad}
                  />
                </div>
              )}
            </div>
          ))}
          <div ref={shadeRef} aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--js-black)]" style={{ opacity: 0 }} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[26%]"
            style={{ background: "linear-gradient(to bottom, rgba(10,4,4,0.55), rgba(10,4,4,0))" }}
          />
        </div>

        {/* ---------- portal: the mist loop, then Ben ---------- */}
        <div className="absolute inset-0" style={{ visibility: portalVisible ? "visible" : "hidden" }}>
          <div ref={(el) => (rectRefs.current.loop = el)} className={`${abs} overflow-visible`}>
            <video
              ref={loopRef}
              className="h-full w-full object-fill will-change-transform"
              src={S.portal.loop}
              poster={S.portal.poster}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              aria-hidden
              tabIndex={-1}
              onPlaying={onLoopPlaying}
            />
          </div>
        </div>

        {/* ---------- transition (above the loop, below Ben) ---------- */}
        <div
          ref={(el) => (rectRefs.current.transition = el)}
          className={abs}
          style={{
            opacity: transitionShown && !fading ? 1 : 0,
            transition: fading ? "opacity 1.4s ease" : "opacity 0.45s ease",
            visibility: entered && !(holdGone && phase === "world") ? "visible" : "hidden",
          }}
        >
          <video
            ref={transitionRef}
            className="h-full w-full object-fill"
            poster={S.transition.poster}
            muted
            playsInline
            preload="none"
            aria-hidden
            tabIndex={-1}
            onPlaying={(e) => afterFirstFrame(e.currentTarget, () => setTransitionShown(true))}
            onEnded={enterWorld}
          />
        </div>
        {phase === "transition" && <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "rgba(0,0,0,0.012)" }} />}

        {/* ---------- Ben, the portal's shading and copy ---------- */}
        <div
          className="absolute inset-0"
          style={{
            opacity: entered ? 0 : 1,
            transition: "opacity 0.55s ease",
            visibility: transitionShown || phase === "world" ? "hidden" : "visible",
          }}
        >
          <div ref={(el) => (rectRefs.current.ben = el)} className={abs}>
            <img
              ref={benRef}
              src={S.portal.cutout}
              alt="Jah Spur singing and playing guitar"
              draggable={false}
              className="h-full w-full select-none will-change-transform"
              style={{ transformOrigin: isMobile ? "45% 70%" : "8% 40%" }}
            />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[48%]" style={{ background: "linear-gradient(to bottom, rgba(10,4,4,0.7) 0%, rgba(10,4,4,0.36) 45%, transparent 100%)" }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%]" style={{ background: "linear-gradient(to top, rgba(10,4,4,0.78) 0%, rgba(10,4,4,0.38) 45%, transparent 100%)" }} />
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 85% 75% at 50% 48%, transparent 45%, rgba(10,4,4,0.58) 100%)" }} />
          {!isMobile && (
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, transparent 38%, rgba(10,4,4,0.35) 62%, rgba(10,4,4,0.55) 100%)" }} />
          )}

          {isMobile ? (
            <div className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ top: "25.5svh", transform: "translateY(-50%)" }}>
              <div className="relative flex flex-col items-center">
                <div aria-hidden className="js-pool absolute left-1/2 top-1/2 h-[260%] w-[130%] -translate-x-1/2 -translate-y-1/2" />
                <span className="js-cue relative text-[1.25rem]" style={{ animation: "breathe 3.2s ease-in-out infinite" }}>
                  Scroll to Enter
                </span>
                <span className="relative mt-2 font-display text-[0.6rem] uppercase tracking-[0.4em] text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">or tap</span>
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[38%] flex-col items-center justify-center">
              <div className="relative flex flex-col items-center">
                <div aria-hidden className="js-pool absolute left-1/2 top-1/2 h-[120%] w-[140%] -translate-x-1/2 -translate-y-1/2" />
                <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="js-logo-calm relative h-auto w-[min(15rem,17vw,30vh)]" />
                <span className="relative mt-[clamp(1.1rem,3vh,1.8rem)] flex items-center gap-4" style={{ animation: "breathe 3.2s ease-in-out infinite" }}>
                  <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-white/90" />
                  <span className="js-cue text-[clamp(1rem,1.25vw,1.4rem)]">Scroll to Enter</span>
                  <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-white/90" />
                </span>
                <span className="relative mt-3 font-display text-[0.62rem] uppercase tracking-[0.4em] text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">or click</span>
              </div>
            </div>
          )}
        </div>

        {/* ---------- in the world: scroll cue, then Jah's words over the trees ---------- */}
        <div
          ref={cueRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[max(26px,env(safe-area-inset-bottom))] flex flex-col items-center gap-1"
          style={{ visibility: inWorld && holdGone ? "visible" : "hidden" }}
        >
          <span className="font-display text-[0.62rem] uppercase tracking-[0.45em] text-white/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.8)]">Scroll</span>
          <ChevronDown size={18} className="text-[var(--js-gold-light)]" style={{ animation: "scroll-cue 2.2s ease-out infinite" }} />
        </div>

        <div ref={introRef} className="absolute inset-0 flex items-center justify-center px-6 text-center" style={{ opacity: 0, visibility: "hidden" }}>
          <div className="relative mx-auto flex max-w-xl flex-col items-center md:max-w-2xl">
            <div aria-hidden className="js-pool absolute left-1/2 top-1/2 h-[130%] w-[120%] -translate-x-1/2 -translate-y-1/2" />
            {isMobile ? (
              <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="relative mb-7 h-auto w-[min(10rem,42vw)]" />
            ) : (
              <p className="font-display relative mb-6 text-xs uppercase tracking-[0.42em] text-[var(--js-gold)] text-legible">
                {SITE_TAGLINE} · {SITE_LOCATION}
              </p>
            )}
            <div className="tricolor-rule relative" />
            <h2 className={`font-accent relative mt-6 italic leading-snug [text-wrap:balance] text-[var(--js-text)] text-legible ${isMobile ? "text-[1.45rem]" : "text-[2.6rem]"}`}>
              {LASTING_MESSAGE[0]}
            </h2>
            <p className={`font-display relative mt-3 uppercase tracking-[0.3em] text-gold-grad ${isMobile ? "text-sm" : "text-lg"}`}>{LASTING_MESSAGE[1]}</p>
            <p className="font-body relative mt-4 text-sm font-light leading-relaxed text-white/85 text-legible sm:text-[0.95rem]">{isMobile ? HERO_BIO_MOBILE : HERO_BIO}</p>
            <Link
              to="/about"
              data-testid="home-read-story"
              className="animate-glow-pulse relative mt-8 inline-flex rounded-full bg-[var(--js-gold)] px-8 py-3.5 font-body text-sm font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)]"
            >
              Read My Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
