import { useEffect, useRef, useState } from 'react';
import { clampPosition, depthOf, itemSize, type ItemDef, type Pos } from '../game/layout';
import { versionedAssetUrl } from '../game/version';
import type { StageContext } from './Stage';

const MOUSE_TAP_SLOP = 6;
const TOUCH_TAP_SLOP = 10;

const BOUNCE: Keyframe[] = [
  { transform: 'scale(1, 1)' },
  { transform: 'scale(1.06, 0.93)' },
  { transform: 'scale(0.97, 1.04)' },
  { transform: 'scale(1.01, 0.99)' },
  { transform: 'scale(1, 1)' },
];
const SWING: Keyframe[] = [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(7deg)' },
  { transform: 'rotate(-5deg)' },
  { transform: 'rotate(3deg)' },
  { transform: 'rotate(0deg)' },
];

interface Props {
  def: ItemDef;
  pos: Pos;
  stage: StageContext;
  lampOn: boolean;
  onMove: (id: string, pos: Pos) => void;
  onDrop: (id: string) => void;
  onTap: (def: ItemDef) => void;
}

export function Furniture({ def, pos, stage, lampOn, onMove, onDrop, onTap }: Props) {
  const { w, h } = itemSize(def);
  const artRef = useRef<HTMLDivElement>(null);
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
  const [dragging, setDragging] = useState(false);

  // Smoothly auto-pan the camera when dragging an item near screen edges on portrait phones/iPad.
  useEffect(() => {
    if (!dragging || !stage.canPan) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const d = drag.current;
      if (d?.moved) {
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        stage.autoPanAt(d.lastClientX, dt);
        const pt = stage.clientToRoom(d.lastClientX, d.lastClientY);
        onMove(def.id, clampPosition(def, { x: pt.x + d.offsetX, y: pt.y + d.offsetY }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [def, dragging, onMove, stage]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (drag.current) return; // ignore secondary touch fingers
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = stage.clientToRoom(e.clientX, e.clientY);
    drag.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      offsetX: pos.x - pt.x,
      offsetY: pos.y - pt.y,
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
    }
    const pt = stage.clientToRoom(e.clientX, e.clientY);
    onMove(def.id, clampPosition(def, { x: pt.x + d.offsetX, y: pt.y + d.offsetY }));
  };

  const endPress = (e: React.PointerEvent, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (d.moved) onDrop(def.id);
    else if (!cancelled) {
      play(def.tap === 'swing' ? SWING : BOUNCE, def.tap === 'swing' ? 700 : 420);
      onTap(def);
    }
  };

  const play = (frames: Keyframe[], duration: number) => {
    artRef.current?.animate(frames, { duration, easing: 'cubic-bezier(.3,.7,.4,1)' });
  };

  return (
    <div
      className={`item item--${def.mount}${dragging ? ' is-dragging' : ''}`}
      data-item={def.id}
      style={{
        left: pos.x - w / 2,
        top: pos.y - h,
        width: w,
        height: h,
        zIndex: dragging ? 5000 : depthOf(def.mount, pos.y),
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e, false)}
      onPointerCancel={(e) => endPress(e, true)}
    >
      {def.mount === 'floor' && <div className="contact-shadow" />}
      {def.glow && (
        <div
          className={`lamp-glow${lampOn ? ' is-on' : ''}`}
          style={{ left: `${def.glow.x}%`, top: `${def.glow.y}%` }}
        />
      )}
      <div ref={artRef} className={`item-art item-art--${def.tap}`}>
        <img src={versionedAssetUrl(`/sprites/${def.sprite}.png`)} alt="" draggable={false} />
      </div>
    </div>
  );
}
