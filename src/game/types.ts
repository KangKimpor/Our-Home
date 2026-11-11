/** Core, serializable game-state types. No class instances, no functions. */

export type ID = string;
export type Ts = number;
export type Lang = 'en';
export type TextSize = 's' | 'm' | 'l';
export type PetTrait = 'sleepy' | 'curious' | 'foodie' | 'playful';
export type PetMoodState = 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play';
export type FoodCategory = 'side' | 'main' | 'dessert';
export type StationId = 'pot' | 'pan' | 'bowl' | 'oven';
export type Anchor = 'floor' | 'wall' | 'surface';
export type RoomId =
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'studio'
  | 'nursery'
  | 'porch'
  | 'garden'
  | 'farm';

export interface CharacterLook {
  name: string;
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'bun';
  outfit: string;
}

export interface Settings {
  music: number;
  sfx: number;
  lang: Lang;
  showBaby: boolean;
  textSize: TextSize;
}

export interface RoomState {
  unlocked: boolean;
}

export interface PlacedItem {
  uid: ID;
  itemId: ID;
  roomId: RoomId;
  x: number;
  y: number;
  flip: boolean;
  hostUid?: ID;
}

export interface PetState {
  id: ID;
  species: ID;
  name: string;
  coat: string;
  trait: PetTrait;
  happiness: number;
  roomId: RoomId;
  nextBubbleAt: Ts;
  state: PetMoodState;
  stateUntil: Ts;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  spotId?: ID;
  lastPettedAt?: Ts;
  lastFedAt?: Ts;
}

export interface HeartBubble {
  id: ID;
  sourceId: ID;
  sourceType: 'pet' | 'visitor' | 'critter';
  roomId: RoomId;
  value: number;
  spawnedAt: Ts;
  /** Fixed position for critter bubbles; pets/visitors resolve position live. */
  x?: number;
  y?: number;
  visitorId?: ID;
}

export interface VisitorProgress {
  discoveredAt: Ts;
  visits: number;
  friendship: number;
}

export interface ActiveVisitor {
  id: ID;
  visitorId: ID;
  roomId: RoomId;
  arrivedAt: Ts;
  leavesAt: Ts;
  gift: boolean;
  x: number;
  y: number;
}

export interface PlotState {
  id: ID;
  unlocked: boolean;
  cropId?: ID;
  readyAt?: Ts;
}

export interface StationState {
  recipeId?: ID;
  startedAt?: Ts;
  doneAt?: Ts;
  collected?: boolean;
}

export interface EventProgress {
  claimed: boolean;
  progress: number;
}

export interface GameState {
  version: number;
  createdAt: Ts;
  lastSeenAt: Ts;
  hearts: number;
  settings: Settings;
  characters: [CharacterLook, CharacterLook];
  rooms: Record<RoomId, RoomState>;
  inventory: Record<ID, number>;
  placed: PlacedItem[];
  pets: PetState[];
  visitors: {
    discovered: Record<ID, VisitorProgress>;
    active: ActiveVisitor[];
    nextRollAt: Ts;
  };
  bubbles: HeartBubble[];
  critters: Record<ID, { nextBubbleAt: Ts }>;
  moments: Record<ID, { firstAt: Ts; count: number }>;
  farm: {
    plots: PlotState[];
    producers: Record<ID, { readyAt: Ts }>;
  };
  pantry: {
    ingredients: Record<ID, number>;
    foods: Record<ID, number>;
  };
  recipesLearned: ID[];
  stations: Record<StationId, StationState>;
  events: Record<ID, EventProgress>;
  stats: {
    taps: number;
    heartsEarned: number;
    playSeconds: number;
    bought: number;
    harvested: number;
    cooked: number;
    visitorsMet: number;
  };
}

export interface SaveEnvelope {
  version: number;
  revision: number;
  deviceId: string;
  savedAt: Ts;
  state: GameState;
}

export interface Snapshot {
  id: string;
  savedAt: Ts;
  data: string;
}

export interface RoomSpot {
  id: string;
  x: number;
  y: number;
  kind: 'sit' | 'sleep' | 'eat' | 'play';
  anchor?: 'floor' | 'wall';
}

export interface SurfaceSpot { id: string; x: number; y: number; }

export interface RoomDef {
  id: RoomId;
  nameKey: string;
  order: number;
  unlockCost: number;
  outdoor: boolean;
  floorTop: number;
  spots: RoomSpot[];
  critterSpots: { id: string; x: number; y: number; kind: 'hedgehog' | 'butterfly' | 'bee' | 'owl' }[];
  surfaceSpots: SurfaceSpot[];
  attractTags: string[];
}

export interface ItemDef {
  id: ID;
  name: string;
  room: RoomId;
  art: string;
  palette?: string;
  price: number;
  anchor: Anchor;
  width: number;
  variantGroup?: string;
  tags?: string[];
  starter?: boolean;
  babyOnly?: boolean;
  /** Furniture that small surface items can sit on. */
  surface?: boolean;
}

export interface VisitorDef {
  id: ID;
  name: string;
  species: string;
  coat: string;
  accessory?: string;
  nameKey: string;
  rarity: 1 | 2 | 3;
  rooms: RoomId[];
  favourite: FoodCategory;
  lineKey: string;
}

export interface MomentDef {
  id: ID;
  name: string;
  nameKey: string;
  scene: string;
  trigger: string;
  hintKey: string;
}

export interface CropDef {
  id: ID;
  name: string;
  nameKey: string;
  minutes: number;
  yieldMin: number;
  yieldMax: number;
  colors: [string, string];
}

export interface RecipeDef {
  id: ID;
  name: string;
  nameKey: string;
  category: FoodCategory;
  station: StationId;
  minutes: number;
  ingredients: { id: ID; qty: number }[];
}

export interface ProducerDef {
  id: ID;
  name: string;
  nameKey: string;
  roomId: RoomId;
  minutes: number;
  ingredient: ID;
  x: number;
  y: number;
  art: string;
}

export interface EventDef {
  id: ID;
  name: string;
  nameKey: string;
  descKey: string;
  goal: 'collect' | 'visitors' | 'harvest' | 'cook';
  target: number;
  rewardHearts: number;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  color: string;
  icon: 'leaf' | 'moon' | 'star';
}

