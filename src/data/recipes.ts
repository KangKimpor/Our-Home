import type { RecipeDef } from '../game/types';

export const RECIPES: RecipeDef[] = [
  // Side dishes
  { id: 'gardenSalad', name: 'Garden salad', nameKey: 'recipe.gardenSalad', category: 'side', station: 'bowl', minutes: 3, ingredients: [{ id: 'herb', qty: 1 }, { id: 'tomato', qty: 1 }] },
  { id: 'berryToast', name: 'Berry toast', nameKey: 'recipe.berryToast', category: 'side', station: 'oven', minutes: 4, ingredients: [{ id: 'strawberry', qty: 1 }, { id: 'blueberry', qty: 1 }] },
  { id: 'tomatoSoup', name: 'Tomato soup', nameKey: 'recipe.tomatoSoup', category: 'side', station: 'pot', minutes: 6, ingredients: [{ id: 'tomato', qty: 2 }, { id: 'herb', qty: 1 }] },
  { id: 'herbyPotatoes', name: 'Herby potatoes', nameKey: 'recipe.herbyPotatoes', category: 'side', station: 'pan', minutes: 8, ingredients: [{ id: 'potato', qty: 1 }, { id: 'herb', qty: 1 }] },
  { id: 'carrotRibbons', name: 'Carrot ribbons', nameKey: 'recipe.carrotRibbons', category: 'side', station: 'pan', minutes: 4, ingredients: [{ id: 'carrot', qty: 2 }] },
  { id: 'cheesyToast', name: 'Cottage toastie', nameKey: 'recipe.cheesyToast', category: 'side', station: 'oven', minutes: 5, ingredients: [{ id: 'milk', qty: 1 }, { id: 'tomato', qty: 1 }] },
  { id: 'fishCakes', name: 'Pond fish cakes', nameKey: 'recipe.fishCakes', category: 'side', station: 'pan', minutes: 10, ingredients: [{ id: 'fish', qty: 1 }, { id: 'potato', qty: 1 }] },
  { id: 'honeyCarrots', name: 'Honey carrots', nameKey: 'recipe.honeyCarrots', category: 'side', station: 'pan', minutes: 7, ingredients: [{ id: 'carrot', qty: 1 }, { id: 'honey', qty: 1 }] },

  // Mains
  { id: 'berryPancakes', name: 'Berry pancakes', nameKey: 'recipe.berryPancakes', category: 'main', station: 'bowl', minutes: 8, ingredients: [{ id: 'strawberry', qty: 1 }, { id: 'milk', qty: 1 }, { id: 'egg', qty: 1 }] },
  { id: 'farmOmelette', name: 'Farm omelette', nameKey: 'recipe.farmOmelette', category: 'main', station: 'pan', minutes: 5, ingredients: [{ id: 'egg', qty: 2 }, { id: 'herb', qty: 1 }] },
  { id: 'fishStew', name: 'Fish stew', nameKey: 'recipe.fishStew', category: 'main', station: 'pot', minutes: 12, ingredients: [{ id: 'fish', qty: 1 }, { id: 'tomato', qty: 1 }, { id: 'potato', qty: 1 }] },
  { id: 'lemonFish', name: 'Lemon-baked fish', nameKey: 'recipe.lemonFish', category: 'main', station: 'oven', minutes: 10, ingredients: [{ id: 'fish', qty: 1 }, { id: 'lemon', qty: 1 }] },
  { id: 'stuffedPotatoes', name: 'Stuffed potatoes', nameKey: 'recipe.stuffedPotatoes', category: 'main', station: 'oven', minutes: 11, ingredients: [{ id: 'potato', qty: 2 }, { id: 'herb', qty: 1 }, { id: 'milk', qty: 1 }] },
  { id: 'gardenPie', name: 'Garden pie', nameKey: 'recipe.gardenPie', category: 'main', station: 'oven', minutes: 15, ingredients: [{ id: 'carrot', qty: 1 }, { id: 'potato', qty: 1 }, { id: 'herb', qty: 1 }] },
  { id: 'honeyFish', name: 'Honey-glazed fish', nameKey: 'recipe.honeyFish', category: 'main', station: 'pan', minutes: 9, ingredients: [{ id: 'fish', qty: 1 }, { id: 'honey', qty: 1 }] },
  { id: 'tomatoPotatoPot', name: 'Tomato potato pot', nameKey: 'recipe.tomatoPotatoPot', category: 'main', station: 'pot', minutes: 13, ingredients: [{ id: 'tomato', qty: 2 }, { id: 'potato', qty: 1 }, { id: 'herb', qty: 1 }] },

  // Desserts
  { id: 'berryCrumble', name: 'Berry crumble', nameKey: 'recipe.berryCrumble', category: 'dessert', station: 'oven', minutes: 12, ingredients: [{ id: 'strawberry', qty: 1 }, { id: 'blueberry', qty: 1 }] },
  { id: 'lemonTart', name: 'Lemon tart', nameKey: 'recipe.lemonTart', category: 'dessert', station: 'oven', minutes: 10, ingredients: [{ id: 'lemon', qty: 1 }, { id: 'egg', qty: 1 }] },
  { id: 'strawberryCake', name: 'Strawberry cake', nameKey: 'recipe.strawberryCake', category: 'dessert', station: 'bowl', minutes: 14, ingredients: [{ id: 'strawberry', qty: 2 }, { id: 'egg', qty: 1 }, { id: 'milk', qty: 1 }] },
  { id: 'blueberryMuffins', name: 'Blueberry muffins', nameKey: 'recipe.blueberryMuffins', category: 'dessert', station: 'oven', minutes: 8, ingredients: [{ id: 'blueberry', qty: 1 }, { id: 'milk', qty: 1 }] },
  { id: 'raspberrySorbet', name: 'Raspberry sorbet', nameKey: 'recipe.raspberrySorbet', category: 'dessert', station: 'bowl', minutes: 6, ingredients: [{ id: 'raspberry', qty: 2 }, { id: 'lemon', qty: 1 }] },
  { id: 'honeyCookies', name: 'Honey cookies', nameKey: 'recipe.honeyCookies', category: 'dessert', station: 'bowl', minutes: 7, ingredients: [{ id: 'honey', qty: 1 }, { id: 'egg', qty: 1 }] },
  { id: 'raspberryJamToast', name: 'Raspberry jam toast', nameKey: 'recipe.raspberryJamToast', category: 'dessert', station: 'pan', minutes: 3, ingredients: [{ id: 'raspberry', qty: 1 }] },
  { id: 'carrotCake', name: 'Carrot cake', nameKey: 'recipe.carrotCake', category: 'dessert', station: 'oven', minutes: 13, ingredients: [{ id: 'carrot', qty: 1 }, { id: 'egg', qty: 1 }] },
];

export const RECIPES_BY_ID: Record<string, RecipeDef> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export const STATIONS = [
  { id: 'pot', name: 'Stock pot', nameKey: 'station.pot', x: 900, y: 640 },
  { id: 'pan', name: 'Frying pan', nameKey: 'station.pan', x: 1080, y: 650 },
  { id: 'bowl', name: 'Mixing bowl', nameKey: 'station.bowl', x: 1260, y: 640 },
  { id: 'oven', name: 'Oven', nameKey: 'station.oven', x: 1420, y: 640 },
] as const;
