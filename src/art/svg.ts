/**
 * Hand-inked SVG builder for Our Home.
 *
 * Every primitive here is drawn the way a person would draw it: edges bow a little, sharp
 * boxes are four strokes that cross at the corners, circles loop past their start, and ink
 * lines swell and thin with pen pressure. Finished art is passed through `oh-hand`, a filter
 * that adds a fine ink wobble and a pencil/paper grain to the fills.
 */

import type { Palette } from './palettes';
import {
  n2,
  pressureDashes,
  roughEllipseFillD,
  roughEllipseStrokeD,
  roughLineD,
  roughRectD,
  roughRectStrokeD,
  seedOf,
} from './hand';

export const INK = '#2B2521';
export const INK_SOFT = '#4A3F37';

export const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const SVG_DEFS = `<defs>
  <filter id="oh-drop" x="-14%" y="-14%" width="128%" height="132%">
    <feDropShadow dx="0.6" dy="2" stdDeviation="0.7" flood-color="#2B2521" flood-opacity="0.13"/>
  </filter>
  <linearGradient id="oh-warm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFFDF8" stop-opacity="0.22"/>
    <stop offset="55%" stop-color="#FFFDF8" stop-opacity="0"/>
    <stop offset="100%" stop-color="#2B2521" stop-opacity="0.1"/>
  </linearGradient>
  <linearGradient id="oh-cushion" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFFDF8" stop-opacity="0.26"/>
    <stop offset="45%" stop-color="#FFFDF8" stop-opacity="0.04"/>
    <stop offset="100%" stop-color="#2B2521" stop-opacity="0.12"/>
  </linearGradient>
  <pattern id="oh-glass" patternUnits="userSpaceOnUse" width="11" height="11" patternTransform="rotate(-38)">
    <rect width="11" height="11" fill="#FFFFFF" fill-opacity="0.1"/>
    <path d="M -1 3 Q 5 2.4 12 3.2" stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round" stroke-opacity="0.6" fill="none"/>
  </pattern>
  <pattern id="oh-metal" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(-30)">
    <path d="M -1 2 L 9 2" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.4"/>
  </pattern>
  <pattern id="oh-hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-50)">
    <path d="M -1 2 Q 3 1.6 7 2.2" stroke="#2B2521" stroke-width="1.1" stroke-linecap="round" fill="none"/>
  </pattern>
  <radialGradient id="oh-glow" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="#FFFBE4" stop-opacity="0.72"/>
    <stop offset="55%" stop-color="#FCE79C" stop-opacity="0.26"/>
    <stop offset="100%" stop-color="#FCE79C" stop-opacity="0"/>
  </radialGradient>
</defs>`;

/**
 * The finishing pass: a gentle displacement so no line is mathematically straight, plus
 * dark pencil tooth and light paper flecks inside the colour.
 */
export function handFilter(w: number, h: number): string {
  const size = Math.min(w, h);
  const scale = Math.max(0.55, Math.min(2.1, size / 85));
  return `<filter id="oh-hand" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="2" seed="11" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="${n2(scale)}" xChannelSelector="R" yChannelSelector="G" result="ink"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="1" seed="4" result="tooth"/>
    <feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0.17  0 0 0 0 0.14  0 0 0 0 0.12  0.62 0 0 0 -0.28" result="dark"/>
    <feColorMatrix in="tooth" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.97  -0.75 0 0 0 0.25" result="light"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="23" result="wash"/>
    <feColorMatrix in="wash" type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.18  0 0 0 0 0.12  0.7 0 0 0 -0.31" result="pool"/>
    <feColorMatrix in="wash" type="matrix" values="0 0 0 0 1  0 0 0 0 0.99  0 0 0 0 0.94  -0.75 0 0 0 0.33" result="bloom"/>
    <feMerge result="tex"><feMergeNode in="pool"/><feMergeNode in="bloom"/><feMergeNode in="dark"/><feMergeNode in="light"/></feMerge>
    <feComposite in="tex" in2="ink" operator="in" result="texIn"/>
    <feMerge><feMergeNode in="ink"/><feMergeNode in="texIn"/></feMerge>
  </filter>`;
}

