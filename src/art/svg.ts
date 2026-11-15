/** Storybook-illustrated SVG builder for Our Home. Warm sepia ink outlines, soft gradients & organic shading. */

import type { Palette } from './palettes';

export const INK = '#2B2521';
export const INK_SOFT = '#4A3F37';

export const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const SVG_DEFS = `<defs>
  <filter id="oh-drop" x="-14%" y="-14%" width="128%" height="132%">
    <feDropShadow dx="0" dy="2.5" stdDeviation="1.8" flood-color="#2B2521" flood-opacity="0.16"/>
  </filter>
  <linearGradient id="oh-warm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFFDF8" stop-opacity="0.28"/>
    <stop offset="55%" stop-color="#FFFDF8" stop-opacity="0"/>
    <stop offset="100%" stop-color="#2B2521" stop-opacity="0.12"/>
  </linearGradient>
  <linearGradient id="oh-cushion" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFFDF8" stop-opacity="0.34"/>
    <stop offset="45%" stop-color="#FFFDF8" stop-opacity="0.06"/>
    <stop offset="100%" stop-color="#2B2521" stop-opacity="0.14"/>
  </linearGradient>
  <linearGradient id="oh-glass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.48"/>
    <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="#2B2521" stop-opacity="0.08"/>
  </linearGradient>
  <linearGradient id="oh-metal" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45"/>
    <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="#2B2521" stop-opacity="0.18"/>
  </linearGradient>
  <radialGradient id="oh-glow" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="#FFFBE4" stop-opacity="0.72"/>
    <stop offset="55%" stop-color="#FCE79C" stop-opacity="0.26"/>
    <stop offset="100%" stop-color="#FCE79C" stop-opacity="0"/>
  </radialGradient>
</defs>`;

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
  if (fill === 'none' || w < 14 || h < 12) return body;
  const inset = Math.min(2.5, sw * 0.65);
  const innerRx = Math.max(0, rx - 1.5);
  const innerRadius = innerRx > 0 ? ` rx="${innerRx}"` : '';
  return (
    body +
    `<rect x="${x + inset * 0.5}" y="${y + inset * 0.5}" width="${Math.max(2, w - inset)}" height="${Math.max(2, h - inset)}"${innerRadius} fill="url(#oh-warm)" pointer-events="none"/>`
  );
}

/** Cushion or plump upholstered panel with soft crown highlight and curved seam. */
export function cushion(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  rx = 12,
  stroke = INK,
  sw = 2.6,
): string {
  const radius = rx > 0 ? ` rx="${rx}"` : '';
  const inset = 2;
  const innerRx = Math.max(2, rx - 2);
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"${radius} fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<rect x="${x + inset}" y="${y + inset}" width="${Math.max(4, w - inset * 2)}" height="${Math.max(4, h - inset * 2)}" rx="${innerRx}" fill="url(#oh-cushion)" pointer-events="none"/>` +
    (w > 34
      ? `<path d="M ${x + 10} ${y + 5} Q ${x + w / 2} ${y + 3} ${x + w - 10} ${y + 5}" fill="none" stroke="#FFFDF8" stroke-width="2" stroke-linecap="round" opacity="0.38" pointer-events="none"/>`
      : '')
  );
}

