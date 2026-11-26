import { describe, expect, it, vi } from 'vitest';
import {
  buildReloadUrl,
  checkLatestVersion,
  clearAutoReloadAttempt,
  markAutoReloadAttempt,
  shouldAutoReload,
  stripReloadParams,
  versionedAssetUrl,
  type StorageLike,
} from '../../src/game/version';

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const data = { ...initial };
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('version', () => {
  it('returns current when server version matches running version', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ version: '0.1.0-abc-123' }));
    const result = await checkLatestVersion({
      currentVersion: '0.1.0-abc-123',
      baseUrl: '/',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 42,
    });

    expect(result).toEqual({
      status: 'current',
      currentVersion: '0.1.0-abc-123',
      latestVersion: '0.1.0-abc-123',
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      '/version.json?t=42',
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        }),
      }),
    );
  });

  it('returns outdated when server version differs from running version', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ version: '0.2.0-new' }));
    const result = await checkLatestVersion({
      currentVersion: '0.1.0-old',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result).toEqual({
      status: 'outdated',
      currentVersion: '0.1.0-old',
      latestVersion: '0.2.0-new',
    });
  });

  it('returns error on HTTP error, network failure, or malformed manifest', async () => {
    const httpErr = await checkLatestVersion({
      currentVersion: '1.0.0',
      fetchImpl: (async () => new Response('fail', { status: 503 })) as unknown as typeof fetch,
    });
    expect(httpErr.status).toBe('error');

    const netErr = await checkLatestVersion({
      currentVersion: '1.0.0',
      fetchImpl: (async () => {
        throw new Error('offline');
      }) as unknown as typeof fetch,
    });
    expect(netErr).toEqual({ status: 'error', currentVersion: '1.0.0', reason: 'offline' });

    const badJson = await checkLatestVersion({
      currentVersion: '1.0.0',
      fetchImpl: (async () => jsonResponse({ version: '   ' })) as unknown as typeof fetch,
    });
    expect(badJson.status).toBe('error');
  });

  it('respects custom baseUrl without double slashes', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ version: '1.0.0' }));
    await checkLatestVersion({
      currentVersion: '1.0.0',
      baseUrl: '/our-home',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 99,
    });
    expect(fetchImpl).toHaveBeenCalledWith('/our-home/version.json?t=99', expect.anything());
  });

  it('appends version query param to asset URLs', () => {
    expect(versionedAssetUrl('/sprites/wall_clock.png', '1.2.3')).toBe('/sprites/wall_clock.png?v=1.2.3');
    expect(versionedAssetUrl('/sprites/wall_clock.png?raw=1', '1.2.3')).toBe('/sprites/wall_clock.png?raw=1&v=1.2.3');
  });

  it('builds and strips cache-busting reload URLs while keeping user params and hash', () => {
    const reloadUrl = buildReloadUrl('https://game.example/?room=living#top', '0.2.0', false);
    expect(reloadUrl).toBe('https://game.example/?room=living&_v=0.2.0#top');

    const forcedUrl = buildReloadUrl(reloadUrl, '0.2.0', true, () => 12345);
    expect(forcedUrl).toBe('https://game.example/?room=living&_v=0.2.0&_t=12345#top');

    expect(stripReloadParams(forcedUrl)).toBe('/?room=living#top');
    expect(stripReloadParams('https://game.example/?room=living#top')).toBeNull();
  });

  it('allows one auto-reload per target version and avoids infinite loops', () => {
    const storage = memoryStorage();
    expect(shouldAutoReload(storage, '2.0.0')).toBe(true);

    markAutoReloadAttempt(storage, '2.0.0');
    expect(shouldAutoReload(storage, '2.0.0')).toBe(false);
    expect(shouldAutoReload(storage, '2.0.1')).toBe(true);

    clearAutoReloadAttempt(storage);
    expect(shouldAutoReload(storage, '2.0.0')).toBe(true);

    expect(shouldAutoReload(undefined, '2.0.0')).toBe(false);
  });
});
