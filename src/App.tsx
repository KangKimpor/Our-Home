import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { CHARACTERS } from './game/characters';
import { FURNITURE_SLOTS, resolveSlotOption, ROOM, type SlotDef } from './game/layout';
import { characterControl, roleLabel, type EmoteId, type PlayerRole } from './game/multiplayer';
import type { SlotId } from './game/sharedHomeCore';
import { versionedAssetUrl } from './game/version';
import { Character, type CharacterController } from './ui/Character';
import { DecoratePanel, type DecorateTarget } from './ui/DecoratePanel';
import { EmotePanel } from './ui/EmotePanel';
import { Furniture } from './ui/Furniture';
import { OutfitPanel } from './ui/OutfitPanel';
import { Pet, type PetSyncRole } from './ui/Pet';
import { PlayerPanel } from './ui/PlayerPanel';
import { Stage } from './ui/Stage';
import { useMultiplayer } from './ui/useMultiplayer';
import { useSharedHome } from './ui/useSharedHome';

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
const HER_DEF = CHARACTERS.find((c) => c.id === 'her')!;

/** Taps above this line hit the back wall, not the floor (room px). */
const FLOOR_TAP_MIN_Y = ROOM.wallBottom + 20;
const PRESENCE_TOAST_MS = 3200;

type HudPanel = 'player' | 'emote' | 'outfit' | 'decorate' | null;

