import { describe, expect, it } from 'vitest';
import { EMOTE_ICON_URLS } from '../../src/game/assets';
import {
  characterHop,
  characterWalkTo,
  CHARACTERS,
  createCharacter,
  stepControlledCharacter,
  stepKeyboardCharacter,
  CHARACTER_BOUNDS,
} from '../../src/game/characters';
import { createDefaultHomeState, applySharedHomePatch } from '../../src/game/homeState';
import { createHomeSync, type HomeSyncApi } from '../../src/game/homeSync';
import { ROOM } from '../../src/game/layout';
import {
  characterControl,
  computePresence,
  createClientId,
  EMOTE_IDS,
  EMOTES,
  isClientId,
  LIVE_ROOM,
  loadPlayerRole,
  parseLiveClientMessage,
  parseLiveServerMessage,
  PLAYER_ROLE_STORAGE_KEY,
  sanitizeLiveEvent,
  sanitizePresencePeers,
  savePlayerRole,
} from '../../src/game/multiplayer';
import { supabaseLiveConfig } from '../../src/game/multiplayerTransport';
import { createPet, petSynced, stepPet } from '../../src/game/pet';
import { createLiveBus } from '../../src/ui/useMultiplayer';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe('player role storage', () => {
  it('round-trips her / him and clears back to "not chosen"', () => {
    const storage = memoryStorage();
    expect(loadPlayerRole(storage)).toBeNull();
    savePlayerRole(storage, 'him');
    expect(storage.data.get(PLAYER_ROLE_STORAGE_KEY)).toBe('him');
    expect(loadPlayerRole(storage)).toBe('him');
    savePlayerRole(storage, 'her');
    expect(loadPlayerRole(storage)).toBe('her');
    savePlayerRole(storage, null);
    expect(loadPlayerRole(storage)).toBeNull();
  });

  it('ignores garbage and tolerates blocked storage', () => {
    expect(loadPlayerRole(memoryStorage({ [PLAYER_ROLE_STORAGE_KEY]: 'cat' }))).toBeNull();
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadPlayerRole(blocked)).toBeNull();
    expect(() => savePlayerRole(blocked, 'her')).not.toThrow();
    expect(loadPlayerRole(undefined)).toBeNull();
  });
});

describe('presence', () => {
  it('is solo when only this client is connected', () => {
    const p = computePresence([{ clientId: 'bbb', role: 'him' }], 'bbb');
    expect(p).toMatchObject({ partnerOnline: false, partnerRole: null, onlineRoles: [], partnerCount: 0 });
    expect(p.isPetLeader).toBe(false);
    expect(computePresence([], 'bbb').partnerOnline).toBe(false);
  });

  it('reports the partner, their role, and a deterministic pet leader', () => {
    const peers = [
      { clientId: 'mmm', role: 'him' as const },
      { clientId: 'ccc', role: 'her' as const },
    ];
    const a = computePresence(peers, 'mmm');
    const b = computePresence(peers, 'ccc');
    expect(a).toMatchObject({ partnerOnline: true, partnerRole: 'her', onlineRoles: ['her'], partnerCount: 1 });
    expect(b).toMatchObject({ partnerOnline: true, partnerRole: 'him', onlineRoles: ['him'] });
    // Both devices agree on exactly one leader: the lowest clientId.
    expect(a.petLeaderId).toBe('ccc');
    expect(b.petLeaderId).toBe('ccc');
    expect(a.isPetLeader).toBe(false);
    expect(b.isPetLeader).toBe(true);
  });

  it('counts a partner who has not picked a role yet', () => {
    const p = computePresence(
      [
        { clientId: 'a1', role: null },
        { clientId: 'b2', role: 'her' },
      ],
      'b2',
    );
    expect(p.partnerOnline).toBe(true);
    expect(p.partnerRole).toBeNull();
    expect(p.onlineRoles).toEqual([]);
  });

  it('decides who drives each character', () => {
    const together = { partnerOnline: true, onlineRoles: ['her' as const] };
    expect(characterControl('him', 'him', together)).toBe('local');
    expect(characterControl('her', 'him', together)).toBe('remote');
    expect(characterControl('her', 'him', { partnerOnline: false, onlineRoles: [] })).toBe('auto');
    expect(characterControl('her', null, { partnerOnline: true, onlineRoles: [] })).toBe('auto');
    expect(characterControl('him', null, together)).toBe('auto');
  });

  it('sanitizes presence peers', () => {
    expect(
      sanitizePresencePeers([
        { clientId: 'ok_1', role: 'her' },
        { clientId: 'ok_1', role: 'him' },
        { clientId: 'bad id!', role: 'her' },
        { clientId: 'x2', role: 'dragon' },
        null,
        7,
      ]),
    ).toEqual([
      { clientId: 'ok_1', role: 'him' },
      { clientId: 'x2', role: null },
    ]);
    expect(sanitizePresencePeers('nope')).toEqual([]);
  });

  it('creates valid, unique client ids', () => {
    const a = createClientId();
    const b = createClientId();
    expect(isClientId(a)).toBe(true);
    expect(a).not.toBe(b);
  });
});

