/**
 * Dependency-free real-time multiplayer core for Our Home.
 *
 * Shared by the browser client (transports, React hooks) and the Vite dev/preview `/api/live`
 * relay in `vite.config.ts`, so it must only import the equally dependency-free shared-save core.
 */
import { sanitizeSharedHomeState, SLOT_IDS, type SharedHomeState, type SlotId } from './sharedHomeCore';

export type PlayerRole = 'her' | 'him';
export const PLAYER_ROLES: readonly PlayerRole[] = ['her', 'him'];

/** Where this device remembers who is playing (`'her' | 'him'`, absent = not chosen yet). */
export const PLAYER_ROLE_STORAGE_KEY = 'our-home:player-role:v1';

/** Supabase Realtime channel both partners join. */
export const LIVE_CHANNEL = 'our-home:living-room';
/** Broadcast event name on the live channel. */
export const LIVE_BROADCAST_EVENT = 'room';
/** Local dev / preview / E2E Server-Sent Events relay. */
export const LIVE_ENDPOINT = '/api/live';

/** Minimum gap between continuous `char_move` broadcasts (drag / keyboard stroll). */
export const MOVE_BROADCAST_INTERVAL_MS = 80;
/** How long an emote bubble floats above a character's head. */
export const EMOTE_DURATION_MS = 3400;

/** Logical room size (mirrors `ROOM` in layout.ts; kept here so this module stays dependency-free). */
export const LIVE_ROOM = { w: 1950, h: 900 } as const;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export function isPlayerRole(v: unknown): v is PlayerRole {
  return v === 'her' || v === 'him';
}

export function loadPlayerRole(storage: StorageLike | undefined): PlayerRole | null {
  try {
    const raw = storage?.getItem(PLAYER_ROLE_STORAGE_KEY);
    return isPlayerRole(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function savePlayerRole(storage: StorageLike | undefined, role: PlayerRole | null): void {
  try {
    if (role) storage?.setItem(PLAYER_ROLE_STORAGE_KEY, role);
    else storage?.removeItem?.(PLAYER_ROLE_STORAGE_KEY);
  } catch {
    // Storage can be full or blocked; the choice still lasts for this visit.
  }
}

export function otherRole(role: PlayerRole): PlayerRole {
  return role === 'her' ? 'him' : 'her';
}

export function roleLabel(role: PlayerRole): string {
  return role === 'her' ? 'Her' : 'Him';
}

// ---------------------------------------------------------------------------
// Emotes
// ---------------------------------------------------------------------------

export const EMOTE_IDS = ['love', 'wave', 'tea', 'music', 'sleepy', 'shuttle'] as const;
export type EmoteId = (typeof EMOTE_IDS)[number];

export interface EmoteDef {
  id: EmoteId;
  label: string;
}

/** Hand-drawn emote stickers (art: `src/assets/ui/emote_<id>.png`). */
export const EMOTES: readonly EmoteDef[] = [
  { id: 'love', label: 'Love' },
  { id: 'wave', label: 'Hi!' },
  { id: 'tea', label: 'Tea' },
  { id: 'music', label: 'Music' },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'shuttle', label: 'Play!' },
];

export function isEmoteId(v: unknown): v is EmoteId {
  return typeof v === 'string' && (EMOTE_IDS as readonly string[]).includes(v);
}

// ---------------------------------------------------------------------------
// Presence
// ---------------------------------------------------------------------------

export interface PresencePeer {
  clientId: string;
  role: PlayerRole | null;
}

export interface PresenceSummary {
  /** Someone else is in the room right now. */
  partnerOnline: boolean;
  /** The role the (first) other player chose, if any. */
  partnerRole: PlayerRole | null;
  /** Roles currently claimed by other connected players. */
  onlineRoles: PlayerRole[];
  /** Number of other connected clients. */
  partnerCount: number;
  /** Deterministic soft leader for shared pet wandering: lowest clientId online (self included). */
  petLeaderId: string;
  /** True when this client drives the shared pet (only meaningful while together). */
  isPetLeader: boolean;
}

const CLIENT_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export function isClientId(v: unknown): v is string {
  return typeof v === 'string' && CLIENT_ID_RE.test(v);
}

/** A short random id for this tab's live connection. */
export function createClientId(rand: () => number = Math.random): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, '').slice(0, 20);
  let id = '';
  for (let i = 0; i < 20; i++) id += Math.floor(rand() * 36).toString(36);
  return id;
}

