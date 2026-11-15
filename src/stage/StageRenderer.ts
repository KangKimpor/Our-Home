import { Application, Container, Graphics, Sprite, Text, Texture, type Ticker } from 'pixi.js';
import { animalArt, animalRigParts, type AnimalRigParts, type RigPart } from '../art/animals';
import { babyRigParts, characterRigParts, type CharacterRigParts } from '../art/characters';
import { itemArt } from '../art/items';
import { PALETTES } from '../art/palettes';
import { SVG_DEFS } from '../art/svg';
import { ITEMS_BY_ID } from '../data/items';
import { ROOMS, ROOM_PALETTES } from '../data/rooms';
import { VISITORS_BY_ID } from '../data/visitors';
import type { GameState, HeartBubble, PetState, PlacedItem, RoomId } from '../game/types';
import { isFlatItem, itemSize } from '../game/placement';

const INK = '#2E2A26';

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

function drawWindowFrame(g: Graphics, x: number, y: number, w: number, h: number, night: boolean, sky: string): void {
  // Soft drop shadow behind window frame
  g.roundRect(x - 14, y - 8, w + 28, h + 30, 8).fill({ color: '#2B2521', alpha: 0.12 });

  // Outer wooden casing
  g.roundRect(x - 14, y - 14, w + 28, h + 28, 6).fill('#FBF7EC');
  g.roundRect(x - 14, y - 14, w + 28, h + 28, 6).stroke({ width: 3.5, color: INK });
  g.rect(x - 6, y - 6, w + 12, h + 12).fill('#E8DEC8');

  // Sky glass backdrop
  g.rect(x, y, w, h).fill(night ? '#2D4060' : sky);
  g.rect(x, y, w, h * 0.45).fill({ color: night ? '#1F2E48' : '#FFFFFF', alpha: night ? 0.28 : 0.18 });

  if (night) {
    // Glowing moon
    g.circle(x + w * 0.72, y + h * 0.28, 22).fill({ color: '#FBF7EC', alpha: 0.18 });
    g.circle(x + w * 0.72, y + h * 0.28, 14).fill('#FBF7EC');
    g.circle(x + w * 0.72 + 6, y + h * 0.28 - 5, 11).fill('#2D4060');
    // Night hills
    g.ellipse(x + w * 0.35, y + h * 0.78, w * 0.33, h * 0.2).fill('#283A38');
    g.ellipse(x + w * 0.68, y + h * 0.81, w * 0.3, h * 0.18).fill('#213130');
    g.rect(x, y + h * 0.76, w, h * 0.24).fill('#243532');
  } else {
    // Warm sun
    g.circle(x + w * 0.74, y + h * 0.24, 24).fill({ color: '#FCE9A8', alpha: 0.42 });
    g.circle(x + w * 0.74, y + h * 0.24, 14).fill('#F3CE68');
    // Rolling hills & distant trees
    g.ellipse(x + w * 0.35, y + h * 0.74, w * 0.33, h * 0.2).fill('#A3BF84');
    g.ellipse(x + w * 0.68, y + h * 0.76, w * 0.3, h * 0.19).fill('#8EAA70');
    g.rect(x, y + h * 0.73, w, h * 0.27).fill('#8FA96F');
    g.circle(x + w * 0.22, y + h * 0.65, 15).fill('#759457');
    g.circle(x + w * 0.3, y + h * 0.68, 12).fill('#84A364');
  }
}

