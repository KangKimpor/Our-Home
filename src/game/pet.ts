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

/** Advances the pet by dt seconds. `rand` returns values in [0, 1). */
export function stepPet(s: PetState, dt: number, rand: () => number = Math.random): PetState {
  if (s.mode === 'idle' || s.mode === 'happy') {
    const timer = s.timer - dt;
    if (timer > 0) return { ...s, timer };
    if (s.mode === 'happy') return { ...s, mode: 'idle', timer: 0.6 + rand() * 1.2 };
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
  const stepLen = PET.speed * dt;
  if (dist <= stepLen) {
    return { ...s, x: s.tx, y: s.ty, mode: 'idle', timer: 1.5 + rand() * 3 };
  }
  return { ...s, x: s.x + (dx / dist) * stepLen, y: s.y + (dy / dist) * stepLen };
}

/** Tapping the pet makes it stop and hop happily. */
export function petTapped(s: PetState): PetState {
  return { ...s, mode: 'happy', timer: PET.happySeconds, tx: s.x, ty: s.y };
}
