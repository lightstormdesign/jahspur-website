import { useState } from "react";
import { Download } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { MailtoFallback } from "@/components/site/MailtoFallback";
import { SymbolRow } from "@/components/site/Glyphs";
import { VideoGrid } from "@/components/site/VideoGrid";
import { submitForm } from "@/utils/forms";
import {
  ARTIST_NAME,
  BAND_NAME,
  SITE_LOCATION,
  EPK_STATS,
  EPK_REGIONS,
  EPK_SHORT_BIO,
  EPK_PROUDEST,
  IDENTITY_WORDS,
  BOOKING_STATUS,
  BOOKING_COPY,
  BOOKING_EMAIL,
  SOCIALS,
  STREAMING_LINKS,
  PRESS_QUOTES,
  ALBUM,
} from "@/data/site";

// Press photos: every performance shot he sent, plus a few from his life.
// Each thumbnail downloads a full-size (3000px) copy from /press.
const GALLERY = [
  ["jahspur-hero-01.jpg", "Jah Spur performing, singing into the mic with guitar"],
  ["jahspur-band-strongbacks.jpg", "Jah Spur and The Strongbacks on stage"],
  ["jahspur-hero-03.jpg", "Jah Spur singing, red gold and green guitar strap"],
  ["jahspur-about-07.jpg", "Jah Spur on stage with acoustic guitar and band"],
  ["jahspur-hero-02.jpg", "Jah Spur performing outdoors"],
  ["jahspur-hero-04.jpg", "Jah Spur singing with eyes closed"],
  ["jahspur-about-09.jpg", "Jah Spur portrait in front of a mural"],
  ["jahspur-about-06.jpg", "Jah Spur at the Rio Grande Gorge at sunset"],
];
const pressPath = (f) => `/press/${f.replace("jahspur-", "jah-spur-press-")}`;
const PRESS_ZIP = "/press/jah-spur-press-photos.zip";

const field = "field";

const BookingForm = () => {
  const [f, setF] = useState({ name: "", email: "", event: "", dateLocation: "", budget: "", details: "" });
  const [state, setState] = useState({ status: "idle", body: "" });
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const subject = `Booking Inquiry: ${f.event || ARTIST_NAME}`;

  const onSubmit = async (e) => {
    e.preventDefault();
    setState({ status: "submitting", body: "" });
    const res = await submitForm({
      subject,
      to: BOOKING_EMAIL,
      fields: {
        "First & Last Name": f.name,
        Email: f.email,
        "Event/Festival": f.event,
        "Event Date(s) & Location": f.dateLocation,
        "Estimated Budget Range": f.budget,
        "Additional Details": f.details,
      },
    });
    setState(res);
  };

  if (state.status === "success") {
    return (
      <div className="mt-8 rounded-xl border border-[var(--js-gold)]/30 bg-black/30 px-6 py-6 text-center">
        <p className="font-body text-sm text-white/80">Got it. Your booking inquiry is in, and we'll reply personally with next steps.</p>
      </div>
    );
  }
  if (state.status === "mailto" || state.status === "error") {
    return <MailtoFallback email={BOOKING_EMAIL} subject={subject} body={state.body} onReset={() => setState({ status: "idle", body: "" })} />;
  }

  return (
    <form onSubmit={onSubmit} data-testid="booking-form" className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
      <input required placeholder="First & Last Name*" value={f.name} onChange={set("name")} className={field} />
      <input required type="email" placeholder="Email*" value={f.email} onChange={set("email")} className={field} />
      <input required placeholder="Event/Festival*" value={f.event} onChange={set("event")} className={`${field} sm:col-span-2`} />
      <input required placeholder="Event Date(s) & Location*" value={f.dateLocation} onChange={set("dateLocation")} className={`${field} sm:col-span-2`} />
      <input placeholder="Estimated Budget Range" value={f.budget} onChange={set("budget")} className={`${field} sm:col-span-2`} />
      <textarea placeholder="Additional Details (solo or full band?)" rows={3} value={f.details} onChange={set("details")} className={`${field} sm:col-span-2`} />
      <button
        type="submit"
        disabled={state.status === "submitting"}
        className="mt-1 rounded-full bg-[var(--js-gold)] px-8 py-3.5 font-body text-[15px] font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)] disabled:opacity-60 sm:col-span-2"
      >
        {state.status === "submitting" ? "Sending…" : "Submit Booking Inquiry"}
      </button>
      <p className="font-body text-xs text-white/40 sm:col-span-2">Every inquiry is read personally.</p>
    </form>
  );
};

