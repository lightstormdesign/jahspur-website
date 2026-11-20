// His lotus seal in the top-right corner of the Home portal, built exactly
// like Burnell's PortalFlower (and Trev's portal bloom), mirrored to the left: centred at 8% across
// (8% down on phones, 18% on desktop), 44vmax wide, peaking at 0.4 opacity
// with a soft radial edge fade. It fades in once (3s, after 1.2s), then
// breathes slowly; desktop also turns it very slowly. The glow is a
// pre-blurred copy behind the lines, painted once.
const SRC = "/jahspur-lotus.webp";
const PEAK_OPACITY = 0.4;
const SIZE = "44vmax";
const EDGE = "radial-gradient(circle, black 0%, black 45%, transparent 78%)";

export const PortalLotus = ({ spin = false, top = "8%" }) => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
      style={{ left: "8%", top, width: SIZE, opacity: PEAK_OPACITY, maskImage: EDGE, WebkitMaskImage: EDGE }}
    >
      <div className="portal-flower-fade-in h-full w-full" style={{ animationDelay: "1.2s" }}>
        <div className="portal-flower-breathe h-full w-full">
          <div className={spin ? "glyph-turn h-full w-full" : "h-full w-full"} style={spin ? { animationDuration: "520s" } : undefined}>
            <div className="relative h-full w-full">
              {/* the glow: a soft copy of the lines */}
              <img src={SRC} alt="" draggable={false} className="absolute inset-0 h-full w-full max-w-none select-none" style={{ filter: "blur(6px)", opacity: 0.9 }} />
              <img src={SRC} alt="" draggable={false} className="absolute inset-0 h-full w-full max-w-none select-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
