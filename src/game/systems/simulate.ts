import { produce } from 'immer';
import { BALANCE } from '../../config/balance';
import { PRODUCERS } from '../../data/farm';
import { INGREDIENTS } from '../../data/farm';
import { ROOMS } from '../../data/rooms';
import { VISITORS, VISITORS_BY_ID, visitorWeight } from '../../data/visitors';
import type { GameState, RoomId, RoomSpot } from '../types';
import { chance, pick, uid, type Rng } from '../rng';
import { bumpEvents } from './events';

export interface SimEvent {
  type:
    | 'bubble'
    | 'visitor-arrived'
    | 'visitor-left'
    | 'producer-ready'
    | 'crop-ready'
    | 'station-ready'
    | 'event-ready';
  id: string;
  roomId?: RoomId;
}

function weightedSpot(spots: RoomSpot[], trait: string, rng: Rng): RoomSpot {
  const weights = spots.map((spot) => {
    let weight = 1;
    if (trait === 'sleepy') weight += spot.kind === 'sleep' ? 5 : spot.kind === 'sit' ? 2 : 0;
    if (trait === 'playful') weight += spot.kind === 'play' ? 5 : spot.kind === 'sit' ? 2 : 0;
    if (trait === 'foodie') weight += spot.kind === 'eat' ? 6 : 0;
    if (trait === 'curious') weight += 2;
    return weight;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < spots.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return spots[i];
  }
  return spots[spots.length - 1];
}

function bubbleValue(happiness: number): number {
  let value = 1;
  if (happiness >= 55) value += 1;
  if (happiness >= 80) value += 1;
  return Math.min(BALANCE.bubbleValueMax, value);
}

function updatePets(draft: GameState, now: number, dt: number, rng: Rng): void {
  for (const pet of draft.pets) {
    pet.happiness = Math.max(BALANCE.happinessMin, pet.happiness - (BALANCE.happinessDecayPerHour * dt) / 3_600_000);

    const hasBubble = draft.bubbles.some((b) => b.sourceType === 'pet' && b.sourceId === pet.id);
    if (pet.nextBubbleAt <= now) {
      if (!hasBubble) {
        draft.bubbles.push({
          id: uid('bubble'),
          sourceId: pet.id,
          sourceType: 'pet',
          roomId: pet.roomId,
          value: bubbleValue(pet.happiness),
          spawnedAt: now,
        });
      }
      pet.nextBubbleAt = now + rng.int(BALANCE.petBubbleIntervalMin, BALANCE.petBubbleIntervalMax);
    }

    const room = ROOMS[pet.roomId];
    if (!room) continue;

    if (pet.state === 'walk' && pet.targetX != null && pet.targetY != null) {
      const dx = pet.targetX - pet.x;
      const dy = pet.targetY - pet.y;
      const distance = Math.hypot(dx, dy);
      const step = (170 * dt) / 1000;
      if (distance <= step || distance < 4) {
        pet.x = pet.targetX;
        pet.y = pet.targetY;
        const spot = room.spots.find((s) => s.id === pet.spotId);
        if (spot) {
          pet.state = spot.kind;
          pet.stateUntil = now + rng.int(45_000, 4 * 60_000);
          pet.x = spot.x;
          pet.y = spot.y;
        } else {
          pet.state = 'idle';
          pet.stateUntil = now + rng.int(4_000, 10_000);
        }
      } else {
        pet.x += (dx / distance) * step;
        pet.y += (dy / distance) * step;
      }
      continue;
    }

    if (pet.stateUntil > now) continue;

    if (pet.state !== 'idle' && chance(rng, 0.28)) {
      pet.state = 'idle';
      pet.stateUntil = now + rng.int(4_000, 12_000);
      pet.spotId = undefined;
      continue;
    }

    const spot = weightedSpot(room.spots, pet.trait, rng);
    pet.state = 'walk';
    pet.spotId = spot.id;
    pet.targetX = spot.x + rng.int(-20, 20);
    pet.targetY = spot.y;
    pet.stateUntil = now + 30_000;
  }
}

function updateCritters(draft: GameState, now: number, rng: Rng): void {
  for (const room of Object.values(ROOMS)) {
    if (!draft.rooms[room.id]?.unlocked) continue;
    for (const spot of room.critterSpots) {
      const state = (draft.critters[spot.id] ??= { nextBubbleAt: now + rng.int(30_000, 90_000) });
      if (state.nextBubbleAt > now) continue;
      const exists = draft.bubbles.some((b) => b.sourceId === spot.id);
      if (!exists) {
        draft.bubbles.push({
          id: uid('bubble'),
          sourceId: spot.id,
          sourceType: 'critter',
          roomId: room.id,
          value: spot.kind === 'owl' ? rng.int(2, 3) : rng.int(1, 2),
          spawnedAt: now,
          x: spot.x,
          y: spot.y,
        });
      }
      state.nextBubbleAt = now + rng.int(8 * 60_000, 18 * 60_000);
    }
  }
}

function expireVisitors(draft: GameState, upTo: number, rng: Rng): void {
  const leaving = draft.visitors.active.filter((v) => v.leavesAt <= upTo);
  for (const visitor of leaving) {
    const def = VISITORS_BY_ID[visitor.visitorId];
    if (!def) continue;
    const friendship = draft.visitors.discovered[visitor.visitorId];
    if (friendship) friendship.visits += 1;
    if (visitor.gift) {
      if (chance(rng, 0.62)) {
        const ingredient = pick(rng, INGREDIENTS).id;
        const qty = rng.int(1, 2);
        draft.pantry.ingredients[ingredient] = (draft.pantry.ingredients[ingredient] ?? 0) + qty;
      } else {
        const hearts = rng.int(2, 5);
        draft.hearts += hearts;
        draft.stats.heartsEarned += hearts;
      }
    }
    draft.bubbles = draft.bubbles.filter((b) => b.visitorId !== visitor.id);
  }
  draft.visitors.active = draft.visitors.active.filter((v) => v.leavesAt > upTo);
}

function spawnVisitors(draft: GameState, now: number, rng: Rng): SimEvent[] {
  const events: SimEvent[] = [];
  let guard = 0;
  while (draft.visitors.nextRollAt <= now && guard < 40) {
    guard += 1;
    const rollAt = draft.visitors.nextRollAt;
    expireVisitors(draft, rollAt, rng);
    draft.visitors.nextRollAt = rollAt + rng.int(BALANCE.visitorRollMin, BALANCE.visitorRollMax);
    if (draft.visitors.active.length >= BALANCE.maxVisitors) continue;

    const unlockedRooms = (Object.keys(draft.rooms) as RoomId[]).filter((id) => draft.rooms[id].unlocked);
    if (unlockedRooms.length === 0) continue;
    const roomId = pick(rng, unlockedRooms);
    const room = ROOMS[roomId];
    const activeDefs = new Set(draft.visitors.active.map((v) => v.visitorId));
    const candidates = VISITORS.filter((visitor) => !activeDefs.has(visitor.id));
    const weights = candidates.map((visitor) => visitorWeight(visitor, room.attractTags, roomId));
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = rng.next() * total;
    let chosen = candidates[0];
    for (let i = 0; i < candidates.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        chosen = candidates[i];
        break;
      }
    }
    if (!chosen) continue;
    const spot = pick(rng, room.spots);
    const instanceId = uid('visitor');
    const firstTime = !draft.visitors.discovered[chosen.id];
    draft.visitors.discovered[chosen.id] ??= { discoveredAt: rollAt, visits: 0, friendship: 0 };
    draft.visitors.discovered[chosen.id].friendship = Math.min(10, draft.visitors.discovered[chosen.id].friendship + 1);
    draft.visitors.active.push({
      id: instanceId,
      visitorId: chosen.id,
      roomId,
      arrivedAt: rollAt,
      leavesAt: rollAt + rng.int(BALANCE.visitorStayMin, BALANCE.visitorStayMax),
      gift: chance(rng, 0.45),
      x: spot.x + rng.int(-24, 24),
      y: spot.y,
    });
    draft.bubbles.push({
      id: uid('bubble'),
      sourceId: instanceId,
      sourceType: 'visitor',
      roomId,
      value: rng.int(1, 3),
      spawnedAt: rollAt,
      visitorId: instanceId,
    });
    if (firstTime) {
      draft.stats.visitorsMet += 1;
      bumpEvents(draft, 'visitors', rollAt, 1);
    }
    events.push({ type: 'visitor-arrived', id: chosen.id, roomId });
  }
  expireVisitors(draft, now, rng);
  return events;
}

