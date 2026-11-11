import { useTranslation } from 'react-i18next';
import { MOMENTS, MOMENTS_BY_ID } from '../../data/moments';
import { useGameStore } from '../../store/gameStore';
import { Empty, Modal, SceneArt, useDateLabel, cx } from '../bits';
import { Icon } from '../icons';

export function MomentsPanel() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const caught = MOMENTS.filter((moment) => Boolean(state.moments[moment.id])).length;

  return (
    <Modal
      title={t('moments.title')}
      subtitle={t('moments.subtitle')}
      size="lg"
      icon={<Icon name="camera" size={22} />}
      onClose={closeOverlay}
    >
      <div className="album-head">
        <span>
          <Icon name="camera" size={17} />
          {t('moments.count', { caught, total: MOMENTS.length })}
        </span>
      </div>
      <div className="moment-grid">
        {MOMENTS.map((moment) => {
          const captured = state.moments[moment.id];
          const name = t(moment.nameKey, { defaultValue: moment.name });
          return (
            <button
              key={moment.id}
              type="button"
              className={cx('moment-card', captured ? 'is-captured' : 'is-locked')}
              onClick={() => (captured ? openOverlay('moment', moment.id) : undefined)}
              disabled={!captured}
            >
              <span className="moment-photo">
                {captured ? <SceneArt momentId={moment.id} /> : <span className="moment-lock"><Icon name="lock" size={26} /></span>}
              </span>
              <span className="moment-caption">
                <strong>{captured ? name : t('moments.unseen')}</strong>
                {captured ? (
                  <small>{t('moments.times', { count: captured.count })}</small>
                ) : (
                  <small>{t('moments.hint', { hint: t(moment.hintKey) })}</small>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

export function MomentDetailPanel({ momentId }: { momentId?: string }) {
  const { t } = useTranslation();
  const date = useDateLabel();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const moment = momentId ? MOMENTS_BY_ID[momentId] : undefined;
  const captured = momentId ? state.moments[momentId] : undefined;

  const back = () => openOverlay('moments');

  if (!moment || !captured) {
    return (
      <Modal title={t('moments.title')} size="sm" icon={<Icon name="camera" size={22} />} onClose={back}>
        <Empty icon="camera">{t('moments.empty')}</Empty>
      </Modal>
    );
  }

  return (
    <Modal
      title={t(moment.nameKey, { defaultValue: moment.name })}
      subtitle={t('moments.detail')}
      size="md"
      icon={<Icon name="camera" size={22} />}
      onClose={closeOverlay}
      footer={
        <>
          <span className="muted">{t('moments.times', { count: captured.count })}</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={back}>
            <Icon name="camera" size={16} />
            <span>{t('moments.replay')}</span>
          </button>
        </>
      }
    >
      <div className="moment-detail-photo">
        <SceneArt momentId={moment.id} />
      </div>
      <p className="moment-detail-hint">{t('moments.firstAt', { date: date(captured.firstAt) })}</p>
    </Modal>
  );
}