function drawWindowOverlay(g: Graphics, x: number, y: number, w: number, h: number, night: boolean): void {
  // Diagonal glass reflection streaks
  g.poly([x + 12, y + h - 18, x + 46, y + 12, x + 62, y + 12, x + 28, y + h - 18]).fill({
    color: '#FFFFFF',
    alpha: night ? 0.08 : 0.22,
  });
  g.poly([x + 70, y + h - 18, x + 104, y + 12, x + 112, y + 12, x + 78, y + h - 18]).fill({
    color: '#FFFFFF',
    alpha: night ? 0.05 : 0.14,
  });

  // Inner frame & muntin bars
  g.rect(x, y, w, h).stroke({ width: 3.5, color: INK });
  g.rect(x + w / 2 - 3, y, 6, h).fill('#FBF7EC');
  g.rect(x + w / 2 - 3, y, 6, h).stroke({ width: 2.5, color: INK });
  g.rect(x, y + h / 2 - 3, w, 6).fill('#FBF7EC');
  g.rect(x, y + h / 2 - 3, w, 6).stroke({ width: 2.5, color: INK });

  // Cozy fabric curtains & wooden rod
  const curtainCol = night ? '#9E8878' : '#E8D9C5';
  const curtainFold = night ? '#826E60' : '#D4C1A9';
  g.roundRect(x - 32, y - 24, w + 64, 8, 4).fill('#8C6B4C');
  g.roundRect(x - 32, y - 24, w + 64, 8, 4).stroke({ width: 2.8, color: INK });
  g.circle(x - 32, y - 20, 6).fill('#7A5A3C');
  g.circle(x - 32, y - 20, 6).stroke({ width: 2.5, color: INK });
  g.circle(x + w + 32, y - 20, 6).fill('#7A5A3C');
  g.circle(x + w + 32, y - 20, 6).stroke({ width: 2.5, color: INK });

  // Left drape
  g.poly([
    x - 24, y - 16,
    x + 14, y - 16,
    x + 6, y + h * 0.55,
    x + 16, y + h + 14,
    x - 26, y + h + 14,
  ]).fill(curtainCol);
  g.poly([
    x - 24, y - 16,
    x + 14, y - 16,
    x + 6, y + h * 0.55,
    x + 16, y + h + 14,
    x - 26, y + h + 14,
  ]).stroke({ width: 2.8, color: INK });
  g.moveTo(x - 8, y - 12).lineTo(x - 10, y + h + 10).stroke({ width: 2, color: curtainFold });

  // Right drape
  g.poly([
    x + w - 14, y - 16,
    x + w + 24, y - 16,
    x + w + 26, y + h + 14,
    x + w - 16, y + h + 14,
    x + w - 6, y + h * 0.55,
  ]).fill(curtainCol);
  g.poly([
    x + w - 14, y - 16,
    x + w + 24, y - 16,
    x + w + 26, y + h + 14,
    x + w - 16, y + h + 14,
    x + w - 6, y + h * 0.55,
  ]).stroke({ width: 2.8, color: INK });
  g.moveTo(x + w + 8, y - 12).lineTo(x + w + 10, y + h + 10).stroke({ width: 2, color: curtainFold });

  // Thick carved wooden windowsill
  g.roundRect(x - 22, y + h + 6, w + 44, 14, 5).fill('#DFCBB0');
  g.roundRect(x - 22, y + h + 6, w + 44, 14, 5).stroke({ width: 3.2, color: INK });
  g.rect(x - 16, y + h + 20, w + 32, 6).fill({ color: '#2B2521', alpha: 0.14 });
}

const WINDOWS: Partial<Record<RoomId, [number, number, number, number]>> = {
  living: [250, 112, 250, 206],
  bedroom: [196, 112, 210, 178],
  kitchen: [230, 112, 240, 184],
  bathroom: [220, 144, 150, 120],
  studio: [1440, 92, 300, 244],
  nursery: [1420, 114, 230, 186],
};

