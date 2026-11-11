import { useTranslation } from 'react-i18next';
import { CharacterArt, Button, Modal, Swatch, cx } from '../bits';
import { Icon } from '../icons';
import type { CharacterLook } from '../../game/types';
import { useGameStore } from '../../store/gameStore';

const SKINS = ['#F7E0CB', '#F2D3B6', '#E0B48E', '#C98D62', '#9A6440', '#6E4529'];
const HAIRS = ['#2E2A26', '#3A332C', '#5B4130', '#A9663F', '#C9A15E', '#7A7F8C'];
const OUTFITS = ['#7F9B5C', '#C4483B', '#53688F', '#C99A5B', '#8A6E9E', '#4E8C82', '#D08A9A'];
const STYLES: CharacterLook['hairStyle'][] = ['short', 'long', 'bun'];

function CharacterEditor({ index }: { index: 0 | 1 }) {
  const { t } = useTranslation();
  const look = useGameStore((s) => s.state.characters[index]);
  const updateCharacter = useGameStore((s) => s.updateCharacter);

  return (
    <section className="character-editor">
      <div className="character-preview">
        <CharacterArt look={look} size={210} />
        <strong>{look.name || t(`characters.person${index + 1}`)}</strong>
      </div>
      <div className="character-form">
        <label className="field">
          <span className="field-label">{t('characters.name')}</span>
          <input
            type="text"
            value={look.name}
            maxLength={16}
            placeholder={t('characters.namePlaceholder')}
            onChange={(event) => updateCharacter(index, { name: event.target.value })}
          />
        </label>

        <div className="field">
          <span className="field-label">{t('characters.skin')}</span>
          <div className="swatch-row">
            {SKINS.map((color) => (
              <Swatch
                key={color}
                color={color}
                label={color}
                active={look.skin === color}
                onClick={() => updateCharacter(index, { skin: color })}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">{t('characters.hair')}</span>
          <div className="swatch-row">
            {HAIRS.map((color) => (
              <Swatch
                key={color}
                color={color}
                label={color}
                active={look.hair === color}
                onClick={() => updateCharacter(index, { hair: color })}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">{t('characters.style')}</span>
          <div className="segmented">
            {STYLES.map((style) => (
              <button
                key={style}
                type="button"
                className={cx(look.hairStyle === style && 'is-active')}
                onClick={() => updateCharacter(index, { hairStyle: style })}
              >
                {t(`characters.${style}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">{t('characters.outfit')}</span>
          <div className="swatch-row">
            {OUTFITS.map((color) => (
              <Swatch
                key={color}
                color={color}
                label={color}
                active={look.outfit === color}
                onClick={() => updateCharacter(index, { outfit: color })}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CharactersPanel() {
  const { t } = useTranslation();
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const settings = useGameStore((s) => s.state.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const notify = useGameStore((s) => s.notify);

  return (
    <Modal
      title={t('characters.title')}
      subtitle={t('characters.subtitle')}
      size="lg"
      icon={<Icon name="users" size={22} />}
      onClose={closeOverlay}
      footer={
        <Button
          variant="primary"
          icon="check"
          onClick={() => {
            notify('characters.saved', 'success');
            closeOverlay();
          }}
        >
          {t('characters.save')}
        </Button>
      }
    >
      <div className="character-grid">
        <CharacterEditor index={0} />
        <CharacterEditor index={1} />
      </div>
      <label className="checkbox baby-toggle">
        <input
          type="checkbox"
          checked={settings.showBaby}
          onChange={(event) => updateSettings({ showBaby: event.target.checked })}
        />
        <Icon name="paw" size={16} />
        {t('settings.showBaby')}
      </label>
      <p className="muted center">{t('characters.saved')}</p>
    </Modal>
  );
}
