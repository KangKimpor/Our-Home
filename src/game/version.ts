export const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

export type VersionCheckResult =
  | { status: 'current'; currentVersion: string; latestVersion: string }
  | { status: 'outdated'; currentVersion: string; latestVersion: string }
  | { status: 'error'; currentVersion: string; reason: string };

export interface CheckVersionOptions {
  currentVersion?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  now?: () => number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const RELOAD_STORAGE_KEY = 'our-home:version-reload-target';
const RELOAD_VERSION_PARAM = '_v';
const RELOAD_TIMESTAMP_PARAM = '_t';

/** Appends the active build version to public static asset paths so browsers never serve stale art. */
export function versionedAssetUrl(path: string, version: string = APP_VERSION): string {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}v=${encodeURIComponent(version)}`;
}

/** Fetches the server's version manifest bypassing caches and verifies it matches the running build. */
export async function checkLatestVersion(options: CheckVersionOptions = {}): Promise<VersionCheckResult> {
  const currentVersion = options.currentVersion ?? APP_VERSION;
  const rawBase = options.baseUrl ?? (typeof import.meta !== 'undefined' ? import.meta.env?.BASE_URL : '/') ?? '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 10_000;
  const now = options.now ?? Date.now;

  if (typeof fetchImpl !== 'function') {
    return { status: 'error', currentVersion, reason: 'Fetch is unavailable' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${base}version.json?t=${now()}`;
    const response = await fetchImpl(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return { status: 'error', currentVersion, reason: `Version check failed (HTTP ${response.status})` };
    }

    const data = (await response.json()) as { version?: unknown } | null;
    if (!data || typeof data.version !== 'string' || data.version.trim().length === 0) {
      return { status: 'error', currentVersion, reason: 'Invalid version manifest' };
    }

    const latestVersion = data.version.trim();
    if (latestVersion !== currentVersion) {
      return { status: 'outdated', currentVersion, latestVersion };
    }

    return { status: 'current', currentVersion, latestVersion };
  } catch (err) {
    const reason =
      err instanceof Error && err.name === 'AbortError'
        ? 'Version check timed out'
        : err instanceof Error && err.message
          ? err.message
          : 'Network error';
    return { status: 'error', currentVersion, reason };
  } finally {
    clearTimeout(timer);
  }
}

/** Unregisters any legacy service workers and clears Cache Storage so stale bundles cannot persist. */
export async function clearBrowserCaches(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister().catch(() => false)));
    }
  } catch {
    // Ignore environments where serviceWorker API is restricted.
  }

  try {
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key).catch(() => false)));
    }
  } catch {
    // Ignore environments where Cache Storage is unavailable.
  }
}

/** Builds a cache-busting URL for reloading into the latest version while preserving params and hash. */
export function buildReloadUrl(
  href: string,
  latestVersion: string,
  forceUnique = false,
  now: () => number = Date.now,
): string {
  const url = new URL(href);
  url.searchParams.set(RELOAD_VERSION_PARAM, latestVersion);
  if (forceUnique) {
    url.searchParams.set(RELOAD_TIMESTAMP_PARAM, String(now()));
  } else {
    url.searchParams.delete(RELOAD_TIMESTAMP_PARAM);
  }
  return url.toString();
}

/** Removes internal version-reload query params after a verified load; returns null if already clean. */
export function stripReloadParams(href: string): string | null {
  const url = new URL(href);
  if (!url.searchParams.has(RELOAD_VERSION_PARAM) && !url.searchParams.has(RELOAD_TIMESTAMP_PARAM)) {
    return null;
  }
  url.searchParams.delete(RELOAD_VERSION_PARAM);
  url.searchParams.delete(RELOAD_TIMESTAMP_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Returns true if we have not yet auto-reloaded for this latestVersion in the current session. */
export function shouldAutoReload(storage: StorageLike | undefined, latestVersion: string): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(RELOAD_STORAGE_KEY) !== latestVersion;
  } catch {
    return false;
  }
}

export function markAutoReloadAttempt(storage: StorageLike | undefined, latestVersion: string): void {
  try {
    storage?.setItem(RELOAD_STORAGE_KEY, latestVersion);
  } catch {
    // Ignore blocked storage.
  }
}

export function clearAutoReloadAttempt(storage: StorageLike | undefined): void {
  try {
    storage?.removeItem(RELOAD_STORAGE_KEY);
  } catch {
    // Ignore blocked storage.
  }
}