describe('emotes', () => {
  it('defines six hand-drawn emotes with art and short labels', () => {
    expect(EMOTES.map((e) => e.id)).toEqual(['love', 'wave', 'tea', 'music', 'sleepy', 'shuttle']);
    expect(EMOTES.map((e) => e.label)).toEqual(['Love', 'Hi!', 'Tea', 'Music', 'Sleepy', 'Play!']);
    for (const id of EMOTE_IDS) expect(EMOTE_ICON_URLS[id]).toContain(`emote_${id}`);
  });
});

describe('live event sanitization', () => {
  it('keeps valid events and clamps coordinates into the room', () => {
    expect(LIVE_ROOM).toEqual({ w: ROOM.w, h: ROOM.h });
    expect(
      sanitizeLiveEvent({
        type: 'char_move',
        role: 'him',
        x: 1200.6,
        y: 9999,
        tx: -50,
        ty: 800,
        facing: -1,
        mode: 'walk',
        extra: 'dropped',
      }),
    ).toEqual({ type: 'char_move', role: 'him', x: 1201, y: 900, tx: 0, ty: 800, facing: -1, mode: 'walk' });
    expect(sanitizeLiveEvent({ type: 'char_move', role: 'her', x: 10, y: 700, mode: 'teleport' })).toEqual({
      type: 'char_move',
      role: 'her',
      x: 10,
      y: 700,
      tx: 10,
      ty: 700,
      facing: 1,
      mode: 'idle',
    });
    expect(sanitizeLiveEvent({ type: 'char_emote', role: 'her', emote: 'shuttle', seq: 3.7 })).toEqual({
      type: 'char_emote',
      role: 'her',
      emote: 'shuttle',
      seq: 3,
    });
    expect(sanitizeLiveEvent({ type: 'char_poke', fromRole: 'x', targetRole: 'him' })).toEqual({
      type: 'char_poke',
      fromRole: null,
      targetRole: 'him',
    });
    expect(sanitizeLiveEvent({ type: 'pet_tap', x: 500, y: 800, facing: 1 })).toEqual({
      type: 'pet_tap',
      x: 500,
      y: 800,
      facing: 1,
    });
    expect(sanitizeLiveEvent({ type: 'pet_sync', x: 1, y: 2, tx: 3, ty: 4, mode: 'walk', facing: -1 })).toEqual({
      type: 'pet_sync',
      x: 1,
      y: 2,
      tx: 3,
      ty: 4,
      mode: 'walk',
      facing: -1,
    });
    expect(sanitizeLiveEvent({ type: 'item_tap', slotId: 'sofa' })).toEqual({ type: 'item_tap', slotId: 'sofa' });
  });

  it('rejects malformed or unknown events', () => {
    for (const bad of [
      null,
      'char_move',
      [],
      { type: 'explode' },
      { type: 'char_move', role: 'cat', x: 1, y: 1 },
      { type: 'char_move', role: 'him', x: Number.NaN, y: 1 },
      { type: 'char_move', role: 'him', x: '5', y: 1 },
      { type: 'char_emote', role: 'him', emote: 'dance' },
      { type: 'char_poke', targetRole: null },
      { type: 'pet_tap', x: Infinity, y: 1 },
      { type: 'item_tap', slotId: 'fridge' },
      { type: 'item_tap', slotId: '__proto__' },
      { type: 'home_state', state: 'oops' },
    ]) {
      expect(sanitizeLiveEvent(bad), JSON.stringify(bad)).toBeNull();
    }
  });

  it('sanitizes shared home states pushed live', () => {
    const e = sanitizeLiveEvent({
      type: 'home_state',
      state: {
        slots: { sofa: 'sage', rug: 'lava', tv: 'retro-tv' },
        placements: { tv: 'left-wall', 'accent-rug': 'nook' },
        pet: 'dragon',
        revision: 4,
        lampOn: false,
        tvOn: false,
      },
    });
    expect(e?.type).toBe('home_state');
    if (e?.type !== 'home_state') return;
    expect(e.state.slots.sofa).toBe('sage');
    expect(e.state.slots.tv).toBe('retro-tv');
    expect(e.state.slots.rug).toBe('terracotta');
    expect(e.state.placements.tv).toBe('left-wall');
    expect(e.state.placements.cabinet).not.toBe('left-wall');
    expect(e.state.placements['accent-rug']).toBe('nook');
    expect(e.state.pet).toBe('hedgehog');
    expect(e.state.lampOn).toBe(false);
    expect(e.state.tvOn).toBe(false);
    expect(e.state.revision).toBe(4);
  });

  it('parses relay messages in both directions', () => {
    expect(parseLiveServerMessage({ type: 'presence', peers: [{ clientId: 'a', role: 'her' }] })).toEqual({
      type: 'presence',
      peers: [{ clientId: 'a', role: 'her' }],
    });
    expect(
      parseLiveServerMessage({ type: 'event', from: 'a', event: { type: 'char_poke', targetRole: 'her' } }),
    ).toEqual({ type: 'event', from: 'a', event: { type: 'char_poke', fromRole: null, targetRole: 'her' } });
    expect(parseLiveServerMessage({ type: 'event', from: 'a', event: { type: 'nope' } })).toBeNull();
    expect(parseLiveClientMessage({ type: 'presence', clientId: 'a', role: 'him' })).toEqual({
      type: 'presence',
      clientId: 'a',
      role: 'him',
    });
    expect(parseLiveClientMessage({ type: 'presence', clientId: '', role: 'him' })).toBeNull();
    expect(parseLiveClientMessage({ type: 'event', clientId: 'a', event: { type: 'item_tap', slotId: 'x' } })).toBeNull();
  });
});

