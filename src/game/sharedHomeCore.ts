/**
 * Dependency-free shared-save core for Our Home.
 *
 * This module is imported by the browser client (`src/game/homeState.ts`), the
 * Vite dev/preview middleware (`vite.config.ts`), and the Vercel serverless
 * function (`api/home-state.ts`). It must never import browser DOM APIs, Vite
 * asset imports, JSON files, or any other module so it compiles cleanly in all
 * three environments.
 */

/** The single fixed key/row used for the couple's one shared living room save. */
export const SHARED_SAVE_KEY = 'our-home:shared-save:v1';
/** Fixed Supabase row id for the shared save. */
export const SHARED_SAVE_ROW_ID = 'our-home';

export interface ChoiceSet {
  readonly defaultId: string;
  readonly optionIds: readonly string[];
}

/** Valid option ids for every furniture and backdrop decor slot (visual data lives in `layout.ts`). */
export const SLOT_CHOICES = {
  sofa: { defaultId: 'teal', optionIds: ['teal', 'terracotta', 'sage', 'oat'] },
  rug: { defaultId: 'terracotta', optionIds: ['terracotta', 'sage', 'plum', 'tassel'] },
  'coffee-table': { defaultId: 'oak', optionIds: ['oak', 'teal', 'walnut'] },
  'reading-nook': {
    defaultId: 'window-bench',
    optionIds: ['window-bench', 'reading-chair', 'floor-daybed', 'rattan-nook'],
  },
  tv: { defaultId: 'wood-console', optionIds: ['wood-console', 'retro-tv', 'teal-media'] },
  bookshelf: { defaultId: 'oak', optionIds: ['oak', 'sage', 'walnut'] },
  cabinet: { defaultId: 'apothecary', optionIds: ['apothecary', 'sideboard', 'trellis'] },
  armchair: { defaultId: 'wingback', optionIds: ['wingback', 'rocking', 'tub'] },
  'side-table': { defaultId: 'oak-end', optionIds: ['oak-end', 'record-stand', 'candle-table'] },
  lamp: { defaultId: 'globe', optionIds: ['globe', 'reading', 'lantern'] },
  trolley: { defaultId: 'tea-trolley', optionIds: ['tea-trolley', 'blanket-basket', 'herb-cart'] },
  tree: { defaultId: 'calamondin', optionIds: ['calamondin', 'monstera', 'herb-bed'] },
  cushion: { defaultId: 'pouf', optionIds: ['pouf', 'pet-basket', 'stool', 'ottoman'] },
  'accent-rug': { defaultId: 'hearth-mat', optionIds: ['hearth-mat', 'fleece', 'botanical'] },
  'hanging-decor': {
    defaultId: 'terracotta-plant',
    optionIds: ['terracotta-plant', 'ivy-basket', 'lantern', 'dried-herbs'],
  },
  garland: { defaultId: 'vine', optionIds: ['vine', 'lights', 'bunting', 'flowers'] },
  pinboard: { defaultId: 'pinboard', optionIds: ['pinboard', 'painting', 'shelf', 'tapestry'] },
  clock: { defaultId: 'clock', optionIds: ['clock', 'mirror', 'macrame', 'gallery'] },
} as const satisfies Record<string, ChoiceSet>;

export type SlotId = keyof typeof SLOT_CHOICES;
export const SLOT_IDS = Object.keys(SLOT_CHOICES) as SlotId[];