function OutfitIcon() {
  return (
    <svg className="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 6.8a1.9 1.9 0 1 0-1.9-1.9c0 .7.4 1.3 1 1.6L12 8.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M12 8.2 3.8 14.2c-.8.6-.4 1.9.6 1.9h15.2c1 0 1.4-1.3.6-1.9L12 8.2Z"
        fill="#d8aa5f"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DecorateIcon() {
  return (
    <svg className="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19.6 3.6c.7.6.6 1.6-.1 2.3l-6.4 7.2-2.4-2.2 6.3-7.2c.7-.7 1.8-.8 2.6-.1Z"
        fill="#d8aa5f"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 11.6l2.5 2.3c.2 2.6-1.4 5.4-4.6 6.3-1.9.5-3.6.3-4.7-.3 1.3-.6 1.7-1.6 1.9-3 .4-2.7 2.3-5.2 4.9-5.3Z"
        fill="#c87f62"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg className="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.4 9.2A6.8 6.8 0 1 1 6.2 15.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M4.8 5.4l1.2 4.2 4.3-.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayerIcon() {
  return (
    <svg className="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.2 11.2 12 4.6l7.8 6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.4 10.2v8.4c0 .6.4 1 1 1h9.2c.6 0 1-.4 1-1v-8.4"
        fill="#e7c484"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M12 17.6s-2.9-1.7-2.9-3.6c0-.9.7-1.6 1.6-1.6.6 0 1 .3 1.3.7.3-.4.7-.7 1.3-.7.9 0 1.6.7 1.6 1.6 0 1.9-2.9 3.6-2.9 3.6Z"
        fill="#c87f62"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmoteIcon() {
  return (
    <svg className="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.6c4.8 0 8.4 2.9 8.4 6.6s-3.6 6.5-8.3 6.5c-.8 0-1.5-.1-2.2-.2l-3.9 2.7.9-3.8c-2-1.2-3.3-3.1-3.3-5.2 0-3.7 3.6-6.6 8.4-6.6Z"
        fill="#f3e7ce"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 13.4s-2.8-1.6-2.8-3.4c0-.9.7-1.5 1.5-1.5.6 0 1 .3 1.3.7.3-.4.7-.7 1.3-.7.8 0 1.5.6 1.5 1.5 0 1.8-2.8 3.4-2.8 3.4Z"
        fill="#c87f62"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FrameIcon({ compact }: { compact: boolean }) {
  return (
    <svg className="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
      {compact ? (
        <>
          <path
            d="M4.5 9.5h4.8V4.7M19.5 9.5h-4.8V4.7M4.5 14.5h4.8v4.8M19.5 14.5h-4.8v4.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M9.2 4.8H4.8v4.4M14.8 4.8h4.4v4.4M9.2 19.2H4.8v-4.4M14.8 19.2h4.4v-4.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

export function App() {
  const live = useMultiplayer(storage);
  const { role, presence, bus, send, partnersKey, setRole } = live;
  const { home, update, reset, adoptExternal } = useSharedHome(storage, {
    onLocalChange: (state) => send({ type: 'home_state', state }),
  });
  const [panel, setPanel] = useState<HudPanel>(null);
  const [decorateTarget, setDecorateTarget] = useState<DecorateTarget>('sofa');
  const [showHint, setShowHint] = useState(true);
  const [itemPulses, setItemPulses] = useState<Partial<Record<SlotId, number>>>({});
  const [walkTarget, setWalkTarget] = useState<{ x: number; y: number; key: number } | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const herController = useRef<CharacterController | null>(null);
  const himController = useRef<CharacterController | null>(null);
  const emoteSeq = useRef(0);
  const controllerOf = useCallback(
    (id: PlayerRole): MutableRefObject<CharacterController | null> => (id === 'her' ? herController : himController),
    [],
  );

  const decorateOpen = panel === 'decorate';
  const outfitMenuOpen = panel === 'outfit';

  // Partner's live room changes land instantly (the 15s poll stays as the durable fallback).
  useEffect(() => bus.on('home_state', (e) => void adoptExternal(e.state)), [adoptExternal, bus]);
  useEffect(
    () =>
      bus.on('item_tap', (e) =>
        setItemPulses((pulses) => ({ ...pulses, [e.slotId]: (pulses[e.slotId] ?? 0) + 1 })),
      ),
    [bus],
  );

  // A cozy note when the partner comes home while we are already here.
  const wasOnline = useRef(presence.partnerOnline);
  useEffect(() => {
    const was = wasOnline.current;
    wasOnline.current = presence.partnerOnline;
    if (!presence.partnerOnline || was || live.presenceEpoch <= 1) return;
    const who = presence.partnerRole ? roleLabel(presence.partnerRole) : 'Your partner';
    setToast({ text: `${who} came home ♥`, key: Date.now() });
  }, [presence.partnerOnline, presence.partnerRole, live.presenceEpoch]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), PRESENCE_TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // The floor ring fades out on its own.
  useEffect(() => {
    if (!walkTarget) return;
    const timer = window.setTimeout(() => setWalkTarget(null), 1100);
    return () => window.clearTimeout(timer);
  }, [walkTarget]);

  const hideHint = useCallback(() => {
    setShowHint(false);
    setPanel((open) => (open === 'outfit' ? null : open));
  }, []);

  const selectHerOutfit = useCallback(
    (outfitId: string) => {
      setShowHint(false);
      update({ outfits: { her: outfitId } });
    },
    [update],
  );

  const onFurnitureTap = useCallback(
    (slot: SlotDef) => {
      setShowHint(false);
      if (decorateOpen) {
        setDecorateTarget(slot.id);
        return;
      }
      send({ type: 'item_tap', slotId: slot.id });
      if (slot.tap === 'lamp') update({ lampOn: !home.lampOn });
    },
    [decorateOpen, home.lampOn, send, update],
  );

  const onPetTap = useCallback(() => {
    setShowHint(false);
    if (decorateOpen) setDecorateTarget('pet');
  }, [decorateOpen]);

  const onRoomTap = useCallback(
    (pt: { x: number; y: number }, target: HTMLElement | null) => {
      if (!role || decorateOpen) return;
      // Furniture handles its own taps; the flat rug is part of the floor.
      const item = target?.closest('.item');
      if (item && !item.classList.contains('item--rug')) return;
      if (pt.y < FLOOR_TAP_MIN_Y || pt.x < 0 || pt.x > ROOM.w) return;
      const dest = controllerOf(role).current?.walkTo(pt.x, pt.y);
      if (!dest) return;
      setShowHint(false);
      setPanel((open) => (open === 'player' || open === 'emote' ? null : open));
      setWalkTarget({ x: dest.x, y: dest.y, key: Date.now() });
    },
    [controllerOf, decorateOpen, role],
  );

  const pickSlotOption = useCallback(
    (slotId: SlotId, optionId: string) => update({ slots: { [slotId]: optionId } }),
    [update],
  );
  const pickPet = useCallback((petId: string) => update({ pet: petId }), [update]);

  const pickRole = useCallback(
    (next: PlayerRole) => {
      setShowHint(false);
      setRole(next);
      setPanel(null);
    },
    [setRole],
  );

  const sendEmote = useCallback(
    (emote: EmoteId) => {
      if (!role) return;
      emoteSeq.current += 1;
      const event = { type: 'char_emote', role, emote, seq: emoteSeq.current } as const;
      bus.dispatch(event);
      send(event);
      setPanel(null);
    },
    [bus, role, send],
  );

  const togglePanel = (next: Exclude<HudPanel, null>) => {
    setShowHint(false);
    setPanel((open) => (open === next ? null : next));
  };

  const panelOpen = panel !== null;
  const together = presence.partnerOnline;
  const petSyncRole: PetSyncRole = !together ? 'solo' : presence.isPetLeader ? 'leader' : 'follower';
  const playerLabel = role ? roleLabel(role) : 'Play as…';

  return (
    <Stage
      onCameraMove={hideHint}
      onRoomTap={onRoomTap}
      overlay={(stage) => (
        <>
          <header className="hud">
            <div className="hud-presence">
              <button
                type="button"
                className={`hud-button hud-button--secondary hud-button--player${panel === 'player' ? ' is-open' : ''}`}
                data-testid="player-toggle"
                data-role={role ?? 'none'}
                data-partner-online={together ? 'true' : 'false'}
                aria-expanded={panel === 'player'}
                aria-controls="player-picker"
                aria-label={`${role ? `Playing as ${playerLabel}` : 'Choose who you play'}${together ? ' · partner is home' : ''}`}
                onClick={() => togglePanel('player')}
              >
                <span className={`presence-dot${together ? ' is-online' : ''}`} aria-hidden="true" />
                {!role && <PlayerIcon />}
                <span className="hud-player-label">{playerLabel}</span>
                {role && together && <span className="hud-player-together">· Together</span>}
              </button>
              {role && (
                <button
                  type="button"
                  className={`hud-button hud-button--secondary hud-button--emote${panel === 'emote' ? ' is-open' : ''}`}
                  data-testid="emote-toggle"
                  aria-expanded={panel === 'emote'}
                  aria-controls="emote-picker"
                  aria-label="Emotes"
                  onClick={() => togglePanel('emote')}
                >
                  <EmoteIcon />
                  <span className="hud-button-label">Emotes</span>
                </button>
              )}
            </div>
            <div className="hud-actions">
              <button
                type="button"
                className={`hud-button hud-button--secondary${decorateOpen ? ' is-open' : ''}`}
                data-testid="decorate-toggle"
                aria-expanded={decorateOpen}
                aria-controls="decorate-panel"
                onClick={() => togglePanel('decorate')}
              >
                <DecorateIcon />
                <span>Decorate</span>
              </button>
              <button
                type="button"
                className={`hud-button hud-button--secondary${outfitMenuOpen ? ' is-open' : ''}`}
                data-testid="outfit-toggle"
                aria-expanded={outfitMenuOpen}
                aria-controls="outfit-picker"
                onClick={() => togglePanel('outfit')}
              >
                <OutfitIcon />
                <span>Outfits</span>
              </button>
              {stage.canToggleMode && (
                <button
                  type="button"
                  className="hud-button hud-button--secondary hud-button--frame"
                  data-testid="frame-toggle"
                  onClick={stage.toggleMode}
                  aria-label={stage.mode === 'fill' ? 'Fit whole room' : 'Fill screen'}
                >
                  <FrameIcon compact={stage.mode === 'fill'} />
                  <span className="hud-button-label">{stage.mode === 'fill' ? 'Fit room' : 'Fill view'}</span>
                </button>
              )}
              <button type="button" className="hud-button" data-testid="reset-room" onClick={reset}>
                <ResetIcon />
                <span>Reset room</span>
              </button>
            </div>
          </header>
          {panel === 'player' && (
            <PlayerPanel
              role={role}
              outfits={home.outfits}
              partnerOnline={together}
              partnerRoles={presence.onlineRoles}
              onPick={pickRole}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === 'emote' && <EmotePanel onPick={sendEmote} onClose={() => setPanel(null)} />}
          {outfitMenuOpen && (
            <OutfitPanel
              character={HER_DEF}
              selectedId={home.outfits.her}
              onPick={selectHerOutfit}
              onClose={() => setPanel(null)}
            />
          )}
          {decorateOpen && (
            <DecoratePanel
              active={decorateTarget}
              slots={home.slots}
              petId={home.pet}
              onSelectTarget={setDecorateTarget}
              onPickSlotOption={pickSlotOption}
              onPickPet={pickPet}
              onClose={() => setPanel(null)}
            />
          )}
          {toast && (
            <p key={toast.key} className="presence-toast" data-testid="presence-toast" role="status">
              {toast.text}
            </p>
          )}
          <p
            className={`hint${showHint && !panelOpen ? '' : ' is-hidden'}`}
            aria-hidden={!showHint || panelOpen}
          >
            {role
              ? 'Tap the floor to walk · tap Emotes to say hi'
              : stage.canPan
                ? 'Swipe to look around · tap Decorate to swap furniture'
                : 'Tap Decorate to swap furniture · drag us around · tap things to play'}
          </p>
        </>
      )}
    >
      {(stage) => (
        <div className={`room${home.lampOn ? '' : ' is-dim'}${decorateOpen ? ' is-decorating' : ''}`}>
          <img className="room-bg" src={versionedAssetUrl(ROOM.background)} alt="" draggable={false} />
          {FURNITURE_SLOTS.map((slot) => (
            <Furniture
              key={slot.id}
              slot={slot}
              option={resolveSlotOption(slot, home.slots[slot.id])}
              lampOn={home.lampOn}
              decorating={decorateOpen}
              selected={decorateOpen && decorateTarget === slot.id}
              onTap={onFurnitureTap}
              pulse={itemPulses[slot.id]}
            />
          ))}
          {walkTarget && (
            <div
              key={walkTarget.key}
              className="walk-target"
              aria-hidden="true"
              style={{ left: walkTarget.x, top: walkTarget.y }}
            />
          )}
          <Pet
            petId={home.pet}
            onTap={onPetTap}
            syncRole={petSyncRole}
            bus={bus}
            send={send}
            partnersKey={partnersKey}
          />
          {CHARACTERS.map((def) => (
            <Character
              key={def.id}
              def={def}
              outfitId={home.outfits[def.id]}
              stage={stage}
              onInteract={hideHint}
              control={characterControl(def.id, role, presence)}
              myRole={role}
              bus={bus}
              send={send}
              partnersKey={partnersKey}
              controllerRef={controllerOf(def.id)}
            />
          ))}
          <div className="room-dim" />
        </div>
      )}
    </Stage>
  );
}
