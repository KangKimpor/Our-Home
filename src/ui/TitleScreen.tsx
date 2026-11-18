import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { unlockAudio } from '../audio/engine';
import { Button } from './bits';
import { Icon } from './icons';

const VERSION = '0.1.0';
const PACK = '/asset-pack-v1.1/assets/';

interface DioramaSprite {
  src: string;
  left: string;
  bottom: string;
  width: string;
  zIndex?: number;
  className?: string;
}

const DIORAMA_SPRITES: DioramaSprite[] = [
  { src: `${PACK}music_living/living_entry_bookcase.png`, left: '2%', bottom: '28%', width: '13%', zIndex: 1 },
  { src: `${PACK}music_living/living_wall_love_frame.png`, left: '63%', bottom: '63%', width: '18%', zIndex: 1 },
  { src: `${PACK}music_living/music_upright_piano.png`, left: '60%', bottom: '32%', width: '25%', zIndex: 2 },
  { src: `${PACK}music_living/living_blue_decorative_vase.png`, left: '86%', bottom: '35%', width: '9%', zIndex: 2 },
  { src: `${PACK}indoor/potted_indoor_tree.png`, left: '13%', bottom: '33%', width: '17%', zIndex: 2 },
  { src: `${PACK}music_living/living_coffee_table_green_rug.png`, left: '24%', bottom: '18%', width: '36%', zIndex: 2 },
  { src: `${PACK}music_living/living_green_sofa.png`, left: '18%', bottom: '4%', width: '48%', zIndex: 4 },
  { src: `${PACK}indoor/floor_lamp.png`, left: '68%', bottom: '8%', width: '15%', zIndex: 4 },
];

const DIORAMA_PETS: DioramaSprite[] = [
  { src: `${PACK}animals/yellow_bird.png`, left: '72%', bottom: '59%', width: '7%', zIndex: 3, className: 'title-pet-bird' },
  { src: `${PACK}animals/red_panda_sitting.png`, left: '8%', bottom: '11%', width: '12%', zIndex: 5, className: 'title-pet-b' },
  { src: `${PACK}animals/calico_cat_lounging.png`, left: '37%', bottom: '25%', width: '13%', zIndex: 3, className: 'title-pet-cat' },
  { src: `${PACK}animals/shiba_dog_standing.png`, left: '79%', bottom: '11%', width: '15%', zIndex: 5, className: 'title-pet' },
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
        {DIORAMA_SPRITES.map((sprite) => (
          <img
            key={sprite.src}
            src={sprite.src}
            alt=""
            draggable={false}
            className="title-decor title-sprite"
            style={{ left: sprite.left, bottom: sprite.bottom, width: sprite.width, zIndex: sprite.zIndex }}
          />
        ))}
        {DIORAMA_PETS.map((pet) => (
          <img
            key={pet.src}
            src={pet.src}
            alt=""
            draggable={false}
            className={`title-sprite ${pet.className ?? 'title-pet'}`}
            style={{ left: pet.left, bottom: pet.bottom, width: pet.width, zIndex: pet.zIndex }}
          />
        ))}
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
