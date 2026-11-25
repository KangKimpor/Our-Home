# QA & Provenance Report — Hearth & Sprout 2D Asset Pack (v5.0)

- **Pack Version:** `5.0.0` (Harmonized to User's 4 New Design Anchor Assets)
- **QA Date:** `2026-11-25`
- **Approved Included Sprites:** `27` (Home: 6, Living Room: 6, Garden: 7, Original Characters: 3, Small Props: 5)
- **Room Backdrops Included:** `1` (`backgrounds/living_room_backdrop.png`, `1600×900`)
- **Assembled Scene Previews Included:** `1` (`previews/living_room_showcase.png`, `1600×900`)
- **Newly Created Editable SVG Sources Included:** `12` (`source_svg/*.svg`, matching the 12 vector-authored sprites 1:1)
- **Excluded Unverified Reference Material:** `0` files in `home_garden_2d_asset_pack_v1_1` + `130` identical duplicate cutout files in `C:\Users\Por\Downloads\assets` + user-uploaded third-party screenshot (all excluded and untouched; `C:\Users\Por\Downloads\New assets` originals also left untouched)

---

## 1. Automated & Visual QA Checks Performed

| Check | Result | Details |
| :--- | :---: | :--- |
| **Manifest path & SHA-256 integrity** | PASS | All 27 sprites, 1 backdrop, 1 showcase preview, and 12 SVG sources exist on disk and inside the ZIP with matching SHA-256 digests. |
| **Valid RGBA PNG & alpha channel (sprites)** | PASS | Every sprite opens cleanly (`PNG`, `RGBA`), has >35% transparent pixels, `>= 30 px` padding on all four edges, and zeroed RGB `(0,0,0,0)` on fully transparent pixels. |
| **v5.0 New Design Anchor Integration QA** | PASS | Cleanly integrated all 4 user-supplied ChatGPT anchor assets (`Cozy Storybook Living Room.png` → `1600×900`, `Cozy Teal Loveseat with Throws.png` black-background flood-fill & AA de-halo, `Cosy Pastel Coffee Table Vignette.png` & `Hand-Drawn Autumn Braided Rug.png` speck-cleaned RGBA). Sampled their exact sunlit palette (`#2D1E18` ink, `#EEB45D` honey oak, `#9F6B35` wood grain, `#DC8A63` terracotta, `#76A099` teal, `#96B098` sage, `#F8EAD5` cream, `#946A75` plum) and harmonized all 24 remaining sprites to match seamlessly. Visually verified on dark checkerboard, warm oat, and assembled `living_room_showcase.png`. |
| **No-text / no-HUD / no-watermark audit** | PASS | Confirmed zero legible text, numerals, HUD overlays, or watermarks across all assets. |
| **Clean ZIP & hygiene verification** | PASS | Finished ZIP passes `zipfile.testzip()`, contains exact expected file count (45 clean files), and contains zero `.jpg`/`.jpeg` files, zero third-party screenshots, zero v1.1 assets, zero QA scratch sheets, and zero hidden files. |
| **Source file immutability** | PASS | `home_garden_2d_asset_pack_v1_1`, `Downloads\assets`, and `Downloads\New assets` were accessed read-only and left untouched. |

---

## 2. Per-Sprite QA Summary (27 Sprites)

| Sprite ID | Category | Dimensions / Mode | Transparent % | Padding (px) | Production Pipeline | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| `arched_window_seat` | `home` | 512×512 RGBA | 50.1% | T:32 R:85 B:32 L:85 | AI raster + v5 anchor harmonization | PASS |
| `seed_drawer_cabinet` | `home` | 512×512 RGBA | 42.2% | T:32 R:39 B:32 L:39 | AI raster + v5 anchor harmonization | PASS |
| `small_reading_lamp` | `home` | 512×512 RGBA | 67.4% | T:32 R:105 B:32 L:104 | AI raster + v5 anchor harmonization | PASS |
| `tea_trolley` | `home` | 512×512 RGBA | 65.2% | T:32 R:56 B:32 L:56 | AI raster + v5 anchor harmonization | PASS |
| `wall_clock` | `home` | 512×512 RGBA | 57.9% | T:32 R:68 B:32 L:67 | AI raster + v5 anchor harmonization | PASS |
| `patchwork_floor_cushion` | `home` | 512×512 RGBA | 50.3% | T:79 R:32 B:80 L:32 | AI raster + v5 anchor harmonization | PASS |
| `rounded_watering_can` | `garden` | 512×512 RGBA | 69.2% | T:109 R:32 B:109 L:32 | AI raster + v5 anchor harmonization | PASS |
| `greenhouse_lantern` | `garden` | 512×512 RGBA | 62.1% | T:32 R:101 B:32 L:100 | AI raster + v5 anchor harmonization | PASS |
| `two_wheeled_herb_cart` | `garden` | 512×512 RGBA | 57.8% | T:39 R:32 B:39 L:32 | AI raster + v5 anchor harmonization | PASS |
| `flowering_trellis` | `garden` | 512×512 RGBA | 61.8% | T:32 R:85 B:32 L:84 | Hand-drawn SVG + v5 anchor palette | PASS |
| `potted_calamondin_tree` | `garden` | 512×512 RGBA | 71.8% | T:32 R:108 B:32 L:107 | AI raster + v5 anchor harmonization | PASS |
| `curved_orchard_stool` | `garden` | 512×512 RGBA | 55.4% | T:47 R:32 B:47 L:32 | Hand-drawn SVG + v5 anchor palette | PASS |
| `raised_herb_bed` | `garden` | 512×512 RGBA | 59.4% | T:55 R:32 B:55 L:32 | Hand-drawn SVG + v5 anchor palette | PASS |
| `mossback_hedgehog` | `characters` | 512×512 RGBA | 45.3% | T:32 R:60 B:32 L:60 | AI raster + v5 anchor harmonization | PASS |
| `terracotta_tortoise` | `characters` | 512×512 RGBA | 60.4% | T:46 R:32 B:47 L:32 | Hand-drawn SVG + v5 anchor palette | PASS |
| `sunhat_garden_frog` | `characters` | 512×512 RGBA | 53.9% | T:32 R:72 B:32 L:71 | Hand-drawn SVG + v5 anchor palette | PASS |
| `seed_packets` | `small_props` | 512×512 RGBA | 43.1% | T:32 R:37 B:32 L:36 | Hand-drawn SVG + v5 anchor palette | PASS |
| `garden_gloves` | `small_props` | 512×512 RGBA | 51.2% | T:32 R:36 B:32 L:35 | Hand-drawn SVG + v5 anchor palette | PASS |
| `hand_trowel` | `small_props` | 512×512 RGBA | 77.7% | T:32 R:53 B:32 L:53 | Hand-drawn SVG + v5 anchor palette | PASS |
| `ceramic_plant_marker` | `small_props` | 512×512 RGBA | 78.4% | T:32 R:134 B:32 L:133 | Hand-drawn SVG + v5 anchor palette | PASS |
| `tiny_bird_bath` | `small_props` | 512×512 RGBA | 59.1% | T:32 R:57 B:32 L:57 | AI raster + v5 anchor harmonization | PASS |
| `cottage_lounge_sofa` | `living_room` | 512×512 RGBA | 61.7% | T:112 R:32 B:113 L:32 | User ChatGPT anchor + alpha/512 norm | PASS |
| `low_oak_coffee_table` | `living_room` | 512×512 RGBA | 68.1% | T:84 R:32 B:85 L:32 | User ChatGPT anchor + alpha/512 norm | PASS |
| `braided_oval_rug` | `living_room` | 512×512 RGBA | 68.8% | T:141 R:32 B:142 L:32 | User ChatGPT anchor + alpha/512 norm | PASS |
| `arched_display_bookshelf` | `living_room` | 512×512 RGBA | 44.8% | T:32 R:76 B:32 L:75 | Hand-drawn SVG + v5 anchor palette | PASS |
| `standing_globe_floor_lamp` | `living_room` | 512×512 RGBA | 87.6% | T:32 R:123 B:32 L:123 | Hand-drawn SVG + v5 anchor palette | PASS |
| `wall_pinboard_trio` | `living_room` | 512×512 RGBA | 37.3% | T:39 R:32 B:40 L:32 | Hand-drawn SVG + v5 anchor palette | PASS |

---

## 3. Rights, Provenance & Limitations Disclosure

- **Multi-Tool AI-Assisted Provenance:**
  - **4 design anchor assets** (`living_room_backdrop`, `cottage_lounge_sofa`, `low_oak_coffee_table`, `braided_oval_rug`) were generated by the user in ChatGPT from our original Hearth & Sprout prompts (`Downloads\New assets`) and normalized in Python.
  - **12 core sprites** were created with Antigravity's built-in AI `image-generator` tool and harmonized in Python to the exact sunlit anchor palette and `#2D1E18` cocoa-espresso ink.
  - **12 remaining sprites** (`arched_display_bookshelf`, `standing_globe_floor_lamp`, `wall_pinboard_trio`, `flowering_trellis`, `curved_orchard_stool`, `raised_herb_bed`, `terracotta_tortoise`, `sunhat_garden_frog`, `seed_packets`, `garden_gloves`, `hand_trowel`, `ceramic_plant_marker`) were hand-authored as original SVGs by the AI agent, remapped to the exact sampled anchor palette and `#2D1E18` bold hand-drawn ink, and rendered via Playwright/Chromium (Antigravity's built-in `image-generator` remained on `HTTP 429` cooldown during this pass).
- **Authorship & Licensing (`unverified`):** All assets in this pack are AI-generated / AI-agent-authored. Human authorship, guaranteed exclusivity, copyright ownership, and a verified license are **not** claimed. Review applicable AI platform terms and local copyright rules before distribution.

---

## 4. Excluded Unverified Third-Party Reference Material

| Reference Subfolder (`home_garden_2d_asset_pack_v1_1`) | Excluded File Count | Exclusion Reason |
| :--- | :---: | :--- |
