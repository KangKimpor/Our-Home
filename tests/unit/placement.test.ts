import { describe, expect, it } from 'vitest';
import { STAGE } from '../../src/config/balance';
import { ITEMS_BY_ID } from '../../src/data/items';
import { ROOMS } from '../../src/data/rooms';
import { createInitialState } from '../../src/game/initialState';
import {
  availableCount,
  checkPlacement,
  findFreeSpot,
  hostTopY,
  isFlatItem,
  itemSize,
  placedRect,
} from '../../src/game/placement';

const AT = new Date(2026, 4, 12, 12, 0, 0).getTime();

function fresh() {
  return createInitialState(AT);
}

describe('item sizing', () => {
  it('derives height from the art aspect ratio', () => {
    const size = itemSize('living.sofa.sage');
    expect(size.w).toBe(340);
    expect(size.h).toBeGreaterThan(0);
    expect(placedRect({ uid: 'a', itemId: 'living.sofa.sage', roomId: 'living', x: 500, y: 800, flip: false })).toEqual({
      left: 500 - size.w / 2,
      right: 500 + size.w / 2,
      top: 800 - size.h,
      bottom: 800,
    });
  });

  it('knows which arts lie flat on the floor', () => {
    expect(isFlatItem('living.rug.oval')).toBe(true);
    expect(isFlatItem('living.sofa.sage')).toBe(false);
    expect(isFlatItem('nope')).toBe(false);
  });
});

describe('available copies', () => {
  it('counts owned items that are not placed', () => {
    const state = fresh();
    const owned = state.inventory['living.fern'] ?? 0;
    const placed = state.placed.filter((p) => p.itemId === 'living.fern').length;
    expect(availableCount(state, 'living.fern')).toBe(Math.max(0, owned - placed));
  });

  it('never goes below zero', () => {
    const state = fresh();
    state.inventory['living.rug.sunset'] = 0;
    expect(availableCount(state, 'living.rug.sunset')).toBe(0);
  });
});

describe('checkPlacement', () => {
  it('refuses rooms that are still locked', () => {
    const state = fresh();
    const check = checkPlacement(state, 'studio', 'living.fern', 900, 800);
    expect(check.issue).toBe('locked');
  });

  it('accepts a free floor spot in an unlocked room', () => {
    const state = fresh();
    const check = checkPlacement(state, 'living', 'living.fern', 192, 704);
    expect(check.issue).toBe('ok');
    expect(check.x % 64).toBe(0);
    expect(check.y).toBeGreaterThanOrEqual(ROOMS.living.floorTop);
  });

  it('keeps a clamped item inside the stage', () => {
    const state = fresh();
    const size = itemSize('living.fern');
    const check = checkPlacement(state, 'living', 'living.fern', -9999, 900);
    expect(check.issue).not.toBe('out-of-bounds');
    expect(check.x - size.w / 2).toBeGreaterThanOrEqual(16);
    expect(check.x + size.w / 2).toBeLessThanOrEqual(STAGE.width - 16);
  });

  it('blocks furniture that overlaps other furniture', () => {
    const state = fresh();
    expect(checkPlacement(state, 'living', 'living.fern', 720, 792).issue).toBe('blocked');
  });

  it('lets a rug lie under furniture', () => {
    const state = fresh();
    expect(checkPlacement(state, 'living', 'living.rug.sunset', 720, 872).issue).toBe('ok');
  });

  it('needs a host surface for small things', () => {
    const state = fresh();
    const check = checkPlacement(state, 'living', 'living.vase', 760, 850);
    expect(check.issue).toBe('ok');
    expect(check.hostUid).toBeTruthy();
  });

  it('does not stack two things on one host', () => {
    const state = fresh();
    const occupied = checkPlacement(state, 'living', 'living.vase', 1350, 780);
    expect(occupied.issue).toBe('no-surface');
  });

  it('anchors a surface item to the top of its host', () => {
    const state = fresh();
    const host = state.placed.find((p) => p.itemId === 'living.tvCabinet');
    expect(host).toBeTruthy();
    if (!host) return;
    expect(hostTopY(host)).toBeLessThan(host.y);
  });
});

describe('findFreeSpot', () => {
  it('finds a free host for a surface item', () => {
    const state = fresh();
    const spot = findFreeSpot(state, 'living', 'living.vase');
    expect(spot).not.toBeNull();
    expect(spot?.hostUid).toBeTruthy();
  });

  it('finds floor space for new furniture', () => {
    const state = fresh();
    const item = ITEMS_BY_ID['living.diningChair'];
    const spot = findFreeSpot(state, 'living', item.id);
    expect(spot).not.toBeNull();
    if (!spot) return;
    expect(checkPlacement(state, 'living', item.id, spot.x, spot.y).issue).toBe('ok');
  });
});
