import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ITEMS_BY_ID } from '../data/items';
import { useGameStore } from '../store/gameStore';
import { unlockAudio } from '../audio/engine';
import { AnimalArt, Button, ItemArt } from './bits';
import { Icon } from './icons';

const VERSION = '0.1.0';

export function TitleScreen() {
  const { t } = useTranslation();
  const loaded = useGameStore((s) => s.loaded);
  const hadSave = useGameStore((s) => s.hadSave);
  const hearts = useGameStore((s) => s.state.hearts);
  const [confirmNew, setConfirmNew] = useState(false);
  const store = useGameStore.getState;

  const play = () => {
    unlockAudio();
    store().setScreen('game');
  };

  const newGame = async () => {
    unlockAudio();
    await store().resetGame();
    store().setScreen('game');
    setConfirmNew(false);
  };

  const decor: { id: string; left: string; bottom: string; width: string }[] = [
    { id: 'living.plant', left: '3%', bottom: '7%', width: '9%' },
    { id: 'living.sofa.sage', left: '17%', bottom: '4%', width: '32%' },
    { id: 'living.floorLamp', left: '52%', bottom: '6%', width: '8%' },
    { id: 'living.coffeeTable', left: '36%', bottom: '1%', width: '19%' },
    { id: 'living.rug.oval', left: '22%', bottom: '0%', width: '34%' },
    { id: 'living.fern', left: '66%', bottom: '3%', width: '8%' },
    { id: 'living.painting', left: '26%', bottom: '38%', width: '12%' },
  ];

  return (
    <div className="title-screen">
      <div className="title-scene" aria-hidden="true">
        <div className="title-sun" />
        <div className="title-cloud title-cloud-a" />
        <div className="title-cloud title-cloud-b" />
        <div className="title-wall" />
        <div className="title-floor" />
        {decor.map((entry) =>
          ITEMS_BY_ID[entry.id] ? (
            <span key={`${entry.id}-${entry.left}`} className="title-decor" style={{ left: entry.left, bottom: entry.bottom, width: entry.width }}>
              <ItemArt itemId={entry.id} size={420} />
            </span>
          ) : null,
        )}
        <span className="title-pet">
          <AnimalArt species="cat" coat="ginger" size={190} />
        </span>
        <div className="title-plants">
          <span className="title-vine" />
          <span className="title-vine title-vine-b" />
        </div>
      </div>

      <main className="title-card">
        <p className="title-kicker">
          <Icon name="home" size={16} /> {t('app.tagline')}
        </p>
        <h1>{t('app.name')}</h1>
        <p className="title-lede">{t('about.body')}</p>

        {!loaded ? (
          <div className="title-loading">
            <span className="spinner" />
            {t('app.loading')}
          </div>
        ) : (
          <div className="title-actions">
            <Button variant="primary" size="lg" icon="door" onClick={play} disabled={!loaded}>
              {hadSave ? t('title.continue') : t('title.play')}
            </Button>
            {hadSave ? (
              <Button variant="ghost" size="md" icon="sparkle" onClick={() => setConfirmNew(true)}>
                {t('title.newGame')}
              </Button>
            ) : null}
          </div>
        )}

        {confirmNew ? (
          <div className="title-confirm" role="alertdialog" aria-label={t('title.newGame')}>
            <p>{t('title.newGameConfirm')}</p>
            <div>
              <Button variant="danger" size="sm" onClick={newGame}>
                {t('common.confirm')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmNew(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="title-notes">
          <span>
            <Icon name="heart" size={16} /> {t('common.hearts')}: {hearts}
          </span>
          <span>
            <Icon name="cloud" size={16} /> {t('title.savedLocally')}
          </span>
          <span>
            <Icon name="sun" size={16} /> {t('title.offline')}
          </span>
        </div>

        <p className="title-foot">
          {t('title.credits')} · {t('app.version', { version: VERSION })}
        </p>
      </main>
    </div>
  );
}
