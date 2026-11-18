import { Link } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { AlbumTablet } from "@/components/site/AlbumTablet";
import { SignupForm } from "@/components/site/SignupForm";
import { Reveal } from "@/components/site/Reveal";
import { SymbolRow } from "@/components/site/Glyphs";
import { ALBUM, LASTING_MESSAGE, CALL_TO_ACTION } from "@/data/site";

// Hero-first: the visitor lands on Jah himself, then one section that serves
// his two main goals (album support, a 5,000-person list), then the footer.
//
// The illustrated dawn-world intro (DawnExperience.jsx, half-moon night ->
// misty sunrise over the mountains -> hero) is built and kept, but off: it's
// the paid "World upgrade" beyond this package. To turn it on, replace
// <Hero /> with <DawnExperience /> (import from components/site).
export default function Home() {
  return (
    <div data-testid="home-page" className="relative bg-[var(--js-black)]">
      <Navbar />
      <Hero />

      <section className="starfield relative z-10 overflow-hidden px-6 py-28">
        <div aria-hidden className="haze-drift" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal className="mx-auto w-full max-w-[420px]">
            <Link to="/album" aria-label={`${ALBUM.title}, album page`} className="block transition-transform duration-500 hover:-translate-y-1">
              <AlbumTablet />
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="text-center lg:text-left">
            <span className="overline">{ALBUM.status}</span>
            <h2 className="font-display text-stone mt-4 text-4xl uppercase tracking-[0.1em] sm:text-5xl">{ALBUM.title}</h2>
            <div className="tricolor-rule mx-auto mt-5 lg:mx-0" />
            <p className="font-accent mt-6 text-xl leading-relaxed text-white/80">{ALBUM.description}</p>
            <p className="font-accent mt-7 text-2xl italic leading-snug text-[var(--js-gold-light)]">
              {CALL_TO_ACTION.lead} {CALL_TO_ACTION.follow}
            </p>
            <p className="font-body mt-3 text-sm font-light text-white/60">
              Join the list to hear it first, and to help carry it into the world.
            </p>
            <SignupForm source="home" cta="Hear It First" className="mx-auto mt-5 max-w-lg lg:mx-0" />
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative mt-28 text-center">
          <SymbolRow />
          <p className="font-accent mx-auto mt-6 max-w-2xl text-2xl italic leading-snug text-[var(--js-text)] sm:text-3xl">
            {LASTING_MESSAGE[0]}
            <br />
            <span className="text-gold-grad not-italic font-display text-xl uppercase tracking-[0.2em] sm:text-2xl">{LASTING_MESSAGE[1]}</span>
          </p>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
