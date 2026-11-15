import { ALBUM, ALBUM_COVER, ARTIST_NAME } from "@/data/site";
import { CubeGlyph, SunGlyph, SpiralGlyph, MountainGlyph, TrinityKnot, CopticCross } from "./Glyphs";

// "Written in Stone" as an object: a square sandstone tablet with the title
// and his symbols carved into it. Stands in for album artwork, which hasn't
// been supplied yet. Per the mapping key, a single-image album gets a
// simpler display than the template's CD-unboxing, and with zero images this
// is that display. When ALBUM_COVER is set, the real artwork renders in the
// same frame instead, so nothing else on the page has to change.
export const AlbumTablet = ({ className = "", compact = false }) => {
  if (ALBUM_COVER) {
    return (
      <div className={`relative aspect-square overflow-hidden rounded-md shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ${className}`}>
        <img src={ALBUM_COVER} alt={`${ALBUM.title} album cover`} className="h-full w-full object-cover" />
      </div>
    );
  }

  const glyph = compact ? 26 : 40;
  return (
    <div
      data-testid="album-tablet"
      role="img"
      aria-label={`${ALBUM.title}, by ${ARTIST_NAME}`}
      className={`stone-surface relative aspect-square overflow-hidden rounded-[6px] ${className}`}
    >
      {/* chipped, uneven edge light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[6px] ring-1 ring-inset ring-[rgba(255,230,190,0.12)]" />

      <div className="carved absolute inset-0 flex flex-col items-center justify-between p-[9%] text-[rgba(20,12,8,0.78)]">
        <div className="flex w-full items-center justify-between">
          <SunGlyph size={glyph} strokeWidth={3.2} />
          <SpiralGlyph size={glyph} strokeWidth={3.2} />
        </div>

        <div className="flex flex-col items-center text-center">
          <CubeGlyph size={compact ? 46 : 78} strokeWidth={3} />
          <p
            className={`font-display mt-[6%] uppercase leading-[1.05] tracking-[0.16em] text-[rgba(24,14,9,0.82)] ${
              compact ? "text-xl" : "text-3xl sm:text-4xl"
            }`}
            style={{ textShadow: "0 1px 0 rgba(255,236,205,0.3), 0 -1px 0 rgba(0,0,0,0.4)" }}
          >
            Written
            <br />
            in Stone
          </p>
          <p
            className={`font-display mt-3 uppercase tracking-[0.42em] text-[rgba(24,14,9,0.7)] ${compact ? "text-[0.55rem]" : "text-xs"}`}
            style={{ textShadow: "0 1px 0 rgba(255,236,205,0.25)" }}
          >
            {ARTIST_NAME}
          </p>
        </div>

        <div className="flex w-full items-end justify-between">
          <TrinityKnot size={glyph} strokeWidth={3.2} />
          <MountainGlyph size={glyph * 1.4} strokeWidth={3} />
          <CopticCross size={glyph} strokeWidth={3.2} />
        </div>
      </div>

      <div className="shimmer-overlay" />
    </div>
  );
};
