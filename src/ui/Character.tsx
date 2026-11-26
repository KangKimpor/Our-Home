import { useEffect, useRef, useState } from 'react';
import {
  characterPlaced,
  characterTapped,
  clampCharacterPos,
  createCharacter,
  stepCharacter,
  walkFrameOf,
  type CharacterDef,
  type CharacterState,
} from '../game/characters';
import { depthOf, itemSize } from '../game/layout';
import { versionedAssetUrl } from '../game/version';
import type { StageContext } from './Stage';

const MOUSE_TAP_SLOP = 6;
const TOUCH_TAP_SLOP = 10;

interface Props {
  def: CharacterDef;
  stage: StageContext;
  onInteract?: () => void;
}

/**
 * An interactive resident character that strolls around the room with a 4-frame
 * hand-drawn walk cycle, reacts with a happy hop & floating heart when tapped,
 * and can also be dragged anywhere on the floor.
 */
export function Character({ def, stage, onInteract }: Props) {
  const { w, h } = itemSize({ sprite: def.sprite, height: def.height });
  const { w: walkW, h: walkH } = itemSize({ sprite: def.walkSprite, height: def.height });
  const idleUrl = versionedAssetUrl(`/sprites/${def.sprite}.png`);
  const walkUrl = versionedAssetUrl(`/sprites/${def.walkSprite}.png`);

  const state = useRef<CharacterState>(createCharacter(def));
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const walkReady = useRef(false);
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
  } | null>(null);
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const [dragging, setDragging] = useState(false);
  const [heartKey, setHeartKey] = useState(0);

  // Preload and decode the walk sprite strip so entering walk mode never flickers.
  useEffect(() => {
    let cancelled = false;
    walkReady.current = false;
    const img = new Image();
    const markReady = () => {
      if (!cancelled && img.naturalWidth > 0) walkReady.current = true;
    };
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(markReady, markReady);
      } else {
        markReady();
      }
    };
    img.src = walkUrl;
    if (img.complete && img.naturalWidth > 0) markReady();
    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let shownMode = '';
    let shownFacing = 0;
    let shownStrip: boolean | null = null;
    let shownFrame = -1;

    const applyDom = (s: CharacterState, isDragging: boolean) => {
      const root = rootRef.current;
      if (root) {
        root.style.transform = `translate3d(${s.x - w / 2}px, ${s.y - h}px, 0)`;
        root.style.zIndex = String(isDragging ? 5000 : depthOf('floor', s.y));
        if (s.mode !== shownMode) {
          root.dataset.mode = s.mode;
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
      const frameIdx = useStrip ? walkFrameOf(s, def.walkFrames) : 0;

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
          imgEl.style.width = `${useStrip ? walkW * def.walkFrames : w}px`;
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

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const d = drag.current;
      if (d?.moved) {
        if (stageRef.current.canPan) {
          stageRef.current.autoPanAt(d.lastClientX, dt);
          const pt = stageRef.current.clientToRoom(d.lastClientX, d.lastClientY);
          const pos = clampCharacterPos(pt.x + d.offsetX, pt.y + d.offsetY);
          state.current = { ...state.current, x: pos.x, y: pos.y, tx: pos.x, ty: pos.y, mode: 'idle', walkPhase: 0 };
        }
      } else {
        state.current = stepCharacter(state.current, dt, Math.random, def.walkFrames);
      }
      applyDom(state.current, Boolean(d?.moved));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [def.spriteFacing, def.walkFrames, h, idleUrl, w, walkH, walkUrl, walkW]);

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
      setDragging(true);
      onInteract?.();
    }
    const pt = stage.clientToRoom(e.clientX, e.clientY);
    const pos = clampCharacterPos(pt.x + d.offsetX, pt.y + d.offsetY);
    state.current = { ...state.current, x: pos.x, y: pos.y, tx: pos.x, ty: pos.y, mode: 'idle', walkPhase: 0 };
  };

  const endPress = (e: React.PointerEvent, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (d.moved) {
      state.current = characterPlaced(state.current, state.current.x, state.current.y);
    } else if (!cancelled) {
      state.current = characterTapped(state.current);
      setHeartKey((k) => k + 1);
      onInteract?.();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`character${dragging ? ' is-dragging' : ''}`}
      data-testid={`character-${def.id}`}
      data-mode="idle"
      style={{ width: w, height: h }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e, false)}
      onPointerCancel={(e) => endPress(e, true)}
    >
      <div className="contact-shadow" />
      {heartKey > 0 && (
        <span key={heartKey} className="character-heart" aria-hidden="true">
          ♥
        </span>
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