function paintRoom(bg: Graphics, fg: Graphics, roomId: RoomId, night: boolean): void {
  const room = ROOMS[roomId];
  const pal = ROOM_PALETTES[roomId];
  const floorTop = room.floorTop;
  bg.clear();
  fg.clear();

  if (room.outdoor) {
    // Rich sky with horizon glow
    bg.rect(0, 0, 1920, 884).fill(night ? '#26354D' : pal.sky);
    bg.rect(0, 0, 1920, floorTop * 0.55).fill({ color: night ? '#1B273B' : '#FFFFFF', alpha: night ? 0.35 : 0.22 });
    bg.rect(0, floorTop - 110, 1920, 110).fill({ color: night ? '#3A4E6B' : '#FCEFD2', alpha: night ? 0.25 : 0.38 });

    // Layered rolling hills
    bg.ellipse(340, floorTop + 24, 560, 210).fill(night ? '#2E453B' : '#B7CF9F');
    bg.ellipse(1180, floorTop + 42, 680, 240).fill(night ? '#273D34' : '#A4C08E');
    bg.ellipse(1720, floorTop + 18, 490, 195).fill(night ? '#314B41' : '#B0CA98');

    // Distant trees along horizon
    for (const tx of [140, 480, 820, 1340, 1620, 1830]) {
      const ty = floorTop - 28;
      bg.circle(tx, ty - 20, 34).fill(night ? '#233830' : '#7E9E68');
      bg.circle(tx + 22, ty - 10, 26).fill(night ? '#294037' : '#8DAB74');
    }

    if (night) {
      bg.circle(1640, 120, 84).fill({ color: '#FBF7EC', alpha: 0.12 });
      bg.circle(1640, 120, 58).fill('#FBF7EC');
      bg.circle(1666, 102, 50).fill('#26354D');
    } else {
      bg.circle(1640, 120, 86).fill({ color: '#FCE9A8', alpha: 0.35 });
      bg.circle(1640, 120, 56).fill('#F5D77F');
    }

    // Lush lawn / ground in foreground of skyAnimLayer
    fg.rect(0, floorTop, 1920, 884 - floorTop).fill(night ? '#354F3F' : pal.floor);
    fg.rect(0, floorTop, 1920, 22).fill(night ? '#42614D' : pal.floorAlt);
    fg.moveTo(0, floorTop).lineTo(1920, floorTop).stroke({ width: 3, color: INK, alpha: 0.45 });

    for (let i = 0; i < 28; i++) {
      const gx = 70 + ((i * 197) % 1780);
      const gy = floorTop + 48 + ((i * 83) % (840 - floorTop - 60));
      const col = night ? '#486954' : '#6E8F5B';
      fg.moveTo(gx, gy).lineTo(gx - 5, gy - 11).stroke({ width: 2.2, color: col, alpha: 0.65 });
      fg.moveTo(gx + 4, gy).lineTo(gx + 7, gy - 12).stroke({ width: 2.2, color: col, alpha: 0.65 });
    }

    if (roomId === 'garden') {
      for (let x = 40; x < 1900; x += 68) {
        fg.roundRect(x, floorTop - 52, 16, 54, 4).fill(night ? '#8A7B68' : '#F3ECE0');
        fg.roundRect(x, floorTop - 52, 16, 54, 4).stroke({ width: 2.2, color: INK });
      }
      fg.rect(24, floorTop - 36, 1872, 7).fill(night ? '#7A6C5B' : '#E5DBC8');
      fg.rect(24, floorTop - 18, 1872, 7).fill(night ? '#7A6C5B' : '#E5DBC8');
      for (let x = 60; x < 1920; x += 130) {
        fg.moveTo(x, floorTop + 220).lineTo(x + 8, floorTop + 150).stroke({ width: 4, color: night ? '#4F6F52' : '#6E8F5B' });
        fg.circle(x + 8, floorTop + 146, 8).fill(night ? '#9C7280' : '#E8A6B0');
        fg.circle(x + 8, floorTop + 146, 3.5).fill('#E9C65B');
      }
    }
    if (roomId === 'porch') {
      fg.rect(0, floorTop, 1920, 884 - floorTop).fill(night ? '#684D35' : '#C49A6C');
      for (let y = floorTop + 42; y < 884; y += 46) {
        fg.moveTo(0, y).lineTo(1920, y).stroke({ width: 2.2, color: night ? '#523B28' : '#A67D52', alpha: 0.75 });
      }
      fg.rect(0, floorTop - 82, 1920, 18).fill(night ? '#7A5A3C' : '#B89062');
      fg.rect(0, floorTop - 82, 1920, 18).stroke({ width: 3, color: INK });
      fg.rect(0, floorTop - 14, 1920, 14).fill(night ? '#684C32' : '#A47D52');
      fg.rect(0, floorTop - 14, 1920, 14).stroke({ width: 3, color: INK });
      for (let x = 70; x <= 1870; x += 120) {
        fg.rect(x, floorTop - 64, 14, 50).fill(night ? '#8A6949' : '#CCA679');
        fg.rect(x, floorTop - 64, 14, 50).stroke({ width: 2.5, color: INK });
      }
    }
    if (roomId === 'farm') {
      const bx = 120;
      const by = floorTop - 256;
      const bw = 330;
      const bh = 256;
      fg.rect(bx, by, bw, bh).fill(night ? '#7A3E36' : '#C84B3C');
      fg.rect(bx, by, bw, bh).stroke({ width: 4, color: INK });
      for (let x = bx + 42; x < bx + bw; x += 42) {
        fg.moveTo(x, by).lineTo(x, by + bh).stroke({ width: 2, color: night ? '#5E2D27' : '#A8382B', alpha: 0.55 });
      }
      fg.poly([bx - 24, by, bx + 65, by - 76, bx + bw / 2, by - 110, bx + bw - 65, by - 76, bx + bw + 24, by]).fill(
        night ? '#4D3829' : '#7A5A3C',
      );
      fg.poly([bx - 24, by, bx + 65, by - 76, bx + bw / 2, by - 110, bx + bw - 65, by - 76, bx + bw + 24, by]).stroke({
        width: 4,
        color: INK,
      });
      const dx = bx + 105;
      const dy = floorTop - 154;
      const dw = 120;
      const dh = 154;
      fg.rect(dx, dy, dw, dh).fill(night ? '#5A4130' : '#8C6B4C');
      fg.rect(dx, dy, dw, dh).stroke({ width: 4, color: INK });
      fg.moveTo(dx, dy).lineTo(dx + dw, dy + dh).stroke({ width: 4, color: '#FBF7EC' });
      fg.moveTo(dx + dw, dy).lineTo(dx, dy + dh).stroke({ width: 4, color: '#FBF7EC' });
      fg.rect(dx, dy, dw, dh).stroke({ width: 3.5, color: '#FBF7EC' });
      fg.roundRect(bx + bw / 2 - 26, by + 26, 52, 46, 6).fill(night ? '#F5D77F' : '#3A2E25');
      fg.roundRect(bx + bw / 2 - 26, by + 26, 52, 46, 6).stroke({ width: 3.5, color: '#FBF7EC' });
    }
    return;
  }

  // INDOOR ROOMS
  const wallFill = night ? dim(pal.wall, 0.74) : pal.wall;
  const wallAlt = night ? dim(pal.wallShade, 0.72) : pal.wallShade;
  const trimFill = night ? dim(pal.trim, 0.74) : pal.trim;

  bg.rect(0, 0, 1920, floorTop).fill(wallFill);
  const wainscotTop = floorTop - 116;
  for (let x = 48; x < 1920; x += 96) {
    bg.rect(x, 28, 36, wainscotTop - 28).fill({ color: wallAlt, alpha: 0.32 });
  }

  bg.rect(0, 0, 1920, 24).fill(wallAlt);
  bg.rect(0, 0, 1920, 24).stroke({ width: 3, color: INK });
  bg.rect(0, 24, 1920, 7).fill(trimFill);
  bg.moveTo(0, 31).lineTo(1920, 31).stroke({ width: 2, color: INK, alpha: 0.55 });

  bg.rect(0, wainscotTop, 1920, floorTop - wainscotTop).fill(wallAlt);
  bg.rect(0, wainscotTop, 1920, 10).fill(trimFill);
  bg.rect(0, wainscotTop, 1920, 10).stroke({ width: 2.5, color: INK });

  for (let x = 36; x < 1880; x += 184) {
    bg.roundRect(x, wainscotTop + 20, 152, floorTop - wainscotTop - 48, 5).fill({
      color: wallFill,
      alpha: 0.55,
    });
    bg.roundRect(x, wainscotTop + 20, 152, floorTop - wainscotTop - 48, 5).stroke({
      width: 2,
      color: INK,
      alpha: 0.28,
    });
  }

  bg.rect(0, floorTop - 22, 1920, 22).fill(trimFill);
  bg.rect(0, floorTop - 22, 1920, 22).stroke({ width: 3, color: INK });
  bg.rect(0, floorTop - 20, 1920, 4).fill({ color: '#FFFDF8', alpha: 0.35 });

  const floorFill = night ? dim(pal.floor, 0.66) : pal.floor;
  const floorLine = night ? dim(pal.floorAlt, 0.58) : pal.floorAlt;
  bg.rect(0, floorTop, 1920, 884 - floorTop).fill(floorFill);
  bg.rect(0, floorTop, 1920, 18).fill({ color: '#2B2521', alpha: 0.12 });
  bg.rect(0, 820, 1920, 64).fill({ color: '#2B2521', alpha: 0.07 });

  let rowIdx = 0;
  for (let y = floorTop + 44; y < 884; y += 54) {
    rowIdx++;
    if (rowIdx % 2 === 0) {
      bg.rect(0, y - 54, 1920, 54).fill({ color: '#FFFDF8', alpha: 0.04 });
    }
    bg.moveTo(0, y).lineTo(1920, y).stroke({ width: 2.2, color: floorLine, alpha: 0.8 });
    const offset = (rowIdx * 130) % 260;
    for (let x = -120 + offset; x < 1980; x += 260) {
      bg.moveTo(x, y - 54).lineTo(x + 28, y).stroke({ width: 2, color: floorLine, alpha: 0.55 });
    }
  }

  const win = WINDOWS[roomId];
  if (win) {
    drawWindowFrame(bg, win[0], win[1], win[2], win[3], night, pal.sky);
    drawWindowOverlay(fg, win[0], win[1], win[2], win[3], night);
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
  private background = new Graphics();
  private skyAnimLayer = new Graphics();
  private foregroundEnv = new Graphics();
  private sunbeamLayer = new Graphics();
  private itemLayer = new Container();
  private actorLayer = new Container();
  private bubbleLayer = new Container();
  private ambientLayer = new Graphics();
  private fxLayer = new Graphics();
  private labelLayer = new Container();
  private selection = new Graphics();

  private itemNodes = new Map<string, ItemNode>();
  private petNodes = new Map<string, AnimalRigNode>();
  private visitorNodes = new Map<string, AnimalRigNode>();
  private critterNodes = new Map<string, AnimalRigNode>();
  private humanNodes = new Map<string, HumanRigNode>();
  private bubbleNodes = new Map<string, BubbleNode>();

  private particles: Particle[] = [];
  private labels: FloatingLabel[] = [];
  private motes: DustMote[] = [];

  private view: StageView | null = null;
  private paintedRoom: RoomId | null = null;
  private paintedNight: boolean | null = null;
  private drag: DragState | null = null;
  private lastTapAt = 0;
  private transitionAlpha = 1;
  private steamSpawnAcc = 0;
  private fireflySpawnAcc = 0;

  constructor(host: HTMLElement, callbacks: StageCallbacks) {
    this.host = host;
    this.callbacks = callbacks;
    for (let i = 0; i < 24; i++) {
      this.motes.push({
        x: (i * 137) % 1920,
        y: 120 + ((i * 89) % 700),
        vx: 7 + (i % 5) * 2.5,
        vy: 3 + (i % 3) * 1.6,
        radius: 1.6 + (i % 3) * 0.9,
        phase: i * 0.9,
        alpha: 0.25 + (i % 4) * 0.1,
      });
    }
    void this.init();
  }

  private async init(): Promise<void> {
    const app = new Application();
    await app.init({
      width: 1920,
      height: 884,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
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
    this.root.addChild(
      this.background,
      this.skyAnimLayer,
      this.foregroundEnv,
      this.sunbeamLayer,
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
      for (const l of this.labels) l.text.destroy();
      this.labels = [];
    }
    if (this.ready) this.rebuildAll();
  }

  destroy(): void {
    this.destroyed = true;
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
      paintRoom(this.background, this.foregroundEnv, roomId, night);
      this.paintedRoom = roomId;
      this.paintedNight = night;
    }
    this.syncItems();
    this.syncActors();
    this.syncBubbles();
    this.syncSelection();
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
      const texture = requestTexture(`item:${def.id}`, art.body, art.w, art.h, this.onRefresh);
      const targetH = (def.width * art.h) / art.w;

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
    }
    this.itemLayer.sortableChildren = true;
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
  ): AnimalRigNode {
    const container = new Container();
    const rig = new Container();
    container.addChild(rig);
    container.x = x;
    container.y = y;

    const sprites: RigSprites = {
      shadow: mountRigPart(rig, `${key}:shadow`, parts.shadow, this.onRefresh),
      backTail: mountRigPart(rig, `${key}:tail`, parts.backTail, this.onRefresh),
      farLegs: mountRigPart(rig, `${key}:farLegs`, parts.farLegs, this.onRefresh),
      body: mountRigPart(rig, `${key}:body`, parts.body, this.onRefresh),
      nearLegBack: mountRigPart(rig, `${key}:nearLegBack`, parts.nearLegBack, this.onRefresh),
      nearLegFront: mountRigPart(rig, `${key}:nearLegFront`, parts.nearLegFront, this.onRefresh),
      wingL: mountRigPart(rig, `${key}:wingL`, parts.wingL, this.onRefresh),
      wingR: mountRigPart(rig, `${key}:wingR`, parts.wingR, this.onRefresh),
      wing: mountRigPart(rig, `${key}:wing`, parts.wing, this.onRefresh),
      head: mountRigPart(rig, `${key}:head`, parts.head, this.onRefresh),
      eyesOpen: mountRigPart(rig, `${key}:eyesOpen`, parts.eyesOpen, this.onRefresh),
      eyesClosed: mountRigPart(rig, `${key}:eyesClosed`, parts.eyesClosed, this.onRefresh),
    };
    if (sprites.eyesClosed) sprites.eyesClosed.visible = false;

    if (onTap) {
      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.on('pointerdown', (event) => {
        event.stopPropagation();
        onTap();
      });
    }

    const baseScale = targetSize / parts.w;
    rig.scale.set(baseScale);

    return {
      container,
      rig,
      parts,
      sprites,
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
  }

  private refreshAnimalRig(
    node: AnimalRigNode,
    key: string,
    parts: AnimalRigParts,
    pose: 'idle' | 'walk' | 'sleep' | 'special',
  ): void {
    if (node.cacheKey !== key) {
      node.rig.removeChildren().forEach((c) => c.destroy());
      node.parts = parts;
      node.cacheKey = key;
      node.pose = pose;
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
      return;
    }

    node.pose = pose;
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
        });
        node.container.zIndex = pet.y + 10;
        this.actorLayer.addChild(node.container);
        this.petNodes.set(pet.id, node);
      } else {
        this.refreshAnimalRig(existing, key, parts, pose);
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
        });
        node.container.zIndex = visitor.y + 12;
        this.actorLayer.addChild(node.container);
        this.visitorNodes.set(visitor.id, node);
      } else {
        this.refreshAnimalRig(existing, key, parts, 'idle');
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
    this.selection.clear();
    const view = this.view;
    if (!view?.selectedUid || !view.editMode) return;
    const placed = view.state.placed.find((p) => p.uid === view.selectedUid);
    if (!placed) return;
    const { w, h } = itemSize(placed.itemId);
    const pulse = 0.78 + 0.22 * Math.sin(performance.now() / 180);
    this.selection
      .roundRect(placed.x - w / 2 - 10, placed.y - h - 10, w + 20, h + 20, 12)
      .stroke({ width: 5, color: '#E8A6B0', alpha: pulse });
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
    const { roomId, night } = view;
    const room = ROOMS[roomId];
    this.skyAnimLayer.clear();
    this.sunbeamLayer.clear();

    if (room.outdoor) {
      if (night) {
        // Twinkling night sky stars
        for (let i = 0; i < 24; i++) {
          const sx = (i * 173 + 90) % 1880;
          const sy = 36 + ((i * 97) % 260);
          const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(now * 1.7 + i * 1.3));
          this.skyAnimLayer.circle(sx, sy, i % 3 === 0 ? 3 : 2).fill({ color: '#FBF7EC', alpha: twinkle });
        }
      } else {
        // Slowly drifting fluffy outdoor clouds
        const clouds: [number, number, number, number][] = [
          [420, 110, 1, 10],
          [920, 86, 0.82, 7.5],
          [1280, 146, 1.08, 12],
          [1760, 96, 0.9, 8.5],
        ];
        for (const [cx0, cy, s, spd] of clouds) {
          const cx = ((cx0 + now * spd) % 2180) - 130;
          this.skyAnimLayer.ellipse(cx, cy + 6, 118 * s, 28 * s).fill({ color: '#D8E6EC', alpha: 0.6 });
          this.skyAnimLayer.ellipse(cx, cy, 116 * s, 28 * s).fill('#FBF7EC');
          this.skyAnimLayer.ellipse(cx - 36 * s, cy - 12 * s, 56 * s, 24 * s).fill('#FFFFFF');
          this.skyAnimLayer.ellipse(cx + 34 * s, cy - 10 * s, 64 * s, 26 * s).fill('#FBF7EC');
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
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(now * 2.1 + i * 1.7));
        this.skyAnimLayer.circle(sx, sy, i % 2 === 0 ? 2.3 : 1.5).fill({ color: '#FBF7EC', alpha: twinkle });
      }
    } else {
      // Drifting cloud inside indoor window bounds
      const cycle = ((now * 6) % (ww + 70)) - 35;
      const cx = wx + Math.max(26, Math.min(ww - 26, cycle));
      const cy = wy + wh * 0.25;
      this.skyAnimLayer.ellipse(cx, cy, 22, 9).fill('#FBF7EC');
      this.skyAnimLayer.ellipse(cx + 9, cy - 3, 15, 9).fill('#FFFFFF');
    }

    // Feathered breathing sunbeams / moonbeams
    const shimmer = 0.88 + 0.12 * Math.sin(now * 0.9);
    const beamColor = night ? '#B8D0F0' : '#FFF6D6';
    this.sunbeamLayer.poly([
      wx + 6, wy + wh + 20,
      wx + ww - 6, wy + wh + 20,
      wx + ww + 90, wy + wh + 160,
      wx - 14, wy + wh + 160,
    ]).fill({ color: beamColor, alpha: (night ? 0.035 : 0.08) * shimmer });
    this.sunbeamLayer.poly([
      wx + 6, wy + wh + 20,
      wx + ww - 6, wy + wh + 20,
      wx + ww + 135, wy + wh + 235,
      wx - 24, wy + wh + 235,
    ]).fill({ color: beamColor, alpha: (night ? 0.025 : 0.052) * shimmer });
    this.sunbeamLayer.poly([
      wx + 6, wy + wh + 20,
      wx + ww - 6, wy + wh + 20,
      wx + ww + 175, wy + wh + 305,
      wx - 32, wy + wh + 305,
    ]).fill({ color: beamColor, alpha: (night ? 0.015 : 0.03) * shimmer });
  }

  private animateItems(dt: number, now: number): void {
    const view = this.view;
    if (!view) return;
    const night = view.night;

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

      // Per-prop ambient glow & live animation overlays
      node.glow.clear();
      node.overlay.clear();

      if (node.artKind === 'floorLamp' || node.artKind === 'tableLamp' || node.artKind === 'lantern') {
        const pulse = 0.88 + 0.12 * Math.sin(now * 2.6 + node.placed.x);
        const gy = node.artKind === 'floorLamp' ? -node.baseH * 0.72 : -node.baseH * 0.62;
        const rOuter = node.baseW * (night ? 1.55 : 0.95);
        node.glow.circle(0, gy, rOuter).fill({ color: '#FCE79C', alpha: (night ? 0.16 : 0.07) * pulse });
        node.glow.circle(0, gy, rOuter * 0.56).fill({ color: '#FFF6CC', alpha: (night ? 0.22 : 0.09) * pulse });
      } else if (node.artKind === 'wallClock') {
        const cx = 0;
        const cy = -node.baseH * 0.5;
        const r = node.baseW * (19 / 68);
        const palName = ITEMS_BY_ID[node.itemId]?.palette ?? 'cream';
        const dialColor = PALETTES[palName]?.second ?? '#E4D9C2';
        node.overlay.circle(cx, cy, r).fill(dialColor);
        const hourAng = now * 0.03 - Math.PI / 2;
        const minAng = now * 0.35 - Math.PI / 2;
        const secAng = now * 2.5 - Math.PI / 2;
        node.overlay
          .moveTo(cx, cy)
          .lineTo(cx + Math.cos(hourAng) * (r * 0.58), cy + Math.sin(hourAng) * (r * 0.58))
          .stroke({ width: 3, color: INK });
        node.overlay
          .moveTo(cx, cy)
          .lineTo(cx + Math.cos(minAng) * (r * 0.84), cy + Math.sin(minAng) * (r * 0.84))
          .stroke({ width: 2.3, color: INK });
        node.overlay
          .moveTo(cx, cy)
          .lineTo(cx + Math.cos(secAng) * (r * 0.94), cy + Math.sin(secAng) * (r * 0.94))
          .stroke({ width: 1.4, color: '#C4483B' });
        node.overlay.circle(cx, cy, 3).fill('#C4483B');
      } else if (node.artKind === 'pool' || node.artKind === 'fountain') {
        const ripPhase = (now * 0.7 + node.placed.x * 0.01) % 1;
        const cy = node.artKind === 'pool' ? -node.baseH * 0.5 : -node.baseH * 0.35;
        node.overlay
          .ellipse(0, cy, node.baseW * (0.14 + ripPhase * 0.22), node.baseH * (0.05 + ripPhase * 0.1))
          .stroke({ width: 2, color: '#FFFFFF', alpha: (1 - ripPhase) * 0.5 });
      } else if (node.artKind === 'windmill') {
        // Rotating breeze blades overlay centered near windmill hub
        const hubY = -node.baseH * 0.68;
        const ang = now * 0.9 + node.placed.x * 0.01;
        const armLen = node.baseW * 0.36;
        for (let k = 0; k < 4; k++) {
          const a = ang + (k * Math.PI) / 2;
          node.overlay
            .moveTo(0, hubY)
            .lineTo(Math.cos(a) * armLen, hubY + Math.sin(a) * armLen)
            .stroke({ width: 4, color: '#7A5A3C', alpha: 0.7 });
        }
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
    this.ambientLayer.clear();
    this.fxLayer.clear();

    // 1. Dust motes inside sunlit indoor rooms
    if (!room.outdoor && !view.night) {
      const win = WINDOWS[view.roomId];
      for (const m of this.motes) {
        m.x += m.vx * dt;
        m.y += (m.vy + Math.sin(now * 1.4 + m.phase) * 4) * dt;
        if (m.x > 1920) m.x = 0;
        if (m.y > 820) m.y = 80;
        const inBeam = win ? m.x > win[0] - 80 && m.x < win[0] + win[2] + 240 && m.y > win[1] : true;
        const alpha = (inBeam ? m.alpha * 1.5 : m.alpha * 0.45) * (0.6 + 0.4 * Math.sin(now * 2 + m.phase));
        this.ambientLayer.circle(m.x, m.y, m.radius).fill({ color: '#FFFBE4', alpha });
      }
    } else if (room.outdoor) {
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
    }

    // 2. Active FX particles
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
    const dt = Math.min(0.05, ticker.deltaMS / 1000);
    const now = performance.now() / 1000;

    // Smooth room cross-fade transition
    if (this.transitionAlpha < 1) {
      this.transitionAlpha = Math.min(1, this.transitionAlpha + dt * 4.5);
      this.root.alpha = this.transitionAlpha;
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

    // Humans & Baby
    for (const node of this.humanNodes.values()) {
      this.animateHumanRig(node, dt, now);
    }

    // Pulse edit selection outline if active
    if (this.view.editMode && this.view.selectedUid) {
      this.syncSelection();
    }
  };
}

export { animalArt };
