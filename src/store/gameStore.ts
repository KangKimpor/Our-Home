import { create } from 'zustand';
import { produce } from 'immer';
import { BALANCE } from '../config/balance';
import { now } from '../config/time';
import { ITEMS_BY_ID, VARIANT_GROUPS } from '../data/items';
import { ROOMS, ROOM_ORDER, nextRoom } from '../data/rooms';
import { RECIPES_BY_ID } from '../data/recipes';
import { CROPS_BY_ID, PRODUCERS } from '../data/farm';
import { VISITORS_BY_ID } from '../data/visitors';
import { PET_SPECIES_BY_ID } from '../data/pets';
import { EVENTS, eventActive } from '../data/events';
import type {
  GameState,
  PetState,
  PlacedItem,
  RoomId,
  SaveEnvelope,
  Settings,
  StationId,
  CharacterLook,
} from '../game/types';
import { availableCount, checkPlacement, findFreeSpot, hostAttachments, itemSize, hostTopY } from '../game/placement';
import { simulateOffline, simulateTick } from '../game/systems/simulate';
import { applyMomentTriggers, awardMoment } from '../game/systems/moments';
import { bumpEvents } from '../game/systems/events';
import { createRng, seededRng, uid } from '../game/rng';
import { createInitialState } from '../game/initialState';
import { getDeviceId, loadBestSave, writeSnapshot } from '../save/storage';
import { requestSnapshot } from '../save/autosave';
import { parseBackup } from '../save/exportImport';
import { playSfx } from '../audio/engine';

export type Overlay =
  | null
  | 'shop'
  | 'inventory'
  | 'visitors'
  | 'moments'
  | 'moment'
  | 'recipes'
  | 'settings'
  | 'map'
  | 'feed'
  | 'pet'
  | 'item'
  | 'event'
  | 'farm'
  | 'conflict'
  | 'import'
  | 'characters'
  | 'about'
  | 'privacy';

