import { Application, Container, Graphics, Rectangle, Sprite, Text, Texture, type Ticker } from 'pixi.js';
import { animalArt, animalRigParts, type AnimalRigParts, type RigPart } from '../art/animals';
import { babyRigParts, characterRigParts, type CharacterRigParts } from '../art/characters';
import { itemArt } from '../art/items';
import { PALETTES } from '../art/palettes';
import { SVG_DEFS } from '../art/svg';
import { CROPS_BY_ID } from '../data/farm';
import { ITEMS_BY_ID } from '../data/items';
import { ROOMS, ROOM_PALETTES } from '../data/rooms';
import { VISITORS_BY_ID } from '../data/visitors';
import { isFlatItem, itemSize } from '../game/placement';
import type { GameState, HeartBubble, PetState, PlacedItem, RoomId } from '../game/types';
import { useGameStore } from '../store/gameStore';

const INK = '#2B2521';

export interface StageCallbacks {
  onBubble: (bubbleId: string) => void;
  onPet: (petId: string) => void;
  onVisitor: (visitorInstanceId: string) => void;
  onSelectItem: (uid: string) => void;
  onMoveItem: (uid: string, x: number, y: number) => void;
  onStageTap: (x: number, y: number) => void;
}

export interface StageView {
  state: GameState;
  roomId: RoomId;
  editMode: boolean;
  selectedUid?: string;
  night: boolean;
}

interface DragState {
  uid: string;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  moved: boolean;
  node: ItemNode;
}

interface ItemNode {
  container: Container;
  sprite: Sprite;
  overlay: Graphics;
  glow: Graphics;
  itemId: string;
  artKind: string;
  placed: PlacedItem;
  popTimer: number;
  baseW: number;
  baseH: number;
  usesPng: boolean;
  glowKey: string;
  overlayKey: string;
  overlayParts?: {
    hour?: Graphics;
    min?: Graphics;
    sec?: Graphics;
    ripple?: Graphics;
    blades?: Graphics;
  };
}

interface RigSprites {
  shadow?: Sprite;
  hairBack?: Sprite;
  backTail?: Sprite;
  farLegs?: Sprite;
  legs?: Sprite;
  backArm?: Sprite;
  body?: Sprite;
  nearLegBack?: Sprite;
  nearLegFront?: Sprite;
  wing?: Sprite;
  wingL?: Sprite;
  wingR?: Sprite;
  frontArm?: Sprite;
  head?: Sprite;
  eyesOpen?: Sprite;
  eyesClosed?: Sprite;
}

interface AnimalRigNode {
  container: Container;
  rig: Container;
  parts: AnimalRigParts;
  sprites: RigSprites;
  pngSprite?: Sprite;
  pngShadow?: Graphics;
  pngUrl?: string;
  pngW?: number;
  pngH?: number;
  readyBadge?: Graphics;
  cacheKey: string;
  targetSize: number;
  visX: number;
  visY: number;
  facing: number;
  walkPhase: number;
  blinkTimer: number;
  blinkLeft: number;
  zzzTimer: number;
  jumpPop: number;
  species: string;
  pose: 'idle' | 'walk' | 'sleep' | 'special';
  seed: number;
}

interface HumanRigNode {
  container: Container;
  rig: Container;
  parts: CharacterRigParts;
  sprites: RigSprites;
  cacheKey: string;
  targetW: number;
  pose: 'idle' | 'read' | 'cook' | 'paint';
  blinkTimer: number;
  blinkLeft: number;
  wavePop: number;
  seed: number;
  x: number;
  y: number;
}

interface BubbleNode {
  container: Container;
  halo: Graphics;
  bornAt: number;
  x: number;
  y: number;
  value: number;
}

interface Particle {
  kind: 'heart' | 'sparkle' | 'dust' | 'steam' | 'ring' | 'firefly' | 'petal';
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  color: string;
  alpha: number;
  rot: number;
  vrot: number;
}

interface FloatingLabel {
  text: Text;
  age: number;
  life: number;
  vy: number;
  baseX: number;
}

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  alpha: number;
}

interface MoteNode {
  gfx: Graphics;
  data: DustMote;
}

interface SkyActor {
  gfx: Graphics;
  kind: 'star' | 'cloud' | 'windowCloud';
  x0: number;
  y: number;
  speed: number;
  phase: number;
  winX?: number;
  winW?: number;
}

/**
 * Entries in public/asset-pack-v1.1/manifest.json with transparent_background: false.
 * These are NEVER rendered as PNG sprites — only as visual/color style references.
 */
const OPAQUE_PACK_FILES = new Set<string>([
  'assets/outdoor/garden_fence_backdrop_strip.png',
  'assets/tiles/grass_ground_patch.png',
  'assets/tiles/pool_water_grid_tile.png',
  'assets/tiles/wood_floor_texture_sample.png',
  'assets/nursery/nursery_mother_crib_scene.png',
  'assets/nursery/nursery_canopy_tent_scene.png',
  'assets/bedroom/bedroom_chaise_lounge.png',
  'assets/bedroom/bedroom_plant_cluster.png',
  'assets/bedroom/bedroom_window_cat_scene.png',
  'assets/bathroom/bathroom_vanity_sink.png',
  'assets/bathroom/bathroom_bathtub_and_plant.png',
  'assets/bathroom/bathroom_large_bath_mat.png',
  'assets/bathroom/bathroom_laundry_basket.png',
  'assets/studio/studio_bookshelf.png',
  'assets/kitchen/kitchen_sink_counter.png',
  'assets/kitchen/kitchen_hanging_utensils_and_pans.png',
  'assets/kitchen/kitchen_lower_cabinets.png',
  'assets/farm/farm_crop_plot_grid.png',
  'assets/farm/farm_diagonal_picket_fence.png',
  'assets/farm/farm_riverbank_and_water.png',
  'assets/farm/farm_stone_river_crossing.png',
  'assets/garden/garden_picnic_blanket_setup.png',
  'assets/garden/garden_pool_scene_expanded.png',
  'assets/pet_care/pet_bowls_and_mat_set.png',
  'assets/music_living/living_spiral_staircase_scene.png',
  'assets/ui_gallery/moments_gallery_header.png',
  'assets/ui_gallery/moments_photo_card_01.png',
  'assets/ui_gallery/moments_photo_card_02.png',
  'assets/ui_gallery/moments_photo_card_03.png',
  'assets/ui_gallery/moments_photo_card_04.png',
  'assets/ui_gallery/moments_photo_card_05.png',
  'assets/ui_gallery/moments_photo_card_06.png',
  'assets/tiles_extra/tile_bathroom_blue_floor_sample.png',
  'assets/tiles_extra/tile_bedroom_wood_floor_sample.png',
  'assets/tiles_extra/tile_farm_soil_plot_sample.png',
  'assets/tiles_extra/tile_river_water_sample.png',
]);

/** Clean, artifact-free transparent_background: true cutouts mapped by item id as optional fallback. */
const ITEM_SPRITE_FALLBACK: Record<string, string> = {
  'nursery.rockingChair': '/asset-pack-v1.1/assets/nursery/nursery_rocking_chair.png',
  'nursery.toyBasket': '/asset-pack-v1.1/assets/nursery/nursery_plush_toy_basket.png',
  'nursery.rug': '/asset-pack-v1.1/assets/nursery/nursery_strawberry_rug.png',
};

/** Clean transparent PNG cutouts for idle/lounging animal poses. */
function animalPngFor(species: string, coat: string | undefined, pose: 'idle' | 'walk' | 'sleep' | 'special'): string | null {
  if (pose !== 'idle') return null;
  if (species === 'redPanda') return '/asset-pack-v1.1/assets/animals/red_panda_sitting.png';
  if (species === 'dog' && (coat === 'golden' || coat === 'rust')) {
    return '/asset-pack-v1.1/assets/animals/shiba_dog_standing.png';
  }
  if (species === 'cat') {
    if (coat === 'calico') return '/asset-pack-v1.1/assets/animals/calico_cat_lounging.png';
    if (coat === 'ginger') return '/asset-pack-v1.1/assets/animals/ginger_cat_lounging.png';
    if (coat === 'white' || coat === 'cream') return '/asset-pack-v1.1/assets/animals/white_cat_lounging.png';
    if (coat === 'charcoal') return '/asset-pack-v1.1/assets/animals/black_white_cat_walking.png';
  }
  return null;
}

function normalizePackUrl(sprite: string): string | null {
  const cleaned = sprite.replace(/^\/+/, '');
  const rel = cleaned.startsWith('asset-pack-v1.1/') ? cleaned.slice('asset-pack-v1.1/'.length) : cleaned;
  if (OPAQUE_PACK_FILES.has(rel)) return null;
  if (sprite.startsWith('/asset-pack-v1.1/')) return sprite;
  if (cleaned.startsWith('asset-pack-v1.1/')) return `/${cleaned}`;
  return `/asset-pack-v1.1/${rel}`;
}

const textureCache = new Map<string, Texture>();
const textureLoading = new Set<string>();

function svgDataUrl(body: string, w: number, h: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(2, Math.round(w * 2))}" height="${Math.max(2, Math.round(h * 2))}" viewBox="0 0 ${w} ${h}">${SVG_DEFS}${body}</svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function requestTexture(key: string, body: string, w: number, h: number, onReady: () => void): Texture | null {
  const existing = textureCache.get(key);
  if (existing) return existing;
  if (textureLoading.has(key)) return null;
  textureLoading.add(key);
  const image = new Image();
  image.onload = () => {
    try {
      textureCache.set(key, Texture.from(image));
    } catch {
      /* ignore */
    }
    textureLoading.delete(key);
    onReady();
  };
  image.onerror = () => textureLoading.delete(key);
  image.src = svgDataUrl(body, w, h);
  return null;
}

function requestImageTexture(url: string, onReady: () => void): Texture | null {
  const existing = textureCache.get(url);
  if (existing) return existing;
  if (textureLoading.has(url)) return null;
  textureLoading.add(url);
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    try {
      textureCache.set(url, Texture.from(image));
    } catch {
      /* ignore */
    }
    textureLoading.delete(url);
    onReady();
  };
  image.onerror = () => textureLoading.delete(url);
  image.src = url;
  return null;
}

function mountRigPart(
  parent: Container,
  key: string,
  part: RigPart | undefined,
  onReady: () => void,
): Sprite | undefined {
  if (!part) return undefined;
  const tex = requestTexture(key, part.body, part.w, part.h, onReady);
  const sprite = new Sprite(tex ?? Texture.WHITE);
  sprite.anchor.set(part.pivotX / part.w, part.pivotY / part.h);
  sprite.position.set(part.pivotX - part.w / 2, part.pivotY - part.h);
  sprite.visible = !!tex;
  parent.addChild(sprite);
  return sprite;
}

function updateRigPartTexture(
  sprite: Sprite | undefined,
  key: string,
  part: RigPart | undefined,
  onReady: () => void,
): void {
  if (!sprite || !part) return;
  const tex = requestTexture(key, part.body, part.w, part.h, onReady);
  if (tex) {
    sprite.texture = tex;
    sprite.visible = true;
  } else {
    sprite.visible = false;
  }
}

const WINDOWS: Partial<Record<RoomId, [number, number, number, number]>> = {
  living: [14, 18, 206, 396],
  bedroom: [52, 22, 178, 360],
  kitchen: [92, 0, 438, 258],
  bathroom: [1130, 0, 680, 148],
  studio: [10, 0, 252, 398],
  nursery: [54, 34, 178, 222],
};

function drawGardenView(g: Graphics, x: number, y: number, w: number, h: number, night: boolean, sky: string, showFence: boolean): void {
  g.rect(x, y, w, h).fill(night ? '#263854' : sky);
  g.rect(x, y, w, h * 0.48).fill({ color: night ? '#1B283D' : '#FFFFFF', alpha: night ? 0.28 : 0.2 });

  if (night) {
    g.circle(x + w * 0.72, y + h * 0.22, 18).fill({ color: '#FBF7EC', alpha: 0.16 });
    g.circle(x + w * 0.72, y + h * 0.22, 11).fill('#FBF7EC');
    g.circle(x + w * 0.72 + 5, y + h * 0.22 - 4, 9).fill('#263854');
  } else {
    g.circle(x + w * 0.72, y + h * 0.2, 19).fill({ color: '#FCE9A8', alpha: 0.45 });
    g.circle(x + w * 0.72, y + h * 0.2, 11).fill('#F4D06F');
  }

  // Soft bushes & treetops outside the window
  const bushDark = night ? '#1C352A' : '#3C7A4D';
  const bushMid = night ? '#274839' : '#5E9960';
  const lawn = night ? '#2E4735' : '#8CAE5B';
  g.rect(x, y + h * 0.62, w, h * 0.38).fill(lawn);
  for (let bx = x + 16; bx < x + w + 10; bx += 38) {
    g.circle(bx, y + h * 0.62, 24).fill(bushDark);
    g.circle(bx + 12, y + h * 0.59, 18).fill(bushMid);
  }
  if (showFence) {
    const fy = y + h * 0.7;
    const fh = h * 0.22;
    g.rect(x, fy + fh * 0.35, w, 5).fill(night ? '#787166' : '#E7E1D4');
    for (let fx = x + 8; fx < x + w - 4; fx += 24) {
      g.poly([fx, fy + fh, fx, fy + 6, fx + 7, fy, fx + 14, fy + 6, fx + 14, fy + fh]).fill(night ? '#958D80' : '#FBF7EC');
      g.poly([fx, fy + fh, fx, fy + 6, fx + 7, fy, fx + 14, fy + 6, fx + 14, fy + fh]).stroke({ width: 1.6, color: INK });
    }
  }
}

function drawHerringboneFloor(
  g: Graphics,
  floorTop: number,
  colA: string,
  colB: string,
  colC: string,
  night: boolean,
): void {
  const cA = night ? dim(colA, 0.64) : colA;
  const cB = night ? dim(colB, 0.64) : colB;
  const cC = night ? dim(colC, 0.64) : colC;
  g.rect(0, floorTop, 1920, 884 - floorTop).fill(cA);

  // Diagonal chevron/herringbone parquet columns clamped cleanly below floorTop
  const colW = 84;
  const stepY = 38;
  const tilt = 22;
  let colIdx = 0;
  for (let x = -colW; x < 1920 + colW; x += colW) {
    colIdx++;
    const dir = colIdx % 2 === 0 ? 1 : -1;
    let rowIdx = 0;
    for (let y = floorTop - tilt; y < 884 + stepY; y += stepY) {
      rowIdx++;
      const fill = (rowIdx + colIdx) % 3 === 0 ? cB : (rowIdx + colIdx) % 2 === 0 ? cC : cA;
      const yLTop = Math.max(floorTop, dir > 0 ? y : y + tilt);
      const yRTop = Math.max(floorTop, dir > 0 ? y + tilt : y);
      const yRBot = Math.min(884, (dir > 0 ? y + tilt : y) + stepY);
      const yLBot = Math.min(884, (dir > 0 ? y : y + tilt) + stepY);
      if (yLBot <= yLTop && yRBot <= yRTop) continue;
      g.poly([x, yLTop, x + colW, yRTop, x + colW, yRBot, x, yLBot]).fill(fill);
      g.poly([x, yLTop, x + colW, yRTop, x + colW, yRBot, x, yLBot]).stroke({
        width: 1.6,
        color: INK,
        alpha: night ? 0.32 : 0.38,
      });
    }
  }
  // Top shadow from wall baseboard & gentle bottom vignette
  g.rect(0, floorTop, 1920, 14).fill({ color: '#2B2521', alpha: 0.14 });
  g.rect(0, 830, 1920, 54).fill({ color: '#2B2521', alpha: 0.08 });
}

function drawHorizontalPlankFloor(
  g: Graphics,
  floorTop: number,
  colMain: string,
  colAlt: string,
  plankH: number,
  night: boolean,
): void {
  const fillMain = night ? dim(colMain, 0.66) : colMain;
  const fillAlt = night ? dim(colAlt, 0.66) : colAlt;
  g.rect(0, floorTop, 1920, 884 - floorTop).fill(fillMain);

  let rowIdx = 0;
  for (let y = floorTop; y < 884; y += plankH) {
    rowIdx++;
    if (rowIdx % 2 === 0) {
      g.rect(0, y, 1920, plankH).fill({ color: fillAlt, alpha: 0.42 });
    }
    g.moveTo(0, y).lineTo(1920, y).stroke({ width: 2, color: INK, alpha: night ? 0.32 : 0.4 });
    const offset = (rowIdx * 170) % 340;
    for (let x = -80 + offset; x < 1960; x += 340) {
      g.moveTo(x, y).lineTo(x, Math.min(884, y + plankH)).stroke({
        width: 1.8,
        color: INK,
        alpha: night ? 0.24 : 0.3,
      });
    }
  }
  g.rect(0, floorTop, 1920, 16).fill({ color: '#2B2521', alpha: 0.12 });
}

