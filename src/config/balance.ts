/** Every tunable lives here. Documented in docs/BALANCE.md. */

export const BALANCE = {
  startingHearts: 150,
  bubbleValueMin: 1,
  bubbleValueMax: 3,
  petBubbleIntervalMin: 4 * 60_000,
  petBubbleIntervalMax: 8 * 60_000,
  visitorRollMin: 20 * 60_000,
  visitorRollMax: 45 * 60_000,
  maxVisitors: 2,
  visitorStayMin: 3 * 60_000,
  visitorStayMax: 15 * 60_000,
  offlineCap: 8 * 60 * 60_000,
  plotUnlockCosts: [150, 400, 900],
  roomUnlockCosts: { nursery: 800, studio: 600, farm: 500 },
  refundRate: 0.5,
  foodMatchMultiplier: 2,
  happinessDecayPerHour: 1.2,
  happinessMin: 20,
  petStartHappiness: 70,
  feedHappiness: 16,
  petHappiness: 3,
  petCooldownMs: 8_000,
  maxPetBubbles: 1,
  autosaveDebounce: 2_000,
  snapshotInterval: 10 * 60_000,
  snapshotKeep: 5,
  cloudUploadDelay: 30_000,
  maxPlacedWidth: 640,
};

export const STAGE = { width: 1920, height: 884, cell: 64 };

export const SAVE = {
  version: 1,
  key: 'our-home/save',
  snapshotsKey: 'our-home/snapshots',
  deviceKey: 'our-home/device-id',
  lastSyncKey: 'our-home/last-sync',
  snapshotKeep: 5,
};

export const HEART_PLAQUE = { x: 89, y: 6 };
export const HUD_POS = {
  menu: { x: 8, y: 7 },
  plaque: { x: 89, y: 6.5 },
  events: { x: 89, y: 22 },
  feed: { x: 8, y: 92 },
  inventory: { x: 92, y: 78 },
  shop: { x: 85, y: 92 },
  store: { x: 92, y: 92 },
};
