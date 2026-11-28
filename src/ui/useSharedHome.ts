import { useCallback, useEffect, useRef, useState } from 'react';
import type { SharedHomePatch, SharedHomeState } from '../game/homeState';
import { createHomeSync, type HomeSync } from '../game/homeSync';

/** Gentle background refresh so both partners' devices stay in step. */
export const HOME_SYNC_INTERVAL_MS = 15_000;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface SharedHome {
  home: SharedHomeState;
  update: (patch: SharedHomePatch) => void;
  /** Adopts a room state the partner pushed over the live channel (when newer and no local write is in flight). */
  adoptExternal: (state: SharedHomeState) => boolean;
}

export interface SharedHomeOptions {
  /** Called with the new optimistic state after every local change (used to broadcast it live). */
  onLocalChange?: (state: SharedHomeState) => void;
}

/**
 * React binding for the one shared living room save: instant first paint from
 * the local cache, optimistic ordered writes, live partner updates via `adoptExternal`,
 * and a durable fallback sync (fetch on mount, every 15s while visible, and whenever
 * the tab returns to the foreground).
 */
export function useSharedHome(storage: StorageLike | undefined, options: SharedHomeOptions = {}): SharedHome {
  // A single engine for the lifetime of the component (created lazily, stable across renders).
  const [sync] = useState<HomeSync>(() => createHomeSync({ storage, onChange: (next) => setHome(next) }));
  const [home, setHome] = useState<SharedHomeState>(() => sync.getState());
  const onLocalChange = useRef(options.onLocalChange);
  onLocalChange.current = options.onLocalChange;

  useEffect(() => {
    const controller = new AbortController();
    const isVisible = () => document.visibilityState === 'visible';
    void sync.pull(controller.signal);

    const timer = window.setInterval(() => {
      if (isVisible()) void sync.pull(controller.signal);
    }, HOME_SYNC_INTERVAL_MS);
    const onForeground = () => {
      if (isVisible()) void sync.pull(controller.signal);
    };
    document.addEventListener('visibilitychange', onForeground);

    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onForeground);
    };
  }, [sync]);

  const update = useCallback(
    (patch: SharedHomePatch) => {
      sync.update(patch);
      onLocalChange.current?.(sync.getState());
    },
    [sync],
  );

  return { home, update, adoptExternal: sync.adoptExternal };
}
