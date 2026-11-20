import type { ReactNode, SVGProps } from 'react';
import { INK, c, dots, el, p as hp, r, svgDoc } from '../art/svg';

export type IconName =
  | 'heart'
  | 'shop'
  | 'bag'
  | 'bowl'
  | 'door'
  | 'camera'
  | 'book'
  | 'map'
  | 'settings'
  | 'chevronLeft'
  | 'chevronRight'
  | 'close'
  | 'check'
  | 'plus'
  | 'edit'
  | 'undo'
  | 'redo'
  | 'sparkle'
  | 'paw'
  | 'leaf'
  | 'moon'
  | 'sun'
  | 'eye'
  | 'home'
  | 'users'
  | 'calendar'
  | 'gift'
  | 'download'
  | 'upload'
  | 'trash'
  | 'music'
  | 'sound'
  | 'globe'
  | 'text'
  | 'cloud'
  | 'info'
  | 'lock'
  | 'star'
  | 'clock'
  | 'flip'
  | 'palette'
  | 'pot'
  | 'seed'
  | 'mail'
  | 'arrowRight';

const PATHS: Record<IconName, ReactNode> = {
  heart: <path d="M12 20.4s-7.5-4.6-7.5-10A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.2c0 5.4-7.5 10-7.5 10Z" fill="currentColor" stroke="none" />,
  shop: (
    <>
      <path d="M4 9h16l-1.2 10.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 9Z" />
      <path d="M8.4 9a3.6 3.6 0 0 1 7.2 0" />
      <path d="M9 13.5h6" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      <path d="M9.5 12.5h5" />
    </>
  ),
  bowl: (
    <>
      <path d="M3.5 11h17c0 5-3.8 8.5-8.5 8.5S3.5 16 3.5 11Z" />
      <path d="M8 7.5c0-2 1.6-3 4-3s4 1 4 3" />
      <path d="M9 16.5h.01M15 16.5h.01" strokeWidth="2.6" />
    </>
  ),
  door: (
    <>
      <path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21" />
      <path d="M3 21h18" />
      <path d="M14.7 12h.01" strokeWidth="2.8" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5h3l1.6-2h6.8l1.6 2h3A1.5 1.5 0 0 1 21.5 10v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5Z" />
      <circle cx="12" cy="13.7" r="3.6" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16.5H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
      <path d="M4 18.2h16" />
      <path d="M8 8h8M8 11.5h6" />
    </>
  ),
  map: (
    <>
      <path d="m3 6.5 5.5-2 7 2 5.5-2v13l-5.5 2-7-2-5.5 2v-13Z" />
      <path d="M8.5 4.5v13M15.5 6.5v13" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="m19.4 15 .1.1a2.2 2.2 0 0 1-3.1 3.1l-.1-.1a2.2 2.2 0 0 0-3.7 1.5v.3a2.2 2.2 0 0 1-4.4 0v-.2A2.2 2.2 0 0 0 4.5 18l-.1-.1a2.2 2.2 0 0 1 3.1-3.1l.1.1a2.2 2.2 0 0 0 3.7-1.5v-.3a2.2 2.2 0 0 1 4.4 0v.2a2.2 2.2 0 0 0 3.7 1.5Z" />
    </>
  ),
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <>
      <path d="M4 20v-4.2L16.6 3.2a2 2 0 0 1 2.8 0l1.4 1.4a2 2 0 0 1 0 2.8L8.2 20H4Z" />
      <path d="m14.5 5.3 4.2 4.2" />
    </>
  ),
  undo: <path d="M8 8H4V4M4.4 8.2A8 8 0 1 1 5.5 17" />,
  redo: <path d="M16 8h4V4M19.6 8.2A8 8 0 1 0 18.5 17" />,
  sparkle: (
    <>
      <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9 12 3.5Z" />
      <path d="m18.5 16 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </>
  ),
  paw: (
    <>
      <ellipse cx="6.5" cy="9" rx="1.9" ry="2.6" />
      <ellipse cx="10.3" cy="6.6" rx="1.9" ry="2.7" />
      <ellipse cx="14.4" cy="6.7" rx="1.9" ry="2.7" />
      <ellipse cx="17.7" cy="9.4" rx="1.9" ry="2.5" />
      <path d="M12 11.2c3.2 0 5.3 2.1 5.3 4.4 0 2-1.6 3.4-3.5 3.4-.9 0-1.2-.5-1.8-.5s-.9.5-1.8.5c-1.9 0-3.5-1.4-3.5-3.4 0-2.3 2.1-4.4 5.3-4.4Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M20.5 3.5c-8.5 0-15 4-15 10.5a5 5 0 0 0 5 5c6.5 0 10-6.5 10-15.5Z" />
      <path d="M4.5 20.5C7 14 11 10 17 6.5" />
    </>
  ),
  moon: <path d="M20 14.6A8.5 8.5 0 0 1 9.4 4a8.5 8.5 0 1 0 10.6 10.6Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5.5 9.3V20h13V9.3" />
      <path d="M9.5 20v-5.5h5V20" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16 4.8a3.4 3.4 0 0 1 0 6.4M17.4 14.2A5.7 5.7 0 0 1 21.2 20" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
      <path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2" />
    </>
  ),
  gift: (
    <>
      <path d="M3.5 8.5h17V12h-17V8.5ZM5 12h14v8.5H5V12Z" />
      <path d="M12 8.5V21M3.5 8.5C3.5 6 5 4.5 7 4.5s3 1.5 3 4M20.5 8.5c0-2.5-1.5-4-3.5-4s-3 1.5-3 4" />
    </>
  ),
  download: <path d="M12 3v11M7.5 10 12 14.5 16.5 10M4 18.5h16" />,
  upload: <path d="M12 15V4M7.5 8 12 3.5 16.5 8M4 18.5h16" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.5L19 3v12.5" />
      <ellipse cx="6.5" cy="18" rx="2.5" ry="2" />
      <ellipse cx="16.5" cy="15.5" rx="2.5" ry="2" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.4 3.6 5.4 3.6 9s-1.2 6.6-3.6 9c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3Z" />
    </>
  ),
  text: <path d="M5 6V4.5h14V6M12 4.5V20M8.5 20h7" />,
  cloud: <path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4-1.3A4 4 0 0 1 17.5 18.5H7Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5h.01" strokeWidth="2.4" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.4" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3" />
    </>
  ),
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.4l3.4 2" />
    </>
  ),
  flip: <path d="M12 3v18M8.5 6.5 4 12l4.5 5.5M15.5 6.5 20 12l-4.5 5.5" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.6 1-2.3 2.4-2.3H18a3.5 3.5 0 0 0 3.4-4.2A9 9 0 0 0 12 3Z" />
      <circle cx="7.6" cy="10.2" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="7.2" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="7.9" cy="14.6" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  pot: (
    <>
      <path d="M4.5 9.5h15V14a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5V9.5Z" />
      <path d="M2.5 10h2M19.5 10h2M9 6c0-1.5 1-2 3-2s3 .5 3 2" />
    </>
  ),
  seed: (
    <>
      <path d="M12 21V11" />
      <path d="M12 12C8 12 5.5 9.5 5.5 5.5 10 5.5 12 8 12 12ZM12 9c0-3.5 2-6 6-6 0 4-2 6-6 6Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  arrowRight: <path d="M4 12h16M14 6l6 6-6 6" />,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  title?: string;
}

