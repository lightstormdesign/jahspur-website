import { Link, useLocation } from "react-router-dom";
import { NAV_LINKS, SOCIALS, ARTIST_NAME, SITE_LOCATION, LASTING_MESSAGE } from "@/data/site";
import { MoonPhase } from "./MoonPhase";

export const Footer = () => {
  const location = useLocation();
  return (
    <footer data-testid="site-footer" className="relative z-10 border-t border-white/10 bg-[rgba(11,8,6,0.88)] py-10 backdrop-blur-md sm:py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 sm:gap-7 lg:px-8">
        {/* not on Home, where the intro just above already shows it */}
        {location.pathname !== "/" && (
          <img src="/jahspur-logo-light.png" alt="Jah Spur and The Strongbacks" className="h-20 w-auto object-contain sm:h-24" />
        )}

        <p className="font-accent max-w-md text-center text-base italic text-white/55">
          {LASTING_MESSAGE[0]} {LASTING_MESSAGE[1]}
        </p>

        <div className="tricolor-rule" />

        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={`font-display text-[0.65rem] uppercase tracking-[0.22em] transition-colors ${
                location.pathname === l.to ? "text-[var(--js-gold-light)] hover:text-white" : "text-white/55 hover:text-[var(--js-gold-light)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`footer-social-${s.label.toLowerCase()}`}
              className="font-display text-[0.65rem] uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-[var(--js-gold-light)]"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <MoonPhase />

        <p className="font-body text-xs font-light text-white/35">
          © {new Date().getFullYear()} {ARTIST_NAME} · {SITE_LOCATION}
        </p>
      </div>
    </footer>
  );
};
