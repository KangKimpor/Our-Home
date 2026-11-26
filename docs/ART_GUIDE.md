# Our Home — Art Direction & Style Guide

This guide is the source of truth for visual uniformity across every room backdrop, furniture item, plant, prop, and pet in **Our Home**.

## 1. Visual Style Anchors (Embedded in Repo)
All future asset generation **must** reference these committed visual benchmarks:
- **Master Style Reference Board:** [`docs/art-style/STYLE_REFERENCE_BOARD.png`](./art-style/STYLE_REFERENCE_BOARD.png)
- **1:1 Backdrop Ink & Texture Crop:** [`docs/art-style/BACKDROP_STYLE_CROP.png`](./art-style/BACKDROP_STYLE_CROP.png)
- **Reusable Generation Prompts & Workflow:** [`docs/art-style/PROMPT_TEMPLATE.md`](./art-style/PROMPT_TEMPLATE.md)
- **Live Composed Living Room Reference:** [`hearth_and_sprout_2d_asset_pack_v1_0/previews/living_room_showcase.png`](../hearth_and_sprout_2d_asset_pack_v1_0/previews/living_room_showcase.png)

## 2. Stage & Room Geometry
- **Logical room size:** `1600 × 900` (`16:9` landscape), defined in [`src/game/layout.ts`](../src/game/layout.ts).
- **Scaling:** Uniform scale-to-fit inside the viewport, letterboxed cleanly (never stretched or cropped).
- **Room alignment landmarks:**
  - Ceiling beam: `y = 0..45` (`ROOM.wallTop = 45`).
  - Wall-to-floor baseboard seam: `y = 540` (`ROOM.wallBottom = 540`, 60% from top).
  - Floor placement band: `y = 565..885` (`ROOM.floorMinY..floorMaxY`).

## 3. Linework, Texture & Perspective ("Hand-Inked Cottage Gouache")
- **Ink Color:** Warm deep charcoal-umber `#312210` (`RGB(49, 34, 16)`) — never pure `#000000`.
- **Uneven Hand-Drawn Outlines:** Confident, slightly wobbly, organic felt-tip/brush-pen outlines whose thickness subtly swells and tapers (`~3.5 px` average in `1600 × 900` room space). Closed silhouettes so sprites read cleanly over any wall or floor surface.
- **Fills & Shading:** Warm matte hand-painted gouache / watercolor wash with subtle paper warmth and restrained upper-left daylight shading.
- **Perspective:** Straight-on 1-point cozy cottage elevation (horizontal furniture edges parallel to the floor planks — avoid steep 45° diagonal isometric rotation).
- **Pets & Characters:** Face **left** by default (`src/ui/Pet.tsx` flips horizontally with `scaleX(-1)` when walking right), solid dark charcoal-umber button eyes (no anime catchlights), matte terracotta cheek ovals (no airbrushed blur).
- **No Baked Shadows / No Text:** Zero cast floor shadows (rendered at runtime via `.contact-shadow` in `src/ui/Furniture.tsx` and `src/ui/Pet.tsx`) and zero legible letters or numbers (use abstract botanical icons and dots).
- **Strictly Avoid:** Sterile smooth Bezier vector clipart, plastic 3D specular gloss, airbrushed gradients, or dense fine fur/woodgrain hatching that muddies at `105–210 px` display height.

## 4. Core Botanical Palette Tokens
| Swatch | Hex | Primary Usage |
|---|---|---|
| **Charcoal-Umber Ink** | `#312210` | All uneven hand-drawn outlines, interior folds, solid button eyes |
| **Warm Wall Cream** | `#F7F0DF` | Indoor plaster walls, ambient backdrop |
| **Oat Cream** | `#F3E7CE` | Lampshades, mugs, throws, animal bellies, baskets (never pure `#FFFFFF` inside objects) |
| **Honey Oak** | `#D8AA5F` | Floorboards, beams, furniture frames, handles, warm accents |
| **Terracotta** | `#C87F62` | Fireplace bricks, clay pots, teapots, cushions, matte cheek blushes |
| **Dusty Teal** | `#6F9E9B` | Sofa upholstery, vases, window frames, cloth accents |
| **Sage** | `#8FA88A` | Foliage, trays, cushions, botanical trim |
| **Moss** | `#64785B` | Deep leaves, trailing vines, shadow foliage |
| **Muted Plum** | `#856B78` | Hedgehog quills, throw pillows, sugar pot, flower accents |

## 5. Repeatable Asset Pipeline
1. **Generate in batches** (4–6 items on a pure `#FFFFFF` sheet, or 1:1 for single hero pieces) using [`docs/art-style/PROMPT_TEMPLATE.md`](./art-style/PROMPT_TEMPLATE.md) with both reference images in `docs/art-style/` attached.
2. **Slice & normalize** into `hearth_and_sprout_2d_asset_pack_v1_0/` (`512 × 512` edge-decontaminated RGBA PNGs, `>= 32 px` padding, zeroed RGB on transparent pixels) using [`scripts/slice-sheet.py`](../scripts/slice-sheet.py):
   ```bash
   python scripts/slice-sheet.py --grid 2x2 raw_sheet.jpg home/item_a living_room/item_b ...
   ```
3. **Harmonize & sync** into `public/sprites/`, `public/backgrounds/`, and `src/game/sprites.json` using [`scripts/import-sprites.mjs`](../scripts/import-sprites.mjs):
   ```bash
   npm run sprites
   ```
   `import-sprites.mjs` enforces uniform room-space visual craft automatically:
   - Seeded organic hand-drawn wobble (`wobble`),
   - Pressure-modulated uneven dark-ink thickening (`inkBlend`, keeping mid-dark fills untouched),
   - Exact `#312210` sepia-umber ink hue + warm sunlit fill lift,
   - Exact `1376 / 1600` optical-resolution parity with `living_room_backdrop.webp` so downscaled small sprites never look artificially sharper or thinner than the room backdrop.
