import {
  createDefaultHomeState,
  OUTFIT_CHOICES,
  sanitizeSharedHomeState,
  SHARED_SAVE_KEY,
  type ResidentId,
  type SharedHomePatch,
  type SharedHomeState,
} from './sharedHomeCore';

export {
  applySharedHomePatch,
  createDefaultHomeState,
  isEmptyPatch,
  isMovableSlotId,
  isSameHomeChoices,
  occupantAtSpot,
  patchFromState,
  resolvePlacementMove,
  sanitizeSharedHomePatch,
  sanitizeSharedHomeState,
} from './sharedHomeCore';
export type { MovableSlotId, PlacementMap, SharedHomePatch, SharedHomeState } from './sharedHomeCore';

/** Local mirror of the one shared save, so first paint is instant and offline play works. */
export const STORAGE_KEY = SHARED_SAVE_KEY;
/** Pre-shared-save outfit selections, migrated once into the shared save cache. */
export const LEGACY_OUTFITS_KEY = 'our-home:outfits:v1';
export const HOME_STATE_ENDPOINT = '/api/home-state';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Reads the cached shared save, gently migrating legacy outfit picks when no shared save exists yet. */
export function loadCachedHomeState(storage: StorageLike | undefined): SharedHomeState {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) return sanitizeSharedHomeState(JSON.parse(raw));
  } catch {
    // Corrupt cache: fall through to legacy migration / defaults.
  }

  const state = createDefaultHomeState();
  try {
    const legacyRaw = storage?.getItem(LEGACY_OUTFITS_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Record<string, unknown> | null;
      for (const id of Object.keys(OUTFIT_CHOICES) as ResidentId[]) {
        const v = legacy?.[id];
        if (typeof v === 'string' && (OUTFIT_CHOICES[id].optionIds as readonly string[]).includes(v)) {
          state.outfits[id] = v;
        }
      }
    }
  } catch {
    // Ignore corrupt legacy data.
  }
  return state;
}

export function saveCachedHomeState(storage: StorageLike | undefined, state: SharedHomeState): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(sanitizeSharedHomeState(state)));
  } catch {
    // Storage can be full or blocked; the room still works without the cache.
  }
}

export interface SharedHomeResponse {
  /** Authoritative shared save, or null when the server has nothing saved / no cloud store linked. */
  state: SharedHomeState | null;
  /** Which persistence backend served the request (e.g. `upstash`, `supabase`, `memory`, `unconfigured`). */
  backend: string;
}

async function requestHomeState(init: RequestInit): Promise<SharedHomeResponse | null> {
  if (typeof fetch !== 'function') return null;
  try {
    const res = await fetch(HOME_STATE_ENDPOINT, {
      cache: 'no-store',
      ...init,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { state?: unknown; backend?: unknown } | null;
    if (!data || typeof data !== 'object') return null;
    return {
      state: data.state && typeof data.state === 'object' ? sanitizeSharedHomeState(data.state) : null,
      backend: typeof data.backend === 'string' ? data.backend : 'unknown',
    };
  } catch {
    // Offline, aborted, or the endpoint served something that is not JSON.
    return null;
  }
}

/** `GET /api/home-state`. Resolves null on network or server errors. */
export function fetchSharedHomeState(signal?: AbortSignal): Promise<SharedHomeResponse | null> {
  return requestHomeState({ method: 'GET', signal });
}

/** `PUT /api/home-state` with a field-level patch. */
export function patchSharedHomeState(patch: SharedHomePatch): Promise<SharedHomeResponse | null> {
  return requestHomeState({ method: 'PUT', body: JSON.stringify({ patch }) });
}
