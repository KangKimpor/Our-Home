import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { getGameAssetUrls, preloadAllAssets } from '../game/assets';

type PreloadState =
  | { kind: 'loading'; loaded: number; total: number }
  | { kind: 'ready' }
  | { kind: 'error'; loaded: number; total: number; failedCount: number };

/**
 * Ensures every backdrop, furniture sprite, character sprite, walk-cycle animation
 * strip, and UI plaque is fetched and decoded before revealing the living room.
 */
export function AssetPreloader({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreloadState>(() => ({
    kind: 'loading',
    loaded: 0,
    total: getGameAssetUrls().length,
  }));
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const startLoad = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const runId = ++runIdRef.current;
    const urls = getGameAssetUrls();

    setState({ kind: 'loading', loaded: 0, total: urls.length });

    void preloadAllAssets({
      urls,
      signal: controller.signal,
      onProgress: ({ loaded, total }) => {
        if (runId !== runIdRef.current) return;
        setState({ kind: 'loading', loaded, total });
      },
    }).then((result) => {
      if (runId !== runIdRef.current || controller.signal.aborted) return;
      if (result.ok) {
        setState({ kind: 'ready' });
      } else {
        setState({
          kind: 'error',
          loaded: result.loaded,
          total: result.total,
          failedCount: result.failedUrls.length,
        });
      }
    });
  }, []);

  useEffect(() => {
    startLoad();
    return () => {
      runIdRef.current += 1;
      abortRef.current?.abort();
    };
  }, [startLoad]);

  if (state.kind === 'ready') {
    return <>{children}</>;
  }

  const pct = state.total > 0 ? Math.round((state.loaded / state.total) * 100) : 0;

  return (
    <main
      className="version-gate"
      data-testid="asset-preloader"
      data-status={state.kind}
      role="status"
      aria-live="polite"
    >
      <div className="version-card">
        {state.kind === 'loading' ? (
          <>
            <h1 className="version-title">Setting up Our Home…</h1>
            <p className="version-message">Loading all room art and animations before opening the door.</p>
            <div
              className="loader-bar"
              role="progressbar"
              aria-label="Loading game assets"
              aria-valuemin={0}
              aria-valuemax={state.total}
              aria-valuenow={state.loaded}
            >
              <div className="loader-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="version-meta">
              {state.loaded} / {state.total} assets ready
            </p>
          </>
        ) : (
          <>
            <h1 className="version-title">Couldn&apos;t load all room art</h1>
            <p className="version-message">
              {state.failedCount} {state.failedCount === 1 ? 'asset' : 'assets'} failed to load. Check your connection
              and try again.
            </p>
            <p className="version-meta">
              Loaded {state.loaded} / {state.total} assets
            </p>
            <button type="button" className="version-button" onClick={startLoad}>
              Try again
            </button>
          </>
        )}
      </div>
    </main>
  );
}
