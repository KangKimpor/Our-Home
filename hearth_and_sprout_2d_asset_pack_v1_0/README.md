# Hearth & Sprout — Original Home, Living Room & Garden 2D Game Asset Pack (v6.0)

An original, clean-room 2D cozy home-and-garden asset pack featuring **27 transparent-background `512×512` RGBA PNG sprites**, **1 full `1600×900` 1-point-perspective Living Room backdrop**, **1 assembled Living Room scene preview**, and **1 retained editable SVG source** (`source_svg/wall_pinboard_trio.svg`, preserved per user preference), all unified against **Approved Asset #2 — Revised Cottage Lounge Sofa (`cottage_lounge_sofa.png`)**.

> **v6.0 Unified Hand-Drawn Pass:** All 23 remaining sprites (both thin-line/glossy v5 rasters and v5 SVG fallbacks, excluding the 3 approved living-room anchors and the user-kept original `wall_pinboard_trio`) were redrawn and refined directly against `cottage_lounge_sofa.png` for uniform dark charcoal-umber (`#2C221E`) hand-drawn ink, matte botanical colors, restrained upper-left cel shading, and crisp de-haloed transparency. See [QA_REPORT.md](./QA_REPORT.md) for the complete per-sprite audit and provenance record.

---

## Folder Structure

```text
hearth_and_sprout_2d_asset_pack_v1_0/
├── README.md                              # Pack overview and game-engine integration guide
├── STYLE_GUIDE.md                         # Master palette (#2C221E ink), hand-inked linework & export rules
├── manifest.json                          # Machine-readable catalog with dimensions, padding, SHA-256 & provenance
├── QA_REPORT.md                           # Automated + visual QA checks and per-sprite metrics
├── backgrounds/
│   └── living_room_backdrop.png           # 1600x900 1-point-perspective empty cottage living room shell
├── previews/
│   └── living_room_showcase.png           # 1600x900 assembled preview using the unified v6.0 pack sprites
├── sprites/
│   ├── home/                              # 6 indoor furniture & decor sprites (512x512 RGBA PNG)
│   ├── living_room/                       # 6 3/4 living room furniture & decor sprites (512x512 RGBA PNG)
│   ├── garden/                            # 7 outdoor garden structures & tools (512x512 RGBA PNG)
│   ├── characters/                        # 3 original friendly garden creatures (512x512 RGBA PNG)
│   └── small_props/                       # 5 handheld/compact garden props (512x512 RGBA PNG)
└── source_svg/
    └── wall_pinboard_trio.svg             # Editable SVG source for the retained original pinboard sprite
```

---

## Included Assets

- **Living Room Backdrop (1):** `backgrounds/living_room_backdrop.png` (`1600×900`)
- **Living Room Furniture & Decor (6):** `cottage_lounge_sofa` (primary style benchmark), `low_oak_coffee_table`, `braided_oval_rug`, `arched_display_bookshelf`, `standing_globe_floor_lamp`, `wall_pinboard_trio`
- **Home (6):** `arched_window_seat`, `seed_drawer_cabinet`, `small_reading_lamp`, `tea_trolley`, `wall_clock`, `patchwork_floor_cushion`
- **Garden (7):** `rounded_watering_can`, `greenhouse_lantern`, `two_wheeled_herb_cart`, `flowering_trellis`, `potted_calamondin_tree`, `curved_orchard_stool`, `raised_herb_bed`
- **Original Characters (3):** `mossback_hedgehog`, `terracotta_tortoise`, `sunhat_garden_frog`
- **Small Props (5):** `seed_packets`, `garden_gloves`, `hand_trowel`, `ceramic_plant_marker`, `tiny_bird_bath`
- **Assembled Preview (1):** `previews/living_room_showcase.png`

---

## How to Use in a 2D Game Engine

1. **Read `manifest.json`** to load sprite paths (`filename`), categories (`category`), transparent margins (`transparency.padding_px`), and suggested relative display scales (`recommended_world_scale`).
2. **Import into Our Home:** Run `npm run sprites` (`scripts/import-sprites.mjs`) to trim and sync the active living-room sprites into `public/sprites/` and regenerate `src/game/sprites.json`.
3. **Anchor / Pivot Setup:** All sprites are centered inside a `512×512` transparent canvas with `>= 32 px` padding on all four edges. Place bottom pivots at `(width / 2, height - padding_px.bottom)` for Y-sorted 3/4 rooms.
4. **Texture Filtering:** All fully transparent pixels carry zeroed RGB `(0, 0, 0, 0)` and decontaminated alpha edges so bilinear filtering and mipmaps remain halo-free against both light and dark backgrounds.

---

## Provenance & Rights Notice

All assets in this pack are AI-assisted / AI-generated (3 approved ChatGPT living-room design anchors + 1 backdrop, 1 retained AI-authored SVG pinboard, and 23 sprites refined with Antigravity's `image-generator` benchmarked to `cottage_lounge_sofa.png` and alpha-normalized in Python). Human authorship, copyright ownership, and exclusive rights are **not** claimed; `license_status` remains `unverified` in `manifest.json` pending review of the applicable AI platform terms.
