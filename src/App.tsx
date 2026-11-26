import { useCallback, useState } from 'react';
import { CHARACTERS } from './game/characters';
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

function SproutIcon() {
  return (
    <svg className="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.5c-.2-4.5.3-8.2 1.1-11.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M12.4 13.4C8.4 13.6 5.2 11.2 4.6 7.4c3.8-.5 7.4 1.4 8.2 5.2"
        fill="#8fa88a"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 10.6c.4-3.7 3.4-6.3 7-6.4-.1 3.9-2.7 6.8-6.4 6.9"
        fill="#8fa88a"
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
  const [lampOn, setLampOn] = useState(true);
  const [showHint, setShowHint] = useState(true);

  const hideHint = useCallback(() => setShowHint(false), []);

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
            <span className="hud-title">
              <SproutIcon />
              <span>Living room</span>
            </span>
            <div className="hud-actions">
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
            <Character key={def.id} def={def} stage={stage} onInteract={hideHint} />
          ))}
          <div className="room-dim" />
        </div>
      )}
    </Stage>
  );
}
