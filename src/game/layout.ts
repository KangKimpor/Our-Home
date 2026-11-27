import { defaultSlotSelections, SLOT_CHOICES, type SlotId, type SlotSelectionMap } from './sharedHomeCore';
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
export type TapAction = 'bounce' | 'lamp' | 'swing';

export interface Pos {
  /** Horizontal centre. */
  x: number;
  /** Bottom edge (the item's base). */
  y: number;
}

/** One swappable art choice for a fixed furniture slot. */
export interface SlotOption {
  id: string;
  label: string;
  sprite: SpriteId;
  /** Display height in room pixels; width follows the sprite's aspect ratio. */
  height: number;
  /** Lamps only: where the light sits, as % of the sprite's width and height. */
  glow?: { x: number; y: number };
}

/** A fixed furniture/decor location in the living room. */
export interface SlotDef {
  id: SlotId;
  label: string;
  /** Fixed anchor: horizontal centre and base (bottom edge). Furniture never moves. */
  pos: Pos;
  mount: Mount;
  tap: TapAction;
  defaultOptionId: string;
  options: readonly SlotOption[];
}

export type SlotSelections = SlotSelectionMap;

export const FURNITURE_SLOTS: readonly SlotDef[] = [
  {
    id: 'sofa',
    label: 'Sofa',
    pos: { x: 890, y: 722 },
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
    pos: { x: 890, y: 852 },
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
    pos: { x: 895, y: 830 },
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
    id: 'bookshelf',
    label: 'Alcove',
    pos: { x: 1215, y: 578 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'oak',
    options: [
      { id: 'oak', label: 'Oak bookshelf', sprite: 'arched_display_bookshelf', height: 340 },
      { id: 'sage', label: 'Sage bookshelf', sprite: 'sage_display_bookshelf', height: 340 },
      { id: 'window-seat', label: 'Reading nook', sprite: 'arched_window_seat', height: 335 },
    ],
  },
  {
    id: 'lamp',
    label: 'Lamp',
    pos: { x: 1200, y: 730 },
    mount: 'floor',
    tap: 'lamp',
    defaultOptionId: 'globe',
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
    id: 'cabinet',
    label: 'Cabinet',
    pos: { x: 605, y: 580 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'apothecary',
    options: [
      { id: 'apothecary', label: 'Seed cabinet', sprite: 'seed_drawer_cabinet', height: 210 },
      { id: 'sideboard', label: 'Teal sideboard', sprite: 'cottage_sideboard', height: 215 },
      { id: 'trellis', label: 'Flower trellis', sprite: 'flowering_trellis', height: 255 },
    ],
  },
  {
    id: 'trolley',
    label: 'Fireside',
    pos: { x: 1515, y: 722 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'tea-trolley',
    options: [
      { id: 'tea-trolley', label: 'Tea trolley', sprite: 'tea_trolley', height: 210 },
      { id: 'blanket-basket', label: 'Blanket basket', sprite: 'fireplace_basket_set', height: 192 },
      { id: 'herb-cart', label: 'Herb cart', sprite: 'two_wheeled_herb_cart', height: 215 },
    ],
  },
  {
    id: 'tree',
    label: 'Corner plant',
    pos: { x: 265, y: 598 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'calamondin',
    options: [
      { id: 'calamondin', label: 'Citrus tree', sprite: 'potted_calamondin_tree', height: 240 },
      { id: 'monstera', label: 'Monstera pot', sprite: 'monstera_ceramic_pot', height: 225 },
      { id: 'herb-bed', label: 'Herb planter', sprite: 'raised_herb_bed', height: 180 },
    ],
  },
  {
    id: 'cushion',
    label: 'Floor seat',
    pos: { x: 430, y: 806 },
    mount: 'floor',
    tap: 'bounce',
    defaultOptionId: 'pouf',
    options: [
      { id: 'pouf', label: 'Patchwork pouf', sprite: 'patchwork_floor_cushion', height: 105 },
      { id: 'pet-basket', label: 'Woven pet bed', sprite: 'woven_pet_basket', height: 118 },
      { id: 'stool', label: 'Orchard stool', sprite: 'curved_orchard_stool', height: 128 },
    ],
  },
  {
    id: 'pinboard',
    label: 'Left wall',
    pos: { x: 480, y: 345 },
    mount: 'wall',
    tap: 'swing',
    defaultOptionId: 'pinboard',
    options: [
      { id: 'pinboard', label: 'Photo board', sprite: 'wall_pinboard_trio', height: 175 },
      { id: 'painting', label: 'Hillside art', sprite: 'botanical_framed_art', height: 165 },
      { id: 'shelf', label: 'Wall shelf', sprite: 'wall_floating_shelf', height: 170 },
    ],
  },
  {
    id: 'clock',
    label: 'Center wall',
    pos: { x: 890, y: 300 },
    mount: 'wall',
    tap: 'swing',
    defaultOptionId: 'clock',
    options: [
      { id: 'clock', label: 'Wall clock', sprite: 'wall_clock', height: 145 },
      { id: 'mirror', label: 'Wreath mirror', sprite: 'cottage_oval_mirror', height: 165 },
      { id: 'macrame', label: 'Macramé', sprite: 'macrame_wall_hanging', height: 175 },
    ],
  },
];

export const SLOT_BY_ID: Readonly<Record<SlotId, SlotDef>> = Object.fromEntries(
  FURNITURE_SLOTS.map((slot) => [slot.id, slot]),
) as Record<SlotId, SlotDef>;

export const DEFAULT_SLOT_SELECTIONS: Readonly<SlotSelections> = Object.freeze(defaultSlotSelections());

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
}

/** The chosen art for a slot, falling back to the slot's default for unknown ids. */
export function resolveSlotOption(slot: SlotDef, optionId?: string): SlotOption {
  return (
    slot.options.find((o) => o.id === optionId) ??
    slot.options.find((o) => o.id === slot.defaultOptionId) ??
    slot.options[0]
  );
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