function drawSpiralStaircase(bg: Graphics, fg: Graphics, night: boolean): void {
  const stairWall = night ? dim('#EFE7D6', 0.72) : '#EFE7D6';
  const treadCol = night ? dim('#C9A87E', 0.72) : '#C9A87E';
  const treadDark = night ? dim('#A8875E', 0.72) : '#A8875E';
  const railCol = night ? dim('#FBF7EC', 0.76) : '#FBF7EC';

  // Curved alcove wall & shadow in top-right (x: 1510..1920)
  bg.poly([1580, 0, 1920, 0, 1920, 456, 1590, 456, 1555, 290, 1560, 120]).fill(stairWall);
  bg.poly([1580, 0, 1560, 120, 1555, 290, 1590, 456]).stroke({ width: 3, color: INK, alpha: 0.55 });

  // Central newel post / curved column
  bg.rect(1795, 0, 38, 444).fill(railCol);
  bg.rect(1795, 0, 38, 444).stroke({ width: 2.8, color: INK });

  // Sweeping wood treads fanning from top-right down to floor (y: 44..446)
  const steps = 11;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const y = 52 + t * 384;
    const leftX = 1660 - Math.sin(t * Math.PI * 0.85) * 145;
    const rightX = 1916;
    const h = 24;
    bg.roundRect(leftX, y, rightX - leftX, h, 4).fill(i % 2 === 0 ? treadCol : treadDark);
    bg.roundRect(leftX, y, rightX - leftX, h, 4).stroke({ width: 2.5, color: INK });
    // Vertical baluster rods
    if (i % 2 === 0) {
      fg.moveTo(leftX + 18, y).lineTo(leftX + 18, y - 62).stroke({ width: 3.2, color: INK, alpha: 0.75 });
    }
  }

  // Sweeping white curved handrail & bottom post
  fg.moveTo(1660, 0)
    .bezierCurveTo(1535, 130, 1500, 270, 1585, 392)
    .stroke({ width: 12, color: railCol });
  fg.moveTo(1660, 0)
    .bezierCurveTo(1535, 130, 1500, 270, 1585, 392)
    .stroke({ width: 3, color: INK });
  fg.roundRect(1572, 376, 22, 74, 4).fill(railCol);
  fg.roundRect(1572, 376, 22, 74, 4).stroke({ width: 2.8, color: INK });
  fg.circle(1583, 374, 13).fill(railCol);
  fg.circle(1583, 374, 13).stroke({ width: 2.8, color: INK });
}

function drawLivingRoom(bg: Graphics, fg: Graphics, floorTop: number, night: boolean): void {
  const pal = ROOM_PALETTES.living;
  const wallFill = night ? dim(pal.wall, 0.74) : pal.wall;
  const wallAlt = night ? dim(pal.wallShade, 0.72) : pal.wallShade;
  const trimFill = night ? dim(pal.trim, 0.74) : pal.trim;

  bg.rect(0, 0, 1920, floorTop).fill(wallFill);
  bg.rect(0, 0, 1920, 22).fill(wallAlt);

  // Subtle electrical outlet near patio door
  bg.roundRect(262, floorTop - 56, 22, 30, 4).fill('#F5F0E3');
  bg.roundRect(262, floorTop - 56, 22, 30, 4).stroke({ width: 1.8, color: INK, alpha: 0.55 });

  // Herringbone dark-walnut & honey wood floor
  drawHerringboneFloor(bg, floorTop, pal.floor, pal.floorAlt, '#9C8268', night);

  // Crisp baseboard trim drawn over the top edge of the floor
  bg.rect(0, floorTop - 22, 1920, 22).fill(trimFill);
  bg.rect(0, floorTop - 22, 1920, 22).stroke({ width: 3, color: INK });

  // Left floor-to-ceiling sliding glass patio door/window (x: 14..220)
  const [wx, wy, ww, wh] = WINDOWS.living!;
  drawGardenView(bg, wx, wy, ww, wh, night, pal.sky, true);

  // Sliding glass door frame & reflections in fg
  fg.rect(0, 0, wx, floorTop + 14).fill(trimFill);
  fg.rect(wx - 10, 0, ww + 26, 20).fill(trimFill);
  fg.rect(wx - 10, 0, ww + 26, 20).stroke({ width: 2.8, color: INK });
  fg.rect(wx + ww, 0, 16, floorTop + 14).fill(trimFill);
  fg.rect(wx + ww, 0, 16, floorTop + 14).stroke({ width: 2.8, color: INK });
  fg.rect(wx, wy, ww, wh).stroke({ width: 3.2, color: INK });
  // Vertical sliding divider bar & horizontal transom
  fg.rect(wx + ww * 0.52, wy, 10, wh).fill('#FBF7EC');
  fg.rect(wx + ww * 0.52, wy, 10, wh).stroke({ width: 2.4, color: INK });
  fg.rect(wx, wy + wh * 0.3, ww, 8).fill('#FBF7EC');
  fg.rect(wx, wy + wh * 0.3, ww, 8).stroke({ width: 2.2, color: INK });
  // Diagonal glass reflection streaks
  fg.poly([wx + 18, wy + wh - 20, wx + 66, wy + 22, wx + 86, wy + 22, wx + 38, wy + wh - 20]).fill({
    color: '#FFFFFF',
    alpha: night ? 0.07 : 0.2,
  });
  // Wood threshold step at patio base
  fg.roundRect(0, floorTop - 4, wx + ww + 20, 20, 4).fill(night ? '#8A7055' : '#C9AA82');
  fg.roundRect(0, floorTop - 4, wx + ww + 20, 20, 4).stroke({ width: 2.8, color: INK });

  // Right spiral staircase
  drawSpiralStaircase(bg, fg, night);
}

function drawBedroom(bg: Graphics, fg: Graphics, floorTop: number, night: boolean): void {
  const pal = ROOM_PALETTES.bedroom;
  const wallFill = night ? dim(pal.wall, 0.74) : pal.wall;
  const wallAlt = night ? dim(pal.wallShade, 0.72) : pal.wallShade;
  const trimFill = night ? dim(pal.trim, 0.74) : pal.trim;

  bg.rect(0, 0, 1920, floorTop).fill(wallFill);
  bg.rect(0, 0, 1920, 22).fill(wallAlt);

  // Classic recessed wall paneling moldings (IMG_2702)
  for (let px = 310; px < 1840; px += 310) {
    bg.roundRect(px, 44, 270, floorTop - 96, 4).fill({ color: wallAlt, alpha: 0.42 });
    bg.roundRect(px, 44, 270, floorTop - 96, 4).stroke({ width: 2, color: INK, alpha: 0.22 });
    bg.roundRect(px + 14, 58, 242, floorTop - 124, 3).stroke({ width: 1.5, color: '#FFFDF8', alpha: 0.65 });
  }

  // Herringbone medium-warm wood parquet floor
  drawHerringboneFloor(bg, floorTop, pal.floor, pal.floorAlt, '#9E8266', night);

  // Crisp baseboard trim drawn over the top edge of the floor
  bg.rect(0, floorTop - 22, 1920, 22).fill(trimFill);
  bg.rect(0, floorTop - 22, 1920, 22).stroke({ width: 3, color: INK });

  // Left tall French window with louvered wooden shutters & sheer curtains (x: 52..230)
  const [wx, wy, ww, wh] = WINDOWS.bedroom!;
  drawGardenView(bg, wx, wy, ww, wh, night, pal.sky, true);

  // Window frame & muntins
  fg.rect(wx, wy, ww, wh).stroke({ width: 3.2, color: INK });
  fg.rect(wx + ww / 2 - 4, wy, 8, wh).fill('#FBF7EC');
  fg.rect(wx + ww / 2 - 4, wy, 8, wh).stroke({ width: 2.4, color: INK });
  for (const ry of [0.33, 0.66]) {
    fg.rect(wx, wy + wh * ry - 3, ww, 6).fill('#FBF7EC');
    fg.rect(wx, wy + wh * ry - 3, ww, 6).stroke({ width: 2, color: INK });
  }

  // Wooden louvered shutters on both sides
  const shutterCol = night ? '#6A523B' : '#9B7857';
  for (const sx of [wx - 44, wx + ww + 2]) {
    fg.roundRect(sx, wy - 4, 42, wh + 8, 4).fill(shutterCol);
    fg.roundRect(sx, wy - 4, 42, wh + 8, 4).stroke({ width: 2.6, color: INK });
    for (let ly = wy + 16; ly < wy + wh - 10; ly += 16) {
      fg.moveTo(sx + 6, ly).lineTo(sx + 36, ly).stroke({ width: 2, color: INK, alpha: 0.55 });
    }
  }

  // Sheer floor-length white curtains & rod
  fg.roundRect(wx - 58, wy - 14, ww + 116, 8, 4).fill('#8A6748');
  fg.roundRect(wx - 58, wy - 14, ww + 116, 8, 4).stroke({ width: 2.4, color: INK });
  const sheerFill = night ? '#CBD4DF' : '#FFFDF8';
  fg.poly([wx - 50, wy - 6, wx + 18, wy - 6, wx + 8, floorTop + 10, wx - 48, floorTop + 10]).fill({
    color: sheerFill,
    alpha: 0.72,
  });
  fg.poly([wx - 50, wy - 6, wx + 18, wy - 6, wx + 8, floorTop + 10, wx - 48, floorTop + 10]).stroke({
    width: 2.2,
    color: INK,
    alpha: 0.65,
  });
  fg.poly([wx + ww - 18, wy - 6, wx + ww + 50, wy - 6, wx + ww + 48, floorTop + 10, wx + ww - 8, floorTop + 10]).fill({
    color: sheerFill,
    alpha: 0.72,
  });
  fg.poly([wx + ww - 18, wy - 6, wx + ww + 50, wy - 6, wx + ww + 48, floorTop + 10, wx + ww - 8, floorTop + 10]).stroke({
    width: 2.2,
    color: INK,
    alpha: 0.65,
  });
}

function drawNursery(bg: Graphics, fg: Graphics, floorTop: number, night: boolean): void {
  const pal = ROOM_PALETTES.nursery;
  const wallFill = night ? dim(pal.wall, 0.74) : pal.wall;
  const wallAlt = night ? dim(pal.wallShade, 0.72) : pal.wallShade;
  const trimFill = night ? dim(pal.trim, 0.74) : pal.trim;

  bg.rect(0, 0, 1920, floorTop).fill(wallFill);
  bg.rect(0, 0, 1920, 22).fill(wallAlt);
  bg.rect(0, floorTop - 22, 1920, 22).fill(trimFill);
  bg.rect(0, floorTop - 22, 1920, 22).stroke({ width: 3, color: INK });

  // Nursery crescent moon & star wall decals (IMG_2703)
  const decalGold = night ? '#D4B45E' : '#E9C65B';
  bg.circle(960, 128, 26).fill(decalGold);
  bg.circle(972, 120, 22).fill(wallFill);
  for (const [sx, sy, sr] of [
    [840, 96, 10],
    [890, 150, 7],
    [1045, 92, 9],
    [1105, 142, 11],
    [1160, 86, 7],
  ]) {
    bg.poly([sx, sy - sr, sx + sr * 0.3, sy - sr * 0.3, sx + sr, sy, sx + sr * 0.3, sy + sr * 0.3, sx, sy + sr, sx - sr * 0.3, sy + sr * 0.3, sx - sr, sy, sx - sr * 0.3, sy - sr * 0.3]).fill(decalGold);
  }

  // Two cozy framed pastel nursery gallery prints on back wall
  for (const [fx, accent] of [
    [1310, '#E8A6B0'],
    [1465, '#9EC4A7'],
  ] as [number, string][]) {
    bg.roundRect(fx, 86, 112, 136, 6).fill('#D5B895');
    bg.roundRect(fx, 86, 112, 136, 6).stroke({ width: 2.8, color: INK });
    bg.rect(fx + 12, 98, 88, 112).fill('#FFFDF8');
    bg.circle(fx + 56, 152, 24).fill(accent);
    bg.circle(fx + 56, 152, 24).stroke({ width: 2, color: INK, alpha: 0.45 });
  }

  // Wide horizontal honey-oak floorboards
  drawHorizontalPlankFloor(bg, floorTop, pal.floor, pal.floorAlt, 58, night);

  // Left brown-framed casement window looking onto treetops (x: 54..232)
  const [wx, wy, ww, wh] = WINDOWS.nursery!;
  drawGardenView(bg, wx, wy, ww, wh, night, pal.sky, false);

  const woodFrame = night ? '#6F5036' : '#9C734E';
  fg.roundRect(wx - 12, wy - 12, ww + 24, wh + 24, 5).stroke({ width: 12, color: woodFrame });
  fg.roundRect(wx - 18, wy - 18, ww + 36, wh + 36, 6).stroke({ width: 3, color: INK });
  fg.rect(wx, wy, ww, wh).stroke({ width: 3, color: INK });
  fg.rect(wx + ww / 2 - 4, wy, 8, wh).fill(woodFrame);
  fg.rect(wx + ww / 2 - 4, wy, 8, wh).stroke({ width: 2.2, color: INK });
  fg.rect(wx, wy + wh * 0.52, ww, 8).fill(woodFrame);
  fg.rect(wx, wy + wh * 0.52, ww, 8).stroke({ width: 2.2, color: INK });
  fg.roundRect(wx - 22, wy + wh + 6, ww + 44, 14, 4).fill('#B88E65');
  fg.roundRect(wx - 22, wy + wh + 6, ww + 44, 14, 4).stroke({ width: 2.8, color: INK });
}

function drawBathroom(bg: Graphics, fg: Graphics, floorTop: number, night: boolean): void {
  const pal = ROOM_PALETTES.bathroom;
  const tileWall = night ? dim(pal.wall, 0.74) : pal.wall;
  const grout = night ? dim(pal.wallShade, 0.72) : pal.wallShade;

  // Back wall square ceramic tiles
  bg.rect(0, 0, 1920, floorTop).fill(tileWall);
  const cornerX = 220;
  for (let x = cornerX; x < 1920; x += 48) {
    bg.moveTo(x, 0).lineTo(x, floorTop).stroke({ width: 1.8, color: grout });
  }
  for (let y = 44; y < floorTop; y += 44) {
    bg.moveTo(cornerX, y).lineTo(1920, y).stroke({ width: 1.8, color: grout });
  }

  // Angled left-wall perspective corner (x: 0..220)
  bg.poly([0, 0, cornerX, 0, cornerX, floorTop, 0, floorTop + 56]).fill(night ? dim('#ECE5D3', 0.7) : '#ECE5D3');
  for (let y = 44; y < floorTop; y += 44) {
    bg.moveTo(0, y + 36).lineTo(cornerX, y).stroke({ width: 1.8, color: grout });
  }
  for (const vx of [55, 110, 165]) {
    bg.moveTo(vx, 0).lineTo(vx, floorTop + ((cornerX - vx) / cornerX) * 56).stroke({ width: 1.8, color: grout });
  }
  bg.moveTo(cornerX, 0).lineTo(cornerX, floorTop).stroke({ width: 2.8, color: INK, alpha: 0.4 });

  // Sky-blue perspective square floor tiles (matching tile_bathroom_blue_floor_sample.png & IMG_2704)
  const blueA = night ? dim(pal.floor, 0.68) : pal.floor;
  const blueB = night ? dim('#8BBAD3', 0.68) : '#8BBAD3';
  const blueGrout = night ? dim(pal.floorAlt, 0.66) : pal.floorAlt;
  bg.rect(0, floorTop, 1920, 884 - floorTop).fill(blueA);
  bg.poly([0, floorTop + 56, cornerX, floorTop, 1920, floorTop, 1920, 884, 0, 884]).fill(blueA);

  const tileRows = 8;
  const rowH = (884 - floorTop) / tileRows;
  for (let r = 0; r < tileRows; r++) {
    const ty = floorTop + r * rowH;
    if (r % 2 === 0) {
      bg.rect(0, ty, 1920, rowH).fill({ color: blueB, alpha: 0.32 });
    }
    bg.moveTo(0, ty).lineTo(1920, ty).stroke({ width: 2, color: blueGrout });
  }
  for (let x = -80; x < 2040; x += 72) {
    const slant = (x - 960) * 0.14;
    bg.moveTo(x, floorTop).lineTo(x + slant, 884).stroke({ width: 2, color: blueGrout });
  }
  bg.rect(0, floorTop - 10, 1920, 10).fill(night ? dim(pal.trim, 0.72) : pal.trim);
  bg.moveTo(0, floorTop).lineTo(1920, floorTop).stroke({ width: 2.6, color: INK, alpha: 0.55 });

  // Upper-right wide dark-framed garden window (x: 1130..1810, y: 0..148)
  const [wx, wy, ww, wh] = WINDOWS.bathroom!;
  drawGardenView(bg, wx, wy, ww, wh, night, pal.sky, false);
  const frameCol = night ? '#383430' : '#4E4944';
  fg.rect(wx - 8, wy, ww + 16, wh + 10).stroke({ width: 10, color: frameCol });
  fg.rect(wx, wy, ww, wh).stroke({ width: 3, color: INK });
  for (const mx of [wx + ww * 0.33, wx + ww * 0.67]) {
    fg.rect(mx - 4, wy, 8, wh).fill(frameCol);
    fg.rect(mx - 4, wy, 8, wh).stroke({ width: 2, color: INK });
  }
  fg.roundRect(wx - 14, wy + wh, ww + 28, 12, 3).fill('#D8D0BE');
  fg.roundRect(wx - 14, wy + wh, ww + 28, 12, 3).stroke({ width: 2.6, color: INK });
}

