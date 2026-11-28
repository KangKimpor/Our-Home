import { useEffect, useRef } from 'react';
import { depthOf, itemSize, type Pos, type SlotDef, type SlotOption } from '../game/layout';
import { versionedAssetUrl } from '../game/version';

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
/** Played when a slot's art is swapped or moved: a cozy squash-and-pop. */
const POP_FLOOR: Keyframe[] = [
  { transform: 'scale(0.82, 0.7)', opacity: 0.4 },
  { transform: 'scale(1.08, 1.1)', opacity: 1, offset: 0.45 },
  { transform: 'scale(0.97, 0.97)', offset: 0.75 },
  { transform: 'scale(1, 1)', opacity: 1 },
];
const POP_WALL: Keyframe[] = [
  { transform: 'scale(0.85) rotate(-6deg)', opacity: 0.4 },
  { transform: 'scale(1.06) rotate(4deg)', opacity: 1, offset: 0.5 },
  { transform: 'scale(1) rotate(-2deg)', offset: 0.78 },
  { transform: 'scale(1) rotate(0deg)', opacity: 1 },
];
const EASE = 'cubic-bezier(.3,.7,.4,1)';

interface Props {
  slot: SlotDef;
  option: SlotOption;
  pos: Pos;
  spotId?: string;
  lampOn: boolean;
  tvOn: boolean;
  /** Decorate mode: tapping selects the slot instead of using it. */
  decorating: boolean;
  selected: boolean;
  onTap: (slot: SlotDef) => void;
  /** Bumped when the partner taps this piece, so it plays its tap animation here too. */
  pulse?: number;
}

/**
 * A furniture or backdrop decor piece anchored at its current slot spot. A tap plays
 * a small animation (or toggles lamps / TVs), while a swipe that starts on it is left
 * to the Stage so portrait phones keep panning the camera smoothly.
 */
export function Furniture({
  slot,
  option,
  pos,
  spotId,
  lampOn,
  tvOn,
  decorating,
  selected,
  onTap,
  pulse = 0,
}: Props) {
  const { w, h } = itemSize(option);
  const artRef = useRef<HTMLDivElement>(null);
  const press = useRef<{ id: number; sx: number; sy: number; slop: number; moved: boolean } | null>(null);
  const shownKey = useRef(`${option.id}:${spotId ?? ''}`);

  const play = (frames: Keyframe[], duration: number) => {
    artRef.current?.animate?.(frames, { duration, easing: EASE });
  };

  // Swapping the art or moving to another spot pops it in so the change feels tactile.
  useEffect(() => {
    const key = `${option.id}:${spotId ?? ''}`;
    if (shownKey.current === key) return;
    shownKey.current = key;
    artRef.current?.animate?.(slot.mount === 'wall' ? POP_WALL : POP_FLOOR, { duration: 520, easing: EASE });
  }, [option.id, spotId, slot.mount]);

  const playTap = () => {
    if (slot.tap === 'swing') play(SWING, 700);
    else play(BOUNCE, 420);
  };

  // The partner tapped this piece on their screen: play the same cozy bounce / swing here.
  const shownPulse = useRef(pulse);
  useEffect(() => {
    if (shownPulse.current === pulse) return;
    shownPulse.current = pulse;
    const frames = slot.tap === 'swing' ? SWING : BOUNCE;
    artRef.current?.animate?.(frames, { duration: slot.tap === 'swing' ? 700 : 420, easing: EASE });
  }, [pulse, slot.tap]);

  const activate = () => {
    playTap();
    onTap(slot);
  };

  // No stopPropagation and no pointer capture: the Stage still sees the gesture and pans.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const prev = press.current;
    if (prev && prev.id !== e.pointerId) {
      prev.moved = true; // a second finger means pinch, never a tap
      return;
    }
    const current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      slop: e.pointerType === 'touch' ? TOUCH_TAP_SLOP : MOUSE_TAP_SLOP,
      moved: false,
    };
    press.current = current;

    // Without pointer capture, a press released off this item never reaches it. Forget it then,
    // so a stale press can't swallow the next tap. (Runs after our own pointerup handler.)
    const forget = (ev: PointerEvent) => {
      if (ev.pointerId !== current.id) return;
      if (press.current === current) press.current = null;
      window.removeEventListener('pointerup', forget);
      window.removeEventListener('pointercancel', forget);
    };
    window.addEventListener('pointerup', forget);
    window.addEventListener('pointercancel', forget);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId || p.moved) return;
    if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) >= p.slop) p.moved = true;
  };

  const endPress = (e: React.PointerEvent, cancelled: boolean) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    press.current = null;
    const travelled = p.moved || Math.hypot(e.clientX - p.sx, e.clientY - p.sy) >= p.slop;
    if (!cancelled && !travelled) activate();
  };

  const classes = [
    'item',
    `item--${slot.mount}`,
    decorating ? 'is-decorating' : '',
    selected ? 'is-selected-slot' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      data-item={slot.id}
      data-option={option.id}
      data-spot={spotId}
      data-tv-on={option.screenGlow ? (tvOn ? 'true' : 'false') : undefined}
      data-pulse={pulse || undefined}
      role={decorating ? 'button' : undefined}
      tabIndex={decorating ? 0 : undefined}
      aria-label={decorating ? `${slot.label}: ${option.label}` : undefined}
      aria-pressed={decorating ? selected : undefined}
      style={{
        left: pos.x - w / 2,
        top: pos.y - h,
        width: w,
        height: h,
        zIndex: depthOf(slot.mount, pos.y),
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e, false)}
      onPointerCancel={(e) => endPress(e, true)}
      onKeyDown={(e) => {
        if (!decorating || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        activate();
      }}
    >
      {slot.mount === 'floor' && <div className="contact-shadow" />}
      {option.glow && (
        <div
          className={`lamp-glow${lampOn ? ' is-on' : ''}`}
          style={{ left: `${option.glow.x}%`, top: `${option.glow.y}%` }}
        />
      )}
      <div ref={artRef} className={`item-art item-art--${slot.tap}`}>
        <img src={versionedAssetUrl(`/sprites/${option.sprite}.png`)} alt="" draggable={false} />
        {option.screenGlow && (
          <div
            className={`tv-glow${tvOn ? ' is-on' : ''}`}
            style={{
              left: `${option.screenGlow.x}%`,
              top: `${option.screenGlow.y}%`,
              width: `${option.screenGlow.w}%`,
              height: `${option.screenGlow.h}%`,
            }}
          />
        )}
      </div>
      {decorating && <span className="slot-ring" aria-hidden="true" />}
    </div>
  );
}
