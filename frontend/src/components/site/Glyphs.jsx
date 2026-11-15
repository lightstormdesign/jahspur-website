// Jah Spur's symbol set, drawn as single-weight line art so every glyph can
// be "carved" (see .carved in index.css) or float faintly in the background.
// The cube, trinity knot, and Coptic cross are the three symbols he named on
// his intake. Sun, spiral, and mountain are generic rock-art marks for the
// high-desert / "ancient future" feel he asked for. They're deliberately not
// copies of any specific tribe's sacred imagery.
//
// All glyphs share a 0..100 viewBox and inherit color via currentColor.

const Svg = ({ size = 48, className = "", strokeWidth = 2.2, children, title }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role={title ? "img" : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
  >
    {children}
  </svg>
);

// The cube from his logo, drawn as an isometric outline.
export const CubeGlyph = (p) => (
  <Svg {...p}>
    <path d="M50 8 L87 29 L87 71 L50 92 L13 71 L13 29 Z" />
    <path d="M13 29 L50 50 L87 29 M50 50 L50 92" />
  </Svg>
);

// The cube filled with his logo colors (top red, left gold, right green).
export const CubeColor = ({ size = 48, className = "" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
    <path d="M50 8 L87 29 L50 50 L13 29 Z" fill="var(--js-red-deep)" />
    <path d="M13 29 L50 50 L50 92 L13 71 Z" fill="var(--js-gold)" />
    <path d="M87 29 L50 50 L50 92 L87 71 Z" fill="var(--js-green-deep)" />
    <path
      d="M50 8 L87 29 L87 71 L50 92 L13 71 L13 29 Z M13 29 L50 50 L87 29 M50 50 L50 92"
      fill="none"
      stroke="#0b0806"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

// Trinity knot (triquetra): the three pairwise lenses of three equal circles
// whose centers sit on a small equilateral triangle (side = radius), plus the
// ring through it.
export const TrinityKnot = (p) => (
  <Svg {...p}>
    <path d="M65 58.66 A30 30 0 0 1 20 32.68 A30 30 0 0 1 65 58.66 Z" />
    <path d="M50 32.68 A30 30 0 0 1 50 84.64 A30 30 0 0 1 50 32.68 Z" />
    <path d="M35 58.66 A30 30 0 0 1 80 32.68 A30 30 0 0 1 35 58.66 Z" />
    <circle cx="50" cy="50" r="19" />
  </Svg>
);

// Coptic cross: four flared, notched arms around a central ring.
export const CopticCross = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="9" />
    {[0, 90, 180, 270].map((r) => (
      <path key={r} d="M45 41.5 L39 10 L50 16 L61 10 L55 41.5" transform={`rotate(${r} 50 50)`} />
    ))}
  </Svg>
);

export const SunGlyph = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="16" />
    <circle cx="50" cy="50" r="4" />
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} d="M50 26 L50 12" transform={`rotate(${i * 30} 50 50)`} />
    ))}
  </Svg>
);

export const SpiralGlyph = (p) => (
  <Svg {...p}>
    <path d="M50 50 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a16 16 0 1 1 16 16 a20 20 0 1 1 -20 -20 a24 24 0 1 1 24 24 a28 28 0 1 1 -28 -28" />
  </Svg>
);

export const MountainGlyph = (p) => (
  <Svg {...p}>
    <path d="M8 76 L32 40 L44 56 L60 28 L92 76" />
    <path d="M54 38 L60 28 L66 38" />
    <path d="M8 84 L92 84" />
  </Svg>
);

// Half-moon (from "Half-Moon" in his Prophecy world).
export const HalfMoonGlyph = (p) => (
  <Svg {...p}>
    <path d="M50 14 A36 36 0 0 1 50 86 Z" />
    <circle cx="50" cy="50" r="36" strokeDasharray="2 6" />
  </Svg>
);

export const GLYPHS = {
  cube: CubeGlyph,
  trinity: TrinityKnot,
  coptic: CopticCross,
  sun: SunGlyph,
  spiral: SpiralGlyph,
  mountain: MountainGlyph,
  moon: HalfMoonGlyph,
};

// Thin row of the three named symbols, used as a section mark.
export const SymbolRow = ({ size = 22, className = "" }) => (
  <div className={`flex items-center justify-center gap-5 text-[var(--js-gold)]/70 ${className}`} aria-hidden>
    <TrinityKnot size={size} strokeWidth={3} />
    <CubeGlyph size={size} strokeWidth={3} />
    <CopticCross size={size} strokeWidth={3} />
  </div>
);
