import { BALANCE, SAVE } from '../config/balance';
import type { GameState, SaveEnvelope } from '../game/types';
import { cloudConfigured } from './cloud';
import { makeEnvelope } from './schema';
import { getDeviceId as readDeviceId, saveLocal, writeSnapshot } from './storage';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveOptions {
  getState: () => GameState;
  getDeviceId?: () => string;
  onSaved?: (envelope: SaveEnvelope) => void;
  onStatus?: (status: AutosaveStatus) => void;
  onError?: (error: unknown) => void;
  onCloudSync?: (envelope: SaveEnvelope) => void;
}

let options: AutosaveOptions | null = null;
let deviceId = '';
let revision = 1;
let dirty = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let snapshotTimer: ReturnType<typeof setInterval> | null = null;
let cloudTimer: ReturnType<typeof setTimeout> | null = null;
let lastSnapshotAt = 0;
let status: AutosaveStatus = 'idle';
let saving: Promise<SaveEnvelope | null> | null = null;
let lastSavedAt = 0;

function emitStatus(next: AutosaveStatus): void {
  if (status === next) return;
  status = next;
  options?.onStatus?.(next);
}

export function getAutosaveStatus(): AutosaveStatus {
  return status;
}

export function getSaveRevision(): number {
  return revision;
}

export function setSaveRevision(value: number): void {
  revision = Math.max(revision, Math.floor(value));
}

/**
 * Marks the save dirty and schedules a write. The timer is not extended by
 * further calls, so a continuously ticking simulation still gets saved.
 */
export function requestSnapshot(): void {
  dirty = true;
  if (saveTimer || saving) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void saveNow();
  }, BALANCE.autosaveDebounce);
}

export async function saveNow(force = false): Promise<SaveEnvelope | null> {
  if (!options) return null;
  if (!dirty && !force) return null;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (saving) return saving;
  const at = Date.now();
  const state = options.getState();
  const nextDeviceId = options.getDeviceId?.() ?? deviceId ?? (await readDeviceId());
  deviceId = nextDeviceId;
  revision += 1;
  const envelope = makeEnvelope(state, revision, deviceId, at);
  emitStatus('saving');
  saving = (async () => {
    try {
      await saveLocal(state, revision, deviceId, at);
      dirty = false;
      lastSavedAt = at;
      emitStatus('saved');
      options?.onSaved?.(envelope);
      scheduleCloudSync(envelope);
      return envelope;
    } catch (error) {
      revision = Math.max(1, revision - 1);
      emitStatus('error');
      options?.onError?.(error);
      return null;
    } finally {
      saving = null;
      if (dirty && !saveTimer) {
        saveTimer = setTimeout(() => {
          saveTimer = null;
          void saveNow();
        }, BALANCE.autosaveDebounce);
      }
    }
  })();
  return saving;
}

export function snapshotNow(): void {
  if (!options) return;
  const at = Date.now();
  lastSnapshotAt = at;
  void writeSnapshot(options.getState(), at);
}

export async function flushSave(): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  await saveNow(true);
}

function scheduleCloudSync(envelope: SaveEnvelope): void {
  if (!options?.onCloudSync || !cloudConfigured()) return;
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => {
    cloudTimer = null;
    options?.onCloudSync?.(envelope);
  }, BALANCE.cloudUploadDelay);
}

function handlePageHide(): void {
  if (!dirty) return;
  // Best-effort synchronous local mirror. IndexedDB writes may not finish
  // during unload, but the localStorage mirror is written by saveLocal.
  try {
    const state = options?.getState();
    if (!state) return;
    const envelope = makeEnvelope(state, revision + 1, deviceId, Date.now());
    localStorage.setItem(SAVE.key, JSON.stringify(envelope));
  } catch {
    /* ignore */
  }
}

function handleVisibility(): void {
  if (document.visibilityState === 'hidden') {
    void flushSave();
  }
}

let unsubscribe: (() => void) | null = null;

export function initAutosave(init: AutosaveOptions & { subscribe: (listener: () => void) => () => void }): () => void {
  options = init;
  deviceId = init.getDeviceId?.() ?? '';
  if (!deviceId) {
    void readDeviceId().then((id) => {
      if (!deviceId) deviceId = id;
    });
  }
  if (init.getDeviceId) revision = Math.max(revision, 1);
  unsubscribe = init.subscribe(() => requestSnapshot());
  snapshotTimer = setInterval(() => {
    if (Date.now() - lastSnapshotAt >= BALANCE.snapshotInterval) {
      void flushSave();
      snapshotNow();
    }
  }, 60_000);
  window.addEventListener('pagehide', handlePageHide);
  document.addEventListener('visibilitychange', handleVisibility);
  void saveNow(true);
  return () => stopAutosave();
}

export function stopAutosave(): void {
  unsubscribe?.();
  unsubscribe = null;
  if (saveTimer) clearTimeout(saveTimer);
  if (snapshotTimer) clearInterval(snapshotTimer);
  if (cloudTimer) clearTimeout(cloudTimer);
  saveTimer = null;
  snapshotTimer = null;
  cloudTimer = null;
  window.removeEventListener('pagehide', handlePageHide);
  document.removeEventListener('visibilitychange', handleVisibility);
  options = null;
}

/** Test helper. */
export function __resetAutosaveForTests(): void {
  stopAutosave();
  revision = 1;
  dirty = false;
  status = 'idle';
  saving = null;
  lastSavedAt = 0;
  lastSnapshotAt = 0;
}

export { lastSavedAt };
