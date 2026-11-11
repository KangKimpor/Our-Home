import { SAVE } from '../config/balance';
import type { GameState, SaveEnvelope } from '../game/types';

export function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<GameState>;
  return (
    typeof state.version === 'number' &&
    typeof state.hearts === 'number' &&
    Number.isFinite(state.hearts) &&
    typeof state.createdAt === 'number' &&
    typeof state.lastSeenAt === 'number' &&
    !!state.settings &&
    typeof state.settings.lang === 'string' &&
    !!state.rooms &&
    !!state.inventory &&
    Array.isArray(state.placed) &&
    Array.isArray(state.pets) &&
    !!state.visitors &&
    Array.isArray(state.bubbles) &&
    !!state.farm &&
    !!state.pantry &&
    !!state.stations &&
    !!state.stats
  );
}

export function isEnvelope(value: unknown): value is SaveEnvelope {
  if (!value || typeof value !== 'object') return false;
  const env = value as Partial<SaveEnvelope>;
  return (
    typeof env.version === 'number' &&
    typeof env.revision === 'number' &&
    typeof env.savedAt === 'number' &&
    typeof env.deviceId === 'string' &&
    isGameState(env.state)
  );
}

export function makeEnvelope(state: GameState, revision: number, deviceId: string, savedAt = Date.now()): SaveEnvelope {
  return { version: SAVE.version, revision, deviceId, savedAt, state };
}

export interface SaveSummary {
  hearts: number;
  placed: number;
  visitors: number;
  moments: number;
  lastPlayed: number;
  rooms: string[];
}

export function summarize(state: GameState): SaveSummary {
  return {
    hearts: Math.round(state.hearts),
    placed: state.placed.length,
    visitors: Object.keys(state.visitors.discovered).length,
    moments: Object.keys(state.moments).length,
    lastPlayed: state.lastSeenAt,
    rooms: Object.entries(state.rooms)
      .filter(([, value]) => value.unlocked)
      .map(([id]) => id),
  };
}

export function cloudIsNewer(cloud: SaveEnvelope, local: SaveEnvelope): boolean {
  if (cloud.revision !== local.revision) return cloud.revision > local.revision;
  return cloud.savedAt > local.savedAt;
}

/** True when both sides changed since the last successful sync. */
export function needsConflictDialog(local: SaveEnvelope, cloud: SaveEnvelope, lastSyncedRevision: number): boolean {
  if (local.revision === lastSyncedRevision) return false;
  if (cloud.revision <= lastSyncedRevision) return false;
  return local.revision < cloud.revision || local.savedAt !== cloud.savedAt;
}
