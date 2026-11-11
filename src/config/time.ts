import type { Ts } from '../game/types';

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/** Debug-only clock offset, in ms. Kept outside save data. */
let clockOffset = 0;
let frozenNow: number | null = null;

export function now(): Ts {
  return frozenNow ?? Date.now() + clockOffset;
}

export function getClockOffset(): number {
  return clockOffset;
}

export function addClockOffset(ms: number): void {
  clockOffset += ms;
}

export function resetClock(): void {
  clockOffset = 0;
  frozenNow = null;
}

export function freezeClock(at: number | null): void {
  frozenNow = at;
}

export function isDebugClock(): boolean {
  return clockOffset !== 0 || frozenNow !== null;
}

export function hourOf(ts: number): number {
  const d = new Date(ts);
  return d.getHours() + d.getMinutes() / 60;
}

export function dayPhase(ts: number): DayPhase {
  const h = hourOf(ts);
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 17.5) return 'day';
  if (h >= 17.5 && h < 20) return 'dusk';
  return 'night';
}

export function seasonOf(ts: number): Season {
  const m = new Date(ts).getMonth();
  if (m <= 1 || m === 11) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

export function lightLevel(phase: DayPhase): number {
  switch (phase) {
    case 'dawn':
      return 0.18;
    case 'day':
      return 0;
    case 'dusk':
      return 0.22;
    case 'night':
      return 0.45;
  }
}

export function formatDuration(ms: number, lang = 'en'): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  if (totalMinutes < 60) {
    if (totalMinutes < 1) return lang === 'en' ? '<1m' : '<1m';
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function formatDate(ts: number, _lang = 'en'): string {
  try {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
  } catch {
    return new Date(ts).toISOString().slice(0, 16).replace('T', ' ');
  }
}
