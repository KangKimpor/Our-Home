import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { animalArt } from '../art/animals';
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(2, Math.round(w * 2))}" height="${Math.max(2, Math.round(h * 2))}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
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
  g.rect(x - 10, y - 10, w + 20, h + 20).fill('#FBF7EC');
  g.rect(x - 10, y - 10, w + 20, h + 20).stroke({ width: 4, color: INK });
  g.rect(x, y, w, h).fill(night ? '#3F5578' : sky);
  if (night) {
    g.circle(x + w * 0.7, y + h * 0.28, 14).fill('#FBF7EC');
    g.circle(x + w * 0.7 + 6, y + h * 0.28 - 5, 12).fill('#3F5578');
    for (let i = 0; i < 6; i++) {
      g.circle(x + 16 + ((i * 47) % (w - 30)), y + 18 + ((i * 31) % (h - 40)), 2).fill('#FBF7EC');
    }
  } else {
    g.circle(x + w * 0.74, y + h * 0.24, 13).fill('#E9C65B');
    g.ellipse(x + w * 0.28, y + h * 0.24, 22, 9).fill('#FBF7EC');
    g.ellipse(x + w * 0.42, y + h * 0.28, 26, 10).fill('#FBF7EC');
    g.rect(x, y + h * 0.66, w, h * 0.34).fill('#A8BE86');
    g.ellipse(x + w * 0.3, y + h * 0.7, 40, 18).fill('#8FA96F');
  }
  g.moveTo(x + w / 2, y).lineTo(x + w / 2, y + h).stroke({ width: 4, color: INK });
  g.moveTo(x, y + h / 2).lineTo(x + w, y + h / 2).stroke({ width: 4, color: INK });
  g.rect(x - 16, y + h + 6, w + 32, 9).fill('#E4D9C2');
}

