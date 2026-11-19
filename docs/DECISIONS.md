# Our Home — Architecture & Product Decisions

## 1. License
- **Default chosen:** All Rights Reserved for original code, artwork, text, and audio in this repository; third-party open-source dependencies and OFL fonts retain their respective licenses as listed in [`docs/CREDITS.md`](./CREDITS.md).

## 2. Rendering & Art Pipeline
- **Hybrid Procedural SVG & Curated Cutout Pipeline:** Furniture (~120 items with variants), 4 resident pet species (4 poses each), 24 visitors, 2 adult customizable characters + optional baby, and 20 Moment polaroid scenes are backed by deterministic SVG generators in `src/art/`. PixiJS v8 renders these SVG textures on demand, selectively pairing clean `transparent_background: true` cutouts from the user-provided Cozy Home & Garden 2D Asset Pack v1.1 (`src/art/assetPack.ts`) where cutout quality passes inspection while React panels reuse crisp SVGs.
- **Audio Generation:** `scripts/generate-audio.mjs` synthesizes warm acoustic-style loops (`day.wav`, `night.wav`) and 16 gentle sound effects directly into `public/audio/` so the repository is self-contained and CC0/copyright-clean.

## 3. Persistence & Cloud Save (Guest-First)
- **Local-first durability:** Primary save is stored in IndexedDB (`idb-keyval`) with a synchronous `localStorage` mirror on `pagehide` and a rolling ring of 5 snapshots (`our-home/snapshots`). Corrupt primary saves automatically fall back to the mirror or newest valid snapshot.
- **Cloud Save & Accounts:**
  - Target owner account: `sbprojects88@gmail.com`.
  - Database migration (`supabase/migrations/0001_saves.sql`) defines `public.saves` and `public.save_snapshots` with Row Level Security policies checking `(auth.jwt() ->> 'sub') = user_id` and a trigger rotating the newest 10 cloud snapshots per user.
  - Client code reads `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env`. When these variables are not populated, the app runs seamlessly in offline/guest mode with local autosave and manual JSON/Backup-Code export/import.

## 4. Language Scope
- **English-only per owner request:** Shipped with English (`src/i18n/en.json`) only; non-English translation bundles (`km`, `zh`) and language switchers were removed per owner direction.
