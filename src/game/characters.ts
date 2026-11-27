import { ROOM, type SpriteId } from './layout';

export type CharacterMode = 'idle' | 'walk' | 'happy';

export interface CharacterOutfit {
  id: string;
  label: string;
  sprite: SpriteId;
  /** Horizontal walk-cycle sprite strip (frames arranged left to right). */
  walkSprite: SpriteId;
  /** Number of frames in `walkSprite`. */
  walkFrames: number;
}

export interface CharacterDef {
  id: 'her' | 'him';
  label: string;
  sprite: SpriteId;
  /** Horizontal walk-cycle sprite strip (frames arranged left to right). */
  walkSprite: SpriteId;
  /** Number of frames in `walkSprite`. */
  walkFrames: number;
  /** Selectable outfits for this character (index 0 is the default). */
  outfits: readonly CharacterOutfit[];
  /** Display height in room pixels; width follows the sprite's aspect ratio. */
  height: number;
  /** Facing direction baked into the sprite image: 1 = right, -1 = left. */
  spriteFacing: 1 | -1;
  startX: number;
  startY: number;
  startFacing: 1 | -1;
  initialIdleSeconds: number;
}

export type OutfitSelections = Record<CharacterDef['id'], string>;

export interface CharacterState {
  x: number;
  y: number;
  mode: CharacterMode;
  tx: number;
  ty: number;
  timer: number;
  /** Current facing direction: 1 = facing right, -1 = facing left. */
  facing: 1 | -1;
  /** Continuous walk-cycle phase in [0, walkFrames); floor(walkPhase) gives the frame index. */
  walkPhase: number;
}

export const CHARACTER_BOUNDS = {
  speed: 62, // leisurely stroll speed in room px per second
  walkFps: 5, // 4-frame cycle = 0.8s (2 cozy steps per cycle)
  walkFrames: 4,
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
    walkSprite: 'resident_her_walk',
    walkFrames: 4,
    outfits: [
      {
        id: 'dress',
        label: 'Cozy dress',
        sprite: 'resident_her',
        walkSprite: 'resident_her_walk',
        walkFrames: 4,
      },
      {
        id: 'badminton',
        label: 'Badminton',
        sprite: 'resident_her_badminton',
        walkSprite: 'resident_her_badminton_walk',
        walkFrames: 4,
      },
    ],
    height: 275,
    spriteFacing: 1,
    startX: 660,
    startY: 785,
    startFacing: 1,
    initialIdleSeconds: 3.2,
  },
  {
    id: 'him',
    label: 'Partner (Him)',
    sprite: 'resident_him',
    walkSprite: 'resident_him_walk',
    walkFrames: 4,
    outfits: [
      {
        id: 'casual',
        label: 'Striped shirt',
        sprite: 'resident_him',
        walkSprite: 'resident_him_walk',
        walkFrames: 4,
      },
    ],
    height: 295,
    spriteFacing: -1,
    startX: 1350,
    startY: 795,
    startFacing: -1,
    initialIdleSeconds: 4.6,
  },
];

export const DEFAULT_OUTFITS: OutfitSelections = {
  her: 'dress',
  him: 'casual',
};

export function resolveCharacterOutfit(def: CharacterDef, outfitId?: string): CharacterOutfit {
  return def.outfits.find((o) => o.id === outfitId) ?? def.outfits[0];
}

const OUTFITS_STORAGE_KEY = 'our-home:outfits:v1';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadOutfits(storage: StorageLike | undefined): OutfitSelections {
  const outfits: OutfitSelections = { ...DEFAULT_OUTFITS };
  try {
    const raw = storage?.getItem(OUTFITS_STORAGE_KEY);
    if (!raw) return outfits;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    for (const def of CHARACTERS) {
      const candidate = saved[def.id];
      if (typeof candidate === 'string' && def.outfits.some((o) => o.id === candidate)) {
        outfits[def.id] = candidate;
      }
    }
  } catch {
    // Ignore corrupt or unavailable storage.
  }
  return outfits;
}

