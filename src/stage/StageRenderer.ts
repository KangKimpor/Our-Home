import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { animalArt } from '../art/animals';
import { babyArt, characterArt } from '../art/characters';
import { itemArt } from '../art/items';
import { ITEMS_BY_ID } from '../data/items';
import { ROOMS, ROOM_PALETTES } from '../data/rooms';
import { VISITORS_BY_ID } from '../data/visitors';
import type { GameState, HeartBubble, PlacedItem, RoomId } from '../game/types';
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
  sprite: Sprite;
}

const textureCache = new Map<string, Texture>();
const textureLoading = new Set<string>();

function svgDataUrl(body: string, w: number, h: number): string {
  const defs = `<defs><filter id="oh-drop" x="-12%" y="-12%" width="124%" height="128%"><feDropShadow dx="0" dy="2.2" stdDeviation="1.6" flood-color="#2B2521" flood-opacity="0.16"/></filter></defs>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(2, Math.round(w * 2))}" height="${Math.max(2, Math.round(h * 2))}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`;
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

function drawWindow(g: Graphics, x: number, y: number, w: number, h: number, night: boolean, sky: string): void {
  // Soft drop shadow behind window frame
  g.roundRect(x - 14, y - 8, w + 28, h + 30, 8).fill({ color: '#2B2521', alpha: 0.12 });

  // Outer wooden casing
  g.roundRect(x - 14, y - 14, w + 28, h + 28, 6).fill('#FBF7EC');
  g.roundRect(x - 14, y - 14, w + 28, h + 28, 6).stroke({ width: 3.5, color: INK });
  g.rect(x - 6, y - 6, w + 12, h + 12).fill('#E8DEC8');

  // Sky glass pane
  g.rect(x, y, w, h).fill(night ? '#2D4060' : sky);
  g.rect(x, y, w, h * 0.45).fill({ color: night ? '#1F2E48' : '#FFFFFF', alpha: night ? 0.28 : 0.18 });

  if (night) {
    // Glowing moon & stars
    g.circle(x + w * 0.72, y + h * 0.28, 22).fill({ color: '#FBF7EC', alpha: 0.18 });
    g.circle(x + w * 0.72, y + h * 0.28, 14).fill('#FBF7EC');
    g.circle(x + w * 0.72 + 6, y + h * 0.28 - 5, 11).fill('#2D4060');
    for (let i = 0; i < 8; i++) {
      const sx = x + 18 + ((i * 43) % (w - 36));
      const sy = y + 16 + ((i * 29) % Math.max(24, h * 0.56));
      g.circle(sx, sy, i % 2 === 0 ? 2.2 : 1.5).fill('#FBF7EC');
    }
    // Distant night hills & trees (strictly within [x, x + w])
    g.ellipse(x + w * 0.35, y + h * 0.78, w * 0.33, h * 0.2).fill('#283A38');
    g.ellipse(x + w * 0.68, y + h * 0.81, w * 0.3, h * 0.18).fill('#213130');
    g.rect(x, y + h * 0.76, w, h * 0.24).fill('#243532');
  } else {
    // Warm sun with soft halo
    g.circle(x + w * 0.74, y + h * 0.24, 22).fill({ color: '#FCE9A8', alpha: 0.42 });
    g.circle(x + w * 0.74, y + h * 0.24, 14).fill('#F3CE68');
    // Fluffy layered clouds
    g.ellipse(x + w * 0.28, y + h * 0.25, 24, 10).fill('#FBF7EC');
    g.ellipse(x + w * 0.36, y + h * 0.22, 18, 11).fill('#FFFFFF');
    g.ellipse(x + w * 0.46, y + h * 0.27, 20, 9).fill('#FBF7EC');
    // Rolling hills & distant trees outside window (strictly within [x, x + w])
    g.ellipse(x + w * 0.35, y + h * 0.74, w * 0.33, h * 0.2).fill('#A3BF84');
    g.ellipse(x + w * 0.68, y + h * 0.76, w * 0.3, h * 0.19).fill('#8EAA70');
    g.rect(x, y + h * 0.73, w, h * 0.27).fill('#8FA96F');
    g.circle(x + w * 0.22, y + h * 0.65, 15).fill('#759457');
    g.circle(x + w * 0.3, y + h * 0.68, 12).fill('#84A364');
  }

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

  // Cozy fabric curtains & wooden rod on left/right
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

  // Softly feathered 3-step sunbeam / moonbeam cast across room
  const beamColor = night ? '#B8D0F0' : '#FFF6D6';
  g.poly([
    x + 6, y + h + 20,
    x + w - 6, y + h + 20,
    x + w + 90, y + h + 160,
    x - 14, y + h + 160,
  ]).fill({ color: beamColor, alpha: night ? 0.035 : 0.075 });
  g.poly([
    x + 6, y + h + 20,
    x + w - 6, y + h + 20,
    x + w + 135, y + h + 235,
    x - 24, y + h + 235,
  ]).fill({ color: beamColor, alpha: night ? 0.025 : 0.05 });
  g.poly([
    x + 6, y + h + 20,
    x + w - 6, y + h + 20,
    x + w + 175, y + h + 305,
    x - 32, y + h + 305,
  ]).fill({ color: beamColor, alpha: night ? 0.015 : 0.03 });
}

function paintRoom(g: Graphics, roomId: RoomId, night: boolean): void {
  const room = ROOMS[roomId];
  const pal = ROOM_PALETTES[roomId];
  const floorTop = room.floorTop;
  g.clear();

  if (room.outdoor) {
    // Rich sky with horizon glow
    g.rect(0, 0, 1920, 884).fill(night ? '#26354D' : pal.sky);
    g.rect(0, 0, 1920, floorTop * 0.55).fill({ color: night ? '#1B273B' : '#FFFFFF', alpha: night ? 0.35 : 0.22 });
    g.rect(0, floorTop - 110, 1920, 110).fill({ color: night ? '#3A4E6B' : '#FCEFD2', alpha: night ? 0.25 : 0.38 });

    // Layered rolling hills
    g.ellipse(340, floorTop + 24, 560, 210).fill(night ? '#2E453B' : '#B7CF9F');
    g.ellipse(1180, floorTop + 42, 680, 240).fill(night ? '#273D34' : '#A4C08E');
    g.ellipse(1720, floorTop + 18, 490, 195).fill(night ? '#314B41' : '#B0CA98');

    // Distant trees along horizon
    for (const tx of [140, 480, 820, 1340, 1620, 1830]) {
      const ty = floorTop - 28;
      g.circle(tx, ty - 20, 34).fill(night ? '#233830' : '#7E9E68');
      g.circle(tx + 22, ty - 10, 26).fill(night ? '#294037' : '#8DAB74');
    }

    if (night) {
      g.circle(1640, 120, 84).fill({ color: '#FBF7EC', alpha: 0.12 });
      g.circle(1640, 120, 58).fill('#FBF7EC');
      g.circle(1666, 102, 50).fill('#26354D');
      for (let i = 0; i < 24; i++) {
        g.circle((i * 173 + 90) % 1880, 36 + ((i * 97) % 260), i % 3 === 0 ? 2.8 : 1.8).fill({
          color: '#FBF7EC',
          alpha: i % 2 === 0 ? 0.95 : 0.65,
        });
      }
    } else {
      g.circle(1640, 120, 86).fill({ color: '#FCE9A8', alpha: 0.35 });
      g.circle(1640, 120, 56).fill('#F5D77F');
      // Soft layered clouds
      for (const [cx, cy, s] of [
        [420, 110, 1],
        [920, 86, 0.82],
        [1280, 146, 1.08],
      ]) {
        g.ellipse(cx, cy + 6, 118 * s, 28 * s).fill({ color: '#D8E6EC', alpha: 0.6 });
        g.ellipse(cx, cy, 116 * s, 28 * s).fill('#FBF7EC');
        g.ellipse(cx - 36 * s, cy - 12 * s, 56 * s, 24 * s).fill('#FFFFFF');
        g.ellipse(cx + 34 * s, cy - 10 * s, 64 * s, 26 * s).fill('#FBF7EC');
      }
    }

    // Lush lawn / ground
    g.rect(0, floorTop, 1920, 884 - floorTop).fill(night ? '#354F3F' : pal.floor);
    g.rect(0, floorTop, 1920, 22).fill(night ? '#42614D' : pal.floorAlt);
    g.moveTo(0, floorTop).lineTo(1920, floorTop).stroke({ width: 3, color: INK, alpha: 0.45 });

    // Subtle grass tufts across outdoor ground
    for (let i = 0; i < 28; i++) {
      const gx = 70 + ((i * 197) % 1780);
      const gy = floorTop + 48 + ((i * 83) % (840 - floorTop - 60));
      const col = night ? '#486954' : '#6E8F5B';
      g.moveTo(gx, gy).lineTo(gx - 5, gy - 11).stroke({ width: 2.2, color: col, alpha: 0.65 });
      g.moveTo(gx + 4, gy).lineTo(gx + 7, gy - 12).stroke({ width: 2.2, color: col, alpha: 0.65 });
    }

    if (roomId === 'garden') {
      // Charming garden fence along the horizon
      for (let x = 40; x < 1900; x += 68) {
        g.roundRect(x, floorTop - 52, 16, 54, 4).fill(night ? '#8A7B68' : '#F3ECE0');
        g.roundRect(x, floorTop - 52, 16, 54, 4).stroke({ width: 2.2, color: INK });
      }
      g.rect(24, floorTop - 36, 1872, 7).fill(night ? '#7A6C5B' : '#E5DBC8');
      g.rect(24, floorTop - 18, 1872, 7).fill(night ? '#7A6C5B' : '#E5DBC8');
      for (let x = 60; x < 1920; x += 130) {
        g.moveTo(x, floorTop + 220).lineTo(x + 8, floorTop + 150).stroke({ width: 4, color: night ? '#4F6F52' : '#6E8F5B' });
        g.circle(x + 8, floorTop + 146, 8).fill(night ? '#9C7280' : '#E8A6B0');
        g.circle(x + 8, floorTop + 146, 3.5).fill('#E9C65B');
      }
    }
    if (roomId === 'porch') {
      // Wooden deck planks on porch floor
      g.rect(0, floorTop, 1920, 884 - floorTop).fill(night ? '#684D35' : '#C49A6C');
      for (let y = floorTop + 42; y < 884; y += 46) {
        g.moveTo(0, y).lineTo(1920, y).stroke({ width: 2.2, color: night ? '#523B28' : '#A67D52', alpha: 0.75 });
      }
      // Porch balustrade
      g.rect(0, floorTop - 82, 1920, 18).fill(night ? '#7A5A3C' : '#B89062');
      g.rect(0, floorTop - 82, 1920, 18).stroke({ width: 3, color: INK });
      g.rect(0, floorTop - 14, 1920, 14).fill(night ? '#684C32' : '#A47D52');
      g.rect(0, floorTop - 14, 1920, 14).stroke({ width: 3, color: INK });
      for (let x = 70; x <= 1870; x += 120) {
        g.rect(x, floorTop - 64, 14, 50).fill(night ? '#8A6949' : '#CCA679');
        g.rect(x, floorTop - 64, 14, 50).stroke({ width: 2.5, color: INK });
      }
    }
    if (roomId === 'farm') {
      // Cozy red timber barn with white trim & loft window
      const bx = 120;
      const by = floorTop - 256;
      const bw = 330;
      const bh = 256;
      g.rect(bx, by, bw, bh).fill(night ? '#7A3E36' : '#C84B3C');
      g.rect(bx, by, bw, bh).stroke({ width: 4, color: INK });
      for (let x = bx + 42; x < bx + bw; x += 42) {
        g.moveTo(x, by).lineTo(x, by + bh).stroke({ width: 2, color: night ? '#5E2D27' : '#A8382B', alpha: 0.55 });
      }
      // Gambrel roof
      g.poly([bx - 24, by, bx + 65, by - 76, bx + bw / 2, by - 110, bx + bw - 65, by - 76, bx + bw + 24, by]).fill(
        night ? '#4D3829' : '#7A5A3C',
      );
      g.poly([bx - 24, by, bx + 65, by - 76, bx + bw / 2, by - 110, bx + bw - 65, by - 76, bx + bw + 24, by]).stroke({
        width: 4,
        color: INK,
      });
      // Barn double doors with X-bracing
      const dx = bx + 105;
      const dy = floorTop - 154;
      const dw = 120;
      const dh = 154;
      g.rect(dx, dy, dw, dh).fill(night ? '#5A4130' : '#8C6B4C');
      g.rect(dx, dy, dw, dh).stroke({ width: 4, color: INK });
      g.moveTo(dx, dy).lineTo(dx + dw, dy + dh).stroke({ width: 4, color: '#FBF7EC' });
      g.moveTo(dx + dw, dy).lineTo(dx, dy + dh).stroke({ width: 4, color: '#FBF7EC' });
      g.rect(dx, dy, dw, dh).stroke({ width: 3.5, color: '#FBF7EC' });
      // Hayloft window
      g.roundRect(bx + bw / 2 - 26, by + 26, 52, 46, 6).fill(night ? '#F5D77F' : '#3A2E25');
      g.roundRect(bx + bw / 2 - 26, by + 26, 52, 46, 6).stroke({ width: 3.5, color: '#FBF7EC' });
    }
    return;
  }

  // INDOOR ROOMS: Warm wallpaper, subtle vertical stripes, wainscoting, crown & baseboard
  const wallFill = night ? dim(pal.wall, 0.74) : pal.wall;
  const wallAlt = night ? dim(pal.wallShade, 0.72) : pal.wallShade;
  const trimFill = night ? dim(pal.trim, 0.74) : pal.trim;

  g.rect(0, 0, 1920, floorTop).fill(wallFill);

  // Subtle wallpaper stripes on upper wall
  const wainscotTop = floorTop - 116;
  for (let x = 48; x < 1920; x += 96) {
    g.rect(x, 28, 36, wainscotTop - 28).fill({ color: wallAlt, alpha: 0.32 });
  }

  // Crown molding at top
  g.rect(0, 0, 1920, 24).fill(wallAlt);
  g.rect(0, 0, 1920, 24).stroke({ width: 3, color: INK });
  g.rect(0, 24, 1920, 7).fill(trimFill);
  g.moveTo(0, 31).lineTo(1920, 31).stroke({ width: 2, color: INK, alpha: 0.55 });

  // Chair rail & recessed wainscoting panels along lower wall
  g.rect(0, wainscotTop, 1920, floorTop - wainscotTop).fill(wallAlt);
  g.rect(0, wainscotTop, 1920, 10).fill(trimFill);
  g.rect(0, wainscotTop, 1920, 10).stroke({ width: 2.5, color: INK });

  for (let x = 36; x < 1880; x += 184) {
    g.roundRect(x, wainscotTop + 20, 152, floorTop - wainscotTop - 48, 5).fill({
      color: wallFill,
      alpha: 0.55,
    });
    g.roundRect(x, wainscotTop + 20, 152, floorTop - wainscotTop - 48, 5).stroke({
      width: 2,
      color: INK,
      alpha: 0.28,
    });
  }

  // Chunky baseboard with shoe molding
  g.rect(0, floorTop - 22, 1920, 22).fill(trimFill);
  g.rect(0, floorTop - 22, 1920, 22).stroke({ width: 3, color: INK });
  g.rect(0, floorTop - 20, 1920, 4).fill({ color: '#FFFDF8', alpha: 0.35 });

  // Hardwood / tile floor with warm depth gradient and staggered plank joints
  const floorFill = night ? dim(pal.floor, 0.66) : pal.floor;
  const floorLine = night ? dim(pal.floorAlt, 0.58) : pal.floorAlt;
  g.rect(0, floorTop, 1920, 884 - floorTop).fill(floorFill);
  // Subtle ambient shadow directly below baseboard
  g.rect(0, floorTop, 1920, 18).fill({ color: '#2B2521', alpha: 0.12 });
  g.rect(0, 820, 1920, 64).fill({ color: '#2B2521', alpha: 0.07 });

  let rowIdx = 0;
  for (let y = floorTop + 44; y < 884; y += 54) {
    rowIdx++;
    // Alternating subtle plank tint
    if (rowIdx % 2 === 0) {
      g.rect(0, y - 54, 1920, 54).fill({ color: '#FFFDF8', alpha: 0.04 });
    }
    g.moveTo(0, y).lineTo(1920, y).stroke({ width: 2.2, color: floorLine, alpha: 0.8 });
    const offset = (rowIdx * 130) % 260;
    for (let x = -120 + offset; x < 1980; x += 260) {
      g.moveTo(x, y - 54).lineTo(x + 28, y).stroke({ width: 2, color: floorLine, alpha: 0.55 });
    }
  }

  const windows: Partial<Record<RoomId, [number, number, number, number]>> = {
    living: [250, 112, 250, 206],
    bedroom: [196, 112, 210, 178],
    kitchen: [230, 112, 240, 184],
    bathroom: [220, 144, 150, 120],
    studio: [1440, 92, 300, 244],
    nursery: [1420, 114, 230, 186],
  };
  const win = windows[roomId];
  if (win) {
    drawWindow(g, win[0], win[1], win[2], win[3], night, pal.sky);
  }

  if (night) {
    for (const [x, y] of [
      [380, 580],
      [940, 540],
      [1540, 580],
    ]) {
      g.circle(x, y, 160).fill({ color: '#F7DFA0', alpha: 0.06 });
      g.circle(x, y, 90).fill({ color: '#F7DFA0', alpha: 0.1 });
    }
  }
}


function dim(hex: string, factor: number): string {  const clean = hex.replace('#', '');
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

  private background = new Graphics();
  private itemLayer = new Container();
  private actorLayer = new Container();
  private bubbleLayer = new Container();
  private fxLayer = new Graphics();
  private hintLayer = new Container();
  private root = new Container();

  private itemNodes = new Map<string, { sprite: Sprite; itemId: string; placed: PlacedItem }>();
  private petNodes = new Map<string, Sprite>();
  private visitorNodes = new Map<string, Sprite>();
  private critterNodes = new Map<string, Sprite>();
  private humanNodes = new Map<string, Sprite>();
  private bubbleNodes = new Map<string, Container>();
  private selection = new Graphics();

  private view: StageView | null = null;
  private paintedRoom: RoomId | null = null;
  private paintedNight: boolean | null = null;
  private drag: DragState | null = null;
  private lastTapAt = 0;

  constructor(host: HTMLElement, callbacks: StageCallbacks) {
    this.host = host;
    this.callbacks = callbacks;
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
    this.root.addChild(this.background, this.itemLayer, this.actorLayer, this.bubbleLayer, this.fxLayer, this.hintLayer);
    this.root.addChild(this.selection);
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
    this.view = view;
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
      paintRoom(this.background, roomId, night);
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

  private syncItems(): void {
    const view = this.view;
    if (!view) return;
    const items = view.state.placed.filter((p) => p.roomId === view.roomId);
    const alive = new Set(items.map((p) => p.uid));
    for (const [uid, node] of this.itemNodes) {
      if (!alive.has(uid)) {
        node.sprite.destroy();
        this.itemNodes.delete(uid);
      }
    }
    for (const placed of items) {
      const def = ITEMS_BY_ID[placed.itemId];
      if (!def) continue;
      let node = this.itemNodes.get(placed.uid);
      if (node && node.itemId !== placed.itemId) {
        node.sprite.destroy();
        node = undefined;
        this.itemNodes.delete(placed.uid);
      }
      const art = itemArt(def);
      const texture = requestTexture(`item:${def.id}`, art.body, art.w, art.h, this.onRefresh);
      if (!node) {
        const sprite = new Sprite(texture ?? Texture.WHITE);
        sprite.anchor.set(0.5, 1);
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', (event) => this.onItemDown(event, placed.uid, sprite));
        this.itemLayer.addChild(sprite);
        node = { sprite, itemId: placed.itemId, placed };
        this.itemNodes.set(placed.uid, node);
      }
      node.placed = placed;
      node.sprite.texture = texture ?? Texture.WHITE;
      node.sprite.tint = texture ? 0xffffff : 0xf3efe0;
      node.sprite.visible = !!texture;
      const height = (def.width * art.h) / art.w;
      node.sprite.width = def.width;
      node.sprite.height = height;
      node.sprite.x = placed.x;
      node.sprite.y = placed.y;
      node.sprite.scale.x = placed.flip ? -Math.abs(node.sprite.scale.x) : Math.abs(node.sprite.scale.x);
      node.sprite.alpha = 1;
      node.sprite.zIndex = placed.hostUid ? 9000 + placed.y : isFlatItem(placed.itemId) ? placed.y - 10_000 : placed.y;
    }
    this.itemLayer.sortableChildren = true;
  }

  private syncActors(): void {
    const view = this.view;
    if (!view) return;
    const state = view.state;

    // Resident humans relaxing in rooms
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
    for (const [id, sprite] of this.humanNodes) {
      if (!humanAlive.has(id)) {
        sprite.destroy();
        this.humanNodes.delete(id);
      }
    }
    for (const h of activeHumans) {
      const id = `human:${view.roomId}:${h.charIndex}`;
      let key: string;
      let art: { w: number; h: number; body: string };
      let targetW: number;
      if (h.charIndex === 'baby') {
        const c0 = state.characters[0];
        key = `baby:${c0.skin}:${c0.outfit}:${c0.hair}`;
        art = babyArt({ skin: c0.skin, outfit: c0.outfit, hair: c0.hair });
        targetW = 86;
      } else {
        const look = state.characters[h.charIndex];
        const pose = h.pose ?? 'idle';
        key = `char:${look.skin}:${look.hair}:${look.hairStyle}:${look.outfit}:${pose}`;
        art = characterArt({
          skin: look.skin,
          hair: look.hair,
          hairStyle: look.hairStyle,
          outfit: look.outfit,
          pose,
        });
        targetW = 128;
      }
      const texture = requestTexture(key, art.body, art.w, art.h, this.onRefresh);
      let sprite = this.humanNodes.get(id);
      if (!sprite) {
        sprite = new Sprite(texture ?? Texture.WHITE);
        sprite.anchor.set(0.5, 1);
        this.actorLayer.addChild(sprite);
        this.humanNodes.set(id, sprite);
      }
      sprite.texture = texture ?? Texture.WHITE;
      sprite.width = targetW;
      sprite.height = (targetW * art.h) / art.w;
      sprite.x = h.x;
      sprite.y = h.y;
      sprite.zIndex = h.y;
      sprite.visible = !!texture;
    }

    const pets = state.pets.filter((p) => p.roomId === view.roomId);
    const petAlive = new Set(pets.map((p) => p.id));
    for (const [id, sprite] of this.petNodes) {
      if (!petAlive.has(id)) {
        sprite.destroy();
        this.petNodes.delete(id);
      }
    }
    for (const pet of pets) {
      const key = `pet:${pet.species}:${pet.coat}:${pet.state === 'sleep' ? 'sleep' : pet.state === 'walk' ? 'walk' : 'idle'}`;
      const pose = pet.state === 'sleep' ? 'sleep' : pet.state === 'walk' ? 'walk' : 'idle';
      const art = animalArt({ species: pet.species, coat: pet.coat, pose });
      const texture = requestTexture(key, art.body, art.w, art.h, this.onRefresh);
      let sprite = this.petNodes.get(pet.id);
      if (!sprite) {
        sprite = new Sprite(texture ?? Texture.WHITE);
        sprite.anchor.set(0.5, 1);
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', (event) => {
          event.stopPropagation();
          this.callbacks.onPet(pet.id);
        });
        this.actorLayer.addChild(sprite);
        this.petNodes.set(pet.id, sprite);
      }
      sprite.texture = texture ?? Texture.WHITE;
      sprite.width = pet.species === 'bird' ? 84 : 134;
      sprite.height = pet.species === 'bird' ? 84 : 134;
      sprite.x = pet.x;
      sprite.y = pet.y + 6;
      sprite.zIndex = pet.y + 10;
      sprite.visible = !!texture;
    }

    const visitors = state.visitors.active.filter((v) => v.roomId === view.roomId);
    const visitorAlive = new Set(visitors.map((v) => v.id));
    for (const [id, sprite] of this.visitorNodes) {
      if (!visitorAlive.has(id)) {
        sprite.destroy();
        this.visitorNodes.delete(id);
      }
    }
    for (const visitor of visitors) {
      const def = VISITORS_BY_ID[visitor.visitorId];
      if (!def) continue;
      const key = `visitor:${def.species}:${def.coat}`;
      const art = animalArt({ species: def.species, coat: def.coat, pose: 'idle' });
      const texture = requestTexture(key, art.body, art.w, art.h, this.onRefresh);
      let sprite = this.visitorNodes.get(visitor.id);
      if (!sprite) {
        sprite = new Sprite(texture ?? Texture.WHITE);
        sprite.anchor.set(0.5, 1);
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', (event) => {
          event.stopPropagation();
          this.callbacks.onVisitor(visitor.id);
        });
        this.actorLayer.addChild(sprite);
        this.visitorNodes.set(visitor.id, sprite);
      }
      sprite.texture = texture ?? Texture.WHITE;
      sprite.width = 136;
      sprite.height = 136;
      sprite.x = visitor.x;
      sprite.y = visitor.y + 8;
      sprite.zIndex = visitor.y + 12;
      sprite.visible = !!texture;
    }

    const critterSpots = ROOMS[view.roomId].critterSpots;
    const critterAlive = new Set(critterSpots.map((c) => c.id));
    for (const [id, sprite] of this.critterNodes) {
      if (!critterAlive.has(id)) {
        sprite.destroy();
        this.critterNodes.delete(id);
      }
    }
    for (const spot of critterSpots) {
      const key = `critter:${spot.kind}`;
      const art = animalArt({ species: spot.kind, coat: spot.kind === 'bee' ? 'golden' : 'brown', pose: 'idle' });
      const texture = requestTexture(key, art.body, art.w, art.h, this.onRefresh);
      let sprite = this.critterNodes.get(spot.id);
      if (!sprite) {
        sprite = new Sprite(texture ?? Texture.WHITE);
        sprite.anchor.set(0.5, 1);
        this.actorLayer.addChild(sprite);
        this.critterNodes.set(spot.id, sprite);
      }
      sprite.texture = texture ?? Texture.WHITE;
      const size = spot.kind === 'owl' ? 114 : spot.kind === 'hedgehog' ? 88 : 58;
      sprite.width = size;
      sprite.height = size;
      sprite.x = spot.x;
      sprite.y = spot.y;
      sprite.zIndex = spot.y;
      sprite.visible = !!texture;
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
        node.destroy({ children: true });
        this.bubbleNodes.delete(id);
      }
    }
    for (const bubble of bubbles) {
      let node = this.bubbleNodes.get(bubble.id);
      if (!node) {
        node = this.makeBubble(bubble);
        this.bubbleLayer.addChild(node);
        this.bubbleNodes.set(bubble.id, node);
      }
      node.zIndex = 5000;
    }
    this.bubbleLayer.sortableChildren = true;
  }

  private makeBubble(bubble: HeartBubble): Container {
    const container = new Container();
    const plate = new Graphics();
    plate.circle(0, 0, 34).fill({ color: '#FBF7EC', alpha: 0.94 });
    plate.circle(0, 0, 34).stroke({ width: 4, color: INK, alpha: 0.9 });
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
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.hitArea = { contains: (x: number, y: number) => x * x + y * y <= 44 * 44 };
    container.on('pointerdown', (event) => {
      event.stopPropagation();
      this.callbacks.onBubble(bubble.id);
    });
    return container;
  }

  private bubbleSourcePosition(bubble: HeartBubble): { x: number; y: number } {
    const state = this.view?.state;
    if (!state) return { x: bubble.x ?? 960, y: bubble.y ?? 420 };
    if (bubble.sourceType === 'pet') {
      const pet = state.pets.find((p) => p.id === bubble.sourceId);
      if (pet) return { x: pet.x, y: pet.y - (pet.species === 'bird' ? 90 : 145) };
    }
    if (bubble.sourceType === 'visitor') {
      const visitor = state.visitors.active.find((v) => v.id === bubble.visitorId || v.id === bubble.sourceId);
      if (visitor) return { x: visitor.x, y: visitor.y - 150 };
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
    this.selection
      .roundRect(placed.x - w / 2 - 10, placed.y - h - 10, w + 20, h + 20, 12)
      .stroke({ width: 5, color: '#E8A6B0', alpha: 0.95 });
    this.selection
      .roundRect(placed.x - w / 2 - 10, placed.y - h - 10, w + 20, h + 20, 12)
      .fill({ color: '#FBF7EC', alpha: 0.12 });
  }

  private onItemDown = (event: { stopPropagation: () => void; global: { x: number; y: number } }, uid: string, sprite: Sprite): void => {
    event.stopPropagation();
    const view = this.view;
    if (!view) return;
    if (!view.editMode) {
      this.callbacks.onSelectItem(uid);
      return;
    }
    const placed = view.state.placed.find((p) => p.uid === uid);
    if (!placed) return;
    this.drag = {
      uid,
      offsetX: event.global.x - placed.x,
      offsetY: event.global.y - placed.y,
      startX: event.global.x,
      startY: event.global.y,
      moved: false,
      sprite,
    };
    sprite.alpha = 0.82;
    this.callbacks.onSelectItem(uid);
  };

  private onStageDown = (event: { global: { x: number; y: number } }): void => {
    this.lastTapAt = Date.now();
    void event;
  };

  private onStageMove = (event: { global: { x: number; y: number } }): void => {
    if (!this.drag) return;
    const dx = event.global.x - this.drag.startX;
    const dy = event.global.y - this.drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 8) this.drag.moved = true;
    const { sprite } = this.drag;
    sprite.x = event.global.x - this.drag.offsetX;
    sprite.y = event.global.y - this.drag.offsetY;
    sprite.alpha = 0.68;
  };

  private onStageUp = (event: { global: { x: number; y: number } }): void => {
    if (this.drag) {
      const drag = this.drag;
      this.drag = null;
      drag.sprite.alpha = 1;
      if (drag.moved) {
        this.callbacks.onMoveItem(drag.uid, event.global.x - drag.offsetX, event.global.y - drag.offsetY);
      } else {
        this.callbacks.onSelectItem(drag.uid);
      }
      return;
    }
    if (Date.now() - this.lastTapAt < 600) {
      const view = this.view;
      if (view) this.callbacks.onStageTap(event.global.x, event.global.y);
      this.lastTapAt = 0;
    }
  };

  private onTick = (): void => {
    if (!this.view || !this.ready) return;
    const now = Date.now() / 1000;
    for (const [id, node] of this.bubbleNodes) {
      const bubble = this.view.state.bubbles.find((b) => b.id === id);
      if (!bubble) continue;
      const pos = this.bubbleSourcePosition(bubble);
      node.x = pos.x;
      node.y = pos.y + Math.sin(now * 2 + id.length) * 6;
      node.scale.set(1 + Math.sin(now * 3 + id.length) * 0.04);
    }
    for (const pet of this.view.state.pets) {
      if (pet.roomId !== this.view.roomId) continue;
      const sprite = this.petNodes.get(pet.id);
      if (!sprite) continue;
      sprite.y = pet.y + 6 + (pet.state === 'sleep' ? 0 : Math.sin(now * 2.2 + pet.name.length) * 1.6);
    }
  };
}
