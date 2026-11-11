import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { Button, Modal } from '../bits';
import { Icon } from '../icons';

const VERSION = '0.1.0';

export function AboutPanel() {
  const { t } = useTranslation();
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);

  return (
    <Modal
      title={t('about.title')}
      subtitle={t('app.tagline')}
      size="md"
      icon={<Icon name="home" size={22} />}
      onClose={closeOverlay}
      footer={
        <>
          <span className="muted">{t('app.version', { version: VERSION })}</span>
          <Button size="sm" variant="ghost" icon="lock" onClick={() => openOverlay('privacy')}>
            {t('settings.privacy')}
          </Button>
        </>
      }
    >
      <div className="about-hero">
        <span className="about-sun" />
        <span className="about-roof" />
        <span className="about-house">
          <span className="about-window" />
          <span className="about-window" />
          <span className="about-door" />
        </span>
      </div>
      <p className="about-lede">{t('about.body')}</p>
      <div className="about-notes">
        <div>
          <Icon name="heart" size={18} />
          <p>{t('settings.aboutText')}</p>
        </div>
        <div>
          <Icon name="palette" size={18} />
          <p>{t('settings.artCredit')}</p>
        </div>
        <div>
          <Icon name="music" size={18} />
          <p>{t('settings.musicCredit')}</p>
        </div>
        <div>
          <Icon name="cloud" size={18} />
          <p>{t('settings.dataCredit')}</p>
        </div>
      </div>
      <p className="about-foot">{t('about.madeWith')}</p>
    </Modal>
  );
}

export function PrivacyPanel() {
  const { t } = useTranslation();
  const closeOverlay = useGameStore((s) => s.closeOverlay);

  return (
    <Modal
      title={t('settings.privacy')}
      size="md"
      icon={<Icon name="lock" size={22} />}
      onClose={closeOverlay}
    >
      <div className="privacy-body">
        <p>{t('settings.privacyText')}</p>
        <h3>
          <Icon name="home" size={18} /> {t('privacy.localTitle')}
        </h3>
        <p>{t('privacy.localBody')}</p>
        <h3>
          <Icon name="cloud" size={18} /> {t('privacy.cloudTitle')}
        </h3>
        <p>{t('privacy.cloudBody')}</p>
        <h3>
          <Icon name="eye" size={18} /> {t('privacy.trackingTitle')}
        </h3>
        <p>{t('privacy.trackingBody')}</p>
      </div>
    </Modal>
  );
}
