import { useTranslation } from 'react-i18next';
import { ROOMS, ROOM_ORDER, ROOM_PALETTES } from '../../data/rooms';
import type { RoomId } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { AnimalArt, Button, ItemArt, Modal, cx } from '../bits';
import { Icon } from '../icons';

type MiniProp =
  | { kind: 'item'; itemId: string; left: string; bottom: string; height: string; zIndex?: number }
  | { kind: 'animal'; species: string; coat: string; left: string; bottom: string; height: string; zIndex?: number };

const ROOM_DIORAMA_PROPS: Record<RoomId, MiniProp[]> = {
  living: [
    { kind: 'item', itemId: 'living.piano', left: '62%', bottom: '18%', height: '62%', zIndex: 1 },
    { kind: 'item', itemId: 'living.sofa.sage', left: '10%', bottom: '8%', height: '48%', zIndex: 2 },
    { kind: 'animal', species: 'cat', coat: 'calico', left: '48%', bottom: '8%', height: '34%', zIndex: 3 },
  ],
  bedroom: [
    { kind: 'item', itemId: 'bedroom.plant', left: '6%', bottom: '12%', height: '66%', zIndex: 1 },
    { kind: 'item', itemId: 'bedroom.desk', left: '24%', bottom: '14%', height: '54%', zIndex: 1 },
    { kind: 'item', itemId: 'bedroom.bed.rose', left: '50%', bottom: '8%', height: '64%', zIndex: 2 },
  ],
  kitchen: [
    { kind: 'item', itemId: 'kitchen.hood', left: '16%', bottom: '56%', height: '32%', zIndex: 1 },
    { kind: 'item', itemId: 'kitchen.stove', left: '12%', bottom: '10%', height: '54%', zIndex: 2 },
    { kind: 'item', itemId: 'kitchen.fridge', left: '64%', bottom: '10%', height: '72%', zIndex: 2 },
  ],
  bathroom: [
    { kind: 'item', itemId: 'bathroom.shower', left: '8%', bottom: '12%', height: '74%', zIndex: 1 },
    { kind: 'item', itemId: 'bathroom.tub', left: '38%', bottom: '10%', height: '50%', zIndex: 2 },
    { kind: 'item', itemId: 'bathroom.sleepingCat', left: '70%', bottom: '10%', height: '36%', zIndex: 3 },
  ],
  studio: [
    { kind: 'item', itemId: 'studio.easel', left: '10%', bottom: '12%', height: '66%', zIndex: 1 },
    { kind: 'item', itemId: 'studio.table', left: '40%', bottom: '8%', height: '52%', zIndex: 2 },
    { kind: 'item', itemId: 'studio.plant', left: '76%', bottom: '12%', height: '66%', zIndex: 1 },
  ],
  nursery: [
    { kind: 'item', itemId: 'nursery.rug', left: '26%', bottom: '6%', height: '30%', zIndex: 1 },
    { kind: 'item', itemId: 'nursery.crib', left: '8%', bottom: '12%', height: '62%', zIndex: 2 },
    { kind: 'item', itemId: 'nursery.tent', left: '60%', bottom: '10%', height: '68%', zIndex: 2 },
  ],
  porch: [
    { kind: 'item', itemId: 'porch.bowl.sun', left: '10%', bottom: '12%', height: '34%', zIndex: 2 },
    { kind: 'animal', species: 'dog', coat: 'golden', left: '38%', bottom: '10%', height: '54%', zIndex: 2 },
    { kind: 'item', itemId: 'porch.bench', left: '58%', bottom: '10%', height: '52%', zIndex: 1 },
  ],
  garden: [
    { kind: 'item', itemId: 'garden.swing', left: '6%', bottom: '14%', height: '70%', zIndex: 1 },
    { kind: 'item', itemId: 'garden.flowerRed', left: '48%', bottom: '36%', height: '38%', zIndex: 1 },
    { kind: 'item', itemId: 'garden.pool', left: '42%', bottom: '6%', height: '48%', zIndex: 2 },
  ],
  farm: [
    { kind: 'item', itemId: 'farm.coop', left: '6%', bottom: '16%', height: '64%', zIndex: 1 },
    { kind: 'animal', species: 'cow', coat: 'white', left: '52%', bottom: '10%', height: '58%', zIndex: 2 },
    { kind: 'animal', species: 'hen', coat: 'cream', left: '38%', bottom: '10%', height: '36%', zIndex: 3 },
  ],
};

export function RoomMiniDiorama({ roomId }: { roomId: RoomId }) {
  const room = ROOMS[roomId];
  const palette = ROOM_PALETTES[roomId];
  const props = ROOM_DIORAMA_PROPS[roomId];

  return (
    <>
      <div
        className="map-diorama-wall"
        style={{
          background: room.outdoor
            ? `linear-gradient(180deg, ${palette.sky} 0%, ${palette.wall} 100%)`
            : `linear-gradient(180deg, ${palette.wall} 0%, ${palette.wallShade} 100%)`,
          borderBottomColor: palette.trim,
        }}
      />
      <div
        className="map-diorama-floor"
        style={{
          background: `linear-gradient(180deg, ${palette.floor} 0%, ${palette.floorAlt} 100%)`,
        }}
      />
      {props.map((prop, idx) => (
        <div
          key={`${roomId}:${idx}`}
          aria-hidden="true"
          className="map-diorama-prop"
          style={{
            left: prop.left,
            bottom: prop.bottom,
            height: prop.height,
            zIndex: prop.zIndex ?? 1,
          }}
        >
          {prop.kind === 'item' ? (
            <ItemArt itemId={prop.itemId} size={180} />
          ) : (
            <AnimalArt species={prop.species} coat={prop.coat} size={140} />
          )}
        </div>
      ))}
    </>
  );
}

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
              <div className="map-card-scene">
                <RoomMiniDiorama roomId={id} />
                {isCurrent ? <span className="map-you">{t('map.current')}</span> : null}
                {!isOpen ? (
                  <span className="map-lock">
                    <Icon name="lock" size={18} />
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
