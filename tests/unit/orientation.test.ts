import { describe, expect, it } from 'vitest';
import { isTouchDevice, needsLandscapeRotation, type OrientationEnv } from '../../src/game/orientation';

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const IPADOS_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36';

const phone = (width: number, height: number): OrientationEnv => ({
  width,
  height,
  coarsePointer: true,
  maxTouchPoints: 5,
  userAgent: IPHONE_UA,
});

describe('landscape-only orientation gate', () => {
  it('asks phones and tablets held in portrait to rotate', () => {
    expect(needsLandscapeRotation(phone(393, 852))).toBe(true); // iPhone 15
    expect(needsLandscapeRotation(phone(440, 956))).toBe(true); // iPhone 17 Pro Max
    expect(needsLandscapeRotation(phone(820, 1180))).toBe(true); // iPad A16
  });

  it('lets phones and tablets in landscape play', () => {
    expect(needsLandscapeRotation(phone(852, 393))).toBe(false);
    expect(needsLandscapeRotation(phone(1180, 820))).toBe(false);
  });

  it('treats iPadOS (desktop UA, trackpad pointer) as a tablet', () => {
    const ipad = { width: 820, height: 1180, coarsePointer: false, maxTouchPoints: 5, userAgent: IPADOS_UA };
    expect(isTouchDevice(ipad)).toBe(true);
    expect(needsLandscapeRotation(ipad)).toBe(true);
  });

  it('never gates desktops or touch laptops, whatever the window shape', () => {
    expect(
      needsLandscapeRotation({
        width: 600,
        height: 1000,
        coarsePointer: false,
        maxTouchPoints: 0,
        userAgent: DESKTOP_UA,
      }),
    ).toBe(false);
    expect(
      needsLandscapeRotation({
        width: 600,
        height: 1000,
        coarsePointer: false,
        maxTouchPoints: 10,
        userAgent: DESKTOP_UA,
      }),
    ).toBe(false);
    expect(
      needsLandscapeRotation({
        width: 600,
        height: 1000,
        coarsePointer: false,
        maxTouchPoints: 0,
        userAgent: IPADOS_UA,
      }),
    ).toBe(false); // a real Mac
  });

  it('ignores empty viewports', () => {
    expect(needsLandscapeRotation(phone(0, 0))).toBe(false);
  });
});
