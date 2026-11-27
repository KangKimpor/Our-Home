import { describe, expect, it } from 'vitest';
import { getGameAssetUrls, preloadAllAssets } from '../../src/game/assets';
import { CHARACTERS } from '../../src/game/characters';
import { FURNITURE_SLOTS, ROOM } from '../../src/game/layout';
import { PET_OPTIONS } from '../../src/game/pet';
import sprites from '../../src/game/sprites.json';

describe('asset preloader', () => {
  it('lists the backdrop, all furniture, pet, character idle sprites, walk strips, and hand-drawn UI art', () => {
    const urls = getGameAssetUrls();
    expect(urls.some((u) => u.startsWith(ROOM.background))).toBe(true);

    for (const spriteId of Object.keys(sprites)) {
      expect(urls.some((u) => u.includes(`/sprites/${spriteId}.png`))).toBe(true);
    }
    // Every swappable furniture option and pet companion is decoded before the room appears,
    // so swapping art in Decorate mode is instant.
    for (const slot of FURNITURE_SLOTS) {
      for (const option of slot.options) {
        expect(
          urls.some((u) => u.includes(`/sprites/${option.sprite}.png`)),
          `${slot.id}/${option.id}`,
        ).toBe(true);
      }
    }
    for (const pet of PET_OPTIONS) {
      expect(
        urls.some((u) => u.includes(`/sprites/${pet.sprite}.png`)),
        pet.id,
      ).toBe(true);
    }
    for (const char of CHARACTERS) {
      for (const outfit of char.outfits) {
        expect(urls.some((u) => u.includes(`/sprites/${outfit.sprite}.png`))).toBe(true);
        expect(urls.some((u) => u.includes(`/sprites/${outfit.walkSprite}.png`))).toBe(true);
      }
    }
    for (const char of CHARACTERS) {
      expect(urls.some((u) => u.includes(`/sprites/${char.sprite}.png`))).toBe(true);
      expect(urls.some((u) => u.includes(`/sprites/${char.walkSprite}.png`))).toBe(true);
    }
    // Every hand-drawn UI piece (plaques, cards, tab pills, close button, check badge,
    // multiplayer emote bubble + stickers) is decoded too.
    for (const ui of [
      'plaque_title',
      'plaque_button',
      'plaque_secondary',
      'plaque_note',
      'card_option',
      'card_option_selected',
      'tab_pill',
      'tab_pill_selected',
      'button_close',
      'badge_check',
      'bubble_emote',
      'emote_love',
      'emote_wave',
      'emote_tea',
      'emote_music',
      'emote_sleepy',
      'emote_shuttle',
    ]) {
      expect(
        urls.some((u) => u.includes(`/${ui}.png`)),
        ui,
      ).toBe(true);
    }
    // Includes 1 backdrop + all sprites.json entries + 17 hand-painted UI assets
    // (10 plaques/cards/pills/buttons + the emote bubble + 6 emote stickers).
    expect(urls.length).toBe(1 + Object.keys(sprites).length + 17);
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
