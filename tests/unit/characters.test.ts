import { describe, expect, it } from 'vitest';
import {
  CHARACTERS,
  CHARACTER_BOUNDS,
  characterPlaced,
  characterTapped,
  createCharacter,
  stepCharacter,
  type CharacterState,
} from '../../src/game/characters';

const fixed = (v: number) => () => v;

describe('characters', () => {
  it('initializes both resident characters inside the walkable floor bounds', () => {
    expect(CHARACTERS).toHaveLength(2);
    for (const def of CHARACTERS) {
      const s = createCharacter(def);
      expect(s.x).toBeGreaterThanOrEqual(CHARACTER_BOUNDS.minX);
      expect(s.x).toBeLessThanOrEqual(CHARACTER_BOUNDS.maxX);
      expect(s.y).toBeGreaterThanOrEqual(CHARACTER_BOUNDS.minY);
      expect(s.y).toBeLessThanOrEqual(CHARACTER_BOUNDS.maxY);
      expect(s.mode).toBe('idle');
    }
  });

  it('transitions from idle to strolling within bounds', () => {
    const def = CHARACTERS[0];
    let s = createCharacter(def);
    s = stepCharacter(s, def.initialIdleSeconds + 0.1, fixed(0.8));
    expect(s.mode).toBe('walk');
    expect(s.tx).toBeGreaterThanOrEqual(CHARACTER_BOUNDS.minX);
    expect(s.tx).toBeLessThanOrEqual(CHARACTER_BOUNDS.maxX);
    expect(s.ty).toBeGreaterThanOrEqual(CHARACTER_BOUNDS.minY);
    expect(s.ty).toBeLessThanOrEqual(CHARACTER_BOUNDS.maxY);
  });

  it('pauses happily when tapped and settles back to idle', () => {
    const walking: CharacterState = {
      ...createCharacter(CHARACTERS[1]),
      mode: 'walk',
      x: 700,
      y: 740,
      tx: 1100,
      ty: 760,
    };
    let s = characterTapped(walking);
    expect(s.mode).toBe('happy');
    s = stepCharacter(s, CHARACTER_BOUNDS.happySeconds);
    expect(s.mode).toBe('idle');
  });

  it('clamps dragged placement onto the living room floor', () => {
    const start = createCharacter(CHARACTERS[0]);
    const placed = characterPlaced(start, -100, 9999);
    expect(placed.x).toBe(CHARACTER_BOUNDS.minX);
    expect(placed.y).toBe(CHARACTER_BOUNDS.maxY);
    expect(placed.mode).toBe('idle');
  });
});
