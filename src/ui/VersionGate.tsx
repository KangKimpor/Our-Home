import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  APP_VERSION,
  buildReloadUrl,
  checkLatestVersion,
  clearAutoReloadAttempt,
  clearBrowserCaches,
  markAutoReloadAttempt,
  shouldAutoReload,
  stripReloadParams,
} from '../game/version';

type GateState =
  | { kind: 'checking' }
  | { kind: 'ready' }
  | { kind: 'reloading'; latestVersion: string }
  | { kind: 'outdated'; currentVersion: string; latestVersion: string }
  | { kind: 'error'; reason: string };

function getSessionStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Blocks the game from mounting until the running bundle is verified against the
 * server's latest version manifest. Outdated or unverifiable sessions are never
 * allowed to load the game.
 */
export function VersionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>({ kind: 'checking' });
  const checkIdRef = useRef(0);
  const reloadingRef = useRef(false);

  const reloadToLatest = useCallback(async (latestVersion: string, forceUnique: boolean) => {
    reloadingRef.current = true;
    setState({ kind: 'reloading', latestVersion });
    await clearBrowserCaches();
    window.location.replace(buildReloadUrl(window.location.href, latestVersion, forceUnique));
  }, []);

  const verify = useCallback(
    async (mode: 'strict' | 'background') => {
      if (reloadingRef.current) return;
      const id = ++checkIdRef.current;
      if (mode === 'strict') {
        setState({ kind: 'checking' });
      }

      const result = await checkLatestVersion();
      if (id !== checkIdRef.current) return;

      const session = getSessionStorage();

      if (result.status === 'current') {
        clearAutoReloadAttempt(session);
        const cleanUrl = stripReloadParams(window.location.href);
        if (cleanUrl) {
          window.history.replaceState(null, '', cleanUrl);
        }
        setState({ kind: 'ready' });
        return;
      }

      if (result.status === 'outdated') {
        if (shouldAutoReload(session, result.latestVersion)) {
          markAutoReloadAttempt(session, result.latestVersion);
          await reloadToLatest(result.latestVersion, false);
          return;
        }
        setState({
          kind: 'outdated',
          currentVersion: result.currentVersion,
          latestVersion: result.latestVersion,
        });
        return;
      }

      if (mode === 'strict') {
        setState({ kind: 'error', reason: result.reason });
      }
    },
    [reloadToLatest],
  );

  useEffect(() => {
    // Purge any legacy PWA service workers / Cache Storage on open.
    void clearBrowserCaches();
    void verify('strict');

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void verify('strict');
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void verify('background');
      }
    };

    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      checkIdRef.current += 1;
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [verify]);

  if (state.kind === 'ready') {
    return <>{children}</>;
  }

  return (
    <main className="version-gate" data-testid="version-gate" data-status={state.kind} role="status" aria-live="polite">
      <div className="version-card">
        {state.kind === 'checking' && (
          <>
            <h1 className="version-title">Checking version…</h1>
            <p className="version-message">Making sure you have the latest version of Our Home.</p>
          </>
        )}

        {state.kind === 'reloading' && (
          <>
            <h1 className="version-title">Updating game…</h1>
            <p className="version-message">Loading the latest version of Our Home.</p>
          </>
        )}

        {state.kind === 'outdated' && (
          <>
            <h1 className="version-title">Update required</h1>
            <p className="version-message">
              A newer version of Our Home is available. This older version cannot be loaded.
            </p>
            <p className="version-meta">
              Installed: <code>{state.currentVersion}</code> · Latest: <code>{state.latestVersion}</code>
            </p>
            <button
              type="button"
              className="version-button"
              onClick={() => void reloadToLatest(state.latestVersion, true)}
            >
              Reload latest version
            </button>
          </>
        )}

        {state.kind === 'error' && (
          <>
            <h1 className="version-title">Couldn&apos;t verify version</h1>
            <p className="version-message">
              Our Home requires the latest version to load. Check your connection and try again.
            </p>
            <p className="version-meta">
              Installed: <code>{APP_VERSION}</code> · {state.reason}
            </p>
            <button type="button" className="version-button" onClick={() => void verify('strict')}>
              Try again
            </button>
          </>
        )}
      </div>
    </main>
  );
}
