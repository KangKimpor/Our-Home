# Our Home — Credits & Third-Party Licenses

## Visual Art & Audio
- **Procedural SVG Illustrations & Engine Assets:** Core procedural SVG illustrations (`src/art/*`, `scripts/generate-icons.mjs`) authored specifically for *Our Home*.
- **Cozy Home & Garden 2D Game Asset Pack v1.1 (`public/asset-pack-v1.1/`):** User-provided art pack selectively integrated using clean, verified `transparent_background: true` cutouts per [`public/asset-pack-v1.1/AGENT_HANDOFF.md`](../public/asset-pack-v1.1/AGENT_HANDOFF.md) (see `src/art/assetPack.ts`), alongside procedural SVG counterparts and layout palettes grounded in the reference scenes.
- **Audio & Music:** Synthesized PCM/WAV audio (`scripts/generate-audio.mjs` → `public/audio/*.wav`), generated algorithmically with zero external samples.

## Fonts (SIL Open Font License 1.1)
- **Fredoka** (`@fontsource/fredoka`) — Copyright (c) Milena Brandao, licensed under the SIL Open Font License 1.1.
- **Nunito** (`@fontsource/nunito`) — Copyright (c) Vernon Adams, Cyreal, licensed under the SIL Open Font License 1.1.

## Open-Source Runtime Libraries
| Package | License | Purpose |
|---|---|---|
| `react`, `react-dom` | MIT | UI overlays, menus, HUD, and modal dialogs |
| `pixi.js` | MIT | 2D WebGL/Canvas stage rendering for rooms, furniture, pets, and bubbles |
| `zustand` | MIT | Reactive game store |
| `immer` | MIT | Immutable state transitions for pure simulation ticks |
| `idb-keyval` | Apache-2.0 | IndexedDB persistence for local saves and rolling snapshots |
| `howler` | MIT | Web Audio music and SFX playback buses |
| `i18next`, `react-i18next` | MIT | English UI string table (`src/i18n/en.json`) |
| `@auth0/auth0-spa-js` | MIT | Optional PKCE SPA authentication for Cloud Save |
| `@supabase/supabase-js` | MIT | Optional Postgres RLS client for Cloud Save |