export function saveOutfits(storage: StorageLike | undefined, outfits: OutfitSelections): void {
  try {
    storage?.setItem(OUTFITS_STORAGE_KEY, JSON.stringify(outfits));
  } catch {
    // Ignore full or blocked storage.
  }
}

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
    walkPhase: 0,
  };
}

/** Returns the discrete walk-cycle frame index for a character state. */
export function walkFrameOf(s: CharacterState, frameCount: number = CHARACTER_BOUNDS.walkFrames): number {
  if (s.mode !== 'walk' || frameCount <= 1) return 0;
  return ((Math.floor(s.walkPhase) % frameCount) + frameCount) % frameCount;
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
  frameCount: number = CHARACTER_BOUNDS.walkFrames,
): CharacterState {
  if (s.mode === 'idle' || s.mode === 'happy') {
    const timer = s.timer - dt;
    if (timer > 0) return { ...s, timer };
    if (s.mode === 'happy') return { ...s, mode: 'idle', timer: 1.8 + rand() * 2.4, walkPhase: 0 };
    let tx = lerp(CHARACTER_BOUNDS.minX, CHARACTER_BOUNDS.maxX, rand());
    const ty = lerp(CHARACTER_BOUNDS.minY, CHARACTER_BOUNDS.maxY, rand());
    if (Math.abs(tx - s.x) < 160) tx = s.x + (tx >= s.x ? 160 : -160);
    tx = clamp(tx, CHARACTER_BOUNDS.minX, CHARACTER_BOUNDS.maxX);
    return { ...s, mode: 'walk', tx, ty, timer: 0, facing: tx >= s.x ? 1 : -1, walkPhase: 0 };
  }

  const dx = s.tx - s.x;
  const dy = s.ty - s.y;
  const dist = Math.hypot(dx, dy);
  const stepLen = CHARACTER_BOUNDS.speed * dt;
  if (dist <= stepLen) {
    return { ...s, x: s.tx, y: s.ty, mode: 'idle', timer: 2.8 + rand() * 3.8, walkPhase: 0 };
  }
  const walkPhase = (s.walkPhase + dt * CHARACTER_BOUNDS.walkFps) % frameCount;
  return { ...s, x: s.x + (dx / dist) * stepLen, y: s.y + (dy / dist) * stepLen, walkPhase };
}

/** Tapping a character makes them pause and bounce happily. */
export function characterTapped(s: CharacterState): CharacterState {
  return { ...s, mode: 'happy', timer: CHARACTER_BOUNDS.happySeconds, tx: s.x, ty: s.y, walkPhase: 0 };
}

/** Placing a character via drag clamps to the floor and pauses them gently in place. */
export function characterPlaced(s: CharacterState, x: number, y: number): CharacterState {
  const pos = clampCharacterPos(x, y);
  return { ...s, x: pos.x, y: pos.y, tx: pos.x, ty: pos.y, mode: 'idle', timer: 3.5, walkPhase: 0 };
}

// ---------------------------------------------------------------------------
// Player- / partner-driven movement (live 2-player mode)
// ---------------------------------------------------------------------------

export const PLAYER_CONTROL = {
  /** Walking speed when a player steers their own character (room px per second). */
  speed: 165,
  /** Walk-cycle frames per second at `speed` (keeps steps matched to the faster pace). */
  walkFps: 8,
  /** The partner's character may hurry up to this multiple of `speed` to catch up. */
  maxCatchUp: 3,
  /** Keyboard strolls broadcast a target this many seconds ahead, so the partner never stalls. */
  lookAheadSeconds: 0.28,
} as const;

/** Starts walking toward a (floor-clamped) spot; returns the state unchanged when already there. */
export function characterWalkTo(s: CharacterState, x: number, y: number): CharacterState {
  const pos = clampCharacterPos(x, y);
  const dx = pos.x - s.x;
  if (Math.hypot(dx, pos.y - s.y) < 2) {
    return { ...s, x: pos.x, y: pos.y, tx: pos.x, ty: pos.y, mode: 'idle', timer: 0, walkPhase: 0 };
  }
  const facing: 1 | -1 = Math.abs(dx) < 1 ? s.facing : dx > 0 ? 1 : -1;
  const walkPhase = s.mode === 'walk' ? s.walkPhase : 0;
  return { ...s, tx: pos.x, ty: pos.y, mode: 'walk', timer: 0, facing, walkPhase };
}

