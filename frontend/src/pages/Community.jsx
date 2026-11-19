import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SignupForm } from "@/components/site/SignupForm";
import { Fireflies } from "@/components/site/Fireflies";
import { TrinityKnot, CubeGlyph, CopticCross, SunGlyph } from "@/components/site/Glyphs";
import { COMMUNITY_OFFERS, SOCIALS, IDENTITY_WORDS } from "@/data/site";

const OFFER_GLYPH = { membership: TrinityKnot, skool: SunGlyph, gofundme: CubeGlyph, offer: CopticCross };

// The list-building page (his #1 site goal: 5,000 people in 12 months) plus
// the four ways in he checked on the intake: Membership, Skool, GoFundMe,
// and a low-barrier offer. None have links yet, so each card reads "coming
// soon" until its href is set in data/site.js; then it becomes a live link.
export default function Community() {
  return (
    <div data-testid="community-page" className="relative flex min-h-screen flex-col">
      <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <img src="/jahspur-band-strongbacks.jpg" alt="" className="animate-kenburns h-full w-full object-cover" style={{ objectPosition: "45% 30%" }} />
        <div className="absolute inset-0 bg-[rgba(11,8,6,0.74)]" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,8,6,0.2) 0%, rgba(11,8,6,0.95) 85%)" }} />
        <div className="haze-drift" />
      </div>
      <Fireflies />
      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-16 pt-28 text-center sm:pb-28 sm:pt-44">
        <Reveal>
          <span className="overline">Community</span>
          <h1 className="font-display mt-3 text-[2.3rem] leading-tight text-[var(--js-text)] text-legible sm:text-6xl">Come Walk With Us.</h1>
          <p className="font-accent mx-auto mt-4 max-w-xl text-lg italic leading-snug text-white/80 text-legible sm:text-xl">
            Spiritual, community-minded, faithful, youth to elder. If the music moves you, there's a place for you here.
          </p>
        </Reveal>

        <div className="animate-glow-pulse mx-auto mt-8 max-w-2xl rounded-2xl border border-[var(--js-gold)]/30 bg-black/50 px-5 py-8 backdrop-blur-sm sm:mt-10 sm:px-10">
          <p className="font-body mx-auto max-w-md text-sm font-light leading-relaxed text-white/75">
            Join the list for first listens from <span className="text-[var(--js-gold-light)]">Written in Stone</span>, word from the studio, and
            invitations to shows and gatherings.
          </p>
          <SignupForm source="community" className="mx-auto mt-6 max-w-lg" />
        </div>

        <Reveal delay={0.1}>
          <p className="font-display mt-8 text-[0.62rem] uppercase leading-relaxed tracking-[0.4em] text-[var(--js-gold)]/80">
            <span className="block sm:inline">{IDENTITY_WORDS.slice(0, 3).join(" · ")}</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">{IDENTITY_WORDS.slice(3).join(" · ")}</span>
          </p>
        </Reveal>

        {/* ways in */}
        <section id="support" className="mt-16 scroll-mt-28 sm:mt-24">
          <Reveal>
            <span className="overline">Ways to Walk Closer</span>
            <div className="tricolor-rule mx-auto mt-4" />
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:mt-10 sm:grid-cols-2 sm:gap-4">
            {COMMUNITY_OFFERS.map((o, i) => {
              const G = OFFER_GLYPH[o.key];
              const live = Boolean(o.href);
              const Inner = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-[var(--js-gold)]">
                      <G size={34} strokeWidth={2.6} />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-display text-[0.55rem] uppercase tracking-[0.25em] ${
                        live ? "bg-[var(--js-gold)] text-[var(--js-black)]" : "border border-white/15 text-white/45"
                      }`}
                    >
                      {live ? "Open" : "Coming soon"}
                    </span>
                  </div>
                  <h3 className="font-display mt-5 flex items-center gap-2 text-xl text-[var(--js-text)]">
                    {o.title} {live && <ArrowUpRight size={16} className="text-[var(--js-gold-light)]" />}
                  </h3>
                  <p className="font-body mt-2 text-sm font-light leading-relaxed text-white/65">{o.blurb}</p>
                </>
              );
              return (
                <Reveal key={o.key} delay={0.05 * i}>
                  {live ? (
                    <a
                      href={o.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full rounded-xl border border-white/12 bg-black/45 p-6 backdrop-blur-sm transition-colors hover:border-[var(--js-gold)]/50"
                    >
                      {Inner}
                    </a>
                  ) : (
                    <div data-testid={`offer-${o.key}`} className="h-full rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
                      {Inner}
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </section>

        <Reveal delay={0.2}>
          <div className="mt-12 flex items-center justify-center gap-7 sm:mt-16">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xs uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-[var(--js-gold-light)]"
              >
                {s.label}
              </a>
            ))}
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
