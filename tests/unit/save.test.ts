import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../../src/game/initialState';
import { encodeBackupCode, exportSaveJson, parseBackup } from '../../src/save/exportImport';
import { migrateState } from '../../src/save/migrations';
import { cloudIsNewer, makeEnvelope, needsConflictDialog, summarize } from '../../src/save/schema';
import { clearLocalData, loadBestSave, pushSnapshot, saveLocal, writeSnapshot } from '../../src/save/storage';

const AT = new Date(2026, 10, 11, 10, 0, 0).getTime();

describe('save migrations', () => {
  it('upgrades a v0 save to v1 and fills defaults', () => {
    const v0: Record<string, unknown> = {
      ...createInitialState(AT),
      version: 0,
      settings: { textSize: 'l' },
      stats: { taps: 9 },
    };
    delete v0.critters;
    delete v0.events;

    const migrated = migrateState(v0);
    expect(migrated.version).toBe(1);
    expect(migrated.settings.lang).toBe('en');
    expect(migrated.settings.textSize).toBe('l');
    expect(migrated.settings.music).toBe(0.35);
    expect(migrated.stats.taps).toBe(9);
    expect(migrated.stats.bought).toBe(0);
  });

  it('rejects saves from a future version', () => {
    const future = { ...createInitialState(AT), version: 99 };
    expect(() => migrateState(future)).toThrow(/newer version/i);
  });
});

describe('snapshot rotation', () => {
  it('keeps only the newest 5 snapshots', () => {
    let list: { id: string; savedAt: number; data: string }[] = [];
    for (let i = 1; i <= 7; i++) {
      list = pushSnapshot(list, { id: `snap_${i}`, savedAt: AT + i * 1000, data: '{}' }, 5);
    }
    expect(list).toHaveLength(5);
    expect(list.map((s) => s.id)).toEqual(['snap_7', 'snap_6', 'snap_5', 'snap_4', 'snap_3']);
  });
});

describe('cloud conflict logic', () => {
  it('detects when both local and cloud changed since last sync', () => {
    const base = createInitialState(AT);
    const local = makeEnvelope({ ...base, hearts: 200 }, 3, 'dev-a', AT + 1000);
    const cloud = makeEnvelope({ ...base, hearts: 310 }, 4, 'dev-b', AT + 2000);

    expect(needsConflictDialog(local, cloud, 2)).toBe(true);
    expect(needsConflictDialog(local, cloud, 3)).toBe(false);
    expect(cloudIsNewer(cloud, local)).toBe(true);

    const summary = summarize(cloud.state);
    expect(summary.hearts).toBe(310);
    expect(summary.placed).toBe(cloud.state.placed.length);
  });
});

describe('export and import round-trip', () => {
  it('restores identical state from JSON and base64 backup codes', () => {
    const original = createInitialState(AT);
    original.hearts = 777;
    original.settings.textSize = 'l';

    const json = exportSaveJson(original, 4);
    expect(parseBackup(json)).toEqual(original);

    const code = encodeBackupCode(json);
    expect(parseBackup(code)).toEqual(original);
  });
});

describe('local storage and corruption recovery', () => {
  beforeEach(async () => {
    await clearLocalData();
  });

  it('saves and loads from IndexedDB', async () => {
    const state = createInitialState(AT);
    state.hearts = 432;
    await saveLocal(state, 2, 'dev-test', AT);

    const loaded = await loadBestSave();
    expect(loaded.source).toBe('save');
    expect(loaded.recovered).toBe(false);
    expect(loaded.envelope?.state.hearts).toBe(432);
  });

  it('falls back to the newest valid snapshot if the main save is missing or corrupt', async () => {
    const state = createInitialState(AT);
    state.hearts = 555;
    await writeSnapshot(state, AT);

    const loaded = await loadBestSave();
    expect(loaded.source).toBe('snapshot');
    expect(loaded.recovered).toBe(true);
    expect(loaded.envelope?.state.hearts).toBe(555);
  });
});
