import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { INGREDIENTS } from '../../data/farm';
import { RECIPES, RECIPES_BY_ID, STATIONS } from '../../data/recipes';
import { now } from '../../config/time';
import type { FoodCategory, StationId } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { Button, Empty, Modal, Tabs, cx } from '../bits';
import { Icon } from '../icons';

const INGREDIENT_NAMES = new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]));

type Filter = 'all' | FoodCategory;

export function RecipesPanel() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const startCooking = useGameStore((s) => s.startCooking);
  const collectFood = useGameStore((s) => s.collectFood);
  const [filter, setFilter] = useState<Filter>('all');

  const recipes = useMemo(
    () => RECIPES.filter((recipe) => filter === 'all' || recipe.category === filter),
    [filter],
  );

  return (
    <Modal
      title={t('recipes.title')}
      subtitle={t('recipes.subtitle')}
      size="lg"
      icon={<Icon name="book" size={22} />}
      onClose={closeOverlay}
    >
      <h3 className="section-title">
        <Icon name="pot" size={17} /> {t('recipes.stations')}
      </h3>
      <div className="station-strip">
        {STATIONS.map((station) => {
          const current = state.stations[station.id as StationId];
          const recipe = current?.recipeId ? RECIPES_BY_ID[current.recipeId] : undefined;
          const ready = Boolean(recipe && current.doneAt && current.doneAt <= now());
          const minutes = recipe && current.doneAt ? Math.max(0, Math.ceil((current.doneAt - now()) / 60_000)) : 0;
          return (
            <article key={station.id} className={cx('station-card', ready && 'is-ready', recipe && !ready && 'is-cooking')}>
              <span className="station-icon">
                <Icon name={station.id === 'oven' ? 'home' : station.id === 'pot' ? 'pot' : station.id === 'pan' ? 'pot' : 'bowl'} size={26} />
              </span>
              <div className="station-text">
                <strong>{t(station.nameKey)}</strong>
                {recipe ? (
                  <small>
                    {ready
                      ? t('recipes.stationReady', { name: t(recipe.nameKey, { defaultValue: recipe.name }) })
                      : t('recipes.stationCooking', {
                          name: t(recipe.nameKey, { defaultValue: recipe.name }),
                          minutes,
                        })}
                  </small>
                ) : (
                  <small>{t('recipes.stationIdle')}</small>
                )}
              </div>
              {ready ? (
                <Button size="sm" variant="primary" icon="check" onClick={() => collectFood(station.id as StationId)}>
                  {t('recipes.collect')}
                </Button>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="recipe-head">
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'all', label: t('recipes.filterAll'), count: RECIPES.length },
            { id: 'side', label: t('recipes.side') },
            { id: 'main', label: t('recipes.main') },
            { id: 'dessert', label: t('recipes.dessert') },
          ]}
        />
        <span className="muted">{t('recipes.learned', { count: state.recipesLearned.length })}</span>
      </div>

      {recipes.length === 0 ? (
        <Empty icon="book">{t('recipes.subtitle')}</Empty>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => {
            const station = state.stations[recipe.station];
            const busy = Boolean(station?.recipeId);
            const missing = recipe.ingredients.filter(
              (need) => (state.pantry.ingredients[need.id] ?? 0) < need.qty,
            );
            const learned = state.recipesLearned.includes(recipe.id);
            return (
              <article key={recipe.id} className={cx('recipe-card', learned && 'is-learned')}>
                <div className="recipe-card-head">
                  <span className="recipe-badge">
                    <Icon name={recipe.station === 'oven' ? 'home' : recipe.station === 'bowl' ? 'bowl' : 'pot'} size={18} />
                  </span>
                  <div>
                    <strong>{t(recipe.nameKey, { defaultValue: recipe.name })}</strong>
                    <small>
                      {t(`recipes.${recipe.category}`)} · {t(stationLabelKey(recipe.station))} ·{' '}
                      {t('recipes.minutes', { count: recipe.minutes })}
                    </small>
                  </div>
                  {learned ? <Icon name="check" size={18} className="learned-check" /> : null}
                </div>
                <div className="recipe-ingredients">
                  {recipe.ingredients.map((need) => {
                    const ingredient = INGREDIENT_NAMES.get(need.id);
                    const have = state.pantry.ingredients[need.id] ?? 0;
                    const enough = have >= need.qty;
                    return (
                      <span key={need.id} className={cx('ingredient-pill', !enough && 'is-short')}>
                        <span className="ingredient-dot-small" style={{ background: ingredient?.color ?? '#D9CFBB' }} />
                        {t(ingredient?.nameKey ?? need.id, { defaultValue: ingredient?.name ?? need.id })}
                        <em>
                          {have}/{need.qty}
                        </em>
                      </span>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  variant={missing.length === 0 && !busy ? 'primary' : 'soft'}
                  icon="pot"
                  disabled={missing.length > 0 || busy}
                  onClick={() => startCooking(recipe.station, recipe.id)}
                >
                  {busy ? t('recipes.busy') : missing.length > 0 ? t('recipes.missing') : t('recipes.cook')}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {state.recipesLearned.length >= RECIPES.length ? <p className="muted center">{t('recipes.allCooked')}</p> : null}
    </Modal>
  );
}

function stationLabelKey(station: StationId): string {
  return `station.${station}`;
}
