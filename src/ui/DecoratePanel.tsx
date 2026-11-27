import { useEffect, useRef } from 'react';
import { FURNITURE_SLOTS, resolveSlotOption, SLOT_BY_ID, type SlotSelections } from '../game/layout';
import { PET_OPTIONS, resolvePetOption } from '../game/pet';
import type { SlotId } from '../game/sharedHomeCore';
import { versionedAssetUrl } from '../game/version';
import { CloseIcon, stopPointer as stop } from './CloseIcon';

/** Furniture slots plus the wandering pet companion. */
export type DecorateTarget = SlotId | 'pet';

interface Props {
  active: DecorateTarget;
  slots: SlotSelections;
  petId: string;
  onSelectTarget: (target: DecorateTarget) => void;
  onPickSlotOption: (slotId: SlotId, optionId: string) => void;
  onPickPet: (petId: string) => void;
  onClose: () => void;
}

interface Card {
  id: string;
  label: string;
  sprite: string;
}

/** Keeps a child visible inside a horizontal scroller without scrolling the page itself. */
function revealHorizontally(container: HTMLElement | null, child: HTMLElement | null) {
  if (!container || !child) return;
  const left =
    child.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft;
  const right = left + child.offsetWidth;
  const pad = 12;
  if (left - pad < container.scrollLeft) container.scrollLeft = Math.max(0, left - pad);
  else if (right + pad > container.scrollLeft + container.clientWidth) {
    container.scrollLeft = right + pad - container.clientWidth;
  }
}

/**
 * Hand-painted drawer for swapping the art in each fixed furniture slot (and the pet).
 * Lives in the HUD overlay, outside `.room`, so it never adds sprites to the scene.
 */
export function DecoratePanel({
  active,
  slots,
  petId,
  onSelectTarget,
  onPickSlotOption,
  onPickPet,
  onClose,
}: Props) {
  const tabsRef = useRef<HTMLDivElement>(null);

  const isPet = active === 'pet';
  const slot = isPet ? null : SLOT_BY_ID[active];
  const title = isPet ? 'Pet' : slot!.label;
  const selectedId = isPet ? resolvePetOption(petId).id : resolveSlotOption(slot!, slots[slot!.id]).id;
  const cards: readonly Card[] = isPet ? PET_OPTIONS : slot!.options;

  useEffect(() => {
    const tabs = tabsRef.current;
    revealHorizontally(tabs, tabs?.querySelector<HTMLElement>(`[data-target="${active}"]`) ?? null);
  }, [active]);

  const tabs: { id: DecorateTarget; label: string }[] = [
    ...FURNITURE_SLOTS.map((s) => ({ id: s.id, label: s.label })),
    { id: 'pet', label: 'Pet' },
  ];

  return (
    <section
      id="decorate-panel"
      className="decorate-panel"
      data-testid="decorate-panel"
      aria-label="Decorate the living room"
      onPointerDown={stop}
      onPointerMove={stop}
      onPointerUp={stop}
    >
      <div className="decorate-header">
        <p className="decorate-title" data-testid="decorate-title">
          <span className="decorate-kicker">Decorate</span>
          <span className="decorate-slot-name">{title}</span>
        </p>
        <button
          type="button"
          className="panel-close decorate-close"
          data-testid="decorate-close"
          aria-label="Close decorate"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div ref={tabsRef} className="decorate-tabs" role="tablist" aria-label="Furniture spots">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`decorate-tab${selected ? ' is-selected' : ''}`}
              data-testid={`slot-tab-${tab.id}`}
              data-target={tab.id}
              aria-selected={selected}
              aria-controls="decorate-options"
              onClick={() => onSelectTarget(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div id="decorate-options" className="decorate-options" role="tabpanel" aria-label={`${title} options`}>
        {cards.map((card) => {
          const selected = card.id === selectedId;
          return (
            <button
              key={card.id}
              type="button"
              className={`outfit-option decorate-option${selected ? ' is-selected' : ''}`}
              data-testid={`slot-option-${active}-${card.id}`}
              aria-pressed={selected}
              onClick={() => (isPet ? onPickPet(card.id) : onPickSlotOption(slot!.id, card.id))}
            >
              <span className="outfit-thumb decorate-thumb">
                <img src={versionedAssetUrl(`/sprites/${card.sprite}.png`)} alt="" draggable={false} />
              </span>
              <span className="outfit-label">{card.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
