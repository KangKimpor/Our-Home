import { describe, expect, it } from 'vitest';
import sprites from '../../src/game/sprites.json';
import {
  clampPosition,
  DEFAULT_SLOT_PLACEMENTS,
  DEFAULT_SLOT_SELECTIONS,
  depthOf,
  FURNITURE_SLOTS,
  itemSize,
  resolveSlotOption,
  resolveSlotPosition,
  resolveSlotSpot,
  ROOM,
  SLOT_BY_ID,
} from '../../src/game/layout';
import { isMovableSlotId, MOVABLE_SLOT_IDS, SLOT_CHOICES, SLOT_IDS, SLOT_PLACEMENTS } from '../../src/game/sharedHomeCore';

const EXPECTED = {
  sofa: {
    label: 'Sofa',
    pos: { x: 895, y: 735 },
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
    pos: { x: 895, y: 858 },
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
    pos: { x: 895, y: 836 },
    mount: 'floor',
    tap: 'bounce',
    default: 'oak',
    options: [
      ['oak', 'Honey oak', 'low_oak_coffee_table', 160],
      ['teal', 'Painted teal', 'teal_coffee_table', 160],
      ['walnut', 'Warm walnut', 'walnut_coffee_table', 160],
    ],
  },
  'reading-nook': {
    label: 'Reading nook',
    pos: { x: 1435, y: 588 },
    mount: 'floor',
    tap: 'bounce',
    default: 'window-bench',
    options: [
      ['window-bench', 'Window bench', 'window_bench_nook', 198],
      ['reading-chair', 'Reading chair', 'reading_nook_armchair', 205],
      ['floor-daybed', 'Floor daybed', 'daybed_reading_nook', 150],
      ['rattan-nook', 'Rattan nook', 'rattan_reading_chair', 210],
    ],
  },
  tv: {
    label: 'TV',
    pos: { x: 615, y: 582 },
    mount: 'floor',
    tap: 'tv',
    default: 'wood-console',
    options: [
      ['wood-console', 'Oak console TV', 'cottage_tv_console', 220],
      ['retro-tv', 'Retro wood TV', 'retro_wood_tv', 215],
      ['teal-media', 'Teal media TV', 'teal_media_tv', 220],
    ],
  },
  bookshelf: {
    label: 'Bookshelf',
    pos: { x: 1125, y: 578 },
    mount: 'floor',
    tap: 'bounce',
    default: 'oak',
    options: [
      ['oak', 'Oak bookshelf', 'arched_display_bookshelf', 340],
      ['sage', 'Sage bookshelf', 'sage_display_bookshelf', 340],
      ['walnut', 'Walnut shelf', 'walnut_display_bookshelf', 340],
    ],
  },
  cabinet: {
    label: 'Cabinet',
    pos: { x: 365, y: 582 },
    mount: 'floor',
    tap: 'bounce',
    default: 'apothecary',
    options: [
      ['apothecary', 'Seed cabinet', 'seed_drawer_cabinet', 210],
      ['sideboard', 'Teal sideboard', 'cottage_sideboard', 215],
      ['trellis', 'Flower trellis', 'flowering_trellis', 255],
    ],
  },
  armchair: {
    label: 'Cozy chair',
    pos: { x: 255, y: 830 },
    mount: 'floor',
    tap: 'bounce',
    default: 'wingback',
    options: [
      ['wingback', 'Sage wingback', 'sage_wingback_chair', 205],
      ['rocking', 'Oak rocker', 'cottage_rocking_chair', 208],
      ['tub', 'Plum armchair', 'plum_tub_armchair', 195],
    ],
  },
  'side-table': {
    label: 'Side table',
    pos: { x: 650, y: 738 },
    mount: 'floor',
    tap: 'bounce',
    default: 'oak-end',
    options: [
      ['oak-end', 'Tea end table', 'oak_end_table', 155],
      ['record-stand', 'Record stand', 'vinyl_record_stand', 162],
      ['candle-table', 'Candle table', 'candle_side_table', 158],
    ],
  },
  lamp: {
    label: 'Lamp',
    pos: { x: 1150, y: 738 },
    mount: 'floor',
    tap: 'lamp',
    default: 'globe',
    options: [
      ['globe', 'Globe lamp', 'standing_globe_floor_lamp', 280],
      ['reading', 'Table lamp', 'pedestal_reading_lamp', 248],
      ['lantern', 'Candle lantern', 'greenhouse_lantern', 175],
    ],
  },
  trolley: {
    label: 'Fireside',
    pos: { x: 1585, y: 738 },
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
    label: 'Plant',
    pos: { x: 215, y: 635 },
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
    pos: { x: 435, y: 838 },
    mount: 'floor',
    tap: 'bounce',
    default: 'pouf',
    options: [
      ['pouf', 'Patchwork pouf', 'patchwork_floor_cushion', 105],
      ['pet-basket', 'Woven pet bed', 'woven_pet_basket', 118],
      ['stool', 'Orchard stool', 'curved_orchard_stool', 128],
      ['ottoman', 'Knit ottoman', 'knit_ottoman', 112],
    ],
  },
  'accent-rug': {
    label: 'Accent rug',
    pos: { x: 1775, y: 710 },
    mount: 'rug',
    tap: 'bounce',
    default: 'hearth-mat',
    options: [
      ['hearth-mat', 'Hearth mat', 'hearth_braided_mat', 136],
      ['fleece', 'Cloud fleece', 'oat_fleece_rug', 140],
      ['botanical', 'Leaf runner', 'botanical_runner_rug', 145],
    ],
  },
  'hanging-decor': {
    label: 'Hanging decor',
    pos: { x: 262, y: 226 },
    mount: 'wall',
    tap: 'swing',
    default: 'terracotta-plant',
    options: [
      ['terracotta-plant', 'Hanging vine', 'hanging_terracotta_plant', 185],
      ['ivy-basket', 'Ivy basket', 'hanging_ivy_basket', 190],
      ['lantern', 'Hanging lantern', 'hanging_cottage_lantern', 185],
      ['dried-herbs', 'Dried herbs', 'hanging_dried_herbs', 185],
    ],
  },
  garland: {
    label: 'Garland',
    pos: { x: 890, y: 158 },
    mount: 'wall',
    tap: 'swing',
    default: 'vine',
    options: [
      ['vine', 'Leaf garland', 'ceiling_vine_garland', 115],
      ['lights', 'Fairy lights', 'ceiling_fairy_lights', 118],
      ['bunting', 'Fabric bunting', 'ceiling_fabric_bunting', 115],
      ['flowers', 'Flower swag', 'ceiling_flower_swag', 118],
    ],
  },
  pinboard: {
    label: 'Wall decor A',
    pos: { x: 455, y: 335 },
    mount: 'wall',
    tap: 'swing',
    default: 'pinboard',
    options: [
      ['pinboard', 'Photo board', 'wall_pinboard_trio', 175],
      ['painting', 'Hillside art', 'botanical_framed_art', 165],
      ['shelf', 'Wall shelf', 'wall_floating_shelf', 170],
      ['tapestry', 'Sun tapestry', 'botanical_wall_tapestry', 175],
    ],
  },
  clock: {
    label: 'Wall decor B',
    pos: { x: 890, y: 315 },
    mount: 'wall',
    tap: 'swing',
    default: 'clock',
    options: [
      ['clock', 'Wall clock', 'wall_clock', 145],
      ['mirror', 'Wreath mirror', 'cottage_oval_mirror', 165],
      ['macrame', 'Macramé', 'macrame_wall_hanging', 175],
      ['gallery', 'Gallery frames', 'cottage_gallery_frames', 165],
    ],
  },
} as const;

