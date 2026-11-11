import { STAGE } from '../config/balance';
import { itemArt } from '../art/items';
import { ITEMS_BY_ID } from '../data/items';
import { ROOMS } from '../data/rooms';
import type { GameState, PlacedItem, RoomId } from '../game/types';

const FLAT_ARTS = new Set(['rug', 'doorMat', 'picnicBlanket', 'steppingStone', 'stonePath', 'pool']);

export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function itemSize(itemId: string, widthOverride?: number): { w: number; h: number } {
  const item = ITEMS_BY_ID[itemId];
  if (!item) return { w: 100, h: 100 };
  const art = itemArt(item);
  const w = widthOverride ?? item.width;
  return { w, h: Math.round((w * art.h) / art.w) };
}

export function placedRect(placed: PlacedItem): Rect {
  const { w, h } = itemSize(placed.itemId);
  return { left: placed.x - w / 2, right: placed.x + w / 2, top: placed.y - h, bottom: placed.y };
}

export function isFlatItem(itemId: string): boolean {
  const item = ITEMS_BY_ID[itemId];
  return !!item && FLAT_ARTS.has(item.art);
}

function intersects(a: Rect, b: Rect, padding = 6): boolean {
  return (
    a.left + padding < b.right &&
    a.right - padding > b.left &&
    a.top + padding < b.bottom &&
    a.bottom - padding > b.top
  );
}

export type PlacementIssue = 'ok' | 'locked' | 'out-of-bounds' | 'blocked' | 'no-surface' | 'unknown';

export interface PlacementCheck {
  issue: PlacementIssue;
  x: number;
  y: number;
  hostUid?: string;
}

export function snap(value: number, step = STAGE.cell): number {
  return Math.round(value / step) * step;
}

export function hostTopY(host: PlacedItem): number {
  const size = itemSize(host.itemId);
  return host.y - Math.round(size.h * 0.8);
}

export function findSurfaceHost(
  state: GameState,
  roomId: RoomId,
  x: number,
  y: number,
  ignoreUid?: string,
): { host: PlacedItem; x: number; y: number } | null {
  const candidates = state.placed.filter((p) => {
    if (p.roomId !== roomId || p.uid === ignoreUid) return false;
    const item = ITEMS_BY_ID[p.itemId];
    if (!item?.surface) return false;
    const size = itemSize(p.itemId);
    return Math.abs(p.x - x) <= Math.max(80, size.w * 0.45) && y <= p.y + 10 && y >= p.y - size.h - 60;
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x));
  const host = candidates[0];
  const occupied = state.placed.some((p) => p.hostUid === host.uid && p.uid !== ignoreUid);
  if (occupied) return null;
  return { host, x: host.x, y: hostTopY(host) };
}

export function checkPlacement(
  state: GameState,
  roomId: RoomId,
  itemId: string,
  x: number,
  y: number,
  ignoreUid?: string,
): PlacementCheck {
  const item = ITEMS_BY_ID[itemId];
  const room = ROOMS[roomId];
  if (!item || !room) return { issue: 'unknown', x, y };
  if (!state.rooms[roomId]?.unlocked) return { issue: 'locked', x, y };

  const size = itemSize(itemId);
  const half = size.w / 2;
  const px = Math.min(STAGE.width - half - 24, Math.max(half + 24, snap(x)));
  let py = y;

  if (item.anchor === 'surface') {
    const host = findSurfaceHost(state, roomId, px, py, ignoreUid);
    if (!host) return { issue: 'no-surface', x: px, y: py };
    return { issue: 'ok', x: host.x, y: host.y, hostUid: host.host.uid };
  }

  if (item.anchor === 'wall') {
    py = Math.min(room.floorTop - 40, Math.max(size.h + 28, snap(py, 32)));
  } else {
    py = Math.min(STAGE.height - 8, Math.max(room.floorTop + 8, snap(py, 32)));
  }

  const candidate: PlacedItem = { uid: ignoreUid ?? 'candidate', itemId, roomId, x: px, y: py, flip: false };
  const rect = placedRect(candidate);

  if (rect.left < 16 || rect.right > STAGE.width - 16 || rect.top < 16 || rect.bottom > STAGE.height - 4) {
    return { issue: 'out-of-bounds', x: px, y: py };
  }

  if (!isFlatItem(itemId)) {
    const blocked = state.placed.some((other) => {
      if (other.roomId !== roomId || other.uid === ignoreUid) return false;
      const otherItem = ITEMS_BY_ID[other.itemId];
      if (!otherItem) return false;
      if (otherItem.anchor === 'surface' || otherItem.anchor !== item.anchor) return false;
      if (!isFlatItem(other.itemId) && intersects(rect, placedRect(other), 10)) return true;
      return false;
    });
    if (blocked) return { issue: 'blocked', x: px, y: py };
  }

  return { issue: 'ok', x: px, y: py };
}

/** Available copies of an item that are not currently placed. */
export function availableCount(state: GameState, itemId: string): number {
  const owned = state.inventory[itemId] ?? 0;
  const placed = state.placed.filter((p) => p.itemId === itemId).length;
  return Math.max(0, owned - placed);
}

/** Items attached to a host move with it. */
export function hostAttachments(state: GameState, hostUid: string): PlacedItem[] {
  return state.placed.filter((p) => p.hostUid === hostUid);
}

export function findFreeSpot(state: GameState, roomId: RoomId, itemId: string): { x: number; y: number; hostUid?: string } | null {
  const room = ROOMS[roomId];
  const item = ITEMS_BY_ID[itemId];
  if (!room || !item) return null;

  if (item.anchor === 'surface') {
    const hosts = state.placed.filter((p) => p.roomId === roomId && ITEMS_BY_ID[p.itemId]?.surface);
    for (const host of hosts) {
      const occupied = state.placed.some((p) => p.hostUid === host.uid);
      if (!occupied) return { x: host.x, y: hostTopY(host), hostUid: host.uid };
    }
    return null;
  }

  if (item.anchor === 'wall') {
    const candidates: { x: number; y: number }[] = [];
    for (let x = 260; x <= 1760; x += 120) {
      candidates.push({ x, y: room.floorTop - 120 });
      candidates.push({ x, y: room.floorTop - 260 });
    }
    for (const spot of candidates) {
      const check = checkPlacement(state, roomId, itemId, spot.x, spot.y);
      if (check.issue === 'ok') return { x: check.x, y: check.y };
    }
    return null;
  }

  const candidates: { x: number; y: number }[] = [];
  for (const spot of room.spots) candidates.push({ x: spot.x, y: spot.y });
  for (let y = room.floorTop + 80; y <= STAGE.height - 40; y += 90) {
    for (let x = 220; x <= STAGE.width - 220; x += 120) candidates.push({ x, y });
  }
  for (const spot of candidates) {
    const check = checkPlacement(state, roomId, itemId, spot.x, spot.y);
    if (check.issue === 'ok') return { x: check.x, y: check.y, hostUid: check.hostUid };
  }
  return null;
}

