# Hearth & Sprout — 2D Game Asset Pack Style Guide (v5.0 — New Design Anchor Harmonized)

This style guide defines the visual identity, sunlit botanical color system, hand-drawn monoline ink linework, clean flat matte fills, room perspective, scale hierarchy, naming conventions, and export specifications for the **Hearth & Sprout** original home, living room & garden 2D asset pack — harmonized directly to the 4 user-approved ChatGPT design anchor assets (`living_room_backdrop`, `cottage_lounge_sofa`, `low_oak_coffee_table`, `braided_oval_rug`).

---

## 1. Visual Identity & Genre Direction

- **Mood:** Warm, sunlit, charmingly imperfect hand-drawn 2D cottage life simulation.
- **Finish:** Clean, luminous **flat matte color fills** (zero blotchy watercolor spots or muddy dark patches) with warm golden honey-oak wood tones (`#EEB45D` / `#D29448` with `#9F6B35` ochre wood-grain ticks) paired with bold, organic **cocoa-espresso freehand felt-tip ink** (`#2D1E18`).
- **Avoid:** Muddy blotches, fuzzy outlines, sterile CAD geometry, photorealism, glossy 3D rendering, anime eye catchlights, legible text/letters/numerals on props, or baked floor shadows on freestanding sprites.
- **Perspective:** Cozy elevated 3/4 view for freestanding furniture, planters, tools, and creatures; true 1-point perspective (`1600×900`) for `backgrounds/living_room_backdrop.png`.

---

## 2. Master Color Palette

All sprites derive their primary fills and subtle flat shadow planes strictly from this 8-color warm botanical palette (with ink deepened slightly from `#493A35` to rich espresso-umber `#3B2E29` in v1.1 for punchier hand-inked contrast):

| Swatch Name | Base Hex | Subtle Light Accent | Flat Shadow Plane | Primary Usage |
| :--- | :---: | :---: | :---: | :--- |
| **Ink (Espresso-Umber)** | `#3B2E29` (base `#493A35`) | `#695146` (soil / dark wood) | `#2F2420` | Bold felt-tip outlines, solid button eyes, seams, wood ticks |
| **Oat Cream** | `#F3E7CE` | `#FAF3E3` | `#DFCFAF` | Fabric shades, ceramics, clock dial, animal bellies, stone |
| **Sage** | `#8FA88A` | `#ABC1A6` | `#748D6F` | Light foliage, cushions, cuffs, painted wood trim |
| **Moss** | `#64785B` | `#7C9272` | `#4E6046` | Deep foliage, herbs, vine leaves, clover accents |
| **Terracotta** | `#C87F62` | `#D99B80` | `#A76247` | Clay pots, teapots, lamp base, tortoise shell, suede trim |
| **Honey** | `#D8AA5F` | `#E7C484` | `#BA8B43` | Warm oak furniture, wooden handles, straw hats, brass |
| **Dusty Teal** | `#6F9E9B` | `#8CB8B5` | `#57827F` | Enamelware, glasshouse frame, rainwater, frog body, trowel |
| **Plum** | `#856B78` | `#9E8491` | `#6B5360` | Hedgehog quills, throw pillows, ribbons, blossoms, sugar pot |

---

## 3. Outline & Linework Rules

- **Ink Color:** Rich espresso-umber `#3B2E29` (warm dark umber anchored to `#493A35`, never stark pure `#000000`).
- **Outer Silhouette Weight:** Bold, confident comic outline of **6.5–7.5 px** at final `512×512` export resolution (equivalent to `13–15 px` at `1024×1024` working canvas).
- **Internal Detail Weight:** **3.0–4.5 px** at `512×512` for wood seams, fabric quilting stitches, leaf veins, and expressive hand-inked detail ticks.
- **Line Character:** Rounded line caps and joins (`round`), with dual-frequency organic felt-tip wobble (gentle macro hand-drawn curve + fine nib-tooth irregularity; in SVG sources via `<filter id="hand-ink">` at `scale="6.2"` + `scale="1.9"` on `1024×1024`).
- **Closed Silhouettes:** Every freestanding sprite maintains a bold closed outer ink contour so sprites pop cleanly against floors, grass, or UI surfaces without baked drop shadows.

---

## 4. Lighting, Shading & Surface Finish

- **Shading Model:** Flatter cozy comic fills — smooth digital gradients and glossy specular streaks are flattened into clean matte color blocks with restrained single-step shadow planes for gentle 3D readability.
- **Character Eyes:** Simple, expressive solid dark-umber button eyes (no glossy specular eye dots).
- **Texture:** Subtle unified warm sketchbook paper-tooth grain confined strictly inside opaque fills.
- **No Baked Shadows:** Sprites omit ground shadows so game engines can render uniform contact shadows at runtime.

---

## 5. Scale Hierarchy & Canvas Rules

All sprites are exported at a uniform **`512×512` px** RGBA PNG resolution to preserve consistent outline weight and crisp detail across game scenes and inventory UI. Each sprite is centered inside a **`448×448` px** safe frame, guaranteeing at least **`32 px` (6.25%)** transparent padding on every edge.

To place sprites at natural world proportions in a 2D scene, apply the recommended scale multipliers recorded in `manifest.json`:

| Scale Tier | Recommended World Scale | Example Assets |
| :--- | :---: | :--- |
| **Large** (Furniture & Garden Structures) | `0.90x – 1.05x` | `arched_window_seat`, `flowering_trellis`, `two_wheeled_herb_cart`, `tea_trolley`, `potted_calamondin_tree`, `raised_herb_bed`, `seed_drawer_cabinet` |
| **Medium** (Accent Decor, Tools & Creatures) | `0.60x – 0.72x` | `patchwork_floor_cushion`, `curved_orchard_stool`, `small_reading_lamp`, `wall_clock`, `greenhouse_lantern`, `rounded_watering_can`, `tiny_bird_bath`, `mossback_hedgehog`, `terracotta_tortoise`, `sunhat_garden_frog` |
| **Small** (Handheld Props) | `0.45x – 0.48x` | `seed_packets`, `garden_gloves`, `hand_trowel`, `ceramic_plant_marker` |

---

## 6. Iconography & No-Text Policy

- Props that conventionally carry labels (`seed_drawer_cabinet`, `wall_clock`, `seed_packets`, `ceramic_plant_marker`) use **purely abstract botanical icons, dots, and geometric borders**.
- **Zero legible text, letters, numbers, or faux-script** appear anywhere in the pack so assets remain localization-free and crisp at small screen sizes.

---

## 7. Naming & Export Specifications

- **Directory Structure:** `sprites/<category>/<asset_id>.png` where `<category>` is one of `home`, `garden`, `characters`, or `small_props`.
- **Filenames:** Lowercase `snake_case`, descriptive noun phrases (`arched_window_seat.png`, `sunhat_garden_frog.png`).
- **Format:** 8-bit/channel PNG (`RGBA`), full alpha channel, zeroed RGB values in fully transparent pixels (`alpha == 0`) to prevent bilinear filtering halo artifacts.
- **Editable Source Artwork:** Newly authored SVG vector files for the 9 vector-illustrated sprites are provided under `source_svg/<asset_id>.svg` using a `1024×1024` viewBox.