describe('living room furniture and decor catalog', () => {
  it('defines all 18 slots in order', () => {
    expect(FURNITURE_SLOTS.map((s) => s.id)).toEqual(Object.keys(EXPECTED));
    expect(FURNITURE_SLOTS).toHaveLength(18);
    expect(SLOT_IDS).toEqual(Object.keys(EXPECTED));
  });

  it('matches the catalog: labels, default positions, mounts, taps, defaults, sprites, and heights', () => {
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

  it('gives every lamp option a glow inside its sprite, and every TV option a screenGlow', () => {
    expect(SLOT_BY_ID.lamp.options.map((o) => o.glow)).toEqual([
      { x: 20, y: 33 },
      { x: 50, y: 24 },
      { x: 50, y: 58 },
    ]);
    for (const option of SLOT_BY_ID.tv.options) {
      expect(option.screenGlow).toBeDefined();
      const g = option.screenGlow!;
      expect(g.x).toBeGreaterThanOrEqual(0);
      expect(g.y).toBeGreaterThanOrEqual(0);
      expect(g.x + g.w).toBeLessThanOrEqual(100);
      expect(g.y + g.h).toBeLessThanOrEqual(100);
    }
    for (const slot of FURNITURE_SLOTS) {
      if (slot.id !== 'lamp') {
        for (const option of slot.options) expect(option.glow).toBeUndefined();
      }
      if (slot.id !== 'tv') {
        for (const option of slot.options) expect(option.screenGlow).toBeUndefined();
      }
    }
  });

  it('stays in lockstep with the shared-save choices and placements catalogs', () => {
    for (const slot of FURNITURE_SLOTS) {
      expect(SLOT_CHOICES[slot.id].defaultId).toBe(slot.defaultOptionId);
      expect([...SLOT_CHOICES[slot.id].optionIds]).toEqual(slot.options.map((o) => o.id));
      if (slot.spots) {
        expect(isMovableSlotId(slot.id)).toBe(true);
        if (isMovableSlotId(slot.id)) {
          expect(SLOT_PLACEMENTS[slot.id].defaultId).toBe(slot.defaultSpotId);
          expect([...SLOT_PLACEMENTS[slot.id].optionIds]).toEqual(slot.spots.map((s) => s.id));
        }
      } else {
        expect(isMovableSlotId(slot.id)).toBe(false);
      }
    }
    expect(Object.keys(DEFAULT_SLOT_PLACEMENTS)).toEqual(MOVABLE_SLOT_IDS);
  });

  it('has defaults for every slot and resolves placement positions cleanly', () => {
    expect(Object.keys(DEFAULT_SLOT_SELECTIONS)).toEqual(Object.keys(EXPECTED));
    for (const slot of FURNITURE_SLOTS) expect(DEFAULT_SLOT_SELECTIONS[slot.id]).toBe(slot.defaultOptionId);

    const tv = SLOT_BY_ID.tv;
    expect(resolveSlotSpot(tv)?.id).toBe('mid-left');
    expect(resolveSlotSpot(tv, 'left-wall')?.pos).toEqual({ x: 365, y: 582 });
    expect(resolveSlotPosition(tv, 'unknown')).toEqual(tv.pos);
    expect(resolveSlotSpot(SLOT_BY_ID.sofa)).toBeNull();
    expect(resolveSlotPosition(SLOT_BY_ID.sofa, 'left-wall')).toEqual(SLOT_BY_ID.sofa.pos);
  });

  it('resolves options and falls back to the slot default for unknown ids', () => {
    const sofa = SLOT_BY_ID.sofa;
    expect(resolveSlotOption(sofa, 'sage').sprite).toBe('sage_lounge_sofa');
    expect(resolveSlotOption(sofa, 'nope').id).toBe('teal');
    expect(resolveSlotOption(sofa).id).toBe('teal');
    expect(resolveSlotOption(SLOT_BY_ID.rug, 'tassel').height).toBe(245);
  });

  it('keeps every option of every slot inside the room across every valid placement spot', () => {
    for (const slot of FURNITURE_SLOTS) {
      const spots = slot.spots ?? [{ id: 'fixed', label: 'Fixed', pos: slot.pos }];
      for (const spot of spots) {
        for (const option of slot.options) {
          const { w, h } = itemSize(option);
          const tag = `${slot.id}/${option.id}@${spot.id}`;
          expect(spot.pos.x - w / 2, tag).toBeGreaterThanOrEqual(0);
          expect(spot.pos.x + w / 2, tag).toBeLessThanOrEqual(ROOM.w);
          expect(spot.pos.y - h, tag).toBeGreaterThanOrEqual(0);
          expect(spot.pos.y, tag).toBeLessThanOrEqual(ROOM.h);
        }
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
