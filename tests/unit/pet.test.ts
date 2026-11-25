import { describe, expect, it } from 'vitest';
import { createPet, PET, petTapped, stepPet, type PetState } from '../../src/game/pet';

const fixed = (v: number) => () => v;

describe('pet', () => {
  it('waits while idle, then sets off toward a spot on the floor', () => {
    let s = createPet();
    s = stepPet(s, 0.5, fixed(0.9));
    expect(s.mode).toBe('idle');
    s = stepPet(s, 2, fixed(0.9));
    expect(s.mode).toBe('walk');
    expect(s.tx).toBeGreaterThanOrEqual(PET.minX);
    expect(s.tx).toBeLessThanOrEqual(PET.maxX);
    expect(s.ty).toBeGreaterThanOrEqual(PET.minY);
    expect(s.ty).toBeLessThanOrEqual(PET.maxY);
    expect(s.facing).toBe(s.tx >= 760 ? 1 : -1);
  });

  it('always walks a noticeable distance', () => {
    const start: PetState = { ...createPet(), x: 800, timer: 0 };
    const s = stepPet(start, 0.016, fixed(0.43)); // would pick x≈739, too close
    expect(Math.abs(s.tx - start.x)).toBeGreaterThanOrEqual(150);
  });

  it('moves at its walking speed and stops at the target', () => {
    const walking: PetState = { ...createPet(), mode: 'walk', x: 200, y: 700, tx: 600, ty: 700 };
    const moved = stepPet(walking, 1);
    expect(moved.x).toBeCloseTo(200 + PET.speed);
    expect(moved.mode).toBe('walk');
    const arrived = stepPet({ ...walking, x: 590 }, 1, fixed(0));
    expect(arrived).toMatchObject({ x: 600, y: 700, mode: 'idle' });
  });

  it('stops and hops when tapped, then settles back to idle', () => {
    const walking: PetState = { ...createPet(), mode: 'walk', x: 300, y: 700, tx: 900, ty: 800 };
    let s = petTapped(walking);
    expect(s.mode).toBe('happy');
    s = stepPet(s, 0.5);
    expect(s).toMatchObject({ mode: 'happy', x: 300, y: 700 });
    s = stepPet(s, PET.happySeconds);
    expect(s.mode).toBe('idle');
  });
});
