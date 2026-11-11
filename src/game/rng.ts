/** Deterministic RNG utilities. All game systems accept an Rng instance. */

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, max) {
      if (max <= min) return min;
      return min + Math.floor(next() * (max - min + 1));
    },
  };
}

export function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRng(seedText: string): Rng {
  return createRng(hashString(seedText));
}

/** Stable RNG derived from state so offline simulation is repeatable for tests. */
export function stateRng(state: { createdAt: number; lastSeenAt: number }, salt: string): Rng {
  return createRng(hashString(`${state.createdAt}:${state.lastSeenAt}:${salt}`));
}

export function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.min(list.length - 1, Math.floor(rng.next() * list.length))];
}

export function chance(rng: Rng, probability: number): boolean {
  return rng.next() < probability;
}

export function uid(prefix = 'id'): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}
