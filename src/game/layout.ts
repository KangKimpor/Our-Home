import {
  defaultSlotPlacements,
  defaultSlotSelections,
  isMovableSlotId,
  SLOT_CHOICES,
  SLOT_PLACEMENTS,
  type MovableSlotId,
  type PlacementMap,
  type SlotId,
  type SlotSelectionMap,
} from './sharedHomeCore';
import sprites from './sprites.json';

/** Logical room size (19.5:9 mobile-fit landscape). The stage scales uniformly to fit the viewport. */
export const ROOM = {
  w: 1950,
  h: 900,
  /** Where the back wall meets the floor in the backdrop. */
  wallBottom: 540,
  /** Just below the ceiling beam. */
  wallTop: 45,
  /** Range for the base (bottom edge) of floor-standing items. */
  floorMinY: 565,
  floorMaxY: 885,
  background: '/backgrounds/living_room_backdrop.webp',
} as const;

export type SpriteId = keyof typeof sprites;
/** `rug` items lie flat on the floor and always draw beneath everything else. */
export type Mount = 'floor' | 'wall' | 'rug';
export type TapAction = 'bounce' | 'lamp' | 'swing' | 'tv';

export interface Pos {
  /** Horizontal centre. */
  x: number;
  /** Bottom edge (the item's base). */
  y: number;
}

export interface SpotDef {
  id: string;
  label: string;
  pos: Pos;
}

/** One swappable art choice for a furniture or backdrop decor slot. */
export interface SlotOption {
  id: string;
  label: string;
  sprite: SpriteId;
  /** Display height in room pixels; width follows the sprite's aspect ratio. */
  height: number;
  /** Lamps only: where the light sits, as % of the sprite's width and height. */
  glow?: { x: number; y: number };
  /** TVs only: screen rectangle as % of sprite width and height (top-left x/y + w/h). */
  screenGlow?: { x: number; y: number; w: number; h: number };
}

/** A furniture or backdrop decor slot in the living room (fixed or multi-spot movable). */
export interface SlotDef {
  id: SlotId;
  label: string;
  /** Default anchor: horizontal centre and base (bottom edge). */
  pos: Pos;
  mount: Mount;
  tap: TapAction;
  defaultOptionId: string;
  options: readonly SlotOption[];
  /** Present on movable slots that offer multiple curated placement spots. */
  defaultSpotId?: string;
  spots?: readonly SpotDef[];
}

export type SlotSelections = SlotSelectionMap;

/** Shared placement spots for tall back-wall pieces (TV, bookshelf, cabinet). */
const BACK_WALL_SPOTS: readonly SpotDef[] = [
  { id: 'left-wall', label: 'Left wall', pos: { x: 365, y: 582 } },
  { id: 'mid-left', label: 'Mid wall', pos: { x: 615, y: 582 } },
  { id: 'right-alcove', label: 'Right alcove', pos: { x: 1125, y: 578 } },
];

/** Shared placement spots flanking the sofa and reading nook. */
const SIDE_ACCENT_SPOTS: readonly SpotDef[] = [
  { id: 'sofa-left', label: 'Left of sofa', pos: { x: 650, y: 738 } },
  { id: 'sofa-right', label: 'Right of sofa', pos: { x: 1150, y: 738 } },
  { id: 'by-nook', label: 'By nook', pos: { x: 1320, y: 725 } },
];

/** Shared foreground seating spots. */
const SEATING_SPOTS: readonly SpotDef[] = [
  { id: 'door-side', label: 'By door', pos: { x: 255, y: 830 } },
  { id: 'front-left', label: 'Front left', pos: { x: 435, y: 838 } },
  { id: 'fireside-front', label: 'By hearth', pos: { x: 1790, y: 836 } },
];

/** Shared hanging wall-art spots along the plaster wall. */
const WALL_ART_SPOTS: readonly SpotDef[] = [
  { id: 'wall-left', label: 'Left wall', pos: { x: 455, y: 335 } },
  { id: 'wall-center', label: 'Center wall', pos: { x: 890, y: 315 } },
  { id: 'wall-right', label: 'Right wall', pos: { x: 1135, y: 328 } },
];

