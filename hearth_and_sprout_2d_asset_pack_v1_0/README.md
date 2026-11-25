# Hearth & Sprout — Original Home, Living Room & Garden 2D Game Asset Pack (v5.0)

An original, clean-room 2D cozy home-and-garden asset pack featuring **27 transparent-background PNG sprites**, **1 full `1600×900` 1-point-perspective Living Room backdrop**, **1 assembled Living Room scene preview**, and **12 newly created editable SVG source files**, all harmonized to the sunlit hand-drawn monoline ink & clean flat matte aesthetic of your 4 new design anchor assets (`living_room_backdrop`, `cottage_lounge_sofa`, `low_oak_coffee_table`, `braided_oval_rug`).

> **Clean-Room Origin:** Every sprite, backdrop, and preview in this pack was created from scratch. Zero screenshots, screenshot crops, traced art, catalogs, or unverified assets from the supplied v1.1 reference pack or `Downloads\assets` folder are included. See [QA_REPORT.md](./QA_REPORT.md) for the complete exclusion log and transparent provenance/rights disclosure.

---

## Folder Structure

```text
hearth_and_sprout_2d_asset_pack_v1_0/
├── README.md                              # Pack overview and game-engine integration guide
├── STYLE_GUIDE.md                         # Master palette, hand-inked linework, room perspective & export rules
├── manifest.json                          # Machine-readable catalog with dimensions, hashes, and provenance
├── QA_REPORT.md                           # Automated + visual QA checks, exclusions, and rights disclosures
├── backgrounds/
│   └── living_room_backdrop.png           # 1600x900 1-point-perspective empty cottage living room shell
├── previews/
│   └── living_room_showcase.png           # 1600x900 assembled preview using original pack sprites
├── sprites/
│   ├── home/                              # 6 indoor furniture & decor sprites (512x512 RGBA PNG)
│   ├── living_room/                       # 6 3/4 living room furniture & decor sprites (512x512 RGBA PNG)
│   ├── garden/                            # 7 outdoor garden structures & tools (512x512 RGBA PNG)
│   ├── characters/                        # 3 original friendly garden creatures (512x512 RGBA PNG)
│   └── small_props/                       # 5 handheld/compact garden props (512x512 RGBA PNG)
└── source_svg/                            # 12 newly created editable SVG source files (for the 12 vector sprites)
```

---

## Included Assets

- **Living Room Backdrop (1):** `backgrounds/living_room_backdrop.png` (`1600×900`, `wallBottom = 534`, 13-row hand-drawn oak plank floor, angled sunlit patio doorway, brick-and-stone cottage fireplace hearth)
- **Living Room Furniture & Decor (6):** `cottage_lounge_sofa`, `low_oak_coffee_table`, `braided_oval_rug`, `arched_display_bookshelf`, `standing_globe_floor_lamp`, `wall_pinboard_trio`
- **Home (6):** `arched_window_seat`, `seed_drawer_cabinet`, `small_reading_lamp`, `tea_trolley`, `wall_clock`, `patchwork_floor_cushion`
- **Garden (7):** `rounded_watering_can`, `greenhouse_lantern`, `two_wheeled_herb_cart`, `flowering_trellis`, `potted_calamondin_tree`, `curved_orchard_stool`, `raised_herb_bed`
- **Original Characters (3):** `mossback_hedgehog`, `terracotta_tortoise`, `sunhat_garden_frog`
- **Small Props (5):** `seed_packets`, `garden_gloves`, `hand_trowel`, `ceramic_plant_marker`, `tiny_bird_bath`
- **Assembled Preview (1):** `previews/living_room_showcase.png`

---

## How to Use in a 2D Game Engine

1. **Read `manifest.json`** to auto-load sprite paths (`file`), categories (`category`), and suggested relative display scales (`recommended_world_scale`).
2. **Anchor / Pivot Setup:**
   - All sprites are centered inside a `512×512` transparent canvas with `>= 32 px` padding on all sides.
   - For top-down or 3/4 room placement (Y-sorting), set the sprite's bottom pivot using `(width / 2, height - padding_px.bottom)` from `manifest.json`, or place a soft warm-umber elliptical ground shadow (`#493A35` at `15–20%` opacity) beneath the base.
3. **Texture Filtering:**
   - Standard bilinear filtering works cleanly because all fully transparent pixels have zeroed RGB channels (`(0, 0, 0, 0)`) and all AI-rasterized cutouts were edge-decontaminated against white.
   - Generate mipmaps when displaying sprites below `128×128` px to keep the dark umber outlines smooth.
4. **Editing Vector Sources:**
   - The 9 SVG files in `source_svg/` open directly in Inkscape, Illustrator, Figma, or any modern browser and use named hex colors from `STYLE_GUIDE.md` plus a subtle `<filter id="hand-ink">` displacement filter.

---

## Provenance & Rights Notice

This pack was created using a hybrid AI-assisted workflow (12 sprites generated via the built-in Antigravity AI `image-generator` tool and alpha-matted in Python; 9 sprites authored as original SVG vector illustrations by the AI agent and rendered via headless Chromium/Playwright after image-generation quota exhaustion).

- **Authorship:** AI-generated / AI-agent-authored; human authorship is **not** claimed.
- **License / Ownership Status:** Marked `unverified` in `manifest.json`. Neither exclusive copyright ownership nor a specific open-source/commercial license is claimed until the user reviews the applicable AI platform terms of service and local copyright rules for their intended distribution.
