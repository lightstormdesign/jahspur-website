import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MobileEnter } from "@/components/site/MobileEnter";
import About from "@/pages/About";

// Home, phones and desktop: scroll to enter (MobileEnter.jsx: his real
// photo, 3D drift, parallax), then straight down into his story (About).
//
// Kept but not used: EnterHero.jsx (the earlier push-in with his name over
// the photo), Hero.jsx (static hero) and DawnExperience.jsx (the
// illustrated dawn world, the paid World upgrade).
export default function Home() {
  return (
    <div data-testid="home-page" className="relative bg-[var(--js-black)]">
      <Navbar />
      <div className="relative z-10">
        <MobileEnter />
      </div>
      <About embedded />
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
