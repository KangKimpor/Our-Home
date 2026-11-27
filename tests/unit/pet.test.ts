import { describe, expect, it } from 'vitest';
import {
  createPet,
  DEFAULT_PET_ID,
  PET,
  PET_OPTIONS,
  petTapped,
  resolvePetOption,
  stepPet,
  type PetState,
} from '../../src/game/pet';
import { PET_CHOICES } from '../../src/game/sharedHomeCore';
import sprites from '../../src/game/sprites.json';

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

describe('pet companions', () => {
  it('offers the hedgehog, tortoise, and sunhat frog with real sprites', () => {
    expect(PET_OPTIONS.map((p) => [p.id, p.label, p.sprite, p.height])).toEqual([
      ['hedgehog', 'Hedgehog', 'mossback_hedgehog', 120],
      ['tortoise', 'Tortoise', 'terracotta_tortoise', 112],
      ['frog', 'Sunhat frog', 'sunhat_garden_frog', 115],
    ]);
    for (const p of PET_OPTIONS) expect(sprites).toHaveProperty(p.sprite);
  });

  it('defaults to the hedgehog and resolves unknown ids to it', () => {
    expect(DEFAULT_PET_ID).toBe('hedgehog');
    expect(resolvePetOption().id).toBe('hedgehog');
    expect(resolvePetOption('dragon').id).toBe('hedgehog');
    expect(resolvePetOption('frog').sprite).toBe('sunhat_garden_frog');
  });

  it('stays in lockstep with the shared-save catalog', () => {
    expect(PET_CHOICES.defaultId).toBe(DEFAULT_PET_ID);
    expect([...PET_CHOICES.optionIds]).toEqual(PET_OPTIONS.map((p) => p.id));
  });
});
