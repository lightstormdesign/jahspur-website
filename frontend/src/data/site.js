// JahSpur.com — site content. Everything here comes from Jah Spur's
// LightStorm Artist Discovery Form (submitted 11/11/2026). Copy is drafted
// from his own answers; nothing about his history is invented beyond them.
// Anything still missing from the client is marked PENDING and either hidden
// or shown as "coming soon" on the page, never faked.

export const ARTIST_NAME = "Jah Spur";
export const BAND_NAME = "The Strongbacks";
export const SITE_LOCATION = "Taos, New Mexico";

// Top-level navigation. Shows is in the agreement's scope ("show dates
// list") even though he has no dates yet; it reads "coming soon" until
// SHOWS has entries. No Shop: no merch yet (intake: "No").
export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Album", to: "/album" },
  { label: "About", to: "/about" },
  { label: "Shows", to: "/shows" },
  { label: "Community", to: "/community" },
  { label: "EPK", to: "/epk" },
  { label: "Contact", to: "/contact" },
];

export const SITE_TAGLINE = "Roots Music";
export const SITE_GENRE_TAGS = "ROOTS · SPIRIT · UNITY";

// His 3–5 words, verbatim.
export const IDENTITY_WORDS = ["Radical", "Cultural", "Spiritual", "Wisdom", "Unity"];

// "Spur is to incite, motivate, stimulate, and urge into action."
export const SPUR_DEFINITION = {
  word: "spur",
  part: "verb",
  meaning: "to incite, motivate, stimulate, and urge into action.",
};

// His lasting message, verbatim.
export const LASTING_MESSAGE = ["Life is a journey, and to walk it is your destiny.", "The Presence is a gift."];

export const HERO_LINE = "Spreading love and unity through word and sound.";

// --- From the discovery call (Trevor's notes) ------------------------------

// The name story. Jah Spur: "spur," to urge into action. And, per Ben,
// Benjamin is engraved in jasper (the breastplate stones in Exodus), so his
// own name is written in stone, which is where the album title comes from.
// Phrased as his account; keep it in his framing.
// NOT USED on the site right now: pulled from About pending a direction
// (candidate for its own album landing page). Kept here as draft copy.
export const NAME_STORY = {
  title: "Written in Stone",
  body: [
    "Jah Spur. A spur urges you into action. Say it slowly and you'll hear jasper, too.",
    "In Exodus, the names of the tribes were engraved in stone on the high priest's breastplate, and Benjamin, my name, is engraved in jasper. My name has been written in stone the whole time. My whole life has felt like a prophecy unfolding.",
  ],
};

// His call to action, in his words. Used to lead into signups.
export const CALL_TO_ACTION = {
  lead: "Lay it down at the altar.",
  follow: "Start doing what you're meant to do.",
};

// "Songs have their own destiny," and they find their way like water
// through the crevices.
export const SONG_DESTINY = "Every song has its own destiny. Like water, it finds the crevices and makes its way.";

export const HERO_BIO =
  "Jah Spur is a roots musician from Taos, New Mexico. Raised in a family where music runs back generations, and steeped in Jamaican music since the age of thirteen, he has given more than half his life to bringing roots music to the people: a thousand-plus performances across Northern New Mexico, both coasts, and Hawaii. With his band, The Strongbacks, and a studio of his own, he is now bringing his debut album, Written in Stone, to the world.";

// Phone: the full bio minus its first sentence (the tagline and location line above already say it)
export const HERO_BIO_MOBILE =
  "Raised in a family where music runs back generations, and steeped in Jamaican music since the age of thirteen, Jah Spur has given more than half his life to bringing roots music to the people: a thousand-plus performances across Northern New Mexico, both coasts, and Hawaii. With his band, The Strongbacks, and a studio of his own, he is now bringing his debut album, Written in Stone, to the world.";

export const HERO_CTA = { label: "My Story", to: "/about" };

// Hero photo: jah1, extended upward in Canva for headroom (3000x2800 source,
// 2400px web copy).
// Phones get their own portrait crop (1080x1920, made in Canva): trees
// across the top, him in the lower half. The hero text sits up in the
// canopy on phones so his face stays clear.
// Optional 3D depth layer: the SAME canvas with the background removed (him
// only, transparent PNG, same size and position). When set, he pushes in
// faster than the trees behind him for real parallax. Null = single layer.
export const HERO_CUTOUT = null;
// Phone depth layers, made in Canva on the 1080x1920 phone canvas:
// the cutout is Jah with the mic and stand (BG Remover), and the plate is the
// same frame with him and the mic erased. Until the plate exists the full
// phone photo stands in as the background; the push-in scales about a point
// inside him, so the background copy of him stays hidden behind the cutout.
export const HERO_CUTOUT_MOBILE = "/jahspur-hero-mobile-cutout.webp";
// The site's song for the speaker (top left). PENDING: no audio from Jah
// yet; "Prophecy" is the natural pick. Drop an .m4a/.mp3 in public/ and set
// this path; until then the speaker only asks for motion access.
export const SONG_SRC = null;

