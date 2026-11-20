// Site-wide sacred geometry: his lotus seal (a lotus rosette around a Trinity
// Knot, ringed in the red and green of his cube), in the same top-right spot
// and with the same settings as Burnell's and Trev's: centred at 91% / 12%,
// 34vmax wide, one turn every 225s in reverse, at Burnell's 7% opacity.
//
// z-[1]: above each page's fixed photo background (z-0) and below its content
// (z-10). On Home the world's stage (z-10) covers it, as on the other sites.
const LOTUS = { x: "91%", y: "12%", size: "34vmax", dur: 225, opacity: 0.07 };

export const GlyphField = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
    {/* centring on the wrapper, the turn on the image (both are transforms) */}
    <div className="absolute aspect-square -translate-x-1/2 -translate-y-1/2" style={{ left: LOTUS.x, top: LOTUS.y, width: LOTUS.size, opacity: LOTUS.opacity }}>
      <img
        src="/jahspur-lotus.webp"
        alt=""
        draggable={false}
        decoding="async"
        className="glyph-turn h-full w-full max-w-none select-none"
        style={{ animationDuration: `${LOTUS.dur}s`, animationDirection: "reverse" }}
      />
    </div>
  </div>
);
