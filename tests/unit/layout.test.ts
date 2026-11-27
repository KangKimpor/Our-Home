import { describe, expect, it } from 'vitest';
import sprites from '../../src/game/sprites.json';
import {
  clampPosition,
  DEFAULT_SLOT_SELECTIONS,
  depthOf,
  FURNITURE_SLOTS,
  itemSize,
  resolveSlotOption,
  ROOM,
  SLOT_BY_ID,
} from '../../src/game/layout';
import { SLOT_CHOICES, SLOT_IDS } from '../../src/game/sharedHomeCore';

const EXPECTED = {
  sofa: {
    label: 'Sofa',
    pos: { x: 890, y: 722 },
    mount: 'floor',
    tap: 'bounce',
    default: 'teal',
    options: [
      ['teal', 'Teal loveseat', 'cottage_lounge_sofa', 240],
      ['terracotta', 'Terracotta', 'terracotta_lounge_sofa', 240],
      ['sage', 'Sage sofa', 'sage_lounge_sofa', 240],
      ['oat', 'Oat cream', 'oat_cream_lounge_sofa', 240],
    ],
  },
  rug: {
    label: 'Rug',
    pos: { x: 890, y: 852 },
    mount: 'rug',
    tap: 'bounce',
    default: 'terracotta',
    options: [
      ['terracotta', 'Braided clay', 'braided_oval_rug', 250],
      ['sage', 'Sage meadow', 'sage_braided_rug', 250],
      ['plum', 'Plum berry', 'plum_braided_rug', 250],
      ['tassel', 'Woven tassel', 'woven_tassel_rug', 245],
    ],
  },
  'coffee-table': {
    label: 'Table',
    pos: { x: 895, y: 830 },
    mount: 'floor',
    tap: 'bounce',
    default: 'oak',
    options: [
      ['oak', 'Honey oak', 'low_oak_coffee_table', 160],
      ['teal', 'Painted teal', 'teal_coffee_table', 160],
      ['walnut', 'Warm walnut', 'walnut_coffee_table', 160],
    ],
  },
  bookshelf: {
    label: 'Alcove',
    pos: { x: 1215, y: 578 },
    mount: 'floor',
    tap: 'bounce',
    default: 'oak',
    options: [
      ['oak', 'Oak bookshelf', 'arched_display_bookshelf', 340],
      ['sage', 'Sage bookshelf', 'sage_display_bookshelf', 340],
      ['window-seat', 'Reading nook', 'arched_window_seat', 335],
    ],
  },
  lamp: {
    label: 'Lamp',
    pos: { x: 1200, y: 730 },
    mount: 'floor',
    tap: 'lamp',
    default: 'globe',
    options: [
      ['globe', 'Globe lamp', 'standing_globe_floor_lamp', 280],
      ['reading', 'Table lamp', 'pedestal_reading_lamp', 248],
      ['lantern', 'Candle lantern', 'greenhouse_lantern', 175],
    ],
  },
  cabinet: {
    label: 'Cabinet',
    pos: { x: 605, y: 580 },
    mount: 'floor',
    tap: 'bounce',
    default: 'apothecary',
    options: [
      ['apothecary', 'Seed cabinet', 'seed_drawer_cabinet', 210],
      ['sideboard', 'Teal sideboard', 'cottage_sideboard', 215],
      ['trellis', 'Flower trellis', 'flowering_trellis', 255],
    ],
  },
  trolley: {
    label: 'Fireside',
    pos: { x: 1515, y: 722 },
    mount: 'floor',
    tap: 'bounce',
    default: 'tea-trolley',
    options: [
      ['tea-trolley', 'Tea trolley', 'tea_trolley', 210],
      ['blanket-basket', 'Blanket basket', 'fireplace_basket_set', 192],
      ['herb-cart', 'Herb cart', 'two_wheeled_herb_cart', 215],
    ],
  },
  tree: {
    label: 'Corner plant',
    pos: { x: 265, y: 598 },
    mount: 'floor',
    tap: 'bounce',
    default: 'calamondin',
    options: [
      ['calamondin', 'Citrus tree', 'potted_calamondin_tree', 240],
      ['monstera', 'Monstera pot', 'monstera_ceramic_pot', 225],
      ['herb-bed', 'Herb planter', 'raised_herb_bed', 180],
    ],
  },
  cushion: {
    label: 'Floor seat',
    pos: { x: 430, y: 806 },
    mount: 'floor',
    tap: 'bounce',
    default: 'pouf',
    options: [
      ['pouf', 'Patchwork pouf', 'patchwork_floor_cushion', 105],
      ['pet-basket', 'Woven pet bed', 'woven_pet_basket', 118],
      ['stool', 'Orchard stool', 'curved_orchard_stool', 128],
    ],
  },
  pinboard: {
    label: 'Left wall',
    pos: { x: 480, y: 345 },
    mount: 'wall',
    tap: 'swing',
    default: 'pinboard',
    options: [
      ['pinboard', 'Photo board', 'wall_pinboard_trio', 175],
      ['painting', 'Hillside art', 'botanical_framed_art', 165],
      ['shelf', 'Wall shelf', 'wall_floating_shelf', 170],
    ],
  },
  clock: {
    label: 'Center wall',
    pos: { x: 890, y: 300 },
    mount: 'wall',
    tap: 'swing',
    default: 'clock',
    options: [
      ['clock', 'Wall clock', 'wall_clock', 145],
      ['mirror', 'Wreath mirror', 'cottage_oval_mirror', 165],
      ['macrame', 'Macramé', 'macrame_wall_hanging', 175],
    ],
  },
} as const;

