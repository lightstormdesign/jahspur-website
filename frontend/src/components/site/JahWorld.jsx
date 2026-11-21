import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { WORLD, HERO_BIO, HERO_BIO_MOBILE, SITE_TAGLINE, SITE_LOCATION, CALL_TO_ACTION, ARTIST_NAME } from "@/data/site";
import { ABOUT_STAGES } from "@/pages/About";
import { tilt } from "@/utils/motion";
import { PortalLotus } from "@/components/site/PortalLotus";

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
//   world       Burnell's world, to the letter: the layers start exactly where
//               the clip ended, blurred and dimmed under the landing (his logo
//               with its glow, the tagline, the location, the short bio, the
//               scroll capsule). Scrolling lifts the blur and descends (far
//               layers barely move, the near leaves rise and part), then the
//               story chapters (shared with About) fade in and out by scroll
//               position, settling on each (proximity snap), while the world
//               keeps drifting toward you: each layer grows by its depth, the
//               front leaves the most.
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
// how far (canvas units) the front leaves' cut edges sit past the screen edge:
// more than the mouse/tilt can slide them (TILT_X at depth 1), so never seen
const EDGE_SPARE = 36;
const SCROLL_EASE = 5; // how quickly the world catches up to the finger (per s), Burnell's
const TILT_X = 28; // canvas px of sideways parallax at full tilt, nearest layer
const TILT_Y = 18;
const PAR_RAMP_S = 1.5; // parallax eases in after the swap (no sideways jump)
const TRANSITION_FAILSAFE_MS = 9000;
const WARM_DELAY_MS = 800;
const WARM_FALLBACK_MS = 3500;
const LAYERS_FALLBACK_MS = 6000;
const STALL_MS = 1200;
const LANDING_EARLY_S = 1.3; // the landing starts coming in this long before the clip ends
const MOVE_S = 8; // portal drift: toward you and to one side ...
const PAUSE_S = 4; // ... then a pause, then mirrored
// Burnell's world numbers (WorldHome.jsx / DesktopWorld.jsx)
const DESCENT = { phone: 100, desktop: 90 }; // svh / vh of scroll for the descent: about a screen, then the story
const CHAPTER = 100; // per story chapter
// where the first chapter is centred (svh / vh): it starts fading in half a chapter earlier,
// while the descent is still playing underneath it
const STORY_AT = { phone: 125, desktop: 120 };
const STORY_ZOOM = { phone: 0.5, desktop: 0.35 }; // how much the nearest layer grows over the story
const STORY_DIM = { phone: 0.55, desktop: 0.62 };
const TEXT_POOL = "radial-gradient(ellipse at center, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 48%, transparent 75%)";
const FEATHER = "radial-gradient(ellipse 72% 76% at 50% 50%, #000 40%, rgba(0,0,0,0.35) 72%, transparent 100%)";
const CHAPTERS = ABOUT_STAGES.map((s) => (s.cta ? { ...s, invitation: true } : s));

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


