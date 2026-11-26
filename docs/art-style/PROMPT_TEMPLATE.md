# Our Home — Reusable Asset Generation Prompt Template

Use this template whenever generating **new furniture, plants, wall decor, props, pets, or rooms** so every future asset matches the living room seamlessly.

## 1. Always Attach These Committed Style References
Attach **both** files from this repository to every generation call:
1. `docs/art-style/STYLE_REFERENCE_BOARD.png` — Primary hand-drawn style benchmark (sofa, throw pillows, bookshelf, tea trolley, coffee table, floor cushion, hedgehog, hanging plant, fireplace).
2. `docs/art-style/BACKDROP_STYLE_CROP.png` — 1:1 native-pixel close-up of the backdrop's ink weight (~3.5 px), warm sepia-umber tone (`#312210`), and matte gouache wash.

> **Batching Rule:** Prefer generating **4–6 related items together** on a single `2×2` (4:3) or `3×2` (16:9) pure white sheet rather than one item per call. Drawing items in one image locks brush texture, palette, and perspective together and keeps generation usage low.

---

## 2. Master Sprite Sheet Prompt Template

```text
Create a clean [2×2 (4:3) / 3×2 (16:9)] cozy 2D cottage game sprite sheet on a
PURE SOLID FLAT #FFFFFF WHITE background containing EXACTLY [4 / 6] distinct
sprites with wide, generous empty white space between every object (ZERO
overlap, ZERO grid lines, ZERO borders, ZERO text labels, ZERO cast floor
shadows).

STYLE BENCHMARK — match the EXACT hand-drawn art style of the attached
STYLE_REFERENCE_BOARD.png and BACKDROP_STYLE_CROP.png 100%:
- Organic, slightly uneven, gently wobbly warm dark charcoal-umber felt-tip
  ink outlines (#312210, never pure #000000) with natural human pen pressure
  (subtle swelling and tapering) and closed silhouettes.
- Soft matte hand-painted gouache / watercolor wash fills with gentle paper
  warmth and restrained upper-left daylight shading.
- Cozy Hearth & Sprout warm botanical palette:
  - Ink: #312210 (warm charcoal-umber)
  - Oat Cream: #F3E7CE (lampshades, mugs, bellies, cloth, frames — NEVER pure white inside objects)
  - Warm Wall Cream: #F7F0DF
  - Honey Oak: #D8AA5F (furniture frames, floorboards, handles)
  - Terracotta: #C87F62 (pots, bricks, teapots, pillows, cheeks)
  - Dusty Teal: #6F9E9B (upholstery, vases, window frames, enamel)
  - Sage: #8FA88A & Moss: #64785B (chunky hand-drawn foliage, cushions, trim)
  - Muted Plum: #856B78 (quills, pillows, blossoms, accents)
- Straight-on 1-point cozy cottage front/side elevation (horizontal edges
  parallel to the floor line — NO steep 45-degree diagonal isometric tilt).
- Characters/pets MUST face LEFT (the game mirrors horizontally when walking
  right), use solid dark charcoal-umber button eyes (zero anime eye sparkles),
  and clean matte terracotta cheek ovals (no airbrushed gradient blur).
- Zero legible text, letters, or numerals on clocks, labels, or packets — use
  simple abstract botanical dots and leaves only.

STRICTLY AVOID:
- Sterile smooth Adobe Illustrator / flat vector Bezier clipart.
- Glossy 3D highlights, smooth digital airbrushing, or shiny chibi/anime sticker shading.
- Dense fine fur hatching or cramped micro-detail that muddies at 105–210 px height.
- Baked floor shadows (the game draws `.contact-shadow` at runtime).

EXACT GRID PLACEMENT:
- Top-Left: <item description>
- Top-Right: <item description>
- Bottom-Left: <item description>
- Bottom-Right: <item description>
```

---

## 3. Master Room Backdrop Prompt Template (`16:9` -> `1600×900`)

```text
Create a 16:9 cozy hand-painted 2D cottage room interior backdrop matching the
EXACT uneven charcoal-umber ink pen (#312210), warm matte gouache wash, and
botanical palette of STYLE_REFERENCE_BOARD.png and BACKDROP_STYLE_CROP.png.

STRUCTURAL ALIGNMENT (required by src/game/layout.ts):
- Straight-on 1-point perspective.
- Top ~5% of height (y = 0..45 at 1600x900): honey-oak ceiling beam spanning full width.
- Exact 60% down from top (y = 540 at 1600x900): clean horizontal wooden
  baseboard separating the unobstructed warm plaster back wall (top 60%) from
  the empty floor (bottom 40%).
- Completely EMPTY open floor and center back wall (NO rugs, NO sofas, NO
  tables, NO wall clocks, NO pets) so players can place furniture freely.
```

---

## 4. Processing Pipeline (After Generating)

1. **Slice, alpha-clean & normalize to `512×512` pack PNGs:**
   ```bash
   python scripts/slice-sheet.py --grid 2x2 raw_sheet.jpg \
     home/item_one living_room/item_two garden/item_three characters/item_four
   ```
   *(Or `--single raw.jpg characters/new_pet` / `--backdrop raw_bg.jpg bedroom_backdrop`.)*

2. **Register active sprites in `scripts/import-sprites.mjs`:**
   Add an entry to `SPRITE_SPECS` with its in-room `height` (matching `src/game/layout.ts`), `inkBlend` (`0.0–0.15` for tall items ≥ 240 px, `0.55–0.9` for medium/small items 105–210 px), `wobble` (`0.5–2.35` px at 2× room scale), and `uneven` (`0.25–1.0` for bidirectional pen swelling/tapering and nib-tooth grain).

3. **Run the harmonization & sync step:**
   ```bash
   npm run sprites
   ```
   This automatically applies seeded multi-octave hand-drawn contour wobble, bidirectional uneven dark-ink swelling and tapering (~3.5 px average in room space) with paper-tooth grain, warm sepia ink-hue alignment (`RGB(49, 34, 16)`), and exact `1376/1600` optical-resolution parity with the backdrop, writing `public/sprites/*.png` and `src/game/sprites.json`.

4. **QA in-scene (never only in isolation):**
   Verify the new sprites placed onto the room backdrop at their real `layout.ts` heights and run:
   ```bash
   npm run typecheck && npm run lint && npm test && npm run build
   ```
