import { EMOTE_ICON_URLS } from '../game/assets';
import { EMOTES, type EmoteId } from '../game/multiplayer';
import { CloseIcon, stopPointer } from './CloseIcon';

interface Props {
  onPick: (emote: EmoteId) => void;
  onClose: () => void;
}

/**
 * Hand-drawn emote sticker picker. Icons are CSS background images, so the popover adds no
 * `<img>` elements anywhere (and none inside `.room`).
 */
export function EmotePanel({ onPick, onClose }: Props) {
  return (
    <section
      id="emote-picker"
      className="outfit-popover hud-popover--left emote-popover"
      data-testid="emote-picker"
      aria-label="Send an emote"
      onPointerDown={stopPointer}
      onPointerMove={stopPointer}
      onPointerUp={stopPointer}
    >
      <div className="decorate-header outfit-header">
        <p className="decorate-title">
          <span className="decorate-slot-name">Emotes</span>
        </p>
        <button
          type="button"
          className="panel-close"
          data-testid="emote-close"
          aria-label="Close emotes"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="emote-grid">
        {EMOTES.map((emote) => (
          <button
            key={emote.id}
            type="button"
            className="outfit-option emote-option"
            data-testid={`emote-option-${emote.id}`}
            aria-label={`Send ${emote.label}`}
            onClick={() => onPick(emote.id)}
          >
            <span
              className="emote-option-icon"
              aria-hidden="true"
              style={{ backgroundImage: `url("${EMOTE_ICON_URLS[emote.id]}")` }}
            />
            <span className="outfit-label">{emote.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
