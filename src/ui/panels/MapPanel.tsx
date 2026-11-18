import { useTranslation } from 'react-i18next';
import { ROOMS, ROOM_ORDER, ROOM_PALETTES } from '../../data/rooms';
import type { RoomId } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { Button, Modal, cx } from '../bits';
import { Icon } from '../icons';

interface MiniProp {
  src: string;
  left: string;
  bottom: string;
  height: string;
  zIndex?: number;
}

const ROOM_DIORAMA_PROPS: Record<RoomId, MiniProp[]> = {
  living: [
    { src: '/asset-pack-v1.1/assets/music_living/music_upright_piano.png', left: '62%', bottom: '18%', height: '62%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/music_living/living_green_sofa.png', left: '10%', bottom: '8%', height: '48%', zIndex: 2 },
    { src: '/asset-pack-v1.1/assets/animals/calico_cat_lounging.png', left: '48%', bottom: '8%', height: '30%', zIndex: 3 },
  ],
  bedroom: [
    { src: '/asset-pack-v1.1/assets/bedroom/bedroom_indoor_tree.png', left: '6%', bottom: '12%', height: '66%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/bedroom/bedroom_vanity_workspace.png', left: '25%', bottom: '14%', height: '56%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/bedroom/bedroom_bed_sleeping_cat.png', left: '50%', bottom: '8%', height: '66%', zIndex: 2 },
  ],
  kitchen: [
    { src: '/asset-pack-v1.1/assets/kitchen/kitchen_range_hood.png', left: '18%', bottom: '56%', height: '34%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/kitchen/kitchen_stove_with_pots.png', left: '12%', bottom: '10%', height: '56%', zIndex: 2 },
    { src: '/asset-pack-v1.1/assets/kitchen/kitchen_spice_jars.png', left: '64%', bottom: '14%', height: '42%', zIndex: 2 },
  ],
  bathroom: [
    { src: '/asset-pack-v1.1/assets/bathroom/bathroom_shower_unit.png', left: '8%', bottom: '12%', height: '74%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/bathroom/bathroom_toilet.png', left: '42%', bottom: '10%', height: '56%', zIndex: 2 },
    { src: '/asset-pack-v1.1/assets/bathroom/bathroom_sleeping_cat.png', left: '68%', bottom: '10%', height: '36%', zIndex: 3 },
  ],
  studio: [
    { src: '/asset-pack-v1.1/assets/studio/studio_drawing_desk.png', left: '8%', bottom: '14%', height: '64%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/studio/studio_worktable_paint_supplies.png', left: '42%', bottom: '8%', height: '54%', zIndex: 2 },
    { src: '/asset-pack-v1.1/assets/studio/studio_tall_potted_plant.png', left: '76%', bottom: '12%', height: '68%', zIndex: 1 },
  ],
  nursery: [
    { src: '/asset-pack-v1.1/assets/nursery/nursery_strawberry_rug.png', left: '24%', bottom: '6%', height: '32%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/nursery/nursery_rocking_chair.png', left: '8%', bottom: '12%', height: '66%', zIndex: 2 },
    { src: '/asset-pack-v1.1/assets/nursery/nursery_dollhouse_bookshelf.png', left: '64%', bottom: '14%', height: '68%', zIndex: 2 },
  ],
  porch: [
    { src: '/asset-pack-v1.1/assets/pet_care/pet_deck_food_and_water_bowls.png', left: '8%', bottom: '12%', height: '46%', zIndex: 2 },
    { src: '/asset-pack-v1.1/assets/animals/shiba_dog_standing.png', left: '42%', bottom: '10%', height: '54%', zIndex: 2 },
    { src: '/asset-pack-v1.1/assets/pet_care/pet_ball.png', left: '72%', bottom: '10%', height: '34%', zIndex: 3 },
  ],
  garden: [
    { src: '/asset-pack-v1.1/assets/outdoor/swing_set_with_cat.png', left: '4%', bottom: '14%', height: '72%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/garden/garden_raised_flower_beds.png', left: '48%', bottom: '36%', height: '38%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/outdoor/pool_scene_with_swimming_pets.png', left: '42%', bottom: '4%', height: '52%', zIndex: 2 },
  ],
  farm: [
    { src: '/asset-pack-v1.1/assets/farm/farm_chicken_coop.png', left: '6%', bottom: '16%', height: '68%', zIndex: 1 },
    { src: '/asset-pack-v1.1/assets/farm/farm_cow.png', left: '54%', bottom: '12%', height: '58%', zIndex: 2 },
    { src: '/asset-pack-v1.1/assets/farm/farm_chicken.png', left: '38%', bottom: '10%', height: '36%', zIndex: 3 },
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
      {props.map((prop) => (
        <img
          key={prop.src}
          src={prop.src}
          alt=""
          draggable={false}
          aria-hidden="true"
          className="map-diorama-prop"
          style={{
            left: prop.left,
            bottom: prop.bottom,
            height: prop.height,
            zIndex: prop.zIndex ?? 1,
          }}
        />
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
