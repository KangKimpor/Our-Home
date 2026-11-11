import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ITEMS } from '../../data/items';
import { ROOMS, ROOM_ORDER } from '../../data/rooms';
import { availableCount } from '../../game/placement';
import type { Anchor, RoomId } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { Button, Chip, Empty, ItemArt, Modal, Tabs, useItemLabel, cx } from '../bits';
import { Icon } from '../icons';

type ShopTab = RoomId | 'new';
type AnchorFilter = 'all' | Anchor;

export function ShopPanel() {
  const { t } = useTranslation();
  const label = useItemLabel();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const shopTab = useGameStore((s) => s.shopTab);
  const setShopTab = useGameStore((s) => s.setShopTab);
  const buyItem = useGameStore((s) => s.buyItem);
  const beginPlacing = useGameStore((s) => s.beginPlacing);
  const unlockRoom = useGameStore((s) => s.unlockRoom);
  const notify = useGameStore((s) => s.notify);

  const [search, setSearch] = useState('');
  const [anchor, setAnchor] = useState<AnchorFilter>('all');

  const tabItems = useMemo(() => {
    if (shopTab === 'new') return [];
    const query = search.trim().toLowerCase();
    return ITEMS.filter((item) => item.room === shopTab).filter((item) => {
      if (anchor !== 'all' && item.anchor !== anchor) return false;
      if (!query) return true;
      return label(item).toLowerCase().includes(query) || item.name.toLowerCase().includes(query);
    });
  }, [shopTab, search, anchor, label]);

  const lockedRooms = ROOM_ORDER.filter((id) => !state.rooms[id].unlocked);
  const tabs: { id: ShopTab; label: string; count?: number; icon?: 'lock' }[] = [
    ...ROOM_ORDER.filter((id) => state.rooms[id].unlocked).map((id) => ({
      id: id as ShopTab,
      label: t(ROOMS[id].nameKey),
    })),
    { id: 'new', label: t('shop.tabNew'), count: lockedRooms.length, icon: 'lock' },
  ];

  return (
    <Modal
      title={t('shop.title')}
      subtitle={t('shop.subtitle')}
      size="lg"
      icon={<Icon name="shop" size={22} />}
      onClose={closeOverlay}
    >
      <Tabs value={shopTab} options={tabs} onChange={setShopTab} className="tabs-scroll" />

      {shopTab === 'new' ? (
        <div className="room-unlock-grid">
          {lockedRooms.length === 0 ? (
            <Empty icon="home">{t('map.subtitle')}</Empty>
          ) : (
            lockedRooms.map((id) => {
              const room = ROOMS[id];
              return (
                <article key={id} className="room-unlock-card">
                  <div className="room-mini" style={{ background: `linear-gradient(180deg, ${room.outdoor ? '#B4CB9E' : '#F3EFE0'} 58%, ${room.outdoor ? '#8FB07A' : '#C39A6B'} 58%)` }}>
                    <Icon name={room.outdoor ? 'leaf' : 'home'} size={30} />
                  </div>
                  <div className="room-unlock-text">
                    <strong>{t(room.nameKey)}</strong>
                    <span>{t('shop.newTabHint')}</span>
                  </div>
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
                      setShopTab(id);
                      closeOverlay();
                    }}
                  >
                    {t('shop.priceTag', { price: room.unlockCost })}
                  </Button>
                </article>
              );
            })
          )}
        </div>
      ) : (
        <>
          <div className="shop-tools">
            <label className="search-box">
              <Icon name="eye" size={18} />
              <input
                type="search"
                value={search}
                placeholder={t('shop.search')}
                onChange={(event) => setSearch(event.target.value)}
                aria-label={t('shop.search')}
              />
            </label>
            <div className="anchor-filters">
              {(
                [
                  ['all', t('common.all')],
                  ['floor', t('shop.anchorFloor')],
                  ['wall', t('shop.anchorWall')],
                  ['surface', t('shop.anchorSurface')],
                ] as [AnchorFilter, string][]
              ).map(([id, text]) => (
                <Chip key={id} active={anchor === id} onClick={() => setAnchor(id)}>
                  {text}
                </Chip>
              ))}
            </div>
          </div>

          {tabItems.length === 0 ? (
            <Empty icon="shop">{t('shop.noResults')}</Empty>
          ) : (
            <div className="shop-grid">
              {tabItems.map((item) => {
                const owned = state.inventory[item.id] ?? 0;
                const available = availableCount(state, item.id);
                const affordable = state.hearts >= item.price;
                return (
                  <article key={item.id} className={cx('shop-card', owned > 0 && 'is-owned')}>
                    <div className="shop-art">
                      <ItemArt itemId={item.id} size={150} />
                      {owned > 0 ? <span className="owned-badge">{t('common.owned')}</span> : null}
                    </div>
                    <div className="shop-card-text">
                      <strong>{label(item)}</strong>
                      <small>
                        {t(`shop.anchor${item.anchor === 'floor' ? 'Floor' : item.anchor === 'wall' ? 'Wall' : 'Surface'}`)} ·{' '}
                        {t('shop.ownedCount', { count: owned })}
                      </small>
                    </div>
                    <div className="shop-card-foot">
                      <span className={cx('price-tag', !affordable && 'is-short')}>
                        <Icon name="heart" size={15} />
                        {item.price}
                      </span>
                      <div className="shop-card-actions">
                        {available > 0 ? (
                          <Button size="sm" variant="secondary" icon="edit" onClick={() => beginPlacing(item.id)}>
                            {t('shop.placeNow')}
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="primary"
                          icon="plus"
                          disabled={!affordable}
                          onClick={() => buyItem(item.id, true)}
                        >
                          {t('common.buy')}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="shop-footnote">
        <span>
          <Icon name="heart" size={15} /> {state.hearts}
        </span>
        <span>{t('shop.subtitle')}</span>
      </div>
    </Modal>
  );
}
