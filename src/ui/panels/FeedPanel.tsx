import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RECIPES_BY_ID } from '../../data/recipes';
import { VISITORS_BY_ID } from '../../data/visitors';
import type { FoodCategory } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { AnimalArt, Bar, Button, Empty, Modal, cx } from '../bits';
import { Icon } from '../icons';

type Target = { type: 'pet'; id: string } | { type: 'visitor'; id: string };

function parseTarget(arg?: string): Target | null {
  if (!arg) return null;
  const [type, id] = arg.split(':');
  if ((type === 'pet' || type === 'visitor') && id) return { type, id };
  return null;
}

export function FeedPanel({ arg }: { arg?: string }) {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const feedPet = useGameStore((s) => s.feedPet);
  const feedVisitor = useGameStore((s) => s.feedVisitor);
  const [target, setTarget] = useState<Target | null>(() => parseTarget(arg));

  const foods = useMemo(
    () =>
      Object.entries(state.pantry.foods)
        .filter(([, count]) => count > 0)
        .map(([id, count]) => ({ id, count, recipe: RECIPES_BY_ID[id] }))
        .filter((entry): entry is { id: string; count: number; recipe: NonNullable<typeof entry.recipe> } => Boolean(entry.recipe)),
    [state.pantry.foods],
  );

  const activeVisitor = target?.type === 'visitor' ? state.visitors.active.find((v) => v.id === target.id) : undefined;
  const visitorDef = activeVisitor ? VISITORS_BY_ID[activeVisitor.visitorId] : undefined;
  const pet = target?.type === 'pet' ? state.pets.find((p) => p.id === target.id) : undefined;
  const selectedName = pet?.name ?? (visitorDef ? t(visitorDef.nameKey, { defaultValue: visitorDef.name }) : '');
  const favourite: FoodCategory | undefined = visitorDef?.favourite;

  return (
    <Modal
      title={t('feed.title')}
      subtitle={t('feed.subtitle')}
      size="lg"
      icon={<Icon name="bowl" size={22} />}
      onClose={closeOverlay}
    >
      <h3 className="section-title">
        <Icon name="paw" size={17} /> {t('feed.forWhom')}
      </h3>
      <div className="feed-targets">
        {state.pets.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={cx('feed-target', target?.type === 'pet' && target.id === entry.id && 'is-active')}
            onClick={() => setTarget({ type: 'pet', id: entry.id })}
          >
            <AnimalArt species={entry.species} coat={entry.coat} size={54} />
            <span>{entry.name}</span>
          </button>
        ))}
        {state.visitors.active.map((entry) => {
          const def = VISITORS_BY_ID[entry.visitorId];
          if (!def) return null;
          return (
            <button
              key={entry.id}
              type="button"
              className={cx('feed-target', target?.type === 'visitor' && target.id === entry.id && 'is-active')}
              onClick={() => setTarget({ type: 'visitor', id: entry.id })}
            >
              <AnimalArt species={def.species} coat={def.coat} size={54} />
              <span>{t(def.nameKey, { defaultValue: def.name })}</span>
            </button>
          );
        })}
      </div>

      {target ? (
        <div className="feed-selected">
          <strong>{t('feed.forWhom')}: {selectedName}</strong>
          {pet ? <Bar value={pet.happiness} max={100} /> : null}
          {favourite ? (
            <small className="muted">
              {t('visitors.favourite', {
                food: t(`visitors.food${favourite === 'side' ? 'Side' : favourite === 'main' ? 'Main' : 'Dessert'}`),
              })}
            </small>
          ) : null}
        </div>
      ) : (
        <p className="muted center">{t(state.visitors.active.length > 0 ? 'feed.choose' : 'feed.choosePet')}</p>
      )}

      {foods.length === 0 ? (
        <Empty icon="pot">
          <>{t('feed.empty')}</>
          <br />
          <Button size="sm" variant="secondary" icon="book" onClick={() => openOverlay('recipes')}>
            {t('recipes.title')}
          </Button>
        </Empty>
      ) : (
        <div className="food-choice-grid">
          {foods.map(({ id, count, recipe }) => {
            const matched = favourite === recipe.category;
            return (
              <article key={id} className={cx('food-choice', matched && 'is-favourite')}>
                <span className="food-choice-icon">
                  <Icon name="pot" size={28} />
                </span>
                <div>
                  <strong>{t(recipe.nameKey, { defaultValue: recipe.name })}</strong>
                  <small>
                    {t(`recipes.${recipe.category}`)} · {t('inventory.plates', { count })}
                    {matched ? ` · ${t('feed.matching')}` : ''}
                  </small>
                </div>
                <Button
                  size="sm"
                  variant={matched ? 'primary' : 'secondary'}
                  icon="heart"
                  disabled={!target}
                  onClick={() => {
                    if (!target) return;
                    if (target.type === 'pet') feedPet(target.id, id);
                    else feedVisitor(target.id, id);
                  }}
                >
                  {t('feed.choose')}
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
