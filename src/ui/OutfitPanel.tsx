import type { CharacterDef } from '../game/characters';
import { versionedAssetUrl } from '../game/version';
import { CloseIcon, stopPointer } from './CloseIcon';

interface Props {
  character: CharacterDef;
  selectedId: string;
  onPick: (outfitId: string) => void;
  onClose: () => void;
}

/**
 * Hand-painted wardrobe popover for her outfits. Lives in the HUD overlay,
 * outside `.room`, so it never adds sprites to the scene.
 */
export function OutfitPanel({ character, selectedId, onPick, onClose }: Props) {
  return (
    <section
      id="outfit-picker"
      className="outfit-popover"
      data-testid="outfit-picker"
      aria-label="Choose outfit"
      onPointerDown={stopPointer}
      onPointerMove={stopPointer}
      onPointerUp={stopPointer}
    >
      <div className="decorate-header outfit-header">
        <p className="decorate-title">
          <span className="decorate-kicker">Outfits</span>
          <span className="decorate-slot-name">Her wardrobe</span>
        </p>
        <button
          type="button"
          className="panel-close"
          data-testid="outfit-close"
          aria-label="Close outfits"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="outfit-grid">
        {character.outfits.map((outfit) => {
          const selected = selectedId === outfit.id;
          return (
            <button
              key={outfit.id}
              type="button"
              className={`outfit-option${selected ? ' is-selected' : ''}`}
              data-testid={`outfit-option-${outfit.id}`}
              aria-pressed={selected}
              onClick={() => onPick(outfit.id)}
            >
              <span className="outfit-thumb">
                <img src={versionedAssetUrl(`/sprites/${outfit.sprite}.png`)} alt="" draggable={false} />
              </span>
              <span className="outfit-label">{outfit.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
