import { describe, expect, it } from 'vitest';
import {
  CHARACTERS,
  CHARACTER_BOUNDS,
  DEFAULT_OUTFITS,
  characterPlaced,
  characterTapped,
  createCharacter,
  loadOutfits,
  resolveCharacterOutfit,
  saveOutfits,
  stepCharacter,
  walkFrameOf,
  type CharacterState,
} from '../../src/game/characters';
import sprites from '../../src/game/sprites.json';

const fixed = (v: number) => () => v;

describe('characters', () => {
  it('initializes both resident characters inside the walkable floor bounds with walk strips', () => {
    expect(CHARACTERS).toHaveLength(2);
    for (const def of CHARACTERS) {
      const s = createCharacter(def);
      expect(s.x).toBeGreaterThanOrEqual(CHARACTER_BOUNDS.minX);
      expect(s.x).toBeLessThanOrEqual(CHARACTER_BOUNDS.maxX);
      expect(s.y).toBeGreaterThanOrEqual(CHARACTER_BOUNDS.minY);
      expect(s.y).toBeLessThanOrEqual(CHARACTER_BOUNDS.maxY);
      expect(s.mode).toBe('idle');
      expect(s.walkPhase).toBe(0);
      expect(def.walkFrames).toBe(4);
      const walkMeta = sprites[def.walkSprite] as { w: number; h: number; frames?: number };
      expect(walkMeta.frames).toBe(def.walkFrames);
      expect(walkMeta.h).toBe(def.height);
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

  it('cycles walk frames smoothly while walking and resets phase on arrival', () => {
    let s: CharacterState = {
      ...createCharacter(CHARACTERS[0]),
      mode: 'walk',
      x: 300,
      y: 780,
      tx: 900,
      ty: 780,
      walkPhase: 0,
    };
    const frameDt = 1 / CHARACTER_BOUNDS.walkFps;
    const seenFrames = [walkFrameOf(s)];
    for (let i = 0; i < 4; i++) {
      s = stepCharacter(s, frameDt);
      seenFrames.push(walkFrameOf(s));
    }
    expect(seenFrames).toEqual([0, 1, 2, 3, 0]);

    // Stepping all the way to the target settles back to idle with walkPhase reset.
    s = stepCharacter(s, 20);
    expect(s.mode).toBe('idle');
    expect(s.walkPhase).toBe(0);
    expect(walkFrameOf(s)).toBe(0);
  });

  it('pauses happily when tapped and settles back to idle', () => {
    const walking: CharacterState = {
      ...createCharacter(CHARACTERS[1]),
      mode: 'walk',
      x: 700,
      y: 740,
      tx: 1100,
      ty: 760,
      walkPhase: 2.4,
    };
    let s = characterTapped(walking);
    expect(s.mode).toBe('happy');
    expect(s.walkPhase).toBe(0);
    s = stepCharacter(s, CHARACTER_BOUNDS.happySeconds);
    expect(s.mode).toBe('idle');
  });

  it('clamps dragged placement onto the living room floor', () => {
    const start = { ...createCharacter(CHARACTERS[0]), mode: 'walk' as const, walkPhase: 1.7 };
    const placed = characterPlaced(start, -100, 9999);
    expect(placed.x).toBe(CHARACTER_BOUNDS.minX);
    expect(placed.y).toBe(CHARACTER_BOUNDS.maxY);
    expect(placed.mode).toBe('idle');
    expect(placed.walkPhase).toBe(0);
  });

  it('resolves and persists selectable outfits for her character', () => {
    const her = CHARACTERS.find((c) => c.id === 'her')!;
    expect(her.outfits.map((o) => o.id)).toEqual(['dress', 'badminton']);
    for (const outfit of her.outfits) {
      expect(sprites[outfit.sprite].h).toBe(her.height);
      const walkMeta = sprites[outfit.walkSprite] as { w: number; h: number; frames?: number };
      expect(walkMeta.frames).toBe(outfit.walkFrames);
      expect(walkMeta.h).toBe(her.height);
    }

    expect(resolveCharacterOutfit(her, 'badminton').sprite).toBe('resident_her_badminton');
    expect(resolveCharacterOutfit(her, 'unknown').id).toBe('dress');

    const store: Record<string, string> = {};
    const storage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
    };
    saveOutfits(storage, { ...DEFAULT_OUTFITS, her: 'badminton' });
    expect(loadOutfits(storage)).toEqual({ her: 'badminton', him: 'casual' });

    store['our-home:outfits:v1'] = JSON.stringify({ her: 'invalid-id' });
    expect(loadOutfits(storage)).toEqual(DEFAULT_OUTFITS);
  });
});
