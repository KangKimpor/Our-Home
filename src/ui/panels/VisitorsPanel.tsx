import { useTranslation } from 'react-i18next';
import { VISITORS, VISITORS_BY_ID } from '../../data/visitors';
import { useGameStore } from '../../store/gameStore';
import { AnimalArt, Bar, Button, Empty, Modal, durationLabel } from '../bits';
import { Icon } from '../icons';

export function VisitorsPanel() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const active = state.visitors.active;
  const met = VISITORS.filter((visitor) => Boolean(state.visitors.discovered[visitor.id]));

  return (
    <Modal
      title={t('visitors.title')}
      subtitle={t('visitors.subtitle')}
      size="lg"
      icon={<Icon name="users" size={22} />}
      onClose={closeOverlay}
    >
      <h3 className="section-title">
        <Icon name="door" size={17} /> {t('visitors.active')}
        <span className="section-count">{active.length}</span>
      </h3>
      {active.length === 0 ? (
        <Empty icon="door">{t('visitors.noneActive')}</Empty>
      ) : (
        <div className="visitor-active-list">
          {active.map((visitor) => {
            const def = VISITORS_BY_ID[visitor.visitorId];
            if (!def) return null;
            const progress = state.visitors.discovered[visitor.visitorId];
            const name = t(def.nameKey, { defaultValue: def.name });
            return (
              <article key={visitor.id} className="visitor-card visitor-card-active">
                <div className="visitor-portrait">
                  <AnimalArt species={def.species} coat={def.coat} size={104} />
                  {visitor.gift ? (
                    <span className="gift-pin" title={t('visitors.gift')}>
                      <Icon name="gift" size={16} />
                    </span>
                  ) : null}
                </div>
                <div className="visitor-info">
                  <div className="visitor-title-row">
                    <strong>{name}</strong>
                    <span className="leaving-pill">
                      <Icon name="clock" size={13} />
                      {t('visitors.leaving')} · {durationLabel(visitor.leavesAt - Date.now(), t)}
                    </span>
                  </div>
                  <p className="visitor-line">{t(def.lineKey)}</p>
                  <div className="friend-meter">
                    <span>
                      <Icon name="heart" size={13} /> {t('visitors.friendship')}
                    </span>
                    <Bar value={progress?.friendship ?? 0} max={10} />
                  </div>
                  <small className="muted">
                    {t('visitors.favourite', { food: t(`visitors.food${def.favourite === 'side' ? 'Side' : def.favourite === 'main' ? 'Main' : 'Dessert'}`) })}
                  </small>
                </div>
                <Button size="sm" variant="primary" icon="bowl" onClick={() => openOverlay('feed', `visitor:${visitor.id}`)}>
                  {t('visitors.feed')}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      <h3 className="section-title">
        <Icon name="heart" size={17} /> {t('visitors.met')}
        <span className="section-count">
          {met.length}/{VISITORS.length}
        </span>
      </h3>
      {met.length === 0 ? (
        <Empty icon="users">{t('visitors.noneMet')}</Empty>
      ) : (
        <div className="friend-grid">
          {met.map((def) => {
            const progress = state.visitors.discovered[def.id];
            const level = Math.min(10, Math.floor(progress.friendship));
            return (
              <article key={def.id} className="friend-card">
                <div className="friend-portrait">
                  <AnimalArt species={def.species} coat={def.coat} size={78} />
                  {def.rarity >= 3 ? <Icon name="star" size={14} className="rare-star" /> : null}
                </div>
                <div className="friend-text">
                  <strong>{t(def.nameKey, { defaultValue: def.name })}</strong>
                  <small>{t('visitors.friendLevel', { level })}</small>
                  <Bar value={progress.friendship} max={10} />
                  <span className="muted">
                    {t('visitors.visits', { count: progress.visits })} ·{' '}
                    {t('visitors.favourite', {
                      food: t(`visitors.food${def.favourite === 'side' ? 'Side' : def.favourite === 'main' ? 'Main' : 'Dessert'}`),
                    })}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
