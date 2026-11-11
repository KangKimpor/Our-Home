import { BALANCE, SAVE } from '../config/balance';
import { ITEMS, ITEMS_BY_ID } from '../data/items';
import { PLOT_POSITIONS, PRODUCERS } from '../data/farm';
import { ROOMS } from '../data/rooms';
import { hostTopY } from './placement';
import type { GameState, PlacedItem, RoomId } from './types';

interface InitialPlacement {
  itemId: string;
  x: number;
  y: number;
  host?: string;
  flip?: boolean;
}

const LAYOUT: Partial<Record<RoomId, InitialPlacement[]>> = {
  living: [
    { itemId: 'living.rug.oval', x: 740, y: 802 },
    { itemId: 'living.sofa.sage', x: 730, y: 748 },
    { itemId: 'living.coffeeTable', x: 740, y: 794 },
    { itemId: 'living.floorLamp', x: 430, y: 748 },
    { itemId: 'living.fern', x: 1020, y: 752 },
    { itemId: 'living.tvCabinet', x: 1340, y: 752 },
    { itemId: 'living.tv', x: 1340, y: 674, host: 'living.tvCabinet' },
    { itemId: 'living.piano', x: 1640, y: 748 },
    { itemId: 'living.pianoBench', x: 1640, y: 786 },
    { itemId: 'living.painting', x: 1120, y: 274 },
    { itemId: 'living.clock', x: 1430, y: 248 },
    { itemId: 'living.shelf', x: 640, y: 266 },
  ],
  bedroom: [
    { itemId: 'bedroom.rug', x: 640, y: 782 },
    { itemId: 'bedroom.bed.rose', x: 560, y: 742 },
    { itemId: 'bedroom.nightstand', x: 860, y: 744 },
    { itemId: 'bedroom.lamp', x: 860, y: 690, host: 'bedroom.nightstand' },
    { itemId: 'bedroom.wardrobe', x: 1580, y: 734 },
    { itemId: 'bedroom.armchair', x: 1280, y: 758 },
    { itemId: 'bedroom.plant', x: 250, y: 754 },
    { itemId: 'bedroom.mirror', x: 1360, y: 294 },
    { itemId: 'bedroom.art', x: 920, y: 264 },
  ],
  kitchen: [
    { itemId: 'kitchen.counter', x: 390, y: 738 },
    { itemId: 'kitchen.stove', x: 760, y: 744 },
    { itemId: 'kitchen.sink', x: 980, y: 744 },
    { itemId: 'kitchen.fridge', x: 1190, y: 744 },
    { itemId: 'kitchen.table', x: 1520, y: 774 },
    { itemId: 'kitchen.chair', x: 1370, y: 782 },
    { itemId: 'kitchen.chair', x: 1670, y: 782, flip: true },
    { itemId: 'kitchen.pot', x: 760, y: 680, host: 'kitchen.stove' },
    { itemId: 'kitchen.herb', x: 390, y: 682, host: 'kitchen.counter' },
    { itemId: 'kitchen.shelf', x: 1420, y: 274 },
    { itemId: 'kitchen.clock', x: 780, y: 254 },
    { itemId: 'kitchen.bowl', x: 1520, y: 730, host: 'kitchen.table' },
  ],
  bathroom: [
    { itemId: 'bathroom.tub', x: 520, y: 756 },
    { itemId: 'bathroom.toilet', x: 880, y: 758 },
    { itemId: 'bathroom.sink', x: 1100, y: 758 },
    { itemId: 'bathroom.basket', x: 1320, y: 766 },
    { itemId: 'bathroom.mat', x: 760, y: 806 },
    { itemId: 'bathroom.mirror', x: 1100, y: 304 },
    { itemId: 'bathroom.towels', x: 1380, y: 304 },
  ],
  porch: [
    { itemId: 'porch.bowl.sun', x: 500, y: 768 },
    { itemId: 'porch.bowl.sky', x: 575, y: 772 },
    { itemId: 'porch.bowl.leaf', x: 650, y: 768 },
    { itemId: 'porch.bench', x: 1280, y: 754 },
    { itemId: 'porch.planter', x: 280, y: 756 },
    { itemId: 'porch.lantern', x: 1510, y: 768 },
    { itemId: 'porch.mat', x: 960, y: 804 },
    { itemId: 'porch.catTree', x: 880, y: 756 },
    { itemId: 'porch.birdhouse', x: 1420, y: 380 },
  ],
  garden: [
    { itemId: 'garden.picnic', x: 980, y: 792 },
    { itemId: 'garden.tree', x: 280, y: 776 },
    { itemId: 'garden.flowerRed', x: 660, y: 776 },
    { itemId: 'garden.hedge', x: 1620, y: 766 },
    { itemId: 'garden.lantern', x: 1380, y: 786 },
    { itemId: 'garden.butterflyHouse', x: 1180, y: 776 },
    { itemId: 'garden.path', x: 980, y: 826 },
  ],
};


