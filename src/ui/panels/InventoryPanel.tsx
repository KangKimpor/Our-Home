import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ITEMS_BY_ID } from '../../data/items';
import { INGREDIENTS } from '../../data/farm';
import { ROOMS, ROOM_ORDER } from '../../data/rooms';
import { RECIPES_BY_ID } from '../../data/recipes';
import { availableCount } from '../../game/placement';
import type { RoomId } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { Button, Chip, Empty, ItemArt, Modal, Tabs, useItemLabel, cx } from '../bits';
import { Icon } from '../icons';

const ALL = 'all';

export function InventoryPanel() {
  const { t } = useTranslation();
  const label = useItemLabel();
  const state = useGameStore((s) => s.state);
  const tab = useGameStore((s) => s.inventoryTab);
  const setTab = useGameStore((s) => s.setInventoryTab);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const beginPlacing = useGameStore((s) => s.beginPlacing);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const [roomFilter, setRoomFilter] = useState<RoomId | typeof ALL>(ALL);

  const ownedItems = useMemo(
    () =>
      Object.entries(state.inventory)
        .filter(([, count]) => count > 0)
        .map(([id]) => ITEMS_BY_ID[id])
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [state.inventory],
  );

  const visibleItems = ownedItems.filter((item) => roomFilter === ALL || item.room === roomFilter);

  const foodEntries = Object.entries(state.pantry.foods).filter(([, count]) => count > 0);
  const ingredientEntries = Object.entries(state.pantry.ingredients).filter(([, count]) => count > 0);
  const roomsWithItems = ROOM_ORDER.filter((id) => ownedItems.some((item) => item.room === id));

  return (
    <Modal
      title={t('inventory.title')}
      size="lg"
      icon={<Icon name="bag" size={22} />}
      onClose={closeOverlay}
    >
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { id: 'rooms', label: t('inventory.rooms'), count: ownedItems.length, icon: 'home' },
          { id: 'foods', label: t('inventory.foods'), count: foodEntries.reduce((sum, [, n]) => sum + n, 0), icon: 'pot' },
          {
            id: 'ingredients',
            label: t('inventory.ingredients'),
            count: ingredientEntries.reduce((sum, [, n]) => sum + n, 0),
            icon: 'leaf',
          },
        ]}
      />

      {tab === 'rooms' ? (
        <>
          <div className="filter-row">
            <Chip active={roomFilter === ALL} onClick={() => setRoomFilter(ALL)}>
              {t('inventory.allRooms')}
            </Chip>
            {roomsWithItems.map((id) => (
              <Chip key={id} active={roomFilter === id} onClick={() => setRoomFilter(id)}>
                {t(ROOMS[id].nameKey)}
              </Chip>
            ))}
          </div>
          {visibleItems.length === 0 ? (
            <Empty icon="bag">{t('inventory.emptyRooms')}</Empty>
          ) : (
            <div className="inventory-grid">
              {visibleItems.map((item) => {
                const owned = state.inventory[item.id] ?? 0;
                const placed = state.placed.filter((p) => p.itemId === item.id).length;
                const available = availableCount(state, item.id);
                return (
                  <article key={item.id} className={cx('inventory-card', available === 0 && 'is-placed')}>
                    <div className="inventory-art">
                      <ItemArt itemId={item.id} size={130} />
                    </div>
                    <strong>{label(item)}</strong>
                    <small>
                      {t('inventory.ownedCount', { count: owned })} · {t(ROOMS[item.room].nameKey)}
                    </small>
                    <div className="inventory-card-foot">
                      <span className={cx('placed-dot', placed > 0 && 'is-on')}>
                        {placed > 0 ? t('inventory.placed') : t('common.none')}
                      </span>
                      <Button
                        size="sm"
                        variant={available > 0 ? 'primary' : 'soft'}
                        icon="edit"
                        disabled={available === 0}
                        onClick={() => beginPlacing(item.id)}
                      >
                        {t('inventory.place')}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      {tab === 'foods' ? (
        foodEntries.length === 0 ? (
          <Empty icon="pot">{t('inventory.emptyFoods')}</Empty>
        ) : (
          <div className="inventory-grid food-grid">
            {foodEntries.map(([id, count]) => {
              const recipe = RECIPES_BY_ID[id];
              return (
                <article key={id} className="inventory-card food-card">
                  <span className="food-bowl" aria-hidden="true">
                    <Icon name="pot" size={42} />
                  </span>
                  <strong>{recipe ? t(recipe.nameKey, { defaultValue: recipe.name }) : id}</strong>
                  <small>{recipe ? t(`recipes.${recipe.category}`) : ''}</small>
                  <div className="inventory-card-foot">
                    <span className="count-pill">{t('inventory.plates', { count })}</span>
                    <Button size="sm" variant="primary" icon="bowl" onClick={() => openOverlay('feed')}>
                      {t('feed.title')}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : null}

      {tab === 'ingredients' ? (
        ingredientEntries.length === 0 ? (
          <Empty icon="leaf">{t('inventory.emptyIngredients')}</Empty>
        ) : (
          <div className="ingredient-grid">
            {INGREDIENTS.map((ingredient) => {
              const count = state.pantry.ingredients[ingredient.id] ?? 0;
              return (
                <article key={ingredient.id} className={cx('ingredient-card', count === 0 && 'is-empty')}>
                  <span className="ingredient-dot" style={{ background: ingredient.color }}>
                    <Icon name={ingredient.kind === 'crop' ? 'leaf' : 'sparkle'} size={20} />
                  </span>
                  <div>
                    <strong>{t(ingredient.nameKey, { defaultValue: ingredient.name })}</strong>
                    <small>{t('farm.pantry')}</small>
                  </div>
                  <span className="count-pill">{count}</span>
                </article>
              );
            })}
          </div>
        )
      ) : null}
    </Modal>
  );
}
