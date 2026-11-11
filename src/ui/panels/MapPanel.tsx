import { useTranslation } from 'react-i18next';
import { ROOMS, ROOM_ORDER } from '../../data/rooms';
import { useGameStore } from '../../store/gameStore';
import { Button, Modal, cx } from '../bits';
import { Icon } from '../icons';

export function MapPanel() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const roomId = useGameStore((s) => s.roomId);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const setRoom = useGameStore((s) => s.setRoom);
  const unlockRoom = useGameStore((s) => s.unlockRoom);
  const notify = useGameStore((s) => s.notify);
  const unlocked = ROOM_ORDER.filter((id) => state.rooms[id].unlocked).length;

  return (
    <Modal
      title={t('map.title')}
      subtitle={t('map.subtitle')}
      size="lg"
      icon={<Icon name="map" size={22} />}
      onClose={closeOverlay}
    >
      <div className="map-head">
        <span>
          <Icon name="home" size={16} /> {t('hud.roomCount', { count: unlocked })}
        </span>
        <span className="price-tag">
          <Icon name="heart" size={15} /> {state.hearts}
        </span>
      </div>

      <div className="map-grid">
        {ROOM_ORDER.map((id) => {
          const room = ROOMS[id];
          const isOpen = state.rooms[id].unlocked;
          const isCurrent = roomId === id;
          const visitors = state.visitors.active.filter((visitor) => visitor.roomId === id).length;
          const pets = state.pets.filter((pet) => pet.roomId === id).length;
          return (
            <article
              key={id}
              className={cx('map-card', isOpen ? 'is-open' : 'is-locked', isCurrent && 'is-current', room.outdoor && 'is-outdoor')}
            >
              <div
                className="map-card-scene"
                style={{
                  background: room.outdoor
                    ? 'linear-gradient(180deg, #C9DDB4 0%, #A9C58E 52%, #8FAF76 52%, #7B9C64 100%)'
                    : 'linear-gradient(180deg, #F3EFE0 0%, #E8DFC8 52%, #C9A273 52%, #B98F60 100%)',
                }}
              >
                <Icon name={room.outdoor ? 'leaf' : 'home'} size={34} />
                {isCurrent ? <span className="map-you">{t('map.current')}</span> : null}
                {!isOpen ? (
                  <span className="map-lock">
                    <Icon name="lock" size={20} />
                  </span>
                ) : null}
              </div>
              <div className="map-card-text">
                <strong>{t(room.nameKey)}</strong>
                <small>
                  {isOpen
                    ? `${t('map.visitorsHere', { count: visitors })} · ${t('map.petsHere', { count: pets })}`
                    : t('map.locked')}
                </small>
              </div>
              {isOpen ? (
                <Button
                  size="sm"
                  variant={isCurrent ? 'soft' : 'primary'}
                  icon={isCurrent ? 'check' : 'door'}
                  disabled={isCurrent}
                  onClick={() => {
                    setRoom(id);
                    closeOverlay();
                  }}
                >
                  {isCurrent ? t('map.current') : t('map.go')}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={state.hearts >= room.unlockCost ? 'primary' : 'soft'}
                  icon="lock"
                  onClick={() => {
                    if (state.hearts < room.unlockCost) {
                      notify('shop.insufficient', 'warn');
                      return;
                    }
                    unlockRoom(id);
                  }}
                >
                  {t('map.unlockCost', { price: room.unlockCost })}
                </Button>
              )}
            </article>
          );
        })}
      </div>
      <p className="muted center">{t('map.hint')}</p>
    </Modal>
  );
}