/** Valid placement spot ids for movable furniture and backdrop decor slots (positions live in `layout.ts`). */
export const SLOT_PLACEMENTS = {
  tv: { defaultId: 'mid-left', optionIds: ['left-wall', 'mid-left', 'right-alcove'] },
  bookshelf: { defaultId: 'right-alcove', optionIds: ['left-wall', 'mid-left', 'right-alcove'] },
  cabinet: { defaultId: 'left-wall', optionIds: ['left-wall', 'mid-left', 'right-alcove'] },
  'side-table': { defaultId: 'sofa-left', optionIds: ['sofa-left', 'sofa-right', 'by-nook'] },
  lamp: { defaultId: 'sofa-right', optionIds: ['sofa-left', 'sofa-right', 'by-nook'] },
  armchair: { defaultId: 'door-side', optionIds: ['door-side', 'front-left', 'fireside-front'] },
  cushion: { defaultId: 'front-left', optionIds: ['door-side', 'front-left', 'fireside-front'] },
  trolley: { defaultId: 'fireside-left', optionIds: ['fireside-left', 'right-of-rug'] },
  tree: { defaultId: 'door-corner', optionIds: ['door-corner', 'fireside-left', 'right-of-rug'] },
  'accent-rug': { defaultId: 'hearth', optionIds: ['hearth', 'nook', 'garden-door'] },
  'hanging-decor': { defaultId: 'beam-door', optionIds: ['beam-door', 'beam-mid', 'beam-window'] },
  garland: { defaultId: 'center-beam', optionIds: ['left-beam', 'center-beam', 'window-beam'] },
  pinboard: { defaultId: 'wall-left', optionIds: ['wall-left', 'wall-center', 'wall-right'] },
  clock: { defaultId: 'wall-center', optionIds: ['wall-left', 'wall-center', 'wall-right'] },
} as const satisfies Partial<Record<SlotId, ChoiceSet>>;

export type MovableSlotId = keyof typeof SLOT_PLACEMENTS;
export const MOVABLE_SLOT_IDS = Object.keys(SLOT_PLACEMENTS) as MovableSlotId[];
export type PlacementMap = Record<MovableSlotId, string>;

/**
 * Furniture/decor slots that share a set of room spots: at most one slot in a group
 * may occupy any spot at a time, so moving onto a peer's spot cleanly swaps or shifts it.
 */
export const PLACEMENT_GROUPS: readonly (readonly MovableSlotId[])[] = [
  ['tv', 'bookshelf', 'cabinet'],
  ['side-table', 'lamp'],
  ['armchair', 'cushion'],
  ['tree', 'trolley'],
  ['pinboard', 'clock'],
];

/** Valid pet companion ids (visual data lives in `pet.ts`). */
export const PET_CHOICES = {
  defaultId: 'hedgehog',
  optionIds: ['hedgehog', 'tortoise', 'frog'],
} as const satisfies ChoiceSet;
export type PetId = (typeof PET_CHOICES.optionIds)[number];

/** Valid outfit ids per resident (visual data lives in `characters.ts`). */
export const OUTFIT_CHOICES = {
  her: { defaultId: 'dress', optionIds: ['dress', 'badminton'] },
  him: { defaultId: 'casual', optionIds: ['casual'] },
} as const satisfies Record<string, ChoiceSet>;
export type ResidentId = keyof typeof OUTFIT_CHOICES;
export type OutfitChoices = Record<ResidentId, string>;

export type SlotSelectionMap = Record<SlotId, string>;

export interface SharedHomeState {
  /** Selected option id for each of the 18 furniture/decor slots. */
  slots: SlotSelectionMap;
  /** Selected placement spot id for each of the 14 movable slots. */
  placements: PlacementMap;
  /** Selected wandering pet companion. */
  pet: string;
  /** Selected outfit per resident. */
  outfits: OutfitChoices;
  /** Whether the room lamp is on. */
  lampOn: boolean;
  /** Whether the living room TV screen is on. */
  tvOn: boolean;
  /** Monotonically increasing write counter (authoritative on the server). */
  revision: number;
  /** ISO timestamp of the last write. */
  updatedAt: string;
}

export interface SharedHomePatch {
  slots?: Partial<Record<string, string>>;
  placements?: Partial<Record<string, string>>;
  pet?: string;
  outfits?: Partial<OutfitChoices>;
  lampOn?: boolean;
  tvOn?: boolean;
}

