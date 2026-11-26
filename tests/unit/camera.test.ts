import { describe, expect, it } from 'vitest';
import {
  canPanCamera,
  createCamera,
  defaultCameraMode,
  edgeAutoPanDelta,
  panCamera,
  resizeCamera,
  toggleCameraMode,
  zoomCameraAt,
} from '../../src/game/camera';
import { ROOM } from '../../src/game/layout';

const DEVICES = {
  iphone15Portrait: { vw: 393, vh: 852 },
  iphone15Landscape: { vw: 852, vh: 393 },
  iphone17ProMaxPortrait: { vw: 440, vh: 956 },
  iphone17ProMaxLandscape: { vw: 956, vh: 440 },
  ipadA16Portrait: { vw: 820, vh: 1180 },
  ipadA16Landscape: { vw: 1180, vh: 820 },
  desktop: { vw: 1280, vh: 720 },
} as const;

describe('camera', () => {
  it('defaults portrait phones and iPad to fill mode and landscape/desktop to fit mode', () => {
    expect(defaultCameraMode(DEVICES.iphone15Portrait.vw, DEVICES.iphone15Portrait.vh)).toBe('fill');
    expect(defaultCameraMode(DEVICES.iphone17ProMaxPortrait.vw, DEVICES.iphone17ProMaxPortrait.vh)).toBe('fill');
    expect(defaultCameraMode(DEVICES.ipadA16Portrait.vw, DEVICES.ipadA16Portrait.vh)).toBe('fill');

    expect(defaultCameraMode(DEVICES.iphone15Landscape.vw, DEVICES.iphone15Landscape.vh)).toBe('fit');
    expect(defaultCameraMode(DEVICES.iphone17ProMaxLandscape.vw, DEVICES.iphone17ProMaxLandscape.vh)).toBe('fit');
    expect(defaultCameraMode(DEVICES.ipadA16Landscape.vw, DEVICES.ipadA16Landscape.vh)).toBe('fit');
    expect(defaultCameraMode(DEVICES.desktop.vw, DEVICES.desktop.vh)).toBe('fit');
  });

  it('fills full screen height in portrait mode and enables horizontal panning', () => {
    for (const { vw, vh } of [
      DEVICES.iphone15Portrait,
      DEVICES.iphone17ProMaxPortrait,
      DEVICES.ipadA16Portrait,
    ]) {
      const cam = createCamera(vw, vh);
      expect(cam.mode).toBe('fill');
      expect(ROOM.h * cam.scale).toBeCloseTo(vh, 1);
      expect(canPanCamera(cam, vw, vh)).toBe(true);

      const pannedRight = panCamera(cam, vw, vh, 9999, 0);
      const expectedMaxPan = (ROOM.w * cam.scale - vw) / 2;
      expect(pannedRight.panX).toBeCloseTo(expectedMaxPan, 1);
      expect(pannedRight.panY).toBe(0);

      const pannedLeft = panCamera(cam, vw, vh, -9999, 0);
      expect(pannedLeft.panX).toBeCloseTo(-expectedMaxPan, 1);
    }
  });

  it('fits the full room cleanly in landscape iPhone, iPad A16, and desktop', () => {
    for (const { vw, vh } of [
      DEVICES.iphone15Landscape,
      DEVICES.iphone17ProMaxLandscape,
      DEVICES.ipadA16Landscape,
      DEVICES.desktop,
    ]) {
      const cam = createCamera(vw, vh);
      expect(cam.mode).toBe('fit');
      expect(ROOM.w * cam.scale).toBeLessThanOrEqual(vw + 0.01);
      expect(ROOM.h * cam.scale).toBeLessThanOrEqual(vh + 0.01);
      expect(canPanCamera(cam, vw, vh)).toBe(false);
    }
  });

  it('switches cleanly between fill and fit modes and on orientation rotation', () => {
    const { vw: pw, vh: ph } = DEVICES.iphone17ProMaxPortrait;
    const { vw: lw, vh: lh } = DEVICES.iphone17ProMaxLandscape;

    const portrait = createCamera(pw, ph);
    const fitPortrait = toggleCameraMode(portrait, pw, ph);
    expect(fitPortrait.mode).toBe('fit');
    expect(canPanCamera(fitPortrait, pw, ph)).toBe(false);

    const rotated = resizeCamera(portrait, pw, ph, lw, lh);
    expect(rotated.mode).toBe('fit');
    expect(rotated.panX).toBe(0);
    expect(rotated.panY).toBe(0);
  });

  it('clamps pinch zoom within min/max scale and supports edge auto-pan', () => {
    const { vw, vh } = DEVICES.iphone15Portrait;
    const cam = createCamera(vw, vh);
    const zoomedOut = zoomCameraAt(cam, vw, vh, 0.01, vw / 2, vh / 2);
    expect(zoomedOut.scale).toBeCloseTo(cam.minScale, 4);
    expect(zoomedOut.mode).toBe('fit');

    const zoomedIn = zoomCameraAt(cam, vw, vh, 99, vw / 2, vh / 2);
    expect(zoomedIn.scale).toBeCloseTo(cam.maxScale, 4);

    expect(edgeAutoPanDelta(5, vw, 0.05)).toBeGreaterThan(0);
    expect(edgeAutoPanDelta(vw - 5, vw, 0.05)).toBeLessThan(0);
    expect(edgeAutoPanDelta(vw / 2, vw, 0.05)).toBe(0);
  });
});
