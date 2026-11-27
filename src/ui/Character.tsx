import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { EMOTE_ICON_URLS, isAssetLoaded, loadAndDecodeImage } from '../game/assets';
import {
  characterHop,
  characterPlaced,
  characterRest,
  characterTapped,
  characterWalkTo,
  clampCharacterPos,
  createCharacter,
  keyboardLookAhead,
  resolveCharacterOutfit,
  stepCharacter,
  stepControlledCharacter,
  stepKeyboardCharacter,
  walkFrameOf,
  type CharacterDef,
  type CharacterState,
} from '../game/characters';
import { depthOf, itemSize } from '../game/layout';
import {
  EMOTE_DURATION_MS,
  MOVE_BROADCAST_INTERVAL_MS,
  type CharacterControl,
  type CharMoveEvent,
  type EmoteId,
  type PlayerRole,
  type RoomLiveEvent,
} from '../game/multiplayer';
import { versionedAssetUrl } from '../game/version';
import type { StageContext } from './Stage';
import type { LiveBus } from './useMultiplayer';

const MOUSE_TAP_SLOP = 6;
const TOUCH_TAP_SLOP = 10;

/** Imperative handle App uses to steer the local player's character (tap-to-walk). */
export interface CharacterController {
  /** Walks to a floor spot; returns the clamped destination. */
  walkTo: (x: number, y: number) => { x: number; y: number };
}

interface Props {
  def: CharacterDef;
  outfitId?: string;
  stage: StageContext;
  onInteract?: () => void;
  /** Who drives this character on this screen (default: strolls on its own). */
  control?: CharacterControl;
  /** This device's player role (sent along with pokes). */
  myRole?: PlayerRole | null;
  /** Incoming live events from the partner's device. */
  bus?: LiveBus;
  /** Broadcasts a live event to the partner's device. */
  send?: (event: RoomLiveEvent) => void;
  /** Changes whenever a partner joins or leaves, so the local player re-announces where they stand. */
  partnersKey?: string;
  controllerRef?: MutableRefObject<CharacterController | null>;
}

const KEY_DIRS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  a: [-1, 0],
  d: [1, 0],
  w: [0, -1],
  s: [0, 1],
};

function keyDirOf(e: KeyboardEvent): [number, number] | undefined {
  return KEY_DIRS[e.key] ?? KEY_DIRS[e.key.toLowerCase()];
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== 'function') return false;
  return Boolean(el.closest('input, textarea, select, [contenteditable="true"]'));
}

/**
 * An interactive resident character with a 4-frame hand-drawn walk cycle. Depending on `control`
 * it strolls around on its own (`auto`), follows its player's taps / drags / keys (`local`), or
 * mirrors the partner's live movement (`remote`). Taps make it hop with a floating heart on both
 * screens, and emotes float above its head in a hand-drawn bubble.
 */
