import sprites from './sprites.json';

/** Logical room size. The stage is scaled uniformly to fit the window. */
export const ROOM = {
  w: 1600,
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

export interface ItemDef {
  id: string;
  sprite: SpriteId;
  /** Display height in room pixels; width follows the sprite's aspect ratio. */
  height: number;
  mount: Mount;
  tap: TapAction;
  /** Lamps only: where the light sits, as % of the sprite's width and height. */
  glow?: { x: number; y: number };
}

export interface Pos {
  /** Horizontal centre. */
  x: number;
  /** Bottom edge (the item's base). */
  y: number;
}

export type Layout = Record<string, Pos>;

export const ITEMS: ItemDef[] = [
  { id: 'rug', sprite: 'braided_oval_rug', height: 250, mount: 'rug', tap: 'bounce' },
  { id: 'pinboard', sprite: 'wall_pinboard_trio', height: 175, mount: 'wall', tap: 'swing' },
  { id: 'clock', sprite: 'wall_clock', height: 145, mount: 'wall', tap: 'swing' },
  { id: 'tree', sprite: 'potted_calamondin_tree', height: 240, mount: 'floor', tap: 'bounce' },
  { id: 'cabinet', sprite: 'seed_drawer_cabinet', height: 210, mount: 'floor', tap: 'bounce' },
  { id: 'bookshelf', sprite: 'arched_display_bookshelf', height: 340, mount: 'floor', tap: 'bounce' },
  { id: 'sofa', sprite: 'cottage_lounge_sofa', height: 240, mount: 'floor', tap: 'bounce' },
  { id: 'coffee-table', sprite: 'low_oak_coffee_table', height: 160, mount: 'floor', tap: 'bounce' },
  {
    id: 'lamp',
    sprite: 'standing_globe_floor_lamp',
    height: 280,
    mount: 'floor',
    tap: 'lamp',
    glow: { x: 20, y: 33 },
  },
  { id: 'trolley', sprite: 'tea_trolley', height: 210, mount: 'floor', tap: 'bounce' },
  { id: 'cushion', sprite: 'patchwork_floor_cushion', height: 105, mount: 'floor', tap: 'bounce' },
];

export const DEFAULT_LAYOUT: Layout = {
  rug: { x: 685, y: 852 },
  pinboard: { x: 390, y: 345 },
  clock: { x: 695, y: 300 },
  tree: { x: 245, y: 598 },
  cabinet: { x: 520, y: 580 },
  bookshelf: { x: 985, y: 578 },
  sofa: { x: 685, y: 722 },
  'coffee-table': { x: 690, y: 830 },
  lamp: { x: 1010, y: 728 },
  trolley: { x: 1265, y: 722 },
  cushion: { x: 295, y: 806 },
};

export function itemSize(def: Pick<ItemDef, 'sprite' | 'height'>): { w: number; h: number } {
  const s = sprites[def.sprite];
  return { w: Math.round((s.w / s.h) * def.height), h: def.height };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Keeps an item inside the room: floor items on the floor, wall items on the wall. */
export function clampPosition(def: ItemDef, pos: Pos): Pos {
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

const STORAGE_KEY = 'our-home:living-room:v2';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Saved positions merged over the defaults; unknown or malformed entries are ignored. */
export function loadLayout(storage: StorageLike | undefined): Layout {
  const layout: Layout = { ...DEFAULT_LAYOUT };
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return layout;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    for (const def of ITEMS) {
      const p = saved[def.id] as Partial<Pos> | undefined;
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        layout[def.id] = clampPosition(def, { x: p.x as number, y: p.y as number });
      }
    }
  } catch {
    // Corrupt or unavailable storage: fall back to the default room.
  }
  return layout;
}

export function saveLayout(storage: StorageLike | undefined, layout: Layout): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Storage can be full or blocked; the room still works without saving.
  }
}

export function clearLayout(storage: StorageLike | undefined): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
