import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SignupForm } from "@/components/site/SignupForm";
import { SymbolRow } from "@/components/site/Glyphs";
import { SHOWS, EPK_REGIONS, BAND_NAME } from "@/data/site";

// Show dates list (in the agreement's scope). Data-driven from SHOWS in
// data/site.js, same idea as the template's TourFlyer: add entries and they
// list here, no design work. With no dates yet, the page says so plainly and
// turns the visit into a booking inquiry or a show-alert signup.
export default function Shows() {
  const has = SHOWS.length > 0;
  return (
    <div data-testid="shows-page" className="relative flex min-h-screen flex-col">
      <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
        <img src="/jahspur-about-07.jpg" alt="" className="animate-kenburns h-full w-full object-cover" style={{ objectPosition: "50% 30%" }} />
        <div className="absolute inset-0 bg-[rgba(11,8,6,0.8)]" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,8,6,0.2) 0%, rgba(11,8,6,0.95) 80%)" }} />
      </div>
      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 pb-28 pt-36 text-center sm:pt-44">
        <Reveal>
          <span className="overline">Shows</span>
          <h1 className="font-display mt-4 text-4xl text-[var(--js-text)] text-legible sm:text-6xl">Live with {BAND_NAME}</h1>
          <div className="tricolor-rule mx-auto mt-6" />
        </Reveal>

        {has ? (
          <Reveal delay={0.1}>
            <ul data-testid="shows-list" className="mt-12 divide-y divide-white/10 border-y border-white/10 text-left">
              {SHOWS.map((sh, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-5">
                  <span className="font-display w-24 shrink-0 text-lg text-[var(--js-gold-light)]">{sh.date}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-display block text-lg text-[var(--js-text)]">{sh.event}</span>
                    <span className="font-body block text-sm font-light text-white/55">{sh.location}</span>
                  </span>
                  {sh.href && (
                    <a href={sh.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-white/25 px-4 py-1.5 font-body text-xs text-white/85 transition-colors hover:border-[var(--js-gold)] hover:text-[var(--js-gold-light)]">
                      Tickets <ArrowUpRight size={13} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        ) : (
          <Reveal delay={0.1}>
            <p data-testid="shows-empty" className="font-accent mx-auto mt-10 max-w-xl text-2xl italic leading-snug text-white/85 text-legible">
              New dates are coming. Over a thousand shows so far, across {EPK_REGIONS.slice(0, -1).join(", ")}, and {EPK_REGIONS[EPK_REGIONS.length - 1]}.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/epk"
                className="animate-glow-pulse rounded-full bg-[var(--js-gold)] px-7 py-3 font-body text-sm font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)]"
              >
                Book a Show
              </Link>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.2}>
          <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-[var(--js-gold)]/25 bg-black/50 px-6 py-10 backdrop-blur-sm sm:px-10">
            <SymbolRow />
            <h2 className="font-display mt-5 text-2xl text-[var(--js-text)] sm:text-3xl">Get show alerts</h2>
            <p className="font-body mx-auto mt-3 max-w-md text-sm font-light text-white/65">Be the first to know when and where the music is gathering next.</p>
            <SignupForm source="shows" cta="Get Show Alerts" className="mx-auto mt-6 max-w-lg" />
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
