/** Tiny SVG builder for the original item art. All art uses the same ink outline. */

import type { Palette } from './palettes';

export const INK = '#2E2A26';

export const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function r(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  rx = 0,
  stroke = INK,
  sw = 3,
): string {
  const radius = rx > 0 ? ` rx="${rx}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}"${radius} fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

export function c(cx: number, cy: number, rad: number, fill: string, stroke = INK, sw = 3): string {
  return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

export function el(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  stroke = INK,
  sw = 3,
  rotate = 0,
): string {
  const transform = rotate ? ` transform="rotate(${rotate} ${cx} ${cy})"` : '';
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${transform}/>`;
}

export function p(
  d: string,
  fill: string,
  stroke = INK,
  sw = 3,
  extra = '',
): string {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${extra ? ' ' + extra : ''}/>`;
}

export function line(x1: number, y1: number, x2: number, y2: number, color = INK, sw = 3): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

/** A soft highlight used sparingly (flat fills remain the rule). */
export function sheen(x: number, y: number, w: number, h: number, color = '#FFFFFF', opacity = 0.25): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(h / 2, 8)}" fill="${color}" opacity="${opacity}"/>`;
}

export function dots(points: [number, number][], color: string, rad = 2): string {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}"/>`).join('');
}

/** Standard leg with a little foot. */
export function leg(x: number, y: number, h: number, col: string, w = 7): string {
  return r(x, y, w, h, col, 2) + r(x - 2, y + h - 4, w + 4, 5, col, 2);
}

export function shadow(cx: number, cy: number, rx: number, ry = 7): string {
  return el(cx, cy, rx, ry, '#2E2A26', 'none', 0).replace('/>', ' opacity="0.12"/>');
}

export function leafSprig(cx: number, cy: number, scale: number, leaf: string, ink = INK, sw = 2.4): string {
  const s = scale;
  return (
    p(
      `M ${cx} ${cy} C ${cx - 8 * s} ${cy - 20 * s} ${cx + 10 * s} ${cy - 34 * s} ${cx + 2 * s} ${cy - 50 * s}`,
      'none',
      ink,
      sw,
    ) +
    el(cx - 11 * s, cy - 22 * s, 8 * s, 4 * s, leaf, ink, sw, -35) +
    el(cx + 9 * s, cy - 30 * s, 8 * s, 4 * s, leaf, ink, sw, 30) +
    el(cx - 6 * s, cy - 40 * s, 7 * s, 4 * s, leaf, ink, sw, -25)
  );
}

export interface ArtResult {
  w: number;
  h: number;
  body: string;
}

export function svgDoc(result: ArtResult): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${result.w}" height="${result.h}" viewBox="0 0 ${result.w} ${result.h}">${result.body}</svg>`;
}

/** Convenience: full item art with a soft ground shadow. */
export function withShadow(result: ArtResult, inset = 8): ArtResult {
  return {
    ...result,
    body: shadow(result.w / 2, result.h - 4, result.w / 2 - inset) + result.body,
  };
}

export function paletteOr(p: Palette, key: string | undefined): string {
  if (!key) return p.main;
  return (p as unknown as Record<string, string>)[key] ?? p.main;
}
