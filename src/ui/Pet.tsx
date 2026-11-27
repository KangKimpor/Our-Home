import { useEffect, useRef } from 'react';
import { depthOf, itemSize } from '../game/layout';
import { createPet, petTapped, resolvePetOption, stepPet, type PetState } from '../game/pet';
import { versionedAssetUrl } from '../game/version';

const POP: Keyframe[] = [
  { transform: 'translateY(0) scale(0.7, 0.6)', opacity: 0.3 },
  { transform: 'translateY(-26px) scale(1.06, 1.1)', opacity: 1, offset: 0.5 },
  { transform: 'translateY(0) scale(1.04, 0.95)', offset: 0.8 },
  { transform: 'translateY(0) scale(1, 1)', opacity: 1 },
];

interface Props {
  petId?: string;
  /** Called after the pet is tapped (it always hops). */
  onTap?: () => void;
}

/**
 * The wandering pet companion. Movement runs in a requestAnimationFrame loop and
 * writes straight to the DOM, so React does not re-render every frame.
 */
export function Pet({ petId, onTap }: Props) {
  const option = resolvePetOption(petId);
  const { w, h } = itemSize(option);
  const state = useRef<PetState>(createPet());
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const shownPet = useRef(option.id);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let shownMode = '';
    let shownFacing = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); // clamp after tab switches
      last = now;
      const s = (state.current = stepPet(state.current, dt));
      const root = rootRef.current;
      if (root) {
        root.style.transform = `translate3d(${s.x - w / 2}px, ${s.y - h}px, 0)`;
        root.style.zIndex = String(depthOf('floor', s.y));
      }
      if (s.mode !== shownMode && animRef.current) {
        animRef.current.dataset.mode = shownMode = s.mode;
      }
      if (s.facing !== shownFacing && flipRef.current) {
        shownFacing = s.facing;
        // Every pet sprite faces left; mirror it when walking right.
        flipRef.current.style.transform = `scaleX(${s.facing === 1 ? -1 : 1})`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [w, h]);

  // A new companion pops in with a little hop.
  useEffect(() => {
    if (shownPet.current === option.id) return;
    shownPet.current = option.id;
    popRef.current?.animate?.(POP, { duration: 560, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }, [option.id]);

  return (
    <div
      ref={rootRef}
      className="pet"
      data-testid="pet"
      data-pet={option.id}
      style={{ width: w, height: h }}
      onPointerDown={(e) => {
        e.stopPropagation();
        state.current = petTapped(state.current);
        onTap?.();
      }}
    >
      <div className="contact-shadow" />
      <div
        ref={flipRef}
        className="pet-flip"
        style={{ transform: `scaleX(${state.current.facing === 1 ? -1 : 1})` }}
      >
        <div ref={popRef} className="pet-pop">
          <div ref={animRef} className="pet-anim" data-mode="idle">
            <img
              src={versionedAssetUrl(`/sprites/${option.sprite}.png`)}
              alt={option.label}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