/** Full standalone SVG document wrapped in the hand-drawn finishing filter. */
export function svgMarkup(body: string, w: number, h: number, pxW = w, pxH = h): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 ${w} ${h}">` +
    SVG_DEFS.replace('</defs>', `${handFilter(w, h)}</defs>`) +
    `<g filter="url(#oh-hand)">${body}</g></svg>`
  );
}

const hasStroke = (stroke: string, sw: number) => stroke !== 'none' && sw > 0;

/** Ink line along `d` with a second, wider pen pass in broken dashes for pressure. */
function ink(d: string, stroke: string, sw: number, seed: number, extra = ''): string {
  const ex = extra ? ' ' + extra : '';
  const base = `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${ex}/>`;
  if (sw < 2.3 || /opacity|dasharray/.test(extra) || stroke.startsWith('rgba') || stroke.startsWith('url')) return base;
  const offset = n2(Math.abs(seed % 37));
  return (
    base +
    `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${n2(sw * 1.24)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${pressureDashes(seed, sw)}" stroke-dashoffset="${offset}"${ex}/>`
  );
}

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
  const fillPart = fill === 'none' ? '' : `<path d="${roughRectD(x, y, w, h, rx)}" fill="${fill}"/>`;
  if (!hasStroke(stroke, sw)) return fillPart;
  return fillPart + ink(roughRectStrokeD(x, y, w, h, rx), stroke, sw, seedOf(x, y, w, h, 9));
}

/** Cushion or plump upholstered panel with a hand-drawn outline and a loose highlight stroke. */
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
  return (
    r(x, y, w, h, fill, rx, stroke, sw) +
    (w > 34
      ? `<path d="${roughLineD(x + 10, y + 5.5, x + w * 0.62, y + 4.5)}" fill="none" stroke="#FFFDF8" stroke-width="1.9" stroke-linecap="round" opacity="0.5" pointer-events="none"/>`
      : '')
  );
}

export function c(cx: number, cy: number, rad: number, fill: string, stroke = INK, sw = 2.8): string {
  if (rad < 3.2) {
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}"${hasStroke(stroke, sw) ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`;
  }
  const fillPart = fill === 'none' ? '' : `<path d="${roughEllipseFillD(cx, cy, rad, rad)}" fill="${fill}"/>`;
  if (!hasStroke(stroke, sw)) return fillPart;
  return fillPart + ink(roughEllipseStrokeD(cx, cy, rad, rad), stroke, sw, seedOf(cx, cy, rad, 7));
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
  let body: string;
  if (Math.min(rx, ry) < 2.6) {
    body = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${hasStroke(stroke, sw) ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`;
  } else {
    body = fill === 'none' ? '' : `<path d="${roughEllipseFillD(cx, cy, rx, ry)}" fill="${fill}"/>`;
    if (hasStroke(stroke, sw)) body += ink(roughEllipseStrokeD(cx, cy, rx, ry), stroke, sw, seedOf(cx, cy, rx, ry, 8));
  }
  return rotate ? `<g transform="rotate(${rotate} ${cx} ${cy})">${body}</g>` : body;
}

export function p(
  d: string,
  fill: string,
  stroke = INK,
  sw = 2.8,
  extra = '',
): string {
  const ex = extra ? ' ' + extra : '';
  if (!hasStroke(stroke, sw)) return `<path d="${d}" fill="${fill}"${ex}/>`;
  const seed = seedOf(d.length, sw, d.charCodeAt(2) || 0, d.charCodeAt(d.length - 2) || 0);
  if (fill === 'none') return ink(d, stroke, sw, seed, extra);
  return (
    `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${ex}/>` +
    (/opacity|dasharray/.test(extra) ? '' : ink(d, stroke, sw, seed).replace(/^<path[^>]*\/>/, ''))
  );
}

/** Flat-filled path with a hand-inked outline. */
export function shadedPath(
  d: string,
  fill: string,
  stroke = INK,
  sw = 2.8,
  extra = '',
): string {
  return p(d, fill, stroke, sw, extra);
}

export function line(x1: number, y1: number, x2: number, y2: number, color = INK, sw = 2.8): string {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 7) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }
  return ink(roughLineD(x1, y1, x2, y2), color, sw, seedOf(x1, y1, x2, y2, 6));
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
  // A loose highlight stroke or two rather than a perfect pill.
  const mid = y + h / 2;
  const sw = Math.max(1.4, Math.min(h * 0.75, 5));
  return (
    `<path d="${roughLineD(x + sw / 2, mid, x + w * 0.66, mid - h * 0.08)}" fill="none" stroke="${color}" stroke-width="${n2(sw)}" stroke-linecap="round" opacity="${Math.min(0.85, opacity * 1.7)}" pointer-events="none"/>` +
    (w > 18
      ? `<path d="${roughLineD(x + w * 0.74, mid - h * 0.1, x + w - sw / 2, mid - h * 0.14)}" fill="none" stroke="${color}" stroke-width="${n2(sw * 0.8)}" stroke-linecap="round" opacity="${Math.min(0.85, opacity * 1.5)}" pointer-events="none"/>`
      : '')
  );
}

export function dots(points: [number, number][], color: string, rad = 2): string {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}"/>`).join('');
}