export function Character({
  def,
  outfitId,
  stage,
  onInteract,
  control = 'auto',
  myRole = null,
  bus,
  send,
  partnersKey = '',
  controllerRef,
}: Props) {
  const outfit = resolveCharacterOutfit(def, outfitId);
  const { w, h } = itemSize({ sprite: outfit.sprite, height: def.height });
  const { w: walkW, h: walkH } = itemSize({ sprite: outfit.walkSprite, height: def.height });
  const idleUrl = versionedAssetUrl(`/sprites/${outfit.sprite}.png`);
  const walkUrl = versionedAssetUrl(`/sprites/${outfit.walkSprite}.png`);

  const state = useRef<CharacterState>(createCharacter(def));
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const walkReady = useRef(isAssetLoaded(walkUrl));
  const reducedMotion = useRef(false);
  const drag = useRef<{
    id: number;
    sx: number;
    sy: number;
    lastClientX: number;
    lastClientY: number;
    offsetX: number;
    offsetY: number;
    slop: number;
    moved: boolean;
    /** The partner steers this character: a swipe on it is never a drag (and not a tap either). */
    locked: boolean;
  } | null>(null);
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const controlRef = useRef<CharacterControl>(control);
  controlRef.current = control;
  const sendRef = useRef(send);
  sendRef.current = send;
  const myRoleRef = useRef(myRole);
  myRoleRef.current = myRole;

  /** Live-mode bookkeeping: throttled broadcasts, held keys, partner catch-up speed. */
  const live = useRef({
    lastSent: 0,
    keys: new Map<string, [number, number]>(),
    keyWalking: false,
    remoteDrag: false,
    remoteSpeed: 1,
  });

  const [dragging, setDragging] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const [emote, setEmote] = useState<{ emote: EmoteId; key: number } | null>(null);

  const broadcastMove = (mode: CharMoveEvent['mode'], target?: { x: number; y: number }) => {
    const s = state.current;
    const x = Math.round(s.x);
    const y = Math.round(s.y);
    live.current.lastSent = performance.now();
    sendRef.current?.({
      type: 'char_move',
      role: def.id,
      x,
      y,
      tx: Math.round(target?.x ?? (mode === 'walk' ? s.tx : x)),
      ty: Math.round(target?.y ?? (mode === 'walk' ? s.ty : y)),
      facing: s.facing,
      mode,
    });
  };
  const broadcastRef = useRef(broadcastMove);
  broadcastRef.current = broadcastMove;

  // Ensure the walk sprite strip is decoded (already cached when mounted via AssetPreloader).
  useEffect(() => {
    if (isAssetLoaded(walkUrl)) {
      walkReady.current = true;
      return;
    }
    const controller = new AbortController();
    walkReady.current = false;
    void loadAndDecodeImage(walkUrl, controller.signal).then(
      () => {
        if (!controller.signal.aborted) walkReady.current = true;
      },
      () => {
        // Fallback stroll animation remains active if standalone load fails.
      },
    );
    return () => controller.abort();
  }, [walkUrl]);

  // Respect user reduced-motion preference for frame cycling.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Switching who drives this character: settle in place (or resume strolling when left alone).
  const shownControl = useRef<CharacterControl>(control);
  useEffect(() => {
    if (shownControl.current === control) return;
    shownControl.current = control;
    const s = state.current;
    live.current.keys.clear();
    live.current.keyWalking = false;
    live.current.remoteDrag = false;
    live.current.remoteSpeed = 1;
    if (control === 'auto') {
      state.current = { ...characterRest(s), timer: 1.2 + Math.random() * 1.6 };
    } else {
      state.current = characterRest(s);
      if (control === 'local') broadcastRef.current('idle');
    }
  }, [control]);

  // When a partner joins (or picks a role), tell them where our character is.
  useEffect(() => {
    if (control !== 'local' || !partnersKey) return;
    const s = state.current;
    broadcastRef.current(s.mode === 'walk' ? 'walk' : 'idle');
  }, [control, partnersKey]);

  // Tap-to-walk handle for App (local player only).
  useEffect(() => {
    if (!controllerRef) return;
    controllerRef.current = {
      walkTo: (x, y) => {
        state.current = characterWalkTo(state.current, x, y);
        broadcastRef.current(state.current.mode === 'walk' ? 'walk' : 'idle');
        return { x: state.current.tx, y: state.current.ty };
      },
    };
    return () => {
      controllerRef.current = null;
    };
  }, [controllerRef]);

  // Incoming partner actions.
  useEffect(() => {
    if (!bus) return;
    const offMove = bus.on('char_move', (e) => {
      if (e.role !== def.id || controlRef.current !== 'remote') return;
      const s = state.current;
      const l = live.current;
      if (e.mode === 'drag') {
        l.remoteDrag = true;
        state.current = { ...s, tx: e.x, ty: e.y, mode: 'idle', walkPhase: 0, facing: e.facing };
        return;
      }
      l.remoteDrag = false;
      const target = e.mode === 'walk' ? { x: e.tx, y: e.ty } : { x: e.x, y: e.y };
      // Hurry when we are further from the destination than the partner's character is.
      const remaining = Math.hypot(target.x - s.x, target.y - s.y);
      const theirs = Math.max(1, Math.hypot(target.x - e.x, target.y - e.y));
      l.remoteSpeed = e.mode === 'walk' ? Math.min(3, Math.max(1, remaining / theirs)) : 2.2;
      const next = characterWalkTo(s.mode === 'happy' ? { ...s, mode: 'idle' } : s, target.x, target.y);
      state.current =
        s.mode === 'happy'
          ? { ...next, mode: 'happy', timer: s.timer }
          : next.mode === 'idle'
            ? { ...next, facing: e.facing }
            : next;
    });
    const offPoke = bus.on('char_poke', (e) => {
      if (e.targetRole !== def.id) return;
      state.current =
        controlRef.current === 'auto' ? characterTapped(state.current) : characterHop(state.current);
      setHeartKey((k) => k + 1);
    });
    const offEmote = bus.on('char_emote', (e) => {
      if (e.role !== def.id) return;
      setEmote({ emote: e.emote, key: Date.now() + Math.random() });
    });
    return () => {
      offMove();
      offPoke();
      offEmote();
    };
  }, [bus, def.id]);

  // Emote bubbles float for a few seconds, then drift away.
  useEffect(() => {
    if (!emote) return;
    const timer = window.setTimeout(() => setEmote(null), EMOTE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [emote]);

  // Desktop keyboard stroll (WASD / arrow keys) for the local player's character.
  useEffect(() => {
    if (control !== 'local') return;
    const l = live.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const dir = keyDirOf(e);
      if (!dir) return;
      e.preventDefault();
      l.keys.set(e.key.toLowerCase(), dir);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      l.keys.delete(e.key.toLowerCase());
    };
    const onBlur = () => l.keys.clear();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      l.keys.clear();
    };
  }, [control]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let shownMode = '';
    let shownFacing = 0;
    let shownStrip: boolean | null = null;
    let shownFrame = -1;
    let shownX = NaN;
    let shownY = NaN;

    const applyDom = (s: CharacterState, isDragging: boolean) => {
      const root = rootRef.current;
      if (root) {
        root.style.transform = `translate3d(${s.x - w / 2}px, ${s.y - h}px, 0)`;
        root.style.zIndex = String(isDragging ? 5000 : depthOf('floor', s.y));
        if (s.mode !== shownMode) {
          root.dataset.mode = s.mode;
        }
        const rx = Math.round(s.x);
        const ry = Math.round(s.y);
        if (rx !== shownX || ry !== shownY) {
          shownX = rx;
          shownY = ry;
          root.dataset.x = String(rx);
          root.dataset.y = String(ry);
        }
      }
      if (s.mode !== shownMode && animRef.current) {
        animRef.current.dataset.mode = shownMode = s.mode;
      }
      if (s.facing !== shownFacing && flipRef.current) {
        shownFacing = s.facing;
        const flip = s.facing === def.spriteFacing ? 1 : -1;
        flipRef.current.style.transform = `scaleX(${flip})`;
      }

      const useStrip = s.mode === 'walk' && walkReady.current && !reducedMotion.current;
      const frameIdx = useStrip ? walkFrameOf(s, outfit.walkFrames) : 0;

      if (useStrip !== shownStrip) {
        shownStrip = useStrip;
        shownFrame = -1;
        if (animRef.current) {
          animRef.current.dataset.walkStrip = useStrip ? '1' : '0';
        }
        const frameEl = frameRef.current;
        if (frameEl) {
          frameEl.style.width = `${useStrip ? walkW : w}px`;
          frameEl.style.height = `${useStrip ? walkH : h}px`;
        }
        const imgEl = imgRef.current;
        if (imgEl) {
          imgEl.src = useStrip ? walkUrl : idleUrl;
          imgEl.style.width = `${useStrip ? walkW * outfit.walkFrames : w}px`;
          imgEl.style.height = `${useStrip ? walkH : h}px`;
        }
      }

      if (frameIdx !== shownFrame) {
        shownFrame = frameIdx;
        if (animRef.current) {
          if (useStrip) {
            animRef.current.dataset.walkFrame = String(frameIdx);
          } else {
            delete animRef.current.dataset.walkFrame;
          }
        }
        const imgEl = imgRef.current;
        if (imgEl) {
          imgEl.style.transform = useStrip ? `translate3d(${-frameIdx * walkW}px, 0, 0)` : 'translate3d(0, 0, 0)';
        }
      }
    };

    applyDom(state.current, false);

    const stepLocal = (s: CharacterState, dt: number, now: number): CharacterState => {
      const l = live.current;
      let dirX = 0;
      let dirY = 0;
      for (const [dx, dy] of l.keys.values()) {
        dirX += dx;
        dirY += dy;
      }
      dirX = Math.sign(dirX);
      dirY = Math.sign(dirY);
      if (dirX !== 0 || dirY !== 0) {
        const next = stepKeyboardCharacter(s.mode === 'happy' ? { ...s, mode: 'idle' } : s, dirX, dirY, dt, outfit.walkFrames);
        if (!l.keyWalking || now - l.lastSent >= MOVE_BROADCAST_INTERVAL_MS) {
          l.keyWalking = true;
          state.current = next;
          broadcastRef.current('walk', keyboardLookAhead(next, dirX, dirY));
        }
        return next;
      }
      if (l.keyWalking) {
        l.keyWalking = false;
        const rested = characterRest(s);
        state.current = rested;
        broadcastRef.current('idle');
        return rested;
      }
      return stepControlledCharacter(s, dt, outfit.walkFrames);
    };

    const stepRemote = (s: CharacterState, dt: number): CharacterState => {
      const l = live.current;
      if (l.remoteDrag) {
        // Glide smoothly toward the partner's dragged position.
        const k = Math.min(1, dt * 14);
        return { ...s, x: s.x + (s.tx - s.x) * k, y: s.y + (s.ty - s.y) * k, mode: 'idle', walkPhase: 0 };
      }
      return stepControlledCharacter(s, dt, outfit.walkFrames, l.remoteSpeed);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const d = drag.current;
      const ctl = controlRef.current;
      if (d?.moved && !d.locked) {
        if (stageRef.current.canPan) {
          stageRef.current.autoPanAt(d.lastClientX, dt);
          const pt = stageRef.current.clientToRoom(d.lastClientX, d.lastClientY);
          const pos = clampCharacterPos(pt.x + d.offsetX, pt.y + d.offsetY);
          state.current = { ...state.current, x: pos.x, y: pos.y, tx: pos.x, ty: pos.y, mode: 'idle', walkPhase: 0 };
        }
        if (ctl === 'local' && now - live.current.lastSent >= MOVE_BROADCAST_INTERVAL_MS) {
          broadcastRef.current('drag');
        }
      } else if (ctl === 'local') {
        state.current = stepLocal(state.current, dt, now);
      } else if (ctl === 'remote') {
        state.current = stepRemote(state.current, dt);
      } else {
        state.current = stepCharacter(state.current, dt, Math.random, outfit.walkFrames);
      }
      applyDom(state.current, Boolean(d?.moved && !d.locked));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [def.spriteFacing, outfit.walkFrames, h, idleUrl, w, walkH, walkUrl, walkW]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (drag.current) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const s = state.current;
    const pt = stage.clientToRoom(e.clientX, e.clientY);
    drag.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      offsetX: s.x - pt.x,
      offsetY: s.y - pt.y,
      slop: e.pointerType === 'touch' ? TOUCH_TAP_SLOP : MOUSE_TAP_SLOP,
      moved: false,
      locked: controlRef.current === 'remote',
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.lastClientX = e.clientX;
    d.lastClientY = e.clientY;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < d.slop) return;
    if (!d.moved) {
      d.moved = true;
      if (d.locked) return;
      setDragging(true);
      onInteract?.();
      if (controlRef.current === 'local') {
        live.current.keys.clear();
        live.current.keyWalking = false;
      }
    }
    if (d.locked) return;
    const pt = stage.clientToRoom(e.clientX, e.clientY);
    const pos = clampCharacterPos(pt.x + d.offsetX, pt.y + d.offsetY);
    state.current = { ...state.current, x: pos.x, y: pos.y, tx: pos.x, ty: pos.y, mode: 'idle', walkPhase: 0 };
  };

  const endPress = (e: React.PointerEvent, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    const ctl = controlRef.current;
    if (d.moved) {
      if (d.locked) return;
      state.current =
        ctl === 'auto'
          ? characterPlaced(state.current, state.current.x, state.current.y)
          : characterRest(characterPlaced(state.current, state.current.x, state.current.y));
      if (ctl === 'local') broadcastRef.current('idle');
    } else if (!cancelled) {
      state.current = ctl === 'auto' ? characterTapped(state.current) : characterHop(state.current);
      setHeartKey((k) => k + 1);
      onInteract?.();
      sendRef.current?.({ type: 'char_poke', fromRole: myRoleRef.current, targetRole: def.id });
    }
  };

  const classes = [
    'character',
    dragging ? 'is-dragging' : '',
    control === 'local' ? 'is-local' : '',
    control === 'remote' ? 'is-remote' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={rootRef}
      className={classes}
      data-testid={`character-${def.id}`}
      data-outfit={outfit.id}
      data-mode="idle"
      data-control={control}
      data-controlled={control === 'local' ? 'local' : undefined}
      style={{ width: w, height: h }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e, false)}
      onPointerCancel={(e) => endPress(e, true)}
    >
      <div className="contact-shadow" />
      {control === 'local' && <div className="character-you" aria-hidden="true" />}
      {heartKey > 0 && (
        <span key={heartKey} className="character-heart" aria-hidden="true">
          ♥
        </span>
      )}
      {emote && (
        <div
          key={emote.key}
          className="character-emote"
          data-testid={`emote-bubble-${def.id}`}
          data-emote={emote.emote}
          role="img"
          aria-label={`${def.id === 'her' ? 'Her' : 'Him'}: ${emote.emote}`}
        >
          <div
            className="character-emote-icon"
            style={{ backgroundImage: `url("${EMOTE_ICON_URLS[emote.emote]}")` }}
          />
        </div>
      )}
      <div ref={flipRef} className="character-flip">
        <div ref={animRef} className="character-anim" data-mode="idle" data-walk-strip="0">
          <div ref={frameRef} className="character-sprite-frame" style={{ width: w, height: h }}>
            <img ref={imgRef} src={idleUrl} alt={def.label} draggable={false} style={{ width: w, height: h }} />
          </div>
        </div>
      </div>
    </div>
  );
}