export function Icon({ name, size = 22, title, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <g filter="url(#oh-ui-wobble)">{PATHS[name]}</g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// HUD illustrations — drawn with the same hand-inked primitives as the rooms, so the
// buttons look like they were sketched on the same paper as the house.
// ---------------------------------------------------------------------------

const handIconCache = new Map<string, string>();

function handIconUrl(key: string, w: number, h: number, make: () => string): string {
  let url = handIconCache.get(key);
  if (!url) {
    url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgDoc({ w, h, body: make() }))}`;
    handIconCache.set(key, url);
  }
  return url;
}

function HandIcon({ id, w, h, size, make }: { id: string; w: number; h: number; size: number; make: () => string }) {
  return (
    <img
      className="hand-icon"
      src={handIconUrl(id, w, h, make)}
      width={size}
      height={Math.round((size * h) / w)}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

const heartPath = (x: number, y: number, s: number) =>
  `M ${x} ${y + 9 * s} C ${x - 3 * s} ${y + 3 * s} ${x - 13 * s} ${y + 2 * s} ${x - 13 * s} ${y - 6 * s} ` +
  `C ${x - 13 * s} ${y - 13 * s} ${x - 4 * s} ${y - 15 * s} ${x} ${y - 7 * s} ` +
  `C ${x + 4 * s} ${y - 15 * s} ${x + 13.5 * s} ${y - 12 * s} ${x + 12.5 * s} ${y - 5 * s} ` +
  `C ${x + 12 * s} ${y + 2 * s} ${x + 3 * s} ${y + 4 * s} ${x} ${y + 9 * s} Z`;

/** A hand-drawn heart with a little sprout tucked behind it. */
export function HudHeartBadge({ size = 34 }: { size?: number }) {
  return (
    <HandIcon
      id="heart"
      w={40}
      h={36}
      size={size}
      make={() =>
        hp('M 27 14 Q 31 7 35 4', 'none', INK, 2) +
        el(33.5, 6.5, 4.2, 2.2, '#8DB36A', INK, 1.6, -35) +
        hp(heartPath(19, 20, 1.15), '#E26D5A', INK, 2.6) +
        hp('M 10 13 Q 11 9.5 14.5 9', 'none', '#FFD8CC', 2.2) +
        `<path d="M 13 23 l 2 -1.5 M 17 25.5 l 2 -1.5 M 21 26 l 2 -2" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>`
      }
    />
  );
}

/** Feed: a glazed pottery bowl with a painted band and a fish flopped on top. */
export function HudFeedBowl({ size = 44 }: { size?: number }) {
  return (
    <HandIcon
      id="feed"
      w={56}
      h={44}
      size={size}
      make={() =>
        hp('M 9 18 Q 10 37 28 38.5 Q 46 37 47 18 Z', '#F7F1E3', INK, 2.6) +
        hp('M 10.5 26 Q 28 31 45.5 26 L 44.6 30.5 Q 28 35.5 11.6 30.5 Z', '#7FA9C9', 'none', 0) +
        dots(
          [
            [18, 29.5],
            [28, 32],
            [38, 29.5],
          ],
          '#F7F1E3',
          1.3,
        ) +
        el(28, 18, 19, 5.4, '#F7F1E3', INK, 2.6) +
        el(28, 18.4, 15, 3.4, '#C9B48E', 'none', 0) +
        hp('M 16 15 Q 24 6.5 34 12 L 40 7.5 L 39.5 17 L 34.5 13.8 Q 25 20 16 15 Z', '#E9A35B', INK, 2) +
        `<circle cx="21" cy="12.6" r="1.3" fill="${INK}"/>` +
        hp('M 25.5 10.5 Q 27 13 25.8 15.4', 'none', INK, 1.3)
      }
    />
  );
}

/** Belongings: a wicker basket with a folded quilt. */
export function HudBasket({ size = 44 }: { size?: number }) {
  return (
    <HandIcon
      id="basket"
      w={56}
      h={56}
      size={size}
      make={() =>
        hp('M 15 23 Q 28 4 41 23', 'none', INK, 2.6) +
        hp('M 15.5 23 Q 28 7.5 40.5 23', 'none', '#C99A5E', 1.4) +
        r(14, 17, 28, 9, '#E7A9A0', 3, INK, 2.2) +
        `<path d="M 18 21.5 L 38 21.5" stroke="${INK}" stroke-width="1.2" stroke-dasharray="2 2.5" opacity="0.6"/>` +
        r(16, 13, 24, 7, '#F2D27E', 3, INK, 2) +
        hp('M 9 25 L 47 25 L 43 47 Q 28 50 13 47 Z', '#D7A96C', INK, 2.7) +
        `<path d="M 12 32 Q 28 34.5 45.5 32 M 13 39 Q 28 41.5 44.3 39" stroke="${INK}" stroke-width="1.5" fill="none" opacity="0.55"/>` +
        `<path d="M 18 25.5 L 17.5 47.5 M 24 25.5 L 24 48.5 M 30 25.5 L 30.5 48.5 M 37 25.5 L 37.5 47.5" stroke="${INK}" stroke-width="1.3" fill="none" opacity="0.4"/>` +
        r(7.5, 22.5, 41, 5, '#C99A5E', 2, INK, 2.2)
      }
    />
  );
}

/** Shop: a canvas market tote with a loaf and leeks poking out. */
export function HudTote({ size = 42 }: { size?: number }) {
  return (
    <HandIcon
      id="tote"
      w={56}
      h={56}
      size={size}
      make={() =>
        hp('M 34 21 L 41 6', 'none', '#6E9A55', 3.4) +
        el(41.5, 6, 3.4, 2.4, '#A9CF86', INK, 1.6, -60) +
        hp('M 30 22 L 33 8', 'none', '#6E9A55', 3) +
        el(17.5, 15.5, 9, 5.6, '#D9A35A', INK, 2.2, -22) +
        `<path d="M 13 14 l 2 3 M 17 12 l 2 3 M 21 11 l 2 3" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>` +
        hp('M 19 21 Q 19 10 28 10 Q 37 10 37 21', 'none', INK, 2.4) +
        hp('M 10 20 L 46 20 L 43.5 48 L 12.5 48 Z', '#F2E9D6', INK, 2.7) +
        hp(heartPath(28, 35, 0.48), '#E26D5A', INK, 1.8) +
        `<path d="M 11 26 L 45 26" stroke="${INK}" stroke-width="1.2" stroke-dasharray="2.5 2.5" opacity="0.45"/>`
      }
    />
  );
}

/** Map: a folded paper map with a dotted path to a little house pin. */
export function HudMap({ size = 42 }: { size?: number }) {
  return (
    <HandIcon
      id="map"
      w={56}
      h={56}
      size={size}
      make={() =>
        hp('M 7 14 L 19 10 L 32 14.5 L 49 10 L 49 42 L 32 46.5 L 19 42 L 7 46 Z', '#F4EBD3', INK, 2.6) +
        hp('M 19 10 L 19 42', 'none', INK, 1.6) +
        hp('M 32 14.5 L 32 46.5', 'none', INK, 1.6) +
        `<path d="M 19 10 L 32 14.5 L 32 46.5 L 19 42 Z" fill="${INK}" opacity="0.07"/>` +
        el(14, 33, 5, 3.4, '#9CC48A', 'none', 0) +
        el(42, 22, 4.6, 3, '#9CC4D9', 'none', 0) +
        `<path d="M 11 39 Q 18 30 26 33 Q 34 36 38 26" fill="none" stroke="#C4513F" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="0.5 3.6"/>` +
        hp('M 34 24 L 40 18.5 L 46 24 L 46 30 L 34 30 Z', '#FFFDF8', INK, 2) +
        hp('M 32.5 24.5 L 40 17 L 47.5 24.5', 'none', '#D9654E', 2.6)
      }
    />
  );
}

/** Event badges: a seedling, a sleepy moon, and a doodled sun. */
export function HudEventBadge({ kind, size = 28 }: { kind: 'leaf' | 'moon' | 'star'; size?: number }) {
  if (kind === 'leaf') {
    return (
      <HandIcon
        id="ev-leaf"
        w={34}
        h={32}
        size={size}
        make={() =>
          hp('M 9 20 L 25 20 L 23 30 L 11 30 Z', '#D98F6B', INK, 2.2) +
          r(7.5, 18, 19, 4, '#E7A684', 1.5, INK, 2) +
          hp('M 17 18 Q 17 12 18 8', 'none', INK, 2) +
          hp('M 18 9 Q 10 3 6 9 Q 12 13 18 9 Z', '#8DC06F', INK, 1.9) +
          hp('M 18 8 Q 25 1 30 6 Q 24 12 18 8 Z', '#A9D488', INK, 1.9)
        }
      />
    );
  }
  if (kind === 'moon') {
    return (
      <HandIcon
        id="ev-moon"
        w={34}
        h={32}
        size={size}
        make={() =>
          hp('M 20 4 Q 7 5.5 7 17 Q 8 28.5 20 29 Q 25 29 28 26 Q 17 25 16.5 16.5 Q 16.8 8 26 5.5 Q 23.5 4 20 4 Z', '#F0CF6E', INK, 2.3) +
          hp('M 11 16 q 1.8 1.6 3.6 0', 'none', INK, 1.4) +
          '<circle cx="11.5" cy="20.5" r="1.6" fill="#E9967F" opacity="0.7"/>' +
          hp('M 27 11 l 0 5 M 24.5 13.5 l 5 0', 'none', '#F7E3A0', 1.8)
        }
      />
    );
  }
  return (
    <HandIcon
      id="ev-sun"
      w={34}
      h={32}
      size={size}
      make={() => {
        let rays = '';
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2 + 0.2;
          const r1 = 10.5;
          const r2 = 14 + (i % 2) * 1.5;
          rays += `M ${(17 + Math.cos(a) * r1).toFixed(1)} ${(16 + Math.sin(a) * r1).toFixed(1)} L ${(17 + Math.cos(a) * r2).toFixed(1)} ${(16 + Math.sin(a) * r2).toFixed(1)} `;
        }
        return (
          `<path d="${rays}" stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none"/>` +
          c(17, 16, 8.5, '#F2C35E', INK, 2.3) +
          `<circle cx="14" cy="15" r="1" fill="${INK}"/><circle cx="20" cy="15" r="1" fill="${INK}"/>` +
          hp('M 14.5 18.5 Q 17 20.5 19.5 18.5', 'none', INK, 1.3)
        );
      }}
    />
  );
}
