import { useEffect, useRef, useState } from 'react';
import {
  characterPlaced,
  characterTapped,
  clampCharacterPos,
  createCharacter,
  stepCharacter,
  type CharacterDef,
  type CharacterState,
} from '../game/characters';
import { depthOf, itemSize } from '../game/layout';
import { versionedAssetUrl } from '../game/version';

const TAP_SLOP = 6;

interface Props {
  def: CharacterDef;
  scale: number;
  onInteract?: () => void;
}

/**
 * An interactive resident character that strolls around the room, reacts with
 * a happy hop & floating heart when tapped, and can also be dragged anywhere on the floor.
 */
export function Character({ def, scale, onInteract }: Props) {
  const { w, h } = itemSize({ sprite: def.sprite, height: def.height });
  const state = useRef<CharacterState>(createCharacter(def));
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; sx: number; sy: number; startX: number; startY: number; moved: boolean } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const [heartKey, setHeartKey] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let shownMode = '';
    let shownFacing = 0;

    const applyDom = (s: CharacterState, isDragging: boolean) => {
      const root = rootRef.current;
      if (root) {
        root.style.transform = `translate3d(${s.x - w / 2}px, ${s.y - h}px, 0)`;
        root.style.zIndex = String(isDragging ? 5000 : depthOf('floor', s.y));
      }
      if (s.mode !== shownMode && animRef.current) {
        animRef.current.dataset.mode = shownMode = s.mode;
      }
      if (s.facing !== shownFacing && flipRef.current) {
        shownFacing = s.facing;
        const flip = s.facing === def.spriteFacing ? 1 : -1;
        flipRef.current.style.transform = `scaleX(${flip})`;
      }
    };

    applyDom(state.current, false);

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!drag.current?.moved) {
        state.current = stepCharacter(state.current, dt);
      }
      applyDom(state.current, Boolean(drag.current?.moved));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [def.spriteFacing, w, h]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const s = state.current;
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, startX: s.x, startY: s.y, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < TAP_SLOP) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
      onInteract?.();
    }
    const pos = clampCharacterPos(d.startX + dx / scale, d.startY + dy / scale);
    state.current = { ...state.current, x: pos.x, y: pos.y, tx: pos.x, ty: pos.y, mode: 'idle' };
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
        <div ref={animRef} className="character-anim" data-mode="idle">
          <img src={versionedAssetUrl(`/sprites/${def.sprite}.png`)} alt={def.label} draggable={false} />
        </div>
      </div>
    </div>
  );
}
