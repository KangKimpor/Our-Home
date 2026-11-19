import { useEffect, useId, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { animalArt } from '../art/animals';
import { getItemSprite, ITEM_SPRITE_MAP as PACK_ITEM_SPRITE_MAP } from '../art/assetPack';
import { characterArt, type CharacterArtOptions } from '../art/characters';
import { itemArt } from '../art/items';
import { momentSceneArt } from '../art/scenes';
import { INK, c, el, line, p, r, svgDoc } from '../art/svg';
import { now } from '../config/time';
import { ITEMS_BY_ID } from '../data/items';
import type { CharacterLook, FoodCategory, ItemDef } from '../game/types';
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

function ingredientArtBody(id: string): string {
  switch (id) {
    case 'strawberry':
      return (
        p('M 14 18 C 12 28 20 39 24 41 C 28 39 36 28 34 18 C 32 13 16 13 14 18 Z', '#C94D42') +
        p('M 16 14 L 21 17 L 24 10 L 27 17 L 32 14 L 27 18 L 21 18 Z', '#6E8A55') +
        c(20, 24, 1.3, '#FCE79C', 'none', 0) +
        c(26, 23, 1.3, '#FCE79C', 'none', 0) +
        c(23, 30, 1.3, '#FCE79C', 'none', 0)
      );
    case 'blueberry':
      return (
        p('M 22 14 C 26 9 33 10 34 15 C 29 18 24 17 22 14 Z', '#6E8A55') +
        c(19, 28, 8.5, '#53688F') +
        c(30, 29, 8, '#5E76A1') +
        c(24, 21, 7.5, '#4A5F86') +
        c(22, 18.5, 2, '#FFFDF8', 'none', 0)
      );
    case 'raspberry':
      return (
        p('M 18 13 L 24 9 L 30 13 Z', '#6E8A55') +
        c(18, 22, 5.5, '#C4576B') +
        c(30, 22, 5.5, '#C4576B') +
        c(24, 20, 5.5, '#D4667A') +
        c(19, 29, 5.5, '#C4576B') +
        c(29, 29, 5.5, '#C4576B') +
        c(24, 34, 5.2, '#D4667A') +
        c(24, 26, 5.5, '#DF768A')
      );
    case 'lemon':
      return (
        p('M 10 26 C 12 15 36 15 38 26 C 36 37 12 37 10 26 Z', '#E9C65B') +
        p('M 27 16 C 31 10 37 10 38 15 C 34 19 29 19 27 16 Z', '#6E8A55') +
        line(17, 22, 23, 21, '#FFF6CC', 2.4)
      );
    case 'tomato':
      return (
        el(24, 27, 13, 11.5, '#C94D42') +
        p('M 17 17 L 22 20 L 24 13 L 26 20 L 31 17 L 26 21 L 22 21 Z', '#5A7D43') +
        line(16, 22, 19, 21, '#F6A79E', 2.2)
      );
    case 'potato':
      return (
        el(24, 26, 13.5, 9.5, '#C49A6C', INK, 2.4, -14) +
        c(19, 25, 1.3, '#8A633E', 'none', 0) +
        c(28, 28, 1.4, '#8A633E', 'none', 0) +
        c(25, 22, 1.1, '#8A633E', 'none', 0)
      );
    case 'herb':
      return (
        line(24, 39, 24, 15, '#4E6B3E', 2.6) +
        p('M 24 28 C 14 25 13 15 21 17 C 24 19 25 25 24 28 Z', '#6E8A55') +
        p('M 24 26 C 34 23 35 13 27 15 C 24 17 23 23 24 26 Z', '#7FA162') +
        p('M 24 20 C 19 13 24 8 27 12 C 29 15 26 19 24 20 Z', '#8BAF6C')
      );
    case 'carrot':
      return (
        p('M 18 18 L 30 18 L 24 41 Z', '#D67C3E') +
        line(21, 24, 27, 24, '#9E5120', 1.8) +
        line(22, 30, 26, 30, '#9E5120', 1.8) +
        p('M 24 18 C 19 10 14 11 16 15 M 24 18 L 24 9 M 24 18 C 29 10 34 11 32 15', 'none', '#6E8A55', 2.4)
      );
    case 'egg':
      return (
        p('M 14 28 C 14 18 20 11 24 11 C 28 11 34 18 34 28 C 34 36 29 39 24 39 C 19 39 14 36 14 28 Z', '#F3E5CA') +
        c(20, 20, 1.5, '#D8BA92', 'none', 0) +
        c(28, 27, 1.3, '#D8BA92', 'none', 0) +
        c(21, 31, 1.1, '#D8BA92', 'none', 0)
      );
    case 'milk':
      return (
        p('M 17 20 L 20 13 L 28 13 L 31 20 L 31 38 L 17 38 Z', '#FAF7EC') +
        r(19, 10, 10, 4, '#7AA3BF', 1.5) +
        r(18, 24, 12, 9, '#9DC0D9', 1.5)
      );
    case 'fish':
      return (
        p('M 33 24 L 41 18 L 41 30 Z', '#7896B5') +
        el(22, 24, 12, 7.5, '#8EA7C6') +
        el(22, 26, 8, 3.5, '#DCE7F3', 'none', 0) +
        c(15, 23, 1.6, INK, 'none', 0)
      );
    default:
      // Honey jar
      return (
        r(14, 17, 20, 21, '#E9C65B', 5) +
        r(15, 11, 18, 7, '#FBF7EC', 3) +
        line(15, 15, 33, 15, '#D26B64', 2.2) +
        r(19, 23, 10, 9, '#FFFDF8', 2)
      );
  }
}

function foodArtBody(recipeId?: string, category?: FoodCategory): string {
  const plate = el(24, 30, 16, 8.5, '#FBF7EC') + el(24, 30, 11.5, 5.2, '#EAE1CE', 'none', 0);
  if (recipeId === 'tomatoSoup' || recipeId === 'fishStew' || recipeId === 'tomatoPotatoPot') {
    const soup = recipeId === 'tomatoSoup' ? '#C94D42' : '#D48A4E';
    return (
      p('M 10 24 L 38 24 C 37 36 30 39 24 39 C 18 39 11 36 10 24 Z', '#F3EDE0') +
      el(24, 24, 14, 5, soup) +
      c(24, 24, 2.5, '#6E8A55', 'none', 0) +
      p('M 19 16 C 17 13 21 11 19 8 M 28 16 C 26 13 30 11 28 8', 'none', '#B8B0A0', 2)
    );
  }
  if (recipeId === 'berryToast' || recipeId === 'cheesyToast' || recipeId === 'raspberryJamToast') {
    const spread = recipeId === 'cheesyToast' ? '#E9C65B' : '#C4576B';
    return (
      plate +
      p('M 13 27 L 15 17 C 18 14 30 14 33 17 L 35 27 Z', '#D9B17C') +
      r(17, 19, 14, 6, spread, 2.5) +
      c(21, 21, 2.2, '#53688F') +
      c(27, 21, 2.2, '#C94D42')
    );
  }
  if (category === 'dessert') {
    return (
      plate +
      p('M 15 28 L 17 18 L 31 18 L 33 28 Z', '#F2C1C8') +
      r(16, 17, 16, 5, '#FFFDF8', 2.5) +
      c(24, 15, 3.6, recipeId === 'lemonTart' ? '#E9C65B' : recipeId === 'blueberryMuffins' ? '#53688F' : '#C94D42')
    );
  }
  if (category === 'main') {
    return (
      plate +
      el(24, 26, 10, 5.5, '#D6894C') +
      el(21, 27, 4.5, 3, '#E9C65B') +
      p('M 27 24 C 31 20 35 23 30 27 Z', '#6E8A55')
    );
  }
  // Fresh side / salad bowl
  return (
    p('M 11 24 L 37 24 C 36 35 30 38 24 38 C 18 38 12 35 11 24 Z', '#FAF6EC') +
    c(19, 21, 5.5, '#6E8A55') +
    c(28, 21, 5.5, '#7FA162') +
    c(24, 19, 4, '#C94D42') +
    c(29, 23, 2.6, '#E9C65B')
  );
}

export function IngredientArt({
  ingredientId,
  size = 36,
  className,
}: {
  ingredientId: string;
  size?: number;
  className?: string;
}) {
  const url = useMemo(
    () => dataUrl(`ingredient:${ingredientId}`, () => svgDoc({ w: 48, h: 48, body: ingredientArtBody(ingredientId) })),
    [ingredientId],
  );
  return (
    <img
      className={cx('ingredient-art', className)}
      src={url}
      alt=""
      draggable={false}
      width={size}
      height={size}
    />
  );
}

export function FoodArt({
  recipeId,
  category,
  size = 44,
  className,
}: {
  recipeId?: string;
  category?: FoodCategory;
  size?: number;
  className?: string;
}) {
  const url = useMemo(
    () =>
      dataUrl(`food:${recipeId ?? 'dish'}:${category ?? 'side'}`, () =>
        svgDoc({ w: 48, h: 48, body: foodArtBody(recipeId, category) }),
      ),
    [recipeId, category],
  );
  return (
    <img
      className={cx('food-art', className)}
      src={url}
      alt=""
      draggable={false}
      width={size}
      height={size}
    />
  );
}

export function SceneArt({ momentId, className }: { momentId: string; className?: string }) {
  const svgUrl = useMemo(() => dataUrl(`scene:${momentId}`, () => svgDoc(momentSceneArt(momentId))), [momentId]);
  return <img className={cx('scene-art', className)} src={svgUrl} alt="" draggable={false} />;
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
  return (readyAt: number) => durationLabel(readyAt - now(), t);
}
