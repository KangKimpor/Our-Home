import { SAVE } from '../config/balance';
import type { GameState } from '../game/types';
import { isGameState } from './schema';

type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

/**
 * Append-only migrations, keyed by the version they upgrade FROM.
 * A v0 save is the pre-release shape used by early builds.
 */
const MIGRATIONS: Record<number, Migration> = {
  0: (state) => {
    const next: Record<string, unknown> = { ...state, version: 1 };
    next.settings = {
      music: 0.35,
      sfx: 0.6,
      showBaby: false,
      textSize: 'm',
      ...(typeof state.settings === 'object' && state.settings ? state.settings : {}),
      lang: 'en',
    };
    next.critters = typeof state.critters === 'object' && state.critters ? state.critters : {};
    next.events = typeof state.events === 'object' && state.events ? state.events : {};
    next.stats = {
      taps: 0,
      heartsEarned: 0,
      playSeconds: 0,
      bought: 0,
      harvested: 0,
      cooked: 0,
      visitorsMet: 0,
      ...(typeof state.stats === 'object' && state.stats ? state.stats : {}),
    };
    if (Array.isArray(next.pets)) {
      next.pets = next.pets.map((pet) => ({
        ...(pet as Record<string, unknown>),
        state: (pet as Record<string, unknown>).state ?? 'idle',
        stateUntil: (pet as Record<string, unknown>).stateUntil ?? Date.now(),
        x: (pet as Record<string, unknown>).x ?? 960,
        y: (pet as Record<string, unknown>).y ?? 760,
      }));
    }
    return next;
  },
};

export function migrateState(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') throw new Error('Save data is not an object');
  let state = raw as Record<string, unknown>;
  let version = typeof state.version === 'number' ? state.version : 0;
  if (version > SAVE.version) {
    throw new Error(`Save was made by a newer version (v${version})`);
  }
  let guard = 0;
  while (version < SAVE.version) {
    const migration = MIGRATIONS[version];
    if (!migration) throw new Error(`No migration from save version ${version}`);
    state = migration(state);
    version = typeof state.version === 'number' ? state.version : version + 1;
    guard += 1;
    if (guard > 50) throw new Error('Migration loop detected');
  }
  if (!isGameState(state)) throw new Error('Save data is invalid after migration');
  return state;
}

export { MIGRATIONS };
