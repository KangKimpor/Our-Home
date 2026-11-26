import { useRef, useState } from 'react';
import { clampPosition, depthOf, itemSize, type ItemDef, type Pos } from '../game/layout';
import { versionedAssetUrl } from '../game/version';

const TAP_SLOP = 6; // screen px a press may wander and still count as a tap

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
  scale: number;
  lampOn: boolean;
  onMove: (id: string, pos: Pos) => void;
  onDrop: (id: string) => void;
  onTap: (def: ItemDef) => void;
}

export function Furniture({ def, pos, scale, lampOn, onMove, onDrop, onTap }: Props) {
  const { w, h } = itemSize(def);
  const artRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; sx: number; sy: number; start: Pos; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, start: pos, moved: false };
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
    }
    onMove(def.id, clampPosition(def, { x: d.start.x + dx / scale, y: d.start.y + dy / scale }));
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