// Desktop frames from Canva (1920x1080): the full extended photo and the
// background plate. PENDING: the desktop cutout (Jah + mic, transparent PNG
// on the same canvas). Until it's set, desktop runs the same drift and scroll
// on the full photo as one layer; set the cutout and it becomes two layers.
export const HERO_CUTOUT_DESKTOP = "/jahspur-hero-desktop-cutout.webp";

// Small announcement bubble on the Hero (one-line edit when there's news).
export const HERO_ANNOUNCEMENT = {
  image: "/jahspur-hero-04.jpg",
  message: "My debut album, Written in Stone, is on its way.",
  linkLabel: "Be the first to hear it",
  to: "/album",
  appearDelayMs: 5500,
};

// --- Album ---------------------------------------------------------------

export const ALBUM = {
  title: "Written in Stone",
  status: "Debut album · coming soon",
  // Drafted from his answers: the album as the culmination of a decade of
  // songwriting about his "experiences, teachings, and creation".
  description:
    "Half a lifetime of writing roots music, carved down into one record. Written in Stone is Jah Spur's debut: his chance to curate how he introduces himself to the world, recorded in his own studio with The Strongbacks.",
  // "Prophecy" is the song he chose to represent him, and the one that
  // started the vision to release his music.
  leadSong: {
    title: "Prophecy",
    story:
      "This song started the vision to release my music to the world, through a prayerful meditation journey.",
    world: ["Misty", "Mystic", "Sunrise", "Sunset", "Half-Moon", "Mountain Tops", "Jungle Valleys"],
  },
};

// PENDING: no album artwork yet. The Album page uses a carved-stone tablet
// in its place; drop the real cover in here (e.g. "/jahspur-album-cover.jpg")
// and the page shows it instead.
export const ALBUM_COVER = null;

// PENDING: his intake asks for album presale / fundraising and checks
// "GoFundMe", but no link was provided yet. While null, the "Support the
// album" button routes to the Community signup instead of a dead link.
export const GOFUNDME_URL = null;
export const PRESALE_URL = null;

// PENDING: no streaming profiles yet (intake: Primary Release Platform "NA").
// Add { label, href } entries here and they appear on Album + EPK.
export const STREAMING_LINKS = [];

// PENDING: he wants links to videos (call notes) but none were provided.
// Add { title, youtubeId } (or { title, href }) and a Videos section appears
// on the Album page and EPK.
export const VIDEOS = [];

// PENDING: show dates. The agreement includes a show-dates list; he had none
// on the intake. Add { date: "Dec 12", event, location, href? } entries and
// the Shows page lists them; empty shows a "booking now" state.
export const SHOWS = [];

// --- Community -------------------------------------------------------------

// His 12-month goal, verbatim intent: "Capture a list of up to 5,000 people."
export const COMMUNITY_GOAL = 5000;

// Laylo: "Not sure yet." While null, the signup form below posts to
// Formspree (if set) or opens a pre-filled email to him.
export const LAYLO_URL = null;

// Community offers he checked on the intake (Membership, Skool, GoFundMe,
// Low-barrier Offer), with Membership as Patreon per the call notes
// ("Subscribe/patreon"). No links yet, so each shows as "coming soon" until an
// href is filled in.
export const COMMUNITY_OFFERS = [
  {
    key: "membership",
    title: "Patreon",
    blurb: "Walk closer with the music: early listens, studio sessions, and a seat at the table as the album comes together.",
    href: null, // PENDING: Patreon URL
  },
  {
    key: "skool",
    title: "Skool Community",
    blurb: "A gathering place for the family: teachings, conversation, and the stories behind the songs.",
    href: null,
  },
  {
    key: "gofundme",
    title: "Fund the Album",
    blurb: "Help carry Written in Stone from the studio to the world.",
    href: GOFUNDME_URL,
  },
  {
    key: "offer",
    title: "A First Offering",
    blurb: "A simple, low-cost way in, for anyone who wants to support and receive something real in return.",
    href: null,
  },
];

// --- Contact / socials -------------------------------------------------------

export const SITE_CONTACT = {
  name: "Benjamin Pitz",
  email: "jahspurmusic@gmail.com",
};

export const BOOKING_EMAIL = "jahspurmusic@gmail.com";

// PENDING: no Formspree form yet. While null, the booking and signup forms
// open a pre-filled email to BOOKING_EMAIL (with the template's copy-the-
// message fallback). Paste a Formspree endpoint here to switch them to a real
// form backend with no other changes.
export const FORMSPREE_ENDPOINT = null;

// Only Instagram was given (everything else: "none").
export const SOCIALS = [{ label: "Instagram", href: "https://www.instagram.com/jahspurmusic/" }];

// --- EPK ------------------------------------------------------------------------