function drawStudio(bg: Graphics, fg: Graphics, floorTop: number, night: boolean): void {
  const pal = ROOM_PALETTES.studio;
  const wallFill = night ? dim(pal.wall, 0.74) : pal.wall;
  const trimFill = night ? dim(pal.trim, 0.74) : pal.trim;

  bg.rect(0, 0, 1920, floorTop).fill(wallFill);
  bg.rect(0, floorTop - 22, 1920, 22).fill(trimFill);
  bg.rect(0, floorTop - 22, 1920, 22).stroke({ width: 3, color: INK });

  // Draped warm string-light garland on upper-left wall (IMG_2705)
  bg.moveTo(310, 16).bezierCurveTo(440, 110, 610, 110, 740, 16).stroke({ width: 3, color: INK, alpha: 0.7 });
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.5) / 7;
    const bx = 310 + t * 430;
    const by = 16 + Math.sin(t * Math.PI) * 70;
    bg.circle(bx, by + 7, 13).fill({ color: '#FCE79C', alpha: night ? 0.36 : 0.2 });
    bg.circle(bx, by + 7, 5.5).fill('#FFF6C4');
    bg.circle(bx, by + 7, 5.5).stroke({ width: 1.8, color: INK });
  }

  // Wide horizontal pale-oak studio planks
  drawHorizontalPlankFloor(bg, floorTop, pal.floor, pal.floorAlt, 56, night);

  // Left floor-to-ceiling glass studio window wall (x: 10..262)
  const [wx, wy, ww, wh] = WINDOWS.studio!;
  drawGardenView(bg, wx, wy, ww, wh, night, pal.sky, false);
  // Warm autumn tree highlight outside studio window
  if (!night) {
    bg.circle(wx + 70, wy + wh * 0.44, 34).fill('#D8844A');
    bg.circle(wx + 125, wy + wh * 0.5, 28).fill('#E3A84F');
  }
  const mullion = night ? '#3F3126' : '#5E4938';
  fg.rect(0, 0, wx, floorTop + 10).fill(mullion);
  fg.rect(wx + ww, 0, 14, floorTop + 10).fill(mullion);
  fg.rect(wx + ww, 0, 14, floorTop + 10).stroke({ width: 2.6, color: INK });
  fg.rect(wx, wy, ww, wh).stroke({ width: 3, color: INK });
  fg.rect(wx + ww * 0.5, wy, 9, wh).fill(mullion);
  fg.rect(wx, wy + wh * 0.45, ww, 8).fill(mullion);
  fg.poly([wx + 24, wy + wh - 18, wx + 82, wy + 24, wx + 102, wy + 24, wx + 44, wy + wh - 18]).fill({
    color: '#FFFFFF',
    alpha: night ? 0.06 : 0.18,
  });
  fg.roundRect(0, floorTop - 6, wx + ww + 20, 18, 4).fill('#9A7B5B');
  fg.roundRect(0, floorTop - 6, wx + ww + 20, 18, 4).stroke({ width: 2.6, color: INK });
}

function drawKitchen(bg: Graphics, fg: Graphics, floorTop: number, night: boolean): void {
  const pal = ROOM_PALETTES.kitchen;
  const wallFill = night ? dim(pal.wall, 0.74) : pal.wall;
  const wallAlt = night ? dim(pal.wallShade, 0.72) : pal.wallShade;
  const trimFill = night ? dim(pal.trim, 0.74) : pal.trim;

  bg.rect(0, 0, 1920, floorTop).fill(wallFill);
  bg.rect(0, 0, 1920, 20).fill(wallAlt);

  // Subtle cream subway tile backsplash along lower wall (y: 318..floorTop)
  bg.rect(0, 318, 1920, floorTop - 318).fill(wallAlt);
  for (let y = 342; y < floorTop; y += 26) {
    bg.moveTo(0, y).lineTo(1920, y).stroke({ width: 1.5, color: '#D8D0BE', alpha: 0.65 });
  }
  bg.moveTo(0, 318).lineTo(1920, 318).stroke({ width: 2.2, color: INK, alpha: 0.35 });

  // Ceramic tiled cream kitchen floor (y: floorTop..884)
  const tileFill = night ? dim(pal.floor, 0.68) : pal.floor;
  const groutCol = night ? dim('#CFC6B4', 0.65) : '#CFC6B4';
  bg.rect(0, floorTop, 1920, 884 - floorTop).fill(tileFill);
  for (let y = floorTop + 56; y < 884; y += 56) {
    bg.moveTo(0, y).lineTo(1920, y).stroke({ width: 1.8, color: groutCol });
  }
  for (let x = 60; x < 1920; x += 96) {
    bg.moveTo(x, floorTop).lineTo(x + (x - 960) * 0.08, 884).stroke({ width: 1.8, color: groutCol });
  }

  // Clean baseboard molding separating wall backsplash and tiled floor
  bg.rect(0, floorTop - 20, 1920, 20).fill(trimFill);
  bg.rect(0, floorTop - 20, 1920, 20).stroke({ width: 3, color: INK });
  bg.rect(0, floorTop, 1920, 14).fill({ color: '#2B2521', alpha: 0.1 });

  // Upper-left wide kitchen casement window (x: 92..530)
  const [wx, wy, ww, wh] = WINDOWS.kitchen!;
  drawGardenView(bg, wx, wy, ww, wh, night, pal.sky, false);
  const winWood = night ? '#917456' : '#C8A782';
  fg.rect(wx - 10, wy, ww + 20, wh + 10).stroke({ width: 12, color: winWood });
  fg.rect(wx, wy, ww, wh).stroke({ width: 3, color: INK });
  fg.rect(wx + ww / 2 - 4, wy, 8, wh).fill(winWood);
  fg.rect(wx + ww / 2 - 4, wy, 8, wh).stroke({ width: 2.2, color: INK });
  fg.roundRect(wx - 18, wy + wh, ww + 36, 14, 4).fill(winWood);
  fg.roundRect(wx - 18, wy + wh, ww + 36, 14, 4).stroke({ width: 2.8, color: INK });
}

function drawOutdoorRoom(bg: Graphics, fg: Graphics, roomId: RoomId, floorTop: number, night: boolean): void {
  const pal = ROOM_PALETTES[roomId];

  // Shared outdoor sky backdrop behind skyAnimLayer
  bg.rect(0, 0, 1920, 884).fill(night ? '#26354D' : pal.sky);
  bg.rect(0, 0, 1920, floorTop * 0.52).fill({ color: night ? '#1A263A' : '#FFFFFF', alpha: night ? 0.35 : 0.22 });
  if (night) {
    bg.circle(1680, 96, 62).fill({ color: '#FBF7EC', alpha: 0.14 });
    bg.circle(1680, 96, 42).fill('#FBF7EC');
    bg.circle(1700, 82, 36).fill('#26354D');
  } else {
    bg.circle(1680, 96, 64).fill({ color: '#FCE9A8', alpha: 0.36 });
    bg.circle(1680, 96, 42).fill('#F5D77F');
  }

  if (roomId === 'porch') {
    // Porch: top grey siding -> elevated grey-taupe wooden plank deck -> backyard lawn (IMG_2700)
    const siding = night ? dim(pal.wall, 0.7) : pal.wall;
    const deck = night ? dim(pal.wallShade, 0.68) : pal.wallShade;
    const deckLine = night ? '#5A534E' : '#7D746D';
    const lawn = night ? '#3A4F30' : pal.floor;

    fg.rect(0, 0, 1920, 108).fill(siding);
    for (let sy = 26; sy < 108; sy += 26) {
      fg.moveTo(0, sy).lineTo(1920, sy).stroke({ width: 2, color: INK, alpha: 0.35 });
    }
    fg.rect(0, 98, 1920, 12).fill(night ? '#9D978F' : '#EAE4D7');
    fg.rect(0, 98, 1920, 12).stroke({ width: 2.5, color: INK });

    // Elevated wooden deck (y: 110..382)
    fg.rect(0, 110, 1920, 272).fill(deck);
    for (let y = 148; y < 382; y += 38) {
      fg.moveTo(0, y).lineTo(1920, y).stroke({ width: 2.2, color: deckLine });
    }
    for (let x = 140; x < 1920; x += 260) {
      fg.moveTo(x, 110).lineTo(x + (x - 960) * 0.06, 382).stroke({ width: 2, color: deckLine, alpha: 0.7 });
    }
    // Deck apron fascia & shadow
    fg.rect(0, 366, 1920, 22).fill(night ? '#6C645D' : '#968D85');
    fg.rect(0, 366, 1920, 22).stroke({ width: 3, color: INK });

    // Lower backyard lawn (y: 388..884)
    fg.rect(0, 388, 1920, 496).fill(lawn);
    fg.rect(0, 388, 1920, 16).fill({ color: '#2B2521', alpha: 0.14 });

    // Two stout deck support posts resting on square stone footings
    for (const px of [410, 1480]) {
      fg.roundRect(px - 22, 388, 44, 34, 4).fill(night ? '#7C7A75' : '#C8C4BC');
      fg.roundRect(px - 22, 388, 44, 34, 4).stroke({ width: 2.6, color: INK });
      fg.rect(px - 14, 110, 28, 282).fill(night ? '#685E56' : '#9E9287');
      fg.rect(px - 14, 110, 28, 282).stroke({ width: 2.6, color: INK });
    }

    // Scattered grass tufts, pebbles & cattail reeds on far right
    for (let i = 0; i < 26; i++) {
      const gx = 80 + ((i * 187) % 1760);
      const gy = 435 + ((i * 89) % 410);
      const col = night ? '#48623C' : '#658441';
      fg.moveTo(gx, gy).lineTo(gx - 5, gy - 11).stroke({ width: 2.2, color: col });
      fg.moveTo(gx + 5, gy).lineTo(gx + 8, gy - 12).stroke({ width: 2.2, color: col });
    }
    for (const cx of [1775, 1815, 1852]) {
      fg.moveTo(cx, 660).lineTo(cx - 4, 520).stroke({ width: 4, color: night ? '#3E5B37' : '#587846' });
      fg.roundRect(cx - 9, 530, 11, 30, 5).fill('#7A5236');
      fg.roundRect(cx - 9, 530, 11, 30, 5).stroke({ width: 2, color: INK });
    }
    return;
  }

  if (roomId === 'garden') {
    // Garden: top bushes + white picket fence with central gate -> sunlit olive lawn -> bottom foliage (IMG_2698 & IMG_2701)
    const bushDark = night ? '#15472D' : pal.wall;
    const bushLight = night ? '#1E5D3D' : pal.wallShade;
    const lawn = night ? '#3E542A' : pal.floor;
    const lawnPatch = night ? '#364A25' : pal.floorAlt;

    // Scalloped bushes along top horizon (y: 68..210)
    for (let bx = 20; bx < 1940; bx += 86) {
      fg.circle(bx, 138, 66).fill(bushDark);
      fg.circle(bx + 36, 146, 56).fill(bushLight);
    }

    // Main sunlit olive-green grass lawn (y: 184..884)
    fg.rect(0, 184, 1920, 700).fill(lawn);
    for (const [px, py, rx, ry] of [
      [340, 420, 260, 110],
      [1480, 460, 290, 120],
      [960, 620, 340, 130],
    ]) {
      fg.ellipse(px, py, rx, ry).fill({ color: lawnPatch, alpha: 0.48 });
    }

    // Central sandy gate path (x: 860..1060, y: 170..300)
    fg.poly([890, 168, 1030, 168, 1085, 310, 835, 310]).fill(night ? '#7A6C52' : '#D5C39C');
    fg.poly([890, 168, 1030, 168, 1085, 310, 835, 310]).stroke({ width: 2.4, color: INK, alpha: 0.45 });

    // White pointed picket fence left & right of central gate
    const drawFenceSpan = (xStart: number, xEnd: number) => {
      fg.rect(xStart, 126, xEnd - xStart, 10).fill(night ? '#8A8378' : '#ECE6D8');
      fg.rect(xStart, 162, xEnd - xStart, 10).fill(night ? '#8A8378' : '#ECE6D8');
      for (let fx = xStart; fx < xEnd; fx += 44) {
        fg.poly([fx, 190, fx, 112, fx + 12, 94, fx + 24, 112, fx + 24, 190]).fill(night ? '#9D9589' : '#FBF7EC');
        fg.poly([fx, 190, fx, 112, fx + 12, 94, fx + 24, 112, fx + 24, 190]).stroke({ width: 2.2, color: INK });
      }
    };
    drawFenceSpan(18, 868);
    drawFenceSpan(1056, 1902);

    // Grass tufts, wildflowers & soft ochre earth pebbles
    for (let i = 0; i < 34; i++) {
      const gx = 60 + ((i * 211) % 1800);
      const gy = 250 + ((i * 97) % 580);
      const col = night ? '#4E6B35' : '#74903E';
      fg.moveTo(gx, gy).lineTo(gx - 5, gy - 12).stroke({ width: 2.2, color: col });
      fg.moveTo(gx + 5, gy).lineTo(gx + 8, gy - 13).stroke({ width: 2.2, color: col });
      if (i % 5 === 0) {
        fg.circle(gx + 14, gy - 4, 5).fill('#FBF7EC');
        fg.circle(gx + 14, gy - 4, 2.2).fill('#E9C65B');
      }
    }

    // Foreground bottom-edge lush foliage strip
    for (let bx = 30; bx < 1940; bx += 110) {
      fg.circle(bx, 886, 44).fill(bushDark);
      fg.circle(bx + 54, 890, 36).fill(bushLight);
    }
    return;
  }

  // Farm: top picket fence + red-roofed coop + hay-trough shed + diagonal fence + foreground winding river (IMG_2707)
  const bushDark = night ? '#15472D' : pal.wallShade;
  const bushLight = night ? '#1E5D3D' : pal.wall;
  const meadow = night ? '#3A4F2B' : pal.floor;
  const meadowAlt = night ? '#334625' : pal.floorAlt;

  for (let bx = 20; bx < 1940; bx += 84) {
    fg.circle(bx, 118, 62).fill(bushDark);
    fg.circle(bx + 38, 126, 52).fill(bushLight);
  }
  fg.rect(0, 166, 1920, 718).fill(meadow);
  fg.ellipse(1440, 420, 340, 175).fill({ color: meadowAlt, alpha: 0.45 });

  // Top white picket fence
  fg.rect(18, 112, 1884, 9).fill(night ? '#8A8378' : '#ECE6D8');
  fg.rect(18, 144, 1884, 9).fill(night ? '#8A8378' : '#ECE6D8');
  for (let fx = 24; fx < 1900; fx += 46) {
    fg.poly([fx, 172, fx, 102, fx + 11, 86, fx + 22, 102, fx + 22, 172]).fill(night ? '#9D9589' : '#FBF7EC');
    fg.poly([fx, 172, fx, 102, fx + 11, 86, fx + 22, 102, fx + 22, 172]).stroke({ width: 2.2, color: INK });
  }

  // Left cozy red-roofed chicken coop / barn shelter (x: 68..330, y: 120..336)
  fg.roundRect(88, 184, 220, 148, 6).fill(night ? '#7A5E46' : '#C69D72');
  fg.roundRect(88, 184, 220, 148, 6).stroke({ width: 3, color: INK });
  fg.poly([66, 192, 198, 106, 330, 192]).fill(night ? '#7A352E' : '#C4483B');
  fg.poly([66, 192, 198, 106, 330, 192]).stroke({ width: 3.2, color: INK });
  fg.roundRect(160, 232, 76, 100, 10).fill('#423329');
  fg.roundRect(160, 232, 76, 100, 10).stroke({ width: 2.6, color: INK });

  // Center wooden hay-trough pavilion shed (x: 490..870, y: 108..324)
  fg.rect(520, 190, 320, 130).fill(night ? '#594230' : '#966E4B');
  fg.rect(520, 190, 320, 130).stroke({ width: 2.8, color: INK });
  fg.ellipse(680, 290, 128, 34).fill(night ? '#9E853F' : '#E7C868');
  fg.ellipse(680, 290, 128, 34).stroke({ width: 2.4, color: INK });
  fg.poly([486, 194, 535, 118, 825, 118, 874, 194]).fill(night ? '#4D3828' : '#7D5B3E');
  fg.poly([486, 194, 535, 118, 825, 118, 874, 194]).stroke({ width: 3, color: INK });
  for (const px of [524, 824]) {
    fg.rect(px, 192, 16, 132).fill(night ? '#73573E' : '#BA9168');
    fg.rect(px, 192, 16, 132).stroke({ width: 2.4, color: INK });
  }

  // Diagonal white picket fence separating left pasture from right crop field
  const fencePts = Array.from({ length: 8 }, (_, idx) => ({
    x: 825 + idx * 32,
    y: 235 + idx * 44,
  }));
  fg.moveTo(825, 210).lineTo(1055, 520).stroke({ width: 7, color: night ? '#8A8378' : '#E8E2D4' });
  fg.moveTo(825, 240).lineTo(1055, 550).stroke({ width: 7, color: night ? '#8A8378' : '#E8E2D4' });
  for (const fp of fencePts) {
    fg.poly([fp.x, fp.y + 42, fp.x, fp.y - 26, fp.x + 10, fp.y - 40, fp.x + 20, fp.y - 26, fp.x + 20, fp.y + 42]).fill(
      night ? '#9D9589' : '#FBF7EC',
    );
    fg.poly([fp.x, fp.y + 42, fp.x, fp.y - 26, fp.x + 10, fp.y - 40, fp.x + 20, fp.y - 26, fp.x + 20, fp.y + 42]).stroke({
      width: 2.2,
      color: INK,
    });
  }

  // Grass tufts
  for (let i = 0; i < 22; i++) {
    const gx = 70 + ((i * 223) % 1780);
    const gy = 260 + ((i * 73) % 360);
    const col = night ? '#486234' : '#6B883A';
    fg.moveTo(gx, gy).lineTo(gx - 4, gy - 11).stroke({ width: 2.2, color: col });
    fg.moveTo(gx + 5, gy).lineTo(gx + 7, gy - 12).stroke({ width: 2.2, color: col });
  }

  // Foreground winding blue-teal river (y: 675..884)
  const bankCol = night ? '#7A6C4B' : '#C9BA8A';
  const riverCol = night ? '#274456' : '#48758C';
  const riverMid = night ? '#32566B' : '#5D8FA8';
  fg.poly([
    0, 725,
    460, 682,
    980, 696,
    1480, 672,
    1920, 704,
    1920, 884,
    0, 884,
  ]).fill(bankCol);
  fg.poly([
    0, 744,
    460, 702,
    980, 716,
    1480, 692,
    1920, 724,
    1920, 884,
    0, 884,
  ]).fill(riverCol);
  fg.poly([
    0, 774,
    460, 738,
    980, 750,
    1480, 728,
    1920, 754,
    1920, 868,
    0, 868,
  ]).fill({ color: riverMid, alpha: 0.45 });
  fg.moveTo(0, 744)
    .lineTo(460, 702)
    .lineTo(980, 716)
    .lineTo(1480, 692)
    .lineTo(1920, 724)
    .stroke({ width: 3, color: INK, alpha: 0.6 });

  // Stone stepping-stone crossing & lily pads in the river
  for (const [sx, sy, rx, ry] of [
    [980, 735, 34, 15],
    [1025, 768, 38, 17],
    [995, 805, 42, 18],
    [1040, 845, 46, 20],
  ]) {
    fg.ellipse(sx, sy, rx, ry).fill(night ? '#6C6D6B' : '#B7B4AC');
    fg.ellipse(sx, sy, rx, ry).stroke({ width: 2.5, color: INK });
  }
  for (const [lx, ly] of [
    [430, 785],
    [485, 810],
    [1520, 772],
    [1640, 815],
  ]) {
    fg.ellipse(lx, ly, 24, 12).fill(night ? '#2E5B3E' : '#58945C');
    fg.ellipse(lx, ly, 24, 12).stroke({ width: 2, color: INK });
  }
}