describe('live bus', () => {
  it('routes events by type and unsubscribes cleanly', () => {
    const bus = createLiveBus();
    const seen: string[] = [];
    const off = bus.on('item_tap', (e) => seen.push(e.slotId));
    bus.on('char_poke', () => {
      throw new Error('listener errors never break the bus');
    });
    bus.dispatch({ type: 'item_tap', slotId: 'lamp' });
    expect(() => bus.dispatch({ type: 'char_poke', fromRole: null, targetRole: 'her' })).not.toThrow();
    off();
    bus.dispatch({ type: 'item_tap', slotId: 'sofa' });
    expect(seen).toEqual(['lamp']);
  });
});

describe('transport selection', () => {
  it('uses Supabase only when both public env vars are present', () => {
    expect(supabaseLiveConfig({})).toBeNull();
    expect(supabaseLiveConfig({ VITE_SUPABASE_URL: 'https://x.supabase.co' })).toBeNull();
    expect(
      supabaseLiveConfig({ VITE_SUPABASE_URL: ' https://x.supabase.co ', VITE_SUPABASE_PUBLISHABLE_KEY: 'pk' }),
    ).toEqual({ url: 'https://x.supabase.co', key: 'pk' });
  });
});

describe('player-controlled movement', () => {
  const him = CHARACTERS.find((c) => c.id === 'him')!;

  it('walks to a tapped floor spot and then rests there (no wandering)', () => {
    let s = characterWalkTo(createCharacter(him), 1650, 820);
    expect(s).toMatchObject({ mode: 'walk', tx: 1650, ty: 820, facing: 1 });
    for (let i = 0; i < 400; i++) s = stepControlledCharacter(s, 1 / 30);
    expect(s).toMatchObject({ mode: 'idle', x: 1650, y: 820 });
    for (let i = 0; i < 600; i++) s = stepControlledCharacter(s, 1 / 30);
    expect(s).toMatchObject({ mode: 'idle', x: 1650, y: 820 });
  });

  it('clamps walk targets to the floor', () => {
    const s = characterWalkTo(createCharacter(him), 5000, 10);
    expect(s.tx).toBe(CHARACTER_BOUNDS.maxX);
    expect(s.ty).toBe(CHARACTER_BOUNDS.minY);
  });

  it('resumes its walk after a happy hop', () => {
    let s = characterHop(characterWalkTo(createCharacter(him), 1650, 820));
    expect(s.mode).toBe('happy');
    s = stepControlledCharacter(s, CHARACTER_BOUNDS.happySeconds + 0.01);
    expect(s.mode).toBe('walk');
  });

  it('strolls with the keyboard and settles when keys are released', () => {
    let s = createCharacter(him);
    s = stepKeyboardCharacter(s, -1, 0, 0.5);
    expect(s.mode).toBe('walk');
    expect(s.x).toBeLessThan(him.startX);
    expect(s.facing).toBe(-1);
    s = stepKeyboardCharacter(s, 0, 0, 0.1);
    expect(s.mode).toBe('idle');
  });
});