export function c(cx: number, cy: number, rad: number, fill: string, stroke = INK, sw = 2.8): string {
  const base = `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  if (fill === 'none' || rad < 7) return base;
  return (
    base +
    `<circle cx="${cx}" cy="${cy}" r="${Math.max(1, rad - sw * 0.45)}" fill="url(#oh-warm)" pointer-events="none"/>` +
    `<ellipse cx="${cx - rad * 0.25}" cy="${cy - rad * 0.3}" rx="${rad * 0.38}" ry="${rad * 0.2}" fill="#FFFDF8" opacity="0.3" transform="rotate(-22 ${cx - rad * 0.25} ${cy - rad * 0.3})" pointer-events="none"/>`
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
    `<ellipse cx="${cx}" cy="${cy}" rx="${Math.max(2, rx - 1.5)}" ry="${Math.max(2, ry - 1.5)}" fill="url(#oh-warm)" pointer-events="none"/>` +
    `<ellipse cx="${cx - rx * 0.16}" cy="${cy - ry * 0.34}" rx="${rx * 0.5}" ry="${ry * 0.2}" fill="#FFFDF8" opacity="0.24" pointer-events="none"/>`
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

/** Path with automatic warm top-to-bottom shading overlay for solid shapes. */
export function shadedPath(
  d: string,
  fill: string,
  stroke = INK,
  sw = 2.8,
  extra = '',
): string {
  return (
    p(d, fill, stroke, sw, extra) +
    (fill !== 'none' ? `<path d="${d}" fill="url(#oh-warm)" pointer-events="none"/>` : '')
  );
}

export function line(x1: number, y1: number, x2: number, y2: number, color = INK, sw = 2.8): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

/** Subtle wood-grain streaks inside timber planks/panels. */
export function woodGrain(x: number, y: number, w: number, h: number, color = '#5B4130'): string {
  const y1 = y + Math.round(h * 0.36);
  const y2 = y + Math.round(h * 0.68);
  return (
    `<path d="M ${x + 8} ${y1} Q ${x + w * 0.38} ${y1 - 2.5} ${x + w * 0.72} ${y1 + 1}" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" opacity="0.24" pointer-events="none"/>` +
    (h >= 16
      ? `<path d="M ${x + w * 0.24} ${y2} Q ${x + w * 0.56} ${y2 + 2.5} ${x + w - 10} ${y2 - 1}" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" opacity="0.2" pointer-events="none"/>`
      : '')
  );
}

/** Soft arc highlight used for glass, pottery, or polished surfaces. */
export function sheen(x: number, y: number, w: number, h: number, color = '#FFFFFF', opacity = 0.28): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(h / 2, 8)}" fill="${color}" opacity="${opacity}" pointer-events="none"/>`;
}

export function dots(points: [number, number][], color: string, rad = 2): string {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}"/>`).join('');
}

/** Tapered wooden leg with rounded shoe foot and top shadow under the frame. */
export function leg(x: number, y: number, h: number, col: string, w = 7): string {
  return (
    `<path d="M ${x} ${y} L ${x + w} ${y} L ${x + w - 1} ${y + h - 3} L ${x + 1} ${y + h - 3} Z" fill="${col}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<ellipse cx="${x + w / 2}" cy="${y + h - 1}" rx="${w * 0.68}" ry="2.8" fill="${col}" stroke="${INK}" stroke-width="2.2"/>` +
    `<line x1="${x + 1.2}" y1="${y + 2}" x2="${x + w - 1.2}" y2="${y + 2}" stroke="#2B2521" stroke-width="2.2" opacity="0.25"/>`
  );
}

export function shadow(cx: number, cy: number, rx: number, ry = 8): string {
  return (
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 1.05}" ry="${ry * 1.25}" fill="#2B2521" opacity="0.07"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.84}" ry="${ry * 0.85}" fill="#2B2521" opacity="0.14"/>`
  );
}

export function leafSprig(cx: number, cy: number, scale: number, leaf: string, ink = INK, sw = 2.2): string {
  const s = scale;
  const leafShape = (lx: number, ly: number, rx: number, ry: number, rot: number) =>
    `<g transform="translate(${lx} ${ly}) rotate(${rot})">` +
    `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${leaf}" stroke="${ink}" stroke-width="${sw}"/>` +
    `<line x1="${-rx * 0.65}" y1="0" x2="${rx * 0.65}" y2="0" stroke="#FFFDF8" stroke-width="1.3" stroke-linecap="round" opacity="0.35"/>` +
    `</g>`;

  return (
    p(
      `M ${cx} ${cy} C ${cx - 8 * s} ${cy - 20 * s} ${cx + 10 * s} ${cy - 34 * s} ${cx + 2 * s} ${cy - 52 * s}`,
      'none',
      ink,
      sw,
    ) +
    leafShape(cx - 12 * s, cy - 22 * s, 9.5 * s, 5 * s, -36) +
    leafShape(cx + 10 * s, cy - 29 * s, 9.5 * s, 5 * s, 32) +
    leafShape(cx - 8 * s, cy - 40 * s, 8.5 * s, 4.6 * s, -24) +
    leafShape(cx + 8 * s, cy - 45 * s, 7.5 * s, 4.2 * s, 24) +
    leafShape(cx + 2 * s, cy - 53 * s, 7 * s, 4.2 * s, 8)
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
