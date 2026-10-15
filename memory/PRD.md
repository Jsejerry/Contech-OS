# ConTech OS — Landing App PRD

## Original problem statement
Mobile landing page for ConTech OS (construction company + global networking app). Hero: 3D Earth globe focused on France, France glowing orange in the middle, "ConTech OS" + logo above it — only those two things. On scroll, the glowing globe animates to the bottom of the screen and the wordmark moves to the top-left. Sections: What it does → How it connects → How it works → Join Waitlist button. Interactive, 3D scroll-animated, follow brand PDF colors and reference image.

## User choices
- Waitlist: form (name + email) saved to DB + "You're on the list" confirmation
- True 3D WebGL globe (expo-gl + three)
- English; stick to reference image (dark navy, orange #FF6200)

## Architecture
- Backend: FastAPI + MongoDB. `POST /api/waitlist` (dedupe by email, returns position), `GET /api/waitlist/count`
- Frontend: Expo Router single screen `app/index.tsx`
  - `src/components/globe.tsx` three.js scene (dot-matrix land from Natural Earth, glowing France fill + outline, Paris arcs, travelling pulses, atmosphere/halo), driven by scroll + horizontal drag
  - `header.tsx` wordmark morph hero→top-left, glass header, Join + menu
  - `reveal.tsx` scroll-driven 3D tilt reveals
  - Sections: what / connect (interactive 6-audience orbit) / works (scroll timeline + 3D Need/Offer flip card) / final CTA with live count
  - `waitlist-sheet.tsx` bottom-sheet form w/ role chips, validation, success state

## Implemented (Jun 2026)
- All of the above; backend 9/9 tests pass, frontend flows verified

## Backlog
- P1: Real logo asset from brand kit; share/referral link after joining
- P2: Admin view/export of waitlist; French language toggle
