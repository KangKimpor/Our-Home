import { useEffect, useRef } from 'react';
import { depthOf, itemSize } from '../game/layout';
import { createPet, PET, petTapped, stepPet, type PetState } from '../game/pet';

const SPRITE = 'mossback_hedgehog' as const;

/**
 * The wandering hedgehog. Movement runs in a requestAnimationFrame loop and
 * writes straight to the DOM, so React does not re-render every frame.
 */
export function Pet() {
  const { w, h } = itemSize({ sprite: SPRITE, height: PET.height });
  const state = useRef<PetState>(createPet());
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);

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
        // The sprite faces left; mirror it when walking right.
        flipRef.current.style.transform = `scaleX(${s.facing === 1 ? -1 : 1})`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [w, h]);

  return (
    <div
      ref={rootRef}
      className="pet"
      data-testid="pet"
      style={{ width: w, height: h }}
      onPointerDown={() => {
        state.current = petTapped(state.current);
      }}
    >
      <div className="contact-shadow" />
      <div ref={flipRef} className="pet-flip">
        <div ref={animRef} className="pet-anim" data-mode="idle">
          <img src={`/sprites/${SPRITE}.png`} alt="Hedgehog" draggable={false} />
        </div>
      </div>
    </div>
  );
}
