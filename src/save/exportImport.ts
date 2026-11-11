import type { GameState, SaveEnvelope } from '../game/types';
import { isEnvelope } from './schema';
import { migrateState } from './migrations';

export function exportSaveJson(state: GameState, revision = 1): string {
  return JSON.stringify({ version: 1, revision, exportedAt: Date.now(), state }, null, 2);
}

export function encodeBackupCode(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function decodeBackupCode(code: string): string {
  const binary = atob(code.trim());
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function parseBackup(text: string): GameState {
  const raw = text.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try {
      parsed = JSON.parse(decodeBackupCode(raw));
    } catch {
      throw new Error('This does not look like an Our Home backup.');
    }
  }
  if (isEnvelope(parsed)) return migrateState(parsed.state);
  if (parsed && typeof parsed === 'object' && 'state' in (parsed as Record<string, unknown>)) {
    return migrateState((parsed as { state: unknown }).state);
  }
  return migrateState(parsed);
}

export function downloadSave(state: GameState): void {
  const blob = new Blob([exportSaveJson(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `our-home-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function summarizeExport(text: string): { hearts: number; placed: number; savedAt: number } | null {
  try {
    const state = parseBackup(text);
    return { hearts: state.hearts, placed: state.placed.length, savedAt: state.lastSeenAt };
  } catch {
    return null;
  }
}

export function envelopeFromImport(state: GameState, deviceId: string): SaveEnvelope {
  return { version: 1, revision: 1, deviceId, savedAt: Date.now(), state };
}
