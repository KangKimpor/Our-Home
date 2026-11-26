import { useCallback, useState } from 'react';
import { CHARACTERS, loadOutfits, saveOutfits, type OutfitSelections } from './game/characters';
import {
  clearLayout,
  DEFAULT_LAYOUT,
  ITEMS,
  loadLayout,
  saveLayout,
  type ItemDef,
  type Layout,
  type Pos,
  ROOM,
} from './game/layout';
import { versionedAssetUrl } from './game/version';
import { Character } from './ui/Character';
import { Furniture } from './ui/Furniture';
import { Pet } from './ui/Pet';
import { Stage } from './ui/Stage';

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
  const [layout, setLayout] = useState<Layout>(() => loadLayout(storage));
  const [outfits, setOutfits] = useState<OutfitSelections>(() => loadOutfits(storage));
  const [outfitMenuOpen, setOutfitMenuOpen] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const [showHint, setShowHint] = useState(true);

  const hideHint = useCallback(() => {
    setShowHint(false);
    setOutfitMenuOpen(false);
  }, []);

  const selectHerOutfit = useCallback((outfitId: string) => {
    setShowHint(false);
    setOutfits((prev) => {
      const next: OutfitSelections = { ...prev, her: outfitId };
      saveOutfits(storage, next);
      return next;
    });
  }, []);

  const onMove = useCallback((id: string, pos: Pos) => {
    setShowHint(false);
    setLayout((l) => ({ ...l, [id]: pos }));
  }, []);

  const onDrop = useCallback(() => {
    setLayout((l) => {
      saveLayout(storage, l);
      return l;
    });
  }, []);

  const onTap = useCallback((def: ItemDef) => {
    setShowHint(false);
    if (def.tap === 'lamp') setLampOn((on) => !on);
  }, []);

  const reset = () => {
    clearLayout(storage);
    setLayout({ ...DEFAULT_LAYOUT });
  };

  return (
    <Stage
      onCameraMove={hideHint}
      overlay={(stage) => (
        <>
          <header className="hud">
            <div className="hud-actions">
              <button
                type="button"
                className={`hud-button hud-button--secondary${outfitMenuOpen ? ' is-open' : ''}`}
                data-testid="outfit-toggle"
                aria-expanded={outfitMenuOpen}
                aria-controls="outfit-picker"
                onClick={() => {
                  setShowHint(false);
                  setOutfitMenuOpen((open) => !open);
                }}
              >
                <OutfitIcon />
                <span>Outfits</span>
              </button>
              {stage.canToggleMode && (
                <button
                  type="button"
                  className="hud-button hud-button--secondary"
                  onClick={stage.toggleMode}
                  aria-label={stage.mode === 'fill' ? 'Fit whole room' : 'Fill screen'}
                >
                  <FrameIcon compact={stage.mode === 'fill'} />
                  <span>{stage.mode === 'fill' ? 'Fit room' : 'Fill view'}</span>
                </button>
              )}
              <button type="button" className="hud-button" onClick={reset}>
                <ResetIcon />
                <span>Reset room</span>
              </button>
            </div>
          </header>
          {outfitMenuOpen && (
            <section
              id="outfit-picker"
              className="outfit-popover"
              data-testid="outfit-picker"
              aria-label="Choose outfit"
            >
              <div className="outfit-grid">
                {HER_DEF.outfits.map((outfit) => {
                  const selected = outfits.her === outfit.id;
                  return (
                    <button
                      key={outfit.id}
                      type="button"
                      className={`outfit-option${selected ? ' is-selected' : ''}`}
                      data-testid={`outfit-option-${outfit.id}`}
                      aria-pressed={selected}
                      onClick={() => selectHerOutfit(outfit.id)}
                    >
                      <span className="outfit-thumb">
                        <img
                          src={versionedAssetUrl(`/sprites/${outfit.sprite}.png`)}
                          alt=""
                          draggable={false}
                        />
                      </span>
                      <span className="outfit-label">{outfit.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
          <p className={`hint${showHint ? '' : ' is-hidden'}`}>
            {stage.canPan
              ? 'Swipe background to pan · drag & tap to play'
              : 'Drag furniture or characters · tap things to play'}
          </p>
        </>
      )}
    >
      {(stage) => (
        <div className={`room${lampOn ? '' : ' is-dim'}`}>
          <img className="room-bg" src={versionedAssetUrl(ROOM.background)} alt="" draggable={false} />
          {ITEMS.map((def) => (
            <Furniture
              key={def.id}
              def={def}
              pos={layout[def.id]}
              stage={stage}
              lampOn={lampOn}
              onMove={onMove}
              onDrop={onDrop}
              onTap={onTap}
            />
          ))}
          <Pet />
          {CHARACTERS.map((def) => (
            <Character key={def.id} def={def} outfitId={outfits[def.id]} stage={stage} onInteract={hideHint} />
          ))}
          <div className="room-dim" />
        </div>
      )}
    </Stage>
  );
}
