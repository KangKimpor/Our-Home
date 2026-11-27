import { ROOM, type SpriteId } from './layout';
import { PET_CHOICES, type PetId } from './sharedHomeCore';

export interface PetOption {
  id: PetId;
  label: string;
  sprite: SpriteId;
  /** Display height in room pixels; width follows the sprite's aspect ratio. */
  height: number;
}

/** Selectable wandering companions. Every sprite natively faces left. */
export const PET_OPTIONS: readonly PetOption[] = [
  { id: 'hedgehog', label: 'Hedgehog', sprite: 'mossback_hedgehog', height: 120 },
  { id: 'tortoise', label: 'Tortoise', sprite: 'terracotta_tortoise', height: 112 },
  { id: 'frog', label: 'Sunhat frog', sprite: 'sunhat_garden_frog', height: 115 },
];

export const DEFAULT_PET_ID: PetId = PET_CHOICES.defaultId;

/** The chosen pet companion, falling back to the hedgehog for unknown ids. */
export function resolvePetOption(petId?: string): PetOption {
  return (
    PET_OPTIONS.find((p) => p.id === petId) ??
    PET_OPTIONS.find((p) => p.id === DEFAULT_PET_ID) ??
    PET_OPTIONS[0]
  );
}

export type PetMode = 'idle' | 'walk' | 'happy';

export interface PetState {
  x: number;
  y: number;
  mode: PetMode;
  /** Walk target. */
  tx: number;
  ty: number;
  /** Seconds left in the current idle or happy spell. */
  timer: number;
  /** 1 = facing right, -1 = facing left. */
  facing: 1 | -1;
}

export const PET = {
  height: 120,
  speed: 85, // room px per second
  minX: 120,
  maxX: ROOM.w - 120,
  minY: 620,
  maxY: 875,
  happySeconds: 1.2,
} as const;

export function createPet(): PetState {
  return { x: 545, y: 815, mode: 'idle', tx: 545, ty: 815, timer: 1.5, facing: 1 };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface StepPetOptions {
  /**
   * Whether the pet picks its own wander spots (default true). While two partners are together,
   * only the pet leader's device wanders; the other follows its `pet_sync` broadcasts.
   */
  wander?: boolean;
  /** Speed multiplier (a following pet briefly hurries to catch up). Clamped to [1, 3]. */
  speedScale?: number;
}

/** Advances the pet by dt seconds. `rand` returns values in [0, 1). */
export function stepPet(
  s: PetState,
  dt: number,
  rand: () => number = Math.random,
  options: StepPetOptions = {},
): PetState {
  const wander = options.wander ?? true;
  if (s.mode === 'idle' || s.mode === 'happy') {
    const timer = s.timer - dt;
    if (timer > 0) return { ...s, timer };
    if (s.mode === 'happy') return { ...s, mode: 'idle', timer: 0.6 + rand() * 1.2 };
    if (!wander) {
      // Following: rest until the leader's pet heads somewhere new.
      if (Math.hypot(s.tx - s.x, s.ty - s.y) < 1) return { ...s, timer: 0 };
      return { ...s, mode: 'walk', timer: 0, facing: s.tx >= s.x ? 1 : -1 };
    }
    // Pick a new spot to wander to, not too close to where we are.
    let tx = lerp(PET.minX, PET.maxX, rand());
    const ty = lerp(PET.minY, PET.maxY, rand());
    if (Math.abs(tx - s.x) < 150) tx = s.x + (tx >= s.x ? 150 : -150);
    tx = Math.min(PET.maxX, Math.max(PET.minX, tx));
    return { ...s, mode: 'walk', tx, ty, timer: 0, facing: tx >= s.x ? 1 : -1 };
  }

  const dx = s.tx - s.x;
  const dy = s.ty - s.y;
  const dist = Math.hypot(dx, dy);
  const speedScale = Math.min(3, Math.max(1, options.speedScale ?? 1));
  const stepLen = PET.speed * speedScale * dt;
  if (dist <= stepLen) {
    return { ...s, x: s.tx, y: s.ty, mode: 'idle', timer: 1.5 + rand() * 3 };
  }
  return { ...s, x: s.x + (dx / dist) * stepLen, y: s.y + (dy / dist) * stepLen };
}

/** Tapping the pet makes it stop and hop happily. */
export function petTapped(s: PetState): PetState {
  return { ...s, mode: 'happy', timer: PET.happySeconds, tx: s.x, ty: s.y };
}

/** Mirrors the leader's pet: heads to its destination (or resting spot) from wherever ours is. */
export function petSynced(
  s: PetState,
  sync: { x: number; y: number; tx: number; ty: number; mode: 'idle' | 'walk'; facing: 1 | -1 },
): { state: PetState; speedScale: number } {
  const tx = sync.mode === 'walk' ? sync.tx : sync.x;
  const ty = sync.mode === 'walk' ? sync.ty : sync.y;
  const remaining = Math.hypot(tx - s.x, ty - s.y);
  // Hurry when we are further from the destination than the leader's pet is.
  const leaderRemaining = Math.max(1, Math.hypot(tx - sync.x, ty - sync.y));
  const speedScale = sync.mode === 'walk' ? Math.min(3, Math.max(1, remaining / leaderRemaining)) : 2;
  if (remaining < 1) {
    return { state: { ...s, x: tx, y: ty, tx, ty, mode: 'idle', timer: 0, facing: sync.facing }, speedScale };
  }
  const facing: 1 | -1 = Math.abs(tx - s.x) < 1 ? sync.facing : tx > s.x ? 1 : -1;
  return { state: { ...s, tx, ty, mode: 'walk', timer: 0, facing }, speedScale };
}
