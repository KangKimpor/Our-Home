# Our Home — Art Direction & Style Guide

## 1. Stage & Viewport
- **Virtual resolution:** `1920 × 884` (≈ 2.17:1 landscape).
- **Scaling:** Uniform scale-to-fit inside the browser viewport; letterboxed with the active room's ambient wall/backdrop colour (never stretched or cropped).
- **Safe area:** All interactive HUD controls respect `env(safe-area-inset-*)` and maintain hit targets ≥ `44 × 44` CSS px.

## 2. Linework & Fills
- **Outline:** Uniform `3 px` stroke at `1920` stage width, ink colour `#2E2A26`, round line joins and round line caps (`stroke-linejoin="round" stroke-linecap="round"`).
- **Fills:** Flat vector fills with soft shadow/highlight accents; single gentle tone shift between wall and floor planes.
- **Floor patterns:** Original room-specific floor treatments (wide oak planks in Living Room, soft woven boards in Bedroom, warm checkerboard tile in Kitchen, pebbled stone in Bathroom, cedar decking on Porch, lush grass/stepping stones in Garden & Farm).

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
- **Display:** `Fredoka` (OFL) — rounded, friendly headers and counters.
- **Body:** `Nunito` (OFL) — legible rounded sans-serif for descriptions and controls.

## 5. Originality Guardrails
- All room layouts, furniture silhouettes, animal species/coats, visitor characters, and Moment polaroid scenes are authored from scratch as procedural SVG generators in `src/art/`.
- No reference screenshots, logos, character designs, or third-party game assets are traced, imported, or reused.
