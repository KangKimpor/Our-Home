import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dayPhase, now } from '../config/time';
import { EVENTS, eventActive, eventEndTimestamp } from '../data/events';
import { ITEMS_BY_ID } from '../data/items';
import { ROOMS } from '../data/rooms';
import { useGameStore, variantSwatches } from '../store/gameStore';
import { ItemArt } from './bits';
import { Icon, type IconName } from './icons';

function saveLabel(status: 'idle' | 'saving' | 'saved' | 'error', t: (key: string) => string): string {
  if (status === 'saving') return t('hud.saveSaving');
  if (status === 'saved') return t('hud.saveSaved');
  if (status === 'error') return t('hud.saveError');
  return t('hud.saveIdle');
}

export function Hud() {
  const { t } = useTranslation();
  const hearts = useGameStore((s) => s.state.hearts);
  const roomId = useGameStore((s) => s.roomId);
  const editMode = useGameStore((s) => s.editMode);
  const selectedUid = useGameStore((s) => s.selectedUid);
  const placingItemId = useGameStore((s) => s.placingItemId);
  const saveStatus = useGameStore((s) => s.saveStatus);
  const undoDepth = useGameStore((s) => s.undoDepth);
  const redoDepth = useGameStore((s) => s.redoDepth);
  const eventsState = useGameStore((s) => s.state.events);
  const placed = useGameStore((s) => s.state.placed);
  const store = useGameStore.getState;
  const [menuOpen, setMenuOpen] = useState(false);

  const room = ROOMS[roomId];
  const placingItem = placingItemId ? ITEMS_BY_ID[placingItemId] : undefined;
  const selected = selectedUid ? placed.find((p) => p.uid === selectedUid) : undefined;
  const selectedDef = selected ? ITEMS_BY_ID[selected.itemId] : undefined;
  const variants = selectedDef ? variantSwatches(selectedDef.id) : [];
  const phase = dayPhase(now());

  const activeEvents = useMemo(
    () =>
      EVENTS.filter((event) => eventActive(event, Date.now()))
        .slice(0, 3)
        .map((event) => ({
          event,
          progress: eventsState[event.id]?.progress ?? 0,
          claimed: eventsState[event.id]?.claimed ?? false,
          days: Math.max(0, Math.ceil((eventEndTimestamp(event, Date.now()) - Date.now()) / 86_400_000)),
        })),
    [eventsState],
  );

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, [menuOpen]);

  const menuItems: { overlay: Parameters<ReturnType<typeof store>['openOverlay']>[0]; label: string; icon: IconName }[] = [
    { overlay: 'map', label: t('hud.map'), icon: 'map' },
    { overlay: 'inventory', label: t('hud.inventory'), icon: 'bag' },
    { overlay: 'visitors', label: t('visitors.title'), icon: 'users' },
    { overlay: 'moments', label: t('moments.title'), icon: 'camera' },
    { overlay: 'recipes', label: t('recipes.title'), icon: 'book' },
    { overlay: 'event', label: t('events.title'), icon: 'calendar' },
    { overlay: 'pet', label: t('pets.title'), icon: 'paw' },
    { overlay: 'characters', label: t('characters.title'), icon: 'users' },
    { overlay: 'settings', label: t('settings.title'), icon: 'settings' },
    { overlay: 'about', label: t('settings.about'), icon: 'info' },
  ];

  const open = (overlay: Parameters<ReturnType<typeof store>['openOverlay']>[0], arg?: string) => {
    setMenuOpen(false);
    store().openOverlay(overlay, arg);
  };

  return (
    <div className="hud">
      <div className="hud-top-left">
        <button
          type="button"
          className={menuOpen ? 'hud-peek is-open' : 'hud-peek'}
          aria-label={t('hud.menu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="peek-eye" />
          <span className="peek-eye" />
        </button>
      </div>

      <div className="hud-room">
        <button type="button" className="hud-round" aria-label={t('hud.roomPrev')} onClick={() => store().stepRoom(-1)}>
          <Icon name="chevronLeft" size={22} />
        </button>
        <button type="button" className="room-plaque" onClick={() => open('map')} title={t('map.hint')}>
          <span>{t(room.nameKey)}</span>
          <small>
            <Icon name={phase === 'night' ? 'moon' : 'sun'} size={13} />
            {phase === 'night' ? t('hud.night') : t('hud.day')}
          </small>
        </button>
        <button type="button" className="hud-round" aria-label={t('hud.roomNext')} onClick={() => store().stepRoom(1)}>
          <Icon name="chevronRight" size={22} />
        </button>
      </div>

      <button type="button" className="heart-plaque" onClick={() => open('shop')} aria-label={t('hud.hearts')}>
        <Icon name="heart" size={26} />
        <strong>{hearts}</strong>
        <span className="heart-plus">
          <Icon name="plus" size={14} />
        </span>
      </button>

      <div className="event-tags">
        {activeEvents.map(({ event, progress, claimed, days }) => (
          <button
            key={event.id}
            type="button"
            className={`event-tag event-tag-${event.color}`}
            onClick={() => open('event', event.id)}
            title={t(event.nameKey, { defaultValue: event.name })}
          >
            <Icon name={event.icon === 'leaf' ? 'leaf' : event.icon === 'moon' ? 'moon' : 'star'} size={15} />
            <span>{t('common.day', { count: days })}</span>
            <span className="event-tag-progress">
              {Math.min(progress, event.target)}/{event.target}
              {claimed ? ' ✓' : ''}
            </span>
          </button>
        ))}
      </div>

      <button type="button" className="hud-feed" onClick={() => open('feed')} aria-label={t('hud.feed')}>
        <Icon name="bowl" size={28} />
        <span>{t('hud.feed')}</span>
      </button>

      <div className="hud-right">
        <button type="button" className="hud-square hud-inventory" onClick={() => open('inventory')} aria-label={t('hud.inventory')}>
          <Icon name="bag" size={26} />
          <span>{t('hud.inventory')}</span>
        </button>
        <button type="button" className="hud-square hud-shop" onClick={() => open('shop')} aria-label={t('hud.shop')}>
          <Icon name="shop" size={26} />
          <span>{t('hud.shop')}</span>
        </button>
      </div>

      <div className="hud-dock">
        <button type="button" className={editMode ? 'dock-btn is-active' : 'dock-btn'} onClick={() => store().setEditMode(!editMode)}>
          <Icon name={editMode ? 'check' : 'edit'} size={21} />
          <span>{editMode ? t('hud.done') : t('hud.edit')}</span>
        </button>
        <button type="button" className="dock-btn" onClick={() => open('recipes')}>
          <Icon name="book" size={21} />
          <span>{t('recipes.title')}</span>
        </button>
        <button
          type="button"
          className="dock-btn"
          onClick={() => open(roomId === 'farm' || roomId === 'garden' ? 'farm' : 'pet')}
        >
          <Icon name={roomId === 'farm' || roomId === 'garden' ? 'seed' : 'paw'} size={21} />
          <span>{roomId === 'farm' || roomId === 'garden' ? t('farm.title') : t('pets.title')}</span>
        </button>
        <button type="button" className="dock-btn" onClick={() => open('moments')}>
          <Icon name="camera" size={21} />
          <span>{t('moments.title')}</span>
        </button>
      </div>

      <div className={`save-pill save-${saveStatus}`}>
        <span className="save-dot" />
        {saveLabel(saveStatus, t)}
      </div>

      {editMode ? (
        <div className="edit-bar">
          <div className="edit-bar-row">
            <Icon name="edit" size={18} />
            <span className="edit-hint">
              {selectedDef ? t('edit.selected', { name: selectedDef.name }) : t('edit.hint')}
            </span>
            <div className="edit-actions">
              <button type="button" className="mini-btn" disabled={undoDepth === 0} onClick={() => store().undo()}>
                <Icon name="undo" size={17} />
                <span>{t('hud.undo')}</span>
              </button>
              <button type="button" className="mini-btn" disabled={redoDepth === 0} onClick={() => store().redo()}>
                <Icon name="redo" size={17} />
                <span>{t('hud.redo')}</span>
              </button>
              <button type="button" className="mini-btn mini-done" onClick={() => store().setEditMode(false)}>
                <Icon name="check" size={17} />
                <span>{t('hud.done')}</span>
              </button>
            </div>
          </div>
          {selected && selectedDef ? (
            <div className="edit-bar-row edit-selected">
              <ItemArt itemId={selectedDef.id} size={42} />
              <strong>{selectedDef.name}</strong>
              {variants.length > 0 ? (
                <div className="variant-row">
                  <Icon name="palette" size={16} />
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      className={variant.id === selectedDef.id ? 'variant-chip is-active' : 'variant-chip'}
                      onClick={() => store().swapVariant(selected.uid, variant.id)}
                      title={variant.name}
                    >
                      <ItemArt itemId={variant.id} size={30} />
                    </button>
                  ))}
                </div>
              ) : null}
              <button type="button" className="mini-btn" onClick={() => store().toggleFlip(selected.uid)}>
                <Icon name="flip" size={17} />
                <span>{t('inventory.flip')}</span>
              </button>
              <button type="button" className="mini-btn mini-danger" onClick={() => store().removeItem(selected.uid)}>
                <Icon name="trash" size={17} />
                <span>{t('inventory.remove')}</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {placingItem ? (
        <div className="placing-bar">
          <ItemArt itemId={placingItem.id} size={44} />
          <div>
            <strong>{placingItem.name}</strong>
            <small>{t('edit.placeHint')}</small>
          </div>
          <button type="button" className="mini-btn" onClick={() => store().cancelPlacing()}>
            <Icon name="close" size={17} />
            <span>{t('common.cancel')}</span>
          </button>
        </div>
      ) : null}

      {menuOpen ? (
        <>
          <button type="button" className="hud-scrim" aria-label={t('common.close')} onClick={() => setMenuOpen(false)} />
          <div className="hud-menu" role="menu">
            <div className="hud-menu-head">
              <span>{t('app.name')}</span>
              <Icon name="home" size={20} />
            </div>
            {menuItems.map((item) => (
              <button
                key={`${item.overlay}-${item.label}`}
                type="button"
                role="menuitem"
                onClick={() => open(item.overlay)}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
              </button>
            ))}
            <div className="hud-menu-foot">
              <span>{t('app.tagline')}</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
