import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../../src/game/characters';
import {
  applySharedHomePatch,
  createDefaultHomeState,
  isSameHomeChoices,
  LEGACY_OUTFITS_KEY,
  loadCachedHomeState,
  resolvePlacementMove,
  sanitizeSharedHomePatch,
  sanitizeSharedHomeState,
  saveCachedHomeState,
  STORAGE_KEY,
  type SharedHomePatch,
  type SharedHomeState,
} from '../../src/game/homeState';
import { createHomeSync, mergePatches, type HomeSyncApi } from '../../src/game/homeSync';
import { DEFAULT_SLOT_PLACEMENTS, DEFAULT_SLOT_SELECTIONS, FURNITURE_SLOTS } from '../../src/game/layout';
import {
  applyHomeStateRequest,
  MOVABLE_SLOT_IDS,
  OUTFIT_CHOICES,
  parseHomeStateRequest,
  PLACEMENT_GROUPS,
  SHARED_SAVE_KEY,
} from '../../src/game/sharedHomeCore';

function memoryStorage(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

const NOW = new Date('2026-11-27T10:00:00.000Z');

describe('shared home state defaults', () => {
  it('starts with all 18 slot defaults, 14 placements, the hedgehog, default outfits, and lamp+TV on', () => {
    const s = createDefaultHomeState();
    expect(s.slots).toEqual({ ...DEFAULT_SLOT_SELECTIONS });
    expect(Object.keys(s.slots)).toHaveLength(18);
    expect(s.placements).toEqual({ ...DEFAULT_SLOT_PLACEMENTS });
    expect(Object.keys(s.placements)).toHaveLength(14);
    expect(s.pet).toBe('hedgehog');
    expect(s.outfits).toEqual({ her: 'dress', him: 'casual' });
    expect(s.lampOn).toBe(true);
    expect(s.tvOn).toBe(true);
    expect(s.revision).toBe(0);
    expect(Number.isFinite(Date.parse(s.updatedAt))).toBe(true);
  });

  it('uses one fixed save key everywhere', () => {
    expect(STORAGE_KEY).toBe('our-home:shared-save:v1');
    expect(SHARED_SAVE_KEY).toBe(STORAGE_KEY);
  });

  it('outfit catalog matches the characters', () => {
    for (const def of CHARACTERS) {
      expect([...OUTFIT_CHOICES[def.id].optionIds]).toEqual(def.outfits.map((o) => o.id));
      expect(OUTFIT_CHOICES[def.id].defaultId).toBe(def.outfits[0].id);
    }
  });
});

describe('sanitizeSharedHomeState', () => {
  it('returns defaults for garbage', () => {
    for (const junk of [null, undefined, 42, 'room', [], true]) {
      expect(sanitizeSharedHomeState(junk)).toEqual(createDefaultHomeState());
    }
  });

  it('keeps valid fields and drops malformed, unknown, or out-of-catalog values', () => {
    const s = sanitizeSharedHomeState({
      slots: { sofa: 'sage', rug: 'lava', lamp: 7, bogus: 'x', clock: 'mirror', tv: 'retro-tv' },
      placements: { tv: 'left-wall', sofa: 'moon', 'accent-rug': 'nook' },
      pet: 'dragon',
      outfits: { her: 'badminton', him: 'tuxedo' },
      lampOn: 'yes',
      tvOn: false,
      revision: -4,
      updatedAt: 'not a date',
      extra: { evil: true },
    });
    expect(s.slots.sofa).toBe('sage');
    expect(s.slots.clock).toBe('mirror');
    expect(s.slots.tv).toBe('retro-tv');
    expect(s.slots.rug).toBe('terracotta');
    expect(s.slots.lamp).toBe('globe');
    expect(s.slots).not.toHaveProperty('bogus');
    expect(s.placements.tv).toBe('left-wall');
    expect(s.placements.cabinet).not.toBe('left-wall');
    expect(s.placements['accent-rug']).toBe('nook');
    expect(s.placements).not.toHaveProperty('sofa');
    expect(s.pet).toBe('hedgehog');
    expect(s.outfits).toEqual({ her: 'badminton', him: 'casual' });
    expect(s.lampOn).toBe(true);
    expect(s.tvOn).toBe(false);
    expect(s.revision).toBe(0);
    expect(s).not.toHaveProperty('extra');
  });

  it('deduplicates colliding peers in the same placement group', () => {
    const s = sanitizeSharedHomeState({
      placements: {
        tv: 'left-wall',
        cabinet: 'left-wall',
        bookshelf: 'left-wall',
      },
    });
    const used = new Set([s.placements.tv, s.placements.cabinet, s.placements.bookshelf]);
    expect(used.size).toBe(3);
  });

  it('keeps revision and timestamp when valid', () => {
    const s = sanitizeSharedHomeState({
      revision: 12.7,
      updatedAt: NOW.toISOString(),
      lampOn: false,
      tvOn: false,
      pet: 'frog',
    });
    expect(s).toMatchObject({
      revision: 12,
      updatedAt: NOW.toISOString(),
      lampOn: false,
      tvOn: false,
      pet: 'frog',
    });
  });

  it('sanitizes patches down to valid known fields', () => {
    expect(sanitizeSharedHomePatch('x')).toEqual({});
    expect(
      sanitizeSharedHomePatch({
        slots: { sofa: 'oat', rug: 'nope', evil: 'x' },
        placements: { tv: 'left-wall', sofa: 'left-wall', lamp: 'mars' },
        pet: 'cat',
        lampOn: false,
        tvOn: false,
        outfits: { him: 'x' },
      }),
    ).toEqual({
      slots: { sofa: 'oat' },
      placements: { tv: 'left-wall' },
      lampOn: false,
      tvOn: false,
    });
  });
});

describe('placement logic', () => {
  it('moves solo movable slots freely without touching peers', () => {
    const base = createDefaultHomeState().placements;
    expect(resolvePlacementMove(base, 'accent-rug', 'nook')).toEqual({ 'accent-rug': 'nook' });
    expect(resolvePlacementMove(base, 'hanging-decor', 'beam-window')).toEqual({
      'hanging-decor': 'beam-window',
    });
    expect(resolvePlacementMove(base, 'garland', 'window-beam')).toEqual({ garland: 'window-beam' });
  });

  it('swaps cleanly with a peer that already occupies the target spot', () => {
    const base = createDefaultHomeState().placements;
    expect(resolvePlacementMove(base, 'tv', 'left-wall')).toEqual({
      tv: 'left-wall',
      cabinet: 'mid-left',
    });
    expect(resolvePlacementMove(base, 'armchair', 'front-left')).toEqual({
      armchair: 'front-left',
      cushion: 'door-side',
    });
    expect(resolvePlacementMove(base, 'pinboard', 'wall-center')).toEqual({
      pinboard: 'wall-center',
      clock: 'wall-left',
    });
  });

  it('shifts a peer to an open valid spot when the source spot does not fit the peer', () => {
    const base = createDefaultHomeState().placements;
    // tree is at 'door-corner' (not valid for trolley); moving tree onto trolley's 'fireside-left' shifts trolley to 'right-of-rug'.
    expect(resolvePlacementMove(base, 'tree', 'fireside-left')).toEqual({
      tree: 'fireside-left',
      trolley: 'right-of-rug',
    });
  });

  it('returns an empty patch for fixed slots, unknown spots, or no-op moves', () => {
    const base = createDefaultHomeState().placements;
    expect(resolvePlacementMove(base, 'sofa', 'left-wall')).toEqual({});
    expect(resolvePlacementMove(base, 'tv', 'mars')).toEqual({});
    expect(resolvePlacementMove(base, 'tv', base.tv)).toEqual({});
  });

  it('never leaves two peers in the same group on the same spot across any patch', () => {
    let state = createDefaultHomeState();
    state = applySharedHomePatch(state, { placements: { tv: 'left-wall' } }, NOW);
    for (const group of PLACEMENT_GROUPS) {
      const spots = group.map((id) => state.placements[id]);
      expect(new Set(spots).size).toBe(group.length);
    }
    expect(Object.keys(state.placements)).toEqual(MOVABLE_SLOT_IDS);
  });
});

describe('applySharedHomePatch', () => {
  it('merges only the fields in the patch and bumps the revision', () => {
    const base = createDefaultHomeState();
    const next = applySharedHomePatch(base, { slots: { sofa: 'sage' }, tvOn: false }, NOW);
    expect(next.slots).toEqual({ ...base.slots, sofa: 'sage' });
    expect(next.tvOn).toBe(false);
    expect(next.pet).toBe(base.pet);
    expect(next.revision).toBe(1);
    expect(next.updatedAt).toBe(NOW.toISOString());
    expect(base.slots.sofa).toBe('teal'); // never mutates its input
  });

  it('concurrent slot, placement, outfit, pet, lamp, and TV patches never overwrite each other', () => {
    const patches: SharedHomePatch[] = [
      { slots: { sofa: 'sage' } }, // partner A
      { outfits: { her: 'badminton' } }, // partner B
      { slots: { rug: 'plum' }, placements: { 'accent-rug': 'nook' } }, // partner A
      { lampOn: false, tvOn: false }, // partner B
      { pet: 'tortoise' },
    ];
    const final = patches.reduce<SharedHomeState>(
      (s, p) => applySharedHomePatch(s, p, NOW),
      createDefaultHomeState(),
    );
    expect(final.slots.sofa).toBe('sage');
    expect(final.slots.rug).toBe('plum');
    expect(final.placements['accent-rug']).toBe('nook');
    expect(final.outfits).toEqual({ her: 'badminton', him: 'casual' });
    expect(final.lampOn).toBe(false);
    expect(final.tvOn).toBe(false);
    expect(final.pet).toBe('tortoise');
    expect(final.revision).toBe(5);
  });

  it('ignores invalid values inside a patch', () => {
    const next = applySharedHomePatch(
      createDefaultHomeState(),
      { slots: { sofa: 'lava' }, placements: { tv: 'moon' }, pet: 'dragon' },
      NOW,
    );
    expect(next.slots.sofa).toBe('teal');
    expect(next.placements.tv).toBe('mid-left');
    expect(next.pet).toBe('hedgehog');
  });

  it('compares choices ignoring revision and timestamp', () => {
    const a = createDefaultHomeState();
    expect(isSameHomeChoices(a, { ...a, revision: 99, updatedAt: NOW.toISOString() })).toBe(true);
    expect(isSameHomeChoices(a, applySharedHomePatch(a, { slots: { clock: 'macrame' } }))).toBe(false);
    expect(isSameHomeChoices(a, applySharedHomePatch(a, { placements: { garland: 'window-beam' } }))).toBe(
      false,
    );
    expect(isSameHomeChoices(a, applySharedHomePatch(a, { lampOn: false }))).toBe(false);
    expect(isSameHomeChoices(a, applySharedHomePatch(a, { tvOn: false }))).toBe(false);
    expect(isSameHomeChoices(a, applySharedHomePatch(a, { outfits: { her: 'badminton' } }))).toBe(false);
  });
});

describe('PUT request parsing', () => {
  it('accepts { patch } only and rejects reset payloads', () => {
    expect(parseHomeStateRequest({ patch: { pet: 'frog', tvOn: false, junk: 1 } })).toEqual({
      kind: 'patch',
      patch: { pet: 'frog', tvOn: false },
    });
    expect(parseHomeStateRequest({ reset: true }).kind).toBe('invalid');
    expect(parseHomeStateRequest({ reset: 'yes' }).kind).toBe('invalid');
    expect(parseHomeStateRequest(null).kind).toBe('invalid');
    expect(parseHomeStateRequest([]).kind).toBe('invalid');
  });

  it('applies patch requests to the current state', () => {
    const patched = applyHomeStateRequest(
      createDefaultHomeState(),
      { kind: 'patch', patch: { pet: 'frog', tvOn: false } },
      NOW,
    );
    expect(patched).toMatchObject({ pet: 'frog', tvOn: false, revision: 1 });
  });
});

describe('local cache mirror', () => {
  it('round-trips the shared save', () => {
    const storage = memoryStorage();
    const state = applySharedHomePatch(
      createDefaultHomeState(),
      { slots: { tree: 'monstera' }, placements: { 'accent-rug': 'nook' }, pet: 'frog', tvOn: false },
      NOW,
    );
    saveCachedHomeState(storage, state);
    expect(JSON.parse(storage.data[STORAGE_KEY])).toEqual(state);
    expect(loadCachedHomeState(storage)).toEqual(state);
  });

  it('falls back to defaults for missing, corrupt, or no storage', () => {
    expect(loadCachedHomeState(undefined)).toEqual(createDefaultHomeState());
    expect(loadCachedHomeState(memoryStorage())).toEqual(createDefaultHomeState());
    expect(loadCachedHomeState(memoryStorage({ [STORAGE_KEY]: '{oops' }))).toEqual(createDefaultHomeState());
    expect(() => saveCachedHomeState(undefined, createDefaultHomeState())).not.toThrow();
  });

  it('migrates legacy outfit picks when no shared save exists yet', () => {
    const storage = memoryStorage({
      [LEGACY_OUTFITS_KEY]: JSON.stringify({ her: 'badminton', him: 'nope' }),
    });
    const s = loadCachedHomeState(storage);
    expect(s.outfits).toEqual({ her: 'badminton', him: 'casual' });
    expect(s.slots).toEqual({ ...DEFAULT_SLOT_SELECTIONS });
  });

  it('prefers the shared save over legacy outfits', () => {
    const shared = applySharedHomePatch(
      createDefaultHomeState(),
      { outfits: { her: 'dress' }, pet: 'tortoise' },
      NOW,
    );
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify(shared),
      [LEGACY_OUTFITS_KEY]: JSON.stringify({ her: 'badminton' }),
    });
    expect(loadCachedHomeState(storage)).toMatchObject({ pet: 'tortoise', outfits: { her: 'dress' } });
  });
});

