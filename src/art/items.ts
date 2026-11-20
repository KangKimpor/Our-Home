import type { ItemDef } from '../game/types';
import { FURNITURE_SHAPES, SMALL_SHAPES } from './shapes';
import { palette } from './palettes';
import { svgDoc, withShadow, type ArtResult } from './svg';

export const ALL_SHAPES = { ...FURNITURE_SHAPES, ...SMALL_SHAPES };

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
