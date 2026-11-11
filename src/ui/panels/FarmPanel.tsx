import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BALANCE } from '../../config/balance';
import { now } from '../../config/time';
import { CROPS, INGREDIENTS, PRODUCERS } from '../../data/farm';
import { ROOMS } from '../../data/rooms';
import { useGameStore } from '../../store/gameStore';
import { Button, Empty, Modal, cx } from '../bits';
import { Icon } from '../icons';

const INGREDIENT_NAMES = new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]));

export function FarmPanel() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const unlockRoom = useGameStore((s) => s.unlockRoom);
  const unlockPlot = useGameStore((s) => s.unlockPlot);
  const plantCrop = useGameStore((s) => s.plantCrop);
  const harvestPlot = useGameStore((s) => s.harvestPlot);
  const collectProducer = useGameStore((s) => s.collectProducer);
  const notify = useGameStore((s) => s.notify);
  const [plantingPlot, setPlantingPlot] = useState<string | null>(null);
  const farmUnlocked = state.rooms.farm.unlocked;

  return (
    <Modal
      title={t('farm.title')}
      subtitle={t('farm.plotsHint')}
      size="lg"
      icon={<Icon name="seed" size={22} />}
      onClose={closeOverlay}
    >
      {!farmUnlocked ? (
        <div className="farm-locked">
          <Empty icon="lock">{t('map.locked')}</Empty>
          <Button
            variant="primary"
            icon="lock"
            onClick={() => {
              if (state.hearts < ROOMS.farm.unlockCost) {
                notify('shop.insufficient', 'warn');
                return;
              }
              unlockRoom('farm');
            }}
          >
            {t('map.unlockCost', { price: ROOMS.farm.unlockCost })}
          </Button>
        </div>
      ) : (
        <>
          <h3 className="section-title">
            <Icon name="seed" size={17} /> {t('farm.plots')}
            <span className="section-count">
              {state.farm.plots.filter((plot) => plot.unlocked).length}/{state.farm.plots.length}
            </span>
          </h3>
          <div className="plot-grid">
            {state.farm.plots.map((plot, index) => {
              const crop = plot.cropId ? CROPS.find((entry) => entry.id === plot.cropId) : undefined;
              const ready = Boolean(crop && plot.readyAt && plot.readyAt <= now());
              const cost = BALANCE.plotUnlockCosts[index - 3] ?? 900;
              if (!plot.unlocked) {
                return (
                  <article key={plot.id} className="plot-card is-locked">
                    <span className="plot-dirt">
                      <Icon name="lock" size={24} />
                    </span>
                    <strong>{t('farm.locked')}</strong>
                    <Button
                      size="sm"
                      variant={state.hearts >= cost ? 'secondary' : 'soft'}
                      icon="lock"
                      onClick={() => unlockPlot(plot.id)}
                    >
                      {t('farm.plotCost', { price: cost })}
                    </Button>
                  </article>
                );
              }
              return (
                <article key={plot.id} className={cx('plot-card', crop && 'is-planted', ready && 'is-ready')}>
                  <span className={cx('plot-dirt', ready && 'is-ready')} style={crop ? { background: `linear-gradient(180deg, #8A6042 0%, ${crop.colors[1]} 100%)` } : undefined}>
                    {crop ? (
                      <span className="crop-dot" style={{ background: crop.colors[0] }}>
                        <Icon name={ready ? 'sparkle' : 'leaf'} size={18} />
                      </span>
                    ) : (
                      <Icon name="seed" size={24} />
                    )}
                  </span>
                  {crop ? (
                    <>
                      <strong>{t(crop.nameKey, { defaultValue: crop.name })}</strong>
                      <small>
                        {ready
                          ? t('farm.readyNow')
                          : t('farm.minutesLeft', { count: Math.max(0, Math.ceil(((plot.readyAt ?? now()) - now()) / 60_000)) })}
                      </small>
                      {ready ? (
                        <Button size="sm" variant="primary" icon="check" onClick={() => harvestPlot(plot.id)}>
                          {t('farm.harvest')}
                        </Button>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <strong>{t('farm.emptyPlot')}</strong>
                      {plantingPlot === plot.id ? (
                        <div className="crop-picker">
                          {CROPS.map((entry) => (
                            <button
                              key={entry.id}
                              type="button"
                              className="crop-choice"
                              title={t(entry.nameKey, { defaultValue: entry.name })}
                              onClick={() => {
                                plantCrop(plot.id, entry.id);
                                setPlantingPlot(null);
                              }}
                            >
                              <span style={{ background: entry.colors[0] }} />
                              {t(entry.nameKey, { defaultValue: entry.name })}
                            </button>
                          ))}
                          <Button size="sm" variant="ghost" onClick={() => setPlantingPlot(null)}>
                            {t('common.cancel')}
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="secondary" icon="seed" onClick={() => setPlantingPlot(plot.id)}>
                          {t('farm.plant')}
                        </Button>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>

          <h3 className="section-title">
            <Icon name="paw" size={17} /> {t('farm.producers')}
          </h3>
          <div className="producer-strip">
            {PRODUCERS.map((producer) => {
              const producerState = state.farm.producers[producer.id];
              const ready = !producerState || producerState.readyAt <= now();
              const ingredient = INGREDIENT_NAMES.get(producer.ingredient);
              return (
                <article key={producer.id} className={cx('producer-card', ready && 'is-ready')}>
                  <span className="producer-icon">
                    <Icon name={producer.id === 'beehive' ? 'sparkle' : producer.id === 'pond' ? 'leaf' : 'paw'} size={24} />
                  </span>
                  <div>
                    <strong>{t(producer.nameKey, { defaultValue: producer.name })}</strong>
                    <small>
                      {t(ingredient?.nameKey ?? producer.ingredient, { defaultValue: ingredient?.name ?? producer.ingredient })}
                      {' · '}
                      {ready
                        ? t('farm.producerReady')
                        : t('farm.producerWaiting', {
                            minutes: Math.max(1, Math.ceil(((producerState?.readyAt ?? now()) - now()) / 60_000)),
                          })}
                    </small>
                  </div>
                  <Button size="sm" variant={ready ? 'primary' : 'soft'} disabled={!ready} icon="check" onClick={() => collectProducer(producer.id)}>
                    {t('farm.collect')}
                  </Button>
                </article>
              );
            })}
          </div>
        </>
      )}

      <h3 className="section-title">
        <Icon name="bag" size={17} /> {t('farm.pantry')}
      </h3>
      <div className="pantry-strip">
        {INGREDIENTS.map((ingredient) => {
          const count = state.pantry.ingredients[ingredient.id] ?? 0;
          return (
            <span key={ingredient.id} className={cx('pantry-item', count === 0 && 'is-empty')}>
              <span className="ingredient-dot-small" style={{ background: ingredient.color }} />
              {t(ingredient.nameKey, { defaultValue: ingredient.name })}
              <em>{count}</em>
            </span>
          );
        })}
      </div>
      <p className="muted center">{t('farm.producerHint')}</p>
    </Modal>
  );
}