// One story chapter, Burnell's layouts: phones stack the feathered photo over
// the words; desktop sets a framed print beside them, swapping sides.
const Chapter = ({ s, i, isMobile, load }) => {
  if (s.invitation)
    return (
      <div className="relative flex flex-col items-center px-8 text-center">
        <div aria-hidden className={`absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 ${isMobile ? "h-[150%] w-[140%]" : "h-[180%] w-[170%]"}`} style={{ background: TEXT_POOL, filter: isMobile ? "blur(16px)" : undefined }} />
        <img src="/jahspur-logo-light.png" alt="" aria-hidden className={`w-auto opacity-90 ${isMobile ? "h-14" : "h-20"}`} />
        <h2 className={`font-display leading-tight text-white text-legible ${isMobile ? "mt-7 max-w-sm text-3xl" : "mt-8 max-w-3xl text-5xl"}`} style={{ textWrap: "balance" }}>
          {CALL_TO_ACTION.lead} <span className="text-gold-grad">{CALL_TO_ACTION.follow}</span>
        </h2>
        <div className={isMobile ? "mt-9 flex flex-col items-center gap-4" : "mt-10 flex items-center gap-8"}>
          <Link to="/community" className={`rounded-full bg-[var(--js-gold)] font-body text-sm font-medium text-black transition-colors hover:bg-[var(--js-gold-light)] ${isMobile ? "px-8 py-3.5" : "px-9 py-4"}`}>
            Join the Family
          </Link>
          <Link to="/album" className="font-accent text-xs uppercase tracking-[0.28em] text-[var(--js-gold-light)] hover:text-white">
            Written in Stone
          </Link>
        </div>
        <p className={`font-display text-white text-legible ${isMobile ? "mt-10 text-lg" : "mt-12 text-xl"}`}>— {ARTIST_NAME}</p>
      </div>
    );
  if (s.bridge)
    return isMobile ? (
      <p style={{ background: TEXT_POOL }} className="font-accent max-w-xs px-8 py-16 text-center text-2xl italic leading-snug text-white/90 text-legible">{s.body}</p>
    ) : (
      <p style={{ background: TEXT_POOL }} className="font-accent max-w-3xl px-16 py-24 text-center text-4xl italic leading-snug text-white/90 text-legible">{s.body}</p>
    );
  if (isMobile)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 pt-14 text-center">
        <img
          src={load ? s.media : undefined}
          alt=""
          className="max-h-[min(46svh,calc(100svh-26rem))] w-auto max-w-[88%] select-none object-contain"
          style={{ WebkitMaskImage: FEATHER, maskImage: FEATHER }}
        />
        {s.kicker && <span className="font-accent mt-4 text-[0.6rem] uppercase tracking-[0.4em] text-[var(--js-gold)]">{s.kicker}</span>}
        {s.title && <h2 className="font-display mt-2 text-3xl leading-tight text-white text-legible">{s.title}</h2>}
        <div className="relative mt-3 max-w-sm space-y-3">
          <div aria-hidden className="absolute -inset-x-10 -inset-y-12 -z-10" style={{ background: TEXT_POOL, filter: "blur(14px)" }} />
          {s.body.map((b, j) => (
            <p key={j} className="font-body text-[0.98rem] font-light leading-relaxed text-white/90 text-legible">
              {b}
            </p>
          ))}
        </div>
      </div>
    );
  return (
    <div className={`flex w-full max-w-6xl items-center gap-14 px-16 pt-16 ${i % 2 ? "flex-row-reverse" : ""}`}>
      <img
        src={load ? s.media : undefined}
        alt=""
        className="max-h-[62vh] w-auto max-w-[44%] select-none rounded-2xl border border-[var(--js-gold)]/30 object-contain shadow-[0_30px_90px_rgba(0,0,0,0.65)]"
      />
      <div className="relative min-w-0 flex-1 text-left">
        <div aria-hidden className="absolute -inset-x-20 -inset-y-20 -z-10" style={{ background: TEXT_POOL }} />
        {s.kicker && <span className="font-accent text-[0.68rem] uppercase tracking-[0.4em] text-[var(--js-gold)]">{s.kicker}</span>}
        {s.title && <h2 className="font-display mt-3 text-5xl leading-tight text-white text-legible">{s.title}</h2>}
        <div className="mt-5 max-w-xl space-y-4">
          {s.body.map((b, j) => (
            <p key={j} className="font-body text-[1.05rem] font-light leading-relaxed text-white/90 text-legible">
              {b}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
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
  const [landingEarly, setLandingEarly] = useState(false);
  const [loopShown, setLoopShown] = useState(false); // the mist loop has drawn a frame (until then: its still)
  const [skyShown, setSkyShown] = useState(false); // the sky loop has drawn a frame (until then: the sky layer)
  const [birdShown, setBirdShown] = useState(false); // the birds clip has drawn a frame
  const [birdsDone, setBirdsDone] = useState(false); // ...and handed over to the loop
  const [portalGone, setPortalGone] = useState(false);
  const [benShown, setBenShown] = useState(false); // his portrait has loaded and decoded: fade it in // the portal's fades are done: stop painting it
  const [reduce] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const stageRef = useRef(null);
  const loopRef = useRef(null);
  const loopStillRef = useRef(null);
  const canvasRef = useRef(null); // desktop: the growing layers are drawn here (see the engine)
  const groupRef = useRef(null); // the portal loop + transition (fitted to the visible height, like the world)
  const redrawRef = useRef(false); // a layer image arrived: draw again even if nothing moved
  const benRef = useRef(null);
  const transitionRef = useRef(null);
  const recoveredRef = useRef(null);
  const skyVideoRef = useRef(null);
  const birdVideoRef = useRef(null); // the same sky with birds crossing it (once, after the loop's first pass)
  const birdsPlayedRef = useRef(false); // the birds have had their one crossing
  const layerRefs = useRef([]);
  const rectRefs = useRef({}); // portal loop / ben / transition / sky video wrappers
  const anchorRefs = useRef([]);
  const chapterRefs = useRef([]);
  const blurRef = useRef(null);
  const shadeRef = useRef(null);
  const landingRef = useRef(null);
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
  const onLoopPlaying = (e) =>
    afterFirstFrame(e.currentTarget, () => {
      setLoopShown(true);
      setTimeout(() => setWarm(true), WARM_DELAY_MS);
    });

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
        v.src = S.transition.src;
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
  const onLayerLoad = (e) => {
    const im = e && e.currentTarget;
    if (im && im.decode) im.decode().catch(() => {}).then(() => (redrawRef.current = true));
    else redrawRef.current = true;
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
    // the sky: the plain loop plays one pass first (time to read the bio), then the birds cross
    // it once, then the loop carries on for good. The birds clip starts and ends on the loop's
    // first frame, so both hand-overs are seamless (see the two videos' onEnded).
    const sky = skyVideoRef.current;
    if (sky) {
      sky.loop = reduce || !birdVideoRef.current; // no birds: just loop
      sky.play().catch(() => {});
    }
    const t1 = setTimeout(() => setFading(true), 0);
    const t2 = setTimeout(() => setHoldGone(true), 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, layersReady, reduce]);

  // The mist loop is started from code, never with the autoPlay attribute: Safari draws its own
  // play button on a video whose autoplay it refused (its setting, Low Power Mode). Refused
  // here, the loop just stays hidden and its still shows (Burnell's portal does the same).
  useEffect(() => {
    const v = loopRef.current;
    if (v) v.play().catch(() => {});
  }, []);

  // Ben's portrait fades in once it's fully decoded (never half-painted). Already cached? The
  // effect catches an image that finished before React attached onLoad.
  const showBen = () => {
    const im = benRef.current;
    if (!im) return;
    const go = () => requestAnimationFrame(() => setBenShown(true));
    if (im.decode) im.decode().then(go, go);
    else go();
  };
  useEffect(() => {
    if (benRef.current?.complete && benRef.current.naturalWidth) showBen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // the portal hands over slowly (shading lifts over ~3s), then stops painting
  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setPortalGone(true), 3400);
    return () => clearTimeout(t);
  }, [entered]);

  // no scrollbar on Home (its appearing at the landing narrowed the page and re-fit the world)
  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar");
    return () => document.documentElement.classList.remove("no-scrollbar");
  }, []);

  // --- page scroll: locked until the world ------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    if (phase === "world") {
      window.scrollTo(0, 0);
      root.style.overflow = "";
      root.style.overscrollBehaviorY = "none";
      // chapters settle gently on phones (a flick). Not on desktop: Chrome pulls
      // every short mouse-wheel burst back to the last chapter, so the page
      // fights the wheel (measured: up to 225px backwards per burst).
      root.style.scrollSnapType = isMobile ? "y proximity" : "";
      document.body.style.overscrollBehaviorY = "none";
      loopRef.current?.pause();
    } else {
      root.style.overflow = "hidden";
    }
    return () => {
      root.style.overflow = "";
      root.style.overscrollBehaviorY = "";
      root.style.scrollSnapType = "";
      document.body.style.overscrollBehaviorY = "";
    };
  }, [phase, isMobile]);

  // --- transition --------------------------------------------------------------
  const enterWorld = () => {
    clearTimeout(failsafeRef.current);
    clearInterval(stallRef.current);
    setPhase("world");
  };

  // A browser only lets a video start from a real tap/click/key. A wheel turn
  // isn't one, so where autoplay is off (Safari's setting, Low Power Mode) the
  // play is refused: then stay on the portal (a click plays it) instead of
  // skipping straight to the world.
  const backToPortal = () => {
    clearTimeout(failsafeRef.current);
    clearInterval(stallRef.current);
    enteringRef.current = false;
    setEntered(false);
    setPhase("portal");
  };
  const playTransition = (v, soft) => {
    const fail = soft ? backToPortal : enterWorld;
    return v.play().catch(() => {
      if (!v.src.startsWith("blob:")) return fail();
      v.src = S.transition.src;
      v.play().catch(fail);
    });
  };

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
    nv.addEventListener("timeupdate", () => {
      if (nv.duration && nv.duration - nv.currentTime <= LANDING_EARLY_S) setLandingEarly(true);
    });
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
    nv.style.transition = "opacity 0.9s ease, filter 1.2s ease";
    nv.style.filter = "blur(6px) brightness(0.5)";
    nv.style.opacity = "0";
    const t = setTimeout(() => nv.remove(), 1000);
    return () => clearTimeout(t);
  }, [phase, fading]);

  const enter = (soft = false) => {
    if (enteringRef.current || phaseRef.current !== "portal") return;
    enteringRef.current = true;
    setWarm(true);
    setEntered(true);
    const v = transitionRef.current;
    if (reduce || !v) return enterWorld();
    // tapped before the download landed (or autoplay was refused, so it never started): stream it, inside the tap
    if (!v.getAttribute("src")) v.src = S.transition.src;
    setPhase("transition");
    playTransition(v, soft);
    watchStall(v);
    failsafeRef.current = setTimeout(enterWorld, TRANSITION_FAILSAFE_MS);
  };

  // --- enter triggers: tap / click / wheel / swipe / keys (not on the header) ----
  useEffect(() => {
    if (phase !== "portal") return;
    const inHeader = (e) => e.target?.closest?.("header");
    let y0 = null;
    let moved = false;
    let swiped = false;
    const onWheel = (e) => e.deltaY > 4 && enter(true);
    const onTS = (e) => {
      if (inHeader(e)) return;
      y0 = e.touches[0].clientY;
      moved = false;
    };
    const onTM = (e) => {
      if (y0 == null) return;
      if (Math.abs(e.touches[0].clientY - y0) > 10) moved = true;
      if (y0 - e.touches[0].clientY > 24) swiped = true;
    };
    const onTE = (e) => {
      // a tap, or a swipe up: started on the lift, which browsers count as a tap
      if (y0 != null && (!moved || swiped) && !inHeader(e)) enter();
      swiped = false;
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
    let lastLanding = "";
    let fitTarget = null; // [scale, tx, ty]: the H layout fitted to the visible height
    let fitNow = null;
    let lastFit = "";
    let worldScrolled = false;
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      mouse = true;
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const [CW, CH] = S.canvas;
    const [RX, RY, RW, RH] = S.region;
    const zoom = STORY_ZOOM[isMobile ? "phone" : "desktop"];
    const dimMax = STORY_DIM[isMobile ? "phone" : "desktop"];
    const ZC = [CW / 2, CH / 2]; // story zoom grows each layer about the middle

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
      // The stage is 100lvh (the height once the browser bars hide), so nothing ever shows a
      // gap, and everything is laid out for it (k, ox, oy). While the bars are showing (Chrome
      // on iPhone keeps both until you scroll), the picture is fitted to the height actually
      // visible (HF) instead: one compositor transform, the same on the portal/transition group
      // and on the world, so the hand-over between them can't jump. It eases only when the
      // visible height really changes (the bars hiding as you scroll). Ben, who fades out on
      // the tap, is placed for HF directly.
      const HF = Math.min(H, window.innerHeight || H);
      const k = OVERSCAN * Math.max(W / RW, H / RH);
      const ox = (W - RW * k) / 2 - RX * k;
      const oy = (H - RH * k) / 2 - RY * k;
      const kF = OVERSCAN * Math.max(W / RW, HF / RH);
      const oxF = (W - RW * kF) / 2 - RX * kF;
      const oyF = (HF - RH * kF) / 2 - RY * kF;
      const size = `${W}|${H}|${HF}`;
      if (size !== lastSize) {
        lastSize = size;
        placeRect(rectRefs.current.loop, S.portal.rect, k, ox, oy);
        placeRect(rectRefs.current.ben, S.portal.rect, kF, oxF, oyF);
        fitTarget = [kF / k, oxF - (kF / k) * ox, oyF - (kF / k) * oy];
        if (!fitNow) fitNow = fitTarget.slice(); // first layout: no easing in
        // A phone is narrower than the portal art, so the cover fit crops its
        // sides and zooms everything in. Ben is his own cutout over the plate
        // (the transition plays on the empty plate), so he alone is scaled back
        // to his size in the full composition, held to the bottom-left corner
        // of the screen, where he stands.
        const bw = rectRefs.current.ben;
        if (bw && isMobile) {
          // ...but never so small that the cutout's right edge (where the mic
          // stand and guitar neck run off the photo) comes into view
          const edge = (W + 16) / (oxF + RW * kF); // + his sideways drift (up to 14px)
          const fit = Math.min(1, Math.max(W / kF / RW, edge));
          const left = parseFloat(bw.style.left);
          const top = parseFloat(bw.style.top);
          bw.style.transformOrigin = `${(-left).toFixed(1)}px ${(HF - top).toFixed(1)}px`;
          bw.style.transform = fit < 0.999 ? `scale(${fit.toFixed(4)})` : "";
        }
        placeRect(rectRefs.current.transition, S.transition.rect, k, ox, oy);
        layerRefs.current.forEach((el) => el && (el.style.width = `${(CW * k).toFixed(1)}px`));
        const cv = canvasRef.current;
        if (cv) {
          // one canvas pixel per screen point: the art is 1182px stretched ~1.4x to fill the
          // screen, so a denser (Retina) canvas adds no detail, only 4x the pixels to fill
          // every frame (measured: ~100ms a frame at 2x, i.e. clunky)
          cv.width = Math.round(W);
          cv.height = Math.round(H);
        }
        const sk = rectRefs.current.sky;
        if (sk) {
          sk.style.width = `${(S.sky.rect[2] * k).toFixed(1)}px`;
          sk.style.height = `${(S.sky.rect[3] * k).toFixed(1)}px`;
        }
        lastKey = "";
      }

      // once you scroll in the world, settle onto the full-height fit (identity) while the
      // descent is already moving, so it covers the bars' space before they hide (no black
      // strip as the bottom bar slides away); one-way, it stays there
      if (phaseRef.current === "world" && window.scrollY > 4) worldScrolled = true;
      const tgt = worldScrolled ? [1, 0, 0] : fitTarget;
      if (fitNow && tgt) {
        const a = 1 - Math.exp(-dt * 6);
        let moving = false;
        for (let j = 0; j < 3; j++) {
          const d = tgt[j] - fitNow[j];
          if (Math.abs(d) > (j ? 0.05 : 0.00005)) {
            fitNow[j] += d * a;
            moving = true;
          } else fitNow[j] = tgt[j];
        }
        const ft = Math.abs(fitNow[0] - 1) < 0.0005 && Math.abs(fitNow[1]) < 0.05 && Math.abs(fitNow[2]) < 0.05 ? "none" : `translate(${fitNow[1].toFixed(2)}px, ${fitNow[2].toFixed(2)}px) scale(${fitNow[0].toFixed(5)})`;
        if (ft !== lastFit || moving) {
          lastFit = ft;
          if (groupRef.current) groupRef.current.style.transform = ft;
          if (blurRef.current) blurRef.current.style.transform = ft;
        }
      }
      const reduceM = reduce ? 0 : 1;
      const ph = phaseRef.current;
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
        if (loopStillRef.current && loopRef.current) loopStillRef.current.style.transform = loopRef.current.style.transform;
      }

      // ---- the world ----
      const target = window.scrollY;
      ys += (target - ys) * (1 - Math.exp(-dt * SCROLL_EASE));
      if (Math.abs(target - ys) < 0.3) ys = target;
      const a = anchorRefs.current;
      const Dpx = a[1] ? a[1].offsetTop : H * 2;
      const Cpx = a[3] && a[2] ? a[3].offsetTop - a[2].offsetTop : H;
      const Q0 = a[2] ? a[2].offsetTop - Cpx : Dpx; // q = 0 here, chapter 1 centred at q = 1
      const inW = ph === "world";
      const p = inW ? clamp01(ys / Dpx) : 0; // descent
      const e = smooth(p);
      const q = inW ? (ys - Q0) / Cpx : -1; // story: chapter i is centred at q = i + 1
      const z = clamp01((ys - Q0) / (Cpx * CHAPTERS.length)); // story zoom
      tx += (ix - tx) * 0.1;
      ty += (iy - ty) * 0.1;
      const ramp = inW ? smooth(clamp01((now - worldAtRef.current) / 1000 / PAR_RAMP_S)) : 0;
      const par = ramp * reduceM;
      const key = `${size}|${p.toFixed(4)}|${z.toFixed(4)}|${q.toFixed(3)}|${(tx * par).toFixed(3)}|${(ty * par).toFixed(3)}`;

      // landing: gone on the first bit of scroll (Burnell's 15%, with a blur)
      if (landingRef.current) {
        const o = 1 - clamp01(target / (H * 0.15));
        const ls = o.toFixed(3);
        if (ls !== lastLanding) {
          lastLanding = ls;
          landingRef.current.style.opacity = ls;
          landingRef.current.style.filter = o < 0.999 ? `blur(${((1 - o) * 8).toFixed(1)}px)` : "none";
        }
      }

      if (redrawRef.current) {
        redrawRef.current = false;
        lastKey = "";
      }
      if (key !== lastKey) {
        lastKey = key;
        // Desktop draws the growing layers (all but the sky) onto one canvas, straight from the
        // source images at their size this frame. As DOM layers, Chrome re-rastered all of them
        // at every new scale while scrolling (measured: ~11,500 raster tasks, 4.5s of raster in
        // 3s of scroll), which tore and stuttered; Safari instead stretched its first raster,
        // which looked soft. The sky never changes size, so it stays a DOM image and video.
        const cv = canvasRef.current;
        const ctx = cv ? cv.getContext("2d") : null;
        const draws = [];
        // the front leaves: grow first (anchored on the bottom edge of the view, so they swell up into
        // the frame instead of sliding out of it), and only spread apart late in the descent
        const grow = smooth(clamp01(p / 0.65));
        const part = smooth(clamp01((p - 0.55) / 0.45));
        const VB = RY + RH; // bottom of the view, in canvas units
        S.layers.forEach((L, i) => {
          const el = layerRefs.current[i];
          if (!el) return;
          // descent: subtle for everything far; the front leaves grow first, then spread
          let g1;
          let Ay;
          let dy = 0;
          if (isMobile) {
            // the leaves frame both edges of the art, which a phone screen crops: start them scaled to
            // the visible width (bottom-anchored), then grow from there
            // (a little wider than the screen: tilt slides them up to TILT_X either way,
            // and their cut edges must never come into view)
            const fit = Math.min(1, (W / k + 2 * EDGE_SPARE) / CW);
            g1 = L.part ? fit * (1 + 0.3 * grow + 0.3 * part) : 1 + L.depth * 0.25 * e;
            Ay = CH; // grow from the bottom: its edge never rises into view
          } else {
            dy = L.part ? -360 * e : -L.depth * 330 * e;
            g1 = L.part ? 1 + 0.25 * grow + 0.15 * part : 1 + L.depth * 0.08 * e;
            Ay = L.part ? VB - dy : CH; // the leaves: the point that sits on the view's bottom edge
          }
          // story: keeps drifting toward you, each layer by its depth (the front most)
          const g2 = 1 + (L.part && !isMobile ? 0.45 : L.depth) * zoom * z;
          const g = g1 * g2;
          // A: where the descent growth is anchored; Z: where the story zoom is
          const place = (node, Ax, Z, shift = 0) => {
            const t1x = Ax * (1 - g1) + shift;
            const t1y = Ay * (1 - g1) + dy;
            const x = Z[0] + (t1x - Z[0]) * g2 + tx * par * L.depth * TILT_X;
            const y = Z[1] + (t1y - Z[1]) * g2 + ty * par * L.depth * TILT_Y;
            if (ctx && L.key !== "sky") draws.push([node, ox + x * k, oy + y * k, g]);
            else node.style.transform = `translate3d(${(ox + x * k).toFixed(1)}px, ${(oy + y * k).toFixed(1)}px, 0) scale(${g.toFixed(4)})`;
            return [x, y];
          };
          let gx;
          let gy;
          if (L.part && !isMobile) {
            // desktop leaves frame both sides of the art, which a 16:10 screen crops: each half sits
            // against its own screen edge and grows in from it, so they're never pushed off
            const xl = -ox / k;
            const xr = (W - ox) / k;
            if (ctx) {
              place({ half: "left", el }, 0, [xl - EDGE_SPARE, VB], xl - EDGE_SPARE);
              place({ half: "right", el }, CW, [xr + EDGE_SPARE, VB], xr + EDGE_SPARE - CW);
            } else {
              place(el, 0, [xl - EDGE_SPARE, VB], xl - EDGE_SPARE);
              const right = layerRefs.current[S.layers.length];
              if (right) place(right, CW, [xr + EDGE_SPARE, VB], xr + EDGE_SPARE - CW);
            }
          } else {
            [gx, gy] = place(el, CW / 2, L.part ? [CW / 2, VB] : ZC);
          }
          if (L.key === "sky" && rectRefs.current.sky) {
            const r = S.sky.rect;
            rectRefs.current.sky.style.transform = `translate3d(${(ox + (gx + r[0] * g) * k).toFixed(1)}px, ${(oy + (gy + r[1] * g) * k).toFixed(1)}px, 0) scale(${g.toFixed(4)})`;
          }
        });
        if (ctx) {
          const dpr = cv.width / W;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "low"; // bilinear: same look when enlarging, much cheaper
          draws.forEach(([node, x, y, g]) => {
            const im = node.half ? node.el : node;
            if (!im.complete || !im.naturalWidth) return;
            const s = (k * g * CW) / im.naturalWidth; // canvas units -> screen px, at this frame's size
            const nw = im.naturalWidth;
            const nh = im.naturalHeight;
            if (node.half === "left") ctx.drawImage(im, 0, 0, nw / 2, nh, x, y, (nw / 2) * s, nh * s);
            else if (node.half === "right") ctx.drawImage(im, nw / 2, 0, nw / 2, nh, x + (nw / 2) * s, y, (nw / 2) * s, nh * s);
            else ctx.drawImage(im, x, y, nw * s, nh * s);
          });
        }
        // landing: blurred + dimmed under the copy, lifting as the descent begins
        const veil = inW ? 1 - smooth(clamp01(p / 0.3)) : 1;
        if (blurRef.current) blurRef.current.style.filter = veil > 0.02 ? `blur(${(6 * veil).toFixed(1)}px)` : "none";
        const storyDim = dimMax * smooth(clamp01((q - 0.2) / 0.4)); // full as chapter 1 arrives
        if (shadeRef.current) shadeRef.current.style.opacity = Math.max(0.5 * veil, storyDim).toFixed(3);
        // chapters fade in and out by scroll position, drifting a touch as they go
        chapterRefs.current.forEach((el, i) => {
          if (!el) return;
          const d = Math.abs(q - (i + 1));
          const o = d <= 0.22 ? 1 : d >= 0.5 ? 0 : (0.5 - d) / 0.28;
          el.style.opacity = o.toFixed(3);
          el.style.visibility = o > 0.001 ? "visible" : "hidden";
          el.style.pointerEvents = o > 0.6 ? "auto" : "none";
          el.style.transform = `translateY(${((q - (i + 1)) * (isMobile ? -24 : -30)).toFixed(1)}px)`;
        });
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
  const showLanding = inWorld || landingEarly;
  // the portal loop sits above the world: gone the moment the world phase starts (the held last frame covers it)
  const portalVisible = phase !== "world";
  const abs = "absolute left-0 top-0";
  const unit = isMobile ? "svh" : "vh";
  const D = DESCENT[isMobile ? "phone" : "desktop"];
  const S1 = STORY_AT[isMobile ? "phone" : "desktop"];
  const snap = { position: "absolute", left: 0, height: 1, width: 1 };

  return (
    <div data-testid="jah-world" data-nav-clear className="relative">
      {/* scroll track: the descent, one stop per chapter (proximity snap), and a last screen */}
      <div className="relative" style={{ height: inWorld ? `${S1 + CHAPTER * (CHAPTERS.length - 1) + 100}${unit}` : "100svh" }} aria-hidden>
        {[0, D, ...CHAPTERS.map((_, i) => S1 + CHAPTER * i)].map((top, i) => (
          <div key={i} ref={(el) => (anchorRefs.current[i] = el)} style={{ ...snap, top: `${top}${unit}`, scrollSnapAlign: i >= 2 ? "start" : "none" }} />
        ))}
      </div>

      <div ref={stageRef} className="fixed inset-x-0 top-0 z-10 overflow-hidden bg-black" style={{ height: "100lvh" }}>
        {/* ---------- world (underneath; not painted until it's needed) ---------- */}
        <div className="absolute inset-0" style={{ visibility: inWorld ? "visible" : "hidden" }}>
          <div ref={blurRef} className="absolute inset-0" style={{ filter: "blur(6px)", transformOrigin: "0 0" }}>
            {S.layers.map((L, i) => (
              <div key={L.key} className="contents">
                <img
                  ref={(el) => (layerRefs.current[i] = el)}
                  src={loadWorld ? L.src : undefined}
                  alt=""
                  aria-hidden
                  draggable={false}
                  decoding="async"
                  onLoad={onLayerLoad}
                  onError={onLayerLoad}
                  className={`${abs} max-w-none select-none`}
                  // desktop: every layer but the sky is only a source for the canvas below
                  style={!isMobile && L.key !== "sky" ? { display: "none" } : { transformOrigin: "0 0", height: "auto", willChange: "transform" }}
                />
                {L.key === "sky" && (
                  <div ref={(el) => (rectRefs.current.sky = el)} className={abs} style={{ transformOrigin: "0 0", willChange: "transform" }}>
                    <video
                      ref={skyVideoRef}
                      className="absolute inset-0 h-full w-full object-fill"
                      style={{ opacity: skyShown ? 1 : 0 }}
                      onPlaying={(ev) =>
                        afterFirstFrame(ev.currentTarget, () => {
                          setSkyShown(true);
                          if (birdsPlayedRef.current) setBirdsDone(true); // back from the birds: they can go
                        })
                      }
                      onEnded={(ev) => {
                        // the first pass is over: the birds cross (from the same frame)
                        const v = ev.currentTarget;
                        const bird = birdVideoRef.current;
                        const keepLooping = () => {
                          v.loop = true;
                          try {
                            v.currentTime = 0;
                          } catch (e) {}
                          v.play().catch(() => {});
                        };
                        if (!bird || birdsPlayedRef.current) return keepLooping();
                        birdsPlayedRef.current = true;
                        try {
                          bird.currentTime = 0;
                        } catch (e) {}
                        bird.play().catch(() => {
                          setBirdsDone(true);
                          keepLooping();
                        });
                      }}
                      src={loadWorld ? S.sky.src : undefined}
                      poster={loadWorld ? S.sky.poster : undefined}
                      muted
                      playsInline
                      preload={loadWorld ? "auto" : "none"}
                      aria-hidden
                      tabIndex={-1}
                      onLoadedData={onLayerLoad}
                      onError={onLayerLoad}
                    />
                    {/* after the loop's first pass: the same sky with birds flying across it, once (so
                        you see the world is alive), then the loop takes over again from the same frame */}
                    <video
                      ref={birdVideoRef}
                      className="absolute inset-0 h-full w-full object-fill"
                      style={{ opacity: birdShown && !birdsDone ? 1 : 0, visibility: birdsDone ? "hidden" : "visible" }}
                      onPlaying={(ev) => afterFirstFrame(ev.currentTarget, () => setBirdShown(true))}
                      onEnded={() => {
                        const v = skyVideoRef.current;
                        if (!v) return setBirdsDone(true);
                        v.loop = true;
                        try {
                          v.currentTime = 0;
                        } catch (e) {}
                        v.play().catch(() => setBirdsDone(true));
                      }}
                      src={loadWorld ? S.sky.birds : undefined}
                      poster={loadWorld ? S.sky.poster : undefined}
                      muted
                      playsInline
                      preload={loadWorld ? "auto" : "none"}
                      aria-hidden
                      tabIndex={-1}
                    />
                  </div>
                )}
              </div>
            ))}
            {!isMobile && <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />}
          </div>
          <div ref={shadeRef} aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0.5 }} />
        </div>

        {/* the portal loop + transition: fitted to the visible height exactly like the world
            (the engine sets the same transform on both) */}
        <div ref={groupRef} className="absolute inset-0" style={{ transformOrigin: "0 0" }}>
          {/* ---------- portal: the mist loop ---------- */}
          <div className="absolute inset-0" style={{ visibility: portalVisible ? "visible" : "hidden" }}>
            <div ref={(el) => (rectRefs.current.loop = el)} className={`${abs} overflow-visible`}>
              {/* the still sits underneath; the video stays invisible until it really plays, so
                  when a browser refuses autoplay (Safari, Low Power Mode) you see the still,
                  never the browser's own play button */}
              <img ref={loopStillRef} src={S.portal.poster} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full select-none object-fill will-change-transform" />
              <video
                ref={loopRef}
                className="relative h-full w-full object-fill will-change-transform"
                style={{ opacity: loopShown ? 1 : 0 }}
                src={S.portal.loop}
                poster={S.portal.poster}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                tabIndex={-1}
                onPlaying={onLoopPlaying}
              />
            </div>
          </div>

          {/* ---------- transition: holds its last frame, blurred and dimmed like the landing, until the layers are in ---------- */}
          <div
            ref={(el) => (rectRefs.current.transition = el)}
            className={abs}
            style={{
              opacity: transitionShown && !fading ? 1 : 0,
              // blurs and darkens as the landing starts (1.3s before the end), not after:
              // the clip's very last frame is badly compressed, so it's never seen sharp
              filter: inWorld || landingEarly ? "blur(6px) brightness(0.5)" : "none",
              transition: fading ? "opacity 0.9s ease, filter 1.2s ease" : inWorld || landingEarly ? "opacity 0.45s ease, filter 1.2s ease" : "opacity 0.45s ease",
              visibility: entered && !(holdGone && inWorld) ? "visible" : "hidden",
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
              onPlaying={(ev) => afterFirstFrame(ev.currentTarget, () => setTransitionShown(true))}
              onTimeUpdate={(ev) => {
                const v = ev.currentTarget;
                if (!landingEarly && v.duration && v.duration - v.currentTime <= LANDING_EARLY_S) setLandingEarly(true);
              }}
              onEnded={enterWorld}
            />
          </div>
          {phase === "transition" && <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "rgba(0,0,0,0.012)" }} />}
        </div>

        {/* ---------- Ben, the portal's shading and copy ----------
            On tap each lets go at its own pace: the words go first, Ben
            dissolves a little slower, and the shading holds a moment, then
            lifts gently while the transition plays underneath it. */}
        <div className="absolute inset-0" style={{ visibility: portalGone || inWorld ? "hidden" : "visible" }}>
          <div className="absolute inset-0" style={{ opacity: entered ? 0 : 1, transition: "opacity 1.2s ease" }}>
            {!isMobile && <PortalLotus spin top="18%" />}
            <div ref={(el) => (rectRefs.current.ben = el)} className={abs}>
              <img
                ref={benRef}
                src={S.portal.cutout}
                alt="Jah Spur singing and playing guitar"
                draggable={false}
                onLoad={showBen}
                className="h-full w-full select-none will-change-transform"
                // he fades in once fully loaded and decoded, instead of appearing all at once
                style={{ transformOrigin: isMobile ? "45% 70%" : "8% 40%", opacity: benShown ? 1 : 0, transition: "opacity 1.6s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ opacity: entered ? 0 : 1, transition: "opacity 2.6s ease 0.5s" }}>
            <div aria-hidden className="absolute inset-x-0 top-0 h-[48%]" style={{ background: "linear-gradient(to bottom, rgba(10,4,4,0.7) 0%, rgba(10,4,4,0.36) 45%, transparent 100%)" }} />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[34%]" style={{ background: "linear-gradient(to top, rgba(10,4,4,0.78) 0%, rgba(10,4,4,0.38) 45%, transparent 100%)" }} />
            <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse 85% 75% at 50% 48%, transparent 45%, rgba(10,4,4,0.58) 100%)" }} />
            {!isMobile && (
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 38%, rgba(10,4,4,0.35) 62%, rgba(10,4,4,0.55) 100%)" }} />
            )}
          </div>
          <div className="absolute inset-0" style={{ opacity: entered ? 0 : 1, transition: "opacity 0.6s ease" }}>
          {/* his lotus seal, top left (mirroring Burnell's and Trev's top-right portal flower);
              on desktop it sits behind Ben (he stands on the left), see above */}
          {isMobile && <PortalLotus />}
          {isMobile ? (
            <div className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ top: "25.5svh", transform: "translateY(-50%)" }}>
              <div className="relative flex flex-col items-center">
                <div aria-hidden className="js-pool absolute left-1/2 top-1/2 h-[260%] w-[130%] -translate-x-1/2 -translate-y-1/2" />
                <span className="js-cue relative text-[1.25rem]" style={{ animation: "breathe 3.2s ease-in-out infinite" }}>
                  Tap to Enter
                </span>
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[38%] flex-col items-center justify-center">
              <div className="relative flex flex-col items-center">
                <div aria-hidden className="js-pool absolute left-1/2 top-1/2 h-[120%] w-[140%] -translate-x-1/2 -translate-y-1/2" />
                <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="js-logo-calm relative h-auto w-[min(15rem,17vw,30vh)]" />
                <span className="relative mt-[clamp(1.1rem,3vh,1.8rem)] flex items-center gap-4" style={{ animation: "breathe 3.2s ease-in-out infinite" }}>
                  <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-white/90" />
                  <span className="js-cue text-[clamp(1rem,1.25vw,1.4rem)]">Tap to Enter</span>
                  <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-white/90" />
                </span>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* ---------- story chapters, faded in and out by scroll position ---------- */}
        <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: "100svh", visibility: inWorld ? "visible" : "hidden" }}>
          {CHAPTERS.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => (chapterRefs.current[i] = el)}
              data-testid={`world-chapter-${s.id}`}
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
            >
              <Chapter s={s} i={i} isMobile={isMobile} load={inWorld} />
            </div>
          ))}
        </div>

        {/* ---------- landing (Burnell's): his logo, the tagline, the location, the bio, a scroll cue ---------- */}
        <div
          ref={landingRef}
          data-testid="world-landing"
          className={`pointer-events-none absolute inset-x-0 top-0 text-center ${isMobile ? "px-6" : "px-8"}`}
          style={{ height: isMobile ? "100svh" : "100vh", visibility: showLanding ? "visible" : "hidden" }}
        >
          <div className={`flex h-full flex-col items-center justify-center ${isMobile ? "pt-14" : "pt-16"}`}>
            <div
              className="relative"
              style={{
                opacity: showLanding ? 1 : 0,
                transform: showLanding ? "none" : "scale(0.86)",
                filter: showLanding ? "none" : "blur(10px)",
                transition: `opacity 1.5s ease ${isMobile ? "" : "0.5s"}, transform 2.2s cubic-bezier(0.16,1,0.3,1) ${isMobile ? "" : "0.5s"}, filter 1.5s ease ${isMobile ? "" : "0.5s"}`,
              }}
            >
              <div
                aria-hidden
                className="animate-emblem-halo absolute left-1/2 top-1/2 h-[170%] w-[170%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(226,168,56,0.3) 0%, rgba(226,168,56,0.1) 40%, transparent 68%)" }}
              />
              <div className="animate-emblem-glow relative" style={{ perspective: "700px" }}>
                <img src="/jahspur-logo-light.png" alt={ARTIST_NAME} className={`animate-emblem-sway relative h-auto ${isMobile ? "w-[clamp(5rem,min(36vw,15svh),10rem)]" : "w-[clamp(6.5rem,min(36vw,18svh),10rem)]"}`} />
              </div>
            </div>
            <div
              className="flex flex-col items-center"
              style={{
                opacity: showLanding ? 1 : 0,
                transform: showLanding ? "none" : "translateY(10px)",
                transition: `opacity 1.4s ease ${isMobile ? "0.5s" : "1s"}, transform 1.4s ease ${isMobile ? "0.5s" : "1s"}`,
              }}
            >
              <p className={`font-display text-metallic-grad leading-tight ${isMobile ? "mt-[clamp(1.5rem,4.7svh,2.5rem)] text-[1.7rem]" : "mt-10 text-5xl"}`} style={{ textWrap: "balance" }}>
                {SITE_TAGLINE}
              </p>
              <p className={`font-cinzel tracking-[0.34em] text-[var(--js-gold)] text-legible ${isMobile ? "mt-4 text-[0.6rem]" : "mt-5 text-[0.7rem]"}`}>
                {SITE_LOCATION.toUpperCase().split(", ").join("  ·  ")}
              </p>
              <p
                className={`font-body font-light leading-relaxed text-white/85 text-legible ${isMobile ? "mt-[clamp(1rem,2.8svh,1.5rem)] max-w-[21.5rem] text-[clamp(0.85rem,2.1svh,0.95rem)]" : "mt-6 max-w-2xl text-base"}`}
                style={{ textWrap: isMobile ? "pretty" : "balance" }}
              >
                {isMobile ? HERO_BIO_MOBILE : HERO_BIO}
              </p>
            </div>
            {/* scroll cue: a capsule with a gold drop falling through it, under a clear label */}
            <div className={`flex justify-center ${isMobile ? "mt-[clamp(1.25rem,4.3svh,2.25rem)]" : "mt-10"}`} style={{ opacity: showLanding ? 1 : 0, transition: `opacity 1.2s ease ${isMobile ? "1.6s" : "2s"}` }}>
              <div className="animate-cue-bob relative flex flex-col items-center">
                <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[150%] w-[200%] -translate-x-1/2 -translate-y-1/2" style={{ background: TEXT_POOL, filter: "blur(12px)" }} />
                <span className={`font-cinzel uppercase tracking-[0.34em] text-[var(--js-gold-light)] text-legible ${isMobile ? "text-[0.66rem]" : "text-[0.7rem]"}`} style={{ marginRight: "-0.34em" }}>
                  Scroll to Explore
                </span>
                <div className="scroll-capsule mt-3">
                  <span className="scroll-capsule-drop" />
                </div>
                <div className="mt-1 flex flex-col items-center text-[var(--js-gold-light)]" aria-hidden>
                  <ChevronDown size={16} className="chevron-cascade -mb-2.5" />
                  <ChevronDown size={16} className="chevron-cascade" style={{ animationDelay: "0.25s" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
