import { CHARACTERS, resolveCharacterOutfit, type OutfitSelections } from '../game/characters';
import { roleLabel, type PlayerRole } from '../game/multiplayer';
import { versionedAssetUrl } from '../game/version';
import { CloseIcon, stopPointer } from './CloseIcon';

interface Props {
  role: PlayerRole | null;
  outfits: OutfitSelections;
  partnerOnline: boolean;
  /** Roles the partner is currently playing (so we can gently suggest the other one). */
  partnerRoles: readonly PlayerRole[];
  onPick: (role: PlayerRole) => void;
  onClose: () => void;
}

/**
 * "Who's home?" popover: pick which resident you play on this device. Lives in the HUD
 * overlay, outside `.room`, so its thumbnails never add sprites to the scene.
 */
export function PlayerPanel({ role, outfits, partnerOnline, partnerRoles, onPick, onClose }: Props) {
  return (
    <section
      id="player-picker"
      className="outfit-popover hud-popover--left player-popover"
      data-testid="player-picker"
      aria-label="Choose who you play"
      onPointerDown={stopPointer}
      onPointerMove={stopPointer}
      onPointerUp={stopPointer}
    >
      <div className="decorate-header outfit-header">
        <p className="decorate-title">
          <span className="decorate-kicker">Multiplayer</span>
          <span className="decorate-slot-name">Who&apos;s home?</span>
        </p>
        <button
          type="button"
          className="panel-close"
          data-testid="player-close"
          aria-label="Close player picker"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="outfit-grid">
        {CHARACTERS.map((def) => {
          const selected = role === def.id;
          const outfit = resolveCharacterOutfit(def, outfits[def.id]);
          const partnerHere = partnerRoles.includes(def.id);
          return (
            <button
              key={def.id}
              type="button"
              className={`outfit-option player-option${selected ? ' is-selected' : ''}`}
              data-testid={`player-option-${def.id}`}
              data-partner={partnerHere ? 'true' : 'false'}
              aria-pressed={selected}
              onClick={() => onPick(def.id)}
            >
              {partnerHere && <span className="partner-tag">Partner here</span>}
              <span className="outfit-thumb">
                <img src={versionedAssetUrl(`/sprites/${outfit.sprite}.png`)} alt="" draggable={false} />
              </span>
              <span className="outfit-label">{roleLabel(def.id)}</span>
            </button>
          );
        })}
      </div>
      <p className={`player-status${partnerOnline ? ' is-together' : ''}`} data-testid="player-status">
        <span className={`presence-dot${partnerOnline ? ' is-online' : ''}`} aria-hidden="true" />
        {partnerOnline ? 'Both of you are home ♥' : 'Share this link with your partner to play together'}
      </p>
    </section>
  );
}
