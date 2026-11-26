# Our Home — Architecture & Product Decisions

## 1. License
- **Default chosen:** All Rights Reserved for original code, artwork, text, and audio in this repository; third-party open-source dependencies and OFL fonts retain their respective licenses as listed in [`docs/CREDITS.md`](./CREDITS.md).

## 2. Rendering & Art Pipeline
- **Unified Hand-Drawn Cottage Gouache Pipeline:** All room backdrops, furniture, plants, pets, and resident characters are raster image assets stored in `hearth_and_sprout_2d_asset_pack_v1_0/` and synced into `public/` via `npm run sprites` (`scripts/import-sprites.mjs`).
- **Permanent Uneven Hand-Drawn Outline Design Decision:** Every asset must use **visibly uneven, slightly wobbly, organic hand-drawn charcoal-umber ink outlines (`#312210`, ~3.5 px in `1600 × 900` room space)** with natural pen swelling/tapering and warm matte gouache fills—never smooth uniform digital monoline lines, vector clipart, or skinny webtoon/Bitmoji proportions. Human characters use plump, chunky ~2.2-head storybook proportions to match the furniture and pets.
- **Embedded Style Benchmarks & Harmonization:** Reference boards (`docs/art-style/STYLE_REFERENCE_BOARD.png`, `docs/art-style/BACKDROP_STYLE_CROP.png`), prompt rules (`docs/art-style/PROMPT_TEMPLATE.md`, `docs/ART_GUIDE.md`), slicing (`scripts/slice-sheet.py`), and deterministic bidirectional uneven-ink & `1376/1600` optical-resolution harmonization (`scripts/import-sprites.mjs`) are committed in-repo so every future asset stays visually uniform.

## 3. Persistence & Cloud Save (Guest-First)
- **Local-first durability:** Primary save is stored in IndexedDB (`idb-keyval`) with a synchronous `localStorage` mirror on `pagehide` and a rolling ring of 5 snapshots (`our-home/snapshots`). Corrupt primary saves automatically fall back to the mirror or newest valid snapshot.
- **Cloud Save & Accounts:**
  - Target owner account: `sbprojects88@gmail.com`.
  - Database migration (`supabase/migrations/0001_saves.sql`) defines `public.saves` and `public.save_snapshots` with Row Level Security policies checking `(auth.jwt() ->> 'sub') = user_id` and a trigger rotating the newest 10 cloud snapshots per user.
  - Client code reads `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env`. When these variables are not populated, the app runs seamlessly in offline/guest mode with local autosave and manual JSON/Backup-Code export/import.

## 4. Language Scope
- **English-only per owner request:** Shipped with English (`src/i18n/en.json`) only; non-English translation bundles (`km`, `zh`) and language switchers were removed per owner direction.
