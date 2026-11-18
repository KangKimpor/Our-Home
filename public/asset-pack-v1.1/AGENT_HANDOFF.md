# Agent Handoff — Cozy Home & Garden 2D Game Asset Pack v1.1

## What is included
- 130 catalogued PNG assets total (130 original assets plus 83 additions).
- 12 source screenshots in `reference/source_scenes/`, preserved as supplied.
- Expanded room/environment groups: nursery, bedroom, bathroom, art studio, kitchen, farm/river, garden, pet care, music/living room, UI/gallery, and tile samples.
- Machine-readable `manifest.json` with file paths, source screenshots, source crop coordinates, dimensions, extraction type, quality label, transparency flag, and notes.
- Per-category atlases and a full expansion preview under `catalog/expanded/`.

## Added assets by category
- `bathroom`: 9
- `bedroom`: 9
- `farm`: 8
- `garden`: 5
- `kitchen`: 6
- `music_living`: 8
- `nursery`: 9
- `pet_care`: 4
- `studio`: 7
- `tiles_extra`: 4
- `ui_gallery`: 14

## Integration rules
1. Read `manifest.json`; treat `file` as a path relative to the pack root.
2. Only use assets with `transparent_background: true` as transparent PNG sprites.
3. `quality: best_effort_cutout` means the object was segmented from a flattened screenshot with computer-vision masking. Inspect edges before shipping; some fine linework or antialiasing can be imperfect.
4. `quality: composite_cutout` means multiple touching objects intentionally remain combined, such as a cat on furniture or furniture with a lamp.
5. `quality: reference_fragment` / `extraction: opaque_crop` means the original screenshot background is retained. Use it as a layout/reference crop or redraw guide, not as a freestanding sprite.
6. Do not treat `tiles` or `tiles_extra` samples as seamless/repeating tiles. They are texture references only unless verified and repaired by the game-art pipeline.
7. Source screenshots include game HUD overlays. Some crops intentionally preserve these overlays and are documented in `notes`.
8. No animation sheet is claimed to be production-ready. The references show static poses and scene screenshots; the receiving agent should create consistent frame sequences or request/re-draw source layers.

## Recommended next production pass
- Redraw/clean the cutouts that will be used repeatedly at high scale.
- Split composite props where separate interaction or depth sorting is needed.
- Create true 16x16 / 32x32 / 64x64 tile sets and verify seamless edges.
- Build proper animation sheets for cats, dogs, birds, cow, chicken, baby/player, and interactive props.
- Rebuild the HUD as editable vector/UI components rather than using the screenshot crops.

## Important limitation
These are faithful source-derived extracts and reference crops, not original layered project files. Some screenshots have overlaps, UI badges, object occlusion, and crop-edge clipping. The asset pack documents those limitations rather than silently presenting every crop as a clean production sprite.
