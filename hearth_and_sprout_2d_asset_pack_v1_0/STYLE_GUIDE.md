# Hearth & Sprout — 2D Game Asset Pack Style Guide (v6.0 — Sofa-Benchmarked Unified Hand-Drawn Pass)

This style guide defines the visual identity, botanical color system, hand-drawn charcoal-umber ink linework, flat matte fills, room perspective, scale hierarchy, naming conventions, and export specifications for the **Hearth & Sprout** 2D asset pack — unified directly against **Approved Asset #2 — Revised Cottage Lounge Sofa (`cottage_lounge_sofa.png`)** as the primary style benchmark.

---

## 1. Visual Identity & Artistic Direction

- **Primary Style Benchmark:** `sprites/living_room/cottage_lounge_sofa.png` (Approved Asset #2). Every asset is refined to look as though the same human illustrator drew it on an iPad with the same pen, coloring technique, and cozy indie-game personality.
- **Mood:** Hand-illustrated, warm, charming, and slightly imperfect — like a cozy independent 2D life-simulation game.
- **Finish:** Clean, solid, **flat matte color fills** with restrained simple cel shading from subtle upper-left lighting and occasional darker tonal planes for depth.
- **Avoid:** Sterile CAD-like geometry, overly smooth symmetrical vector outlines, glossy 3D specular highlights, photorealistic textures, heavy watercolor blotches, muddy patches, blurry outlines, cast ground shadows, watermarks, or unintended text/letters/numbers.
- **Perspective:** Cozy elevated 3/4 view for freestanding furniture, planters, tools, and creatures; 1-point perspective (`1600×900`) for `backgrounds/living_room_backdrop.png`.

---

## 2. Master Color Palette

All sprites stay consistent with this 8-color warm botanical palette (additional warm natural wood tones permitted where harmonious):

| Swatch Name | Base Hex | Primary Usage |
| :--- | :---: | :--- |
| **Deep Charcoal-Umber Ink** | `#2C221E` | Confident hand-drawn outlines, interior folds, seams, wood-grain ticks, solid button eyes (never pure `#000000`) |
| **Oat Cream** | `#F3E7CE` | Lampshades, stoneware, clock dial, animal bellies, seed packets, baskets, throw stripes |
| **Sage** | `#8FA88A` | Light foliage, cushions, cuffs, painted trays, tortoise skin, clock bezel |
| **Moss** | `#64785B` | Deep foliage, herbs, vine leaves, clover accents |
| **Terracotta** | `#C87F62` | Clay pots, teapots, lamp base, tortoise shell, suede trim, bird bath rim, throw pillows |
| **Honey** | `#D8AA5F` | Warm oak furniture, wooden handles, straw hats, brass accents, calamondin fruit |
| **Dusty Teal** | `#6F9E9B` | Cottage sofa upholstery, enamelware, glasshouse frame, rainwater, frog body, trowel blade |
| **Plum** | `#856B78` | Hedgehog quills, throw pillows, hat ribbon, blossoms, sugar pot, lampshade trim |

---

## 3. Hand-Drawn Linework Rules

- **Ink Color:** Dark warm charcoal-umber (`#2C221E`), never pure black.
- **Line Character:** Slightly irregular, confident, medium-bold organic outlines with subtle variations in thickness and curvature, gentle imperfections at corners/edges/joints, and crisp hand-drawn interior strokes for fabric folds, wood grain, seams, leaves, and decorative stitches.
- **Intentional Craft:** Imperfection feels deliberate and warm — never sketchy, blurry, unfinished, or messy.
- **Closed Silhouettes:** Every sprite maintains a clean closed ink silhouette so it reads crisply on any floor, wall, grass, or UI surface without baked drop shadows.

---

## 4. Coloring, Shading & Surface Finish

- **Flat Matte Fills:** Solid color regions with restrained, simple cel shading using subtle upper-left lighting.
- **No Gloss / No Gradients:** Glossy highlights, plastic specular streaks, glowing candle halos, and smooth digital airbrushing are removed in favor of matte hand-inked fills.
- **Character Eyes:** Simple expressive solid dark charcoal-umber button eyes (no anime eye catchlights).
- **No Baked Ground Shadows:** Freestanding sprites contain zero cast shadows so the game engine can draw uniform contact shadows at runtime.

---

## 5. Canvas, Margins & Scale Hierarchy

All 27 sprites are delivered at **`512×512` px** (`1:1` aspect ratio) transparent RGBA PNGs, centered cleanly with comfortable empty margins (`>= 32 px` on all four sides) and zero cropping. Fully transparent pixels (`alpha == 0`) have zeroed RGB `(0, 0, 0, 0)` and edge-decontaminated anti-aliasing to prevent white halos on dark surfaces.

| Scale Tier | Recommended World Scale | Assets |
| :--- | :---: | :--- |
| **Large** (Furniture & Garden Structures) | `0.90x – 1.25x` | `braided_oval_rug`, `cottage_lounge_sofa`, `arched_display_bookshelf`, `flowering_trellis`, `arched_window_seat`, `two_wheeled_herb_cart`, `raised_herb_bed`, `tea_trolley`, `potted_calamondin_tree`, `standing_globe_floor_lamp`, `low_oak_coffee_table`, `seed_drawer_cabinet` |
| **Medium** (Accent Decor, Tools & Creatures) | `0.60x – 0.72x` | `patchwork_floor_cushion`, `wall_pinboard_trio`, `curved_orchard_stool`, `wall_clock`, `mossback_hedgehog`, `terracotta_tortoise`, `tiny_bird_bath`, `greenhouse_lantern`, `sunhat_garden_frog`, `small_reading_lamp`, `rounded_watering_can` |
| **Small** (Handheld Props) | `0.45x – 0.48x` | `garden_gloves`, `hand_trowel`, `seed_packets`, `ceramic_plant_marker` |

---

## 6. No-Text & Naming Policy

- Props that conventionally carry labels (`seed_drawer_cabinet`, `wall_clock`, `seed_packets`, `ceramic_plant_marker`, `wall_pinboard_trio`) use **purely abstract botanical icons, dots, and geometric borders** — zero legible text, letters, numbers, or faux-writing.
- **Directory Layout:** `sprites/<category>/<asset_id>.png` (`home`, `living_room`, `garden`, `characters`, `small_props`), lowercase `snake_case`.