export const EPK_STATS = [
  { value: "1,000+", label: "Live Performances" },
  { value: "13", label: "Years Touring with a Jamaican Music Band" },
  { value: "20+", label: "Years in Roots Music" },
  { value: "4", label: "Regions: NM · East · West · Hawaii" },
];

export const EPK_REGIONS = ["Northern New Mexico", "East Coast", "West Coast", "Hawaii"];

export const EPK_SHORT_BIO =
  "Jah Spur (Benjamin Pitz) grew up in a multi-generational musical family, reading music before he could read English: violin first, then trumpet, now guitar and beyond. At thirteen he began steeping in Jamaican music through his parents and their close friends, and through high school and college he played in a touring Jamaican music band. After thirteen years he left to follow his own path across the country and abroad, learning from different cultures and writing the songs that became his debut album, Written in Stone. Today he leads his own band, The Strongbacks, out of Taos, New Mexico, and records in his own studio.";

export const EPK_PROUDEST = "Creating my own band and investing in my own recording studio.";

export const BOOKING_STATUS = "Now Booking Festivals & Gatherings";
export const BOOKING_COPY = "Festivals, community gatherings, conscious events, and private shows. Solo, or with The Strongbacks.";

// Press quotes: none yet (intake: "None"). The EPK hides this section until
// there's at least one. { quote, source, href? }
export const PRESS_QUOTES = [];

// Tracking pixel (Meta Pixel / GA): pending. Same placeholder pattern as the
// template; <TrackingPixel /> is a no-op until these are set.
export const TRACKING_PIXEL_IDS = {
  metaPixelId: null,
  googleAnalyticsId: null,
};


// --- Home world (JahWorld.jsx) ---------------------------------------------------
// Portal (Ben over the mist loop) -> tap or scroll -> transition video plays
// through -> the layered world, which scroll then drives (Burnell's pattern;
// see docs in JahWorld.jsx). All media is under public/world. Bump MEDIA_V
// whenever any of those files is re-encoded, or phones keep the old copy.
export const MEDIA_V = 2;
const v = (p) => `${p}?v=${MEDIA_V}`;

// Rects are [x, y, w, h] in the world canvas's pixels: where each video's
// full frame sits relative to the layers (measured by matching frames).
// `region` is the part of the canvas the screen is fitted to at the start
// (the transition's end frame). `depth` sets how much a layer moves (scroll
// and tilt); real parallax goes with 1/distance, so the far range and the
// valley barely move and the near canopy and leaves carry the motion.
export const WORLD = {
  phone: {
    canvas: [941, 1672],
    region: [0, 0, 941, 1672],
    portal: { loop: v("/world/portal-phone.mp4"), poster: v("/world/portal-phone-poster.webp"), cutout: v("/jahspur-hero-mobile-cutout.webp"), rect: [1.88, -1.88, 937.24, 1675.88] },
    transition: { src: v("/world/transition-phone.mp4"), poster: v("/world/transition-phone-poster.webp"), rect: [1.88, -1.88, 937.24, 1675.88] },
    sky: { src: v("/world/sky-phone.mp4"), poster: v("/world/sky-phone-poster.webp"), rect: [1.88, -3.76, 937.24, 1678.63] },
    layers: [
      { key: "sky", src: v("/world/phone-sky.webp"), depth: 0 },
      { key: "mountains", src: v("/world/phone-mountains.webp"), depth: 0.05 },
      { key: "valley", src: v("/world/phone-valley.webp"), depth: 0.08 },
      { key: "canopy", src: v("/world/phone-canopy.webp"), depth: 0.35 },
      { key: "leaves", src: v("/world/phone-leaves.webp"), depth: 1, part: true },
    ],
  },
  desktop: {
    canvas: [1182, 1330],
    region: [0, 0, 1182, 664.88],
    portal: { loop: v("/world/portal-desktop.mp4"), poster: v("/world/portal-desktop-poster.webp"), cutout: v("/jahspur-hero-desktop-cutout.webp"), rect: [0, 0, 1182, 664.88] },
    transition: { src: v("/world/transition-desktop.mp4"), poster: v("/world/transition-desktop-poster.webp"), rect: [0, 0, 1182, 664.88] },
    sky: { src: v("/world/sky-desktop.mp4"), poster: v("/world/sky-desktop-poster.webp"), rect: [0, 4.73, 1182, 659.95] },
    layers: [
      { key: "sky", src: v("/world/desktop-sky.webp"), depth: 0 },
      { key: "mountains", src: v("/world/desktop-mountains.webp"), depth: 0.05 },
      { key: "valley", src: v("/world/desktop-valley.webp"), depth: 0.08 },
      { key: "canopy", src: v("/world/desktop-canopy.webp"), depth: 0.35 },
      { key: "leaves", src: v("/world/desktop-leaves.webp"), depth: 1, part: true },
    ],
  },
};
