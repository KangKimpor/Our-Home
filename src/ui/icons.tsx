import type { ReactNode, SVGProps } from 'react';

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
      {PATHS[name]}
    </svg>
  );
}

/** Hand-drawn coral heart overlapped by a golden yellow '+' badge (ui_heart_counter_368 style). */
export function HudHeartBadge({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 36" width={size} height={Math.round((size * 36) / 40)} aria-hidden="true" focusable="false">
      <path
        d="M16.5 30.5C15.5 29.8 4.2 21.8 4.2 12.6C4.2 7.5 8.1 4.2 12.2 4.2C14.7 4.2 16.2 5.6 16.8 6.9C17.4 5.6 18.9 4.2 21.4 4.2C25.5 4.2 29.4 7.5 29.4 12.6C29.4 21.8 18.1 29.8 17.1 30.5C16.9 30.6 16.7 30.6 16.5 30.5Z"
        fill="#E5684C"
        stroke="#2B2521"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.5C9.4 8.7 10.8 7.5 12.5 7.4"
        fill="none"
        stroke="#F6B09D"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M27.2 13.5C28.8 13.5 29.8 14.5 29.8 16.1V19.6H33.3C34.9 19.6 35.9 20.6 35.9 22.2C35.9 23.8 34.9 24.8 33.3 24.8H29.8V28.3C29.8 29.9 28.8 30.9 27.2 30.9C25.6 30.9 24.6 29.9 24.6 28.3V24.8H21.1C19.5 24.8 18.5 23.8 18.5 22.2C18.5 20.6 19.5 19.6 21.1 19.6H24.6V16.1C24.6 14.5 25.6 13.5 27.2 13.5Z"
        fill="#F7D859"
        stroke="#2B2521"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hand-drawn ceramic pet bowl with "CAT" label (ui_cat_food_button_368 style). */
export function HudCatBowl({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 56 44" width={size} height={Math.round((size * 44) / 56)} aria-hidden="true" focusable="false">
      {/* Bowl body */}
      <path
        d="M11 15.5L6.5 32C6.2 36.2 15.8 39.5 28 39.5C40.2 39.5 49.8 36.2 49.5 32L45 15.5Z"
        fill="#FFFDF6"
        stroke="#2B2521"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Top rim */}
      <ellipse cx="28" cy="15.5" rx="17" ry="6.2" fill="#FFFDF6" stroke="#2B2521" strokeWidth="3" />
      {/* Inner recessed well */}
      <ellipse cx="28" cy="16" rx="12.5" ry="3.8" fill="#DCD2BE" stroke="#2B2521" strokeWidth="2.2" />
      {/* Golden kibble mound */}
      <path d="M19 16.5C21 13.2 25 12.8 28 13.5C31 12.6 35 13.4 36.8 16.4Z" fill="#DDA14B" stroke="#2B2521" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="24" cy="15.3" r="1.2" fill="#B57524" />
      <circle cx="29" cy="14.9" r="1.2" fill="#B57524" />
      <circle cx="32.5" cy="15.8" r="1.1" fill="#B57524" />
      {/* Hand-lettered "CAT" */}
      <text
        x="28"
        y="33.5"
        textAnchor="middle"
        fill="#8E6424"
        fontFamily="var(--display)"
        fontWeight="700"
        fontSize="11.5"
        letterSpacing="1.6"
      >
        CAT
      </text>
    </svg>
  );
}

/** Hand-drawn cardboard storage box with armchair and yellow lamp (ui_storage_chest_button style). */
export function HudStorageBox({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" focusable="false">
      {/* Ground shadow */}
      <ellipse cx="28" cy="48.5" rx="19" ry="3" fill="rgba(43,37,33,0.22)" />
      {/* White chair in box */}
      <path d="M16 14L27 11L30 24L19 27Z" fill="#FFFDF8" stroke="#2B2521" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 25L29 22L36 27L25 31Z" fill="#EFE8D8" stroke="#2B2521" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M18 25V34M25 31V37" stroke="#2B2521" strokeWidth="2.5" strokeLinecap="round" />
      {/* Yellow lamp */}
      <path d="M35 20V31" stroke="#2B2521" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M31.5 19.5L34.5 11.5H40.5L43.5 19.5Z" fill="#E9C75A" stroke="#2B2521" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Cardboard box front */}
      <path d="M14 29L28 34L42 29V44L28 48.5L14 44Z" fill="#C9965B" stroke="#2B2521" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M28 34V48.5" stroke="#2B2521" strokeWidth="2.4" />
      {/* Open box flaps */}
      <path d="M14 29L9.5 24.5L23.5 27.5L28 34Z" fill="#D9A96E" stroke="#2B2521" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M42 29L46.5 24.5L32.5 27.5L28 34Z" fill="#D9A96E" stroke="#2B2521" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Hand-drawn shopping cart with coral handle & front plate (ui_shopping_cart_button style). */
export function HudShoppingCart({ size = 42 }: { size?: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" focusable="false">
      {/* Handle bar */}
      <path d="M31 12L46 14L44 17.5L30 15.5Z" fill="#E17055" stroke="#2B2521" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Basket frame */}
      <path d="M12 21L38 18L35 34L15 36Z" fill="none" stroke="#2B2521" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M38 18L44 15.5L40 32.5L35 34" fill="none" stroke="#2B2521" strokeWidth="2.6" strokeLinejoin="round" />
      {/* Grid wires */}
      <path d="M13.5 28.5L36.5 26M18 20.5L20 35.5M25 19.5L26 35M32 19L31.5 34" stroke="#2B2521" strokeWidth="2" strokeLinecap="round" />
      {/* Coral front badge */}
      <path d="M13 23L22 24.5L21.5 31L13.5 29.5Z" fill="#E17055" stroke="#2B2521" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Lower chassis */}
      <path d="M16 36L14 40.5L37 37.5L35 34" fill="none" stroke="#2B2521" strokeWidth="2.6" strokeLinejoin="round" />
      {/* Wheels */}
      <circle cx="17" cy="43.5" r="3.4" fill="#6E6B68" stroke="#2B2521" strokeWidth="2.4" />
      <circle cx="27" cy="44.5" r="3.4" fill="#6E6B68" stroke="#2B2521" strokeWidth="2.4" />
      <circle cx="38" cy="41.5" r="3.4" fill="#6E6B68" stroke="#2B2521" strokeWidth="2.4" />
    </svg>
  );
}

/** Hand-drawn red-roofed little house (ui_home_button_368 style). */
export function HudHouse({ size = 42 }: { size?: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" focusable="false">
      {/* House walls */}
      <rect x="13" y="25" width="30" height="20" rx="1.5" fill="#FFFDF8" stroke="#2B2521" strokeWidth="2.8" strokeLinejoin="round" />
      {/* Red striped roof */}
      <path d="M8.5 26L15 12H41L47.5 26Z" fill="#DF6A4E" stroke="#2B2521" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M21 12L18 26M28 12V26M35 12L38 26" stroke="#2B2521" strokeWidth="2.2" />
      {/* Window */}
      <rect x="17.5" y="29.5" width="8" height="6" rx="1" fill="#A6D4E8" stroke="#2B2521" strokeWidth="2.4" />
      {/* Door */}
      <rect x="29.5" y="32" width="8.5" height="13" rx="1" fill="#9E9B97" stroke="#2B2521" strokeWidth="2.4" />
    </svg>
  );
}

/** Event tag left-edge celestial/tropical badge (ui_timer_event_stack style). */
export function HudEventBadge({ kind, size = 28 }: { kind: 'leaf' | 'moon' | 'star'; size?: number }) {
  if (kind === 'leaf') {
    return (
      <svg viewBox="0 0 34 32" width={size} height={size} aria-hidden="true" focusable="false">
        <circle cx="13" cy="14" r="10.5" fill="#C8339C" stroke="#2B2521" strokeWidth="2.2" />
        <path d="M4 13H22M5 17H21" stroke="#6F177E" strokeWidth="1.6" />
        <ellipse cx="18" cy="25.5" rx="11" ry="2.8" fill="#7BC96F" stroke="#2B2521" strokeWidth="2" />
        <path d="M18 25C18 18 19 14 21 11" fill="none" stroke="#2B2521" strokeWidth="2.4" strokeLinecap="round" />
        <path
          d="M21 11C16 9 12 11 11 14C15 13 18 13 21 11ZM21 11C24 8 28 9 30 12C27 12 24 12 21 11ZM21 11C25 12 27 16 26 19C24 16 23 13 21 11Z"
          fill="#63D492"
          stroke="#2B2521"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === 'moon') {
    return (
      <svg viewBox="0 0 34 32" width={size} height={size} aria-hidden="true" focusable="false">
        <path
          d="M20 5C12.5 5 7 10.6 7 17.5C7 24.4 12.5 29.5 20 29.5C22.8 29.5 25.4 28.6 27.4 27C21.2 26.8 16.8 22.4 16.8 17C16.8 11.6 21 7.3 26.8 6.8C24.8 5.6 22.5 5 20 5Z"
          fill="#E8C266"
          stroke="#2B2521"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M23.5 9L25.2 12.8L29.4 13.3L26.2 16.1L27.1 20.2L23.5 18L19.9 20.2L20.8 16.1L17.6 13.3L21.8 12.8Z"
          fill="#F4D77B"
          stroke="#2B2521"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 34 32" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        d="M17 2.5L20 7.5L25.8 6.2L24.5 12L29.5 15.5L24.8 19.2L26.2 25L20.4 24L17 29L13.6 24L7.8 25L9.2 19.2L4.5 15.5L9.5 12L8.2 6.2L14 7.5Z"
        fill="#D69E4E"
        stroke="#2B2521"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="15.8" r="7.5" fill="#F2CB78" stroke="#2B2521" strokeWidth="2.1" />
      <path d="M17 8.3A7.5 7.5 0 0 1 17 23.3C14.8 20.5 14.8 11.1 17 8.3Z" fill="#D28F4A" stroke="#2B2521" strokeWidth="1.7" />
      <circle cx="13.5" cy="15.5" r="0.9" fill="#2B2521" />
      <circle cx="20.2" cy="15.5" r="0.9" fill="#2B2521" />
    </svg>
  );
}