function paintRoom(bg: Graphics, fg: Graphics, roomId: RoomId, night: boolean): void {
  const room = ROOMS[roomId];
  const floorTop = room.floorTop;
  bg.clear();
  fg.clear();

  if (room.outdoor) {
    drawOutdoorRoom(bg, fg, roomId, floorTop, night);
    return;
  }

  switch (roomId) {
    case 'living':
      drawLivingRoom(bg, fg, floorTop, night);
      break;
    case 'bedroom':
      drawBedroom(bg, fg, floorTop, night);
      break;
    case 'nursery':
      drawNursery(bg, fg, floorTop, night);
      break;
    case 'bathroom':
      drawBathroom(bg, fg, floorTop, night);
      break;
    case 'studio':
      drawStudio(bg, fg, floorTop, night);
      break;
    case 'kitchen':
      drawKitchen(bg, fg, floorTop, night);
      break;
  }
}

function dim(hex: string, factor: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * factor);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export class StageRenderer {
  private app: Application | null = null;
  private host: HTMLElement;
  private callbacks: StageCallbacks;
  private ready = false;
  private destroyed = false;

  private root = new Container();
  private bgDraw = new Graphics();
  private fgDraw = new Graphics();
  private background = new Sprite();
  private skyAnimLayer = new Container();
  private foregroundEnv = new Sprite();
  private sunbeamLayer = new Graphics();
  private bgTex: Texture | null = null;
  private fgTex: Texture | null = null;
  private renderRes = 1;
  private farmLayer = new Container();
  private itemLayer = new Container();
  private actorLayer = new Container();
  private bubbleLayer = new Container();
  private ambientLayer = new Container();
  private fxLayer = new Graphics();
  private labelLayer = new Container();
  private selection = new Graphics();

  private itemNodes = new Map<string, ItemNode>();
  private petNodes = new Map<string, AnimalRigNode>();
  private visitorNodes = new Map<string, AnimalRigNode>();
  private critterNodes = new Map<string, AnimalRigNode>();
  private farmNodes = new Map<string, AnimalRigNode>();
  private humanNodes = new Map<string, HumanRigNode>();
  private bubbleNodes = new Map<string, BubbleNode>();

  private particles: Particle[] = [];
  private labels: FloatingLabel[] = [];
  private moteNodes: MoteNode[] = [];
  private farmRipples: Graphics[] = [];
  private skyActors: SkyActor[] = [];

  private view: StageView | null = null;
  private paintedRoom: RoomId | null = null;
  private paintedNight: boolean | null = null;
  private selectionKey = '';
  private fxHasContent = false;
  private drag: DragState | null = null;
  private lastTapAt = 0;
  private transitionAlpha = 1;
  private steamSpawnAcc = 0;
  private fireflySpawnAcc = 0;

  constructor(host: HTMLElement, callbacks: StageCallbacks) {
    this.host = host;
    this.callbacks = callbacks;
    void this.init();
  }

  private async init(): Promise<void> {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const hostW = Math.max(this.host.clientWidth || 1280, 960);
    this.renderRes = Math.min(2, Math.max(1, (hostW * dpr) / 1920));

    const app = new Application();
    await app.init({
      width: 1920,
      height: 884,
      backgroundAlpha: 0,
      antialias: true,
      resolution: this.renderRes,
      autoDensity: true,
    });
    if (this.destroyed) {
      app.destroy(true);
      return;
    }
    this.app = app;
    app.canvas.setAttribute('aria-label', 'Our Home room');
    app.canvas.style.display = 'block';
    this.host.appendChild(app.canvas);
    app.stage.addChild(this.root);

    // Pre-build 24 persistent dust mote graphics and 6 farm stream ripples once (zero per-frame clear/rebuild).
    for (let i = 0; i < 24; i++) {
      const data: DustMote = {
        x: (i * 137) % 1920,
        y: 120 + ((i * 89) % 700),
        vx: 7 + (i % 5) * 2.5,
        vy: 3 + (i % 3) * 1.6,
        radius: 1.6 + (i % 3) * 0.9,
        phase: i * 0.9,
        alpha: 0.25 + (i % 4) * 0.1,
      };
      const gfx = new Graphics();
      gfx.circle(0, 0, data.radius).fill('#FFFBE4');
      gfx.position.set(data.x, data.y);
      this.ambientLayer.addChild(gfx);
      this.moteNodes.push({ gfx, data });
    }
    for (let i = 0; i < 6; i++) {
      const ripple = new Graphics();
      ripple.moveTo(-42, 0).lineTo(42, 0).stroke({ width: 3, color: '#FFFFFF' });
      ripple.visible = false;
      this.ambientLayer.addChild(ripple);
      this.farmRipples.push(ripple);
    }

    this.root.addChild(
      this.background,
      this.skyAnimLayer,
      this.foregroundEnv,
      this.sunbeamLayer,
      this.farmLayer,
      this.itemLayer,
      this.actorLayer,
      this.bubbleLayer,
      this.ambientLayer,
      this.fxLayer,
      this.labelLayer,
      this.selection,
    );
    app.stage.eventMode = 'static';
    app.stage.hitArea = { contains: (x: number, y: number) => x >= 0 && x <= 1920 && y >= 0 && y <= 884 };
    app.stage.on('pointerdown', this.onStageDown);
    app.stage.on('pointermove', this.onStageMove);
    app.stage.on('pointerup', this.onStageUp);
    app.stage.on('pointerupoutside', this.onStageUp);
    app.ticker.maxFPS = 30;
    app.ticker.add(this.onTick);
    this.ready = true;
    this.rebuildAll();
  }

  update(view: StageView): void {
    const prevRoom = this.view?.roomId;
    this.view = view;
    if (prevRoom && prevRoom !== view.roomId) {
      this.transitionAlpha = 0.22;
      this.particles = [];
      this.fxLayer.clear();
      this.fxHasContent = false;
      for (const l of this.labels) l.text.destroy();
      this.labels = [];
    }
    if (this.ready) this.rebuildAll();
  }

  destroy(): void {
    this.destroyed = true;
    this.bgTex?.destroy(true);
    this.fgTex?.destroy(true);
    this.bgTex = null;
    this.fgTex = null;
    this.bgDraw.destroy();
    this.fgDraw.destroy();
    if (this.app) {
      this.app.ticker.remove(this.onTick);
      this.app.stage.off('pointerdown', this.onStageDown);
      this.app.stage.off('pointermove', this.onStageMove);
      this.app.stage.off('pointerup', this.onStageUp);
      this.app.destroy(true, { children: true });
      this.app = null;
    }
    this.host.innerHTML = '';
  }

  private rebuildAll(): void {
    if (!this.view) return;
    const { roomId, night } = this.view;
    if (this.paintedRoom !== roomId || this.paintedNight !== night) {
      paintRoom(this.bgDraw, this.fgDraw, roomId, night);
      if (this.app) {
        const frame = new Rectangle(0, 0, 1920, 884);
        this.bgTex?.destroy(true);
        this.fgTex?.destroy(true);
        this.bgTex = this.app.renderer.generateTexture({
          target: this.bgDraw,
          frame,
          resolution: this.renderRes,
          antialias: true,
        });
        this.fgTex = this.app.renderer.generateTexture({
          target: this.fgDraw,
          frame,
          resolution: this.renderRes,
          antialias: true,
        });
        this.background.texture = this.bgTex;
        this.foregroundEnv.texture = this.fgTex;
        this.bgDraw.clear();
        this.fgDraw.clear();
      }
      this.rebuildSkyAndSunbeams(roomId, night);
      this.paintedRoom = roomId;
      this.paintedNight = night;
    }
    this.syncFarm();
    this.syncItems();
    this.syncActors();
    this.syncBubbles();
    this.syncSelection();
  }

  private rebuildSkyAndSunbeams(roomId: RoomId, night: boolean): void {
    this.skyAnimLayer.removeChildren().forEach((c) => c.destroy());
    this.skyActors = [];
    this.sunbeamLayer.clear();
    this.sunbeamLayer.alpha = 1;

    const room = ROOMS[roomId];
    if (room.outdoor) {
      if (night) {
        for (let i = 0; i < 24; i++) {
          const sx = (i * 173 + 90) % 1880;
          const sy = 36 + ((i * 97) % 260);
          const gfx = new Graphics();
          gfx.circle(0, 0, i % 3 === 0 ? 3 : 2).fill('#FBF7EC');
          gfx.position.set(sx, sy);
          this.skyAnimLayer.addChild(gfx);
          this.skyActors.push({ gfx, kind: 'star', x0: sx, y: sy, speed: 1.7, phase: i * 1.3 });
        }
      } else {
        const clouds: [number, number, number, number][] = [
          [420, 110, 1, 10],
          [920, 86, 0.82, 7.5],
          [1280, 146, 1.08, 12],
          [1760, 96, 0.9, 8.5],
        ];
        for (const [cx0, cy, s, spd] of clouds) {
          const gfx = new Graphics();
          gfx.ellipse(0, 6, 118 * s, 28 * s).fill({ color: '#D8E6EC', alpha: 0.6 });
          gfx.ellipse(0, 0, 116 * s, 28 * s).fill('#FBF7EC');
          gfx.ellipse(-36 * s, -12 * s, 56 * s, 24 * s).fill('#FFFFFF');
          gfx.ellipse(34 * s, -10 * s, 64 * s, 26 * s).fill('#FBF7EC');
          gfx.position.set(cx0, cy);
          this.skyAnimLayer.addChild(gfx);
          this.skyActors.push({ gfx, kind: 'cloud', x0: cx0, y: cy, speed: spd, phase: 0 });
        }
      }
      return;
    }

    const win = WINDOWS[roomId];
    if (!win) return;
    const [wx, wy, ww, wh] = win;

    if (night) {
      for (let i = 0; i < 8; i++) {
        const sx = wx + 18 + ((i * 43) % Math.max(20, ww - 36));
        const sy = wy + 16 + ((i * 29) % Math.max(24, wh * 0.56));
        const gfx = new Graphics();
        gfx.circle(0, 0, i % 2 === 0 ? 2.3 : 1.5).fill('#FBF7EC');
        gfx.position.set(sx, sy);
        this.skyAnimLayer.addChild(gfx);
        this.skyActors.push({ gfx, kind: 'star', x0: sx, y: sy, speed: 2.1, phase: i * 1.7 });
      }
    } else {
      const cy = wy + wh * 0.25;
      const gfx = new Graphics();
      gfx.ellipse(0, 0, 22, 9).fill('#FBF7EC');
      gfx.ellipse(9, -3, 15, 9).fill('#FFFFFF');
      gfx.position.set(wx + Math.min(ww - 26, Math.max(26, ww * 0.4)), cy);
      this.skyAnimLayer.addChild(gfx);
      this.skyActors.push({ gfx, kind: 'windowCloud', x0: 0, y: cy, speed: 6, phase: 0, winX: wx, winW: ww });
    }

    const beamColor = night ? '#B8D0F0' : '#FFF6D6';
    this.sunbeamLayer
      .poly([
        wx + 6, wy + wh + 20,
        wx + ww - 6, wy + wh + 20,
        wx + ww + 90, wy + wh + 160,
        wx - 14, wy + wh + 160,
      ])
      .fill({ color: beamColor, alpha: night ? 0.035 : 0.08 });
    this.sunbeamLayer
      .poly([
        wx + 6, wy + wh + 20,
        wx + ww - 6, wy + wh + 20,
        wx + ww + 135, wy + wh + 235,
        wx - 24, wy + wh + 235,
      ])
      .fill({ color: beamColor, alpha: night ? 0.025 : 0.052 });
    this.sunbeamLayer
      .poly([
        wx + 6, wy + wh + 20,
        wx + ww - 6, wy + wh + 20,
        wx + ww + 175, wy + wh + 305,
        wx - 32, wy + wh + 305,
      ])
      .fill({ color: beamColor, alpha: night ? 0.015 : 0.03 });
  }

  private onRefresh = (): void => {
    if (!this.destroyed) this.rebuildAll();
  };

  private spawnBurst(
    x: number,
    y: number,
    kind: Particle['kind'],
    count: number,
    colors: string[],
    speed = 110,
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + ((i / Math.max(1, count - 1)) - 0.5) * Math.PI * 1.4 + (Math.random() - 0.5) * 0.4;
      const spd = speed * (0.55 + Math.random() * 0.7);
      this.particles.push({
        kind,
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - (kind === 'heart' ? 35 : 0),
        age: 0,
        life: 0.7 + Math.random() * 0.45,
        size: kind === 'dust' ? 8 + Math.random() * 7 : 10 + Math.random() * 7,
        color: colors[i % colors.length],
        alpha: 1,
        rot: (Math.random() - 0.5) * 0.6,
        vrot: (Math.random() - 0.5) * 2.5,
      });
    }
  }

  private spawnRing(x: number, y: number, color: string, size = 76): void {
    this.particles.push({
      kind: 'ring',
      x,
      y,
      vx: 0,
      vy: 0,
      age: 0,
      life: 0.48,
      size,
      color,
      alpha: 0.85,
      rot: 0,
      vrot: 0,
    });
  }

  private spawnLabel(x: number, y: number, content: string, color = '#C5483A'): void {
    const text = new Text({
      text: content,
      style: {
        fontFamily: 'Fredoka, Nunito, sans-serif',
        fontSize: 30,
        fontWeight: '700',
        fill: color,
        stroke: { color: '#FFFDF8', width: 5 },
      },
    });
    text.anchor.set(0.5);
    text.position.set(x, y);
    this.labelLayer.addChild(text);
    this.labels.push({ text, age: 0, life: 1.05, vy: -72, baseX: x });
  }

  private syncFarm(): void {
    this.farmLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    const view = this.view;
    if (!view || view.roomId !== 'farm') return;

    const nowMs = Date.now();
    const plots = view.state.farm.plots;
    const gridCoords = [
      { x: 1235, y: 360 },
      { x: 1435, y: 360 },
      { x: 1635, y: 360 },
      { x: 1235, y: 505 },
      { x: 1435, y: 505 },
      { x: 1635, y: 505 },
    ];

    plots.forEach((plot, i) => {
      const pos = gridCoords[i] ?? { x: 1235 + (i % 3) * 200, y: 360 + Math.floor(i / 3) * 145 };
      const card = new Container();
      card.position.set(pos.x, pos.y);
      card.eventMode = 'static';
      card.cursor = 'pointer';

      const g = new Graphics();
      const ready = !!plot.cropId && !!plot.readyAt && plot.readyAt <= nowMs;
      const crop = plot.cropId ? CROPS_BY_ID[plot.cropId] : undefined;

      // Ground patch (inspired by tile_farm_soil_plot_sample.png & IMG_2707)
      g.roundRect(-78, -46, 156, 92, 14).fill({ color: '#2B2521', alpha: 0.14 });
      if (!plot.unlocked) {
        g.roundRect(-78, -50, 156, 92, 14).fill(view.night ? '#465A38' : '#7D9949');
        g.roundRect(-78, -50, 156, 92, 14).stroke({ width: 2.8, color: INK, alpha: 0.55 });
        // Golden padlock badge
        g.roundRect(-14, -10, 28, 22, 5).fill('#E9C65B');
        g.roundRect(-14, -10, 28, 22, 5).stroke({ width: 2.4, color: INK });
        g.arc(0, -10, 9, Math.PI, 0).stroke({ width: 3, color: INK });
      } else {
        g.roundRect(-78, -50, 156, 92, 14).fill(view.night ? '#6C643C' : '#B2AC68');
        g.roundRect(-78, -50, 156, 92, 14).stroke({ width: 3, color: INK });
        g.roundRect(-66, -38, 132, 68, 10).fill(view.night ? '#59422C' : '#8A6743');
        g.roundRect(-66, -38, 132, 68, 10).stroke({ width: 2, color: '#5E4226' });
        for (const fy of [-20, -4, 12]) {
          g.moveTo(-54, fy).lineTo(54, fy).stroke({ width: 2.2, color: '#5E4226', alpha: 0.72 });
        }

        if (crop) {
          const totalMs = Math.max(1, crop.minutes * 60_000);
          const remMs = Math.max(0, (plot.readyAt ?? nowMs) - nowMs);
          const progress = ready ? 1 : Math.max(0.25, Math.min(0.95, 1 - remMs / totalMs));
          const leafCol = crop.colors[1] ?? '#6E8A55';
          const fruitCol = crop.colors[0] ?? '#C4483B';

          for (const px of [-36, 0, 36]) {
            const s = 0.55 + progress * 0.55;
            g.circle(px - 7 * s, -8 * s, 11 * s).fill(leafCol);
            g.circle(px - 7 * s, -8 * s, 11 * s).stroke({ width: 2, color: INK });
            g.circle(px + 7 * s, -8 * s, 11 * s).fill(leafCol);
            g.circle(px + 7 * s, -8 * s, 11 * s).stroke({ width: 2, color: INK });
            g.circle(px, -16 * s, 12 * s).fill(leafCol);
            g.circle(px, -16 * s, 12 * s).stroke({ width: 2, color: INK });
            if (ready) {
              g.circle(px - 4, -10, 5.5).fill(fruitCol);
              g.circle(px - 4, -10, 5.5).stroke({ width: 1.6, color: INK });
              g.circle(px + 5, -18, 5).fill(fruitCol);
              g.circle(px + 5, -18, 5).stroke({ width: 1.6, color: INK });
            }
          }

          if (ready) {
            g.circle(56, -42, 16).fill('#FCE79C');
            g.circle(56, -42, 16).stroke({ width: 2.4, color: INK });
            g.poly([56, -52, 59, -45, 66, -42, 59, -39, 56, -32, 53, -39, 46, -42, 53, -45]).fill('#C4483B');
          }
        }
      }

      card.addChild(g);
      card.on('pointerdown', (event) => {
        event.stopPropagation();
        if (ready && crop) {
          this.spawnBurst(pos.x, pos.y - 24, 'sparkle', 7, ['#E9C65B', crop.colors[0], '#FFFDF8'], 110);
          this.spawnLabel(pos.x, pos.y - 52, `+ ${crop.name}`, '#6E8A55');
          useGameStore.getState().harvestPlot(plot.id);
        } else {
          useGameStore.getState().openOverlay('farm');
        }
      });
      this.farmLayer.addChild(card);
    });
  }

  private syncItems(): void {
    const view = this.view;
    if (!view) return;
    const items = view.state.placed.filter((p) => p.roomId === view.roomId);
    const alive = new Set(items.map((p) => p.uid));
    for (const [uid, node] of this.itemNodes) {
      if (!alive.has(uid)) {
        node.container.destroy({ children: true });
        this.itemNodes.delete(uid);
      }
    }
    for (const placed of items) {
      const def = ITEMS_BY_ID[placed.itemId];
      if (!def) continue;
      let node = this.itemNodes.get(placed.uid);
      const art = itemArt(def);
      const rawSprite = def.sprite ?? ITEM_SPRITE_FALLBACK[def.id];
      const spriteUrl = rawSprite ? normalizePackUrl(rawSprite) : null;
      const pngTex = spriteUrl ? requestImageTexture(spriteUrl, this.onRefresh) : null;
      const svgTex = pngTex ? null : requestTexture(`item:${def.id}`, art.body, art.w, art.h, this.onRefresh);
      const texture = pngTex ?? svgTex;
      const usesPng = !!pngTex;
      const targetH = pngTex
        ? (def.width * pngTex.height) / Math.max(1, pngTex.width)
        : (def.width * art.h) / art.w;

      if (!node) {
        const container = new Container();
        const glow = new Graphics();
        const sprite = new Sprite(texture ?? Texture.WHITE);
        sprite.anchor.set(0.5, 1);
        const overlay = new Graphics();
        container.addChild(glow, sprite, overlay);
        container.eventMode = 'static';
        container.cursor = 'pointer';
        node = {
          container,
          sprite,
          overlay,
          glow,
          itemId: placed.itemId,
          artKind: def.art,
          placed,
          popTimer: 0.42,
          baseW: def.width,
          baseH: targetH,
          usesPng,
          glowKey: '',
          overlayKey: '',
        };
        const currentNode = node;
        container.on('pointerdown', (event) => this.onItemDown(event, currentNode));
        this.itemLayer.addChild(container);
        this.itemNodes.set(placed.uid, node);
      } else if (
        node.itemId !== placed.itemId ||
        node.placed.x !== placed.x ||
        node.placed.y !== placed.y ||
        node.placed.flip !== placed.flip
      ) {
        node.popTimer = 0.36;
        if (node.itemId !== placed.itemId || node.placed.x !== placed.x || node.placed.y !== placed.y) {
          this.spawnBurst(placed.x, placed.y - 6, 'dust', 6, ['#EFE7D6', '#FBF7EC'], 65);
        }
      }

      node.itemId = placed.itemId;
      node.artKind = def.art;
      node.placed = placed;
      node.baseW = def.width;
      node.baseH = targetH;
      node.usesPng = usesPng;
      node.sprite.texture = texture ?? Texture.WHITE;
      node.sprite.tint = texture ? 0xffffff : 0xf3efe0;
      node.sprite.visible = !!texture;
      node.sprite.width = def.width;
      node.sprite.height = targetH;
      node.sprite.scale.x = placed.flip ? -Math.abs(node.sprite.scale.x) : Math.abs(node.sprite.scale.x);
      node.overlay.scale.x = placed.flip ? -1 : 1;
      node.container.x = placed.x;
      node.container.y = placed.y;
      node.container.alpha = 1;
      node.container.zIndex = placed.hostUid ? 9000 + placed.y : isFlatItem(placed.itemId) ? placed.y - 10_000 : placed.y;
      this.syncItemVisualDecoration(node, view.night);
    }
    this.itemLayer.sortableChildren = true;
  }

  private syncItemVisualDecoration(node: ItemNode, night: boolean): void {
    const isLamp = node.artKind === 'floorLamp' || node.artKind === 'tableLamp' || node.artKind === 'lantern';
    const nextGlowKey = `${node.usesPng}:${node.artKind}:${Math.round(node.baseW)}:${Math.round(node.baseH)}:${night}`;
    if (node.glowKey !== nextGlowKey) {
      node.glowKey = nextGlowKey;
      node.glow.clear();
      node.glow.alpha = 1;
      if (node.usesPng) {
        node.glow.ellipse(0, -4, node.baseW * 0.36, 9).fill({ color: '#2B2521', alpha: 0.14 });
      }
      if (isLamp) {
        const gy = node.artKind === 'floorLamp' ? -node.baseH * 0.72 : -node.baseH * 0.62;
        const rOuter = node.baseW * (night ? 1.55 : 0.95);
        node.glow.circle(0, gy, rOuter).fill({ color: '#FCE79C', alpha: night ? 0.16 : 0.07 });
        node.glow.circle(0, gy, rOuter * 0.56).fill({ color: '#FFF6CC', alpha: night ? 0.22 : 0.09 });
      }
    }

    const nextOverlayKey = `${node.itemId}:${node.artKind}:${Math.round(node.baseW)}:${Math.round(node.baseH)}`;
    if (node.overlayKey !== nextOverlayKey) {
      node.overlayKey = nextOverlayKey;
      node.overlay.clear();
      node.overlay.removeChildren().forEach((c) => c.destroy());
      node.overlayParts = undefined;

      if (node.artKind === 'wallClock') {
        const cx = 0;
        const cy = -node.baseH * 0.5;
        const r = node.baseW * (19 / 68);
        const palName = ITEMS_BY_ID[node.itemId]?.palette ?? 'cream';
        const dialColor = PALETTES[palName]?.second ?? '#E4D9C2';
        node.overlay.circle(cx, cy, r).fill(dialColor);

        const hour = new Graphics();
        hour.moveTo(0, 0).lineTo(r * 0.58, 0).stroke({ width: 3, color: INK });
        hour.position.set(cx, cy);

        const min = new Graphics();
        min.moveTo(0, 0).lineTo(r * 0.84, 0).stroke({ width: 2.3, color: INK });
        min.position.set(cx, cy);

        const sec = new Graphics();
        sec.moveTo(0, 0).lineTo(r * 0.94, 0).stroke({ width: 1.4, color: '#C4483B' });
        sec.position.set(cx, cy);

        const pin = new Graphics();
        pin.circle(cx, cy, 3).fill('#C4483B');

        node.overlay.addChild(hour, min, sec, pin);
        node.overlayParts = { hour, min, sec };
      } else if (node.artKind === 'pool' || node.artKind === 'fountain') {
        const cy = node.artKind === 'pool' ? -node.baseH * 0.5 : -node.baseH * 0.35;
        const ripple = new Graphics();
        ripple.ellipse(0, 0, node.baseW * 0.36, node.baseH * 0.15).stroke({ width: 2, color: '#FFFFFF' });
        ripple.position.set(0, cy);
        node.overlay.addChild(ripple);
        node.overlayParts = { ripple };
      } else if (node.artKind === 'windmill') {
        const hubY = -node.baseH * 0.68;
        const armLen = node.baseW * 0.36;
        const blades = new Graphics();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          blades.moveTo(0, 0).lineTo(Math.cos(a) * armLen, Math.sin(a) * armLen).stroke({ width: 4, color: '#7A5A3C', alpha: 0.7 });
        }
        blades.position.set(0, hubY);
        node.overlay.addChild(blades);
        node.overlayParts = { blades };
      }
    }
  }

  private mountAnimalVisual(
    node: { rig: Container; sprites: RigSprites; pngSprite?: Sprite; pngShadow?: Graphics; pngUrl?: string; pngW?: number; pngH?: number },
    key: string,
    parts: AnimalRigParts,
    pngUrl: string | undefined,
  ): void {
    node.rig.removeChildren().forEach((c) => c.destroy());
    node.pngSprite = undefined;
    node.pngShadow = undefined;
    node.pngUrl = undefined;
    node.pngW = undefined;
    node.pngH = undefined;
    node.sprites = {};

    const pngTex = pngUrl ? requestImageTexture(pngUrl, this.onRefresh) : null;
    if (pngUrl && pngTex) {
      const shadow = new Graphics();
      shadow.ellipse(0, -4, pngTex.width * 0.36, Math.max(7, pngTex.height * 0.08)).fill({ color: '#2B2521', alpha: 0.16 });
      const sprite = new Sprite(pngTex);
      sprite.anchor.set(0.5, 1);
      node.rig.addChild(shadow, sprite);
      node.pngShadow = shadow;
      node.pngSprite = sprite;
      node.pngUrl = pngUrl;
      node.pngW = pngTex.width;
      node.pngH = pngTex.height;
      return;
    }

    node.sprites = {
      shadow: mountRigPart(node.rig, `${key}:shadow`, parts.shadow, this.onRefresh),
      backTail: mountRigPart(node.rig, `${key}:tail`, parts.backTail, this.onRefresh),
      farLegs: mountRigPart(node.rig, `${key}:farLegs`, parts.farLegs, this.onRefresh),
      body: mountRigPart(node.rig, `${key}:body`, parts.body, this.onRefresh),
      nearLegBack: mountRigPart(node.rig, `${key}:nearLegBack`, parts.nearLegBack, this.onRefresh),
      nearLegFront: mountRigPart(node.rig, `${key}:nearLegFront`, parts.nearLegFront, this.onRefresh),
      wingL: mountRigPart(node.rig, `${key}:wingL`, parts.wingL, this.onRefresh),
      wingR: mountRigPart(node.rig, `${key}:wingR`, parts.wingR, this.onRefresh),
      wing: mountRigPart(node.rig, `${key}:wing`, parts.wing, this.onRefresh),
      head: mountRigPart(node.rig, `${key}:head`, parts.head, this.onRefresh),
      eyesOpen: mountRigPart(node.rig, `${key}:eyesOpen`, parts.eyesOpen, this.onRefresh),
      eyesClosed: mountRigPart(node.rig, `${key}:eyesClosed`, parts.eyesClosed, this.onRefresh),
    };
    if (node.sprites.eyesClosed) node.sprites.eyesClosed.visible = false;
  }

  private buildAnimalRig(
    key: string,
    parts: AnimalRigParts,
    targetSize: number,
    species: string,
    pose: 'idle' | 'walk' | 'sleep' | 'special',
    x: number,
    y: number,
    seed: number,
    onTap?: () => void,
    pngUrl?: string,
  ): AnimalRigNode {
    const container = new Container();
    const rig = new Container();
    container.addChild(rig);
    container.x = x;
    container.y = y;

    const node: AnimalRigNode = {
      container,
      rig,
      parts,
      sprites: {},
      cacheKey: key,
      targetSize,
      visX: x,
      visY: y,
      facing: seed % 2 === 0 ? 1 : -1,
      walkPhase: seed * 1.1,
      blinkTimer: 1.5 + (seed % 4),
      blinkLeft: 0,
      zzzTimer: 0.4,
      jumpPop: 0,
      species,
      pose,
      seed,
    };

    this.mountAnimalVisual(node, key, parts, pngUrl);

    if (onTap) {
      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.on('pointerdown', (event) => {
        event.stopPropagation();
        onTap();
      });
    }

    const baseScale = node.pngW ? targetSize / node.pngW : targetSize / parts.w;
    rig.scale.set(baseScale);

    return node;
  }

  private refreshAnimalRig(
    node: AnimalRigNode,
    key: string,
    parts: AnimalRigParts,
    pose: 'idle' | 'walk' | 'sleep' | 'special',
    pngUrl?: string,
  ): void {
    const readyPng = pngUrl ? requestImageTexture(pngUrl, this.onRefresh) : null;
    const effectivePngUrl = readyPng ? pngUrl : undefined;

    if (node.cacheKey !== key || node.pngUrl !== effectivePngUrl) {
      node.parts = parts;
      node.cacheKey = key;
      node.pose = pose;
      this.mountAnimalVisual(node, key, parts, pngUrl);
      return;
    }

    node.pose = pose;
    if (node.pngSprite) return;

    updateRigPartTexture(node.sprites.shadow, `${key}:shadow`, parts.shadow, this.onRefresh);
    updateRigPartTexture(node.sprites.backTail, `${key}:tail`, parts.backTail, this.onRefresh);
    updateRigPartTexture(node.sprites.farLegs, `${key}:farLegs`, parts.farLegs, this.onRefresh);
    updateRigPartTexture(node.sprites.body, `${key}:body`, parts.body, this.onRefresh);
    updateRigPartTexture(node.sprites.nearLegBack, `${key}:nearLegBack`, parts.nearLegBack, this.onRefresh);
    updateRigPartTexture(node.sprites.nearLegFront, `${key}:nearLegFront`, parts.nearLegFront, this.onRefresh);
    updateRigPartTexture(node.sprites.wingL, `${key}:wingL`, parts.wingL, this.onRefresh);
    updateRigPartTexture(node.sprites.wingR, `${key}:wingR`, parts.wingR, this.onRefresh);
    updateRigPartTexture(node.sprites.wing, `${key}:wing`, parts.wing, this.onRefresh);
    updateRigPartTexture(node.sprites.head, `${key}:head`, parts.head, this.onRefresh);
    updateRigPartTexture(node.sprites.eyesOpen, `${key}:eyesOpen`, parts.eyesOpen, this.onRefresh);
    updateRigPartTexture(node.sprites.eyesClosed, `${key}:eyesClosed`, parts.eyesClosed, this.onRefresh);
  }

  private buildHumanRig(
    key: string,
    parts: CharacterRigParts,
    targetW: number,
    pose: 'idle' | 'read' | 'cook' | 'paint',
    x: number,
    y: number,
    seed: number,
  ): HumanRigNode {
    const container = new Container();
    const rig = new Container();
    container.addChild(rig);
    container.position.set(x, y);
    container.zIndex = y;

    const sprites: RigSprites = {
      shadow: mountRigPart(rig, `${key}:shadow`, parts.shadow, this.onRefresh),
      hairBack: mountRigPart(rig, `${key}:hairBack`, parts.hairBack, this.onRefresh),
      legs: mountRigPart(rig, `${key}:legs`, parts.legs, this.onRefresh),
      backArm: mountRigPart(rig, `${key}:backArm`, parts.backArm, this.onRefresh),
      body: mountRigPart(rig, `${key}:body`, parts.body, this.onRefresh),
      head: mountRigPart(rig, `${key}:head`, parts.head, this.onRefresh),
      eyesOpen: mountRigPart(rig, `${key}:eyesOpen`, parts.eyesOpen, this.onRefresh),
      eyesClosed: mountRigPart(rig, `${key}:eyesClosed`, parts.eyesClosed, this.onRefresh),
      frontArm: mountRigPart(rig, `${key}:frontArm`, parts.frontArm, this.onRefresh),
    };
    if (sprites.eyesClosed) sprites.eyesClosed.visible = false;

    const baseScale = targetW / parts.w;
    rig.scale.set(baseScale);

    const node: HumanRigNode = {
      container,
      rig,
      parts,
      sprites,
      cacheKey: key,
      targetW,
      pose,
      blinkTimer: 2 + (seed % 3),
      blinkLeft: 0,
      wavePop: 0,
      seed,
      x,
      y,
    };

    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerdown', (event) => {
      event.stopPropagation();
      node.wavePop = 0.55;
      this.spawnBurst(node.x, node.y - 165, 'heart', 4, ['#E8A6B0', '#E9C65B'], 85);
    });

    return node;
  }

  private refreshHumanRig(
    node: HumanRigNode,
    key: string,
    parts: CharacterRigParts,
    pose: 'idle' | 'read' | 'cook' | 'paint',
    x: number,
    y: number,
  ): void {
    node.x = x;
    node.y = y;
    node.container.position.set(x, y);
    node.container.zIndex = y;
    node.pose = pose;
    if (node.cacheKey !== key) {
      node.rig.removeChildren().forEach((c) => c.destroy());
      node.parts = parts;
      node.cacheKey = key;
      node.sprites = {
        shadow: mountRigPart(node.rig, `${key}:shadow`, parts.shadow, this.onRefresh),
        hairBack: mountRigPart(node.rig, `${key}:hairBack`, parts.hairBack, this.onRefresh),
        legs: mountRigPart(node.rig, `${key}:legs`, parts.legs, this.onRefresh),
        backArm: mountRigPart(node.rig, `${key}:backArm`, parts.backArm, this.onRefresh),
        body: mountRigPart(node.rig, `${key}:body`, parts.body, this.onRefresh),
        head: mountRigPart(node.rig, `${key}:head`, parts.head, this.onRefresh),
        eyesOpen: mountRigPart(node.rig, `${key}:eyesOpen`, parts.eyesOpen, this.onRefresh),
        eyesClosed: mountRigPart(node.rig, `${key}:eyesClosed`, parts.eyesClosed, this.onRefresh),
        frontArm: mountRigPart(node.rig, `${key}:frontArm`, parts.frontArm, this.onRefresh),
      };
      if (node.sprites.eyesClosed) node.sprites.eyesClosed.visible = false;
      return;
    }

    updateRigPartTexture(node.sprites.shadow, `${key}:shadow`, parts.shadow, this.onRefresh);
    updateRigPartTexture(node.sprites.hairBack, `${key}:hairBack`, parts.hairBack, this.onRefresh);
    updateRigPartTexture(node.sprites.legs, `${key}:legs`, parts.legs, this.onRefresh);
    updateRigPartTexture(node.sprites.backArm, `${key}:backArm`, parts.backArm, this.onRefresh);
    updateRigPartTexture(node.sprites.body, `${key}:body`, parts.body, this.onRefresh);
    updateRigPartTexture(node.sprites.head, `${key}:head`, parts.head, this.onRefresh);
    updateRigPartTexture(node.sprites.eyesOpen, `${key}:eyesOpen`, parts.eyesOpen, this.onRefresh);
    updateRigPartTexture(node.sprites.eyesClosed, `${key}:eyesClosed`, parts.eyesClosed, this.onRefresh);
    updateRigPartTexture(node.sprites.frontArm, `${key}:frontArm`, parts.frontArm, this.onRefresh);
  }

  private syncActors(): void {
    const view = this.view;
    if (!view) return;
    const state = view.state;

    // 1. Humans & baby
    const humanSpots: Partial<
      Record<RoomId, { charIndex: 0 | 1 | 'baby'; x: number; y: number; pose?: 'idle' | 'read' | 'cook' | 'paint' }[]>
    > = {
      living: [{ charIndex: 0, x: 525, y: 768, pose: 'read' }],
      bedroom: [{ charIndex: 1, x: 1090, y: 764, pose: 'read' }],
      kitchen: [{ charIndex: 0, x: 600, y: 768, pose: 'cook' }],
      studio: [{ charIndex: 1, x: 740, y: 768, pose: 'paint' }],
      porch: [{ charIndex: 0, x: 1090, y: 774, pose: 'idle' }],
      garden: [{ charIndex: 1, x: 820, y: 782, pose: 'idle' }],
      nursery: [
        { charIndex: 0, x: 780, y: 768, pose: 'idle' },
        ...(state.settings.showBaby ? [{ charIndex: 'baby' as const, x: 900, y: 776 }] : []),
      ],
    };
    const activeHumans = humanSpots[view.roomId] ?? [];
    const humanAlive = new Set(activeHumans.map((h) => `human:${view.roomId}:${h.charIndex}`));
    for (const [id, node] of this.humanNodes) {
      if (!humanAlive.has(id)) {
        node.container.destroy({ children: true });
        this.humanNodes.delete(id);
      }
    }
    for (const h of activeHumans) {
      const id = `human:${view.roomId}:${h.charIndex}`;
      let key: string;
      let parts: CharacterRigParts;
      let targetW: number;
      const pose = h.pose ?? 'idle';
      if (h.charIndex === 'baby') {
        const c0 = state.characters[0];
        key = `baby:${c0.skin}:${c0.outfit}:${c0.hair}`;
        parts = babyRigParts({ skin: c0.skin, outfit: c0.outfit, hair: c0.hair });
        targetW = 86;
      } else {
        const look = state.characters[h.charIndex];
        key = `char:${look.skin}:${look.hair}:${look.hairStyle}:${look.outfit}:${pose}`;
        parts = characterRigParts({
          skin: look.skin,
          hair: look.hair,
          hairStyle: look.hairStyle,
          outfit: look.outfit,
          pose,
        });
        targetW = 128;
      }
      const existing = this.humanNodes.get(id);
      if (!existing) {
        const node = this.buildHumanRig(id, parts, targetW, pose, h.x, h.y, id.length * 1.7);
        this.actorLayer.addChild(node.container);
        this.humanNodes.set(id, node);
      } else {
        this.refreshHumanRig(existing, key, parts, pose, h.x, h.y);
      }
    }

    // 2. Pets
    const pets = state.pets.filter((p) => p.roomId === view.roomId);
    const petAlive = new Set(pets.map((p) => p.id));
    for (const [id, node] of this.petNodes) {
      if (!petAlive.has(id)) {
        node.container.destroy({ children: true });
        this.petNodes.delete(id);
      }
    }
    for (const pet of pets) {
      const pose: 'idle' | 'walk' | 'sleep' = pet.state === 'sleep' ? 'sleep' : pet.state === 'walk' ? 'walk' : 'idle';
      // Always render standing rig for walk/idle (since legs animate live!), and sleeping curled rig for sleep
      const svgPose: 'idle' | 'sleep' = pose === 'sleep' ? 'sleep' : 'idle';
      const pngUrl = animalPngFor(pet.species, pet.coat, pose) ?? undefined;
      const key = `petRig:${pet.species}:${pet.coat}:${svgPose}`;
      const parts = animalRigParts({ species: pet.species, coat: pet.coat, pose: svgPose });
      const targetSize = pet.species === 'bird' ? 86 : 138;
      const existing = this.petNodes.get(pet.id);
      if (!existing) {
        const node = this.buildAnimalRig(key, parts, targetSize, pet.species, pose, pet.x, pet.y + 6, pet.name.length + pet.id.length, () => {
          const hit = this.petNodes.get(pet.id);
          if (hit) {
            hit.jumpPop = 0.45;
            this.spawnBurst(hit.visX, hit.visY - 75, 'heart', 5, ['#E8A6B0', '#E9C65B'], 95);
          }
          this.callbacks.onPet(pet.id);
        }, pngUrl);
        node.container.zIndex = pet.y + 10;
        this.actorLayer.addChild(node.container);
        this.petNodes.set(pet.id, node);
      } else {
        this.refreshAnimalRig(existing, key, parts, pose, pngUrl);
      }
    }

    // 3. Visitors
    const visitors = state.visitors.active.filter((v) => v.roomId === view.roomId);
    const visitorAlive = new Set(visitors.map((v) => v.id));
    for (const [id, node] of this.visitorNodes) {
      if (!visitorAlive.has(id)) {
        node.container.destroy({ children: true });
        this.visitorNodes.delete(id);
      }
    }
    for (const visitor of visitors) {
      const def = VISITORS_BY_ID[visitor.visitorId];
      if (!def) continue;
      const pngUrl = animalPngFor(def.species, def.coat, 'idle') ?? undefined;
      const key = `visitorRig:${def.species}:${def.coat}`;
      const parts = animalRigParts({ species: def.species, coat: def.coat, pose: 'idle' });
      const existing = this.visitorNodes.get(visitor.id);
      if (!existing) {
        const node = this.buildAnimalRig(key, parts, 138, def.species, 'idle', visitor.x, visitor.y + 8, visitor.id.length, () => {
          const hit = this.visitorNodes.get(visitor.id);
          if (hit) {
            hit.jumpPop = 0.45;
            this.spawnBurst(hit.visX, hit.visY - 80, 'sparkle', 6, ['#E9C65B', '#E8A6B0'], 90);
          }
          this.callbacks.onVisitor(visitor.id);
        }, pngUrl);
        node.container.zIndex = visitor.y + 12;
        this.actorLayer.addChild(node.container);
        this.visitorNodes.set(visitor.id, node);
      } else {
        this.refreshAnimalRig(existing, key, parts, 'idle', pngUrl);
        existing.visX = visitor.x;
        existing.visY = visitor.y + 8;
        existing.container.zIndex = visitor.y + 12;
      }
    }

    // 4. Critters
    const critterSpots = ROOMS[view.roomId].critterSpots;
    const critterAlive = new Set(critterSpots.map((c) => c.id));
    for (const [id, node] of this.critterNodes) {
      if (!critterAlive.has(id)) {
        node.container.destroy({ children: true });
        this.critterNodes.delete(id);
      }
    }
    for (const spot of critterSpots) {
      const key = `critterRig:${spot.kind}`;
      const parts = animalRigParts({ species: spot.kind, coat: spot.kind === 'bee' ? 'golden' : 'brown', pose: 'idle' });
      const size = spot.kind === 'owl' ? 114 : spot.kind === 'hedgehog' ? 88 : 60;
      const existing = this.critterNodes.get(spot.id);
      if (!existing) {
        const node = this.buildAnimalRig(key, parts, size, spot.kind, 'idle', spot.x, spot.y, spot.id.length + spot.x * 0.01);
        node.container.zIndex = spot.y;
        this.actorLayer.addChild(node.container);
        this.critterNodes.set(spot.id, node);
      } else {
        this.refreshAnimalRig(existing, key, parts, 'idle');
      }
    }

    // 5. Farm producers (Daisy the cow & Pip the hen)
    if (view.roomId !== 'farm') {
      for (const node of this.farmNodes.values()) {
        node.container.destroy({ children: true });
      }
      this.farmNodes.clear();
    } else {
      const nowMs = Date.now();
      const producerSpecs: {
        id: 'cow' | 'hen';
        x: number;
        y: number;
        size: number;
        coat: string;
        yieldLabel: string;
        usePng: boolean;
      }[] = [
        { id: 'cow', x: 410, y: 525, size: 175, coat: 'white', yieldLabel: '+1 Milk', usePng: true },
        { id: 'hen', x: 215, y: 405, size: 88, coat: 'cream', yieldLabel: '+1 Egg', usePng: false },
      ];
      for (const spec of producerSpecs) {
        const ready = (state.farm.producers[spec.id]?.readyAt ?? Infinity) <= nowMs;
        const pngUrl = spec.usePng ? (animalPngFor(spec.id, spec.coat, 'idle') ?? undefined) : undefined;
        const key = `farmRig:${spec.id}`;
        const parts = animalRigParts({ species: spec.id, coat: spec.coat, pose: 'idle' });
        let node = this.farmNodes.get(spec.id);
        if (!node) {
          node = this.buildAnimalRig(
            key,
            parts,
            spec.size,
            spec.id,
            'idle',
            spec.x,
            spec.y,
            spec.id === 'cow' ? 2 : 5,
            () => {
              const hit = this.farmNodes.get(spec.id);
              if (hit) hit.jumpPop = 0.45;
              const store = useGameStore.getState();
              const isReady = (store.state.farm.producers[spec.id]?.readyAt ?? Infinity) <= Date.now();
              if (isReady) {
                this.spawnBurst(spec.x, spec.y - spec.size * 0.55, 'sparkle', 7, ['#E9C65B', '#FFFDF8', '#E8A6B0'], 105);
                this.spawnLabel(spec.x, spec.y - spec.size * 0.85, spec.yieldLabel, '#6E8A55');
                store.collectProducer(spec.id);
              } else {
                store.openOverlay('farm');
              }
            },
            pngUrl,
          );
          node.facing = 1;
          const badge = new Graphics();
          badge.circle(0, 0, 16).fill('#FCE79C');
          badge.circle(0, 0, 16).stroke({ width: 2.5, color: INK });
          badge.poly([0, -9, 3, -3, 9, 0, 3, 3, 0, 9, -3, 3, -9, 0, -3, -3]).fill('#C4483B');
          badge.position.set(0, -spec.size * 0.92);
          node.container.addChild(badge);
          node.readyBadge = badge;
          node.container.zIndex = spec.y;
          this.actorLayer.addChild(node.container);
          this.farmNodes.set(spec.id, node);
        } else {
          this.refreshAnimalRig(node, key, parts, 'idle', pngUrl);
        }
        if (node.readyBadge) {
          node.readyBadge.visible = ready;
        }
      }
    }

    this.actorLayer.sortableChildren = true;
  }

  private syncBubbles(): void {
    const view = this.view;
    if (!view) return;
    const bubbles = view.state.bubbles.filter((b) => b.roomId === view.roomId);
    const alive = new Set(bubbles.map((b) => b.id));
    for (const [id, node] of this.bubbleNodes) {
      if (!alive.has(id)) {
        node.container.destroy({ children: true });
        this.bubbleNodes.delete(id);
      }
    }
    for (const bubble of bubbles) {
      let node = this.bubbleNodes.get(bubble.id);
      if (!node) {
        node = this.makeBubble(bubble);
        this.bubbleLayer.addChild(node.container);
        this.bubbleNodes.set(bubble.id, node);
      }
      node.value = bubble.value;
      node.container.zIndex = 5000;
    }
    this.bubbleLayer.sortableChildren = true;
  }

  private makeBubble(bubble: HeartBubble): BubbleNode {
    const container = new Container();
    const halo = new Graphics();
    halo.circle(0, 0, 42).fill({ color: '#FCE79C', alpha: 0.3 });
    container.addChild(halo);

    const plate = new Graphics();
    plate.circle(0, 0, 34).fill({ color: '#FBF7EC', alpha: 0.95 });
    plate.circle(0, 0, 34).stroke({ width: 4, color: INK, alpha: 0.92 });
    plate.ellipse(-10, -14, 11, 5).fill({ color: '#FFFFFF', alpha: 0.65 });
    container.addChild(plate);

    const text = new Text({
      text: '♥',
      style: {
        fontFamily: 'Fredoka, Nunito, sans-serif',
        fontSize: 40,
        fill: '#E8A6B0',
        stroke: { color: INK, width: 4 },
      },
    });
    text.anchor.set(0.5);
    text.y = -2;
    container.addChild(text);

    if (bubble.value > 1) {
      const count = new Text({
        text: String(bubble.value),
        style: { fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: '800', fill: '#2E2A26' },
      });
      count.anchor.set(0.5);
      count.position.set(28, 24);
      container.addChild(count);
    }

    const pos = this.bubbleSourcePosition(bubble);
    container.position.set(pos.x, pos.y);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.hitArea = { contains: (x: number, y: number) => x * x + y * y <= 46 * 46 };
    container.on('pointerdown', (event) => {
      event.stopPropagation();
      const bNode = this.bubbleNodes.get(bubble.id);
      const bx = bNode ? bNode.container.x : pos.x;
      const by = bNode ? bNode.container.y : pos.y;
      this.spawnRing(bx, by, '#E8A6B0', 64);
      this.spawnBurst(bx, by, 'heart', 6, ['#E8A6B0', '#F5A3B7', '#E9C65B'], 125);
      this.spawnBurst(bx, by, 'sparkle', 5, ['#E9C65B', '#FFFDF8'], 110);
      this.spawnLabel(bx, by - 26, `+${bubble.value} ♥`);
      this.callbacks.onBubble(bubble.id);
    });

    return {
      container,
      halo,
      bornAt: performance.now() / 1000,
      x: pos.x,
      y: pos.y,
      value: bubble.value,
    };
  }

  private bubbleSourcePosition(bubble: HeartBubble): { x: number; y: number } {
    const state = this.view?.state;
    if (!state) return { x: bubble.x ?? 960, y: bubble.y ?? 420 };
    if (bubble.sourceType === 'pet') {
      const pNode = this.petNodes.get(bubble.sourceId);
      const pet = state.pets.find((p) => p.id === bubble.sourceId);
      if (pNode && pet) return { x: pNode.visX, y: pNode.visY - (pet.species === 'bird' ? 92 : 148) };
      if (pet) return { x: pet.x, y: pet.y - (pet.species === 'bird' ? 92 : 148) };
    }
    if (bubble.sourceType === 'visitor') {
      const visitor = state.visitors.active.find((v) => v.id === bubble.visitorId || v.id === bubble.sourceId);
      if (visitor) return { x: visitor.x, y: visitor.y - 152 };
    }
    return { x: bubble.x ?? 960, y: bubble.y ?? 420 };
  }

  private syncSelection(): void {
    const view = this.view;
    if (!view?.selectedUid || !view.editMode) {
      if (this.selectionKey !== '') {
        this.selection.clear();
        this.selectionKey = '';
      }
      return;
    }
    const placed = view.state.placed.find((p) => p.uid === view.selectedUid);
    if (!placed) {
      if (this.selectionKey !== '') {
        this.selection.clear();
        this.selectionKey = '';
      }
      return;
    }
    const { w, h } = itemSize(placed.itemId);
    const key = `${placed.uid}:${Math.round(placed.x)}:${Math.round(placed.y)}:${w}:${h}`;
    if (this.selectionKey === key) return;
    this.selectionKey = key;
    this.selection.clear();
    this.selection
      .roundRect(placed.x - w / 2 - 10, placed.y - h - 10, w + 20, h + 20, 12)
      .stroke({ width: 5, color: '#E8A6B0' });
    this.selection
      .roundRect(placed.x - w / 2 - 10, placed.y - h - 10, w + 20, h + 20, 12)
      .fill({ color: '#FBF7EC', alpha: 0.12 });
  }

  private onItemDown = (event: { stopPropagation: () => void; global: { x: number; y: number } }, node: ItemNode): void => {
    event.stopPropagation();
    const view = this.view;
    if (!view) return;
    if (!view.editMode) {
      node.popTimer = 0.28;
      this.callbacks.onSelectItem(node.placed.uid);
      return;
    }
    const placed = view.state.placed.find((p) => p.uid === node.placed.uid);
    if (!placed) return;
    this.drag = {
      uid: placed.uid,
      offsetX: event.global.x - placed.x,
      offsetY: event.global.y - placed.y,
      startX: event.global.x,
      startY: event.global.y,
      moved: false,
      node,
    };
    node.container.alpha = 0.84;
    this.callbacks.onSelectItem(placed.uid);
  };

  private onStageDown = (): void => {
    this.lastTapAt = Date.now();
  };

  private onStageMove = (event: { global: { x: number; y: number } }): void => {
    if (!this.drag) return;
    const dx = event.global.x - this.drag.startX;
    const dy = event.global.y - this.drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 8) this.drag.moved = true;
    const { node } = this.drag;
    node.container.x = event.global.x - this.drag.offsetX;
    node.container.y = event.global.y - this.drag.offsetY;
    node.container.alpha = 0.72;
  };

  private onStageUp = (event: { global: { x: number; y: number } }): void => {
    if (this.drag) {
      const drag = this.drag;
      this.drag = null;
      drag.node.container.alpha = 1;
      if (drag.moved) {
        this.callbacks.onMoveItem(drag.uid, event.global.x - drag.offsetX, event.global.y - drag.offsetY);
      } else {
        this.callbacks.onSelectItem(drag.uid);
      }
      return;
    }
    if (Date.now() - this.lastTapAt < 600) {
      const view = this.view;
      if (view) {
        this.spawnRing(event.global.x, event.global.y, '#FBF7EC', 34);
        this.callbacks.onStageTap(event.global.x, event.global.y);
      }
      this.lastTapAt = 0;
    }
  };

  private animateAnimalRig(node: AnimalRigNode, dt: number, now: number, pet?: PetState): void {
    // 1. Smooth 60fps position interpolation for moving pets
    let speed = 0;
    if (pet) {
      const tx = pet.x;
      const ty = pet.y + 6;
      const dx = tx - node.visX;
      const dy = ty - node.visY;
      const dist = Math.hypot(dx, dy);
      if (dist > 1.5) {
        const step = Math.min(dist, Math.max(95, dist * 2.4) * dt);
        node.visX += (dx / dist) * step;
        node.visY += (dy / dist) * step;
        speed = step / Math.max(0.001, dt);
        if (Math.abs(dx) > 2) {
          node.facing = dx >= 0 ? 1 : -1;
        }
      } else {
        node.visX = tx;
        node.visY = ty;
      }
      node.container.x = node.visX;
      node.container.y = node.visY;
      node.container.zIndex = Math.round(node.visY + 4);
    }

    const moving = speed > 14 || node.pose === 'walk';

    // 2. Blink timer (natural periodic blink)
    if (node.pose !== 'sleep') {
      if (node.blinkLeft > 0) {
        node.blinkLeft -= dt;
      } else {
        node.blinkTimer -= dt;
        if (node.blinkTimer <= 0) {
          node.blinkLeft = 0.14;
          node.blinkTimer = 2.6 + ((Math.sin(now * 3.1 + node.seed) + 1) * 1.6);
        }
      }
      const blinking = node.blinkLeft > 0;
      if (node.sprites.eyesOpen) node.sprites.eyesOpen.visible = !blinking;
      if (node.sprites.eyesClosed) node.sprites.eyesClosed.visible = blinking;
    }

    // 3. Sleep Zzz particles
    if (node.pose === 'sleep') {
      node.zzzTimer -= dt;
      if (node.zzzTimer <= 0) {
        node.zzzTimer = 1.45;
        this.particles.push({
          kind: 'steam',
          x: node.visX + 26 * node.facing,
          y: node.visY - 46,
          vx: 10 * node.facing,
          vy: -24,
          age: 0,
          life: 1.9,
          size: 11,
          color: '#FBF7EC',
          alpha: 0.72,
          rot: 0,
          vrot: 0,
        });
      }
    }

    // 4. Jump / interaction squash-and-stretch spring
    let sx = 1;
    let sy = 1;
    let jumpY = 0;
    if (node.jumpPop > 0) {
      node.jumpPop = Math.max(0, node.jumpPop - dt);
      const u = 1 - node.jumpPop / 0.45;
      const bounce = Math.sin(u * Math.PI);
      jumpY = -bounce * 22;
      sx = 1 + Math.sin(u * Math.PI * 2) * 0.12 * (1 - u);
      sy = 1 - Math.sin(u * Math.PI * 2) * 0.12 * (1 - u);
    }

    if (node.readyBadge && node.readyBadge.visible) {
      node.readyBadge.y = -node.targetSize * 0.92 + Math.sin(now * 4 + node.seed) * 4;
      const badgeScale = 1 + Math.sin(now * 5 + node.seed) * 0.08;
      node.readyBadge.scale.set(badgeScale);
    }

    if (node.pngSprite) {
      const t = now + node.seed;
      const baseScale = node.targetSize / Math.max(1, node.pngW ?? 140);
      const breath = 1 + Math.sin(t * 2.5) * 0.025;
      node.pngSprite.rotation = Math.sin(t * 1.5) * 0.018;
      node.rig.position.set(0, jumpY);
      node.rig.scale.set(
        node.facing * baseScale * sx * (2 - breath) * 0.5 + node.facing * baseScale * sx * 0.5,
        baseScale * sy * breath,
      );
      return;
    }

    const baseScale = node.targetSize / node.parts.w;

    // 5. Species-specific limb/wing/tail/breath articulation
    if (node.parts.kind === 'flutter') {
      // Butterfly & Bee flight figure-8 + rapid wing beat
      const hoverX = Math.sin(now * 2.1 + node.seed) * 18;
      const hoverY = Math.sin(now * 4.2 + node.seed) * 9;
      node.rig.position.set(hoverX, hoverY + jumpY);
      const wingFlap = 0.25 + 0.75 * Math.abs(Math.sin(now * 19 + node.seed));
      if (node.sprites.wingL) node.sprites.wingL.scale.x = wingFlap;
      if (node.sprites.wingR) node.sprites.wingR.scale.x = wingFlap;
      node.rig.scale.set(node.facing * baseScale * sx, baseScale * sy);
      return;
    }

    if (node.parts.kind === 'bird') {
      const t = now + node.seed;
      const breath = 1 + Math.sin(t * 2.8) * 0.025;
      if (node.sprites.body) node.sprites.body.scale.set(1, breath);
      if (node.sprites.head) node.sprites.head.rotation = Math.sin(t * 1.9) * 0.08;
      if (node.sprites.eyesOpen) node.sprites.eyesOpen.rotation = node.sprites.head?.rotation ?? 0;
      if (node.sprites.eyesClosed) node.sprites.eyesClosed.rotation = node.sprites.head?.rotation ?? 0;
      if (node.sprites.wing) {
        node.sprites.wing.rotation = moving ? Math.sin(t * 14) * 0.24 : Math.sin(t * 2.2) * 0.05;
      }
      const hop = moving ? Math.abs(Math.sin(t * 8)) * 7 : 0;
      node.rig.position.set(0, -hop + jumpY);
      node.rig.scale.set(node.facing * baseScale * sx, baseScale * sy);
      return;
    }

    if (node.pose === 'sleep') {
      const breath = 1 + Math.sin(now * 1.9 + node.seed) * 0.028;
      node.rig.position.set(0, jumpY);
      node.rig.scale.set(node.facing * baseScale * sx * (2 - breath) * 0.5 + node.facing * baseScale * sx * 0.5, baseScale * sy * breath);
      return;
    }

    // Quadruped walk / idle animation
    const t = now + node.seed;
    if (moving) {
      node.walkPhase += dt * 11;
    }
    const stride = moving ? Math.sin(node.walkPhase) : 0;
    const bob = moving ? Math.abs(Math.sin(node.walkPhase)) * 5.5 : Math.sin(t * 2.4) * 1.2;
    const breath = 1 + Math.sin(t * 2.6) * 0.022;

    if (node.sprites.farLegs) node.sprites.farLegs.rotation = -stride * 0.22;
    if (node.sprites.nearLegBack) node.sprites.nearLegBack.rotation = stride * 0.28;
    if (node.sprites.nearLegFront) node.sprites.nearLegFront.rotation = -stride * 0.28;
    if (node.sprites.backTail) {
      const wagRate = moving ? 9 : 4.5;
      node.sprites.backTail.rotation = Math.sin(t * wagRate) * (moving ? 0.2 : 0.15);
    }
    if (node.sprites.body) {
      node.sprites.body.scale.set(1, breath);
      node.sprites.body.rotation = moving ? Math.cos(node.walkPhase) * 0.025 : 0;
    }
    const headTilt = moving ? Math.sin(node.walkPhase) * 0.04 : Math.sin(t * 1.3) * 0.05;
    if (node.sprites.head) node.sprites.head.rotation = headTilt;
    if (node.sprites.eyesOpen) node.sprites.eyesOpen.rotation = headTilt;
    if (node.sprites.eyesClosed) node.sprites.eyesClosed.rotation = headTilt;

    node.rig.position.set(0, -bob + jumpY);
    node.rig.scale.set(node.facing * baseScale * sx, baseScale * sy);
  }

  private animateHumanRig(node: HumanRigNode, dt: number, now: number): void {
    const t = now + node.seed;

    if (node.blinkLeft > 0) {
      node.blinkLeft -= dt;
    } else {
      node.blinkTimer -= dt;
      if (node.blinkTimer <= 0) {
        node.blinkLeft = 0.14;
        node.blinkTimer = 3.2 + ((Math.sin(t * 2.1) + 1) * 1.5);
      }
    }
    const blinking = node.blinkLeft > 0;
    if (node.sprites.eyesOpen) node.sprites.eyesOpen.visible = !blinking;
    if (node.sprites.eyesClosed) node.sprites.eyesClosed.visible = blinking;

    let sx = 1;
    let sy = 1;
    let jumpY = 0;
    if (node.wavePop > 0) {
      node.wavePop = Math.max(0, node.wavePop - dt);
      const u = 1 - node.wavePop / 0.55;
      jumpY = -Math.sin(u * Math.PI) * 12;
      sx = 1 + Math.sin(u * Math.PI * 2) * 0.08 * (1 - u);
      sy = 1 - Math.sin(u * Math.PI * 2) * 0.08 * (1 - u);
    }

    const breath = 1 + Math.sin(t * 2.1) * 0.016;
    if (node.sprites.body) node.sprites.body.scale.set(1, breath);
    const headRot = Math.sin(t * 1.2) * 0.035;
    if (node.sprites.head) node.sprites.head.rotation = headRot;
    if (node.sprites.eyesOpen) node.sprites.eyesOpen.rotation = headRot;
    if (node.sprites.eyesClosed) node.sprites.eyesClosed.rotation = headRot;
    if (node.sprites.hairBack) node.sprites.hairBack.rotation = headRot * 0.7;

    if (node.sprites.frontArm) {
      if (node.wavePop > 0) {
        node.sprites.frontArm.rotation = -0.45 + Math.sin(t * 18) * 0.28;
      } else if (node.pose === 'paint') {
        node.sprites.frontArm.rotation = Math.sin(t * 3.4) * 0.14;
      } else if (node.pose === 'cook') {
        node.sprites.frontArm.rotation = Math.sin(t * 3.8) * 0.12;
      } else if (node.pose === 'read') {
        node.sprites.frontArm.rotation = Math.sin(t * 1.6) * 0.04;
      } else {
        node.sprites.frontArm.rotation = Math.sin(t * 1.8) * 0.05;
      }
    }
    if (node.sprites.backArm) {
      node.sprites.backArm.rotation = -Math.sin(t * 1.8) * 0.04;
    }

    const baseScale = node.targetW / node.parts.w;
    node.rig.position.set(0, jumpY);
    node.rig.scale.set(baseScale * sx, baseScale * sy);
  }

  private drawSkyAndSunbeams(now: number): void {
    const view = this.view;
    if (!view) return;
    const room = ROOMS[view.roomId];

    for (const actor of this.skyActors) {
      if (actor.kind === 'star') {
        const base = room.outdoor ? 0.45 : 0.4;
        actor.gfx.alpha = base + (1 - base) * Math.abs(Math.sin(now * actor.speed + actor.phase));
      } else if (actor.kind === 'cloud') {
        actor.gfx.x = ((actor.x0 + now * actor.speed) % 2180) - 130;
      } else if (actor.kind === 'windowCloud' && actor.winX !== undefined && actor.winW !== undefined) {
        const cycle = ((now * actor.speed) % (actor.winW + 70)) - 35;
        actor.gfx.x = actor.winX + Math.max(26, Math.min(actor.winW - 26, cycle));
      }
    }

    if (!room.outdoor && this.sunbeamLayer.visible) {
      this.sunbeamLayer.alpha = 0.88 + 0.12 * Math.sin(now * 0.9);
    }
  }

  private animateItems(dt: number, now: number): void {
    const view = this.view;
    if (!view) return;

    this.steamSpawnAcc += dt;
    const shouldSpawnSteam = this.steamSpawnAcc >= 0.42;
    if (shouldSpawnSteam) this.steamSpawnAcc = 0;

    for (const node of this.itemNodes.values()) {
      // Landing / interaction squash-and-stretch spring
      let sx = 1;
      let sy = 1;
      if (node.popTimer > 0) {
        node.popTimer = Math.max(0, node.popTimer - dt);
        const u = 1 - node.popTimer / 0.36;
        const osc = Math.sin(u * Math.PI * 2.5) * (1 - u) * 0.12;
        sx = 1 + osc;
        sy = 1 - osc;
      }

      // Gentle breeze sway on foliage & hanging decor
      let swayRot = 0;
      if (
        node.artKind === 'plant' ||
        node.artKind === 'tree' ||
        node.artKind === 'windChime' ||
        node.artKind === 'mobile' ||
        node.artKind === 'curtain'
      ) {
        swayRot = Math.sin(now * 1.45 + node.placed.x * 0.01) * 0.012;
      }

      node.container.scale.set(sx, sy);
      node.container.rotation = swayRot;

      if (node.artKind === 'floorLamp' || node.artKind === 'tableLamp' || node.artKind === 'lantern') {
        node.glow.alpha = 0.88 + 0.12 * Math.sin(now * 2.6 + node.placed.x);
      } else if (node.artKind === 'wallClock' && node.overlayParts) {
        if (node.overlayParts.hour) node.overlayParts.hour.rotation = now * 0.03 - Math.PI / 2;
        if (node.overlayParts.min) node.overlayParts.min.rotation = now * 0.35 - Math.PI / 2;
        if (node.overlayParts.sec) node.overlayParts.sec.rotation = now * 2.5 - Math.PI / 2;
      } else if ((node.artKind === 'pool' || node.artKind === 'fountain') && node.overlayParts?.ripple) {
        const ripPhase = (now * 0.7 + node.placed.x * 0.01) % 1;
        node.overlayParts.ripple.scale.set(0.38 + ripPhase * 0.62, 0.34 + ripPhase * 0.66);
        node.overlayParts.ripple.alpha = (1 - ripPhase) * 0.5;
      } else if (node.artKind === 'windmill' && node.overlayParts?.blades) {
        node.overlayParts.blades.rotation = now * 0.9 + node.placed.x * 0.01;
      }

      if (shouldSpawnSteam && (node.artKind === 'pot' || node.artKind === 'pan')) {
        this.particles.push({
          kind: 'steam',
          x: node.placed.x + (Math.random() - 0.5) * 26,
          y: node.placed.y - node.baseH * 0.85,
          vx: (Math.random() - 0.5) * 14,
          vy: -28 - Math.random() * 14,
          age: 0,
          life: 1.5,
          size: 7 + Math.random() * 5,
          color: '#FFFFFF',
          alpha: 0.55,
          rot: 0,
          vrot: 0,
        });
      }
    }
  }

  private drawAmbientAndParticles(dt: number, now: number): void {
    const view = this.view;
    if (!view) return;
    const room = ROOMS[view.roomId];

    // 1. Dust motes inside sunlit indoor rooms & farm stream ripples (pre-built Graphics, no clear())
    const showMotes = !room.outdoor && !view.night;
    const showRipples = room.outdoor && view.roomId === 'farm';
    this.ambientLayer.visible = showMotes || showRipples;

    if (showMotes) {
      const win = WINDOWS[view.roomId];
      for (const { gfx, data: m } of this.moteNodes) {
        gfx.visible = true;
        m.x += m.vx * dt;
        m.y += (m.vy + Math.sin(now * 1.4 + m.phase) * 4) * dt;
        if (m.x > 1920) m.x = 0;
        if (m.y > 820) m.y = 80;
        const inBeam = win ? m.x > win[0] - 80 && m.x < win[0] + win[2] + 240 && m.y > win[1] : true;
        gfx.position.set(m.x, m.y);
        gfx.alpha = (inBeam ? m.alpha * 1.5 : m.alpha * 0.45) * (0.6 + 0.4 * Math.sin(now * 2 + m.phase));
      }
      for (const ripple of this.farmRipples) ripple.visible = false;
    } else if (room.outdoor) {
      for (const { gfx } of this.moteNodes) gfx.visible = false;

      // Outdoor petals (day) or fireflies (night)
      this.fireflySpawnAcc += dt;
      if (this.fireflySpawnAcc > 0.35 && this.particles.length < 70) {
        this.fireflySpawnAcc = 0;
        this.particles.push({
          kind: view.night ? 'firefly' : 'petal',
          x: Math.random() * 1920,
          y: view.night ? 260 + Math.random() * 540 : 40 + Math.random() * 200,
          vx: view.night ? (Math.random() - 0.5) * 26 : 22 + Math.random() * 20,
          vy: view.night ? -10 + (Math.random() - 0.5) * 16 : 28 + Math.random() * 16,
          age: 0,
          life: 4.5 + Math.random() * 2.5,
          size: view.night ? 4.5 : 5.5,
          color: view.night ? '#FCE79C' : '#F4BAC3',
          alpha: 0.75,
          rot: Math.random() * Math.PI,
          vrot: 1.5,
        });
      }

      const rippleTint = view.night ? 0x8cb2c8 : 0xfffdf8;
      for (let i = 0; i < this.farmRipples.length; i++) {
        const ripple = this.farmRipples[i];
        ripple.visible = showRipples;
        if (!showRipples) continue;
        const rx = 140 + ((i * 310 + now * 26) % 1680);
        const ry = 748 + (i % 3) * 34 + Math.sin(now * 2 + i) * 3;
        const rw = 34 + Math.sin(now * 2.3 + i * 1.4) * 10;
        ripple.position.set(rx, ry);
        ripple.scale.x = rw / 42;
        ripple.tint = rippleTint;
        ripple.alpha = 0.35 + 0.15 * Math.sin(now * 2 + i);
      }
    } else {
      for (const { gfx } of this.moteNodes) gfx.visible = false;
      for (const ripple of this.farmRipples) ripple.visible = false;
    }

    // 2. Active FX particles (skip fxLayer.clear() entirely when idle)
    if (this.particles.length > 0 || this.fxHasContent) {
      this.fxLayer.clear();
      this.fxHasContent = this.particles.length > 0;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        this.particles.splice(i, 1);
        continue;
      }
      const u = p.age / p.life;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;

      if (p.kind === 'heart') {
        p.vy -= 20 * dt;
        const s = p.size * (1 - u * 0.3);
        const alpha = (1 - u) * p.alpha;
        const x = p.x;
        const y = p.y;
        this.fxLayer
          .moveTo(x, y + s * 0.45)
          .bezierCurveTo(x - s * 0.9, y - s * 0.25, x - s * 0.55, y - s * 0.95, x, y - s * 0.42)
          .bezierCurveTo(x + s * 0.55, y - s * 0.95, x + s * 0.9, y - s * 0.25, x, y + s * 0.45)
          .fill({ color: p.color, alpha });
      } else if (p.kind === 'sparkle') {
        const s = p.size * Math.sin(u * Math.PI);
        const alpha = (1 - u) * p.alpha;
        this.fxLayer
          .poly([
            p.x, p.y - s,
            p.x + s * 0.28, p.y - s * 0.28,
            p.x + s, p.y,
            p.x + s * 0.28, p.y + s * 0.28,
            p.x, p.y + s,
            p.x - s * 0.28, p.y + s * 0.28,
            p.x - s, p.y,
            p.x - s * 0.28, p.y - s * 0.28,
          ])
          .fill({ color: p.color, alpha });
      } else if (p.kind === 'dust' || p.kind === 'steam') {
        const alpha = Math.sin(u * Math.PI) * p.alpha * 0.7;
        const r = p.size * (0.7 + u * 0.9);
        this.fxLayer.circle(p.x, p.y, r).fill({ color: p.color, alpha });
      } else if (p.kind === 'ring') {
        const r = 14 + u * p.size;
        const alpha = (1 - u) * p.alpha;
        this.fxLayer.circle(p.x, p.y, r).stroke({ width: 4 * (1 - u) + 1, color: p.color, alpha });
      } else if (p.kind === 'firefly') {
        const glow = Math.sin(u * Math.PI) * (0.5 + 0.5 * Math.sin(now * 5 + p.x));
        this.fxLayer.circle(p.x, p.y, p.size * 2.2).fill({ color: p.color, alpha: glow * 0.22 });
        this.fxLayer.circle(p.x, p.y, p.size * 0.7).fill({ color: '#FFFDF8', alpha: glow * 0.9 });
      } else if (p.kind === 'petal') {
        const alpha = Math.sin(u * Math.PI) * p.alpha;
        this.fxLayer.ellipse(p.x + Math.sin(now * 3 + p.rot) * 8, p.y, p.size, p.size * 0.55).fill({ color: p.color, alpha });
      }
    }

    // 3. Floating numeric labels
    for (let i = this.labels.length - 1; i >= 0; i--) {
      const l = this.labels[i];
      l.age += dt;
      if (l.age >= l.life) {
        l.text.destroy();
        this.labels.splice(i, 1);
        continue;
      }
      const u = l.age / l.life;
      l.text.y += l.vy * dt;
      l.text.x = l.baseX + Math.sin(u * Math.PI * 2) * 5;
      l.text.alpha = u < 0.7 ? 1 : Math.max(0, (1 - u) / 0.3);
      l.text.scale.set(u < 0.15 ? 0.6 + (u / 0.15) * 0.5 : 1.05 - u * 0.1);
    }
  }

  private onTick = (ticker: Ticker): void => {
    if (!this.view || !this.ready) return;

    // Throttle background rendering when a modal overlay covers the canvas
    const hasOverlay = useGameStore.getState().overlay !== null || document.body.classList.contains('has-overlay');
    if (this.app) {
      const desiredFps = hasOverlay ? 4 : 30;
      if (this.app.ticker.maxFPS !== desiredFps) this.app.ticker.maxFPS = desiredFps;
    }

    const dt = Math.min(0.05, ticker.deltaMS / 1000);
    const now = performance.now() / 1000;

    // Smooth room cross-fade transition
    if (this.transitionAlpha < 1) {
      this.transitionAlpha = Math.min(1, this.transitionAlpha + dt * 7);
      this.root.alpha = this.transitionAlpha;
    }

    if (hasOverlay && this.transitionAlpha >= 1) {
      return;
    }

    this.drawSkyAndSunbeams(now);
    this.animateItems(dt, now);
    this.drawAmbientAndParticles(dt, now);

    // Heart bubbles
    for (const [id, node] of this.bubbleNodes) {
      const bubble = this.view.state.bubbles.find((b) => b.id === id);
      if (!bubble) continue;
      const pos = this.bubbleSourcePosition(bubble);
      const popIn = Math.min(1, (now - node.bornAt) * 3.8);
      const popScale = popIn < 1 ? 0.4 + 0.6 * Math.sin((popIn * Math.PI) / 2) : 1;
      node.x = pos.x;
      node.y = pos.y + Math.sin(now * 2.2 + id.length) * 6;
      node.container.position.set(node.x, node.y);
      node.container.scale.set(popScale * (1 + Math.sin(now * 3.2 + id.length) * 0.045));
      node.halo.scale.set(1 + 0.14 * Math.sin(now * 3.2 + id.length));
    }

    // Pets
    for (const pet of this.view.state.pets) {
      if (pet.roomId !== this.view.roomId) continue;
      const node = this.petNodes.get(pet.id);
      if (node) this.animateAnimalRig(node, dt, now, pet);
    }

    // Visitors
    for (const visitor of this.view.state.visitors.active) {
      if (visitor.roomId !== this.view.roomId) continue;
      const node = this.visitorNodes.get(visitor.id);
      if (node) this.animateAnimalRig(node, dt, now);
    }

    // Critters
    for (const spot of ROOMS[this.view.roomId].critterSpots) {
      const node = this.critterNodes.get(spot.id);
      if (node) this.animateAnimalRig(node, dt, now);
    }

    // Farm producers
    for (const node of this.farmNodes.values()) {
      this.animateAnimalRig(node, dt, now);
    }

    // Humans & Baby
    for (const node of this.humanNodes.values()) {
      this.animateHumanRig(node, dt, now);
    }

    // Pulse edit selection outline if active (without rebuilding geometry)
    if (this.view.editMode && this.view.selectedUid) {
      this.selection.alpha = 0.78 + 0.22 * Math.sin(now * 5.5);
    }
  };
}

export { animalArt };