/** Keeps only well-formed peers, one entry per clientId (the last role wins). */
export function sanitizePresencePeers(input: unknown): PresencePeer[] {
  if (!Array.isArray(input)) return [];
  const byId = new Map<string, PresencePeer>();
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const { clientId, role } = raw as Record<string, unknown>;
    if (!isClientId(clientId)) continue;
    byId.set(clientId, { clientId, role: isPlayerRole(role) ? role : null });
  }
  return Array.from(byId.values());
}

export function computePresence(peers: readonly PresencePeer[], selfClientId: string): PresenceSummary {
  const others = peers.filter((p) => p.clientId !== selfClientId);
  const onlineRoles = PLAYER_ROLES.filter((r) => others.some((p) => p.role === r));
  const partnerRole = others.find((p) => p.role)?.role ?? null;
  const ids = [selfClientId, ...others.map((p) => p.clientId)].sort();
  const petLeaderId = ids[0];
  const partnerOnline = others.length > 0;
  return {
    partnerOnline,
    partnerRole,
    onlineRoles,
    partnerCount: others.length,
    petLeaderId,
    isPetLeader: partnerOnline && petLeaderId === selfClientId,
  };
}

/**
 * Who drives a resident on this screen:
 * - `local`: it is this player's character (tap the floor / drag / keys),
 * - `remote`: the partner is online playing it, so it follows their broadcasts,
 * - `auto`: nobody controls it, so it strolls around on its own like before.
 */
export type CharacterControl = 'local' | 'remote' | 'auto';

export function characterControl(
  characterId: PlayerRole,
  myRole: PlayerRole | null,
  presence: Pick<PresenceSummary, 'partnerOnline' | 'onlineRoles'>,
): CharacterControl {
  if (myRole === characterId) return 'local';
  if (presence.partnerOnline && presence.onlineRoles.includes(characterId)) return 'remote';
  return 'auto';
}

// ---------------------------------------------------------------------------
// Live events
// ---------------------------------------------------------------------------

export type Facing = 1 | -1;

export interface CharMoveEvent {
  type: 'char_move';
  role: PlayerRole;
  x: number;
  y: number;
  tx: number;
  ty: number;
  facing: Facing;
  mode: 'walk' | 'idle' | 'drag';
}

export interface CharEmoteEvent {
  type: 'char_emote';
  role: PlayerRole;
  emote: EmoteId;
  seq: number;
}

export interface CharPokeEvent {
  type: 'char_poke';
  fromRole: PlayerRole | null;
  targetRole: PlayerRole;
}

export interface PetTapEvent {
  type: 'pet_tap';
  x: number;
  y: number;
  facing: Facing;
}

export interface PetSyncEvent {
  type: 'pet_sync';
  x: number;
  y: number;
  tx: number;
  ty: number;
  mode: 'idle' | 'walk';
  facing: Facing;
}

export interface ItemTapEvent {
  type: 'item_tap';
  slotId: SlotId;
}

export interface HomeStateEvent {
  type: 'home_state';
  state: SharedHomeState;
}

export type RoomLiveEvent =
  | CharMoveEvent
  | CharEmoteEvent
  | CharPokeEvent
  | PetTapEvent
  | PetSyncEvent
  | ItemTapEvent
  | HomeStateEvent;

export type RoomLiveEventType = RoomLiveEvent['type'];

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const clampTo = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)));

const coordX = (v: unknown): number | null => (finite(v) ? clampTo(v, 0, LIVE_ROOM.w) : null);
const coordY = (v: unknown): number | null => (finite(v) ? clampTo(v, 0, LIVE_ROOM.h) : null);
const facingOf = (v: unknown): Facing => (v === -1 ? -1 : 1);