function buildInitialPlaced(): PlacedItem[] {
  const placed: PlacedItem[] = [];
  let index = 0;
  for (const [roomId, entries] of Object.entries(LAYOUT)) {
    const hosts = new Map<string, PlacedItem>();
    for (const entry of entries) {
      const item = ITEMS_BY_ID[entry.itemId];
      if (!item) continue;
      const uid = `seed_${roomId}_${index++}`;
      const placedItem: PlacedItem = {
        uid,
        itemId: entry.itemId,
        roomId: roomId as RoomId,
        x: entry.x,
        y: entry.y,
        flip: entry.flip ?? false,
      };
      if (entry.host) {
        const hostItem = hosts.get(entry.host);
        if (hostItem) {
          placedItem.hostUid = hostItem.uid;
          placedItem.x = hostItem.x;
          placedItem.y = hostTopY(hostItem);
        }
      }
      placed.push(placedItem);
      if (item.surface) hosts.set(entry.itemId, placedItem);
    }
  }
  return placed;
}

export function createInitialState(now: number): GameState {
  const placed = buildInitialPlaced();

  const inventory: Record<string, number> = {};
  for (const p of placed) inventory[p.itemId] = (inventory[p.itemId] ?? 0) + 1;
  for (const item of ITEMS) {
    if (item.starter) inventory[item.id] = Math.max(inventory[item.id] ?? 0, 1);
  }

  const rooms = Object.fromEntries(
    (Object.keys(ROOMS) as RoomId[]).map((id) => [id, { unlocked: ROOMS[id].unlockCost === 0 }]),
  ) as GameState['rooms'];

  const critters: GameState['critters'] = {};
  for (const room of Object.values(ROOMS)) {
    for (const spot of room.critterSpots) {
      critters[spot.id] = { nextBubbleAt: now + 45_000 + Math.random() * 90_000 };
    }
  }

  return {
    version: SAVE.version,
    createdAt: now,
    lastSeenAt: now,
    hearts: BALANCE.startingHearts,
    settings: {
      music: 0.35,
      sfx: 0.6,
      lang: 'en',
      showBaby: false,
      textSize: 'm',
    },
    characters: [
      { name: 'Alex', skin: '#E0B48E', hair: '#3A332C', hairStyle: 'short', outfit: '#7F9B5C' },
      { name: 'Sam', skin: '#C98D62', hair: '#5B4130', hairStyle: 'long', outfit: '#C4483B' },
    ],
    rooms,
    inventory,
    placed,
    pets: [
      {
        id: 'pet_mochi',
        species: 'cat',
        name: 'Mochi',
        coat: 'ginger',
        trait: 'curious',
        happiness: BALANCE.petStartHappiness,
        roomId: 'living',
        nextBubbleAt: now + 3 * 60_000,
        state: 'walk',
        stateUntil: now + 12_000,
        x: 920,
        y: 786,
        targetX: 740,
        targetY: 774,

      },
    ],
    visitors: {
      discovered: {},
      active: [],
      nextRollAt: now + 8 * 60_000,
    },
    bubbles: [],
    critters,
    moments: {
      moveIn: { firstAt: now, count: 1 },
    },
    farm: {
      plots: PLOT_POSITIONS.map((_, index) => ({ id: `plot${index + 1}`, unlocked: index < 3 })),
      producers: Object.fromEntries(
        PRODUCERS.map((producer) => [producer.id, { readyAt: now + Math.round(producer.minutes * 0.3) * 60_000 }]),
      ),
    },
    pantry: {
      ingredients: {
        tomato: 2,
        herb: 2,
        strawberry: 2,
        blueberry: 1,
        egg: 1,
        milk: 1,
        potato: 1,
        carrot: 1,
        lemon: 1,
      },
      foods: {},
    },
    recipesLearned: [],
    stations: { pot: {}, pan: {}, bowl: {}, oven: {} },
    events: {},
    stats: {
      taps: 0,
      heartsEarned: 0,
      playSeconds: 0,
      bought: 0,
      harvested: 0,
      cooked: 0,
      visitorsMet: 0,
    },
  };
}