export const FURNITURE_SLOTS: readonly SlotDef[] = [
  {
    id: 'sofa',
    label: 'Sofa',
    pos: { x: 895, y: 735 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'teal',
    options: [
      { id: 'teal', label: 'Teal loveseat', sprite: 'cottage_lounge_sofa', height: 240 },
      { id: 'terracotta', label: 'Terracotta', sprite: 'terracotta_lounge_sofa', height: 240 },
      { id: 'sage', label: 'Sage sofa', sprite: 'sage_lounge_sofa', height: 240 },
      { id: 'oat', label: 'Oat cream', sprite: 'oat_cream_lounge_sofa', height: 240 },
    ],
  },
  {
    id: 'rug',
    label: 'Rug',
    pos: { x: 895, y: 858 },
    mount: 'rug',
    tap: 'bounce',
    defaultOptionId: 'terracotta',
    options: [
      { id: 'terracotta', label: 'Braided clay', sprite: 'braided_oval_rug', height: 250 },
      { id: 'sage', label: 'Sage meadow', sprite: 'sage_braided_rug', height: 250 },
      { id: 'plum', label: 'Plum berry', sprite: 'plum_braided_rug', height: 250 },
      { id: 'tassel', label: 'Woven tassel', sprite: 'woven_tassel_rug', height: 245 },
    ],
  },
  {
    id: 'coffee-table',
    label: 'Table',
    pos: { x: 895, y: 836 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'oak',
    options: [
      { id: 'oak', label: 'Honey oak', sprite: 'low_oak_coffee_table', height: 160 },
      { id: 'teal', label: 'Painted teal', sprite: 'teal_coffee_table', height: 160 },
      { id: 'walnut', label: 'Warm walnut', sprite: 'walnut_coffee_table', height: 160 },
    ],
  },
  {
    id: 'reading-nook',
    label: 'Reading nook',
    pos: { x: 1435, y: 588 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'window-bench',
    options: [
      { id: 'window-bench', label: 'Window bench', sprite: 'window_bench_nook', height: 198 },
      { id: 'reading-chair', label: 'Reading chair', sprite: 'reading_nook_armchair', height: 205 },
      { id: 'floor-daybed', label: 'Floor daybed', sprite: 'daybed_reading_nook', height: 150 },
      { id: 'rattan-nook', label: 'Rattan nook', sprite: 'rattan_reading_chair', height: 210 },
    ],
  },
  {
    id: 'tv',
    label: 'TV',
    pos: { x: 615, y: 582 },
    mount: 'floor',
    tap: 'tv',
    defaultOptionId: 'wood-console',
    defaultSpotId: 'mid-left',
    spots: BACK_WALL_SPOTS,
    options: [
      {
        id: 'wood-console',
        label: 'Oak console TV',
        sprite: 'cottage_tv_console',
        height: 220,
        screenGlow: { x: 18, y: 5, w: 63, h: 43 },
      },
      {
        id: 'retro-tv',
        label: 'Retro wood TV',
        sprite: 'retro_wood_tv',
        height: 215,
        screenGlow: { x: 14, y: 37, w: 56, h: 38 },
      },
      {
        id: 'teal-media',
        label: 'Teal media TV',
        sprite: 'teal_media_tv',
        height: 220,
        screenGlow: { x: 35, y: 5, w: 54, h: 38 },
      },
    ],
  },
  {
    id: 'bookshelf',
    label: 'Bookshelf',
    pos: { x: 1125, y: 578 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'oak',
    defaultSpotId: 'right-alcove',
    spots: BACK_WALL_SPOTS,
    options: [
      { id: 'oak', label: 'Oak bookshelf', sprite: 'arched_display_bookshelf', height: 340 },
      { id: 'sage', label: 'Sage bookshelf', sprite: 'sage_display_bookshelf', height: 340 },
      { id: 'walnut', label: 'Walnut shelf', sprite: 'walnut_display_bookshelf', height: 340 },
    ],
  },
  {
    id: 'cabinet',
    label: 'Cabinet',
    pos: { x: 365, y: 582 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'apothecary',
    defaultSpotId: 'left-wall',
    spots: BACK_WALL_SPOTS,
    options: [
      { id: 'apothecary', label: 'Seed cabinet', sprite: 'seed_drawer_cabinet', height: 210 },
      { id: 'sideboard', label: 'Teal sideboard', sprite: 'cottage_sideboard', height: 215 },
      { id: 'trellis', label: 'Flower trellis', sprite: 'flowering_trellis', height: 255 },
    ],
  },
  {
    id: 'armchair',
    label: 'Cozy chair',
    pos: { x: 255, y: 830 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'wingback',
    defaultSpotId: 'door-side',
    spots: SEATING_SPOTS,
    options: [
      { id: 'wingback', label: 'Sage wingback', sprite: 'sage_wingback_chair', height: 205 },
      { id: 'rocking', label: 'Oak rocker', sprite: 'cottage_rocking_chair', height: 208 },
      { id: 'tub', label: 'Plum armchair', sprite: 'plum_tub_armchair', height: 195 },
    ],
  },
  {
    id: 'side-table',
    label: 'Side table',
    pos: { x: 650, y: 738 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'oak-end',
    defaultSpotId: 'sofa-left',
    spots: SIDE_ACCENT_SPOTS,
    options: [
      { id: 'oak-end', label: 'Tea end table', sprite: 'oak_end_table', height: 155 },
      { id: 'record-stand', label: 'Record stand', sprite: 'vinyl_record_stand', height: 162 },
      { id: 'candle-table', label: 'Candle table', sprite: 'candle_side_table', height: 158 },
    ],
  },
  {
    id: 'lamp',
    label: 'Lamp',
    pos: { x: 1150, y: 738 },
    mount: 'floor',
    tap: 'lamp',
    defaultOptionId: 'globe',
    defaultSpotId: 'sofa-right',
    spots: SIDE_ACCENT_SPOTS,
    options: [
      {
        id: 'globe',
        label: 'Globe lamp',
        sprite: 'standing_globe_floor_lamp',
        height: 280,
        glow: { x: 20, y: 33 },
      },
      {
        id: 'reading',
        label: 'Table lamp',
        sprite: 'pedestal_reading_lamp',
        height: 248,
        glow: { x: 50, y: 24 },
      },
      {
        id: 'lantern',
        label: 'Candle lantern',
        sprite: 'greenhouse_lantern',
        height: 175,
        glow: { x: 50, y: 58 },
      },
    ],
  },
  {
    id: 'trolley',
    label: 'Fireside',
    pos: { x: 1585, y: 738 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'tea-trolley',
    defaultSpotId: 'fireside-left',
    spots: [
      { id: 'fireside-left', label: 'Fireside', pos: { x: 1585, y: 738 } },
      { id: 'right-of-rug', label: 'By rug', pos: { x: 1345, y: 832 } },
    ],
    options: [
      { id: 'tea-trolley', label: 'Tea trolley', sprite: 'tea_trolley', height: 210 },
      { id: 'blanket-basket', label: 'Blanket basket', sprite: 'fireplace_basket_set', height: 192 },
      { id: 'herb-cart', label: 'Herb cart', sprite: 'two_wheeled_herb_cart', height: 215 },
    ],
  },
  {
    id: 'tree',
    label: 'Plant',
    pos: { x: 215, y: 635 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'calamondin',
    defaultSpotId: 'door-corner',
    spots: [
      { id: 'door-corner', label: 'Door corner', pos: { x: 215, y: 635 } },
      { id: 'fireside-left', label: 'Fireside', pos: { x: 1585, y: 738 } },
      { id: 'right-of-rug', label: 'By rug', pos: { x: 1345, y: 832 } },
    ],
    options: [
      { id: 'calamondin', label: 'Citrus tree', sprite: 'potted_calamondin_tree', height: 240 },
      { id: 'monstera', label: 'Monstera pot', sprite: 'monstera_ceramic_pot', height: 225 },
      { id: 'herb-bed', label: 'Herb planter', sprite: 'raised_herb_bed', height: 180 },
    ],
  },
  {
    id: 'cushion',
    label: 'Floor seat',
    pos: { x: 435, y: 838 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'pouf',
    defaultSpotId: 'front-left',
    spots: SEATING_SPOTS,
    options: [
      { id: 'pouf', label: 'Patchwork pouf', sprite: 'patchwork_floor_cushion', height: 105 },
      { id: 'pet-basket', label: 'Woven pet bed', sprite: 'woven_pet_basket', height: 118 },
      { id: 'stool', label: 'Orchard stool', sprite: 'curved_orchard_stool', height: 128 },
      { id: 'ottoman', label: 'Knit ottoman', sprite: 'knit_ottoman', height: 112 },
    ],
  },
  {
    id: 'accent-rug',
    label: 'Accent rug',
    pos: { x: 1775, y: 710 },
    mount: 'rug',
    tap: 'bounce',
    defaultOptionId: 'hearth-mat',
    defaultSpotId: 'hearth',
    spots: [
      { id: 'hearth', label: 'Hearth', pos: { x: 1775, y: 710 } },
      { id: 'nook', label: 'By nook', pos: { x: 1435, y: 678 } },
      { id: 'garden-door', label: 'Garden door', pos: { x: 260, y: 765 } },
    ],
    options: [
      { id: 'hearth-mat', label: 'Hearth mat', sprite: 'hearth_braided_mat', height: 136 },
      { id: 'fleece', label: 'Cloud fleece', sprite: 'oat_fleece_rug', height: 140 },
      { id: 'botanical', label: 'Leaf runner', sprite: 'botanical_runner_rug', height: 145 },
    ],
  },
  {
    id: 'hanging-decor',
    label: 'Hanging decor',
    pos: { x: 262, y: 226 },
    mount: 'wall',
    tap: 'swing',
    defaultOptionId: 'terracotta-plant',
    defaultSpotId: 'beam-door',
    spots: [
      { id: 'beam-door', label: 'Left beam', pos: { x: 262, y: 226 } },
      { id: 'beam-mid', label: 'Mid beam', pos: { x: 640, y: 226 } },
      { id: 'beam-window', label: 'Window', pos: { x: 1435, y: 230 } },
    ],
    options: [
      { id: 'terracotta-plant', label: 'Hanging vine', sprite: 'hanging_terracotta_plant', height: 185 },
      { id: 'ivy-basket', label: 'Ivy basket', sprite: 'hanging_ivy_basket', height: 190 },
      { id: 'lantern', label: 'Hanging lantern', sprite: 'hanging_cottage_lantern', height: 185 },
      { id: 'dried-herbs', label: 'Dried herbs', sprite: 'hanging_dried_herbs', height: 185 },
    ],
  },
  {
    id: 'garland',
    label: 'Garland',
    pos: { x: 890, y: 158 },
    mount: 'wall',
    tap: 'swing',
    defaultOptionId: 'vine',
    defaultSpotId: 'center-beam',
    spots: [
      { id: 'left-beam', label: 'Left beam', pos: { x: 540, y: 158 } },
      { id: 'center-beam', label: 'Center beam', pos: { x: 890, y: 158 } },
      { id: 'window-beam', label: 'Over window', pos: { x: 1435, y: 158 } },
    ],
    options: [
      { id: 'vine', label: 'Leaf garland', sprite: 'ceiling_vine_garland', height: 115 },
      { id: 'lights', label: 'Fairy lights', sprite: 'ceiling_fairy_lights', height: 118 },
      { id: 'bunting', label: 'Fabric bunting', sprite: 'ceiling_fabric_bunting', height: 115 },
      { id: 'flowers', label: 'Flower swag', sprite: 'ceiling_flower_swag', height: 118 },
    ],
  },
  {
    id: 'pinboard',
    label: 'Wall decor A',
    pos: { x: 455, y: 335 },
    mount: 'wall',
    tap: 'swing',
    defaultOptionId: 'pinboard',
    defaultSpotId: 'wall-left',
    spots: WALL_ART_SPOTS,
    options: [
      { id: 'pinboard', label: 'Photo board', sprite: 'wall_pinboard_trio', height: 175 },
      { id: 'painting', label: 'Hillside art', sprite: 'botanical_framed_art', height: 165 },
      { id: 'shelf', label: 'Wall shelf', sprite: 'wall_floating_shelf', height: 170 },
      { id: 'tapestry', label: 'Sun tapestry', sprite: 'botanical_wall_tapestry', height: 175 },
    ],
  },
  {
    id: 'clock',
    label: 'Wall decor B',
    pos: { x: 890, y: 315 },
    mount: 'wall',
    tap: 'swing',
    defaultOptionId: 'clock',
    defaultSpotId: 'wall-center',
    spots: WALL_ART_SPOTS,
    options: [
      { id: 'clock', label: 'Wall clock', sprite: 'wall_clock', height: 145 },
      { id: 'mirror', label: 'Wreath mirror', sprite: 'cottage_oval_mirror', height: 165 },
      { id: 'macrame', label: 'Macramé', sprite: 'macrame_wall_hanging', height: 175 },
      { id: 'gallery', label: 'Gallery frames', sprite: 'cottage_gallery_frames', height: 165 },
    ],
  },
];

export const SLOT_BY_ID: Readonly<Record<SlotId, SlotDef>> = Object.fromEntries(
  FURNITURE_SLOTS.map((slot) => [slot.id, slot]),
) as Record<SlotId, SlotDef>;

export const DEFAULT_SLOT_SELECTIONS: Readonly<SlotSelections> = Object.freeze(defaultSlotSelections());
export const DEFAULT_SLOT_PLACEMENTS: Readonly<PlacementMap> = Object.freeze(defaultSlotPlacements());

// Keep the visual catalog and the dependency-free shared-save catalog in lockstep.
for (const slot of FURNITURE_SLOTS) {
  const choices = SLOT_CHOICES[slot.id];
  if (
    !choices ||
    choices.defaultId !== slot.defaultOptionId ||
    choices.optionIds.length !== slot.options.length ||
    slot.options.some((o, i) => choices.optionIds[i] !== o.id)
  ) {
    throw new Error(`Furniture slot "${slot.id}" is out of sync with SLOT_CHOICES`);
  }
  if (slot.spots) {
    if (!isMovableSlotId(slot.id)) {
      throw new Error(`Movable slot "${slot.id}" is missing from SLOT_PLACEMENTS`);
    }
    const placements = SLOT_PLACEMENTS[slot.id];
    if (
      placements.defaultId !== slot.defaultSpotId ||
      placements.optionIds.length !== slot.spots.length ||
      slot.spots.some((sp, i) => placements.optionIds[i] !== sp.id)
    ) {
      throw new Error(`Placement spots for "${slot.id}" are out of sync with SLOT_PLACEMENTS`);
    }
  } else if (isMovableSlotId(slot.id)) {
    throw new Error(`Slot "${slot.id}" is in SLOT_PLACEMENTS without spots in FURNITURE_SLOTS`);
  }
}

/** The chosen art for a slot, falling back to the slot's default for unknown ids. */
export function resolveSlotOption(slot: SlotDef, optionId?: string): SlotOption {
  return (
    slot.options.find((o) => o.id === optionId) ??
    slot.options.find((o) => o.id === slot.defaultOptionId) ??
    slot.options[0]
  );
}

/** The active placement spot for a movable slot (or null when the slot is fixed). */
export function resolveSlotSpot(slot: SlotDef, spotId?: string): SpotDef | null {
  if (!slot.spots?.length) return null;
  return (
    slot.spots.find((s) => s.id === spotId) ??
    slot.spots.find((s) => s.id === slot.defaultSpotId) ??
    slot.spots[0]
  );
}

/** The active room anchor for a slot given its placement spot id. */
export function resolveSlotPosition(slot: SlotDef, spotId?: string): Pos {
  return resolveSlotSpot(slot, spotId)?.pos ?? slot.pos;
}

export function itemSize(def: Pick<SlotOption, 'sprite' | 'height'>): { w: number; h: number } {
  const s = sprites[def.sprite];
  return { w: Math.round((s.w / s.h) * def.height), h: def.height };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Keeps an item inside the room: floor items on the floor, wall items on the wall. */
export function clampPosition(def: Pick<SlotOption, 'sprite' | 'height'> & { mount: Mount }, pos: Pos): Pos {
  const { w, h } = itemSize(def);
  const x = clamp(pos.x, w / 2, ROOM.w - w / 2);
  const y =
    def.mount === 'wall'
      ? clamp(pos.y, ROOM.wallTop + h, ROOM.wallBottom - 20)
      : clamp(pos.y, ROOM.floorMinY, ROOM.floorMaxY);
  return { x: Math.round(x), y: Math.round(y) };
}

/** Painter's order: wall items, then rugs, then floor items and pets by base y. */
export function depthOf(mount: Mount, y: number): number {
  if (mount === 'wall') return 10;
  if (mount === 'rug') return 50;
  return 100 + Math.round(y);
}
export type { MovableSlotId, PlacementMap };
