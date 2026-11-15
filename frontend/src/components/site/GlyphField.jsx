import { GLYPHS } from "./Glyphs";

// Site-wide ambient layer (replaces the template's SacredGeometryField):
// his symbols, very faint, each turning slowly in its own direction and
// tempo so the corners never move in sync. Meant to be felt, not noticed.
// Hidden on the Home page's dawn sequence by its own opaque sky layers.
const PLACEMENTS = [
  { glyph: "trinity", style: { top: "9%", left: "-3%" }, size: 260, dur: 240, dir: "normal" },
  { glyph: "coptic", style: { top: "6%", right: "-4%" }, size: 220, dur: 300, dir: "reverse" },
  { glyph: "cube", style: { bottom: "-6%", left: "6%" }, size: 240, dur: 360, dir: "reverse" },
  { glyph: "sun", style: { bottom: "4%", right: "-2%" }, size: 280, dur: 420, dir: "normal" },
  { glyph: "spiral", style: { top: "44%", left: "46%" }, size: 180, dur: 380, dir: "normal" },
];

export const GlyphField = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-[var(--js-gold-light)]">
    {PLACEMENTS.map(({ glyph, style, size, dur, dir }, i) => {
      const G = GLYPHS[glyph];
      return (
        <div
          key={i}
          className="glyph-turn absolute"
          style={{ ...style, opacity: 0.045, animationDuration: `${dur}s`, animationDirection: dir }}
        >
          <G size={size} strokeWidth={0.9} />
        </div>
      );
    })}
  </div>
);