/**
 * Validates and normalizes an incoming live event. Unknown types, missing fields, bad roles or
 * slot ids, and non-finite coordinates are rejected (null); coordinates are clamped to the room.
 */
export function sanitizeLiveEvent(input: unknown): RoomLiveEvent | null {
  if (!isRecord(input)) return null;
  switch (input.type) {
    case 'char_move': {
      const x = coordX(input.x);
      const y = coordY(input.y);
      if (!isPlayerRole(input.role) || x === null || y === null) return null;
      const mode = input.mode === 'walk' || input.mode === 'drag' ? input.mode : 'idle';
      return {
        type: 'char_move',
        role: input.role,
        x,
        y,
        tx: coordX(input.tx) ?? x,
        ty: coordY(input.ty) ?? y,
        facing: facingOf(input.facing),
        mode,
      };
    }
    case 'char_emote':
      if (!isPlayerRole(input.role) || !isEmoteId(input.emote)) return null;
      return {
        type: 'char_emote',
        role: input.role,
        emote: input.emote,
        seq: finite(input.seq) ? Math.floor(input.seq) : 0,
      };
    case 'char_poke':
      if (!isPlayerRole(input.targetRole)) return null;
      return {
        type: 'char_poke',
        fromRole: isPlayerRole(input.fromRole) ? input.fromRole : null,
        targetRole: input.targetRole,
      };
    case 'pet_tap': {
      const x = coordX(input.x);
      const y = coordY(input.y);
      if (x === null || y === null) return null;
      return { type: 'pet_tap', x, y, facing: facingOf(input.facing) };
    }
    case 'pet_sync': {
      const x = coordX(input.x);
      const y = coordY(input.y);
      if (x === null || y === null) return null;
      return {
        type: 'pet_sync',
        x,
        y,
        tx: coordX(input.tx) ?? x,
        ty: coordY(input.ty) ?? y,
        mode: input.mode === 'walk' ? 'walk' : 'idle',
        facing: facingOf(input.facing),
      };
    }
    case 'item_tap':
      if (typeof input.slotId !== 'string' || !(SLOT_IDS as string[]).includes(input.slotId)) return null;
      return { type: 'item_tap', slotId: input.slotId as SlotId };
    case 'home_state':
      if (!isRecord(input.state)) return null;
      return { type: 'home_state', state: sanitizeSharedHomeState(input.state) };
    default:
      return null;
  }
}

/** Messages the `/api/live` SSE relay pushes to connected clients. */
export type LiveServerMessage =
  | { type: 'presence'; peers: PresencePeer[] }
  | { type: 'event'; from: string; event: RoomLiveEvent };

/** Parses one SSE `data:` payload from the relay (null for anything malformed). */
export function parseLiveServerMessage(input: unknown): LiveServerMessage | null {
  if (!isRecord(input)) return null;
  if (input.type === 'presence') return { type: 'presence', peers: sanitizePresencePeers(input.peers) };
  if (input.type === 'event') {
    const event = sanitizeLiveEvent(input.event);
    if (!event || !isClientId(input.from)) return null;
    return { type: 'event', from: input.from, event };
  }
  return null;
}

/** Bodies accepted by `POST /api/live`. */
export type LiveClientMessage =
  | { type: 'presence'; clientId: string; role: PlayerRole | null }
  | { type: 'event'; clientId: string; event: RoomLiveEvent };

export function parseLiveClientMessage(input: unknown): LiveClientMessage | null {
  if (!isRecord(input) || !isClientId(input.clientId)) return null;
  if (input.type === 'presence') {
    return { type: 'presence', clientId: input.clientId, role: isPlayerRole(input.role) ? input.role : null };
  }
  if (input.type === 'event') {
    const event = sanitizeLiveEvent(input.event);
    return event ? { type: 'event', clientId: input.clientId, event } : null;
  }
  return null;
}
