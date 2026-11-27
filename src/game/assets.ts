import badgeCheckUrl from '../assets/ui/badge_check.png';
import bubbleEmoteUrl from '../assets/ui/bubble_emote.png';
import buttonCloseUrl from '../assets/ui/button_close.png';
import cardOptionUrl from '../assets/ui/card_option.png';
import cardOptionSelectedUrl from '../assets/ui/card_option_selected.png';
import emoteLoveUrl from '../assets/ui/emote_love.png';
import emoteMusicUrl from '../assets/ui/emote_music.png';
import emoteShuttleUrl from '../assets/ui/emote_shuttle.png';
import emoteSleepyUrl from '../assets/ui/emote_sleepy.png';
import emoteTeaUrl from '../assets/ui/emote_tea.png';
import emoteWaveUrl from '../assets/ui/emote_wave.png';
import plaqueButtonUrl from '../assets/ui/plaque_button.png';
import plaqueNoteUrl from '../assets/ui/plaque_note.png';
import plaqueSecondaryUrl from '../assets/ui/plaque_secondary.png';
import plaqueTitleUrl from '../assets/ui/plaque_title.png';
import tabPillUrl from '../assets/ui/tab_pill.png';
import tabPillSelectedUrl from '../assets/ui/tab_pill_selected.png';
import { ROOM } from './layout';
import type { EmoteId } from './multiplayer';
import sprites from './sprites.json';
import { versionedAssetUrl } from './version';

export interface AssetPreloadProgress {
  loaded: number;
  total: number;
}

export type AssetPreloadResult =
  | { ok: true; total: number }
  | { ok: false; loaded: number; total: number; failedUrls: string[] };

export type ImageLoader = (url: string, signal?: AbortSignal) => Promise<void>;

export interface PreloadAssetsOptions {
  urls?: readonly string[];
  loader?: ImageLoader;
  onProgress?: (progress: AssetPreloadProgress) => void;
  signal?: AbortSignal;
  waitForFonts?: boolean;
}

/** Hand-drawn oat-cream speech bubble that floats above a character for emotes. */
export const BUBBLE_EMOTE_URL: string = bubbleEmoteUrl;

/** Hand-drawn emote stickers shown inside the bubble and in the Emotes picker. */
export const EMOTE_ICON_URLS: Readonly<Record<EmoteId, string>> = {
  love: emoteLoveUrl,
  wave: emoteWaveUrl,
  tea: emoteTeaUrl,
  music: emoteMusicUrl,
  sleepy: emoteSleepyUrl,
  shuttle: emoteShuttleUrl,
};

const UI_ASSET_URLS: readonly string[] = [
  plaqueTitleUrl,
  plaqueButtonUrl,
  plaqueSecondaryUrl,
  plaqueNoteUrl,
  cardOptionUrl,
  cardOptionSelectedUrl,
  tabPillUrl,
  tabPillSelectedUrl,
  buttonCloseUrl,
  badgeCheckUrl,
  bubbleEmoteUrl,
  emoteLoveUrl,
  emoteWaveUrl,
  emoteTeaUrl,
  emoteMusicUrl,
  emoteSleepyUrl,
  emoteShuttleUrl,
];

/**
 * Keeps decoded HTMLImageElement instances alive in memory so browsers do not
 * evict preloaded sprite bitmaps or walk-cycle strips before they mount.
 */
const decodedImageCache = new Map<string, HTMLImageElement>();

/**
 * Returns every visual asset required before revealing the game:
 * the room backdrop, every sprite & animation strip in sprites.json, and all hand-drawn UI art
 * (plaques, option cards, tab pills, close button, check badge, emote bubble, and emote stickers).
 */
export function getGameAssetUrls(): string[] {
  const urls = new Set<string>();
  urls.add(versionedAssetUrl(ROOM.background));
  for (const spriteId of Object.keys(sprites)) {
    urls.add(versionedAssetUrl(`/sprites/${spriteId}.png`));
  }
  for (const uiUrl of UI_ASSET_URLS) {
    urls.add(uiUrl);
  }
  return Array.from(urls);
}

/** True when the asset has already been loaded and decoded into the memory cache. */
export function isAssetLoaded(url: string): boolean {
  const cached = decodedImageCache.get(url);
  return Boolean(cached && cached.complete && cached.naturalWidth > 0);
}

/** Clears the in-memory decoded image cache (primarily for tests). */
export function clearAssetCache(): void {
  decodedImageCache.clear();
}

/** Loads and decodes a single image URL, caching the decoded element on success. */
export function loadAndDecodeImage(url: string, signal?: AbortSignal, timeoutMs = 20_000): Promise<void> {
  if (isAssetLoaded(url)) {
    return Promise.resolve();
  }
  if (signal?.aborted) {
    return Promise.reject(new Error('Aborted'));
  }

  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      signal?.removeEventListener('abort', onAbort);
    };

    const fail = (reason: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`${reason}: ${url}`));
    };

    const finish = () => {
      if (settled) return;
      if (img.naturalWidth <= 0) {
        fail('Image decoded with zero width');
        return;
      }
      settled = true;
      cleanup();
      decodedImageCache.set(url, img);
      resolve();
    };

    const onAbort = () => fail('Aborted');
    signal?.addEventListener('abort', onAbort, { once: true });

    const timer = setTimeout(() => fail('Timed out loading asset'), timeoutMs);

    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(finish, finish);
      } else {
        finish();
      }
    };
    img.onerror = () => fail('Failed to load asset');

    img.src = url;
    if (img.complete && img.naturalWidth > 0) {
      if (typeof img.decode === 'function') {
        img.decode().then(finish, finish);
      } else {
        finish();
      }
    }
  });
}

async function waitForDocumentFonts(timeoutMs = 2000): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  } catch {
    // Font readiness is best-effort; image assets remain strict.
  }
}

/**
 * Preloads and decodes all game assets (backdrop, furniture, pet, characters,
 * walk animation strips, and UI plaques) before the game is shown.
 */
export async function preloadAllAssets(options: PreloadAssetsOptions = {}): Promise<AssetPreloadResult> {
  const urls = Array.from(new Set(options.urls ?? getGameAssetUrls()));
  const loader = options.loader ?? loadAndDecodeImage;
  const total = urls.length;
  let loaded = 0;
  const failedUrls: string[] = [];

  options.onProgress?.({ loaded, total });

  await Promise.all(
    urls.map(async (url) => {
      try {
        await loader(url, options.signal);
        loaded += 1;
        options.onProgress?.({ loaded, total });
      } catch {
        failedUrls.push(url);
      }
    }),
  );

  if (options.signal?.aborted) {
    return { ok: false, loaded, total, failedUrls: failedUrls.length ? failedUrls : ['aborted'] };
  }

  if (failedUrls.length > 0) {
    return { ok: false, loaded, total, failedUrls };
  }

  if (options.waitForFonts !== false) {
    await waitForDocumentFonts();
  }

  return { ok: true, total };
}