/** `updatedAt` used for a room that has never been written. */
export const NEVER_UPDATED_AT = new Date(0).toISOString();

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isChoice = (set: ChoiceSet, v: unknown): v is string =>
  typeof v === 'string' && set.optionIds.includes(v);

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

export function isMovableSlotId(id: string): id is MovableSlotId {
  return hasOwn(SLOT_PLACEMENTS, id);
}

export function placementGroupOf(slotId: MovableSlotId): readonly MovableSlotId[] | null {
  return PLACEMENT_GROUPS.find((g) => g.includes(slotId)) ?? null;
}

/** Returns whichever group peer currently occupies `spotId` for `slotId`, or null if free. */
export function occupantAtSpot(
  placements: PlacementMap,
  slotId: MovableSlotId,
  spotId: string,
): MovableSlotId | null {
  const group = placementGroupOf(slotId);
  if (!group) return null;
  for (const peer of group) {
    if (peer !== slotId && placements[peer] === spotId) return peer;
  }
  return null;
}

/**
 * Computes the placement patch to move `slotId` to `spotId`:
 * - returns `{}` if invalid or already there,
 * - swaps cleanly with any group peer currently at `spotId` when `slotId`'s old spot fits that peer,
 * - or shifts that peer to the first open valid spot in its group.
 */
export function resolvePlacementMove(
  current: PlacementMap,
  slotId: SlotId,
  spotId: string,
): Partial<Record<MovableSlotId, string>> {
  if (!isMovableSlotId(slotId)) return {};
  if (!isChoice(SLOT_PLACEMENTS[slotId], spotId)) return {};
  const fromSpot = current[slotId];
  if (fromSpot === spotId) return {};

  const delta: Partial<Record<MovableSlotId, string>> = { [slotId]: spotId };
  const occupant = occupantAtSpot(current, slotId, spotId);
  if (!occupant) return delta;

  const peerChoices = SLOT_PLACEMENTS[occupant];
  if (isChoice(peerChoices, fromSpot)) {
    delta[occupant] = fromSpot;
    return delta;
  }

  const group = placementGroupOf(slotId) ?? [];
  const taken = new Set<string>([spotId]);
  for (const peer of group) {
    if (peer !== slotId && peer !== occupant) taken.add(current[peer]);
  }
  const fallback =
    peerChoices.optionIds.find((id) => !taken.has(id)) ??
    peerChoices.optionIds.find((id) => id !== spotId);
  if (fallback) delta[occupant] = fallback;
  return delta;
}

/** Guarantees no two peers in the same placement group ever occupy the same spot. */
export function reconcilePlacements(
  placements: PlacementMap,
  preferredIds: readonly MovableSlotId[] = [],
): PlacementMap {
  const next: PlacementMap = { ...placements };
  for (const group of PLACEMENT_GROUPS) {
    const ordered = [
      ...preferredIds.filter((id) => group.includes(id)),
      ...group.filter((id) => !preferredIds.includes(id)),
    ];
    const used = new Set<string>();
    const unplaced: MovableSlotId[] = [];
    for (const id of ordered) {
      const spot = next[id];
      if (!used.has(spot) && isChoice(SLOT_PLACEMENTS[id], spot)) {
        used.add(spot);
      } else {
        unplaced.push(id);
      }
    }
    for (const id of unplaced) {
      const choices = SLOT_PLACEMENTS[id].optionIds;
      const free = choices.find((spot) => !used.has(spot)) ?? choices[0];
      next[id] = free;
      used.add(free);
    }
  }
  return next;
}

export function defaultSlotSelections(): SlotSelectionMap {
  const slots = {} as SlotSelectionMap;
  for (const id of SLOT_IDS) slots[id] = SLOT_CHOICES[id].defaultId;
  return slots;
}

export function defaultSlotPlacements(): PlacementMap {
  const placements = {} as PlacementMap;
  for (const id of MOVABLE_SLOT_IDS) placements[id] = SLOT_PLACEMENTS[id].defaultId;
  return placements;
}

