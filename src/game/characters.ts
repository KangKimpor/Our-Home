import { ROOM, type SpriteId } from './layout';

export type CharacterMode = 'idle' | 'walk' | 'happy';

export interface CharacterDef {
  id: 'her' | 'him';
  label: string;
  sprite: SpriteId;
  /** Display height in room pixels; width follows the sprite's aspect ratio. */
  height: number;
  /** Facing direction baked into the sprite image: 1 = right, -1 = left. */
  spriteFacing: 1 | -1;
  startX: number;
  startY: number;
  startFacing: 1 | -1;
  initialIdleSeconds: number;
}

export interface CharacterState {
  x: number;
  y: number;
  mode: CharacterMode;
  tx: number;
  ty: number;
  timer: number;
  /** Current facing direction: 1 = facing right, -1 = facing left. */
  facing: 1 | -1;
}

export const CHARACTER_BOUNDS = {
  speed: 62, // leisurely stroll speed in room px per second
  minX: 150,
  maxX: ROOM.w - 150,
  minY: 615,
  maxY: 875,
  happySeconds: 1.4,
} as const;

export const CHARACTERS: readonly CharacterDef[] = [
  {
    id: 'her',
    label: 'Partner (Her)',
    sprite: 'resident_her',
    height: 275,
    spriteFacing: 1,
    startX: 505,
    startY: 785,
    startFacing: 1,
    initialIdleSeconds: 3.2,
  },
  {
    id: 'him',
    label: 'Partner (Him)',
    sprite: 'resident_him',
    height: 295,
    spriteFacing: -1,
    startX: 1125,
    startY: 795,
    startFacing: -1,
    initialIdleSeconds: 4.6,
  },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function createCharacter(def: CharacterDef): CharacterState {
  return {
    x: def.startX,
    y: def.startY,
    mode: 'idle',
    tx: def.startX,
    ty: def.startY,
    timer: def.initialIdleSeconds,
    facing: def.startFacing,
  };
}

export function clampCharacterPos(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.round(clamp(x, CHARACTER_BOUNDS.minX, CHARACTER_BOUNDS.maxX)),
    y: Math.round(clamp(y, CHARACTER_BOUNDS.minY, CHARACTER_BOUNDS.maxY)),
  };
}

/** Advances a resident character by dt seconds. */
export function stepCharacter(
  s: CharacterState,
  dt: number,
  rand: () => number = Math.random,
): CharacterState {
  if (s.mode === 'idle' || s.mode === 'happy') {
    const timer = s.timer - dt;
    if (timer > 0) return { ...s, timer };
    if (s.mode === 'happy') return { ...s, mode: 'idle', timer: 1.8 + rand() * 2.4 };
    let tx = lerp(CHARACTER_BOUNDS.minX, CHARACTER_BOUNDS.maxX, rand());
    const ty = lerp(CHARACTER_BOUNDS.minY, CHARACTER_BOUNDS.maxY, rand());
    if (Math.abs(tx - s.x) < 160) tx = s.x + (tx >= s.x ? 160 : -160);
    tx = clamp(tx, CHARACTER_BOUNDS.minX, CHARACTER_BOUNDS.maxX);
    return { ...s, mode: 'walk', tx, ty, timer: 0, facing: tx >= s.x ? 1 : -1 };
  }

  const dx = s.tx - s.x;
  const dy = s.ty - s.y;
  const dist = Math.hypot(dx, dy);
  const stepLen = CHARACTER_BOUNDS.speed * dt;
  if (dist <= stepLen) {
    return { ...s, x: s.tx, y: s.ty, mode: 'idle', timer: 2.8 + rand() * 3.8 };
  }
  return { ...s, x: s.x + (dx / dist) * stepLen, y: s.y + (dy / dist) * stepLen };
}

/** Tapping a character makes them pause and bounce happily. */
export function characterTapped(s: CharacterState): CharacterState {
  return { ...s, mode: 'happy', timer: CHARACTER_BOUNDS.happySeconds, tx: s.x, ty: s.y };
}

/** Placing a character via drag clamps to the floor and pauses them gently in place. */
export function characterPlaced(s: CharacterState, x: number, y: number): CharacterState {
  const pos = clampCharacterPos(x, y);
  return { ...s, x: pos.x, y: pos.y, tx: pos.x, ty: pos.y, mode: 'idle', timer: 3.5 };
}
