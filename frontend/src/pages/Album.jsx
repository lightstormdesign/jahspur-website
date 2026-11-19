import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { AlbumTablet } from "@/components/site/AlbumTablet";
import { SignupForm } from "@/components/site/SignupForm";
import { SymbolRow } from "@/components/site/Glyphs";
import { Fireflies } from "@/components/site/Fireflies";
import { VideoGrid } from "@/components/site/VideoGrid";
import { ALBUM, GOFUNDME_URL, PRESALE_URL, STREAMING_LINKS, VIDEOS, ARTIST_NAME, BAND_NAME, SONG_DESTINY, CALL_TO_ACTION } from "@/data/site";

// The album page. Sierra's version is a CD-unboxing of a released record;
// Jah's album isn't out yet and has no artwork, so this page does what his
// intake asks the site to do for it right now: announce it, tell the story
// of the song that started it ("Prophecy"), grow the list, and raise support
// (presale / fundraising, links pending).
const SupportButton = () => {
  const href = PRESALE_URL || GOFUNDME_URL;
  const cls =
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3 font-body text-sm text-white/90 transition-colors hover:border-[var(--js-gold)] hover:text-[var(--js-gold-light)]";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" data-testid="album-support-link" className={cls}>
        {PRESALE_URL ? "Pre-order" : "Support the Album"} <ArrowUpRight size={15} />
      </a>
    );
  }
  // No fundraising link yet: send people to the ways-to-support section.
  return (
    <Link to="/community" data-testid="album-support-link" className={cls}>
      Ways to Support
    </Link>
  );
};

export default function Album() {
  return (
    <div data-testid="album-page" className="starfield relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(154,86,52,0.28) 0%, transparent 60%)" }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="haze-drift" />
      </div>
      <Fireflies />
      <Navbar />

      <main className="relative z-10">
        {/* --- the record --- */}
        <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-9 px-6 pb-16 pt-24 md:grid-cols-[0.9fr_1fr] md:gap-16 md:pb-24 md:pt-40">
          <Reveal className="mx-auto w-full max-w-[300px] md:max-w-[440px]">
            <div className="relative">
              <div
                aria-hidden
                className="animate-breathe pointer-events-none absolute -inset-10 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(226,168,56,0.2) 0%, rgba(226,168,56,0) 65%)", filter: "blur(10px)" }}
              />
              <AlbumTablet className="relative" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="text-center md:text-left">
            <span className="overline">{ALBUM.status}</span>
            <h1 className="font-display text-stone mt-3 text-[2.4rem] uppercase leading-[1.05] tracking-[0.08em] sm:text-6xl">{ALBUM.title}</h1>
            <p className="font-display mt-4 text-xs uppercase tracking-[0.4em] text-white/60">
              {ARTIST_NAME} &amp; {BAND_NAME}
            </p>
            <div className="tricolor-rule mx-auto mt-6 md:mx-0" />
            <p className="font-accent mt-5 text-lg leading-relaxed text-white/85 sm:text-2xl">{ALBUM.description}</p>

            {STREAMING_LINKS.length > 0 ? (
              <div className="mt-7 flex flex-wrap justify-center gap-2 md:justify-start">
                {STREAMING_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 bg-black/30 px-4 py-1.5 font-display text-[0.65rem] uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-[var(--js-gold)]/60 hover:text-[var(--js-gold-light)]"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="font-body mt-6 text-sm font-light text-white/55">Release date and where to listen: coming soon. The list hears first.</p>
            )}

            <div className="mt-7 grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
              <a
                href="#hear-it-first"
                className="animate-glow-pulse rounded-full bg-[var(--js-gold)] px-7 py-3 text-center font-body text-sm font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)]"
              >
                Hear It First
              </a>
              <SupportButton />
            </div>
          </Reveal>
        </section>

        {/* --- Prophecy: the song that started it --- */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div aria-hidden className="absolute inset-0">
            <img src="/jahspur-hero-02.jpg" alt="" className="animate-kenburns h-full w-full object-cover" style={{ objectPosition: "40% 35%" }} />
            <div className="absolute inset-0 bg-[rgba(11,8,6,0.78)]" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--js-black) 0%, transparent 25%, transparent 75%, var(--js-black) 100%)" }} />
            <div className="mist-a absolute top-[30%] h-[40%]" style={{ opacity: 0.7 }} />
          </div>
          <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
            <span className="overline">The song that started it</span>
            <h2 className="font-display mt-4 text-[2.6rem] uppercase tracking-[0.12em] text-[var(--js-text)] text-legible sm:text-6xl">{ALBUM.leadSong.title}</h2>
            <p className="font-accent mt-6 text-xl italic leading-snug text-white/90 text-legible sm:text-3xl">"{ALBUM.leadSong.story}"</p>
            <p className="font-display mt-4 text-xs uppercase tracking-[0.35em] text-[var(--js-gold)]">— {ARTIST_NAME}</p>
            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-x-5 gap-y-2.5">
              {ALBUM.leadSong.world.map((w) => (
                <span key={w} className="font-display text-xs uppercase tracking-[0.28em] text-white/55 text-legible sm:text-sm">
                  {w}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* --- videos (once he sends links) --- */}
        {VIDEOS.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pt-20">
            <Reveal className="text-center">
              <span className="overline">Watch</span>
            </Reveal>
            <Reveal delay={0.1}>
              <VideoGrid className="mt-8" />
            </Reveal>
          </section>
        )}

        {/* --- from the stage --- */}
        <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <Reveal>
            <p className="font-accent mx-auto mb-8 max-w-2xl text-center text-xl italic leading-snug text-white/80 sm:text-2xl md:mb-10">{SONG_DESTINY}</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
              {[
                ["/jahspur-band-strongbacks.jpg", "Jah Spur and The Strongbacks performing outdoors"],
                ["/jahspur-hero-04.jpg", "Jah Spur singing with eyes closed, rasta guitar strap"],
                ["/jahspur-hero-02.jpg", "Jah Spur mid-song at an outdoor show"],
              ].map(([src, alt], i) => (
                <div key={src} className={`overflow-hidden rounded-lg border border-white/10 ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}>
                  <img src={src} alt={alt} loading="lazy" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* --- list --- */}
        <section id="hear-it-first" className="scroll-mt-24 px-6 pb-20 pt-4 md:pb-32 md:pt-10">
          <Reveal className="mx-auto max-w-2xl rounded-2xl border border-[var(--js-gold)]/25 bg-black/45 px-5 py-10 text-center backdrop-blur-sm sm:px-12 sm:py-12">
            <SymbolRow />
            <p className="font-accent mt-6 text-xl italic text-[var(--js-gold-light)]">
              {CALL_TO_ACTION.lead} {CALL_TO_ACTION.follow}
            </p>
            <h2 className="font-display mt-3 text-3xl text-[var(--js-text)] sm:text-4xl">Be the first to hear it</h2>
            <p className="font-body mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-white/65">
              First listens from Written in Stone, word from the studio, and the shows and gatherings where the music lives.
            </p>
            <SignupForm source="album" cta="Hear It First" className="mx-auto mt-8 max-w-lg" />
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
