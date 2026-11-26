import { describe, expect, it } from 'vitest';
import { getGameAssetUrls, preloadAllAssets } from '../../src/game/assets';
import { CHARACTERS } from '../../src/game/characters';
import { ITEMS, ROOM } from '../../src/game/layout';
import sprites from '../../src/game/sprites.json';

describe('asset preloader', () => {
  it('lists the backdrop, all furniture, pet, character idle sprites, walk strips, and UI plaques', () => {
    const urls = getGameAssetUrls();
    expect(urls.some((u) => u.startsWith(ROOM.background))).toBe(true);

    for (const spriteId of Object.keys(sprites)) {
      expect(urls.some((u) => u.includes(`/sprites/${spriteId}.png`))).toBe(true);
    }
    for (const item of ITEMS) {
      expect(urls.some((u) => u.includes(`/sprites/${item.sprite}.png`))).toBe(true);
    }
    for (const char of CHARACTERS) {
      expect(urls.some((u) => u.includes(`/sprites/${char.sprite}.png`))).toBe(true);
      expect(urls.some((u) => u.includes(`/sprites/${char.walkSprite}.png`))).toBe(true);
    }
    // Includes 1 backdrop + all sprites.json entries + 4 hand-painted UI plaques.
    expect(urls.length).toBe(1 + Object.keys(sprites).length + 4);
  });

  it('waits until every asset resolves and reports monotonic progress', async () => {
    const resolvers: Array<() => void> = [];
    const progressEvents: Array<{ loaded: number; total: number }> = [];

    const promise = preloadAllAssets({
      urls: ['/a.png', '/b.png', '/c.png'],
      waitForFonts: false,
      loader: () =>
        new Promise<void>((resolve) => {
          resolvers.push(resolve);
        }),
      onProgress: (p) => progressEvents.push(p),
    });

    expect(progressEvents).toEqual([{ loaded: 0, total: 3 }]);
    expect(resolvers).toHaveLength(3);

    resolvers[0]();
    await Promise.resolve();
    resolvers[1]();
    await Promise.resolve();
    resolvers[2]();

    const result = await promise;
    expect(result).toEqual({ ok: true, total: 3 });
    expect(progressEvents[progressEvents.length - 1]).toEqual({ loaded: 3, total: 3 });
  });

  it('fails cleanly and reports failed URLs when any asset cannot load', async () => {
    const result = await preloadAllAssets({
      urls: ['/ok.png', '/broken-walk.png'],
      waitForFonts: false,
      loader: async (url) => {
        if (url.includes('broken')) throw new Error('404');
      },
    });

    expect(result).toEqual({
      ok: false,
      loaded: 1,
      total: 2,
      failedUrls: ['/broken-walk.png'],
    });
  });
});
