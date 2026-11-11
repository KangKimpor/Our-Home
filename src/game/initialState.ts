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
    { itemId: 'living.rug.oval', x: 760, y: 872 },
    { itemId: 'living.sofa.sage', x: 720, y: 792 },
    { itemId: 'living.coffeeTable', x: 760, y: 860 },
    { itemId: 'living.floorLamp', x: 380, y: 812 },
    { itemId: 'living.fern', x: 1070, y: 810 },
    { itemId: 'living.tvCabinet', x: 1350, y: 800 },
    { itemId: 'living.tv', x: 1350, y: 722, host: 'living.tvCabinet' },
    { itemId: 'living.piano', x: 1670, y: 824 },
    { itemId: 'living.pianoBench', x: 1670, y: 872 },
    { itemId: 'living.painting', x: 1120, y: 366 },
    { itemId: 'living.clock', x: 1430, y: 336 },
    { itemId: 'living.shelf', x: 520, y: 340 },
  ],
  bedroom: [
    { itemId: 'bedroom.rug', x: 850, y: 862 },
    { itemId: 'bedroom.bed.rose', x: 600, y: 824 },
    { itemId: 'bedroom.nightstand', x: 920, y: 836 },
    { itemId: 'bedroom.lamp', x: 920, y: 782, host: 'bedroom.nightstand' },
    { itemId: 'bedroom.wardrobe', x: 1650, y: 818 },
    { itemId: 'bedroom.armchair', x: 1240, y: 834 },
    { itemId: 'bedroom.plant', x: 250, y: 838 },
    { itemId: 'bedroom.mirror', x: 1440, y: 390 },
    { itemId: 'bedroom.art', x: 920, y: 340 },
  ],
  kitchen: [
    { itemId: 'kitchen.counter', x: 430, y: 824 },
    { itemId: 'kitchen.stove', x: 780, y: 834 },
    { itemId: 'kitchen.sink', x: 1000, y: 838 },
    { itemId: 'kitchen.fridge', x: 1220, y: 838 },
    { itemId: 'kitchen.table', x: 1580, y: 844 },
    { itemId: 'kitchen.chair', x: 1430, y: 856 },
    { itemId: 'kitchen.chair', x: 1740, y: 856 },
    { itemId: 'kitchen.pot', x: 780, y: 770, host: 'kitchen.stove' },
    { itemId: 'kitchen.herb', x: 430, y: 768, host: 'kitchen.counter' },
    { itemId: 'kitchen.shelf', x: 1480, y: 356 },
    { itemId: 'kitchen.clock', x: 620, y: 336 },
    { itemId: 'kitchen.bowl', x: 1580, y: 800, host: 'kitchen.table' },
  ],
  bathroom: [
    { itemId: 'bathroom.tub', x: 520, y: 828 },
    { itemId: 'bathroom.toilet', x: 880, y: 838 },
    { itemId: 'bathroom.sink', x: 1100, y: 838 },
    { itemId: 'bathroom.basket', x: 1320, y: 846 },
    { itemId: 'bathroom.mat', x: 1500, y: 866 },
    { itemId: 'bathroom.mirror', x: 1100, y: 390 },
    { itemId: 'bathroom.towels', x: 1380, y: 390 },
  ],
  porch: [
    { itemId: 'porch.bowl.sun', x: 500, y: 844 },
    { itemId: 'porch.bowl.sky', x: 570, y: 848 },
    { itemId: 'porch.bowl.leaf', x: 640, y: 844 },
    { itemId: 'porch.bench', x: 1250, y: 826 },
    { itemId: 'porch.planter', x: 280, y: 828 },
    { itemId: 'porch.lantern', x: 1510, y: 848 },
    { itemId: 'porch.mat', x: 1710, y: 876 },
    { itemId: 'porch.catTree', x: 920, y: 836 },
    { itemId: 'porch.birdhouse', x: 1420, y: 430 },
  ],
  garden: [
    { itemId: 'garden.picnic', x: 980, y: 866 },
    { itemId: 'garden.tree', x: 280, y: 856 },
    { itemId: 'garden.flowerRed', x: 720, y: 856 },
    { itemId: 'garden.hedge', x: 1710, y: 846 },
    { itemId: 'garden.lantern', x: 1460, y: 866 },
    { itemId: 'garden.butterflyHouse', x: 1150, y: 856 },
    { itemId: 'garden.path', x: 1100, y: 884 },
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
        x: 1000,
        y: 800,
        targetX: 720,
        targetY: 780,
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