/** In-memory server with controllable latency for sync-engine tests. */
function fakeServer() {
  let server: SharedHomeState = createDefaultHomeState();
  const gates: Array<() => void> = [];
  let manual = false;
  const log: string[] = [];
  const wait = () => (manual ? new Promise<void>((resolve) => gates.push(resolve)) : Promise.resolve());
  const api: HomeSyncApi = {
    fetch: async () => {
      const snapshot = server;
      await wait();
      return { state: snapshot, backend: 'memory' };
    },
    patch: async (patch) => {
      await wait();
      log.push(JSON.stringify(patch));
      server = applySharedHomePatch(server, patch);
      return { state: server, backend: 'memory' };
    },
  };
  return {
    api,
    log,
    get state() {
      return server;
    },
    set state(s: SharedHomeState) {
      server = s;
    },
    hold() {
      manual = true;
    },
    release() {
      manual = false;
      while (gates.length) gates.shift()!();
    },
  };
}

describe('client sync engine', () => {
  it('applies changes optimistically, writes them in order, then adopts the server revision', async () => {
    const srv = fakeServer();
    const storage = memoryStorage();
    const seen: SharedHomeState[] = [];
    const sync = createHomeSync({ storage, api: srv.api, onChange: (s) => seen.push(s) });

    sync.update({ slots: { sofa: 'terracotta' } });
    sync.update({ slots: { sofa: 'sage' } });
    sync.update({ lampOn: false, tvOn: false });
    expect(sync.getState().slots.sofa).toBe('sage'); // instant
    expect(JSON.parse(storage.data[STORAGE_KEY]).tvOn).toBe(false); // cached instantly

    await sync.flush();
    expect(srv.log).toEqual([
      JSON.stringify({ slots: { sofa: 'terracotta' } }),
      JSON.stringify({ slots: { sofa: 'sage' } }),
      JSON.stringify({ lampOn: false, tvOn: false }),
    ]);
    expect(srv.state.slots.sofa).toBe('sage');
    expect(srv.state.tvOn).toBe(false);
    expect(sync.getState().revision).toBe(srv.state.revision);
    expect(seen.length).toBeGreaterThanOrEqual(3);
  });

  it('never lets a stale pull overwrite a newer local change', async () => {
    const srv = fakeServer();
    const sync = createHomeSync({ api: srv.api });
    srv.hold();
    const pulling = sync.pull(); // snapshot: default teal sofa
    sync.update({ slots: { sofa: 'oat' } });
    srv.release();
    await pulling;
    await sync.flush();
    expect(sync.getState().slots.sofa).toBe('oat');
    expect(srv.state.slots.sofa).toBe('oat');
  });

  it('adopts a partner’s change on pull when nothing is in flight', async () => {
    const srv = fakeServer();
    const sync = createHomeSync({ api: srv.api });
    srv.state = applySharedHomePatch(srv.state, {
      slots: { rug: 'plum' },
      placements: { garland: 'window-beam' },
      pet: 'frog',
    });
    await sync.pull();
    expect(sync.getState()).toMatchObject({
      pet: 'frog',
      slots: { rug: 'plum' },
      placements: { garland: 'window-beam' },
    });
  });

  it('keeps failed writes and retries them (merged) on the next sync', async () => {
    const srv = fakeServer();
    let offline = true;
    const api: HomeSyncApi = {
      fetch: (s) => (offline ? Promise.resolve(null) : srv.api.fetch(s)),
      patch: (p) => (offline ? Promise.resolve(null) : srv.api.patch(p)),
    };
    const sync = createHomeSync({ api });
    sync.update({ slots: { sofa: 'sage' } });
    sync.update({ placements: { 'accent-rug': 'nook' } });
    sync.update({ pet: 'tortoise' });
    await sync.flush();
    expect(srv.state.slots.sofa).toBe('teal');

    offline = false;
    await sync.pull(); // flushes the outbox instead of adopting the stale server state
    await sync.flush();
    expect(srv.state).toMatchObject({
      pet: 'tortoise',
      slots: { sofa: 'sage' },
      placements: { 'accent-rug': 'nook' },
    });
    expect(sync.getState()).toMatchObject({
      pet: 'tortoise',
      slots: { sofa: 'sage' },
      placements: { 'accent-rug': 'nook' },
    });
  });

  it('keeps playing locally when no cloud store is configured', async () => {
    const api: HomeSyncApi = {
      fetch: async () => ({ state: null, backend: 'unconfigured' }),
      patch: async () => ({ state: null, backend: 'unconfigured' }),
    };
    const sync = createHomeSync({ api });
    sync.update({ pet: 'frog' });
    await sync.flush();
    await sync.pull();
    expect(sync.getState().pet).toBe('frog');
  });

  it('seeds an empty cloud save with this device’s customized room', async () => {
    const sent: SharedHomePatch[] = [];
    const api: HomeSyncApi = {
      fetch: async () => ({ state: null, backend: 'upstash' }),
      patch: async (p) => {
        sent.push(p);
        return { state: applySharedHomePatch(createDefaultHomeState(), p), backend: 'upstash' };
      },
    };
    const initial = applySharedHomePatch(createDefaultHomeState(), { outfits: { her: 'badminton' } });
    const sync = createHomeSync({ api, initial });
    await sync.pull();
    await sync.flush();
    expect(sent).toHaveLength(1);
    expect(sent[0].outfits).toEqual({ her: 'badminton', him: 'casual' });
    expect(Object.keys(sent[0].slots ?? {})).toHaveLength(FURNITURE_SLOTS.length);
    expect(Object.keys(sent[0].placements ?? {})).toHaveLength(MOVABLE_SLOT_IDS.length);
  });

  it('merges outbox patches field by field', () => {
    expect(
      mergePatches(
        { slots: { sofa: 'sage' }, placements: { tv: 'left-wall' }, lampOn: true },
        { slots: { rug: 'plum' }, placements: { garland: 'window-beam' }, lampOn: false, tvOn: false },
      ),
    ).toEqual({
      slots: { sofa: 'sage', rug: 'plum' },
      placements: { tv: 'left-wall', garland: 'window-beam' },
      lampOn: false,
      tvOn: false,
    });
  });
});
