import { useCallback, useState } from 'react';
import { CHARACTERS } from './game/characters';
import { FURNITURE_SLOTS, resolveSlotOption, ROOM, type SlotDef } from './game/layout';
import type { SlotId } from './game/sharedHomeCore';
import { versionedAssetUrl } from './game/version';
import { Character } from './ui/Character';
import { DecoratePanel, type DecorateTarget } from './ui/DecoratePanel';
import { Furniture } from './ui/Furniture';
import { OutfitPanel } from './ui/OutfitPanel';
import { Pet } from './ui/Pet';
import { Stage } from './ui/Stage';
import { useSharedHome } from './ui/useSharedHome';

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
const HER_DEF = CHARACTERS.find((c) => c.id === 'her')!;

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
  const { home, update, reset } = useSharedHome(storage);
  const [outfitMenuOpen, setOutfitMenuOpen] = useState(false);
  const [decorateOpen, setDecorateOpen] = useState(false);
  const [decorateTarget, setDecorateTarget] = useState<DecorateTarget>('sofa');
  const [showHint, setShowHint] = useState(true);

  const hideHint = useCallback(() => {
    setShowHint(false);
    setOutfitMenuOpen(false);
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
      if (slot.tap === 'lamp') update({ lampOn: !home.lampOn });
    },
    [decorateOpen, home.lampOn, update],
  );

  const onPetTap = useCallback(() => {
    setShowHint(false);
    if (decorateOpen) setDecorateTarget('pet');
  }, [decorateOpen]);

  const pickSlotOption = useCallback(
    (slotId: SlotId, optionId: string) => update({ slots: { [slotId]: optionId } }),
    [update],
  );
  const pickPet = useCallback((petId: string) => update({ pet: petId }), [update]);

  const toggleDecorate = () => {
    setShowHint(false);
    setOutfitMenuOpen(false);
    setDecorateOpen((open) => !open);
  };

  const toggleOutfits = () => {
    setShowHint(false);
    setDecorateOpen(false);
    setOutfitMenuOpen((open) => !open);
  };

  const panelOpen = decorateOpen || outfitMenuOpen;

  return (
    <Stage
      onCameraMove={hideHint}
      overlay={(stage) => (
        <>
          <header className="hud">
            <div className="hud-actions">
              <button
                type="button"
                className={`hud-button hud-button--secondary${decorateOpen ? ' is-open' : ''}`}
                data-testid="decorate-toggle"
                aria-expanded={decorateOpen}
                aria-controls="decorate-panel"
                onClick={toggleDecorate}
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
                onClick={toggleOutfits}
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
          {outfitMenuOpen && (
            <OutfitPanel
              character={HER_DEF}
              selectedId={home.outfits.her}
              onPick={selectHerOutfit}
              onClose={() => setOutfitMenuOpen(false)}
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
              onClose={() => setDecorateOpen(false)}
            />
          )}
          <p
            className={`hint${showHint && !panelOpen ? '' : ' is-hidden'}`}
            aria-hidden={!showHint || panelOpen}
          >
            {stage.canPan
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
            />
          ))}
          <Pet petId={home.pet} onTap={onPetTap} />
          {CHARACTERS.map((def) => (
            <Character
              key={def.id}
              def={def}
              outfitId={home.outfits[def.id]}
              stage={stage}
              onInteract={hideHint}
            />
          ))}
          <div className="room-dim" />
        </div>
      )}
    </Stage>
  );
}
