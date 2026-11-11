import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EVENTS, eventActive, eventEndTimestamp, eventStartTimestamp } from '../../data/events';
import { useGameStore } from '../../store/gameStore';
import { Bar, Button, Empty, Modal, cx, useDateLabel } from '../bits';
import { Icon } from '../icons';

type Status = 'active' | 'upcoming' | 'ended';

function statusOf(event: (typeof EVENTS)[number], at: number): Status {
  if (eventActive(event, at)) return 'active';
  return eventStartTimestamp(event, at) > at ? 'upcoming' : 'ended';
}

export function EventPanel({ arg }: { arg?: string }) {
  const { t } = useTranslation();
  const date = useDateLabel();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const claimEvent = useGameStore((s) => s.claimEvent);
  const at = Date.now();

  const entries = useMemo(
    () =>
      EVENTS.map((event) => {
        const progress = state.events[event.id]?.progress ?? 0;
        const claimed = state.events[event.id]?.claimed ?? false;
        const status = statusOf(event, at);
        return {
          event,
          progress: Math.min(progress, event.target),
          claimed,
          status,
          canClaim: status === 'active' && !claimed && progress >= event.target,
        };
      }),
    [state.events, at],
  );

  const active = entries.filter((entry) => entry.status === 'active');
  const other = entries.filter((entry) => entry.status !== 'active');

  return (
    <Modal
      title={t('events.title')}
      subtitle={t('events.subtitle')}
      size="lg"
      icon={<Icon name="calendar" size={22} />}
      onClose={closeOverlay}
    >
      {entries.length === 0 ? (
        <Empty icon="calendar">{t('events.none')}</Empty>
      ) : (
        <>
          {active.length > 0 ? (
            <h3 className="section-title">
              <Icon name="sparkle" size={17} /> {t('events.active')}
              <span className="section-count">{active.length}</span>
            </h3>
          ) : null}
          <div className="event-list">
            {[...active, ...other].map(({ event, progress, claimed, status, canClaim }) => (
              <article
                key={event.id}
                className={cx('event-card', `event-card-${event.color}`, status, arg === event.id && 'is-focus')}
              >
                <span className="event-card-icon">
                  <Icon name={event.icon === 'leaf' ? 'leaf' : event.icon === 'moon' ? 'moon' : 'star'} size={26} />
                </span>
                <div className="event-card-body">
                  <div className="event-card-head">
                    <strong>{t(event.nameKey, { defaultValue: event.name })}</strong>
                    <span className={cx('event-status', status)}>{t(`events.${status}`)}</span>
                  </div>
                  <p>{t(event.descKey)}</p>
                  <div className="event-progress-row">
                    <Bar value={progress} max={event.target} tone={event.color === 'navy' ? 'dusty' : event.color === 'plum' ? 'plum' : 'sage'} />
                    <span>{t('events.progress', { progress, target: event.target })}</span>
                  </div>
                  <div className="event-card-foot">
                    <small>
                      <Icon name="gift" size={14} /> {t('events.reward', { hearts: event.rewardHearts })}
                    </small>
                    <small>
                      <Icon name="clock" size={14} />{' '}
                      {status === 'active'
                        ? t('events.ends', { date: date(eventEndTimestamp(event, at)) })
                        : status === 'upcoming'
                          ? t('events.starts', { date: date(eventStartTimestamp(event, at)) })
                          : t('events.ended')}
                    </small>
                    {claimed ? (
                      <span className="claimed-pill">
                        <Icon name="check" size={14} /> {t('events.claimed')}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant={canClaim ? 'primary' : 'soft'}
                        icon="gift"
                        disabled={!canClaim}
                        onClick={() => claimEvent(event.id)}
                      >
                        {t('events.claim')}
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="event-how">
            <h3>
              <Icon name="info" size={17} /> {t('events.how')}
            </h3>
            <p>{t('events.howText')}</p>
          </div>
        </>
      )}
    </Modal>
  );
}
