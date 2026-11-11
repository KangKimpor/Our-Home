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
    { id: 'living.bookshelf', left: '4%', bottom: '32%', width: '16%' },
    { id: 'living.painting', left: '66%', bottom: '62%', width: '16%' },
    { id: 'living.clock', left: '84%', bottom: '66%', width: '9%' },
    { id: 'living.rug.oval', left: '16%', bottom: '4%', width: '48%' },
    { id: 'living.sofa.sage', left: '20%', bottom: '18%', width: '40%' },
    { id: 'living.floorLamp', left: '63%', bottom: '20%', width: '11%' },
    { id: 'living.coffeeTable', left: '28%', bottom: '8%', width: '25%' },
    { id: 'living.fern', left: '76%', bottom: '16%', width: '13%' },
  ];

  return (
    <div className="title-screen">
      <div className="title-scene" aria-hidden="true">
        <div className="title-wall" />
        <div className="title-wainscot" />
        <div className="title-window">
          <div className="title-sun" />
          <div className="title-cloud title-cloud-a" />
          <div className="title-cloud title-cloud-b" />
          <div className="title-hill title-hill-a" />
          <div className="title-hill title-hill-b" />
          <div className="title-window-cross-v" />
          <div className="title-window-cross-h" />
        </div>
        <div className="title-sunbeam" />
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
        <span className="title-pet title-pet-b">
          <AnimalArt species="dog" coat="golden" pose="sleep" size={170} />
        </span>
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
