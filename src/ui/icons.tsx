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
