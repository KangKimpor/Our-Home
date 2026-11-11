import { EVENTS, eventActive } from '../../data/events';
import type { GameState } from '../types';

/** Increases progress on every currently active event matching the goal. */
export function bumpEvents(draft: GameState, goal: 'collect' | 'visitors' | 'harvest' | 'cook', now: number, amount = 1): void {
  for (const event of EVENTS) {
    if (event.goal !== goal) continue;
    if (!eventActive(event, now)) continue;
    const progress = (draft.events[event.id] ??= { claimed: false, progress: 0 });
    progress.progress = Math.min(event.target, progress.progress + amount);
  }
}

export function claimableHearts(state: GameState, now: number): number {
  let total = 0;
  for (const event of EVENTS) {
    if (!eventActive(event, now)) continue;
    const progress = state.events[event.id];
    if (progress && !progress.claimed && progress.progress >= event.target) total += event.rewardHearts;
  }
  return total;
}
