import { useEffect, useRef } from 'react';
import { depthOf, itemSize } from '../game/layout';
import type { RoomLiveEvent } from '../game/multiplayer';
import { createPet, petSynced, petTapped, resolvePetOption, stepPet, type PetState } from '../game/pet';
import { versionedAssetUrl } from '../game/version';
import type { LiveBus } from './useMultiplayer';

const POP: Keyframe[] = [
  { transform: 'translateY(0) scale(0.7, 0.6)', opacity: 0.3 },
  { transform: 'translateY(-26px) scale(1.06, 1.1)', opacity: 1, offset: 0.5 },
  { transform: 'translateY(0) scale(1.04, 0.95)', offset: 0.8 },
  { transform: 'translateY(0) scale(1, 1)', opacity: 1 },
];

/** How the pet wanders on this screen while partners are (or are not) together. */
export type PetSyncRole = 'solo' | 'leader' | 'follower';

interface Props {
  petId?: string;
  /** Called after the pet is tapped (it always hops). */
  onTap?: () => void;
  /** `leader` wanders and broadcasts `pet_sync`; `follower` mirrors it; `solo` wanders alone. */
  syncRole?: PetSyncRole;
  bus?: LiveBus;
  send?: (event: RoomLiveEvent) => void;
  /** Changes whenever a partner joins or leaves, so the leader re-announces the pet. */
  partnersKey?: string;
}

/**
 * The wandering pet companion. Movement runs in a requestAnimationFrame loop and
 * writes straight to the DOM, so React does not re-render every frame. While both
 * partners are home, one device (the soft leader) picks the wander spots for both.
 */
export function Pet({ petId, onTap, syncRole = 'solo', bus, send, partnersKey = '' }: Props) {
  const option = resolvePetOption(petId);
  const { w, h } = itemSize(option);
  const state = useRef<PetState>(createPet());
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const shownPet = useRef(option.id);
  const syncRoleRef = useRef(syncRole);
  syncRoleRef.current = syncRole;
  const sendRef = useRef(send);
  sendRef.current = send;
  const speedScale = useRef(1);

  const announce = (s: PetState) => {
    sendRef.current?.({
      type: 'pet_sync',
      x: Math.round(s.x),
      y: Math.round(s.y),
      tx: Math.round(s.tx),
      ty: Math.round(s.ty),
      mode: s.mode === 'walk' ? 'walk' : 'idle',
      facing: s.facing,
    });
  };
  const announceRef = useRef(announce);
  announceRef.current = announce;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let shownMode = '';
    let shownFacing = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); // clamp after tab switches
      last = now;
      const role = syncRoleRef.current;
      const prev = state.current;
      const s = (state.current = stepPet(prev, dt, Math.random, {
        wander: role !== 'follower',
        speedScale: role === 'follower' ? speedScale.current : 1,
      }));
      if (role !== 'follower' && s.mode !== 'walk') speedScale.current = 1;
      // The leader shares every new wander destination with the partner's screen.
      if (role === 'leader' && s.mode === 'walk' && prev.mode !== 'walk') announceRef.current(s);
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

  // A partner joined: the leader tells them where the pet is heading.
  useEffect(() => {
    if (syncRole === 'leader' && partnersKey) announceRef.current(state.current);
  }, [syncRole, partnersKey]);

  // Incoming partner pet actions.
  useEffect(() => {
    if (!bus) return;
    const offSync = bus.on('pet_sync', (e) => {
      if (syncRoleRef.current !== 'follower') return;
      if (state.current.mode === 'happy') {
        const { state: next, speedScale: scale } = petSynced({ ...state.current, mode: 'idle' }, e);
        state.current = { ...next, mode: 'happy', timer: state.current.timer };
        speedScale.current = scale;
        return;
      }
      const { state: next, speedScale: scale } = petSynced(state.current, e);
      state.current = next;
      speedScale.current = scale;
    });
    const offTap = bus.on('pet_tap', (e) => {
      state.current = petTapped({ ...state.current, x: e.x, y: e.y, facing: e.facing });
    });
    return () => {
      offSync();
      offTap();
    };
  }, [bus]);

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
      data-sync={syncRole}
      style={{ width: w, height: h }}
      onPointerDown={(e) => {
        e.stopPropagation();
        const s = (state.current = petTapped(state.current));
        sendRef.current?.({ type: 'pet_tap', x: Math.round(s.x), y: Math.round(s.y), facing: s.facing });
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
