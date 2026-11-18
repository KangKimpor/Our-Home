import { useEffect, useId, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { animalArt } from '../art/animals';
import { getItemSprite, ITEM_SPRITE_MAP as PACK_ITEM_SPRITE_MAP } from '../art/assetPack';
import { characterArt, type CharacterArtOptions } from '../art/characters';
import { itemArt } from '../art/items';
import { momentSceneArt } from '../art/scenes';
import { svgDoc } from '../art/svg';
import { ITEMS_BY_ID } from '../data/items';
import type { CharacterLook, ItemDef } from '../game/types';
import { Icon, type IconName } from './icons';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

const svgCache = new Map<string, string>();

function dataUrl(key: string, make: () => string): string {
  const cached = svgCache.get(key);
  if (cached) return cached;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(make())}`;
  svgCache.set(key, url);
  return url;
}

const PACK_BASE = '/asset-pack-v1.1/';

/** Transparent PNG sprites (manifest transparent_background: true) mapped by item ID. */
export const ITEM_SPRITE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PACK_ITEM_SPRITE_MAP).map(([id, mapping]) => [id, mapping.url]),
);

/** Illustrated photo cards from the v1.1 moments gallery. */
export const MOMENT_PHOTO_CARDS: Record<string, string> = {
  moveIn: `${PACK_BASE}assets/ui_gallery/moments_photo_card_01.png`,
  tenItems: `${PACK_BASE}assets/ui_gallery/moments_photo_card_02.png`,
  sofaNap: `${PACK_BASE}assets/ui_gallery/moments_photo_card_03.png`,
  sinkCat: `${PACK_BASE}assets/ui_gallery/moments_photo_card_04.png`,
  drawerCat: `${PACK_BASE}assets/ui_gallery/moments_photo_card_05.png`,
  snackBag: `${PACK_BASE}assets/ui_gallery/moments_photo_card_06.png`,
};

export function resolveItemSprite(item: ItemDef): string | undefined {
  const custom = (item as ItemDef & { sprite?: string }).sprite;
  if (custom) {
    if (custom.startsWith('/') || custom.startsWith('data:') || custom.startsWith('http')) return custom;
    return `${PACK_BASE}${custom.replace(/^\.?\//, '')}`;
  }
  return getItemSprite(item.id)?.url;
}

export function itemArtUrl(item: ItemDef): string {
  return dataUrl(`item:${item.id}`, () => svgDoc(itemArt(item)));
}

export function useItemLabel(): (item: ItemDef) => string {
  const { t } = useTranslation();
  return (item) => t(`item.${item.id}`, { defaultValue: item.name });
}

export function ItemArt({ itemId, size = 92, className }: { itemId: string; size?: number; className?: string }) {
  const item = ITEMS_BY_ID[itemId];
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    setFallback(false);
  }, [itemId]);

  if (!item) return <span className={cx('art-fallback', className)} style={{ width: size, height: size }} />;
  const spriteUrl = !fallback ? resolveItemSprite(item) : undefined;
  const src = spriteUrl ?? itemArtUrl(item);

  return (
    <img
      className={cx('item-art', spriteUrl && 'item-art-sprite', className)}
      src={src}
      alt=""
      draggable={false}
      onError={spriteUrl ? () => setFallback(true) : undefined}
      style={{ maxWidth: size, maxHeight: size }}
    />
  );
}

export function AnimalArt({
  species,
  coat,
  size = 80,
  pose = 'idle',
  className,
}: {
  species: string;
  coat: string;
  size?: number;
  pose?: 'idle' | 'walk' | 'sleep' | 'special';
  className?: string;
}) {
  const url = dataUrl(`animal:${species}:${coat}:${pose}`, () => svgDoc(animalArt({ species, coat, pose })));
  return <img className={cx('animal-art', className)} src={url} alt="" draggable={false} style={{ maxWidth: size, maxHeight: size }} />;
}