export interface Toast {
  id: string;
  key: string;
  params?: Record<string, string | number>;
  kind: 'info' | 'success' | 'warn';
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface GameStore {
  state: GameState;
  loaded: boolean;
  hadSave: boolean;
  screen: 'title' | 'game';
  roomId: RoomId;
  overlay: Overlay;
  overlayArg?: string;
  editMode: boolean;
  selectedUid?: string;
  placingItemId?: string;
  shopTab: RoomId | 'new';
  inventoryTab: 'rooms' | 'foods' | 'ingredients';
  toast: Toast | null;
  momentFlash: string | null;
  saveStatus: SaveStatus;
  undoDepth: number;
  redoDepth: number;
  deviceId: string;
  saveRevision: number;
  conflictSaves: { local: SaveEnvelope; cloud: SaveEnvelope } | null;
  boot: () => Promise<void>;
  setScreen: (screen: 'title' | 'game') => void;
  setRoom: (roomId: RoomId) => void;
  stepRoom: (direction: 1 | -1) => void;
  openOverlay: (overlay: Overlay, arg?: string) => void;
  closeOverlay: () => void;
  setShopTab: (tab: RoomId | 'new') => void;
  setInventoryTab: (tab: 'rooms' | 'foods' | 'ingredients') => void;
  setEditMode: (on: boolean) => void;
  selectUid: (uid?: string) => void;
  beginPlacing: (itemId: string) => void;
  cancelPlacing: () => void;
  notify: (key: string, kind?: Toast['kind'], params?: Record<string, string | number>) => void;
  dismissToast: () => void;
  setMomentFlash: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setSaveRevision: (revision: number) => void;
  setConflictSaves: (conflict: { local: SaveEnvelope; cloud: SaveEnvelope } | null) => void;
  resolveConflict: (choice: 'local' | 'cloud') => Promise<void>;
  tick: () => void;
  collectBubble: (bubbleId: string) => void;
  petPet: (petId: string) => void;
  feedPet: (petId: string, foodId: string) => void;
  feedVisitor: (visitorInstanceId: string, foodId: string) => void;
  buyItem: (itemId: string, autoPlace: boolean) => void;
  sellItem: (itemId: string, placedUid?: string) => number;
  placeItem: (itemId: string, x: number, y: number, roomId?: RoomId) => boolean;
  moveItem: (uid: string, x: number, y: number) => boolean;
  removeItem: (uid: string) => void;
  swapVariant: (uid: string, itemId: string) => void;
  toggleFlip: (uid: string) => void;
  undo: () => void;
  redo: () => void;
  unlockRoom: (roomId: RoomId) => void;
  unlockPlot: (plotId: string) => void;
  plantCrop: (plotId: string, cropId: string) => void;
  harvestPlot: (plotId: string) => void;
  collectProducer: (producerId: string) => void;
  startCooking: (station: StationId, recipeId: string) => void;
  collectFood: (station: StationId) => void;
  claimEvent: (eventId: string) => void;
  adoptPet: (species: string, coat: string, name: string) => void;
  renamePet: (petId: string, name: string) => void;
  sendPetToRoom: (petId: string, roomId: RoomId) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  updateCharacter: (index: 0 | 1, look: Partial<CharacterLook>) => void;
  importSave: (text: string) => void;
  resetGame: () => Promise<void>;
  exportSnapshot: () => Promise<void>;
  evaluateMoments: () => void;
}

let undoStack: PlacedItem[][] = [];
let redoStack: PlacedItem[][] = [];

function clonePlaced(placed: PlacedItem[]): PlacedItem[] {
  return placed.map((item) => ({ ...item }));
}

function pushUndo(state: GameState): void {
  undoStack.push(clonePlaced(state.placed));
  if (undoStack.length > 20) undoStack.shift();
  redoStack = [];
}

export const useGameStore = create<GameStore>((set, get) => {
  function commit(next: GameState, flashMoments = true): void {
    const result = applyMomentTriggers(next, now());
    const flash = flashMoments && result.newMoments.length > 0 ? result.newMoments[result.newMoments.length - 1] : null;
    set({
      state: result.state,
      undoDepth: undoStack.length,
      redoDepth: redoStack.length,
      ...(flash ? { momentFlash: flash } : {}),
    });
    if (flash) {
      playSfx('camera');
      set({ toast: { id: uid('toast'), key: 'moments.new', kind: 'info' } });
    }
  }

  function mutate(fn: (draft: GameState) => void, flashMoments = true): void {
    commit(produce(get().state, fn), flashMoments);
  }

  function roomOfItem(itemId: string): RoomId {
    return ITEMS_BY_ID[itemId]?.room ?? 'living';
  }

  return {
    state: createInitialState(now()),
    loaded: false,
    hadSave: false,
    screen: 'title',
    roomId: 'living',
    overlay: null,
    overlayArg: undefined,
    editMode: false,
    selectedUid: undefined,
    placingItemId: undefined,
    shopTab: 'living',
    inventoryTab: 'rooms',
    toast: null,
    momentFlash: null,
    saveStatus: 'idle',
    undoDepth: 0,
    redoDepth: 0,
    deviceId: '',
    saveRevision: 1,
    conflictSaves: null,

    boot: async () => {
      if (get().loaded) return;
      const at = now();
      const deviceId = await getDeviceId();
      const result = await loadBestSave();
      let state: GameState;
      let revision = 1;
      if (result.envelope) {
        state = result.envelope.state;
        revision = Math.max(1, result.envelope.revision);
        if (at - state.lastSeenAt > 60_000) {
          state = simulateOffline(state, at, seededRng(`${deviceId}:${state.lastSeenAt}`)).state;
        }
      } else {
        state = createInitialState(at);
      }
      set({
        state,
        loaded: true,
        hadSave: !!result.envelope,
        deviceId,
        saveRevision: revision,
        roomId: 'living',
        screen: 'title',
      });
      if (result.recovered) {
        get().notify('settings.recovered', 'warn');
      }
    },

    setScreen: (screen) => {
      set({ screen });
      if (screen === 'game') playSfx('page');
    },
    setRoom: (roomId) => {
      if (!get().state.rooms[roomId]?.unlocked) {
        get().notify('map.lockedToast', 'warn');
        return;
      }
      set({ roomId, editMode: false, selectedUid: undefined, placingItemId: undefined });
    },
    stepRoom: (direction) => {
      const current = get().roomId;
      let candidate = nextRoom(current, direction);
      for (let i = 0; i < ROOM_ORDER.length; i++) {
        if (get().state.rooms[candidate]?.unlocked) break;
        candidate = nextRoom(candidate, direction);
      }
      get().setRoom(candidate);
    },
    openOverlay: (overlay, arg) => {
      playSfx('page');
      set({ overlay, overlayArg: arg, editMode: false, selectedUid: undefined, placingItemId: undefined });
    },
    closeOverlay: () => set({ overlay: null, overlayArg: undefined }),
    setShopTab: (shopTab) => set({ shopTab }),
    setInventoryTab: (inventoryTab) => set({ inventoryTab }),
    setEditMode: (editMode) => {
      if (editMode) playSfx('page');
      set({ editMode, selectedUid: undefined, placingItemId: undefined });
    },
    selectUid: (uidValue) => set({ selectedUid: uidValue }),
    beginPlacing: (itemId) => {
      playSfx('tap');
      set({ placingItemId: itemId, overlay: null, overlayArg: undefined, editMode: false, selectedUid: undefined });
    },
    cancelPlacing: () => set({ placingItemId: undefined }),
    notify: (key, kind = 'info', params) =>
      set({ toast: { id: uid('toast'), key, kind, params } }),
    dismissToast: () => set({ toast: null }),
    setMomentFlash: (momentFlash) => set({ momentFlash }),
    setSaveStatus: (saveStatus) => set({ saveStatus }),
    setSaveRevision: (saveRevision) => set({ saveRevision }),
    setConflictSaves: (conflictSaves) =>
      set({ conflictSaves, overlay: conflictSaves ? 'conflict' : get().overlay === 'conflict' ? null : get().overlay }),
    resolveConflict: async (choice) => {
      const conflict = get().conflictSaves;
      if (!conflict) return;
      const chosen = choice === 'cloud' ? conflict.cloud : conflict.local;
      const unchosen = choice === 'cloud' ? conflict.local : conflict.cloud;
      await writeSnapshot(unchosen.state, now());
      set({
        state: chosen.state,
        saveRevision: Math.max(conflict.local.revision, conflict.cloud.revision) + 1,
        conflictSaves: null,
        overlay: null,
      });
      requestSnapshot();
      get().notify('settings.imported', 'success');
    },

    tick: () => {
      const at = now();
      const state = get().state;
      if (at - state.lastSeenAt < 300) return;
      const next = simulateTick(state, at, createRng(Math.floor(at / 1000) + state.hearts));
      commit(next, false);
    },

    collectBubble: (bubbleId) => {
      const state = get().state;
      const bubble = state.bubbles.find((b) => b.id === bubbleId);
      if (!bubble) return;
      pushUndo(state);
      undoStack = [];
      const at = now();
      let next = produce(state, (draft) => {
        draft.bubbles = draft.bubbles.filter((b) => b.id !== bubbleId);
        draft.hearts += bubble.value;
        draft.stats.heartsEarned += bubble.value;
        draft.stats.taps += 1;
        if (bubble.visitorId) {
          const active = draft.visitors.active.find((v) => v.id === bubble.visitorId);
          if (active) {
            const progress = draft.visitors.discovered[active.visitorId];
            if (progress) progress.friendship = Math.min(10, progress.friendship + 0.5);
          }
        }
        bumpEvents(draft, 'collect', at, 1);
      });
      if (bubble.sourceType === 'critter' && bubble.sourceId === 'owl') {
        next = awardMoment(next, 'windowOwl', at);
      }
      set({
        state: next,
        redoDepth: 0,
        undoDepth: 0,
      });
      playSfx(bubble.sourceType === 'visitor' ? 'chirp' : 'collect');
      get().evaluateMoments();
    },

    petPet: (petId) => {
      const state = get().state;
      const pet = state.pets.find((p) => p.id === petId);
      if (!pet) return;
      const at = now();
      if (pet.lastPettedAt && at - pet.lastPettedAt < BALANCE.petCooldownMs) return;
      playSfx(pet.species === 'dog' ? 'bark' : pet.species === 'bird' ? 'chirp' : 'purr');
      mutate((draft) => {
        const target = draft.pets.find((p) => p.id === petId);
        if (!target) return;
        target.happiness = Math.min(100, target.happiness + BALANCE.petHappiness);
        target.lastPettedAt = at;
        draft.stats.taps += 1;
      });
    },

    feedPet: (petId, foodId) => {
      const state = get().state;
      const pet = state.pets.find((p) => p.id === petId);
      if (!pet) return;
      const foodCount = state.pantry.foods[foodId] ?? 0;
      if (foodCount <= 0) {
        get().notify('feed.noFood', 'warn');
        playSfx('error');
        return;
      }
      const recipe = RECIPES_BY_ID[foodId];
      const bonus = pet.trait === 'foodie' ? 2 : 1;
      const at = now();
      playSfx('collect');
      mutate((draft) => {
        draft.pantry.foods[foodId] = Math.max(0, (draft.pantry.foods[foodId] ?? 0) - 1);
        if (draft.pantry.foods[foodId] === 0) delete draft.pantry.foods[foodId];
        const target = draft.pets.find((p) => p.id === petId);
        if (target) {
          target.happiness = Math.min(100, target.happiness + BALANCE.feedHappiness);
          target.lastFedAt = at;
        }
        draft.hearts += bonus;
        draft.stats.heartsEarned += bonus;
        draft.stats.taps += 1;
        bumpEvents(draft, 'collect', at, bonus);
        void recipe;
      });
      get().notify('feed.fed', 'success', { name: pet.name });
      set({ overlay: null });
    },

    feedVisitor: (visitorInstanceId, foodId) => {
      const state = get().state;
      const active = state.visitors.active.find((v) => v.id === visitorInstanceId);
      if (!active) return;
      if ((state.pantry.foods[foodId] ?? 0) <= 0) {
        get().notify('feed.noFood', 'warn');
        playSfx('error');
        return;
      }
      const recipe = RECIPES_BY_ID[foodId];
      const def = VISITORS_BY_ID[active.visitorId];
      const matched = def && recipe && def.favourite === recipe.category;
      const hearts = matched ? BALANCE.foodMatchMultiplier * 2 : 2;
      const at = now();
      playSfx('collect');
      mutate((draft) => {
        draft.pantry.foods[foodId] = Math.max(0, (draft.pantry.foods[foodId] ?? 0) - 1);
        if (draft.pantry.foods[foodId] === 0) delete draft.pantry.foods[foodId];
        const progress = draft.visitors.discovered[active.visitorId];
        if (progress) progress.friendship = Math.min(10, progress.friendship + 1);
        const live = draft.visitors.active.find((v) => v.id === visitorInstanceId);
        if (live) live.gift = true;
        draft.hearts += hearts;
        draft.stats.heartsEarned += hearts;
        bumpEvents(draft, 'visitors', at, 0);
      });
      get().notify(matched ? 'feed.visitorLoved' : 'feed.visitorFed', 'success', {
        name: def?.name ?? '',
      });
      set({ overlay: null });
    },

    buyItem: (itemId, autoPlace) => {
      const state = get().state;
      const item = ITEMS_BY_ID[itemId];
      if (!item) return;
      if (state.hearts < item.price) {
        get().notify('shop.insufficient', 'warn');
        playSfx('error');
        return;
      }
      const at = now();
      const desiredRoom = state.rooms[item.room]?.unlocked ? item.room : get().roomId;
      const spot = autoPlace ? findFreeSpot(state, desiredRoom, itemId) : null;
      pushUndo(state);
      let next = produce(state, (draft) => {
        draft.hearts -= item.price;
        draft.inventory[itemId] = (draft.inventory[itemId] ?? 0) + 1;
        draft.stats.bought += 1;
        if (spot) {
          draft.placed.push({
            uid: uid('placed'),
            itemId,
            roomId: desiredRoom,
            x: spot.x,
            y: spot.y,
            flip: false,
            ...(spot.hostUid ? { hostUid: spot.hostUid } : {}),
          });
        }
      });
      if (state.stats.bought === 0) next = awardMoment(next, 'firstBuy', at);
      playSfx('buy');
      set({ state: applyMomentTriggers(next, at).state, toast: { id: uid('toast'), key: spot ? 'shop.boughtPlaced' : 'shop.bought', kind: 'success', params: { name: item.name } } });
      get().evaluateMoments();
      void roomOfItem;
    },

    sellItem: (itemId, placedUid) => {
      const state = get().state;
      const item = ITEMS_BY_ID[itemId];
      const owned = state.inventory[itemId] ?? 0;
      if (!item || owned <= 0) return 0;
      void writeSnapshot(state, now());
      const refund = Math.floor(item.price * BALANCE.refundRate);
      const free = availableCount(state, itemId);
      const targetUid =
        placedUid ??
        (free <= 0
          ? state.placed.find((p) => p.itemId === itemId)?.uid
          : undefined);
      if (targetUid) pushUndo(state);
      mutate((draft) => {
        if (targetUid) {
          draft.placed = draft.placed.filter((p) => p.uid !== targetUid && p.hostUid !== targetUid);
        }
        const nextOwned = Math.max(0, (draft.inventory[itemId] ?? 0) - 1);
        if (nextOwned === 0) {
          delete draft.inventory[itemId];
        } else {
          draft.inventory[itemId] = nextOwned;
        }
        draft.hearts += refund;
        draft.stats.heartsEarned += refund;
      });
      playSfx('collect');
      set({ selectedUid: undefined });
      return refund;
    },

    placeItem: (itemId, x, y, roomId) => {
      const state = get().state;
      const targetRoom = roomId ?? get().roomId;
      if (availableCount(state, itemId) <= 0) return false;
      const check = checkPlacement(state, targetRoom, itemId, x, y);
      if (check.issue !== 'ok') {
        playSfx('error');
        get().notify(check.issue === 'blocked' ? 'edit.invalidBlocked' : check.issue === 'no-surface' ? 'edit.invalidSurface' : 'edit.invalid', 'warn');
        return false;
      }
      pushUndo(state);
      mutate((draft) => {
        draft.placed.push({
          uid: uid('placed'),
          itemId,
          roomId: targetRoom,
          x: check.x,
          y: check.y,
          flip: false,
          ...(check.hostUid ? { hostUid: check.hostUid } : {}),
        });
      });
      playSfx('place');
      set({ placingItemId: undefined });
      return true;
    },

    moveItem: (uidValue, x, y) => {
      const state = get().state;
      const existing = state.placed.find((p) => p.uid === uidValue);
      if (!existing) return false;
      const check = checkPlacement(state, existing.roomId, existing.itemId, x, y, uidValue);
      if (check.issue !== 'ok') {
        playSfx('error');
        get().notify(check.issue === 'blocked' ? 'edit.invalidBlocked' : check.issue === 'no-surface' ? 'edit.invalidSurface' : 'edit.invalid', 'warn');
        return false;
      }
      pushUndo(state);
      mutate((draft) => {
        const item = draft.placed.find((p) => p.uid === uidValue);
        if (!item) return;
        const dx = check.x - item.x;
        const dy = check.y - item.y;
        item.x = check.x;
        item.y = check.y;
        item.hostUid = check.hostUid;
        const attachments = hostAttachments({ placed: draft.placed } as GameState, uidValue);
        for (const child of attachments) {
          child.x += dx;
          child.y += dy;
        }
        if (check.hostUid) {
          const host = draft.placed.find((p) => p.uid === check.hostUid);
          if (host) item.y = hostTopY(host);
        }
      });
      playSfx('place');
      return true;
    },

    removeItem: (uidValue) => {
      const state = get().state;
      const existing = state.placed.find((p) => p.uid === uidValue);
      if (!existing) return;
      pushUndo(state);
      mutate((draft) => {
        draft.placed = draft.placed.filter((p) => p.uid !== uidValue && p.hostUid !== uidValue);
      });
      playSfx('place');
      set({ selectedUid: undefined, placingItemId: undefined });
      get().notify('inventory.removed', 'info');
    },

    swapVariant: (uidValue, itemId) => {
      const state = get().state;
      const existing = state.placed.find((p) => p.uid === uidValue);
      const item = ITEMS_BY_ID[itemId];
      if (!existing || !item) return;
      const old = ITEMS_BY_ID[existing.itemId];
      if (!old?.variantGroup || old.variantGroup !== item.variantGroup) return;
      if (availableCount(state, itemId) <= 0) {
        get().notify('shop.insufficientOwned', 'warn');
        return;
      }
      pushUndo(state);
      mutate((draft) => {
        const target = draft.placed.find((p) => p.uid === uidValue);
        if (!target) return;
        target.itemId = itemId;
        const size = itemSize(itemId);
        target.x = Math.min(1920 - size.w / 2 - 20, Math.max(size.w / 2 + 20, target.x));
        target.y = Math.min(884, target.y);
      });
      playSfx('place');
    },

    toggleFlip: (uidValue) => {
      const state = get().state;
      const existing = state.placed.find((p) => p.uid === uidValue);
      if (!existing) return;
      pushUndo(state);
      mutate((draft) => {
        const target = draft.placed.find((p) => p.uid === uidValue);
        if (target) target.flip = !target.flip;
      });
      playSfx('tap');
    },

    undo: () => {
      if (undoStack.length === 0) return;
      const current = clonePlaced(get().state.placed);
      const previous = undoStack.pop()!;
      redoStack.push(current);
      set((prev) => ({
        state: { ...prev.state, placed: previous },
        undoDepth: undoStack.length,
        redoDepth: redoStack.length,
        selectedUid: undefined,
      }));
      playSfx('page');
    },

    redo: () => {
      if (redoStack.length === 0) return;
      const current = clonePlaced(get().state.placed);
      const next = redoStack.pop()!;
      undoStack.push(current);
      set((prev) => ({
        state: { ...prev.state, placed: next },
        undoDepth: undoStack.length,
        redoDepth: redoStack.length,
        selectedUid: undefined,
      }));
      playSfx('page');
    },

    unlockRoom: (roomId) => {
      const state = get().state;
      const room = ROOMS[roomId];
      if (!room || state.rooms[roomId]?.unlocked) return;
      if (state.hearts < room.unlockCost) {
        get().notify('shop.insufficient', 'warn');
        playSfx('error');
        return;
      }
      playSfx('levelup');
      mutate((draft) => {
        draft.hearts -= room.unlockCost;
        draft.rooms[roomId].unlocked = true;
      });
      set({ roomId });
      get().notify('map.unlockedToast', 'success');
    },

    unlockPlot: (plotId) => {
      const state = get().state;
      const index = state.farm.plots.findIndex((p) => p.id === plotId);
      if (index < 0) return;
      const plot = state.farm.plots[index];
      if (plot.unlocked) return;
      const cost = BALANCE.plotUnlockCosts[index - 3] ?? 900;
      if (state.hearts < cost) {
        get().notify('shop.insufficient', 'warn');
        playSfx('error');
        return;
      }
      playSfx('levelup');
      mutate((draft) => {
        draft.hearts -= cost;
        draft.farm.plots[index].unlocked = true;
      });
      get().notify('farm.plotUnlocked', 'success');
    },

    plantCrop: (plotId, cropId) => {
      const crop = CROPS_BY_ID[cropId];
      const state = get().state;
      const plot = state.farm.plots.find((p) => p.id === plotId);
      if (!crop || !plot || !plot.unlocked || plot.cropId) return;
      const at = now();
      playSfx('place');
      mutate((draft) => {
        const target = draft.farm.plots.find((p) => p.id === plotId);
        if (!target) return;
        target.cropId = cropId;
        target.readyAt = at + crop.minutes * 60_000;
      });
      set({ overlay: null });
    },

    harvestPlot: (plotId) => {
      const state = get().state;
      const plot = state.farm.plots.find((p) => p.id === plotId);
      if (!plot?.cropId || !plot.readyAt || plot.readyAt > now()) return;
      const crop = CROPS_BY_ID[plot.cropId];
      if (!crop) return;
      const rng = createRng(Date.now() % 100000);
      const amount = rng.int(crop.yieldMin, crop.yieldMax);
      const at = now();
      playSfx('harvest');
      let next = produce(state, (draft) => {
        draft.pantry.ingredients[crop.id] = (draft.pantry.ingredients[crop.id] ?? 0) + amount;
        const target = draft.farm.plots.find((p) => p.id === plotId);
        if (target) {
          target.cropId = undefined;
          target.readyAt = undefined;
        }
        draft.stats.harvested += 1;
        bumpEvents(draft, 'harvest', at, 1);
      });
      if (state.stats.harvested === 0) next = awardMoment(next, 'firstHarvest', at);
      commit(next);
      playSfx('levelup');
      get().notify('farm.harvested', 'success', { name: crop.name, count: amount });
    },

    collectProducer: (producerId) => {
      const state = get().state;
      const producer = PRODUCERS.find((p) => p.id === producerId);
      const producerState = state.farm.producers[producerId];
      if (!producer || !producerState || producerState.readyAt > now()) return;
      const amount = 1;
      playSfx('harvest');
      mutate((draft) => {
        draft.pantry.ingredients[producer.ingredient] = (draft.pantry.ingredients[producer.ingredient] ?? 0) + amount;
        draft.farm.producers[producerId] = { readyAt: now() + producer.minutes * 60_000 };
        draft.stats.harvested += 1;
      });
      get().notify('farm.produced', 'success', { name: producer.name });
    },

    startCooking: (station, recipeId) => {
      const state = get().state;
      const recipe = RECIPES_BY_ID[recipeId];
      if (!recipe || recipe.station !== station) return;
      const current = state.stations[station];
      if (current?.recipeId) {
        get().notify('recipes.busy', 'warn');
        playSfx('error');
        return;
      }
      for (const need of recipe.ingredients) {
        if ((state.pantry.ingredients[need.id] ?? 0) < need.qty) {
          get().notify('recipes.missing', 'warn');
          playSfx('error');
          return;
        }
      }
      const at = now();
      playSfx('cook');
      mutate((draft) => {
        for (const need of recipe.ingredients) {
          draft.pantry.ingredients[need.id] = (draft.pantry.ingredients[need.id] ?? 0) - need.qty;
          if (draft.pantry.ingredients[need.id] <= 0) delete draft.pantry.ingredients[need.id];
        }
        draft.stations[station] = {
          recipeId,
          startedAt: at,
          doneAt: at + recipe.minutes * 60_000,
          collected: false,
        };
      });
      set({ overlay: null });
      get().notify('recipes.started', 'success', { name: recipe.name });
    },

    collectFood: (station) => {
      const state = get().state;
      const current = state.stations[station];
      if (!current.recipeId || !current.doneAt || current.doneAt > now()) return;
      const recipe = RECIPES_BY_ID[current.recipeId];
      if (!recipe) return;
      const at = now();
      playSfx('levelup');
      let next = produce(state, (draft) => {
        draft.pantry.foods[recipe.id] = (draft.pantry.foods[recipe.id] ?? 0) + 1;
        if (!draft.recipesLearned.includes(recipe.id)) draft.recipesLearned.push(recipe.id);
        draft.stats.cooked += 1;
        draft.stations[station] = {};
        bumpEvents(draft, 'cook', at, 1);
      });
      if (state.stats.cooked === 0) next = awardMoment(next, 'firstCook', at);
      commit(next);
      get().notify('recipes.readyToast', 'success', { name: recipe.name });
    },

    claimEvent: (eventId) => {
      const state = get().state;
      const def = EVENTS.find((e) => e.id === eventId);
      const progress = state.events[eventId];
      if (!def || !progress || progress.claimed || progress.progress < def.target) return;
      if (!eventActive(def, now())) return;
      playSfx('levelup');
      mutate((draft) => {
        draft.hearts += def.rewardHearts;
        draft.stats.heartsEarned += def.rewardHearts;
        draft.events[eventId].claimed = true;
      });
      get().notify('events.claimedToast', 'success', { amount: def.rewardHearts });
    },

    adoptPet: (species, coat, name) => {
      const state = get().state;
      const def = PET_SPECIES_BY_ID[species];
      if (!def) return;
      if (state.pets.length >= 6) {
        get().notify('pets.max', 'warn');
        return;
      }
      if (state.hearts < def.price) {
        get().notify('shop.insufficient', 'warn');
        playSfx('error');
        return;
      }
      const at = now();
      playSfx('levelup');
      let next = produce(state, (draft) => {
        draft.hearts -= def.price;
        draft.pets.push({
          id: uid('pet'),
          species,
          name,
          coat,
          trait: 'curious',
          happiness: BALANCE.petStartHappiness,
          roomId: get().roomId,
          nextBubbleAt: at + 2 * 60_000,
          state: 'idle',
          stateUntil: at + 5000,
          x: 960,
          y: 760,
        });
      });
      if (state.pets.length === 0) next = awardMoment(next, 'sixPets', at);
      commit(next);
      set({ overlay: null });
      get().notify('pets.adopted', 'success', { name });
    },

    renamePet: (petId, name) => {
      const trimmed = name.trim().slice(0, 20);
      if (!trimmed) return;
      mutate((draft) => {
        const pet = draft.pets.find((p) => p.id === petId);
        if (pet) pet.name = trimmed;
      });
    },

    sendPetToRoom: (petId, roomId) => {
      if (!get().state.rooms[roomId]?.unlocked) return;
      mutate((draft) => {
        const pet = draft.pets.find((p) => p.id === petId);
        if (pet) {
          pet.roomId = roomId;
          pet.state = 'idle';
          pet.stateUntil = now() + 4000;
          pet.x = 960;
          pet.y = 760;
        }
      });
      set({ roomId });
    },

    updateSettings: (patch) => {
      mutate((draft) => {
        draft.settings = { ...draft.settings, ...patch };
      });
    },

    updateCharacter: (index, look) => {
      mutate((draft) => {
        draft.characters[index] = { ...draft.characters[index], ...look };
      });
    },

    importSave: (text) => {
      try {
        const state = parseBackup(text);
        pushUndo(get().state);
        undoStack = [];
        set({ state, overlay: null, screen: 'game', roomId: 'living' });
        requestSnapshot();
        playSfx('levelup');
        get().notify('settings.imported', 'success');
      } catch {
        playSfx('error');
        get().notify('settings.invalidImport', 'warn');
      }
    },

    resetGame: async () => {
      undoStack = [];
      redoStack = [];
      set({
        state: createInitialState(now()),
        roomId: 'living',
        overlay: null,
        editMode: false,
        undoDepth: 0,
        redoDepth: 0,
      });
      playSfx('door');
    },

    exportSnapshot: async () => {
      await writeSnapshot(get().state, now());
      requestSnapshot();
    },

    evaluateMoments: () => {
      const result = applyMomentTriggers(get().state, now());
      if (result.newMoments.length > 0) {
        set({
          state: result.state,
          momentFlash: result.newMoments[result.newMoments.length - 1],
          toast: { id: uid('toast'), key: 'moments.new', kind: 'info' },
        });
        playSfx('camera');
      }
    },
  };
});

export function selectRoomItems(state: GameState, roomId: RoomId): PlacedItem[] {
  return state.placed.filter((p) => p.roomId === roomId);
}

export function variantSwatches(itemId: string): { id: string; name: string }[] {
  const item = ITEMS_BY_ID[itemId];
  if (!item?.variantGroup) return [];
  return (VARIANT_GROUPS[item.variantGroup] ?? []).map((variant) => ({ id: variant.id, name: variant.name }));
}

export function moodFace(pet: PetState): string {
  if (pet.happiness >= 75) return '♥';
  if (pet.happiness >= 45) return '☺';
  return '·';
}
