import {
  applySharedHomePatch,
  createDefaultHomeState,
  fetchSharedHomeState,
  isEmptyPatch,
  isSameHomeChoices,
  loadCachedHomeState,
  patchFromState,
  patchSharedHomeState,
  saveCachedHomeState,
  sanitizeSharedHomeState,
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
}

export const DEFAULT_HOME_SYNC_API: HomeSyncApi = {
  fetch: fetchSharedHomeState,
  patch: patchSharedHomeState,
};

export function mergePatches(a: SharedHomePatch, b: SharedHomePatch): SharedHomePatch {
  const merged: SharedHomePatch = { ...a, ...b };
  if (a.slots || b.slots) merged.slots = { ...a.slots, ...b.slots };
  if (a.placements || b.placements) merged.placements = { ...a.placements, ...b.placements };
  if (a.outfits || b.outfits) merged.outfits = { ...a.outfits, ...b.outfits };
  return merged;
}

export interface HomeSync {
  getState: () => SharedHomeState;
  /** Applies a field-level change locally right away and queues it for the shared save. */
  update: (patch: SharedHomePatch) => void;
  /** Fetches the shared save and adopts it when no local write is in flight. */
  pull: (signal?: AbortSignal) => Promise<void>;
  /**
   * Adopts a room state pushed live by the partner's device. Ignored while a local write is in
   * flight or queued, or when the incoming state is older than ours. Returns true when adopted.
   */
  adoptExternal: (incoming: SharedHomeState) => boolean;
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
  /** Local changes that could not reach the server yet (offline / server error). */
  let outbox: SharedHomePatch | null = null;
  let seeded = false;
  /** Bumped whenever a live partner state is adopted, so slower in-flight pulls never undo it. */
  let externalSeq = 0;

  const commit = (next: SharedHomeState) => {
    state = next;
    saveCachedHomeState(storage, next);
    onChange?.(next);
  };

  const adopt = (server: SharedHomeState) => {
    if (state.revision === server.revision && isSameHomeChoices(state, server)) return;
    commit(server);
  };

  const addToOutbox = (patch: SharedHomePatch) => {
    outbox = outbox ? mergePatches(outbox, patch) : patch;
  };

  const flushOutbox = () => {
    const waiting = outbox;
    if (!waiting) return false;
    outbox = null;
    if (!isEmptyPatch(waiting)) enqueue(waiting);
    return true;
  };

  function enqueue(patch: SharedHomePatch): void {
    const seq = ++mutationSeq;
    pendingWrites += 1;
    chain = chain.then(async () => {
      let res: SharedHomeResponse | null = null;
      try {
        res = await api.patch(patch);
      } catch {
        res = null;
      } finally {
        pendingWrites -= 1;
      }
      if (!res) {
        addToOutbox(patch); // Keep the change locally and retry on the next sync.
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
      enqueue(patch);
    },
    async pull(signal) {
      if (pendingWrites > 0) return;
      if (flushOutbox()) return;
      const seqAtStart = mutationSeq;
      const externalAtStart = externalSeq;
      let res: SharedHomeResponse | null = null;
      try {
        res = await api.fetch(signal);
      } catch {
        res = null;
      }
      if (!res || signal?.aborted) return;
      // A local change happened while fetching: our newer write wins.
      if (pendingWrites > 0 || seqAtStart !== mutationSeq || outbox) return;
      // The partner's live update landed while fetching; the next pull re-checks the server.
      if (externalAtStart !== externalSeq) return;
      if (res.state) {
        adopt(res.state);
      } else if (
        res.backend !== 'unconfigured' &&
        !seeded &&
        !isSameHomeChoices(state, createDefaultHomeState())
      ) {
        // The cloud save is empty: seed it with this device's room.
        seeded = true;
        enqueue(patchFromState(state));
      }
    },
    adoptExternal(incoming) {
      if (pendingWrites > 0 || outbox) return false;
      const next = sanitizeSharedHomeState(incoming);
      const newer = next.revision > state.revision;
      const differs = next.revision === state.revision && !isSameHomeChoices(next, state);
      if (!newer && !differs) return false;
      externalSeq += 1;
      commit(next);
      return true;
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
