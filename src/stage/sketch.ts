import type { FillInput, Graphics } from 'pixi.js';
import { jitterRng, ribbon, seedOf, subdivide, type Pt } from '../art/hand';

/**
 * A drop-in stand-in for the subset of Pixi's Graphics API the room painters use, which
 * redraws everything by hand:
 *
 *  - every point passes through one smooth "paper warp" field, so straight walls and floor
 *    lines bend slightly while neighbouring fills still meet without gaps;
 *  - outlines become tapered ink ribbons whose weight swells and thins along the stroke;
 *  - sharp corners are drawn as separate strokes that overshoot each other a little.
 *
 * Painters call it exactly like Graphics (`s.rect(...).fill(...)`, `s.moveTo().lineTo().stroke()`),
 * so a room reads as illustrated rather than plotted, without rewriting every painter.
 */

const W = 1920;
const H = 884;

interface Sub {
  pts: Pt[];
  closed: boolean;
  /** Corner indices where a closed outline should break into separate pen strokes. */
  sharp: boolean;
}

interface StrokeLike {
  width?: number;
  color?: string | number;
  alpha?: number;
}

export class Sketch {
  readonly g: Graphics;
  private subs: Sub[] = [];
  private consumed = false;
  private current: Pt[] | null = null;
  private readonly phase: number[];
  private readonly amp: number;
  private strokeCount = 0;

  constructor(g: Graphics, seed = 7, amp = 1.7) {
    this.g = g;
    const rnd = jitterRng(seed);
    this.phase = [rnd() * 6, rnd() * 6, rnd() * 6, rnd() * 6];
    this.amp = amp;
  }

  /** Smooth low-frequency warp shared by every shape on this layer. */
  warp(x: number, y: number): Pt {
    const [a, b, c, d] = this.phase;
    const A = this.amp;
    const dx = A * (0.62 * Math.sin(0.021 * y + 0.006 * x + a) + 0.38 * Math.sin(0.061 * y - 0.017 * x + b));
    const dy = A * (0.62 * Math.sin(0.018 * x + 0.008 * y + c) + 0.38 * Math.sin(0.052 * x + 0.021 * y + d));
    return [x <= 0 || x >= W ? x : x + dx, y <= 0 || y >= H ? y : y + dy];
  }

  clear(): this {
    this.g.clear();
    this.subs = [];
    this.current = null;
    this.consumed = false;
    return this;
  }

  private begin(): void {
    if (this.consumed) {
      this.subs = [];
      this.current = null;
      this.consumed = false;
    }
  }

