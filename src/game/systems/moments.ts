import { produce } from 'immer';
import { MOMENTS_BY_ID, REPEATABLE_MOMENTS } from '../../data/moments';
import type { GameState } from '../types';

export function awardMoment(state: GameState, id: string, now: number): GameState {
  if (!MOMENTS_BY_ID[id]) return state;
  const existing = state.moments[id];
  if (existing && !REPEATABLE_MOMENTS.has(id)) return state;
  return produce(state, (draft) => {
    if (draft.moments[id]) {
      draft.moments[id].count += 1;
    } else {
      draft.moments[id] = { firstAt: now, count: 1 };
    }
  });
}

export function candidateMoments(state: GameState, _now: number): string[] {
  const found: string[] = [];
  const has = (id: string) => !!state.moments[id];

  if (state.bubbles.length >= 5 && !has('fiveBubbles')) found.push('fiveBubbles');
  if (state.placed.length >= 10 && !has('tenItems')) found.push('tenItems');
  if (state.pets.length >= 6 && !has('sixPets')) found.push('sixPets');
  if (state.recipesLearned.length >= 10 && !has('tenRecipes')) found.push('tenRecipes');
  if (state.settings.showBaby && state.rooms.nursery.unlocked && !has('babyFirst')) found.push('babyFirst');
  if (Object.values(state.visitors.discovered).some((v) => v.friendship >= 3) && !has('friendship')) found.push('friendship');

  for (const pet of state.pets) {
    if (pet.roomId === 'living' && !has('bookPile')) {
      if (pet.state === 'sleep') found.push('bookPile');
    }
    if (pet.roomId === 'living' && pet.spotId === 'piano' && !has('pianoCat')) found.push('pianoCat');
    if (pet.roomId === 'living' && (pet.spotId === 'sofaL' || pet.spotId === 'sofaR') && !has('sofaNap')) found.push('sofaNap');
    if (pet.roomId === 'bathroom') {
      if (!has('sinkCat')) found.push('sinkCat');
      if (pet.state === 'sleep' && !has('laundry')) found.push('laundry');
    }
    if (pet.roomId === 'garden' && pet.state === 'sleep' && !has('gardenNap')) found.push('gardenNap');
    if (pet.roomId === 'kitchen' && !has('snackBag')) found.push('snackBag');
    if (pet.roomId === 'bedroom' && pet.state === 'sleep' && !has('drawerCat')) found.push('drawerCat');
  }
  return [...new Set(found)];
}

export function applyMomentTriggers(state: GameState, now: number): { state: GameState; newMoments: string[] } {
  const candidates = candidateMoments(state, now);
  let next = state;
  const brandNew: string[] = [];
  for (const id of candidates) {
    if (!next.moments[id]) brandNew.push(id);
    next = awardMoment(next, id, now);
  }
  return { state: next, newMoments: brandNew };
}
