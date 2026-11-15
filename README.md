# Jah Spur — Artist Website

Built from the LightStorm artist template (`lightstormdesign/sierra-marin-website`) and Jah Spur's Artist Discovery Form (submitted 11/11/2026). Same stack and architecture as Sierra's site: React + Tailwind + Framer Motion via CRACO, multi-page routes, all content in `frontend/src/data/site.js`.

```bash
cd frontend
yarn install
yarn start      # dev
yarn build      # production build -> frontend/build (served by wrangler.jsonc)
```

## Creative direction (from the intake)

- **World:** his Prophecy answer ("misty, mystic, sunrise, sunset, half-moon, mountain tops") plus "ancient future," NM deserts, rivers, mountains.
- **Palette:** red / gold / green straight from his cube logo, on a warm high-desert night, with adobe and sage earth tones (`--js-*` in `src/index.css`).
- **Type:** Marcellus (Roman-inscription capitals: "ancient," "written in stone") + Cormorant Garamond for reading + Outfit for UI. Nothing western-novelty: he asked for nothing kitschy or gimmicky.
- **Symbols:** the cube, trinity knot, and Coptic cross he named, plus generic rock-art marks (sun, spiral, mountain) in `components/site/Glyphs.jsx`. Deliberately no copied tribal/NAC sacred imagery.

## Pages

| Route | File | Notes |
|---|---|---|
| `/` | `Home.jsx` + `DawnExperience.jsx` | Pinned scroll sequence (same mechanism as Sierra's Portal→Hero, built from layers since there's no footage): half-moon night over the Sangre de Cristo ridgelines → mist + sunrise → "spur (verb)" → hero photo. Then album + list signup. |
| `/album` | `Album.jsx` | *Written in Stone* (coming soon), carved-stone tablet in place of artwork (`AlbumTablet.jsx`), "Prophecy" story, list signup, support button. |
| `/about` | `About.jsx` | Sierra's pinned documentary mechanism, his story in his own words, his About photos. |
| `/community` | `Community.jsx` | List signup (5,000-person goal) + the four offers he checked (Membership, Skool, GoFundMe, low-barrier offer). |
| `/epk` | `EPK.jsx` | Stats, bio, downloadable press photos + zip, booking form. |
| `/contact` | `Contact.jsx` | Email + Instagram. |

Tour and Shop routes were dropped (no dates, no merch yet). Add them back in `App.js` + `NAV_LINKS` when needed.

## PENDING from the client (all in `data/site.js`)

Everything below degrades gracefully today and switches on by filling in one value:

- `FORMSPREE_ENDPOINT`: booking + signup forms currently open a pre-filled email to jahspurmusic@gmail.com (with copy-message fallback). Set an endpoint to make them real forms.
- `LAYLO_URL`: "not sure yet." If set, signup becomes a Laylo button.
- `GOFUNDME_URL` / `PRESALE_URL`: album support / presale. Until set, "Ways to Support" routes to Community.
- `COMMUNITY_OFFERS[].href`: Membership, Skool, GoFundMe, low-barrier offer show "Coming soon" until linked.
- `ALBUM_COVER`: drop in artwork and the stone tablet is replaced automatically.
- `STREAMING_LINKS`: none yet (primary platform "NA").
- Music: no audio files supplied, so no player and no hook-song clip yet.
- `TRACKING_PIXEL_IDS`: Meta / GA.

See `ASSET_MANIFEST.md` for where each submitted photo landed.
