import { describe, expect, it } from 'vitest';
import { BALANCE } from '../../src/config/balance';
import { VISITORS_BY_ID, visitorWeight } from '../../src/data/visitors';
import { createInitialState } from '../../src/game/initialState';
import { createRng, seededRng } from '../../src/game/rng';
import { bubbleValue, simulateOffline, simulateTick } from '../../src/game/systems/simulate';

const AT = new Date(2026, 10, 11, 10, 0, 0).getTime();

describe('economy tick & pet bubbles', () => {
  it('scales bubble value from 1 to 3 based on happiness', () => {
    expect(bubbleValue(20)).toBe(1);
    expect(bubbleValue(55)).toBe(2);
    expect(bubbleValue(85)).toBe(3);
  });

  it('spawns a heart bubble when pet nextBubbleAt is reached and enforces max 1 bubble per pet', () => {
    const initial = createInitialState(AT);
    const petId = initial.pets[0].id;
    const rng = createRng(42);

    const step1 = simulateTick(initial, AT + 4 * 60_000, rng);
    const petBubbles1 = step1.bubbles.filter((b) => b.sourceType === 'pet' && b.sourceId === petId);
    expect(petBubbles1).toHaveLength(1);
    expect(petBubbles1[0].value).toBeGreaterThanOrEqual(1);
    expect(petBubbles1[0].value).toBeLessThanOrEqual(3);

    // Tick again past the next bubble interval without collecting the existing bubble
    const step2 = simulateTick(step1, AT + 15 * 60_000, rng);
    const petBubbles2 = step2.bubbles.filter((b) => b.sourceType === 'pet' && b.sourceId === petId);
    expect(petBubbles2).toHaveLength(1);
  });

  it('never decays pet happiness below BALANCE.happinessMin (20)', () => {
    const initial = createInitialState(AT);
    const rng = createRng(99);
    const result = simulateOffline(initial, AT + 48 * 3_600_000, rng);
    expect(result.state.pets[0].happiness).toBeGreaterThanOrEqual(BALANCE.happinessMin);
  });
});

describe('offline accrual', () => {
  it('caps offline simulation at 8 hours and queues at most 1 bubble per pet', () => {
    const initial = createInitialState(AT);
    const rng = seededRng('offline-cap-seed');
    const twentyFourHours = 24 * 3_600_000;
    const { state, elapsed } = simulateOffline(initial, AT + twentyFourHours, rng);

    expect(elapsed).toBe(BALANCE.offlineCap);
    expect(state.lastSeenAt).toBe(AT + twentyFourHours);

    for (const pet of state.pets) {
      const queued = state.bubbles.filter((b) => b.sourceType === 'pet' && b.sourceId === pet.id);
      expect(queued.length).toBeLessThanOrEqual(1);
    }
  });

  it('spawns deterministic visitors with a seeded RNG and respects maxSimultaneousVisitors', () => {
    const initial = createInitialState(AT);
    const runA = simulateOffline(initial, AT + 4 * 3_600_000, seededRng('visitor-seed-1')).state;
    const runB = simulateOffline(initial, AT + 4 * 3_600_000, seededRng('visitor-seed-1')).state;

    expect(Object.keys(runA.visitors.discovered).length).toBeGreaterThan(0);
    expect(Object.keys(runA.visitors.discovered)).toEqual(Object.keys(runB.visitors.discovered));
    expect(runA.visitors.active.length).toBeLessThanOrEqual(BALANCE.maxVisitors);
  });
});

describe('visitor spawn weighting', () => {
  it('weights visitors higher in their preferred rooms', () => {
    const tilly = VISITORS_BY_ID['tilly'];
    const farmWeight = visitorWeight(tilly, ['water', 'nature'], 'farm');
    const studioWeight = visitorWeight(tilly, ['art', 'window'], 'studio');
    expect(farmWeight).toBeGreaterThan(studioWeight);
  });
});
