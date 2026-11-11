import type { EventDef } from '../game/types';

/** Three sample events. Dates recur every year; the debug clock can travel through them. */
export const EVENTS: EventDef[] = [
  {
    id: 'harvestDays',
    name: 'Harvest Days',
    nameKey: 'event.harvestDays',
    descKey: 'event.harvestDays.desc',
    goal: 'harvest',
    target: 5,
    rewardHearts: 120,
    startMonth: 10,
    startDay: 25,
    endMonth: 11,
    endDay: 30,
    color: 'teal',
    icon: 'leaf',
  },
  {
    id: 'cozyNights',
    name: 'Cozy Nights',
    nameKey: 'event.cozyNights',
    descKey: 'event.cozyNights.desc',
    goal: 'collect',
    target: 30,
    rewardHearts: 180,
    startMonth: 11,
    startDay: 8,
    endMonth: 12,
    endDay: 15,
    color: 'navy',
    icon: 'moon',
  },
  {
    id: 'visitorWelcome',
    name: 'Visitor Welcome',
    nameKey: 'event.visitorWelcome',
    descKey: 'event.visitorWelcome.desc',
    goal: 'visitors',
    target: 3,
    rewardHearts: 220,
    startMonth: 11,
    startDay: 10,
    endMonth: 12,
    endDay: 31,
    color: 'plum',
    icon: 'star',
  },
];

export const EVENTS_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

function monthDayValue(month: number, day: number): number {
  return month * 100 + day;
}

export function eventActive(event: EventDef, ts: number): boolean {
  const date = new Date(ts);
  const nowValue = monthDayValue(date.getMonth() + 1, date.getDate());
  const start = monthDayValue(event.startMonth, event.startDay);
  const end = monthDayValue(event.endMonth, event.endDay);
  if (start <= end) return nowValue >= start && nowValue <= end;
  return nowValue >= start || nowValue <= end;
}

export function eventEndTimestamp(event: EventDef, ts: number): number {
  const date = new Date(ts);
  const year = date.getFullYear();
  const endCandidate = new Date(year, event.endMonth - 1, event.endDay, 23, 59, 59, 999).getTime();
  if (endCandidate >= ts) return endCandidate;
  return new Date(year + 1, event.endMonth - 1, event.endDay, 23, 59, 59, 999).getTime();
}

export function eventStartTimestamp(event: EventDef, ts: number): number {
  const date = new Date(ts);
  const year = date.getFullYear();
  const startCandidate = new Date(year, event.startMonth - 1, event.startDay, 0, 0, 0, 0).getTime();
  if (startCandidate <= ts) return startCandidate;
  return new Date(year - 1, event.startMonth - 1, event.startDay).getTime();
}
