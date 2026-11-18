import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { NAV_LINKS, ARTIST_NAME } from "@/data/site";
import { CubeColor } from "./Glyphs";

const NavLink = ({ to, label, active, mobile }) => (
  <Link
    to={to}
    data-testid={`nav-link-${label.toLowerCase()}`}
    onClick={mobile ? mobile.onClick : undefined}
    className={
      mobile
        ? `border-b border-white/5 py-3 text-left font-display text-sm uppercase tracking-[0.2em] ${
            active ? "text-[var(--js-gold-light)]" : "text-white/80"
          }`
        : `font-display text-[0.68rem] uppercase tracking-[0.2em] transition-colors duration-300 ${
            active ? "text-[var(--js-gold-light)]" : "text-white/70 hover:text-[var(--js-gold-light)]"
          }`
    }
  >
    {label}
  </Link>
);

// Same structure as the template's header: fixed, always carrying its own
// backdrop so content scrolling underneath never collides with the links.
// On the Home page it starts fully transparent over the dawn sky and only
// gains its backdrop once you've scrolled, so the opening frame is clean.
export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    // Home: stay clear while the hero (or the dawn intro, if switched on)
    // is the backdrop; every other page: solid after the first 40px.
    const onScroll = () => {
      const clearZone = document.querySelector("[data-nav-clear], [data-testid=dawn-experience]");
      const limit = clearZone ? clearZone.offsetHeight - window.innerHeight * 0.5 : 40;
      setScrolled(window.scrollY > limit);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  const clear = isHome && !scrolled && !open;

  return (
    <header
      data-testid="site-navbar"
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        clear ? "border-b border-transparent bg-transparent" : "border-b border-white/10 bg-[rgba(11,8,6,0.72)] backdrop-blur-xl"
      }`}
    >
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <Link to="/" data-testid="nav-link-wordmark" className="flex items-center gap-3" aria-label={`${ARTIST_NAME}, home`}>
          <CubeColor size={30} className="animate-wordmark-float" />
          <span className="font-display text-lg uppercase tracking-[0.28em] text-[var(--js-text)]">{ARTIST_NAME}</span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} label={l.label} active={location.pathname === l.to} />
          ))}
        </div>
        <div className="md:hidden">
          <button data-testid="nav-mobile-toggle" onClick={() => setOpen((v) => !v)} className="p-1 text-white" aria-label="Menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div data-testid="nav-mobile-menu" className="border-t border-white/10 bg-[rgba(11,8,6,0.95)] backdrop-blur-xl md:hidden">
          <div className="flex flex-col px-6 pb-4 pt-2">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.label} to={l.to} label={l.label} active={location.pathname === l.to} mobile={{ onClick: () => setOpen(false) }} />
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
