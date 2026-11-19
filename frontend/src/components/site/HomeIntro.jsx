import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";
import { HERO_LINE, HERO_BIO, HERO_BIO_MOBILE } from "@/data/site";
import { useIsMobile } from "@/hooks/useIsMobile";

// What you land on after scrolling past his picture: his logo, a short bio,
// and Read My Story, which goes to the About page (his full story).
export const HomeIntro = () => {
  const isMobile = useIsMobile();
  return (
    <section data-testid="home-intro" className="starfield relative z-10 overflow-hidden px-6 pb-20 pt-24 text-center md:pb-28 md:pt-32">
      <div aria-hidden className="haze-drift" />
      <Reveal className="relative mx-auto flex max-w-xl flex-col items-center">
        <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="h-auto w-[min(11rem,46vw)] drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]" />
        <div className="tricolor-rule mt-8" />
        <p className="font-accent mt-6 text-[1.45rem] italic leading-snug text-[var(--js-text)] sm:text-2xl">{HERO_LINE}</p>
        <p className="font-body mt-4 text-sm font-light leading-relaxed text-white/70 sm:text-[0.95rem]">{isMobile ? HERO_BIO_MOBILE : HERO_BIO}</p>
        <Link
          to="/about"
          data-testid="home-read-story"
          className="animate-glow-pulse mt-8 inline-flex rounded-full bg-[var(--js-gold)] px-8 py-3.5 font-body text-sm font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)]"
        >
          Read My Story
        </Link>
      </Reveal>
    </section>
  );
};
