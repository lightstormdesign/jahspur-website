import { ArrowUpRight } from "lucide-react";
import { VIDEOS } from "@/data/site";

// His videos (call notes: "Links to videos"). Renders nothing until VIDEOS
// in data/site.js has entries: { title, youtubeId } embeds inline (privacy-
// enhanced youtube-nocookie domain, lazy-loaded), { title, href } shows as a
// link card for anything that isn't YouTube.
export const VideoGrid = ({ className = "" }) => {
  if (!VIDEOS.length) return null;
  return (
    <div data-testid="video-grid" className={`grid grid-cols-1 gap-5 ${VIDEOS.length > 1 ? "md:grid-cols-2" : ""} ${className}`}>
      {VIDEOS.map((v) => (
        <figure key={v.youtubeId || v.href} className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
          {v.youtubeId ? (
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                title={v.title}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : (
            <a href={v.href} target="_blank" rel="noopener noreferrer" className="flex aspect-video items-center justify-center gap-2 font-display text-sm uppercase tracking-[0.2em] text-[var(--js-gold-light)]">
              Watch <ArrowUpRight size={16} />
            </a>
          )}
          <figcaption className="font-accent px-4 py-3 text-left text-lg italic text-white/75">{v.title}</figcaption>
        </figure>
      ))}
    </div>
  );
};
