import { Navbar } from "@/components/site/Navbar";
import { JahWorld } from "@/components/site/JahWorld";
import { useIsMobile } from "@/hooks/useIsMobile";

// Home: the portal -> transition -> layered world (JahWorld.jsx). Remounted
// when the breakpoint flips, since phone and desktop have their own media.
export default function Home() {
  const isMobile = useIsMobile();
  return (
    <div data-testid="home-page" className="relative bg-[var(--js-black)]">
      <Navbar />
      <JahWorld key={isMobile ? "phone" : "desktop"} isMobile={isMobile} />
    </div>
  );
}