describe('shared pet following', () => {
  it('a following pet never picks its own spots but mirrors the leader', () => {
    let s = createPet();
    for (let i = 0; i < 300; i++) s = stepPet(s, 0.05, () => 0.9, { wander: false });
    expect(s).toMatchObject({ mode: 'idle', x: createPet().x });

    const { state, speedScale } = petSynced(s, { x: 1000, y: 700, tx: 1400, ty: 760, mode: 'walk', facing: 1 });
    expect(state).toMatchObject({ mode: 'walk', tx: 1400, ty: 760 });
    expect(speedScale).toBeGreaterThan(1);
    let t = state;
    for (let i = 0; i < 600; i++) t = stepPet(t, 0.05, () => 0.9, { wander: false, speedScale });
    expect(t).toMatchObject({ mode: 'idle', x: 1400, y: 760 });
  });
});

describe('HomeSync.adoptExternal (live partner updates)', () => {
  const idleApi: HomeSyncApi = {
    fetch: async () => null,
    patch: async () => null,
  };

  it('adopts newer partner states and ignores older ones', () => {
    const changes: string[] = [];
    const sync = createHomeSync({ api: idleApi, onChange: (s) => changes.push(s.slots.sofa) });
    const partner = applySharedHomePatch(createDefaultHomeState(), { slots: { sofa: 'sage' } });
    expect(sync.adoptExternal(partner)).toBe(true);
    expect(sync.getState().slots.sofa).toBe('sage');
    expect(sync.adoptExternal(createDefaultHomeState())).toBe(false);
    // Same revision but a different room (concurrent edit): adopt the partner's view.
    const sameRev = { ...partner, slots: { ...partner.slots, rug: 'plum' } };
    expect(sync.adoptExternal(sameRev)).toBe(true);
    expect(sync.adoptExternal(sameRev)).toBe(false);
    expect(changes).toEqual(['sage', 'sage']);
  });

  it('never adopts while a local write is in flight', async () => {
    let release!: () => void;
    const slowApi: HomeSyncApi = {
      ...idleApi,
      patch: () =>
        new Promise((resolve) => {
          release = () => resolve(null);
        }),
    };
    const sync = createHomeSync({ api: slowApi });
    sync.update({ slots: { sofa: 'oat' } });
    const partner = applySharedHomePatch(
      applySharedHomePatch(createDefaultHomeState(), { slots: { sofa: 'sage' } }),
      { pet: 'frog' },
    );
    expect(sync.adoptExternal(partner)).toBe(false);
    expect(sync.getState().slots.sofa).toBe('oat');
    while (!release) await Promise.resolve(); // the queued write starts on a later microtask
    release();
    await sync.flush();
  });

  it('a slow pull that started before a live update does not undo it', async () => {
    let resolveFetch!: (v: { state: ReturnType<typeof createDefaultHomeState>; backend: string }) => void;
    const api: HomeSyncApi = {
      ...idleApi,
      fetch: () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    };
    const sync = createHomeSync({ api });
    const pulling = sync.pull();
    const partner = applySharedHomePatch(createDefaultHomeState(), { slots: { sofa: 'sage' } });
    expect(sync.adoptExternal(partner)).toBe(true);
    resolveFetch({ state: createDefaultHomeState(), backend: 'memory' });
    await pulling;
    expect(sync.getState().slots.sofa).toBe('sage');
  });
});
