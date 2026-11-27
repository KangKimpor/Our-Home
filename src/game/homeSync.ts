import {
  applySharedHomePatch,
  createDefaultHomeState,
  createResetHomeState,
  fetchSharedHomeState,
  isEmptyPatch,
  isSameHomeChoices,
  loadCachedHomeState,
  patchFromState,
  patchSharedHomeState,
  resetSharedHomeState,
  saveCachedHomeState,
  type SharedHomePatch,
  type SharedHomeResponse,
  type SharedHomeState,
} from './homeState';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface HomeSyncApi {
  fetch: (signal?: AbortSignal) => Promise<SharedHomeResponse | null>;
  patch: (patch: SharedHomePatch) => Promise<SharedHomeResponse | null>;
  reset: () => Promise<SharedHomeResponse | null>;
}

export const DEFAULT_HOME_SYNC_API: HomeSyncApi = {
  fetch: fetchSharedHomeState,
  patch: patchSharedHomeState,
  reset: resetSharedHomeState,
};

type WriteRequest = { kind: 'patch'; patch: SharedHomePatch } | { kind: 'reset' };

/** Local changes that could not reach the server yet (offline / server error). */
interface Outbox {
  reset: boolean;
  patch: SharedHomePatch;
}

export function mergePatches(a: SharedHomePatch, b: SharedHomePatch): SharedHomePatch {
  const merged: SharedHomePatch = { ...a, ...b };
  if (a.slots || b.slots) merged.slots = { ...a.slots, ...b.slots };
  if (a.outfits || b.outfits) merged.outfits = { ...a.outfits, ...b.outfits };
  return merged;
}

export interface HomeSync {
  getState: () => SharedHomeState;
  /** Applies a field-level change locally right away and queues it for the shared save. */
  update: (patch: SharedHomePatch) => void;
  /** Restores the shared room to its defaults for everyone. */
  reset: () => void;
  /** Fetches the shared save and adopts it when no local write is in flight. */
  pull: (signal?: AbortSignal) => Promise<void>;
  /** Resolves once every queued write has settled (tests / teardown). */
  flush: () => Promise<void>;
  isWriting: () => boolean;
}

export interface HomeSyncOptions {
  storage?: StorageLike;
  api?: HomeSyncApi;
  initial?: SharedHomeState;
  onChange?: (state: SharedHomeState) => void;
}

/**
 * Client sync engine for the one shared living room save:
 * - every change is optimistic (state + local cache update immediately),
 * - writes go out strictly in order through a serial queue,
 * - a monotonic mutation counter makes sure stale responses never overwrite newer local changes,
 * - failed writes are merged into an outbox and retried on the next sync,
 * - pulls adopt the server's authoritative state only when no write is in flight.
 */
export function createHomeSync(options: HomeSyncOptions = {}): HomeSync {
  const { storage, onChange } = options;
  const api = options.api ?? DEFAULT_HOME_SYNC_API;
  let state = options.initial ?? loadCachedHomeState(storage);
  let mutationSeq = 0;
  let pendingWrites = 0;
  let chain: Promise<void> = Promise.resolve();
  let outbox: Outbox | null = null;
  let seeded = false;

  const commit = (next: SharedHomeState) => {
    state = next;
    saveCachedHomeState(storage, next);
    onChange?.(next);
  };

  const adopt = (server: SharedHomeState) => {
    if (state.revision === server.revision && isSameHomeChoices(state, server)) return;
    commit(server);
  };

  const addToOutbox = (request: WriteRequest) => {
    if (request.kind === 'reset') {
      outbox = { reset: true, patch: {} };
    } else {
      const prev = outbox ?? { reset: false, patch: {} };
      outbox = { reset: prev.reset, patch: mergePatches(prev.patch, request.patch) };
    }
  };

  const flushOutbox = () => {
    const waiting = outbox;
    if (!waiting) return false;
    outbox = null;
    if (waiting.reset) enqueue({ kind: 'reset' });
    if (!isEmptyPatch(waiting.patch)) enqueue({ kind: 'patch', patch: waiting.patch });
    return true;
  };

  function enqueue(request: WriteRequest): void {
    const seq = ++mutationSeq;
    pendingWrites += 1;
    chain = chain.then(async () => {
      let res: SharedHomeResponse | null = null;
      try {
        res = request.kind === 'reset' ? await api.reset() : await api.patch(request.patch);
      } catch {
        res = null;
      } finally {
        pendingWrites -= 1;
      }
      if (!res) {
        addToOutbox(request); // Keep the change locally and retry on the next sync.
        return;
      }
      if (res.backend === 'unconfigured') {
        outbox = null; // No cloud store linked: the local cache is the save.
        return;
      }
      if (flushOutbox()) return; // Back online: send earlier failed changes first.
      if (res.state && seq === mutationSeq && pendingWrites === 0) adopt(res.state);
    });
  }

  return {
    getState: () => state,
    update(patch) {
      commit(applySharedHomePatch(state, patch));
      enqueue({ kind: 'patch', patch });
    },
    reset() {
      commit(createResetHomeState(state));
      enqueue({ kind: 'reset' });
    },
    async pull(signal) {
      if (pendingWrites > 0) return;
      if (flushOutbox()) return;
      const seqAtStart = mutationSeq;
      let res: SharedHomeResponse | null = null;
      try {
        res = await api.fetch(signal);
      } catch {
        res = null;
      }
      if (!res || signal?.aborted) return;
      // A local change happened while fetching: our newer write wins.
      if (pendingWrites > 0 || seqAtStart !== mutationSeq || outbox) return;
      if (res.state) {
        adopt(res.state);
      } else if (
        res.backend !== 'unconfigured' &&
        !seeded &&
        !isSameHomeChoices(state, createDefaultHomeState())
      ) {
        // The cloud save is empty: seed it with this device's room.
        seeded = true;
        enqueue({ kind: 'patch', patch: patchFromState(state) });
      }
    },
    async flush() {
      let current: Promise<void>;
      do {
        current = chain;
        await current;
      } while (current !== chain);
    },
    isWriting: () => pendingWrites > 0,
  };
}
