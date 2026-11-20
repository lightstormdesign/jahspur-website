import { Navbar } from "@/components/site/Navbar";
import { JahWorld } from "@/components/site/JahWorld";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

// The desktop world is wide (16:9). On an upright tablet it crops Ben's face
// off the portal, so any portrait screen gets the tall phone world instead.
const PORTRAIT = "(orientation: portrait)";
const usePortrait = () => {
  const [p, setP] = useState(() => typeof window !== "undefined" && window.matchMedia(PORTRAIT).matches);
  useEffect(() => {
    const m = window.matchMedia(PORTRAIT);
    const on = () => setP(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return p;
};

// Home: the portal -> transition -> layered world (JahWorld.jsx). Remounted
// when the breakpoint flips, since phone and desktop have their own media.
export default function Home() {
  const isMobile = useIsMobile();
  const portrait = usePortrait();
  const tall = isMobile || portrait;
  return (
    <div data-testid="home-page" className="relative bg-[var(--js-black)]">
      <Navbar />
      <JahWorld key={tall ? "phone" : "desktop"} isMobile={tall} />
    </div>
  );
}
