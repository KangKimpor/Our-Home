import type { CropDef, ProducerDef } from '../game/types';

export const CROPS: CropDef[] = [
  { id: 'strawberry', name: 'Strawberry', nameKey: 'crop.strawberry', minutes: 20, yieldMin: 1, yieldMax: 3, colors: ['#C4483B', '#7F9B5C'] },
  { id: 'blueberry', name: 'Blueberry', nameKey: 'crop.blueberry', minutes: 20, yieldMin: 1, yieldMax: 3, colors: ['#53688F', '#7F9B5C'] },
  { id: 'raspberry', name: 'Raspberry', nameKey: 'crop.raspberry', minutes: 20, yieldMin: 1, yieldMax: 3, colors: ['#C4576B', '#7F9B5C'] },
  { id: 'lemon', name: 'Lemon', nameKey: 'crop.lemon', minutes: 60, yieldMin: 1, yieldMax: 2, colors: ['#E9C65B', '#7F9B5C'] },
  { id: 'tomato', name: 'Tomato', nameKey: 'crop.tomato', minutes: 30, yieldMin: 1, yieldMax: 3, colors: ['#C4483B', '#6E8A55'] },
  { id: 'potato', name: 'Potato', nameKey: 'crop.potato', minutes: 45, yieldMin: 1, yieldMax: 2, colors: ['#B08A5E', '#6E8A55'] },
  { id: 'herb', name: 'Garden herb', nameKey: 'crop.herb', minutes: 15, yieldMin: 1, yieldMax: 3, colors: ['#6E8A55', '#4E6B3E'] },
  { id: 'carrot', name: 'Carrot', nameKey: 'crop.carrot', minutes: 30, yieldMin: 1, yieldMax: 3, colors: ['#C97A4A', '#6E8A55'] },
];

export const CROPS_BY_ID: Record<string, CropDef> = Object.fromEntries(CROPS.map((c) => [c.id, c]));

export const INGREDIENTS: { id: string; name: string; nameKey: string; color: string; kind: 'crop' | 'produce' }[] = [
  ...CROPS.map((c) => ({ id: c.id, name: c.name, nameKey: c.nameKey, color: c.colors[0], kind: 'crop' as const })),
  { id: 'egg', name: 'Egg', nameKey: 'ingredient.egg', color: '#F0E2C6', kind: 'produce' },
  { id: 'milk', name: 'Milk', nameKey: 'ingredient.milk', color: '#FBF7EC', kind: 'produce' },
  { id: 'fish', name: 'Pond fish', nameKey: 'ingredient.fish', color: '#8EA7C6', kind: 'produce' },
  { id: 'honey', name: 'Honey', nameKey: 'ingredient.honey', color: '#E9C65B', kind: 'produce' },
];

export const PRODUCERS: ProducerDef[] = [
  {
    id: 'cow',
    name: 'Daisy the cow',
    nameKey: 'producer.cow',
    roomId: 'farm',
    minutes: 45,
    ingredient: 'milk',
    x: 1160,
    y: 660,
    art: 'cow',
  },
  {
    id: 'hen',
    name: 'Pip the hen',
    nameKey: 'producer.hen',
    roomId: 'farm',
    minutes: 30,
    ingredient: 'egg',
    x: 620,
    y: 640,
    art: 'hen',
  },
  {
    id: 'pond',
    name: 'The lily pond',
    nameKey: 'producer.pond',
    roomId: 'farm',
    minutes: 60,
    ingredient: 'fish',
    x: 1460,
    y: 700,
    art: 'fish',
  },
  {
    id: 'beehive',
    name: 'The beehive',
    nameKey: 'producer.beehive',
    roomId: 'farm',
    minutes: 90,
    ingredient: 'honey',
    x: 1740,
    y: 690,
    art: 'bee',
  },
];

export const PLOT_POSITIONS = [
  { x: 760, y: 560 },
  { x: 930, y: 560 },
  { x: 1100, y: 560 },
  { x: 760, y: 700 },
  { x: 930, y: 700 },
  { x: 1100, y: 700 },
];
