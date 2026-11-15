import { Link } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SymbolRow } from "@/components/site/Glyphs";
import { SITE_CONTACT, SOCIALS, SITE_LOCATION } from "@/data/site";

// Contact: his booking email and Instagram (the only channels he gave). No
// phone number on the intake, so none is shown.
export default function Contact() {
  return (
    <div data-testid="contact-page" className="relative flex min-h-screen flex-col bg-[var(--js-black)]">
      <div aria-hidden className="fixed inset-0 z-0">
        <img src="/jahspur-about-06.jpg" alt="" className="animate-kenburns h-full w-full object-cover" style={{ objectPosition: "50% 25%" }} />
        <div className="absolute inset-0 bg-[rgba(11,8,6,0.72)]" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(11,8,6,0) 0%, rgba(11,8,6,0.85) 80%)" }} />
        <div className="grain absolute inset-0" />
      </div>
      <Navbar />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-36 text-center">
        <Reveal>
          <span className="overline">Contact</span>
          <h1 className="font-display mt-5 text-4xl text-[var(--js-text)] text-legible sm:text-5xl">Get in Touch</h1>
          <p className="font-accent mt-3 text-lg italic text-white/65 text-legible">{SITE_LOCATION}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center gap-3">
            <a href={`mailto:${SITE_CONTACT.email}`} data-testid="contact-email" className="font-accent text-2xl text-[var(--js-gold-light)] transition-colors hover:text-white">
              {SITE_CONTACT.email}
            </a>
            <p className="font-body text-sm text-white/55">Booking &amp; general inquiries · {SITE_CONTACT.name}</p>
            <Link to="/epk" className="font-body mt-3 text-xs uppercase tracking-[0.2em] text-white/60 underline decoration-[var(--js-gold)]/40 underline-offset-4 hover:text-white">
              Booking form &amp; press kit
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <SymbolRow className="mt-12" />
          <div className="mt-8 flex items-center justify-center gap-7">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="font-display text-xs uppercase tracking-[0.25em] text-white/65 transition-colors hover:text-[var(--js-gold-light)]">
                {s.label} · @jahspurmusic
              </a>
            ))}
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