export default function EPK() {
  return (
    <div data-testid="epk-page" className="starfield relative isolate min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 lg:left-auto lg:right-0 lg:w-[58%]" style={{ WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 45%)", maskImage: "linear-gradient(to right, transparent 0%, black 45%)" }}>
          <img src="/jahspur-hero-01.jpg" alt="" className="h-full w-full object-cover opacity-[0.35] [object-position:25%_25%]" />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 22%, rgba(11,8,6,0.1) 0%, rgba(11,8,6,0.6) 60%, rgba(11,8,6,0.9) 100%), linear-gradient(to bottom, rgba(11,8,6,0.2) 0%, rgba(11,8,6,0.6) 55%, rgba(11,8,6,0.85) 100%)" }}
        />
      </div>
      <Navbar />

      <main className="relative mx-auto max-w-4xl px-6 pb-10 pt-28 text-center sm:pt-40">
        <Reveal>
          <span className="overline">Electronic Press Kit</span>
          <h1 className="font-display text-stone mt-5 text-5xl uppercase tracking-[0.12em] sm:text-7xl">{ARTIST_NAME}</h1>
          <p className="font-accent mt-4 text-lg italic text-white/65">
            Roots music · {SITE_LOCATION}
            <br />
            Solo, or with his band, {BAND_NAME}.
          </p>
          {STREAMING_LINKS.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {STREAMING_LINKS.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 bg-black/30 px-4 py-1.5 font-display text-[0.65rem] uppercase tracking-[0.18em] text-white/75 hover:text-[var(--js-gold-light)]">
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <p className="font-display mt-8 text-[0.62rem] uppercase leading-relaxed tracking-[0.4em] text-[var(--js-gold)] sm:mt-10 sm:text-xs">
            <span className="block sm:inline">{IDENTITY_WORDS.slice(0, 3).join(" · ")}</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">{IDENTITY_WORDS.slice(3).join(" · ")}</span>
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div
            className="mt-8 overflow-hidden"
            style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
          >
            <div className="marquee-track">
              {[...EPK_REGIONS, ALBUM.title, ...EPK_REGIONS, ALBUM.title].map((r, i) => (
                <span key={i} className="font-display shrink-0 px-7 text-xs uppercase tracking-[0.28em] text-white/35">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-6 flex items-center justify-center gap-7">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="font-display text-xs uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-[var(--js-gold-light)]">
                {s.label}
              </a>
            ))}
          </div>
        </Reveal>
      </main>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pb-16 sm:pb-32 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-14">
        <Reveal className="order-2 lg:order-1" delay={0.2}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="overline">Press Photos</span>
            <a
              href={PRESS_ZIP}
              download
              data-testid="press-zip"
              className="flex items-center gap-1.5 rounded-full border border-[var(--js-gold)]/40 px-4 py-1.5 font-body text-xs text-[var(--js-gold-light)] transition-colors hover:bg-[var(--js-gold)]/10"
            >
              <Download size={13} /> Download all
            </a>
          </div>
          <div className="columns-2 gap-2 sm:columns-3 lg:columns-2">
            {GALLERY.map(([file, alt]) => (
              <a
                key={file}
                href={pressPath(file)}
                download
                data-testid="press-photo"
                aria-label={`Download full size: ${alt}`}
                className="group relative mb-2 block break-inside-avoid overflow-hidden rounded-lg border border-white/10 bg-black/40"
              >
                <img src={`/${file}`} alt={alt} className="w-full object-cover" loading="lazy" />
                <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/85 transition-colors group-hover:bg-[var(--js-gold)] group-hover:text-[var(--js-black)]">
                  <Download size={12} />
                </span>
              </a>
            ))}
          </div>
          <p className="font-body mt-2 text-[0.65rem] text-white/40">Tap any photo to download it full size.</p>
        </Reveal>

        <div className="order-1 text-center lg:order-2 lg:text-left">
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              {EPK_STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-black/40 px-4 py-5 text-center backdrop-blur-sm">
                  <p className="font-display text-gold-grad text-3xl sm:text-4xl">{s.value}</p>
                  <p className="font-body mt-2 text-[0.7rem] uppercase leading-snug tracking-[0.12em] text-white/55">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <span className="overline mt-12 block">Bio</span>
            <p className="font-accent mt-4 text-lg leading-relaxed text-white/85">{EPK_SHORT_BIO}</p>
            <p className="font-accent mt-5 text-lg italic text-white/65">
              Proudest moment: "{EPK_PROUDEST}"
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <VideoGrid className="mt-10" />
          </Reveal>

          {PRESS_QUOTES.length > 0 && (
            <Reveal delay={0.18}>
              <span className="overline mt-12 block">Press</span>
              {PRESS_QUOTES.map((q, i) => (
                <blockquote key={i} className="font-accent mt-4 text-lg italic text-white/80">
                  "{q.quote}" <span className="not-italic text-white/50">— {q.source}</span>
                </blockquote>
              ))}
            </Reveal>
          )}

          <Reveal delay={0.2}>
            <div id="booking" className="mt-12 scroll-mt-28 rounded-2xl border border-[var(--js-gold)]/25 bg-black/45 px-5 py-8 backdrop-blur-sm sm:mt-14 sm:px-8 sm:py-9">
              <SymbolRow className="lg:justify-start" />
              <h2 className="font-display mt-5 text-[1.7rem] leading-tight text-[var(--js-text)] sm:text-3xl">{BOOKING_STATUS}</h2>
              <p className="font-body mt-3 text-sm font-light text-white/65">{BOOKING_COPY}</p>
              <BookingForm />
            </div>
          </Reveal>
        </div>
      </div>

      <Footer />
    </div>
  );
}
