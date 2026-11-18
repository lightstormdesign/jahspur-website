import { Link } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EnterHero } from "@/components/site/EnterHero";
import { AlbumTablet } from "@/components/site/AlbumTablet";
import { SignupForm } from "@/components/site/SignupForm";
import { Reveal } from "@/components/site/Reveal";
import { SymbolRow } from "@/components/site/Glyphs";
import { ALBUM, LASTING_MESSAGE, CALL_TO_ACTION } from "@/data/site";

// Scroll to enter (EnterHero.jsx): his real photo, pushed into as you
// scroll, with his name rising over it; then album + list, then the footer.
// Hero.jsx is the simpler static version, kept as a fallback.
// DawnExperience.jsx (the illustrated dawn world) is built but switched off.

export default function Home() {
  return (
    <div data-testid="home-page" className="relative bg-[var(--js-black)]">
      <Navbar />
      <EnterHero />

      {/* Album, then the list as its own centered beat. Splitting them keeps
          the desktop row balanced (tablet beside a short text block, not a
          tall form) and gives the signup room to breathe on phones. */}
      <section className="starfield relative z-10 overflow-hidden px-6 pb-16 pt-14 md:pb-24 md:pt-28">
        <div aria-hidden className="haze-drift" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-9 md:grid-cols-[0.9fr_1fr] md:gap-16">
          <Reveal className="mx-auto w-full max-w-[300px] md:max-w-[440px]">
            <Link to="/album" aria-label={`${ALBUM.title}, album page`} className="block transition-transform duration-500 hover:-translate-y-1">
              <AlbumTablet />
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="text-center md:text-left">
            <span className="overline">{ALBUM.status}</span>
            <h2 className="font-display text-stone mt-3 text-[2.1rem] uppercase leading-[1.08] tracking-[0.08em] sm:text-5xl">{ALBUM.title}</h2>
            <div className="tricolor-rule mx-auto mt-5 md:mx-0" />
            <p className="font-accent mt-5 text-lg leading-relaxed text-white/80 sm:text-xl">{ALBUM.description}</p>
            <Link
              to="/album"
              className="mt-7 inline-flex rounded-full border border-white/30 px-7 py-3 font-body text-sm text-white/90 transition-colors hover:border-[var(--js-gold)] hover:text-[var(--js-gold-light)]"
            >
              About the Album
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative mx-auto mt-16 max-w-xl text-center md:mt-28">
          <SymbolRow />
          <p className="font-accent mt-6 text-[1.6rem] italic leading-snug text-[var(--js-gold-light)] sm:text-3xl">
            {CALL_TO_ACTION.lead}
            <br />
            {CALL_TO_ACTION.follow}
          </p>
          <p className="font-body mx-auto mt-4 max-w-sm text-sm font-light leading-relaxed text-white/60">
            Join the list to hear Written in Stone first, and to help carry it into the world.
          </p>
          <SignupForm source="home" cta="Hear It First" className="mx-auto mt-7 max-w-lg" />
        </Reveal>

        <Reveal delay={0.15} className="relative mt-16 text-center md:mt-28">
          <div className="hairline mx-auto max-w-xs" />
          <p className="font-accent mx-auto mt-10 max-w-2xl text-xl italic leading-snug text-[var(--js-text)] sm:text-3xl">
            {LASTING_MESSAGE[0]}
            <br />
            <span className="text-gold-grad not-italic font-display mt-2 inline-block text-base uppercase tracking-[0.2em] sm:text-2xl">{LASTING_MESSAGE[1]}</span>
          </p>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
