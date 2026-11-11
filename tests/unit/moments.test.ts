import { describe, expect, it } from 'vitest';
import { MOMENTS } from '../../src/data/moments';
import { createInitialState } from '../../src/game/initialState';
import { applyMomentTriggers, awardMoment } from '../../src/game/systems/moments';

const AT = new Date(2026, 10, 11, 10, 0, 0).getTime();

describe('moments album', () => {
  it('defines 20 original moments', () => {
    expect(MOMENTS).toHaveLength(20);
  });

  it('saves non-repeatable moments once per id and increments count for repeatable moments', () => {
    let state = createInitialState(AT);

    // firstBuy is non-repeatable
    state = awardMoment(state, 'firstBuy', AT + 1000);
    expect(state.moments['firstBuy']).toEqual({ firstAt: AT + 1000, count: 1 });
    state = awardMoment(state, 'firstBuy', AT + 5000);
    expect(state.moments['firstBuy']).toEqual({ firstAt: AT + 1000, count: 1 });

    // sofaNap is repeatable: one card per Moment id, with a counter of how many times it happened
    state = awardMoment(state, 'sofaNap', AT + 2000);
    expect(state.moments['sofaNap']).toEqual({ firstAt: AT + 2000, count: 1 });
    state = awardMoment(state, 'sofaNap', AT + 9000);
    expect(state.moments['sofaNap']).toEqual({ firstAt: AT + 2000, count: 2 });
  });

  it('auto-triggers moments from pet and household conditions', () => {
    const state = createInitialState(AT);
    state.pets[0].roomId = 'bathroom';
    state.pets[0].state = 'sleep';
    state.rooms.nursery.unlocked = true;
    state.settings.showBaby = true;

    const { state: next, newMoments } = applyMomentTriggers(state, AT + 3000);
    expect(newMoments).toContain('sinkCat');
    expect(newMoments).toContain('laundry');
    expect(newMoments).toContain('babyFirst');
    expect(next.moments['sinkCat']?.count).toBe(1);
    expect(next.moments['babyFirst']?.count).toBe(1);
  });
});
