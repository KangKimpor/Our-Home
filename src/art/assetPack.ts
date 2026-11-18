/**
 * Strongly-typed registry of the Cozy Home & Garden 2D Game Asset Pack v1.1.
 * Integration rules:
 *  - Only entries with transparent_background === true may be used as freestanding PNG sprites.
 *  - Opaque crops (reference_fragment) are never returned by getPackSpriteUrl or ITEM_SPRITE_MAP.
 *  - Tiles/tiles_extra are reference samples only, not seamless repeating tiles.
 */

export const ASSET_PACK_BASE = '/asset-pack-v1.1';

export interface AssetPackEntry {
  name: string;
  category: string;
  file: string;
  width_px: number;
  height_px: number;
  transparent_background: boolean;
  quality: string;
  extraction: string;
  notes: string;
  source_scene: string;
}

export interface ItemSpriteMapping {
  assetName: string;
  url: string;
  w: number;
  h: number;
}

export const ASSET_PACK_ENTRIES: Record<string, AssetPackEntry> = {
  "rocking_horse": {"name":"rocking_horse","category":"outdoor","file":"assets/outdoor/rocking_horse.png","width_px":326,"height_px":242,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"The rocking horse is isolated from the lawn; small interior gaps remain transparent.","source_scene":"garden"},
  "swing_set_with_cat": {"name":"swing_set_with_cat","category":"outdoor","file":"assets/outdoor/swing_set_with_cat.png","width_px":311,"height_px":398,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Swing structure and the small cat are kept as one composite because they overlap.","source_scene":"garden"},
  "deck_chair_with_white_cat": {"name":"deck_chair_with_white_cat","category":"outdoor","file":"assets/outdoor/deck_chair_with_white_cat.png","width_px":285,"height_px":333,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Chair and seated cat are kept together as shown.","source_scene":"garden"},
  "side_table_with_vase": {"name":"side_table_with_vase","category":"outdoor","file":"assets/outdoor/side_table_with_vase.png","width_px":168,"height_px":210,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Table and vase composite.","source_scene":"garden"},
  "garden_lamp_post": {"name":"garden_lamp_post","category":"outdoor","file":"assets/outdoor/garden_lamp_post.png","width_px":124,"height_px":388,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Lamp post; background fence fragments may remain where they touch the lamp.","source_scene":"garden"},
  "potted_tropical_plants": {"name":"potted_tropical_plants","category":"outdoor","file":"assets/outdoor/potted_tropical_plants.png","width_px":272,"height_px":371,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Two potted plants; some fence overlap is present in the source illustration.","source_scene":"garden"},
  "tree_stumps": {"name":"tree_stumps","category":"outdoor","file":"assets/outdoor/tree_stumps.png","width_px":216,"height_px":130,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Pair of tree stumps.","source_scene":"garden"},
  "pool_scene_with_swimming_pets": {"name":"pool_scene_with_swimming_pets","category":"outdoor","file":"assets/outdoor/pool_scene_with_swimming_pets.png","width_px":708,"height_px":477,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Pool, coping, ladder, duck and dog are kept together as a full scene composite.","source_scene":"garden"},
  "flower_planter_sack": {"name":"flower_planter_sack","category":"outdoor","file":"assets/outdoor/flower_planter_sack.png","width_px":172,"height_px":239,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Flower planter and sack.","source_scene":"garden"},
  "rock_cluster": {"name":"rock_cluster","category":"outdoor","file":"assets/outdoor/rock_cluster.png","width_px":248,"height_px":145,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Large rock and nearby small stones.","source_scene":"garden"},
  "shrub_cluster": {"name":"shrub_cluster","category":"outdoor","file":"assets/outdoor/shrub_cluster.png","width_px":339,"height_px":206,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Cluster of shrubs; some ground details may remain.","source_scene":"garden"},
  "garden_fence_backdrop_strip": {"name":"garden_fence_backdrop_strip","category":"outdoor","file":"assets/outdoor/garden_fence_backdrop_strip.png","width_px":1445,"height_px":273,"transparent_background":false,"quality":"reference_fragment","extraction":"legacy_opaque_crop","notes":"Left and center fence/hedge backdrop strip, cropped before the HUD counter.","source_scene":"garden"},
  "grass_ground_patch": {"name":"grass_ground_patch","category":"tiles","file":"assets/tiles/grass_ground_patch.png","width_px":260,"height_px":163,"transparent_background":false,"quality":"reference_fragment","extraction":"legacy_opaque_crop","notes":"Grass texture patch from an uncluttered lawn area; use as visual reference, not guaranteed seamless.","source_scene":"garden"},
  "pool_water_grid_tile": {"name":"pool_water_grid_tile","category":"tiles","file":"assets/tiles/pool_water_grid_tile.png","width_px":145,"height_px":89,"transparent_background":false,"quality":"reference_fragment","extraction":"legacy_opaque_crop","notes":"Clear pool water and tile-grid sample without the swimming pets.","source_scene":"garden"},
  "red_panda_sitting": {"name":"red_panda_sitting","category":"animals","file":"assets/animals/red_panda_sitting.png","width_px":121,"height_px":146,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Red panda character, static pose.","source_scene":"garden"},
  "yellow_bird": {"name":"yellow_bird","category":"animals","file":"assets/animals/yellow_bird.png","width_px":93,"height_px":75,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Small yellow bird, static pose.","source_scene":"garden"},
  "white_cat_lounging": {"name":"white_cat_lounging","category":"animals","file":"assets/animals/white_cat_lounging.png","width_px":128,"height_px":102,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"White cat, static pose.","source_scene":"garden"},
  "ginger_cat_lounging": {"name":"ginger_cat_lounging","category":"animals","file":"assets/animals/ginger_cat_lounging.png","width_px":144,"height_px":97,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Ginger cat, static pose.","source_scene":"garden"},
  "yellow_duck_swimming": {"name":"yellow_duck_swimming","category":"animals","file":"assets/animals/yellow_duck_swimming.png","width_px":97,"height_px":117,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Duck in water; ripples may be retained as part of the sprite.","source_scene":"garden"},
  "dog_swimming": {"name":"dog_swimming","category":"animals","file":"assets/animals/dog_swimming.png","width_px":200,"height_px":198,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Swimming dog; ripples and a little water edge may be retained.","source_scene":"garden"},
  "cat_on_swing": {"name":"cat_on_swing","category":"animals","file":"assets/animals/cat_on_swing.png","width_px":134,"height_px":82,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Cat seated on the swing platform; slight swing overlap possible.","source_scene":"garden"},
  "hud_heart_counter": {"name":"hud_heart_counter","category":"ui","file":"assets/ui/hud_heart_counter.png","width_px":245,"height_px":107,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Heart and plus counter panel with value 360 from the source image.","source_scene":"garden"},
  "ui_cat_food_button": {"name":"ui_cat_food_button","category":"ui","file":"assets/ui/ui_cat_food_button.png","width_px":132,"height_px":125,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Cat food button.","source_scene":"garden"},
  "ui_item_button": {"name":"ui_item_button","category":"ui","file":"assets/ui/ui_item_button.png","width_px":134,"height_px":134,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Blank item slot button.","source_scene":"garden"},
  "ui_home_button": {"name":"ui_home_button","category":"ui","file":"assets/ui/ui_home_button.png","width_px":133,"height_px":134,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Home button.","source_scene":"garden"},
  "wall_notice_board": {"name":"wall_notice_board","category":"indoor","file":"assets/indoor/wall_notice_board.png","width_px":196,"height_px":149,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Noticeboard with pinned notes.","source_scene":"indoor"},
  "wall_cabinet": {"name":"wall_cabinet","category":"indoor","file":"assets/indoor/wall_cabinet.png","width_px":456,"height_px":180,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Wall-mounted cabinet.","source_scene":"indoor"},
  "framed_photo": {"name":"framed_photo","category":"indoor","file":"assets/indoor/framed_photo.png","width_px":291,"height_px":179,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Framed photo with people depicted inside the frame.","source_scene":"indoor"},
  "potted_indoor_tree": {"name":"potted_indoor_tree","category":"indoor","file":"assets/indoor/potted_indoor_tree.png","width_px":230,"height_px":323,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Potted indoor tree.","source_scene":"indoor"},
  "umbrella_stand": {"name":"umbrella_stand","category":"indoor","file":"assets/indoor/umbrella_stand.png","width_px":117,"height_px":319,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Umbrella stand.","source_scene":"indoor"},
  "console_cabinet": {"name":"console_cabinet","category":"indoor","file":"assets/indoor/console_cabinet.png","width_px":453,"height_px":171,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Low console cabinet.","source_scene":"indoor"},
  "bookshelf_with_cat": {"name":"bookshelf_with_cat","category":"indoor","file":"assets/indoor/bookshelf_with_cat.png","width_px":416,"height_px":337,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Bookshelf, vase, carrier and cat on top kept as a composite.","source_scene":"indoor"},
  "sofa_with_people": {"name":"sofa_with_people","category":"indoor","file":"assets/indoor/sofa_with_people.png","width_px":904,"height_px":384,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Sofa with seated people; kept together as a decorative scene asset.","source_scene":"indoor"},
  "coffee_table_and_rug": {"name":"coffee_table_and_rug","category":"indoor","file":"assets/indoor/coffee_table_and_rug.png","width_px":676,"height_px":237,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Coffee table and oval rug composite.","source_scene":"indoor"},
  "floor_lamp": {"name":"floor_lamp","category":"indoor","file":"assets/indoor/floor_lamp.png","width_px":228,"height_px":463,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Standing floor lamp.","source_scene":"indoor"},
  "dining_table_and_left_chair": {"name":"dining_table_and_left_chair","category":"indoor","file":"assets/indoor/dining_table_and_left_chair.png","width_px":286,"height_px":433,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Partial dining table and left chair; cropped to avoid the UI buttons at the right edge.","source_scene":"indoor"},
  "cat_carrier": {"name":"cat_carrier","category":"indoor","file":"assets/indoor/cat_carrier.png","width_px":109,"height_px":108,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Small pet carrier in the lower bookshelf compartment.","source_scene":"indoor"},
  "vase_on_bookshelf": {"name":"vase_on_bookshelf","category":"indoor","file":"assets/indoor/vase_on_bookshelf.png","width_px":94,"height_px":106,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Decorative glass vase; a little shelf edge may remain.","source_scene":"indoor"},
  "wood_floor_texture_sample": {"name":"wood_floor_texture_sample","category":"tiles","file":"assets/tiles/wood_floor_texture_sample.png","width_px":285,"height_px":97,"transparent_background":false,"quality":"reference_fragment","extraction":"legacy_opaque_crop","notes":"Wood floor plank texture sample; source texture reference, not guaranteed seamless.","source_scene":"indoor"},
  "entry_rug": {"name":"entry_rug","category":"indoor","file":"assets/indoor/entry_rug.png","width_px":154,"height_px":182,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Small entry rug.","source_scene":"indoor"},
  "book_stack": {"name":"book_stack","category":"indoor","file":"assets/indoor/book_stack.png","width_px":109,"height_px":188,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Books and magazines stack.","source_scene":"indoor"},
  "gray_cat_sitting": {"name":"gray_cat_sitting","category":"animals","file":"assets/animals/gray_cat_sitting.png","width_px":76,"height_px":116,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Gray cat sitting on console; static pose.","source_scene":"indoor"},
  "orange_cat_on_shelf": {"name":"orange_cat_on_shelf","category":"animals","file":"assets/animals/orange_cat_on_shelf.png","width_px":115,"height_px":117,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Orange cat leaning over bookshelf.","source_scene":"indoor"},
  "calico_cat_lounging": {"name":"calico_cat_lounging","category":"animals","file":"assets/animals/calico_cat_lounging.png","width_px":145,"height_px":94,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Calico cat, static pose.","source_scene":"indoor"},
  "shiba_dog_standing": {"name":"shiba_dog_standing","category":"animals","file":"assets/animals/shiba_dog_standing.png","width_px":168,"height_px":163,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Standing Shiba-style dog.","source_scene":"indoor"},
  "black_white_cat_walking": {"name":"black_white_cat_walking","category":"animals","file":"assets/animals/black_white_cat_walking.png","width_px":181,"height_px":151,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Black and white cat walking.","source_scene":"indoor"},
  "white_cat_sitting": {"name":"white_cat_sitting","category":"animals","file":"assets/animals/white_cat_sitting.png","width_px":73,"height_px":98,"transparent_background":true,"quality":"legacy_best_effort_cutout","extraction":"legacy_cv_cutout","notes":"Small white cat.","source_scene":"indoor"},
  "nursery_rocking_chair": {"name":"nursery_rocking_chair","category":"nursery","file":"assets/nursery/nursery_rocking_chair.png","width_px":242,"height_px":301,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Chair cutout. Clean single prop from the nursery scene.","source_scene":"nursery"},
  "nursery_dollhouse_bookshelf": {"name":"nursery_dollhouse_bookshelf","category":"nursery","file":"assets/nursery/nursery_dollhouse_bookshelf.png","width_px":231,"height_px":286,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Dollhouse-shaped shelf with its small decor; one composite prop.","source_scene":"nursery"},
  "nursery_baby_walker": {"name":"nursery_baby_walker","category":"nursery","file":"assets/nursery/nursery_baby_walker.png","width_px":149,"height_px":147,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Baby and walker are intentionally one character-plus-prop composite.","source_scene":"nursery"},
  "nursery_plush_toy_basket": {"name":"nursery_plush_toy_basket","category":"nursery","file":"assets/nursery/nursery_plush_toy_basket.png","width_px":199,"height_px":179,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Basket and plush toys are kept together.","source_scene":"nursery"},
  "nursery_strawberry_rug": {"name":"nursery_strawberry_rug","category":"nursery","file":"assets/nursery/nursery_strawberry_rug.png","width_px":444,"height_px":173,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Oval strawberry-pattern rug cutout.","source_scene":"nursery"},
  "nursery_changing_dresser_pet_bed": {"name":"nursery_changing_dresser_pet_bed","category":"nursery","file":"assets/nursery/nursery_changing_dresser_pet_bed.png","width_px":235,"height_px":372,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Changing dresser with pet bed and resting pet; composite.","source_scene":"nursery"},
  "nursery_lamp_nightstand": {"name":"nursery_lamp_nightstand","category":"nursery","file":"assets/nursery/nursery_lamp_nightstand.png","width_px":130,"height_px":222,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Lamp and nightstand grouped as one prop.","source_scene":"nursery"},
  "nursery_mother_crib_scene": {"name":"nursery_mother_crib_scene","category":"nursery","file":"assets/nursery/nursery_mother_crib_scene.png","width_px":284,"height_px":393,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Adult, baby-care activity and crib overlap; opaque reference fragment for tracing, not a standalone sprite.","source_scene":"nursery"},
  "nursery_canopy_tent_scene": {"name":"nursery_canopy_tent_scene","category":"nursery","file":"assets/nursery/nursery_canopy_tent_scene.png","width_px":104,"height_px":396,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Canopy tent and pet with partial event UI overlap; opaque reference fragment.","source_scene":"nursery"},
  "bedroom_bed_sleeping_cat": {"name":"bedroom_bed_sleeping_cat","category":"bedroom","file":"assets/bedroom/bedroom_bed_sleeping_cat.png","width_px":607,"height_px":431,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Bed, bedding and sleeping cat are a deliberate composite.","source_scene":"bedroom"},
  "bedroom_clothes_rail": {"name":"bedroom_clothes_rail","category":"bedroom","file":"assets/bedroom/bedroom_clothes_rail.png","width_px":238,"height_px":252,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Clothes rail and hanging garments.","source_scene":"bedroom"},
  "bedroom_bedside_table_lamp": {"name":"bedroom_bedside_table_lamp","category":"bedroom","file":"assets/bedroom/bedroom_bedside_table_lamp.png","width_px":177,"height_px":210,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Bedside table, lamp and small books grouped.","source_scene":"bedroom"},
  "bedroom_vanity_workspace": {"name":"bedroom_vanity_workspace","category":"bedroom","file":"assets/bedroom/bedroom_vanity_workspace.png","width_px":260,"height_px":263,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Desk/vanity with desktop items; includes its own composition.","source_scene":"bedroom"},
  "bedroom_yellow_desk_chair": {"name":"bedroom_yellow_desk_chair","category":"bedroom","file":"assets/bedroom/bedroom_yellow_desk_chair.png","width_px":155,"height_px":190,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Yellow desk chair.","source_scene":"bedroom"},
  "bedroom_indoor_tree": {"name":"bedroom_indoor_tree","category":"bedroom","file":"assets/bedroom/bedroom_indoor_tree.png","width_px":219,"height_px":273,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Large potted indoor tree.","source_scene":"bedroom"},
  "bedroom_chaise_lounge": {"name":"bedroom_chaise_lounge","category":"bedroom","file":"assets/bedroom/bedroom_chaise_lounge.png","width_px":403,"height_px":135,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Chaise/bench with throw; lower edge is clipped by the screenshot.","source_scene":"bedroom"},
  "bedroom_plant_cluster": {"name":"bedroom_plant_cluster","category":"bedroom","file":"assets/bedroom/bedroom_plant_cluster.png","width_px":330,"height_px":270,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Large cluster of indoor plants; source fragment includes floor and rug edge.","source_scene":"bedroom"},
  "bedroom_window_cat_scene": {"name":"bedroom_window_cat_scene","category":"bedroom","file":"assets/bedroom/bedroom_window_cat_scene.png","width_px":298,"height_px":369,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Window, pet and heart bubble overlap; reference composite.","source_scene":"bedroom"},
  "bathroom_shower_unit": {"name":"bathroom_shower_unit","category":"bathroom","file":"assets/bathroom/bathroom_shower_unit.png","width_px":253,"height_px":387,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Shower enclosure and fittings.","source_scene":"bathroom"},
  "bathroom_toilet": {"name":"bathroom_toilet","category":"bathroom","file":"assets/bathroom/bathroom_toilet.png","width_px":180,"height_px":240,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Toilet with small nearby bathroom details.","source_scene":"bathroom"},
  "bathroom_storage_shelf": {"name":"bathroom_storage_shelf","category":"bathroom","file":"assets/bathroom/bathroom_storage_shelf.png","width_px":105,"height_px":290,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Narrow vertical bathroom storage rack.","source_scene":"bathroom"},
  "bathroom_vanity_sink": {"name":"bathroom_vanity_sink","category":"bathroom","file":"assets/bathroom/bathroom_vanity_sink.png","width_px":396,"height_px":453,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Vanity and basin are clipped by the left screenshot edge; retained as reference crop.","source_scene":"bathroom"},
  "bathroom_bathtub_and_plant": {"name":"bathroom_bathtub_and_plant","category":"bathroom","file":"assets/bathroom/bathroom_bathtub_and_plant.png","width_px":456,"height_px":273,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Bathtub and plant are partially overlapped by event HUD; opaque source fragment only.","source_scene":"bathroom"},
  "bathroom_large_bath_mat": {"name":"bathroom_large_bath_mat","category":"bathroom","file":"assets/bathroom/bathroom_large_bath_mat.png","width_px":552,"height_px":226,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Mat overlaps with a heart notification; opaque crop for redraw/layout reference.","source_scene":"bathroom"},
  "bathroom_laundry_basket": {"name":"bathroom_laundry_basket","category":"bathroom","file":"assets/bathroom/bathroom_laundry_basket.png","width_px":180,"height_px":174,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Basket is near the shopping-cart HUD button and clipped at the screenshot bottom; opaque reference only.","source_scene":"bathroom"},
  "bathroom_sleeping_cat": {"name":"bathroom_sleeping_cat","category":"bathroom","file":"assets/bathroom/bathroom_sleeping_cat.png","width_px":107,"height_px":107,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Small curled cat; separate from the larger fixtures.","source_scene":"bathroom"},
  "bathroom_wall_mirror": {"name":"bathroom_wall_mirror","category":"bathroom","file":"assets/bathroom/bathroom_wall_mirror.png","width_px":75,"height_px":343,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Tall wall mirror.","source_scene":"bathroom"},
  "studio_drawing_desk": {"name":"studio_drawing_desk","category":"studio","file":"assets/studio/studio_drawing_desk.png","width_px":405,"height_px":321,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Artist desk and chair grouped as a workstation.","source_scene":"art_studio"},
  "studio_worktable_paint_supplies": {"name":"studio_worktable_paint_supplies","category":"studio","file":"assets/studio/studio_worktable_paint_supplies.png","width_px":557,"height_px":313,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Large worktable with painting supplies; complete composite.","source_scene":"art_studio"},
  "studio_chaise_lounge": {"name":"studio_chaise_lounge","category":"studio","file":"assets/studio/studio_chaise_lounge.png","width_px":319,"height_px":200,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Lounge chair.","source_scene":"art_studio"},
  "studio_bookshelf": {"name":"studio_bookshelf","category":"studio","file":"assets/studio/studio_bookshelf.png","width_px":264,"height_px":348,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Bookcase is partly obscured by the screenshot HUD; keep as an opaque reference crop.","source_scene":"art_studio"},
  "studio_tall_potted_plant": {"name":"studio_tall_potted_plant","category":"studio","file":"assets/studio/studio_tall_potted_plant.png","width_px":214,"height_px":254,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Tall floor plant with pot.","source_scene":"art_studio"},
  "studio_wall_art_collection": {"name":"studio_wall_art_collection","category":"studio","file":"assets/studio/studio_wall_art_collection.png","width_px":311,"height_px":194,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Wall pictures and clock grouped as a decor collection.","source_scene":"art_studio"},
  "studio_floor_lamp": {"name":"studio_floor_lamp","category":"studio","file":"assets/studio/studio_floor_lamp.png","width_px":150,"height_px":289,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Floor lamp, partly overlapped by plant branches; composite.","source_scene":"art_studio"},
  "kitchen_sink_counter": {"name":"kitchen_sink_counter","category":"kitchen","file":"assets/kitchen/kitchen_sink_counter.png","width_px":509,"height_px":199,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Sink and counter section; left side is clipped by screenshot boundary.","source_scene":"kitchen"},
  "kitchen_range_hood": {"name":"kitchen_range_hood","category":"kitchen","file":"assets/kitchen/kitchen_range_hood.png","width_px":536,"height_px":168,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Extractor hood.","source_scene":"kitchen"},
  "kitchen_stove_with_pots": {"name":"kitchen_stove_with_pots","category":"kitchen","file":"assets/kitchen/kitchen_stove_with_pots.png","width_px":635,"height_px":246,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Cooktop, oven edge and cookware kept together.","source_scene":"kitchen"},
  "kitchen_hanging_utensils_and_pans": {"name":"kitchen_hanging_utensils_and_pans","category":"kitchen","file":"assets/kitchen/kitchen_hanging_utensils_and_pans.png","width_px":442,"height_px":333,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Kitchen hanging rack and cookware crop includes the heart counter at the upper-right; opaque reference only.","source_scene":"kitchen"},
  "kitchen_lower_cabinets": {"name":"kitchen_lower_cabinets","category":"kitchen","file":"assets/kitchen/kitchen_lower_cabinets.png","width_px":1536,"height_px":279,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Long lower cabinet and oven run; source fragment.","source_scene":"kitchen"},
  "kitchen_spice_jars": {"name":"kitchen_spice_jars","category":"kitchen","file":"assets/kitchen/kitchen_spice_jars.png","width_px":308,"height_px":185,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Cluster of jars and small counter objects.","source_scene":"kitchen"},
  "farm_chicken_coop": {"name":"farm_chicken_coop","category":"farm","file":"assets/farm/farm_chicken_coop.png","width_px":334,"height_px":289,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Chicken coop with clock and hay.","source_scene":"farm_river"},
  "farm_cow": {"name":"farm_cow","category":"farm","file":"assets/farm/farm_cow.png","width_px":174,"height_px":192,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Standing cow.","source_scene":"farm_river"},
  "farm_chicken": {"name":"farm_chicken","category":"farm","file":"assets/farm/farm_chicken.png","width_px":85,"height_px":121,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Tighter crop around the chicken to reduce overlap with the nearby nest; inspect edge pixels before final production.","source_scene":"farm_river"},
  "farm_raised_vegetable_beds": {"name":"farm_raised_vegetable_beds","category":"farm","file":"assets/farm/farm_raised_vegetable_beds.png","width_px":395,"height_px":230,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Two raised growing beds shown together.","source_scene":"farm_river"},
  "farm_crop_plot_grid": {"name":"farm_crop_plot_grid","category":"farm","file":"assets/farm/farm_crop_plot_grid.png","width_px":588,"height_px":386,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Several planting plots and soil rows; environmental reference panel.","source_scene":"farm_river"},
  "farm_diagonal_picket_fence": {"name":"farm_diagonal_picket_fence","category":"farm","file":"assets/farm/farm_diagonal_picket_fence.png","width_px":367,"height_px":548,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Long diagonal fence section; background and grass remain.","source_scene":"farm_river"},
  "farm_riverbank_and_water": {"name":"farm_riverbank_and_water","category":"farm","file":"assets/farm/farm_riverbank_and_water.png","width_px":1536,"height_px":183,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Wide riverbank strip with water, rocks and lily pads; intended as a background segment.","source_scene":"farm_river"},
  "farm_stone_river_crossing": {"name":"farm_stone_river_crossing","category":"farm","file":"assets/farm/farm_stone_river_crossing.png","width_px":1043,"height_px":174,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Water, stepping stones and bank as a scene tile strip.","source_scene":"farm_river"},
  "garden_raised_flower_beds": {"name":"garden_raised_flower_beds","category":"garden","file":"assets/garden/garden_raised_flower_beds.png","width_px":683,"height_px":228,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Two wooden raised flower beds with dense flower planting.","source_scene":"flower_garden"},
  "garden_lantern_pedestal": {"name":"garden_lantern_pedestal","category":"garden","file":"assets/garden/garden_lantern_pedestal.png","width_px":145,"height_px":213,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Decorative garden lantern/fountain-like pedestal.","source_scene":"flower_garden"},
  "garden_picnic_blanket_setup": {"name":"garden_picnic_blanket_setup","category":"garden","file":"assets/garden/garden_picnic_blanket_setup.png","width_px":524,"height_px":287,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Picnic blanket, food basket and nearby tree branch; reference composite.","source_scene":"flower_garden"},
  "garden_mushroom_cluster": {"name":"garden_mushroom_cluster","category":"garden","file":"assets/garden/garden_mushroom_cluster.png","width_px":254,"height_px":192,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Mushrooms, small cat and nearby grass, kept together.","source_scene":"flower_garden"},
  "garden_pool_scene_expanded": {"name":"garden_pool_scene_expanded","category":"garden","file":"assets/garden/garden_pool_scene_expanded.png","width_px":673,"height_px":374,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Pool, ladder and garden edge as a complete scene composite.","source_scene":"flower_garden"},
  "pet_deck_food_and_water_bowls": {"name":"pet_deck_food_and_water_bowls","category":"pet_care","file":"assets/pet_care/pet_deck_food_and_water_bowls.png","width_px":241,"height_px":184,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Two pet bowls and small deck items.","source_scene":"deck_pet_area"},
  "pet_stone_platform": {"name":"pet_stone_platform","category":"pet_care","file":"assets/pet_care/pet_stone_platform.png","width_px":925,"height_px":248,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Long low stone platform; broad prop with some natural ground edge.","source_scene":"deck_pet_area"},
  "pet_ball": {"name":"pet_ball","category":"pet_care","file":"assets/pet_care/pet_ball.png","width_px":169,"height_px":128,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Soccer ball on the grass.","source_scene":"deck_pet_area"},
  "pet_bowls_and_mat_set": {"name":"pet_bowls_and_mat_set","category":"pet_care","file":"assets/pet_care/pet_bowls_and_mat_set.png","width_px":1030,"height_px":195,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Outdoor feeding mats and bowls; lower-edge composite reference.","source_scene":"deck_pet_area"},
  "music_upright_piano": {"name":"music_upright_piano","category":"music_living","file":"assets/music_living/music_upright_piano.png","width_px":295,"height_px":273,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Upright piano and bench area; composite crop.","source_scene":"living_original"},
  "living_green_sofa": {"name":"living_green_sofa","category":"music_living","file":"assets/music_living/living_green_sofa.png","width_px":584,"height_px":174,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Green sofa, lower edge clipped by screenshot boundary.","source_scene":"living_original"},
  "living_coffee_table_green_rug": {"name":"living_coffee_table_green_rug","category":"music_living","file":"assets/music_living/living_coffee_table_green_rug.png","width_px":441,"height_px":175,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Coffee table and oval rug grouped.","source_scene":"living_original"},
  "living_entry_bookcase": {"name":"living_entry_bookcase","category":"music_living","file":"assets/music_living/living_entry_bookcase.png","width_px":109,"height_px":338,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Tall open bookcase, partly clipped at lower edge.","source_scene":"living_original"},
  "living_blue_decorative_vase": {"name":"living_blue_decorative_vase","category":"music_living","file":"assets/music_living/living_blue_decorative_vase.png","width_px":98,"height_px":225,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Tall blue-and-white decorative vase.","source_scene":"living_original"},
  "living_wall_love_frame": {"name":"living_wall_love_frame","category":"music_living","file":"assets/music_living/living_wall_love_frame.png","width_px":226,"height_px":155,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Wall frame and heart decoration.","source_scene":"living_original"},
  "living_floor_lamp_and_stand": {"name":"living_floor_lamp_and_stand","category":"music_living","file":"assets/music_living/living_floor_lamp_and_stand.png","width_px":236,"height_px":286,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Standing floor lamp and nearby object; grouped composite.","source_scene":"living_original"},
  "living_spiral_staircase_scene": {"name":"living_spiral_staircase_scene","category":"music_living","file":"assets/music_living/living_spiral_staircase_scene.png","width_px":333,"height_px":444,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Spiral staircase with overlapping event HUD; reference crop, not isolated.","source_scene":"living_original"},
  "ui_heart_counter_368": {"name":"ui_heart_counter_368","category":"ui_gallery","file":"assets/ui_gallery/ui_heart_counter_368.png","width_px":168,"height_px":84,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"New heart/currency counter showing 368; UI style reference.","source_scene":"nursery"},
  "ui_timer_event_stack": {"name":"ui_timer_event_stack","category":"ui_gallery","file":"assets/ui_gallery/ui_timer_event_stack.png","width_px":146,"height_px":212,"transparent_background":true,"quality":"composite_cutout","extraction":"grabcut","notes":"Three event timer tags grouped together.","source_scene":"nursery"},
  "ui_storage_chest_button": {"name":"ui_storage_chest_button","category":"ui_gallery","file":"assets/ui_gallery/ui_storage_chest_button.png","width_px":88,"height_px":92,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Storage/chest button.","source_scene":"nursery"},
  "ui_shopping_cart_button": {"name":"ui_shopping_cart_button","category":"ui_gallery","file":"assets/ui_gallery/ui_shopping_cart_button.png","width_px":88,"height_px":88,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Shopping cart button.","source_scene":"nursery"},
  "ui_home_button_368": {"name":"ui_home_button_368","category":"ui_gallery","file":"assets/ui_gallery/ui_home_button_368.png","width_px":90,"height_px":92,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Home button from the updated interface.","source_scene":"nursery"},
  "ui_cat_food_button_368": {"name":"ui_cat_food_button_368","category":"ui_gallery","file":"assets/ui_gallery/ui_cat_food_button_368.png","width_px":87,"height_px":87,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Cat food button from the updated interface.","source_scene":"nursery"},
  "ui_top_left_status_button": {"name":"ui_top_left_status_button","category":"ui_gallery","file":"assets/ui_gallery/ui_top_left_status_button.png","width_px":87,"height_px":95,"transparent_background":true,"quality":"best_effort_cutout","extraction":"grabcut","notes":"Top-left status/control button.","source_scene":"nursery"},
  "moments_gallery_header": {"name":"moments_gallery_header","category":"ui_gallery","file":"assets/ui_gallery/moments_gallery_header.png","width_px":1536,"height_px":115,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Gallery header strip with title and back button; source UI fragment.","source_scene":"moments_gallery"},
  "moments_photo_card_01": {"name":"moments_photo_card_01","category":"ui_gallery","file":"assets/ui_gallery/moments_photo_card_01.png","width_px":362,"height_px":261,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Gallery thumbnail card including its timestamp.","source_scene":"moments_gallery"},
  "moments_photo_card_02": {"name":"moments_photo_card_02","category":"ui_gallery","file":"assets/ui_gallery/moments_photo_card_02.png","width_px":366,"height_px":261,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Gallery thumbnail card including its timestamp.","source_scene":"moments_gallery"},
  "moments_photo_card_03": {"name":"moments_photo_card_03","category":"ui_gallery","file":"assets/ui_gallery/moments_photo_card_03.png","width_px":366,"height_px":261,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Gallery thumbnail card including its timestamp.","source_scene":"moments_gallery"},
  "moments_photo_card_04": {"name":"moments_photo_card_04","category":"ui_gallery","file":"assets/ui_gallery/moments_photo_card_04.png","width_px":363,"height_px":256,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Gallery thumbnail card including its timestamp; bottom edge slightly clipped.","source_scene":"moments_gallery"},
  "moments_photo_card_05": {"name":"moments_photo_card_05","category":"ui_gallery","file":"assets/ui_gallery/moments_photo_card_05.png","width_px":367,"height_px":256,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Gallery thumbnail card including its timestamp; bottom edge slightly clipped.","source_scene":"moments_gallery"},
  "moments_photo_card_06": {"name":"moments_photo_card_06","category":"ui_gallery","file":"assets/ui_gallery/moments_photo_card_06.png","width_px":367,"height_px":256,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Gallery thumbnail card including its timestamp; bottom edge slightly clipped.","source_scene":"moments_gallery"},
  "tile_bathroom_blue_floor_sample": {"name":"tile_bathroom_blue_floor_sample","category":"tiles_extra","file":"assets/tiles_extra/tile_bathroom_blue_floor_sample.png","width_px":79,"height_px":106,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Blue square bathroom floor tile sample; not verified seamless.","source_scene":"bathroom"},
  "tile_bedroom_wood_floor_sample": {"name":"tile_bedroom_wood_floor_sample","category":"tiles_extra","file":"assets/tiles_extra/tile_bedroom_wood_floor_sample.png","width_px":87,"height_px":113,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Wood flooring reference sample; diagonal plank pattern, not guaranteed seamless.","source_scene":"bedroom"},
  "tile_farm_soil_plot_sample": {"name":"tile_farm_soil_plot_sample","category":"tiles_extra","file":"assets/tiles_extra/tile_farm_soil_plot_sample.png","width_px":126,"height_px":108,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"Farm soil patch reference; not guaranteed seamless.","source_scene":"farm_river"},
  "tile_river_water_sample": {"name":"tile_river_water_sample","category":"tiles_extra","file":"assets/tiles_extra/tile_river_water_sample.png","width_px":196,"height_px":80,"transparent_background":false,"quality":"reference_fragment","extraction":"opaque_crop","notes":"River water and stones reference; not guaranteed seamless.","source_scene":"farm_river"},
};

export const ASSET_PACK_MANIFEST = {
  pack_name: 'Cozy Home & Garden 2D Game Asset Pack',
  version: '1.1',
  asset_count: 130,
  entries: ASSET_PACK_ENTRIES,
} as const;

/**
 * Returns `/asset-pack-v1.1/${entry.file}` ONLY IF `entry.transparent_background === true`.
 * Returns `null` for missing entries or opaque reference crops.
 */
export function getPackSpriteUrl(name: string): string | null {
  const entry = ASSET_PACK_ENTRIES[name];
  if (!entry || entry.transparent_background !== true) return null;
  return `${ASSET_PACK_BASE}/${entry.file}`;
}

const MOMENT_CARD_FILES: Record<string, string> = {
  moments_photo_card_01: 'assets/ui_gallery/moments_photo_card_01.png',
  moments_photo_card_02: 'assets/ui_gallery/moments_photo_card_02.png',
  moments_photo_card_03: 'assets/ui_gallery/moments_photo_card_03.png',
  moments_photo_card_04: 'assets/ui_gallery/moments_photo_card_04.png',
  moments_photo_card_05: 'assets/ui_gallery/moments_photo_card_05.png',
  moments_photo_card_06: 'assets/ui_gallery/moments_photo_card_06.png',
};

const MOMENT_TO_CARD_KEY: Record<string, string> = {
  moveIn: 'moments_photo_card_01',
  tenItems: 'moments_photo_card_02',
  sofaNap: 'moments_photo_card_03',
  sinkCat: 'moments_photo_card_04',
  drawerCat: 'moments_photo_card_05',
  snackBag: 'moments_photo_card_06',
  '1': 'moments_photo_card_01',
  '01': 'moments_photo_card_01',
  '2': 'moments_photo_card_02',
  '02': 'moments_photo_card_02',
  '3': 'moments_photo_card_03',
  '03': 'moments_photo_card_03',
  '4': 'moments_photo_card_04',
  '04': 'moments_photo_card_04',
  '5': 'moments_photo_card_05',
  '05': 'moments_photo_card_05',
  '6': 'moments_photo_card_06',
  '06': 'moments_photo_card_06',
  moments_photo_card_01: 'moments_photo_card_01',
  moments_photo_card_02: 'moments_photo_card_02',
  moments_photo_card_03: 'moments_photo_card_03',
  moments_photo_card_04: 'moments_photo_card_04',
  moments_photo_card_05: 'moments_photo_card_05',
  moments_photo_card_06: 'moments_photo_card_06',
};

/**
 * Returns the URL for one of the 6 Moments album photo cards (`moments_photo_card_01..06`).
 * Note: These 6 rectangular cards are specifically meant for Moments album cards.
 */
export function getMomentPhotoCardUrl(momentIdOrIndex: string | number): string | null {
  const key = typeof momentIdOrIndex === 'number' ? String(momentIdOrIndex) : momentIdOrIndex;
  const cardKey = MOMENT_TO_CARD_KEY[key];
  if (!cardKey) return null;
  const rel = MOMENT_CARD_FILES[cardKey];
  return rel ? `${ASSET_PACK_BASE}/${rel}` : null;
}

function spriteRef(assetName: string): ItemSpriteMapping {
  const entry = ASSET_PACK_ENTRIES[assetName];
  if (!entry || entry.transparent_background !== true) {
    throw new Error(`Asset "${assetName}" is missing or does not have transparent_background: true`);
  }
  return {
    assetName,
    url: `${ASSET_PACK_BASE}/${entry.file}`,
    w: entry.width_px,
    h: entry.height_px,
  };
}

/**
 * Maps item IDs to visually verified, artifact-free `transparent_background: true` PNG sprites.
 * Items whose CV cutouts had grabcut holes, baked-in speech bubbles, HUD overlays, or clipped
 * backgrounds intentionally fall back to crisp palette-matched SVG artwork in `src/art/shapes.ts`.
 */
export const ITEM_SPRITE_MAP: Record<string, ItemSpriteMapping> = {
  // Living room
  'living.tvCabinet': spriteRef('console_cabinet'),
  'living.catBookshelf': spriteRef('bookshelf_with_cat'),
  'living.vase': spriteRef('vase_on_bookshelf'),
  'living.shelf': spriteRef('wall_cabinet'),
  'living.umbrellaStand': spriteRef('umbrella_stand'),
  'living.catCarrier': spriteRef('cat_carrier'),

  // Bathroom
  'bathroom.storageShelf': spriteRef('bathroom_storage_shelf'),

  // Nursery
  'nursery.rockingChair': spriteRef('nursery_rocking_chair'),
  'nursery.walker': spriteRef('nursery_baby_walker'),
  'nursery.toyBasket': spriteRef('nursery_plush_toy_basket'),
  'nursery.rug': spriteRef('nursery_strawberry_rug'),

  // Garden
  'garden.flowerRed': spriteRef('garden_raised_flower_beds'),

  // Farm
  'farm.raisedBeds': spriteRef('farm_raised_vegetable_beds'),
};

export function getItemSprite(itemId: string): ItemSpriteMapping | null {
  return ITEM_SPRITE_MAP[itemId] ?? null;
}