export function CharacterArt({ look, size = 120 }: { look: CharacterLook; size?: number }) {
  const options: CharacterArtOptions = {
    skin: look.skin,
    hair: look.hair,
    hairStyle: look.hairStyle,
    outfit: look.outfit,
  };
  const url = dataUrl(`character:${look.skin}:${look.hair}:${look.hairStyle}:${look.outfit}`, () => svgDoc(characterArt(options)));
  return <img className="character-art" src={url} alt="" draggable={false} style={{ maxHeight: size }} />;
}

export function SceneArt({ momentId, className }: { momentId: string; className?: string }) {
  const photoCardUrl = MOMENT_PHOTO_CARDS[momentId];
  const svgUrl = useMemo(() => dataUrl(`scene:${momentId}`, () => svgDoc(momentSceneArt(momentId))), [momentId]);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    setFallback(false);
  }, [momentId]);

  const usePhotoCard = Boolean(photoCardUrl && !fallback);
  return (
    <img
      className={cx('scene-art', usePhotoCard && 'scene-art-photo-card', className)}
      src={usePhotoCard ? photoCardUrl : svgUrl}
      alt=""
      draggable={false}
      onError={usePhotoCard ? () => setFallback(true) : undefined}
    />
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  block?: boolean;
}

export function Button({ variant = 'secondary', size = 'md', icon, block, className, children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={cx('btn', `btn-${variant}`, `btn-${size}`, block && 'btn-block', className)} {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 20} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  className,
  size = 22,
  badge,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string; size?: number; badge?: number | string }) {
  return (
    <button type="button" className={cx('icon-btn', className)} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={size} />
      {badge !== undefined && badge !== 0 ? <span className="icon-btn-badge">{badge}</span> : null}
    </button>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'md',
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={cx('modal', `modal-${size}`, className)} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-head">
          <div className="modal-head-text">
            <h2 id={titleId}>
              {icon ? <span className="modal-head-icon">{icon}</span> : null}
              {title}
            </h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <IconButton icon="close" label="Close" onClick={onClose} />
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-foot">{footer}</footer> : null}
      </section>
    </div>
  );
}

export function Tabs<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { id: T; label: string; count?: number; icon?: IconName }[];
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cx('tabs', className)} role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={option.id === value}
          className={cx('tab', option.id === value && 'is-active')}
          onClick={() => onChange(option.id)}
        >
          {option.icon ? <Icon name={option.icon} size={17} /> : null}
          <span>{option.label}</span>
          {option.count !== undefined ? <span className="tab-count">{option.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Bar({ value, max = 100, tone = 'pink', className }: { value: number; max?: number; tone?: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className={cx('bar', `bar-${tone}`, className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Empty({ icon = 'sparkle', children }: { icon?: IconName; children: ReactNode }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={34} />
      <div className="empty-text">{children}</div>
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={cx('chip', active && 'is-active', className)} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

export function Swatch({
  color,
  active,
  label,
  onClick,
}: {
  color: string;
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cx('swatch', active && 'is-active')}
      style={{ background: color }}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

/** "12 min", "3 h", "2 d" with translated units. */
export function durationLabel(ms: number, t: (key: string, options?: Record<string, unknown>) => string): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  if (totalMinutes >= 1440) return t('common.day', { count: Math.floor(totalMinutes / 1440) });
  if (totalMinutes >= 60) return t('common.hour', { count: Math.floor(totalMinutes / 60) });
  if (totalMinutes <= 0) return t('common.now');
  return t('common.min', { count: totalMinutes });
}

export function useDateLabel(): (ts: number) => string {
  return (ts: number) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        day: 'numeric',
      }).format(new Date(ts));
    } catch {
      return new Date(ts).toLocaleDateString();
    }
  };
}

export function useCountdown(): (readyAt: number) => string {
  const { t } = useTranslation();
  return (readyAt: number) => durationLabel(readyAt - Date.now(), t);
}
