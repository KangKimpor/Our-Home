import { useTranslation } from 'react-i18next';
import { ITEMS_BY_ID } from '../../data/items';
import { ROOMS } from '../../data/rooms';
import { useGameStore, variantSwatches } from '../../store/gameStore';
import { Button, Empty, ItemArt, Modal, cx } from '../bits';
import { Icon } from '../icons';

export function ItemPanel({ arg }: { arg?: string }) {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const beginPlacing = useGameStore((s) => s.beginPlacing);
  const removeItem = useGameStore((s) => s.removeItem);
  const sellItem = useGameStore((s) => s.sellItem);
  const swapVariant = useGameStore((s) => s.swapVariant);
  const toggleFlip = useGameStore((s) => s.toggleFlip);
  const placed = arg ? state.placed.find((entry) => entry.uid === arg) : undefined;
  const def = placed ? ITEMS_BY_ID[placed.itemId] : undefined;
  const host = placed?.hostUid ? state.placed.find((entry) => entry.uid === placed.hostUid) : undefined;
  const hostDef = host ? ITEMS_BY_ID[host.itemId] : undefined;
  const variants = def ? variantSwatches(def.id) : [];

  return (
    <Modal
      title={def?.name ?? t('inventory.title')}
      subtitle={def ? t(ROOMS[def.room].nameKey) : undefined}
      size="md"
      icon={<Icon name="bag" size={22} />}
      onClose={closeOverlay}
    >
      {!placed || !def ? (
        <Empty icon="bag">{t('inventory.emptyRooms')}</Empty>
      ) : (
        <div className="item-detail">
          <div className="item-detail-art">
            <ItemArt itemId={def.id} size={220} />
          </div>
          <div className="item-detail-meta">
            <span className="item-price">
              <Icon name="heart" size={15} /> {def.price}
            </span>
            <small>
              {t(`shop.anchor${def.anchor === 'floor' ? 'Floor' : def.anchor === 'wall' ? 'Wall' : 'Surface'}`)}
              {hostDef ? ` · ${t('edit.hostHint')} ${hostDef.name}` : ''}
            </small>
            <small>{t('inventory.ownedCount', { count: state.inventory[def.id] ?? 1 })}</small>
          </div>

          {variants.length > 1 ? (
            <div className="item-variants">
              <span className="field-label">
                <Icon name="palette" size={16} /> {t('inventory.variant')}
              </span>
              <div className="variant-row">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={cx('variant-chip', variant.id === def.id && 'is-active')}
                    title={variant.name}
                    onClick={() => {
                      swapVariant(placed.uid, variant.id);
                      closeOverlay();
                    }}
                  >
                    <ItemArt itemId={variant.id} size={40} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="item-detail-actions">
            <Button size="sm" variant="secondary" icon="flip" onClick={() => toggleFlip(placed.uid)}>
              {t('inventory.flip')}
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon="edit"
              onClick={() => {
                closeOverlay();
                beginPlacing(def.id);
              }}
            >
              {t('inventory.place')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon="trash"
              onClick={() => {
                removeItem(placed.uid);
                closeOverlay();
              }}
            >
              {t('inventory.remove')}
            </Button>
            {def.price > 0 ? (
              <Button
                size="sm"
                variant="danger"
                icon="heart"
                onClick={() => {
                  sellItem(def.id, placed.uid);
                  closeOverlay();
                }}
              >
                {t('inventory.sell', { defaultValue: `Sell (+${Math.floor(def.price * 0.5)})`, count: Math.floor(def.price * 0.5) })}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
