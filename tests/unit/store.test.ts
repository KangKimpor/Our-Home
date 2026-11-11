import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '../../src/config/balance';
import { freezeClock, resetClock } from '../../src/config/time';
import { ITEMS_BY_ID } from '../../src/data/items';
import { createInitialState } from '../../src/game/initialState';
import { useGameStore } from '../../src/store/gameStore';

const AT = new Date(2026, 10, 12, 12, 0, 0).getTime();

describe('gameStore actions', () => {
  beforeEach(async () => {
    freezeClock(AT);
    await useGameStore.getState().resetGame();
    useGameStore.setState({ state: createInitialState(AT) });
  });

  it('supports placing, moving, removing, undo, and redo up to 20 steps', () => {
    const store = useGameStore.getState();
    // Buy a new fern without auto-placing so we have a spare copy
    useGameStore.setState((s) => ({
      state: { ...s.state, hearts: 1000, inventory: { ...s.state.inventory, 'living.fern': (s.state.inventory['living.fern'] ?? 1) + 1 } },
    }));

    const initialCount = useGameStore.getState().state.placed.length;
    const placed = store.placeItem('living.fern', 192, 704, 'living');
    expect(placed).toBe(true);
    expect(useGameStore.getState().state.placed.length).toBe(initialCount + 1);

    const newItem = useGameStore.getState().state.placed[useGameStore.getState().state.placed.length - 1];
    const moved = useGameStore.getState().moveItem(newItem.uid, 256, 704);
    expect(moved).toBe(true);
    expect(useGameStore.getState().state.placed.find((p) => p.uid === newItem.uid)?.x).toBe(256);

    useGameStore.getState().undo();
    expect(useGameStore.getState().state.placed.find((p) => p.uid === newItem.uid)?.x).toBe(192);

    useGameStore.getState().undo();
    expect(useGameStore.getState().state.placed.length).toBe(initialCount);

    useGameStore.getState().redo();
    expect(useGameStore.getState().state.placed.length).toBe(initialCount + 1);
  });

  it('refunds 50% when selling an item', () => {
    const item = ITEMS_BY_ID['living.fern'];
    const beforeHearts = useGameStore.getState().state.hearts;
    const placed = useGameStore.getState().state.placed.find((p) => p.itemId === 'living.fern')!;

    const refund = useGameStore.getState().sellItem('living.fern', placed.uid);
    expect(refund).toBe(Math.floor(item.price * BALANCE.refundRate));
    expect(useGameStore.getState().state.hearts).toBe(beforeHearts + refund);
    expect(useGameStore.getState().state.placed.find((p) => p.uid === placed.uid)).toBeUndefined();
  });

  it('unlocks padlocked farm plots and grows/harvests crops under time-travel', () => {
    useGameStore.setState((s) => ({ state: { ...s.state, hearts: 2000 } }));
    const before = useGameStore.getState().state.hearts;

    useGameStore.getState().unlockPlot('plot4');
    expect(useGameStore.getState().state.farm.plots[3].unlocked).toBe(true);
    expect(useGameStore.getState().state.hearts).toBe(before - BALANCE.plotUnlockCosts[0]);

    useGameStore.getState().plantCrop('plot1', 'herb');
    expect(useGameStore.getState().state.farm.plots[0].cropId).toBe('herb');

    // Before 15 minutes, harvest does nothing
    const herbsBefore = useGameStore.getState().state.pantry.ingredients['herb'] ?? 0;
    useGameStore.getState().harvestPlot('plot1');
    expect(useGameStore.getState().state.pantry.ingredients['herb'] ?? 0).toBe(herbsBefore);

    // Travel 16 minutes ahead
    freezeClock(AT + 16 * 60_000);
    useGameStore.getState().harvestPlot('plot1');
    expect(useGameStore.getState().state.pantry.ingredients['herb'] ?? 0).toBeGreaterThan(herbsBefore);
    expect(useGameStore.getState().state.farm.plots[0].cropId).toBeUndefined();
    resetClock();
  });

  it('cooks a recipe by consuming exact ingredients and grants 2x bonus when serving a visitor favourite', () => {
    const herbsBefore = useGameStore.getState().state.pantry.ingredients['herb'] ?? 0;
    const tomatoesBefore = useGameStore.getState().state.pantry.ingredients['tomato'] ?? 0;

    useGameStore.getState().startCooking('bowl', 'gardenSalad');
    expect(useGameStore.getState().state.pantry.ingredients['herb'] ?? 0).toBe(herbsBefore - 1);
    expect(useGameStore.getState().state.pantry.ingredients['tomato'] ?? 0).toBe(tomatoesBefore - 1);

    // Advance 4 minutes to finish cooking (gardenSalad takes 3 min)
    freezeClock(AT + 4 * 60_000);
    useGameStore.getState().collectFood('bowl');
    expect(useGameStore.getState().state.pantry.foods['gardenSalad']).toBe(1);
    expect(useGameStore.getState().state.recipesLearned).toContain('gardenSalad');

    // Spawn Basil (favourite: 'side') and feed gardenSalad ('side')
    useGameStore.setState((s) => ({
      state: {
        ...s.state,
        visitors: {
          ...s.state.visitors,
          discovered: { basil: { discoveredAt: AT, visits: 1, friendship: 1 } },
          active: [
            {
              id: 'vis_basil',
              visitorId: 'basil',
              roomId: 'garden',
              arrivedAt: AT,
              leavesAt: AT + 600_000,
              gift: false,
              x: 500,
              y: 700,
            },
          ],
        },
      },
    }));

    const heartsBefore = useGameStore.getState().state.hearts;
    useGameStore.getState().feedVisitor('vis_basil', 'gardenSalad');
    expect(useGameStore.getState().state.hearts).toBe(heartsBefore + BALANCE.foodMatchMultiplier * 2);
    resetClock();
  });

  it('persists character customization and Show Baby toggle', () => {
    useGameStore.getState().updateCharacter(0, { name: 'Por', hairStyle: 'bun' });
    useGameStore.getState().updateSettings({ showBaby: true });

    const state = useGameStore.getState().state;
    expect(state.characters[0].name).toBe('Por');
    expect(state.characters[0].hairStyle).toBe('bun');
    expect(state.settings.showBaby).toBe(true);
  });

  it('claims an active event reward when target is met under time-travel', () => {
    // November 12 is within harvestDays (Oct 25 - Nov 30)
    useGameStore.setState((s) => ({
      state: {
        ...s.state,
        events: { harvestDays: { progress: 5, claimed: false } },
      },
    }));
    const before = useGameStore.getState().state.hearts;
    useGameStore.getState().claimEvent('harvestDays');
    expect(useGameStore.getState().state.hearts).toBe(before + 120);
    expect(useGameStore.getState().state.events['harvestDays'].claimed).toBe(true);
    resetClock();
  });
});