function markReady(draft: GameState, now: number): SimEvent[] {
  const events: SimEvent[] = [];
  for (const producer of PRODUCERS) {
    const state = draft.farm.producers[producer.id];
    if (!state) continue;
    if (state.readyAt <= now) {
      // Producers stay ready until collected; only announce once via a stable id.
      if (!draft.bubbles.some((b) => b.sourceId === `producer:${producer.id}`)) {
        events.push({ type: 'producer-ready', id: producer.id, roomId: producer.roomId });
      }
    }
  }
  for (const stationId of Object.keys(draft.stations) as (keyof GameState['stations'])[]) {
    const station = draft.stations[stationId];
    if (station.recipeId && station.doneAt && station.doneAt <= now && !station.collected) {
      events.push({ type: 'station-ready', id: stationId, roomId: 'kitchen' });
    }
  }
  return events;
}

/** One simulation step. Pure: returns a new state. */
export function simulateTick(state: GameState, now: number, rng: Rng): GameState {
  return produce(state, (draft) => {
    const rawDt = Math.max(0, now - draft.lastSeenAt);
    const dt = Math.min(rawDt, 10 * 60_000);
    updatePets(draft, now, dt, rng);
    updateCritters(draft, now, rng);
    spawnVisitors(draft, now, rng);
    markReady(draft, now);
    draft.lastSeenAt = now;
  });
}

export function simulateOffline(state: GameState, now: number, rng: Rng): { state: GameState; elapsed: number } {
  const from = Math.max(state.lastSeenAt, now - BALANCE.offlineCap);
  const elapsed = Math.max(0, now - from);
  let current: GameState = produce(state, (draft) => {
    draft.lastSeenAt = from;
  });
  let cursor = from;
  let guard = 0;
  while (cursor < now && guard < 600) {
    guard += 1;
    cursor = Math.min(now, cursor + 60_000);
    current = simulateTick(current, cursor, rng);
  }
  current = produce(current, (draft) => {
    draft.lastSeenAt = now;
  });
  return { state: current, elapsed };
}

export { bubbleValue };
