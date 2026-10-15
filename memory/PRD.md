# ConTech OS — Landing App PRD

## Original problem statement
Mobile landing page for ConTech OS (construction company + global networking app). Hero: 3D Earth globe focused on France, France glowing orange in the middle, "ConTech OS" + logo above it — only those two things. On scroll, the glowing globe animates to the bottom of the screen and the wordmark moves to the top-left. Sections: What it does → How it connects → How it works → Join Waitlist button. Interactive, 3D scroll-animated, follow brand PDF colors and reference image.

## User choices
- Waitlist: form (name + email) saved to DB + "You're on the list" confirmation
- True 3D WebGL globe (expo-gl + three)
- English; stick to reference image (dark navy, orange #FF6200)
- Latest request: "i want it to look 100 similar to this design and i have put the article what there should be"; confirmed "yes i want it to look like the reference image I have given you". This supersedes the earlier globe-only opening. Hero now follows PDF page 5.

## Architecture
- Backend: FastAPI + MongoDB. `POST /api/waitlist` (dedupe by email, returns position), `GET /api/waitlist/count`
- Frontend: Expo Router single screen `app/index.tsx`
  - `src/components/globe.tsx` true three.js scene (NASA terrain + night-light DataTexture, Natural Earth boundaries, glowing France, city rings/pins, Paris arcs, travelling pulses, blue atmosphere), driven by scroll + horizontal drag; merged line geometry for mobile performance, disposal on resize/unmount
  - `src/globe-material.ts`: cross-platform raw RGBA texture loading, no DOM-only loaders
  - `header.tsx` fixed top-left reference logo, three-line hamburger, glass background on scroll
  - `hero-section.tsx`: exact reference headline/description, paired waitlist and explore buttons, three pillars, orbital background lines, scroll hint
  - `reveal.tsx` scroll-driven 3D tilt reveals
  - Sections: what / connect (interactive 6-audience orbit) / works (scroll timeline + 3D Need/Offer flip card) / final CTA with live count
  - `waitlist-sheet.tsx` bottom-sheet form w/ role chips, validation, success state
  - Managed object storage via `backend/brand_assets.py`, `brand_manifest.json`. GET `/api/brand/logo` (extracted PDF mark); GET `/api/brand/earth?v=2` (1536x768 raw RGBA, NASA day texture RGB + night intensity alpha). Public allowlisted brand assets only; no arbitrary file access. Credentials backend-only. Assets cached in server memory and with HTTP cache headers; gzip responses.
  - `backend/prepare_brand_assets.py`: optional one-time preparation utility, requires source files in /tmp; assets are already persisted remotely, not required at runtime.

## Reference-alignment update
- Reference: user-provided CONTECH OS DESGIN (1).pdf, especially page 5; exact uploaded symbol extracted and stored remotely.
- Matching dark near-black navy, orange OS and ecosystem text, black text on orange CTA, outlined Explore Platform CTA with play icon; hero content appears immediately (no empty splash section).
- PDF article wording restored for What it does (Bridging the Post-Event Void), Who it connects, How it works; six-audience orbit, dual card interaction and four-step workflow retained. Product example clearly labeled illustrative preview.
- Waitlist close control increased to 44px, pending submit disabled; existing name/email/optional role persistence unchanged.
- Screenshot-verified 390x844 hero, zero horizontal document overflow at 320px, menu navigation, audience selection, fresh waitlist open/close, Explore Platform. TypeScript and lints passed. Testing-agent full regression passed all UI flows, including success/duplicate waitlist, final CTA, all audience selectors, card flip and horizontal globe drag at both sizes.
- Testing iteration2 flagged public Cache-Control override. RCA verified this is intentional preview ingress behavior, not an app defect; application returns correct cacheable header. Tests now independently check origin cache policy and public asset functionality; do not override preview infrastructure. Frontend session texture reuse and expo-image disk/memory cache remain configured.
- Final self-verification: 15/15 backend pytest checks passed (`/app/test_reports/pytest/final_regression.xml`); direct origin curl confirmed HTTP200, PNG, `Cache-Control: public, max-age=86400`. No app-flow failures remain in tested preview.
- Texture sources: NASA Blue Marble via turban/webgl-earth (2_no_clouds_4k.jpg) and Three.js examples Earth night lights (earth_lights_2048.png); outlines Natural Earth public-domain data.

## Implemented (Jun 2026)
- All of the above; backend 9/9 tests pass, frontend flows verified

## Globe-only scroll animation enhancement
- User: "i want you to add more scroll animation to this just add animation to globe scroll animation rest everything same"; confirmed smooth rotation, gentle zoom and downward glide reversing on scroll back.
- Only runtime changes: `src/components/globe.tsx` and new pure `src/globe-motion.ts`; no layout, article, header, button, waitlist, API, texture or theme changes.
- Absolute scroll-driven zoom/rotation/tilt/parallax, continued subtle motion along the lower screen edge, frame-rate-independent scroll damping, transient atmosphere/network brightening. Original globe pose at zero scroll retained. Reduced-motion preference disables extra rotations/zoom/brightening; horizontal drag retained.
- Lint and TypeScript passed; hero screenshot unchanged. Testing iteration3 passed real wheel/tap/drag at390x844 and320x740, scroll checkpoints and return-to-top, reduced-motion, Explore/menu, waitlist open/close. Pure helper runtime tests passed; nonfinite current/delta guard added and covered. Only pre-existing Chromium ReadPixels performance warning; physical-device frame performance not measured. For future tests, use real wheel/touch or scrollable descendant rather than scrollTo on the outer landing-scroll testID.

## Backlog
- P0: None in implemented preview flows. Real-device Expo rendering/performance acceptance remains unverified.
- P1: Share/referral link and optional challenge/objective micro-survey from the PDF; native-device acceptance of globe and scroll behavior
- P2: Admin view/export of waitlist; French language toggle