export function defaultOutfitChoices(): OutfitChoices {
  return { her: OUTFIT_CHOICES.her.defaultId, him: OUTFIT_CHOICES.him.defaultId };
}

export function createDefaultHomeState(): SharedHomeState {
  return {
    slots: defaultSlotSelections(),
    placements: defaultSlotPlacements(),
    pet: PET_CHOICES.defaultId,
    outfits: defaultOutfitChoices(),
    lampOn: true,
    tvOn: true,
    revision: 0,
    updatedAt: NEVER_UPDATED_AT,
  };
}

function sanitizeRevision(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
}

function sanitizeTimestamp(v: unknown): string {
  if (typeof v !== 'string') return NEVER_UPDATED_AT;
  const t = Date.parse(v);
  return Number.isFinite(t) ? new Date(t).toISOString() : NEVER_UPDATED_AT;
}

/** Coerces any (possibly malformed or outdated) payload into a valid shared home state. */
export function sanitizeSharedHomeState(input: unknown): SharedHomeState {
  const state = createDefaultHomeState();
  if (!isRecord(input)) return state;

  if (isRecord(input.slots)) {
    for (const id of SLOT_IDS) {
      const v = input.slots[id];
      if (isChoice(SLOT_CHOICES[id], v)) state.slots[id] = v;
    }
  }
  const preferred: MovableSlotId[] = [];
  if (isRecord(input.placements)) {
    for (const id of MOVABLE_SLOT_IDS) {
      const v = input.placements[id];
      if (isChoice(SLOT_PLACEMENTS[id], v)) {
        state.placements[id] = v;
        preferred.push(id);
      }
    }
  }
  state.placements = reconcilePlacements(state.placements, preferred);
  if (isChoice(PET_CHOICES, input.pet)) state.pet = input.pet;
  if (isRecord(input.outfits)) {
    for (const id of Object.keys(OUTFIT_CHOICES) as ResidentId[]) {
      const v = input.outfits[id];
      if (isChoice(OUTFIT_CHOICES[id], v)) state.outfits[id] = v;
    }
  }
  if (typeof input.lampOn === 'boolean') state.lampOn = input.lampOn;
  if (typeof input.tvOn === 'boolean') state.tvOn = input.tvOn;
  state.revision = sanitizeRevision(input.revision);
  state.updatedAt = sanitizeTimestamp(input.updatedAt);
  return state;
}

/** Keeps only the valid, known fields of a patch. Returns an empty object for garbage input. */
export function sanitizeSharedHomePatch(input: unknown): SharedHomePatch {
  const patch: SharedHomePatch = {};
  if (!isRecord(input)) return patch;

  if (isRecord(input.slots)) {
    const slots: Partial<Record<string, string>> = {};
    for (const id of SLOT_IDS) {
      if (!hasOwn(input.slots, id)) continue;
      const v = input.slots[id];
      if (isChoice(SLOT_CHOICES[id], v)) slots[id] = v;
    }
    if (Object.keys(slots).length > 0) patch.slots = slots;
  }
  if (isRecord(input.placements)) {
    const placements: Partial<Record<string, string>> = {};
    for (const id of MOVABLE_SLOT_IDS) {
      if (!hasOwn(input.placements, id)) continue;
      const v = input.placements[id];
      if (isChoice(SLOT_PLACEMENTS[id], v)) placements[id] = v;
    }
    if (Object.keys(placements).length > 0) patch.placements = placements;
  }
  if (isChoice(PET_CHOICES, input.pet)) patch.pet = input.pet;
  if (isRecord(input.outfits)) {
    const outfits: Partial<OutfitChoices> = {};
    for (const id of Object.keys(OUTFIT_CHOICES) as ResidentId[]) {
      if (!hasOwn(input.outfits, id)) continue;
      const v = input.outfits[id];
      if (isChoice(OUTFIT_CHOICES[id], v)) outfits[id] = v;
    }
    if (Object.keys(outfits).length > 0) patch.outfits = outfits;
  }
  if (typeof input.lampOn === 'boolean') patch.lampOn = input.lampOn;
  if (typeof input.tvOn === 'boolean') patch.tvOn = input.tvOn;
  return patch;
}