function paintRoom(g: Graphics, roomId: RoomId, night: boolean): void {
  const room = ROOMS[roomId];
  const pal = ROOM_PALETTES[roomId];
  const floorTop = room.floorTop;
  g.clear();

  if (room.outdoor) {
    g.rect(0, 0, 1920, 884).fill(night ? '#33445E' : pal.sky);
    // soft far hills
    g.ellipse(320, floorTop + 30, 520, 190).fill(night ? '#31473E' : '#B8CFA8');
    g.ellipse(1180, floorTop + 46, 640, 220).fill(night ? '#2C4239' : '#A9C596');
    g.ellipse(1720, floorTop + 20, 460, 180).fill(night ? '#355047' : '#B4CB9E');
    if (night) {
      g.circle(1640, 120, 62).fill('#FBF7EC');
      g.circle(1668, 100, 54).fill('#33445E');
      for (let i = 0; i < 18; i++) {
        g.circle((i * 173 + 90) % 1880, 40 + ((i * 97) % 260), 2.4).fill('#FBF7EC');
      }
    } else {
      g.circle(1640, 120, 58).fill('#F7DFA0');
      g.ellipse(420, 110, 120, 30).fill('#FBF7EC');
      g.ellipse(500, 96, 84, 26).fill('#FBF7EC');
      g.ellipse(1240, 150, 140, 28).fill('#FBF7EC');
    }
    g.rect(0, floorTop, 1920, 884 - floorTop).fill(night ? '#3F5B49' : pal.floor);
    g.rect(0, floorTop, 1920, 18).fill(night ? '#4B6B55' : pal.floorAlt);
    if (roomId === 'garden') {
      for (let x = 60; x < 1920; x += 130) {
        g.moveTo(x, floorTop + 220).lineTo(x + 8, floorTop + 150).stroke({ width: 4, color: night ? '#4F6F52' : '#7FA06B' });
        g.circle(x + 8, floorTop + 146, 7).fill(night ? '#6E6E68' : '#E8A6B0');
      }
    }
    if (roomId === 'porch') {
      g.rect(0, floorTop - 74, 1920, 16).fill(night ? '#7A5A3C' : '#B08A5E');
      g.rect(0, floorTop - 74, 1920, 16).stroke({ width: 3, color: INK });
      for (let x = 80; x <= 1880; x += 180) {
        g.rect(x, floorTop - 58, 12, 58).fill(night ? '#7A5A3C' : '#B08A5E');
        g.rect(x, floorTop - 58, 12, 58).stroke({ width: 3, color: INK });
      }
    }
    if (roomId === 'farm') {
      g.rect(130, floorTop - 250, 320, 250).fill(night ? '#7A5A3C' : '#C4483B');
      g.rect(130, floorTop - 250, 320, 250).stroke({ width: 4, color: INK });
      g.poly([110, floorTop - 250, 290, floorTop - 340, 470, floorTop - 250]).fill(night ? '#5A4130' : '#8C6B4C');
      g.poly([110, floorTop - 250, 290, floorTop - 340, 470, floorTop - 250]).stroke({ width: 4, color: INK });
      g.rect(240, floorTop - 150, 100, 150).fill(night ? '#5A4130' : '#8C6B4C');
      g.rect(240, floorTop - 150, 100, 150).stroke({ width: 4, color: INK });
    }
    return;
  }

  g.rect(0, 0, 1920, floorTop).fill(night ? dim(pal.wall, 0.72) : pal.wall);
  g.rect(0, 0, 1920, 26).fill(night ? dim(pal.wallShade, 0.7) : pal.wallShade);
  g.rect(0, 0, 1920, 26).stroke({ width: 3, color: INK });
  g.rect(0, floorTop - 20, 1920, 20).fill(night ? dim(pal.trim, 0.7) : pal.trim);
  g.rect(0, floorTop - 20, 1920, 20).stroke({ width: 3, color: INK });
  g.rect(0, floorTop, 1920, 884 - floorTop).fill(night ? dim(pal.floor, 0.62) : pal.floor);

  for (let y = floorTop + 46; y < 884; y += 58) {
    g.moveTo(0, y).lineTo(1920, y).stroke({ width: 2, color: night ? dim(pal.floorAlt, 0.6) : pal.floorAlt, alpha: 0.7 });
  }
  for (let x = -200; x < 2100; x += 260) {
    g.moveTo(x, floorTop).lineTo(x + 120, 884).stroke({ width: 2, color: night ? dim(pal.floorAlt, 0.55) : pal.floorAlt, alpha: 0.45 });
  }

  const windows: Partial<Record<RoomId, [number, number, number, number]>> = {
    living: [250, 120, 250, 210],
    bedroom: [196, 118, 210, 180],
    kitchen: [1060, 116, 270, 190],
    bathroom: [220, 150, 150, 120],
    studio: [1440, 96, 300, 250],
    nursery: [1420, 120, 230, 190],
  };
  const win = windows[roomId];
  if (win) {
    drawWindow(g, win[0], win[1], win[2], win[3], night, pal.sky);
  }

  if (night) {
    for (const [x, y] of [
      [360, 300],
      [1640, 260],
      [940, 120],
    ]) {
      g.circle(x, y, 70).fill({ color: '#F7DFA0', alpha: 0.08 });
      g.circle(x, y, 40).fill({ color: '#F7DFA0', alpha: 0.12 });
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
      sprite.width = pet.species === 'bird' ? 76 : 128;
      sprite.height = pet.species === 'bird' ? 76 : 128;
      sprite.x = pet.x;
      sprite.y = pet.y + 6;
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
      sprite.width = 132;
      sprite.height = 132;
      sprite.x = visitor.x;
      sprite.y = visitor.y + 8;
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
      const size = spot.kind === 'owl' ? 120 : spot.kind === 'hedgehog' ? 86 : 58;
      sprite.width = size;
      sprite.height = size;
      sprite.x = spot.x;
      sprite.y = spot.y;
      sprite.visible = !!texture;
    }
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