  rect(x: number, y: number, w: number, h: number): this {
    this.begin();
    this.subs.push({
      pts: [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      closed: true,
      sharp: true,
    });
    this.current = null;
    return this;
  }

  roundRect(x: number, y: number, w: number, h: number, radius = 6): this {
    this.begin();
    const r = Math.max(0, Math.min(radius, w / 2, h / 2));
    if (r < 1) return this.rect(x, y, w, h);
    const pts: Pt[] = [];
    const corner = (cx: number, cy: number, a0: number) => {
      for (let i = 0; i <= 4; i++) {
        const a = a0 + (i / 4) * (Math.PI / 2);
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    };
    corner(x + w - r, y + r, -Math.PI / 2);
    corner(x + w - r, y + h - r, 0);
    corner(x + r, y + h - r, Math.PI / 2);
    corner(x + r, y + r, Math.PI);
    this.subs.push({ pts, closed: true, sharp: false });
    this.current = null;
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number): this {
    this.begin();
    const rnd = jitterRng(seedOf(cx, cy, rx, ry));
    const k = Math.max(14, Math.min(64, Math.round((Math.PI * (rx + ry)) / 7)));
    const lump = Math.min(rx, ry) * 0.03;
    const a0 = rnd() * Math.PI;
    const pts: Pt[] = [];
    for (let i = 0; i < k; i++) {
      const a = a0 + (i / k) * Math.PI * 2;
      const d = lump * Math.sin(a * 3 + a0) + lump * 0.6 * Math.sin(a * 5 - a0);
      pts.push([cx + Math.cos(a) * (rx + d), cy + Math.sin(a) * (ry + d)]);
    }
    this.subs.push({ pts, closed: true, sharp: false });
    this.current = null;
    return this;
  }

  circle(cx: number, cy: number, r: number): this {
    return this.ellipse(cx, cy, r, r);
  }

  poly(flat: number[] | Pt[], close = true): this {
    this.begin();
    const pts: Pt[] = [];
    if (flat.length && Array.isArray(flat[0])) {
      for (const p of flat as Pt[]) pts.push([p[0], p[1]]);
    } else {
      const f = flat as number[];
      for (let i = 0; i + 1 < f.length; i += 2) pts.push([f[i], f[i + 1]]);
    }
    this.subs.push({ pts, closed: close, sharp: true });
    this.current = null;
    return this;
  }

  moveTo(x: number, y: number): this {
    this.begin();
    this.current = [[x, y]];
    this.subs.push({ pts: this.current, closed: false, sharp: true });
    return this;
  }

  lineTo(x: number, y: number): this {
    if (!this.current) return this.moveTo(x, y);
    this.current.push([x, y]);
    return this;
  }

  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this {
    if (!this.current) this.moveTo(c1x, c1y);
    const cur = this.current!;
    const [x0, y0] = cur[cur.length - 1];
    const steps = Math.max(8, Math.round(Math.hypot(x - x0, y - y0) / 12));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      cur.push([
        mt * mt * mt * x0 + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * x,
        mt * mt * mt * y0 + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * y,
      ]);
    }
    return this;
  }

  quadraticCurveTo(cx: number, cy: number, x: number, y: number): this {
    if (!this.current) this.moveTo(cx, cy);
    const cur = this.current!;
    const [x0, y0] = cur[cur.length - 1];
    return this.bezierCurveTo(x0 + (2 / 3) * (cx - x0), y0 + (2 / 3) * (cy - y0), x + (2 / 3) * (cx - x), y + (2 / 3) * (cy - y), x, y);
  }

  closePath(): this {
    const last = this.subs[this.subs.length - 1];
    if (last) last.closed = true;
    this.current = null;
    return this;
  }

  fill(style: FillInput): this {
    for (const sub of this.subs) {
      if (sub.pts.length < 3) continue;
      const pts = subdivide(sub.pts, 22, true).map(([x, y]) => this.warp(x, y));
      this.g.poly(pts.flat()).fill(style);
    }
    this.consumed = true;
    return this;
  }

  stroke(style: StrokeLike | string | number): this {
    const s: StrokeLike = typeof style === 'object' ? style : { color: style };
    const width = s.width ?? 2;
    const fillStyle = { color: s.color ?? 0x2b2521, alpha: s.alpha ?? 1 };
    for (const sub of this.subs) {
      if (sub.pts.length < 2) continue;
      for (const run of this.pressRuns(sub, width)) {
        const poly = ribbon(run, width, seedOf(run[0][0], run[0][1], this.strokeCount++), true);
        if (poly.length >= 6) this.g.poly(poly).fill(fillStyle);
      }
    }
    this.consumed = true;
    return this;
  }

  /** Break an outline into the separate pen strokes a person would use to draw it. */
  private pressRuns(sub: Sub, width: number): Pt[][] {
    const pts = sub.pts;
    const n = pts.length;
    const runs: Pt[][] = [];
    const rnd = jitterRng(seedOf(pts[0][0], pts[0][1], n, width));
    const over = Math.max(0.8, Math.min(3.2, width * 0.8));

    const finish = (raw: Pt[], extend: boolean): void => {
      if (raw.length < 2) return;
      const run = raw.slice();
      if (extend) {
        const ext = (a: Pt, b: Pt, amt: number): Pt => {
          const dx = a[0] - b[0];
          const dy = a[1] - b[1];
          const l = Math.hypot(dx, dy) || 1;
          return [a[0] + (dx / l) * amt, a[1] + (dy / l) * amt];
        };
        run[0] = ext(run[0], run[1], over * (0.3 + Math.abs(rnd()) * 0.9));
        run[run.length - 1] = ext(run[run.length - 1], run[run.length - 2], over * (0.3 + Math.abs(rnd()) * 0.9));
      }
      // Tiny per-stroke drift so the ink doesn't sit exactly on the fill edge.
      const ox = rnd() * 0.5;
      const oy = rnd() * 0.5;
      runs.push(subdivide(run, 9, false).map(([x, y]) => {
        const [wx, wy] = this.warp(x, y);
        return [wx + ox, wy + oy] as Pt;
      }));
    };

    if (!sub.closed) {
      // Split open paths at sharp turns.
      let start = 0;
      for (let i = 1; i < n - 1; i++) {
        if (sub.sharp && turn(pts[i - 1], pts[i], pts[i + 1]) > 0.6) {
          finish(pts.slice(start, i + 1), true);
          start = i;
        }
      }
      finish(pts.slice(start), sub.sharp);
      return runs;
    }

    if (sub.sharp) {
      // Closed polygon: one stroke per edge group between sharp corners.
      const corners: number[] = [];
      for (let i = 0; i < n; i++) {
        if (turn(pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n]) > 0.6) corners.push(i);
      }
      if (corners.length === 0) corners.push(0);
      for (let c = 0; c < corners.length; c++) {
        const a = corners[c];
        const b = corners[(c + 1) % corners.length];
        const seg: Pt[] = [];
        let i = a;
        seg.push(pts[i]);
        do {
          i = (i + 1) % n;
          seg.push(pts[i]);
        } while (i !== b);
        finish(seg, true);
      }
      return runs;
    }

    // Smooth closed loop: two overlapping arcs, like a circle drawn in two sweeps.
    const half = Math.ceil(n / 2);
    const lap = Math.max(1, Math.round(n * 0.08));
    const first: Pt[] = [];
    const second: Pt[] = [];
    for (let i = 0; i <= half + lap; i++) first.push(pts[i % n]);
    for (let i = half; i <= n + lap; i++) second.push(pts[i % n]);
    finish(first, false);
    finish(second, false);
    return runs;
  }
}

/** Absolute turning angle at b (radians). */
function turn(a: Pt, b: Pt, c: Pt): number {
  const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const a2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
  let d = Math.abs(a2 - a1);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}