describe('fixed furniture slots', () => {
  it('defines exactly the 11 fixed slots in order', () => {
    expect(FURNITURE_SLOTS.map((s) => s.id)).toEqual(Object.keys(EXPECTED));
    expect(FURNITURE_SLOTS).toHaveLength(11);
    expect(SLOT_IDS).toEqual(Object.keys(EXPECTED));
  });

  it('matches the catalog: labels, fixed positions, mounts, taps, defaults, sprites, and heights', () => {
    for (const slot of FURNITURE_SLOTS) {
      const want = EXPECTED[slot.id];
      expect(slot.label, slot.id).toBe(want.label);
      expect(slot.pos, slot.id).toEqual(want.pos);
      expect(slot.mount, slot.id).toBe(want.mount);
      expect(slot.tap, slot.id).toBe(want.tap);
      expect(slot.defaultOptionId, slot.id).toBe(want.default);
      expect(slot.options.map((o) => [o.id, o.label, o.sprite, o.height])).toEqual(want.options);
    }
  });

  it('only uses sprites that exist in sprites.json', () => {
    for (const slot of FURNITURE_SLOTS) {
      for (const option of slot.options) {
        expect(sprites, `${slot.id}/${option.id}`).toHaveProperty(option.sprite);
      }
    }
  });

  it('gives every lamp option a glow inside its sprite, and nothing else', () => {
    expect(SLOT_BY_ID.lamp.options.map((o) => o.glow)).toEqual([
      { x: 20, y: 33 },
      { x: 50, y: 24 },
      { x: 50, y: 58 },
    ]);
    for (const slot of FURNITURE_SLOTS) {
      if (slot.id === 'lamp') continue;
      for (const option of slot.options) expect(option.glow).toBeUndefined();
    }
  });

  it('stays in lockstep with the shared-save catalog', () => {
    for (const slot of FURNITURE_SLOTS) {
      expect(SLOT_CHOICES[slot.id].defaultId).toBe(slot.defaultOptionId);
      expect([...SLOT_CHOICES[slot.id].optionIds]).toEqual(slot.options.map((o) => o.id));
    }
  });

  it('has defaults for every slot', () => {
    expect(Object.keys(DEFAULT_SLOT_SELECTIONS)).toEqual(Object.keys(EXPECTED));
    for (const slot of FURNITURE_SLOTS) expect(DEFAULT_SLOT_SELECTIONS[slot.id]).toBe(slot.defaultOptionId);
  });

  it('resolves options and falls back to the slot default for unknown ids', () => {
    const sofa = SLOT_BY_ID.sofa;
    expect(resolveSlotOption(sofa, 'sage').sprite).toBe('sage_lounge_sofa');
    expect(resolveSlotOption(sofa, 'nope').id).toBe('teal');
    expect(resolveSlotOption(sofa).id).toBe('teal');
    expect(resolveSlotOption(SLOT_BY_ID.rug, 'tassel').height).toBe(245);
  });

  it('keeps every option of every slot inside the room at its fixed spot', () => {
    for (const slot of FURNITURE_SLOTS) {
      for (const option of slot.options) {
        const { w, h } = itemSize(option);
        expect(slot.pos.x - w / 2, `${slot.id}/${option.id}`).toBeGreaterThanOrEqual(0);
        expect(slot.pos.x + w / 2, `${slot.id}/${option.id}`).toBeLessThanOrEqual(ROOM.w);
        expect(slot.pos.y - h, `${slot.id}/${option.id}`).toBeGreaterThanOrEqual(0);
        expect(slot.pos.y, `${slot.id}/${option.id}`).toBeLessThanOrEqual(ROOM.h);
      }
    }
  });
});

describe('layout helpers', () => {
  it('keeps floor items on the floor and inside the walls', () => {
    const cushion = { ...SLOT_BY_ID.cushion.options[0], mount: 'floor' as const };
    const { w } = itemSize(cushion);
    expect(clampPosition(cushion, { x: -500, y: 100 })).toEqual({ x: Math.round(w / 2), y: ROOM.floorMinY });
    expect(clampPosition(cushion, { x: 99999, y: 99999 })).toEqual({
      x: Math.round(ROOM.w - w / 2),
      y: ROOM.floorMaxY,
    });
  });

  it('keeps wall items on the wall', () => {
    const clock = { ...SLOT_BY_ID.clock.options[0], mount: 'wall' as const };
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
});
