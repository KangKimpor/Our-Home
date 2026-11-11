# Our Home

*Our Home* is an original, offline-first, cozy home-and-pets decorating web game (PWA) designed for iPhone landscape and desktop browsers. Decorate nine rooms, care for resident pets, tend a little farm and kitchen, welcome 24 animal visitors, and collect polaroid Moments.

## Features
- **9 Decoratable Rooms:** Living Room, Bedroom, Kitchen, Bathroom, Studio, Nursery, Porch, Garden, and Little Farm (`1920×884` letterboxed stage with PixiJS v8 + React 18 overlays).
- **120+ Original Items:** Floor, wall, and surface furniture with colour variants, grid snapping (`64 px`), flip, 20-step undo/redo, and 50% sell-back refund.
- **Pets, Critters & Visitors:** Up to 6 resident pets (cat, dog, rabbit, bird) with autonomous spot AI and happiness, window/garden critters, and 24 discoverable visitors with favourite food categories and gifts.
- **Farm & Kitchen:** 6 crop plots (3 unlockable), 4 farm producers (cow, hen, pond, beehive), 4 cooking stations (pot, pan, mixing bowl, oven), and 24 recipes across Side Dish, Main, and Dessert.
- **Moments Album:** 20 auto-triggered polaroid scenes with timestamps, repeat counters, and PNG download/share.
- **Family & Customization:** Two customizable adult characters and an optional "Show the baby" toggle.
- **Events & Day/Night/Season:** Real-time clock lighting (dawn/day/dusk/night), 4 seasonal palettes, 3 calendar events, and a dev time-travel clock.
- **Save & Cloud Sync:** Debounced IndexedDB autosave, `localStorage` unload mirror, 5 rolling local snapshots, JSON/Backup-Code export/import, and optional Auth0 + Supabase RLS cloud sync with conflict resolution.

## Local Development

```powershell
npm install
npm run assets      # Generate icons and synthesized WAV audio
npm run dev         # Start Vite dev server at http://localhost:5173
```

## Testing & Verification

```powershell
npm test            # Run Vitest unit test suite
npm run typecheck   # Run TypeScript strict check
npm run lint        # Run ESLint
npm run build       # Production typecheck + Vite PWA build
npm run test:e2e    # Run Playwright E2E tests (852x393 iPhone 15 landscape & 1280x720 desktop)
```

## Cloud Save Setup (Optional)
Copy `.env.example` to `.env` and populate:
- `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

Apply the database schema and RLS policies in [`supabase/migrations/0001_saves.sql`](./supabase/migrations/0001_saves.sql) to your Supabase project.

## Documentation
- [`docs/ART_GUIDE.md`](./docs/ART_GUIDE.md) — Visual style, palette tokens, and stage specifications
- [`docs/BALANCE.md`](./docs/BALANCE.md) — Economy, timers, and progression tunables
- [`docs/CREDITS.md`](./docs/CREDITS.md) — Font and open-source library licenses
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — Architecture and licensing notes
