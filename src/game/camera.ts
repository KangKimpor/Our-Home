import { ROOM } from './layout';

export type CameraMode = 'fit' | 'fill';

export interface CameraState {
  scale: number;
  minScale: number;
  maxScale: number;
  /** Offset in CSS px from viewport center. */
  panX: number;
  panY: number;
  mode: CameraMode;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Portrait screens (< 1.15 aspect) default to full-height pan mode; landscape & desktop fit the whole room. */
export function defaultCameraMode(vw: number, vh: number): CameraMode {
  if (vw <= 0 || vh <= 0) return 'fit';
  return vw / vh < 1.15 ? 'fill' : 'fit';
}

export function fitScale(vw: number, vh: number): number {
  if (vw <= 0 || vh <= 0) return 1;
  return Math.min(vw / ROOM.w, vh / ROOM.h);
}

export function fillScale(vw: number, vh: number): number {
  if (vw <= 0 || vh <= 0) return 1;
  return Math.max(vw / ROOM.w, vh / ROOM.h);
}

export function clampPan(
  vw: number,
  vh: number,
  scale: number,
  panX: number,
  panY: number,
): { panX: number; panY: number } {
  const maxPanX = Math.max(0, (ROOM.w * scale - vw) / 2);
  const maxPanY = Math.max(0, (ROOM.h * scale - vh) / 2);
  return {
    panX: clamp(panX, -maxPanX, maxPanX),
    panY: clamp(panY, -maxPanY, maxPanY),
  };
}

export function createCamera(vw: number, vh: number, mode?: CameraMode): CameraState {
  const resolvedMode = mode ?? defaultCameraMode(vw, vh);
  const minScale = fitScale(vw, vh);
  const fullScale = fillScale(vw, vh);
  const scale = resolvedMode === 'fill' ? fullScale : minScale;
  const maxScale = Math.max(minScale * 2.4, fullScale * 1.85);
  return { scale, minScale, maxScale, panX: 0, panY: 0, mode: resolvedMode };
}

/** Updates camera bounds on resize/orientation change, switching default mode if orientation flipped. */
export function resizeCamera(
  prev: CameraState,
  prevVw: number,
  prevVh: number,
  vw: number,
  vh: number,
): CameraState {
  const prevDefault = defaultCameraMode(prevVw, prevVh);
  const nextDefault = defaultCameraMode(vw, vh);
  if (prevDefault !== nextDefault) {
    return createCamera(vw, vh, nextDefault);
  }
  const minScale = fitScale(vw, vh);
  const fullScale = fillScale(vw, vh);
  const maxScale = Math.max(minScale * 2.4, fullScale * 1.85);
  const wasAtBase = Math.abs(prev.scale - (prev.mode === 'fill' ? fillScale(prevVw, prevVh) : fitScale(prevVw, prevVh))) < 0.02;
  const scale = wasAtBase
    ? prev.mode === 'fill'
      ? fullScale
      : minScale
    : clamp(prev.scale, minScale, maxScale);
  const { panX, panY } = clampPan(vw, vh, scale, prev.panX, prev.panY);
  return { scale, minScale, maxScale, panX, panY, mode: prev.mode };
}

export function panCamera(state: CameraState, vw: number, vh: number, dx: number, dy: number): CameraState {
  const { panX, panY } = clampPan(vw, vh, state.scale, state.panX + dx, state.panY + dy);
  return { ...state, panX, panY };
}

/** Zooms smoothly around a viewport-space anchor point (e.g., pinch midpoint). */
export function zoomCameraAt(
  state: CameraState,
  vw: number,
  vh: number,
  nextScale: number,
  anchorX: number,
  anchorY: number,
): CameraState {
  const scale = clamp(nextScale, state.minScale, state.maxScale);
  const ratio = scale / state.scale;
  const cx = vw / 2;
  const cy = vh / 2;
  const rawPanX = anchorX - cx - (anchorX - cx - state.panX) * ratio;
  const rawPanY = anchorY - cy - (anchorY - cy - state.panY) * ratio;
  const { panX, panY } = clampPan(vw, vh, scale, rawPanX, rawPanY);
  const mode: CameraMode = scale > state.minScale * 1.05 ? 'fill' : 'fit';
  return { ...state, scale, panX, panY, mode };
}

export function toggleCameraMode(state: CameraState, vw: number, vh: number): CameraState {
  const nextMode: CameraMode = state.mode === 'fit' ? 'fill' : 'fit';
  return createCamera(vw, vh, nextMode);
}

export function canPanCamera(state: CameraState, vw: number, vh: number): boolean {
  return ROOM.w * state.scale > vw + 2 || ROOM.h * state.scale > vh + 2;
}

/** Returns horizontal pan delta (CSS px) when dragging near screen edges on pan-enabled viewports. */
export function edgeAutoPanDelta(clientX: number, vw: number, dt: number): number {
  const edge = Math.min(72, vw * 0.14);
  const maxSpeed = 460;
  if (clientX < edge) {
    const t = clamp((edge - clientX) / edge, 0, 1);
    return maxSpeed * t * dt;
  }
  if (clientX > vw - edge) {
    const t = clamp((clientX - (vw - edge)) / edge, 0, 1);
    return -maxSpeed * t * dt;
  }
  return 0;
}
