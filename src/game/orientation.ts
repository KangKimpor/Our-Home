/** Inputs for deciding whether the living room must be played in landscape. */
export interface OrientationEnv {
  width: number;
  height: number;
  /** `matchMedia('(pointer: coarse)')` — the primary input is a finger (phones, tablets). */
  coarsePointer: boolean;
  maxTouchPoints: number;
  userAgent: string;
}

/**
 * Phones and tablets are landscape-only. iPadOS reports a desktop "Macintosh" user agent
 * (and a fine pointer when a trackpad is attached), so multi-touch Macs count as tablets.
 * Desktops and laptops are never gated, whatever their window shape.
 */
export function isTouchDevice(
  env: Pick<OrientationEnv, 'coarsePointer' | 'maxTouchPoints' | 'userAgent'>,
): boolean {
  if (env.coarsePointer) return true;
  return env.maxTouchPoints > 1 && /Macintosh/.test(env.userAgent);
}

/** True when a phone/tablet is held in portrait and should be rotated to landscape. */
export function needsLandscapeRotation(env: OrientationEnv): boolean {
  if (env.width <= 0 || env.height <= 0) return false;
  return isTouchDevice(env) && env.height > env.width;
}

/** Reads the current browser environment (safe to call during SSR/tests: returns "no rotation needed"). */
export function readOrientationEnv(): OrientationEnv {
  if (typeof window === 'undefined') {
    return { width: 1, height: 0, coarsePointer: false, maxTouchPoints: 0, userAgent: '' };
  }
  const vv = window.visualViewport;
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
    coarsePointer: typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    userAgent: navigator.userAgent ?? '',
  };
}

/**
 * Best-effort hardware lock. Browsers only honour it in fullscreen or installed web apps
 * (and iOS Safari not at all), so the rotate prompt remains the real guard.
 */
export function tryLockLandscape(): void {
  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (o: 'landscape') => Promise<void>;
    };
    void orientation?.lock?.('landscape').catch(() => undefined);
  } catch {
    // Unsupported: ignore.
  }
}
