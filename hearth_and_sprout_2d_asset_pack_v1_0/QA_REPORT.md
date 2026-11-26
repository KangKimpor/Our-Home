# QA & Provenance Report — Hearth & Sprout 2D Asset Pack (v6.0)

- **Pack Version:** `6.0.0` (Sofa-Benchmarked Unified Hand-Drawn Pass)
- **QA Date:** `2026-11-26`
- **Primary Style Benchmark:** `sprites/living_room/cottage_lounge_sofa.png` (Approved Asset #2 — Revised Cottage Lounge Sofa)
- **Approved Included Sprites:** `27` (Home: 6, Living Room: 6, Garden: 7, Original Characters: 3, Small Props: 5)
- **Room Backdrops Included:** `1` (`backgrounds/living_room_backdrop.png`, `1600×900`)
- **Assembled Scene Previews Included:** `1` (`previews/living_room_showcase.png`, `1600×900`)
- **Retained Editable SVG Sources:** `1` (`source_svg/wall_pinboard_trio.svg`, preserved per user preference; the 11 other v5.0 SVG fallbacks were retired after full hand-drawn raster refinement)

---

## 1. Automated & Visual QA Checks Performed

| Check | Result | Details |
| :--- | :---: | :--- |
| **Manifest path & SHA-256 integrity** | PASS | All 27 sprites, 1 backdrop, 1 showcase preview, and 1 retained SVG source exist on disk with exact matching file sizes and SHA-256 digests. |
| **Valid 512×512 RGBA PNG & alpha hygiene** | PASS | Every sprite opens cleanly (`512×512`, `RGBA`), has `> 35%` transparent pixels, `>= 32 px` padding on all four edges, zeroed RGB `(0, 0, 0, 0)` on every transparent pixel, and decontaminated anti-aliased edges verified on dark checkerboard and warm oat cream. |
| **6-Point Hand-Drawn Uniformity Audit** | PASS | All 23 reworked sprites (`arched_display_bookshelf`, `standing_globe_floor_lamp`, `arched_window_seat`, `patchwork_floor_cushion`, `seed_drawer_cabinet`, `small_reading_lamp`, `tea_trolley`, `wall_clock`, `curved_orchard_stool`, `flowering_trellis`, `greenhouse_lantern`, `potted_calamondin_tree`, `raised_herb_bed`, `rounded_watering_can`, `two_wheeled_herb_cart`, `mossback_hedgehog`, `sunhat_garden_frog`, `terracotta_tortoise`, `ceramic_plant_marker`, `garden_gloves`, `hand_trowel`, `seed_packets`, `tiny_bird_bath`) were visually verified side-by-side against `cottage_lounge_sofa.png` for matching `#2C221E` organic charcoal-umber ink, matte botanical palette, restrained upper-left cel shading (zero glossy streaks or gradients), preserved silhouettes/proportions, and zero baked shadows. |
| **Interior transparent-hole extraction** | PASS | Verified open interior holes (`tea_trolley` shelf gaps & wheel spokes, `flowering_trellis` diamond lattice, `curved_orchard_stool` leg/stretcher gaps, `greenhouse_lantern` top ring, `rounded_watering_can` handle loop, `two_wheeled_herb_cart` wheel spokes, `hand_trowel` hanging loop) are cleanly transparent while all oat-cream fills remain 100% solid opaque. |
| **No-text / no-HUD / no-watermark audit** | PASS | Zero legible text, letters, numbers, faux-writing scribbles (replaced with crisp botanical leaf/dot icons on `seed_drawer_cabinet`), HUD overlays, or watermarks across all assets. |
| **Game sprite sync & test suite** | PASS | Active living-room sprites synced into `public/sprites/` and `src/game/sprites.json` via `npm run sprites`; `npm run typecheck`, `npm test`, and `npm run build` verified passing. |

---

## 2. Per-Sprite QA Summary (27 Sprites)

| Sprite ID | Category | Dimensions / Mode | Transparent % | Padding (px) | Production Pipeline | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| `arched_window_seat` | `home` | 512×512 RGBA | 49.7% | T:32 R:85 B:32 L:85 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `seed_drawer_cabinet` | `home` | 512×512 RGBA | 41.5% | T:32 R:39 B:32 L:39 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `small_reading_lamp` | `home` | 512×512 RGBA | 66.8% | T:32 R:105 B:32 L:104 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `tea_trolley` | `home` | 512×512 RGBA | 63.9% | T:32 R:56 B:32 L:56 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `wall_clock` | `home` | 512×512 RGBA | 57.2% | T:32 R:68 B:32 L:67 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `patchwork_floor_cushion` | `home` | 512×512 RGBA | 49.7% | T:79 R:32 B:80 L:32 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `rounded_watering_can` | `garden` | 512×512 RGBA | 68.5% | T:109 R:32 B:109 L:32 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `greenhouse_lantern` | `garden` | 512×512 RGBA | 61.4% | T:32 R:101 B:32 L:100 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `two_wheeled_herb_cart` | `garden` | 512×512 RGBA | 56.7% | T:38 R:32 B:39 L:32 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `flowering_trellis` | `garden` | 512×512 RGBA | 60.7% | T:32 R:85 B:32 L:85 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `potted_calamondin_tree` | `garden` | 512×512 RGBA | 71.1% | T:32 R:108 B:32 L:108 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `curved_orchard_stool` | `garden` | 512×512 RGBA | 54.7% | T:47 R:32 B:47 L:32 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `raised_herb_bed` | `garden` | 512×512 RGBA | 58.4% | T:54 R:32 B:54 L:32 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `mossback_hedgehog` | `characters` | 512×512 RGBA | 44.7% | T:32 R:61 B:32 L:60 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `terracotta_tortoise` | `characters` | 512×512 RGBA | 60.1% | T:47 R:32 B:48 L:32 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `sunhat_garden_frog` | `characters` | 512×512 RGBA | 53.3% | T:32 R:72 B:32 L:71 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `seed_packets` | `small_props` | 512×512 RGBA | 42.4% | T:32 R:36 B:32 L:36 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `garden_gloves` | `small_props` | 512×512 RGBA | 50.7% | T:32 R:36 B:32 L:35 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `hand_trowel` | `small_props` | 512×512 RGBA | 77.0% | T:32 R:53 B:32 L:52 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `ceramic_plant_marker` | `small_props` | 512×512 RGBA | 78.1% | T:32 R:134 B:32 L:134 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `tiny_bird_bath` | `small_props` | 512×512 RGBA | 58.5% | T:32 R:57 B:32 L:57 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `cottage_lounge_sofa` | `living_room` | 512×512 RGBA | 61.7% | T:112 R:32 B:113 L:32 | Approved anchor (benchmark) | PASS |
| `low_oak_coffee_table` | `living_room` | 512×512 RGBA | 68.1% | T:84 R:32 B:85 L:32 | Approved living-room anchor | PASS |
| `braided_oval_rug` | `living_room` | 512×512 RGBA | 68.8% | T:141 R:32 B:142 L:32 | Approved living-room anchor | PASS |
| `arched_display_bookshelf` | `living_room` | 512×512 RGBA | 44.1% | T:32 R:75 B:32 L:75 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `standing_globe_floor_lamp` | `living_room` | 512×512 RGBA | 87.4% | T:32 R:124 B:32 L:123 | Hand-drawn sofa-benchmarked refinement (v6.0) | PASS |
| `wall_pinboard_trio` | `living_room` | 512×512 RGBA | 37.3% | T:39 R:32 B:40 L:32 | Retained original SVG (user preference) | PASS |

---

## 3. Rights & Provenance Disclosure

- **Unified AI-Assisted Provenance (v6.0):**
  - **3 approved living-room design anchors + 1 backdrop** (`cottage_lounge_sofa` benchmark, `low_oak_coffee_table`, `braided_oval_rug`, `living_room_backdrop`) from the user-refined ChatGPT anchor pass.
  - **1 retained original SVG sprite** (`wall_pinboard_trio` + `source_svg/wall_pinboard_trio.svg`) kept untouched at the user's explicit request.
  - **23 newly refined hand-drawn sprites** generated with Antigravity's `image-generator` referencing both `cottage_lounge_sofa.png` (style benchmark) and each original sprite (design reference), then alpha-extracted, edge-decontaminated, and centered to `512×512` transparent RGBA PNG in Python.
- **Authorship & Licensing (`unverified`):** All assets are AI-generated / AI-assisted. Human authorship, copyright ownership, and exclusive rights are **not** claimed; review applicable AI platform terms before distribution.
