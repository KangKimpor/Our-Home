import type { MomentDef } from '../game/types';

/** 20 original photo moments. `trigger` is handled by the moments system. */
export const MOMENTS: MomentDef[] = [
  { id: 'moveIn', name: 'Moving day', nameKey: 'moment.moveIn', scene: 'truck', trigger: 'move-in', hintKey: 'moment.moveIn.hint' },
  { id: 'firstBuy', name: 'A little something', nameKey: 'moment.firstBuy', scene: 'sofaNap', trigger: 'first-buy', hintKey: 'moment.firstBuy.hint' },
  { id: 'firstVisitor', name: 'Knock knock', nameKey: 'moment.firstVisitor', scene: 'visitorTea', trigger: 'first-visitor', hintKey: 'moment.firstVisitor.hint' },
  { id: 'firstHarvest', name: 'First harvest', nameKey: 'moment.firstHarvest', scene: 'harvest', trigger: 'first-harvest', hintKey: 'moment.firstHarvest.hint' },
  { id: 'firstCook', name: 'Something smells good', nameKey: 'moment.firstCook', scene: 'kitchenPot', trigger: 'first-cook', hintKey: 'moment.firstCook.hint' },
  { id: 'sofaNap', name: 'Sofa snooze', nameKey: 'moment.sofaNap', scene: 'sofaNap', trigger: 'pet-sofa', hintKey: 'moment.sofaNap.hint' },
  { id: 'sinkCat', name: 'The sink is a bed', nameKey: 'moment.sinkCat', scene: 'sink', trigger: 'pet-bath', hintKey: 'moment.sinkCat.hint' },
  { id: 'drawerCat', name: 'Drawer explorer', nameKey: 'moment.drawerCat', scene: 'drawer', trigger: 'drawer-cat', hintKey: 'moment.drawerCat.hint' },
  { id: 'snackBag', name: 'Snack inspector', nameKey: 'moment.snackBag', scene: 'snackBag', trigger: 'kitchen-cat', hintKey: 'moment.snackBag.hint' },
  { id: 'windowOwl', name: 'The window owl', nameKey: 'moment.windowOwl', scene: 'windowOwl', trigger: 'window-owl', hintKey: 'moment.windowOwl.hint' },
  { id: 'gardenNap', name: 'Grass pillow', nameKey: 'moment.gardenNap', scene: 'gardenNap', trigger: 'pet-garden', hintKey: 'moment.gardenNap.hint' },
  { id: 'pianoCat', name: 'One-note concert', nameKey: 'moment.pianoCat', scene: 'piano', trigger: 'pet-piano', hintKey: 'moment.pianoCat.hint' },
  { id: 'bookPile', name: 'Between the pages', nameKey: 'moment.bookPile', scene: 'books', trigger: 'pet-living', hintKey: 'moment.bookPile.hint' },
  { id: 'laundry', name: 'Warm laundry', nameKey: 'moment.laundry', scene: 'laundry', trigger: 'pet-bath', hintKey: 'moment.laundry.hint' },
  { id: 'fiveBubbles', name: 'So much love', nameKey: 'moment.fiveBubbles', scene: 'stars', trigger: 'five-bubbles', hintKey: 'moment.fiveBubbles.hint' },
  { id: 'tenItems', name: 'Our little museum', nameKey: 'moment.tenItems', scene: 'firstHome', trigger: 'ten-items', hintKey: 'moment.tenItems.hint' },
  { id: 'friendship', name: 'A friend for keeps', nameKey: 'moment.friendship', scene: 'visitorTea', trigger: 'friendship-3', hintKey: 'moment.friendship.hint' },
  { id: 'babyFirst', name: 'Tiny footsteps', nameKey: 'moment.babyFirst', scene: 'crib', trigger: 'baby-first', hintKey: 'moment.babyFirst.hint' },
  { id: 'sixPets', name: 'A full house', nameKey: 'moment.sixPets', scene: 'family', trigger: 'six-pets', hintKey: 'moment.sixPets.hint' },
  { id: 'tenRecipes', name: 'Our recipe book', nameKey: 'moment.tenRecipes', scene: 'cake', trigger: 'ten-recipes', hintKey: 'moment.tenRecipes.hint' },
];

export const MOMENTS_BY_ID = Object.fromEntries(MOMENTS.map((m) => [m.id, m]));

/** Moments that are allowed to repeat are shown with a count; all others stay unique. */
export const REPEATABLE_MOMENTS = new Set(['sofaNap', 'sinkCat', 'drawerCat', 'snackBag', 'gardenNap', 'laundry', 'bookPile']);
