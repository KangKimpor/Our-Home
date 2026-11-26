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
            <span className="hud-title">Living room</span>
            <div className="hud-actions">
              {stage.canToggleMode && (
                <button
                  type="button"
                  className="hud-button hud-button--secondary"
                  onClick={stage.toggleMode}
                  aria-label={stage.mode === 'fill' ? 'Fit whole room' : 'Fill screen'}
                >
                  {stage.mode === 'fill' ? 'Fit room' : 'Fill view'}
                </button>
              )}
              <button type="button" className="hud-button" onClick={reset}>
                Reset room
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
