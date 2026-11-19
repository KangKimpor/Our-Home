import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { unlockAudio } from '../audio/engine';
import { AnimalArt, Button, ItemArt } from './bits';
import { Icon } from './icons';

const VERSION = '0.1.0';
const PACK = '/asset-pack-v1.1/assets/';

interface DioramaItem {
  itemId: string;
  left: string;
  bottom: string;
  width: string;
  zIndex?: number;
}

const DIORAMA_ITEMS: DioramaItem[] = [
  { itemId: 'living.shelf', left: '4%', bottom: '62%', width: '12%', zIndex: 1 },
  { itemId: 'living.painting', left: '63%', bottom: '64%', width: '13%', zIndex: 1 },
  { itemId: 'living.piano', left: '63%', bottom: '28%', width: '25%', zIndex: 2 },
  { itemId: 'living.pianoBench', left: '70%', bottom: '20%', width: '10%', zIndex: 3 },
  { itemId: 'living.fern', left: '14%', bottom: '32%', width: '10%', zIndex: 2 },
  { itemId: 'living.rug.oval', left: '22%', bottom: '6%', width: '36%', zIndex: 1 },
  { itemId: 'living.sofa.sage', left: '22%', bottom: '12%', width: '31%', zIndex: 3 },
  { itemId: 'living.coffeeTable', left: '34%', bottom: '8%', width: '19%', zIndex: 4 },
  { itemId: 'living.floorLamp', left: '53%', bottom: '22%', width: '9%', zIndex: 4 },
];

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
        {DIORAMA_ITEMS.map((item) => (
          <div
            key={item.itemId}
            className="title-decor"
            style={{ left: item.left, bottom: item.bottom, width: item.width, zIndex: item.zIndex }}
          >
            <ItemArt itemId={item.itemId} size={420} />
          </div>
        ))}
        <div
          className="title-decor title-pet title-pet-bird"
          style={{ left: '72%', bottom: '59%', width: '7%', zIndex: 4 }}
        >
          <AnimalArt species="bird" coat="butter" size={160} />
        </div>
        <div
          className="title-decor title-pet title-pet-b"
          style={{ left: '7%', bottom: '10%', width: '13%', zIndex: 5 }}
        >
          <AnimalArt species="redPanda" coat="rust" size={200} />
        </div>
        <img
          src={`${PACK}animals/calico_cat_lounging.png`}
          alt=""
          draggable={false}
          className="title-sprite title-pet-cat"
          style={{ left: '37%', bottom: '25%', width: '13%', zIndex: 4 }}
        />
        <img
          src={`${PACK}animals/shiba_dog_standing.png`}
          alt=""
          draggable={false}
          className="title-sprite title-pet"
          style={{ left: '79%', bottom: '11%', width: '15%', zIndex: 5 }}
        />
      </div>

      <main className="title-card">
        <div className="title-plaque-bar">
          <span className="plaque-nail plaque-nail-tl" aria-hidden="true" />
          <span className="plaque-nail plaque-nail-tr" aria-hidden="true" />
          <span className="plaque-nail plaque-nail-bl" aria-hidden="true" />
          <span className="plaque-nail plaque-nail-br" aria-hidden="true" />
          <p className="title-kicker">
            <Icon name="home" size={16} /> {t('app.tagline')}
          </p>
        </div>
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
