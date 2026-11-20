# Our Home — Art Direction & Style Guide

## 1. Stage & Viewport
- **Virtual resolution:** `1920 × 884` (≈ 2.17:1 landscape).
- **Scaling:** Uniform scale-to-fit inside the browser viewport; letterboxed with the active room's ambient wall/backdrop colour (never stretched or cropped).
- **Safe area:** All interactive HUD controls respect `env(safe-area-inset-*)` and maintain hit targets ≥ `44 × 44` CSS px.

## 2. Linework & Fills — "drawn by hand, not plotted"
- **Engine:** `src/art/hand.ts` (seeded wobble geometry) feeds both renderers:
  - SVG art (`src/art/svg.ts` primitives `r/c/el/p/line`): bowed edges, sharp boxes drawn as four strokes that cross at the corners, circles that loop past their start, and a second wider dashed pen pass for pressure.
  - Room painters (`src/stage/sketch.ts`, a drop-in for Pixi `Graphics`): one shared "paper warp" field bends every point, outlines become tapered ink ribbons whose weight swells and thins.
- **Finishing filter:** every SVG texture is wrapped in `oh-hand` (ink displacement + pencil tooth + watercolour pooling). The stage and UI surfaces sit under a fine paper-tooth overlay.
- **Shading:** pencil hatching (contact shadows, baseboards, sills) instead of blurred drop shadows or gradients.
- **Determinism:** wobble is seeded from shape parameters, so textures are stable between rebuilds and fills stay registered with their outlines.

## 3. Core Palette Tokens
| Token | Hex | Usage |
|---|---|---|
| Wall Cream | `#F3EFE0` | Indoor walls, card backgrounds, modal surfaces |
| Warm Wood | `#8C6B4C` | Plank headers, furniture frames, floorboards |
| Dark Wood | `#5B4130` | Deep wood trim, borders, structural accents |
| Sage | `#7F9B5C` | Foliage, primary cozy accents, soft buttons |
| Moss | `#4E6B3E` | Outdoor shadows, deep leaf tones, hedges |
| Dusty Blue | `#8EA7C6` | Windows, sky accents, water, bathroom tile |
| Brick Red | `#C4483B` | Heart currency, berries, warm focal accents |
| Butter Yellow | `#E9C65B` | Lamps, sunlight, stars, feed bowl highlights |
| Soft Pink | `#E8A6B0` | Blossoms, cushions, sweet desserts |
| Ink | `#2E2A26` | All linework, primary typography |

## 4. Typography
- **Display:** `Gaegu` (OFL) — hand-lettered headings, counters and labels.
- **Body:** `Patrick Hand` (OFL) — legible handwriting for descriptions and controls.
- **UI surfaces:** hand-cut paper (irregular corner radii), solid ink offset shadows, washi tape, sticky notes and string tags.

## 5. Asset Pipeline
- Every room, item, animal, character, HUD illustration and Moment scene is original procedural art in `src/art/` and `src/stage/`.
- No third-party or screenshot-derived bitmaps are rendered by the game.