/** A happy hop that keeps the current walk target, so a controlled character resumes afterwards. */
export function characterHop(s: CharacterState): CharacterState {
  return { ...s, mode: 'happy', timer: CHARACTER_BOUNDS.happySeconds, walkPhase: 0 };
}

/** Holds a controlled character still exactly where it stands. */
export function characterRest(s: CharacterState): CharacterState {
  return { ...s, tx: s.x, ty: s.y, mode: 'idle', timer: 0, walkPhase: 0 };
}

/**
 * Advances a character steered by a player (or mirrored from the partner): it walks to its target
 * and then rests there breathing, never wandering off on its own.
 */
export function stepControlledCharacter(
  s: CharacterState,
  dt: number,
  frameCount: number = CHARACTER_BOUNDS.walkFrames,
  speedScale = 1,
): CharacterState {
  if (s.mode === 'happy') {
    const timer = s.timer - dt;
    if (timer > 0) return { ...s, timer };
    const pending = Math.hypot(s.tx - s.x, s.ty - s.y) >= 2;
    return { ...s, mode: pending ? 'walk' : 'idle', timer: 0, walkPhase: 0 };
  }
  if (s.mode === 'idle') return s;

  const dx = s.tx - s.x;
  const dy = s.ty - s.y;
  const dist = Math.hypot(dx, dy);
  const scale = clamp(speedScale, 1, PLAYER_CONTROL.maxCatchUp);
  const stepLen = PLAYER_CONTROL.speed * scale * dt;
  if (dist <= stepLen) {
    return { ...s, x: s.tx, y: s.ty, mode: 'idle', timer: 0, walkPhase: 0 };
  }
  const walkPhase = (s.walkPhase + dt * PLAYER_CONTROL.walkFps * Math.min(1.5, scale)) % Math.max(1, frameCount);
  const facing: 1 | -1 = Math.abs(dx) < 1 ? s.facing : dx > 0 ? 1 : -1;
  return { ...s, x: s.x + (dx / dist) * stepLen, y: s.y + (dy / dist) * stepLen, walkPhase, facing };
}

/**
 * Keyboard stroll (WASD / arrows): moves along the held direction at player speed.
 * `dirX` / `dirY` are -1, 0, or 1. Diagonals are normalized.
 */
export function stepKeyboardCharacter(
  s: CharacterState,
  dirX: number,
  dirY: number,
  dt: number,
  frameCount: number = CHARACTER_BOUNDS.walkFrames,
): CharacterState {
  const len = Math.hypot(dirX, dirY);
  if (len === 0) return s.mode === 'walk' ? characterRest(s) : s;
  const stepLen = PLAYER_CONTROL.speed * dt;
  // Keep sub-pixel precision while moving; the floor bounds still hold.
  const x = clamp(s.x + (dirX / len) * stepLen, CHARACTER_BOUNDS.minX, CHARACTER_BOUNDS.maxX);
  const y = clamp(s.y + (dirY / len) * stepLen, CHARACTER_BOUNDS.minY, CHARACTER_BOUNDS.maxY);
  const facing: 1 | -1 = dirX > 0 ? 1 : dirX < 0 ? -1 : s.facing;
  const walkPhase =
    ((s.mode === 'walk' ? s.walkPhase : 0) + dt * PLAYER_CONTROL.walkFps) % Math.max(1, frameCount);
  return { ...s, x, y, tx: x, ty: y, mode: 'walk', timer: 0, facing, walkPhase };
}

/** Where a keyboard stroll is heading a moment from now (broadcast so the partner keeps walking). */
export function keyboardLookAhead(
  s: CharacterState,
  dirX: number,
  dirY: number,
): { x: number; y: number } {
  const len = Math.hypot(dirX, dirY) || 1;
  const ahead = PLAYER_CONTROL.speed * PLAYER_CONTROL.lookAheadSeconds;
  return clampCharacterPos(s.x + (dirX / len) * ahead, s.y + (dirY / len) * ahead);
}
