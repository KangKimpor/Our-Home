/**
 * Hand-drawn geometry toolkit for Our Home.
 *
 * Everything here is deterministic: the same shape parameters always produce the same
 * wobble, so textures are stable across rebuilds and fills line up with their outlines.
 * The goal is to remove the tells of code-drawn art — perfect rectangles, perfect circles,
 * uniform line weight, lines that stop exactly at corners — and replace them with the small
 * irregularities of a pen on paper: bowed edges, overshooting corners, circles that don't
 * quite close, and pressure that swells and thins along a stroke.
 */

export type Pt = [number, number];

/** FNV-style hash over numbers → 32-bit seed. */
export function seedOf(...values: number[]): number {
  let h = 2166136261 >>> 0;
  for (const v of values) {
    h ^= Math.round(v * 97) | 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32 PRNG returning a function that yields floats in [-1, 1). */
export function jitterRng(seed: number): () => number {
  let a = seed >>> 0 || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}

/** Compact number formatting for SVG path data. */
export const n2 = (v: number): string => {
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? '0' : String(r);
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** How much a shape of this size is allowed to wobble (in its own units). */
export function wobbleFor(size: number): number {
  return clamp(size * 0.022, 0.25, 1.7);
}

// ---------------------------------------------------------------------------
// Catmull-Rom → cubic Bézier helpers
// ---------------------------------------------------------------------------

function crSegment(p0: Pt, p1: Pt, p2: Pt, p3: Pt): string {
  const c1x = p1[0] + (p2[0] - p0[0]) / 6;
  const c1y = p1[1] + (p2[1] - p0[1]) / 6;
  const c2x = p2[0] - (p3[0] - p1[0]) / 6;
  const c2y = p2[1] - (p3[1] - p1[1]) / 6;
  return `C ${n2(c1x)} ${n2(c1y)} ${n2(c2x)} ${n2(c2y)} ${n2(p2[0])} ${n2(p2[1])}`;
}

/** Smooth closed curve through points. */
export function closedCurveD(pts: Pt[]): string {
  const n = pts.length;
  let d = `M ${n2(pts[0][0])} ${n2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    d += ' ' + crSegment(pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]);
  }
  return d + ' Z';
}

/** Smooth open curve through points (end tangents mirrored). */
export function openCurveD(pts: Pt[]): string {
  const n = pts.length;
  if (n < 2) return '';
  let d = `M ${n2(pts[0][0])} ${n2(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = i === 0 ? pts[0] : pts[i - 1];
    const p3 = i + 2 < n ? pts[i + 2] : pts[n - 1];
    d += ' ' + crSegment(p0, pts[i], pts[i + 1], p3);
  }
  return d;
}

// ---------------------------------------------------------------------------
// Ellipses — fills are closed and slightly lumpy; strokes overshoot their start.
// ---------------------------------------------------------------------------

export function ellipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  turns = 1,
  count?: number,
): Pt[] {
  const rnd = jitterRng(seed);
  const size = Math.min(rx, ry);
  const k = count ?? clamp(Math.round(Math.max(rx, ry) / 6), 7, 18);
  const amp = clamp(size * 0.035, 0.12, 1.4);
  const a0 = rnd() * Math.PI;
  const total = Math.round(k * turns);
  const pts: Pt[] = [];
  // Radius drifts slowly so an overshooting loop lands just inside/outside its start.
  const drift = turns > 1 ? rnd() * amp * 1.4 : 0;
  for (let i = 0; i <= total - (turns > 1 ? 0 : 1); i++) {
    const t = i / k;
    const a = a0 + t * Math.PI * 2;
    const dr = rnd() * amp + drift * (t / turns);
    pts.push([cx + Math.cos(a) * (rx + dr), cy + Math.sin(a) * (ry + dr)]);
  }
  return pts;
}

export function roughEllipseFillD(cx: number, cy: number, rx: number, ry: number): string {
  return closedCurveD(ellipsePoints(cx, cy, rx, ry, seedOf(cx, cy, rx, ry, 1)));
}

export function roughEllipseStrokeD(cx: number, cy: number, rx: number, ry: number): string {
  const size = Math.min(rx, ry);
  // Small circles get a gentle overlap; large ones get the classic loose doodle loop.
  const turns = size < 10 ? 1.06 : 1.1;
  return openCurveD(ellipsePoints(cx, cy, rx, ry, seedOf(cx, cy, rx, ry, 1), turns));
}

// ---------------------------------------------------------------------------
// Rectangles
// ---------------------------------------------------------------------------

function cornerJitter(x: number, y: number, w: number, h: number): Pt[] {
  const rnd = jitterRng(seedOf(x, y, w, h, 2));
  const amp = wobbleFor(Math.min(w, h));
  return [
    [x + rnd() * amp, y + rnd() * amp],
    [x + w + rnd() * amp, y + rnd() * amp],
    [x + w + rnd() * amp, y + h + rnd() * amp],
    [x + rnd() * amp, y + h + rnd() * amp],
  ];
}

/** Edge between two points with a slight belly, as a quadratic. */
function bowTo(a: Pt, b: Pt, rnd: () => number, amp: number): string {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const bow = rnd() * Math.min(amp * 1.1, len * 0.02);
  return `Q ${n2(mx - (dy / len) * bow)} ${n2(my + (dx / len) * bow)} ${n2(b[0])} ${n2(b[1])}`;
}

export function roughRectD(x: number, y: number, w: number, h: number, rx = 0): string {
  const c = cornerJitter(x, y, w, h);
  const rnd = jitterRng(seedOf(x, y, w, h, 3));
  const amp = wobbleFor(Math.min(w, h));
  const rr = Math.max(0, Math.min(rx, w / 2, h / 2));
  if (rr <= 0.5) {
    return `M ${n2(c[0][0])} ${n2(c[0][1])} ${bowTo(c[0], c[1], rnd, amp)} ${bowTo(c[1], c[2], rnd, amp)} ${bowTo(c[2], c[3], rnd, amp)} ${bowTo(c[3], c[0], rnd, amp)} Z`;
  }
  const [tl, tr, br, bl] = c;
  const s: Pt = [tl[0] + rr, tl[1]];
  const e1: Pt = [tr[0] - rr, tr[1]];
  const e2: Pt = [tr[0], tr[1] + rr];
  const e3: Pt = [br[0], br[1] - rr];
  const e4: Pt = [br[0] - rr, br[1]];
  const e5: Pt = [bl[0] + rr, bl[1]];
  const e6: Pt = [bl[0], bl[1] - rr];
  const e7: Pt = [tl[0], tl[1] + rr];
  return (
    `M ${n2(s[0])} ${n2(s[1])} ${bowTo(s, e1, rnd, amp)} Q ${n2(tr[0])} ${n2(tr[1])} ${n2(e2[0])} ${n2(e2[1])} ` +
    `${bowTo(e2, e3, rnd, amp)} Q ${n2(br[0])} ${n2(br[1])} ${n2(e4[0])} ${n2(e4[1])} ` +
    `${bowTo(e4, e5, rnd, amp)} Q ${n2(bl[0])} ${n2(bl[1])} ${n2(e6[0])} ${n2(e6[1])} ` +
    `${bowTo(e6, e7, rnd, amp)} Q ${n2(tl[0])} ${n2(tl[1])} ${n2(s[0])} ${n2(s[1])} Z`
  );
}

/**
 * Outline for a sharp rectangle drawn the way a person draws one: four separate strokes
 * that cross a little at the corners.
 */
export function roughRectStrokeD(x: number, y: number, w: number, h: number, rx = 0): string {
  const size = Math.min(w, h);
  if (rx > 0.5 || size < 14) return roughRectD(x, y, w, h, rx);
  const c = cornerJitter(x, y, w, h);
  const rnd = jitterRng(seedOf(x, y, w, h, 4));
  const amp = wobbleFor(size);
  const over = clamp(size * 0.03, 0.6, 2.4);
  let d = '';
  for (let i = 0; i < 4; i++) {
    const a = c[i];
    const b = c[(i + 1) % 4];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const o1 = over * (0.4 + Math.abs(rnd()) * 0.8);
    const o2 = over * (0.4 + Math.abs(rnd()) * 0.8);
    const s: Pt = [a[0] - ux * o1, a[1] - uy * o1];
    const e: Pt = [b[0] + ux * o2, b[1] + uy * o2];
    d += `M ${n2(s[0])} ${n2(s[1])} ${bowTo(s, e, rnd, amp)} `;
  }
  return d.trim();
}

/** A gently bowed line with a touch of overshoot. */
export function roughLineD(x1: number, y1: number, x2: number, y2: number): string {
  const rnd = jitterRng(seedOf(x1, y1, x2, y2, 5));
  const len = Math.hypot(x2 - x1, y2 - y1);
  const amp = clamp(len * 0.02, 0.15, 1.6);
  const a: Pt = [x1 + rnd() * amp * 0.4, y1 + rnd() * amp * 0.4];
  const b: Pt = [x2 + rnd() * amp * 0.4, y2 + rnd() * amp * 0.4];
  return `M ${n2(a[0])} ${n2(a[1])} ${bowTo(a, b, rnd, amp)}`;
}

/**
 * Pressure pattern for an ink stroke: dashes of a slightly wider pen laid over the base
 * line so the weight swells and thins as if drawn by hand.
 */
export function pressureDashes(seed: number, sw: number): string {
  const rnd = jitterRng(seed);
  const unit = Math.max(4, sw * 4.2);
  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    parts.push(n2(unit * (1.6 + Math.abs(rnd()) * 3.4)));
    parts.push(n2(unit * (1.1 + Math.abs(rnd()) * 2.6)));
  }
  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Polylines for the Pixi painter (sampled points, jittered, plus pressure ribbons)
// ---------------------------------------------------------------------------

/** Subdivide a polyline so long straight edges can wobble. */
export function subdivide(pts: Pt[], step: number, closed: boolean): Pt[] {
  const out: Pt[] = [];
  const n = pts.length;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.max(1, Math.ceil(len / step));
    for (let j = 0; j < k; j++) {
      const t = j / k;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

/** Smooth low-frequency noise along a stroke (sum of seeded sines), roughly in [-1, 1]. */
export function strokeNoise(seed: number): (t: number) => number {
  const rnd = jitterRng(seed);
  const f1 = 1.3 + Math.abs(rnd()) * 1.7;
  const f2 = 3.1 + Math.abs(rnd()) * 3.3;
  const p1 = rnd() * Math.PI;
  const p2 = rnd() * Math.PI;
  return (t: number) => 0.65 * Math.sin(t * f1 * Math.PI * 2 + p1) + 0.35 * Math.sin(t * f2 * Math.PI * 2 + p2);
}

/**
 * Turn a centre-line into a filled ribbon polygon with tapered ends and varying weight.
 * Returns flat [x0, y0, x1, y1, ...] suitable for Graphics.poly().
 */
export function ribbon(pts: Pt[], width: number, seed: number, taper = true): number[] {
  const n = pts.length;
  if (n < 2) return [];
  // Arc-length parameterisation
  const acc: number[] = [0];
  for (let i = 1; i < n; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[n - 1] || 1;
  const noise = strokeNoise(seed);
  const left: number[] = [];
  const right: number[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    let tx = next[0] - prev[0];
    let ty = next[1] - prev[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const t = acc[i] / total;
    const endFade = taper ? Math.min(1, Math.min(t, 1 - t) * (total / Math.max(6, width * 3))) : 1;
    const press = 0.78 + 0.32 * noise(t * Math.max(1, total / 160));
    const hw = (width / 2) * press * (0.42 + 0.58 * endFade);
    left.push(pts[i][0] - ty * hw, pts[i][1] + tx * hw);
    right.push(pts[i][0] + ty * hw, pts[i][1] - tx * hw);
  }
  const outline = left;
  for (let i = n - 1; i >= 0; i--) outline.push(right[i * 2], right[i * 2 + 1]);
  return outline;
}