/** Tapered wooden leg with rounded shoe foot and top shadow under the frame. */
export function leg(x: number, y: number, h: number, col: string, w = 7): string {
  return (
    p(`M ${x} ${y} L ${x + w} ${y} L ${x + w - 1} ${y + h - 3} L ${x + 1} ${y + h - 3} Z`, col, INK, 2.4) +
    el(x + w / 2, y + h - 1, w * 0.68, 2.8, col, INK, 2.2) +
    `<path d="${roughLineD(x + 1.2, y + 2.4, x + w - 1.2, y + 2)}" stroke="#2B2521" stroke-width="2.2" stroke-linecap="round" opacity="0.25"/>`
  );
}

/** Ground shadow: a soft wash with loose pencil hatching, the way it would be shaded by hand. */
export function shadow(cx: number, cy: number, rx: number, ry = 8): string {
  let hatch = '';
  const step = Math.max(5, Math.min(9, rx / 7));
  for (let x = cx - rx * 0.82; x <= cx + rx * 0.82; x += step) {
    const u = (x - cx) / rx;
    const hy = ry * 0.78 * Math.sqrt(Math.max(0, 1 - u * u));
    if (hy < 1.4) continue;
    hatch += `M ${n2(x - hy * 0.7)} ${n2(cy + hy)} L ${n2(x + hy * 0.7)} ${n2(cy - hy)} `;
  }
  return (
    `<path d="${roughEllipseFillD(cx, cy, rx * 1.02, ry * 1.18)}" fill="#2B2521" opacity="0.08"/>` +
    `<path d="${roughEllipseFillD(cx, cy + 0.5, rx * 0.8, ry * 0.78)}" fill="#2B2521" opacity="0.08"/>` +
    (hatch ? `<path d="${hatch.trim()}" stroke="#2B2521" stroke-width="1.2" stroke-linecap="round" opacity="0.2" fill="none"/>` : '')
  );
}

export function leafSprig(cx: number, cy: number, scale: number, leaf: string, ink = INK, sw = 2.2): string {
  const s = scale;
  const leafShape = (lx: number, ly: number, rx: number, ry: number, rot: number) =>
    `<g transform="translate(${lx} ${ly}) rotate(${rot})">` +
    p(
      `M ${n2(-rx)} 0 Q ${n2(-rx * 0.2)} ${n2(-ry * 1.5)} ${n2(rx)} ${n2(-ry * 0.1)} Q ${n2(rx * 0.1)} ${n2(ry * 1.45)} ${n2(-rx)} 0 Z`,
      leaf,
      ink,
      sw,
    ) +
    `<path d="M ${n2(-rx * 0.7)} 0.2 Q 0 ${n2(-ry * 0.25)} ${n2(rx * 0.62)} ${n2(-ry * 0.1)}" stroke="${INK}" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.35"/>` +
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
  return svgMarkup(result.body, result.w, result.h);
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
