import { useTranslation } from 'react-i18next';
import { summarize } from '../save/schema';
import { useGameStore } from '../store/gameStore';
import { Button, CharacterArt, Modal } from './bits';
import { Icon } from './icons';
import { FarmPanel } from './panels/FarmPanel';
import { AboutPanel, PrivacyPanel } from './panels/AboutPanel';
import { CharactersPanel } from './panels/CharactersPanel';
import { EventPanel } from './panels/EventPanel';
import { FeedPanel } from './panels/FeedPanel';
import { InventoryPanel } from './panels/InventoryPanel';
import { ItemPanel } from './panels/ItemPanel';
import { MapPanel } from './panels/MapPanel';
import { MomentDetailPanel, MomentsPanel } from './panels/MomentsPanel';
import { PetsPanel } from './panels/PetsPanel';
import { RecipesPanel } from './panels/RecipesPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import { ShopPanel } from './panels/ShopPanel';
import { VisitorsPanel } from './panels/VisitorsPanel';

/** A quiet pair of residents stands in the corner of the living room. */
function Residents() {
  const characters = useGameStore((s) => s.state.characters);
  const showBaby = useGameStore((s) => s.state.settings.showBaby);
  return (
    <div className="residents" aria-hidden="true">
      <CharacterArt look={characters[0]} size={132} />
      <CharacterArt look={characters[1]} size={132} />
      {showBaby ? (
        <span className="resident-baby">
          <Icon name="heart" size={18} />
        </span>
      ) : null}
    </div>
  );
}

function ConflictPanel() {
  const { t } = useTranslation();
  const conflict = useGameStore((s) => s.conflictSaves);
  const resolveConflict = useGameStore((s) => s.resolveConflict);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  if (!conflict) return null;
  const localSum = summarize(conflict.local.state);
  const cloudSum = summarize(conflict.cloud.state);

  return (
    <Modal title="This device vs Cloud" size="md" icon={<Icon name="cloud" size={22} />} onClose={closeOverlay}>
      <div className="settings-list">
        <p className="muted">Both this device and the cloud changed since your last sync. Choose which house to keep (the other copy is saved as a local snapshot).</p>
        <section className="settings-group">
          <h3>This device</h3>
          <p className="muted">
            {localSum.hearts} {t('common.hearts')} · {localSum.placed} placed · {localSum.visitors} visitors · {new Date(localSum.lastPlayed).toLocaleString()}
          </p>
          <Button size="sm" variant="primary" onClick={() => void resolveConflict('local')}>
            Keep this device
          </Button>
        </section>
        <section className="settings-group">
          <h3>Cloud save</h3>
          <p className="muted">
            {cloudSum.hearts} {t('common.hearts')} · {cloudSum.placed} placed · {cloudSum.visitors} visitors · {new Date(cloudSum.lastPlayed).toLocaleString()}
          </p>
          <Button size="sm" variant="secondary" icon="cloud" onClick={() => void resolveConflict('cloud')}>
            Use cloud save
          </Button>
        </section>
      </div>
    </Modal>
  );
}

export function OverlayHost() {
  const overlay = useGameStore((s) => s.overlay);
  const arg = useGameStore((s) => s.overlayArg);

  switch (overlay) {
    case 'shop':
      return <ShopPanel />;
    case 'inventory':
      return <InventoryPanel />;
    case 'visitors':
      return <VisitorsPanel />;
    case 'moments':
      return <MomentsPanel />;
    case 'moment':
      return <MomentDetailPanel momentId={arg} />;
    case 'recipes':
      return <RecipesPanel />;
    case 'settings':
      return <SettingsPanel />;
    case 'map':
      return <MapPanel />;
    case 'feed':
      return <FeedPanel arg={arg} />;
    case 'pet':
      return <PetsPanel arg={arg} />;
    case 'item':
      return <ItemPanel arg={arg} />;
    case 'event':
      return <EventPanel arg={arg} />;
    case 'farm':
      return <FarmPanel />;
    case 'conflict':
      return <ConflictPanel />;
    case 'characters':
      return <CharactersPanel />;
    case 'about':
      return <AboutPanel />;
    case 'privacy':
      return <PrivacyPanel />;
    default:
      return null;
  }
}

export { Residents };