export function isEmptyPatch(patch: SharedHomePatch): boolean {
  return (
    !patch.slots &&
    !patch.placements &&
    !patch.outfits &&
    patch.pet === undefined &&
    patch.lampOn === undefined &&
    patch.tvOn === undefined
  );
}

/**
 * Field-level merge: only the slots / placements / outfits / flags present in the patch are
 * changed, so concurrent edits to different fields never overwrite each other.
 * Bumps `revision` and stamps `updatedAt`.
 */
export function applySharedHomePatch(
  current: SharedHomeState,
  patch: SharedHomePatch,
  now: Date = new Date(),
): SharedHomeState {
  const base = sanitizeSharedHomeState(current);
  const clean = sanitizeSharedHomePatch(patch);
  const next: SharedHomeState = {
    ...base,
    slots: { ...base.slots },
    placements: { ...base.placements },
    outfits: { ...base.outfits },
    revision: base.revision + 1,
    updatedAt: now.toISOString(),
  };
  if (clean.slots) {
    for (const id of SLOT_IDS) {
      const v = clean.slots[id];
      if (v !== undefined) next.slots[id] = v;
    }
  }
  if (clean.placements) {
    const preferred: MovableSlotId[] = [];
    for (const id of MOVABLE_SLOT_IDS) {
      const v = clean.placements[id];
      if (v !== undefined) {
        next.placements[id] = v;
        preferred.push(id);
      }
    }
    next.placements = reconcilePlacements(next.placements, preferred);
  }
  if (clean.pet !== undefined) next.pet = clean.pet;
  if (clean.outfits) {
    if (clean.outfits.her !== undefined) next.outfits.her = clean.outfits.her;
    if (clean.outfits.him !== undefined) next.outfits.him = clean.outfits.him;
  }
  if (clean.lampOn !== undefined) next.lampOn = clean.lampOn;
  if (clean.tvOn !== undefined) next.tvOn = clean.tvOn;
  return next;
}

/** True when both states show the same room (ignores revision and timestamp). */
export function isSameHomeChoices(a: SharedHomeState, b: SharedHomeState): boolean {
  if (a.pet !== b.pet || a.lampOn !== b.lampOn || a.tvOn !== b.tvOn) return false;
  if (a.outfits.her !== b.outfits.her || a.outfits.him !== b.outfits.him) return false;
  if (!SLOT_IDS.every((id) => a.slots[id] === b.slots[id])) return false;
  return MOVABLE_SLOT_IDS.every((id) => a.placements[id] === b.placements[id]);
}

/** A patch that turns the default room into `state` (used to seed an empty cloud save). */
export function patchFromState(state: SharedHomeState): SharedHomePatch {
  return {
    slots: { ...state.slots },
    placements: { ...state.placements },
    pet: state.pet,
    outfits: { ...state.outfits },
    lampOn: state.lampOn,
    tvOn: state.tvOn,
  };
}

export type HomeStateRequest = { kind: 'patch'; patch: SharedHomePatch } | { kind: 'invalid' };

/** Parses a `PUT /api/home-state` body: `{ patch }`. */
export function parseHomeStateRequest(body: unknown): HomeStateRequest {
  if (!isRecord(body)) return { kind: 'invalid' };
  if (isRecord(body.patch)) return { kind: 'patch', patch: sanitizeSharedHomePatch(body.patch) };
  return { kind: 'invalid' };
}

/** Applies a parsed request to the current state. */
export function applyHomeStateRequest(
  current: SharedHomeState,
  request: Exclude<HomeStateRequest, { kind: 'invalid' }>,
  now: Date = new Date(),
): SharedHomeState {
  return applySharedHomePatch(current, request.patch, now);
}

export const NO_STORE_HEADERS: Readonly<Record<string, string>> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};
