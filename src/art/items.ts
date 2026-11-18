import type { ItemDef } from '../game/types';
import { getItemSprite, type ItemSpriteMapping } from './assetPack';
import { FURNITURE_SHAPES, SMALL_SHAPES } from './shapes';
import { palette } from './palettes';
import { svgDoc, withShadow, type ArtResult } from './svg';

export const ALL_SHAPES = { ...FURNITURE_SHAPES, ...SMALL_SHAPES };

/**
 * Returns the verified transparent-background PNG sprite URL for an item, or null if
 * the item relies on SVG artwork (e.g., palette variants or items without a transparent cutout).
 */
export function itemSpriteUrl(item: ItemDef): string | null {
  return item.sprite ?? getItemSprite(item.id)?.url ?? null;
}

export function itemSpriteInfo(item: ItemDef): ItemSpriteMapping | null {
  const mapped = getItemSprite(item.id);
  if (mapped) return mapped;
  if (item.sprite && item.spriteW && item.spriteH) {
    return {
      assetName: item.id,
      url: item.sprite,
      w: item.spriteW,
      h: item.spriteH,
    };
  }
  return null;
}

export function itemArt(item: ItemDef): ArtResult {
  const shape = ALL_SHAPES[item.art];
  if (!shape) {
    return {
      w: 100,
      h: 100,
      body: `<rect x="10" y="10" width="80" height="80" rx="12" fill="#E8A6B0" stroke="#2E2A26" stroke-width="3"/><text x="50" y="56" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#2E2A26">${item.art}</text>`,
    };
  }
  return withShadow(shape(palette(item.palette)));
}

export function itemSvg(item: ItemDef): string {
  return svgDoc(itemArt(item));
}

export function artAspect(item: ItemDef): number {
  const art = itemArt(item);
  return art.h / art.w;
}

export function itemHeight(item: ItemDef): number {
  return Math.round(item.width * artAspect(item));
}
