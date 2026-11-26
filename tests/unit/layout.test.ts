import { describe, expect, it } from 'vitest';
import sprites from '../../src/game/sprites.json';
import {
  clampPosition,
  DEFAULT_LAYOUT,
  depthOf,
  ITEMS,
  itemSize,
  loadLayout,
  ROOM,
  saveLayout,
} from '../../src/game/layout';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
    removeItem: (k: string) => {
      delete data[k];
    },
  };
}

const byId = (id: string) => ITEMS.find((d) => d.id === id)!;

describe('layout', () => {
  it('every item has a default position that is already inside the room', () => {
    for (const def of ITEMS) {
      const pos = DEFAULT_LAYOUT[def.id];
      expect(pos, def.id).toBeDefined();
      expect(clampPosition(def, pos)).toEqual(pos);
    }
  });

  it('keeps floor items on the floor and inside the walls', () => {
    const cushion = byId('cushion');
    const { w } = itemSize(cushion);
    expect(clampPosition(cushion, { x: -500, y: 100 })).toEqual({ x: Math.round(w / 2), y: ROOM.floorMinY });
    expect(clampPosition(cushion, { x: 99999, y: 99999 })).toEqual({
      x: Math.round(ROOM.w - w / 2),
      y: ROOM.floorMaxY,
    });
  });

  it('keeps rugs on the floor', () => {
    expect(clampPosition(byId('rug'), { x: 685, y: 100 }).y).toBe(ROOM.floorMinY);
  });

  it('keeps wall items on the wall', () => {
    const clock = byId('clock');
    const { h } = itemSize(clock);
    expect(clampPosition(clock, { x: 800, y: 0 }).y).toBe(ROOM.wallTop + h);
    expect(clampPosition(clock, { x: 800, y: 800 }).y).toBe(ROOM.wallBottom - 20);
  });

  it('draws wall items, then rugs, then floor items with nearer ones in front', () => {
    expect(depthOf('wall', 500)).toBeLessThan(depthOf('rug', ROOM.floorMaxY));
    expect(depthOf('rug', ROOM.floorMaxY)).toBeLessThan(depthOf('floor', ROOM.floorMinY));
    expect(depthOf('floor', 700)).toBeLessThan(depthOf('floor', 800));
  });

  it('keeps width in proportion to the sprite', () => {
    const raw = sprites.patchwork_floor_cushion;
    const { w, h } = itemSize({ sprite: 'patchwork_floor_cushion', height: raw.h });
    expect(h).toBe(raw.h);
    expect(w).toBe(raw.w);
  });

  it('round-trips a saved layout', () => {
    const storage = memoryStorage();
    const layout = { ...DEFAULT_LAYOUT, cushion: { x: 700, y: 800 } };
    saveLayout(storage, layout);
    expect(loadLayout(storage)).toEqual(layout);
  });

  it('ignores corrupt or out-of-range saves', () => {
    expect(loadLayout(memoryStorage({ 'our-home:living-room:v2': '{not json' }))).toEqual(DEFAULT_LAYOUT);
    const loaded = loadLayout(
      memoryStorage({
        'our-home:living-room:v2': JSON.stringify({ cushion: { x: 'a', y: 1 }, lamp: { x: 5000, y: 5000 } }),
      }),
    );
    expect(loaded.cushion).toEqual(DEFAULT_LAYOUT.cushion);
    expect(loaded.lamp).toEqual(clampPosition(byId('lamp'), { x: 5000, y: 5000 }));
  });

  it('works with no storage at all', () => {
    expect(loadLayout(undefined)).toEqual(DEFAULT_LAYOUT);
    expect(() => saveLayout(undefined, DEFAULT_LAYOUT)).not.toThrow();
  });
});
