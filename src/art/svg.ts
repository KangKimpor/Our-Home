/** Tiny SVG builder for the original item art. All art uses the same ink outline. */

import type { Palette } from './palettes';

export const INK = '#2B2521';

export const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const SVG_DEFS = `<defs><filter id="oh-drop" x="-12%" y="-12%" width="124%" height="128%"><feDropShadow dx="0" dy="2.2" stdDeviation="1.6" flood-color="#2B2521" flood-opacity="0.16"/></filter><linearGradient id="oh-warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFDF7" stop-opacity="0.22"/><stop offset="65%" stop-color="#FFFDF7" stop-opacity="0"/><stop offset="100%" stop-color="#2B2521" stop-opacity="0.08"/></linearGradient></defs>`;

export function r(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  rx = 0,
  stroke = INK,
  sw = 2.8,
): string {
  const radius = rx > 0 ? ` rx="${rx}"` : '';
  const body = `<rect x="${x}" y="${y}" width="${w}" height="${h}"${radius} fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  if (fill === 'none' || w < 16 || h < 12) return body;
  const topH = Math.max(2, Math.min(6, Math.round(h * 0.16)));
  const botH = Math.max(2, Math.min(7, Math.round(h * 0.18)));
  const inset = Math.min(4, Math.max(1.5, sw));
  const innerRx = Math.max(1, rx - 1.5);
  return (
    body +
    `<rect x="${x + inset}" y="${y + inset}" width="${Math.max(2, w - inset * 2)}" height="${topH}" rx="${innerRx}" fill="#FFFDF8" opacity="0.24" pointer-events="none"/>` +
    `<rect x="${x + inset}" y="${y + h - inset - botH}" width="${Math.max(2, w - inset * 2)}" height="${botH}" rx="${innerRx}" fill="#2B2521" opacity="0.09" pointer-events="none"/>`
  );
}

export function c(cx: number, cy: number, rad: number, fill: string, stroke = INK, sw = 2.8): string {
  const base = `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  if (fill === 'none' || rad < 7) return base;
  return (
    base +
    `<ellipse cx="${cx - rad * 0.24}" cy="${cy - rad * 0.28}" rx="${rad * 0.42}" ry="${rad * 0.25}" fill="#FFFDF8" opacity="0.26" transform="rotate(-18 ${cx - rad * 0.24} ${cy - rad * 0.28})" pointer-events="none"/>`
  );
}

export function el(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  stroke = INK,
  sw = 2.8,
  rotate = 0,
): string {
  const transform = rotate ? ` transform="rotate(${rotate} ${cx} ${cy})"` : '';
  const base = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${transform}/>`;
  if (fill === 'none' || rx < 10 || ry < 7 || rotate !== 0) return base;
  return (
    base +
    `<ellipse cx="${cx}" cy="${cy - ry * 0.3}" rx="${rx * 0.68}" ry="${ry * 0.28}" fill="#FFFDF8" opacity="0.2" pointer-events="none"/>`
  );
}

export function p(
  d: string,
  fill: string,
  stroke = INK,
  sw = 2.8,
  extra = '',
): string {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${extra ? ' ' + extra : ''}/>`;
}

export function line(x1: number, y1: number, x2: number, y2: number, color = INK, sw = 2.8): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

/** A soft highlight used sparingly (flat fills remain the rule). */
export function sheen(x: number, y: number, w: number, h: number, color = '#FFFFFF', opacity = 0.28): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(h / 2, 8)}" fill="${color}" opacity="${opacity}"/>`;
}

export function dots(points: [number, number][], color: string, rad = 2): string {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}"/>`).join('');
}

/** Standard leg with a little foot. */
export function leg(x: number, y: number, h: number, col: string, w = 7): string {
  return r(x, y, w, h, col, 2.5) + r(x - 1.5, y + h - 4, w + 3, 5, col, 2);
}

export function shadow(cx: number, cy: number, rx: number, ry = 8): string {
  return (
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 1.04}" ry="${ry * 1.25}" fill="#2B2521" opacity="0.08"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.82}" ry="${ry * 0.85}" fill="#2B2521" opacity="0.14"/>`
  );
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
    el(cx - 11 * s, cy - 22 * s, 9 * s, 4.8 * s, leaf, ink, sw, -35) +
    el(cx + 9 * s, cy - 30 * s, 9 * s, 4.8 * s, leaf, ink, sw, 30) +
    el(cx - 6 * s, cy - 40 * s, 8 * s, 4.4 * s, leaf, ink, sw, -25) +
    el(cx + 2 * s, cy - 50 * s, 6.5 * s, 4 * s, leaf, ink, sw, 10)
  );
}

export interface ArtResult {
  w: number;
  h: number;
  body: string;
}

export function svgDoc(result: ArtResult): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${result.w}" height="${result.h}" viewBox="0 0 ${result.w} ${result.h}">${SVG_DEFS}${result.body}</svg>`;
}

/** Convenience: full item art with a soft ground shadow. */
export function withShadow(result: ArtResult, inset = 8): ArtResult {
  return {
    ...result,
    body: shadow(result.w / 2, result.h - 4, Math.max(12, result.w / 2 - inset)) + `<g filter="url(#oh-drop)">${result.body}</g>`,
  };
}

export function paletteOr(p: Palette, key: string | undefined): string {
  if (!key) return p.main;
  return (p as unknown as Record<string, string>)[key] ?? p.main;
}

