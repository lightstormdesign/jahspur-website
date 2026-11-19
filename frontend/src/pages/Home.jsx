import { Navbar } from "@/components/site/Navbar";
import { MobileEnter } from "@/components/site/MobileEnter";
import { HomeIntro } from "@/components/site/HomeIntro";

// Home, phones and desktop: scroll to enter (MobileEnter.jsx: his real
// photo, 3D drift, parallax), then a short intro (his logo, a small bio,
// Read My Story -> /about) over his world, full screen. No footer on
// Home (the menu is always in the header).
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
      <HomeIntro />
    </div>
  );
}
