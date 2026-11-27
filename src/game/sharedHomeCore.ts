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

/** Valid option ids for every fixed furniture slot (visual data lives in `layout.ts`). */
export const SLOT_CHOICES = {
  sofa: { defaultId: 'teal', optionIds: ['teal', 'terracotta', 'sage', 'oat'] },
  rug: { defaultId: 'terracotta', optionIds: ['terracotta', 'sage', 'plum', 'tassel'] },
  'coffee-table': { defaultId: 'oak', optionIds: ['oak', 'teal', 'walnut'] },
  bookshelf: { defaultId: 'oak', optionIds: ['oak', 'sage', 'window-seat'] },
  lamp: { defaultId: 'globe', optionIds: ['globe', 'reading', 'lantern'] },
  cabinet: { defaultId: 'apothecary', optionIds: ['apothecary', 'sideboard', 'trellis'] },
  trolley: { defaultId: 'tea-trolley', optionIds: ['tea-trolley', 'blanket-basket', 'herb-cart'] },
  tree: { defaultId: 'calamondin', optionIds: ['calamondin', 'monstera', 'herb-bed'] },
  cushion: { defaultId: 'pouf', optionIds: ['pouf', 'pet-basket', 'stool'] },
  pinboard: { defaultId: 'pinboard', optionIds: ['pinboard', 'painting', 'shelf'] },
  clock: { defaultId: 'clock', optionIds: ['clock', 'mirror', 'macrame'] },
} as const satisfies Record<string, ChoiceSet>;

export type SlotId = keyof typeof SLOT_CHOICES;
export const SLOT_IDS = Object.keys(SLOT_CHOICES) as SlotId[];

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
  /** Selected option id for each of the 11 fixed furniture slots. */
  slots: SlotSelectionMap;
  /** Selected wandering pet companion. */
  pet: string;
  /** Selected outfit per resident. */
  outfits: OutfitChoices;
  /** Whether the room lamp is on. */
  lampOn: boolean;
  /** Monotonically increasing write counter (authoritative on the server). */
  revision: number;
  /** ISO timestamp of the last write. */
  updatedAt: string;
}

export interface SharedHomePatch {
  slots?: Partial<Record<string, string>>;
  pet?: string;
  outfits?: Partial<OutfitChoices>;
  lampOn?: boolean;
}

/** `updatedAt` used for a room that has never been written. */
export const NEVER_UPDATED_AT = new Date(0).toISOString();

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isChoice = (set: ChoiceSet, v: unknown): v is string =>
  typeof v === 'string' && set.optionIds.includes(v);

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

export function defaultSlotSelections(): SlotSelectionMap {
  const slots = {} as SlotSelectionMap;
  for (const id of SLOT_IDS) slots[id] = SLOT_CHOICES[id].defaultId;
  return slots;
}

export function defaultOutfitChoices(): OutfitChoices {
  return { her: OUTFIT_CHOICES.her.defaultId, him: OUTFIT_CHOICES.him.defaultId };
}

export function createDefaultHomeState(): SharedHomeState {
  return {
    slots: defaultSlotSelections(),
    pet: PET_CHOICES.defaultId,
    outfits: defaultOutfitChoices(),
    lampOn: true,
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
  if (isChoice(PET_CHOICES, input.pet)) state.pet = input.pet;
  if (isRecord(input.outfits)) {
    for (const id of Object.keys(OUTFIT_CHOICES) as ResidentId[]) {
      const v = input.outfits[id];
      if (isChoice(OUTFIT_CHOICES[id], v)) state.outfits[id] = v;
    }
  }
  if (typeof input.lampOn === 'boolean') state.lampOn = input.lampOn;
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
  return patch;
}

export function isEmptyPatch(patch: SharedHomePatch): boolean {
  return !patch.slots && !patch.outfits && patch.pet === undefined && patch.lampOn === undefined;
}

/**
 * Field-level merge: only the slots / outfits / flags present in the patch are
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
  if (clean.pet !== undefined) next.pet = clean.pet;
  if (clean.outfits) {
    if (clean.outfits.her !== undefined) next.outfits.her = clean.outfits.her;
    if (clean.outfits.him !== undefined) next.outfits.him = clean.outfits.him;
  }
  if (clean.lampOn !== undefined) next.lampOn = clean.lampOn;
  return next;
}

/** Restores every choice to its default while keeping the revision monotonic. */
export function createResetHomeState(current: SharedHomeState, now: Date = new Date()): SharedHomeState {
  return {
    ...createDefaultHomeState(),
    revision: sanitizeRevision(current.revision) + 1,
    updatedAt: now.toISOString(),
  };
}

/** True when both states show the same room (ignores revision and timestamp). */
export function isSameHomeChoices(a: SharedHomeState, b: SharedHomeState): boolean {
  if (a.pet !== b.pet || a.lampOn !== b.lampOn) return false;
  if (a.outfits.her !== b.outfits.her || a.outfits.him !== b.outfits.him) return false;
  return SLOT_IDS.every((id) => a.slots[id] === b.slots[id]);
}

/** A patch that turns the default room into `state` (used to seed an empty cloud save). */
export function patchFromState(state: SharedHomeState): SharedHomePatch {
  return {
    slots: { ...state.slots },
    pet: state.pet,
    outfits: { ...state.outfits },
    lampOn: state.lampOn,
  };
}

export type HomeStateRequest =
  { kind: 'patch'; patch: SharedHomePatch } | { kind: 'reset' } | { kind: 'invalid' };

/** Parses a `PUT /api/home-state` body: `{ patch }` or `{ reset: true }`. */
export function parseHomeStateRequest(body: unknown): HomeStateRequest {
  if (!isRecord(body)) return { kind: 'invalid' };
  if (body.reset === true) return { kind: 'reset' };
  if (isRecord(body.patch)) return { kind: 'patch', patch: sanitizeSharedHomePatch(body.patch) };
  return { kind: 'invalid' };
}

/** Applies a parsed request to the current state. */
export function applyHomeStateRequest(
  current: SharedHomeState,
  request: Exclude<HomeStateRequest, { kind: 'invalid' }>,
  now: Date = new Date(),
): SharedHomeState {
  return request.kind === 'reset'
    ? createResetHomeState(current, now)
    : applySharedHomePatch(current, request.patch, now);
}

export const NO_STORE_HEADERS: Readonly<Record<string, string>> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};
