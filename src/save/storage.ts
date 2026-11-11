import { createStore, del, get, set } from 'idb-keyval';
import { SAVE } from '../config/balance';
import type { GameState, SaveEnvelope, Snapshot } from '../game/types';
import { isEnvelope, makeEnvelope } from './schema';
import { migrateState } from './migrations';

const STORE = createStore('our-home', 'saves');

export interface LoadResult {
  envelope: SaveEnvelope | null;
  source: 'save' | 'mirror' | 'snapshot' | null;
  recovered: boolean;
  error?: string;
}

export async function getDeviceId(): Promise<string> {
  try {
    const existing = await get<string>('device-id', STORE);
    if (existing) return existing;
  } catch {
    /* ignore */
  }
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `device-${Math.random().toString(36).slice(2)}`;
  try {
    await set('device-id', id, STORE);
  } catch {
    /* ignore */
  }
  return id;
}

export async function readLocalEnvelope(): Promise<SaveEnvelope | null> {
  try {
    const raw = await get<unknown>(SAVE.key, STORE);
    if (isEnvelope(raw)) return raw;
    if (raw && typeof raw === 'object' && 'state' in (raw as Record<string, unknown>)) {
      const candidate = raw as SaveEnvelope;
      return { ...candidate, state: migrateState(candidate.state) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function writeLocalEnvelope(envelope: SaveEnvelope): Promise<void> {
  await set(SAVE.key, envelope, STORE);
  try {
    localStorage.setItem(SAVE.key, JSON.stringify(envelope));
  } catch {
    /* quota / private mode */
  }
}

export async function saveLocal(state: GameState, revision: number, deviceId: string, savedAt = Date.now()): Promise<SaveEnvelope> {
  const envelope = makeEnvelope(state, revision, deviceId, savedAt);
  await writeLocalEnvelope(envelope);
  return envelope;
}

export async function readSnapshots(): Promise<Snapshot[]> {
  try {
    const list = await get<Snapshot[]>(SAVE.snapshotsKey, STORE);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function pushSnapshot(list: Snapshot[], snapshot: Snapshot, keep = 5): Snapshot[] {
  return [snapshot, ...list.filter((s) => s.id !== snapshot.id)].slice(0, keep);
}

export async function writeSnapshot(state: GameState, now: number): Promise<Snapshot[]> {
  const snapshot: Snapshot = {
    id: `snap_${now}`,
    savedAt: now,
    data: JSON.stringify(state),
  };
  const next = pushSnapshot(await readSnapshots(), snapshot, SAVE.snapshotKeep);
  try {
    await set(SAVE.snapshotsKey, next, STORE);
  } catch {
    /* ignore */
  }
  return next;
}

export async function loadBestSave(): Promise<LoadResult> {
  try {
    const raw = await get<unknown>(SAVE.key, STORE);
    if (isEnvelope(raw)) return { envelope: raw, source: 'save', recovered: false };
    if (raw) {
      try {
        const state = migrateState((raw as { state?: unknown }).state ?? raw);
        return {
          envelope: makeEnvelope(state, 1, await getDeviceId(), Date.now()),
          source: 'save',
          recovered: false,
        };
      } catch {
        /* corrupt, continue */
      }
    }
  } catch {
    /* IndexedDB unavailable */
  }

  try {
    const mirror = localStorage.getItem(SAVE.key);
    if (mirror) {
      const parsed: unknown = JSON.parse(mirror);
      if (isEnvelope(parsed)) return { envelope: parsed, source: 'mirror', recovered: false };
      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        return {
          envelope: makeEnvelope(migrateState((parsed as { state: unknown }).state), 1, await getDeviceId(), Date.now()),
          source: 'mirror',
          recovered: false,
        };
      }
    }
  } catch {
    /* ignore */
  }

  const snapshots = await readSnapshots();
  for (const snapshot of snapshots) {
    try {
      const state = migrateState(JSON.parse(snapshot.data));
      return {
        envelope: makeEnvelope(state, 1, await getDeviceId(), snapshot.savedAt),
        source: 'snapshot',
        recovered: true,
      };
    } catch {
      /* try older */
    }
  }
  return { envelope: null, source: null, recovered: false };
}

export async function clearLocalData(): Promise<void> {
  try {
    await del(SAVE.key, STORE);
    await del(SAVE.snapshotsKey, STORE);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(SAVE.key);
  } catch {
    /* ignore */
  }
}

export async function clearSnapshots(): Promise<void> {
  try {
    await del(SAVE.snapshotsKey, STORE);
  } catch {
    /* ignore */
  }
}
