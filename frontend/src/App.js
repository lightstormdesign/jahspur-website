import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Album from "@/pages/Album";
import Community from "@/pages/Community";
import EPK from "@/pages/EPK";
import Contact from "@/pages/Contact";
import { TrackingPixel } from "@/components/site/TrackingPixel";
import { GlowCursor } from "@/components/site/GlowCursor";
import { GlyphField } from "@/components/site/GlyphField";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <TrackingPixel />
        <GlyphField />
        <GlowCursor />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/album" element={<Album />} />
          <Route path="/community" element={<Community />} />
          <Route path="/epk" element={<EPK />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
