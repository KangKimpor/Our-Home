import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  canPanCamera,
  createCamera,
  edgeAutoPanDelta,
  fillScale,
  fitScale,
  panCamera,
  resizeCamera,
  toggleCameraMode,
  zoomCameraAt,
  type CameraMode,
  type CameraState,
} from '../game/camera';
import { ROOM } from '../game/layout';

export interface StageContext {
  scale: number;
  mode: CameraMode;
  canPan: boolean;
  /** True when Fill vs Fit produces noticeably different views (e.g., portrait phones/iPad). */
  canToggleMode: boolean;
  toggleMode: () => void;
  /** Converts viewport client coordinates into logical 1600x900 room coordinates. */
  clientToRoom: (clientX: number, clientY: number) => { x: number; y: number };
  /** Gently auto-pans the camera while dragging an item near the screen edges. */
  autoPanAt: (clientX: number, dt: number) => void;
}

function viewportSize(): { vw: number; vh: number } {
  const vv = window.visualViewport;
  return {
    vw: Math.round(vv?.width ?? window.innerWidth),
    vh: Math.round(vv?.height ?? window.innerHeight),
  };
}

interface Props {
  children: (ctx: StageContext) => ReactNode;
  overlay?: (ctx: StageContext) => ReactNode;
  onCameraMove?: () => void;
}

/**
 * Scales the fixed 1600x900 room for desktop, iPhone, and iPad:
 * - Landscape & desktop default to fitting the whole room.
 * - Portrait phones & iPad default to full-height cozy pan mode (with one-tap Fit toggle).
 * - Supports 1-finger backdrop pan and 2-finger pinch-to-zoom.
 */
export function Stage({ children, overlay, onCameraMove }: Props) {
  const [vp, setVp] = useState(viewportSize);
  const [camera, setCamera] = useState<CameraState>(() => {
    const { vw, vh } = viewportSize();
    return createCamera(vw, vh);
  });

  const vpRef = useRef(vp);
  vpRef.current = vp;
  const stageRef = useRef<HTMLDivElement>(null);

  // Active pointers on the viewport background (for 1-finger pan and 2-finger pinch zoom).
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; scale: number; midX: number; midY: number } | null>(null);
  const [panning, setPanning] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const next = viewportSize();
      const prev = vpRef.current;
      if (next.vw === prev.vw && next.vh === prev.vh) return;
      vpRef.current = next;
      setVp(next);
      setCamera((c) => resizeCamera(c, prev.vw, prev.vh, next.vw, next.vh));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, []);

  const canPan = canPanCamera(camera, vp.vw, vp.vh);
  const canToggleMode = fillScale(vp.vw, vp.vh) / Math.max(0.001, fitScale(vp.vw, vp.vh)) > 1.12;

  const toggleMode = useCallback(() => {
    const { vw, vh } = vpRef.current;
    setCamera((c) => toggleCameraMode(c, vw, vh));
    onCameraMove?.();
  }, [onCameraMove]);

  const clientToRoom = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return { x: ROOM.w / 2, y: ROOM.h / 2 };
    const rect = el.getBoundingClientRect();
    const scale = rect.width / ROOM.w || 1;
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  }, []);

  const autoPanAt = useCallback((clientX: number, dt: number) => {
    const { vw, vh } = vpRef.current;
    const dx = edgeAutoPanDelta(clientX, vw, dt);
    if (dx === 0) return;
    setCamera((c) => (canPanCamera(c, vw, vh) ? panCamera(c, vw, vh, dx, 0) : c));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    // Let interactive items, characters, pets, and HUD buttons handle single-pointer gestures.
    const target = e.target as HTMLElement | null;
    if (target?.closest('.item, .pet, .character, .hud-overlay')) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = {
        dist: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
        scale: camera.scale,
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      };
      setPanning(true);
    } else if (pointers.current.size === 1 && canPan) {
      setPanning(true);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const { vw, vh } = vpRef.current;

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const targetScale = pinch.current.scale * (dist / pinch.current.dist);
      const panDx = midX - pinch.current.midX;
      const panDy = midY - pinch.current.midY;
      pinch.current.midX = midX;
      pinch.current.midY = midY;
      setCamera((c) => {
        const zoomed = zoomCameraAt(c, vw, vh, targetScale, midX, midY);
        return panCamera(zoomed, vw, vh, panDx, panDy);
      });
      onCameraMove?.();
      return;
    }

    if (pointers.current.size === 1 && (Math.abs(dx) > 0 || Math.abs(dy) > 0)) {
      setCamera((c) => (canPanCamera(c, vw, vh) ? panCamera(c, vw, vh, dx, dy) : c));
      if (Math.hypot(dx, dy) > 2) onCameraMove?.();
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setPanning(false);
  };

  const ctx: StageContext = {
    scale: camera.scale,
    mode: camera.mode,
    canPan,
    canToggleMode,
    toggleMode,
    clientToRoom,
    autoPanAt,
  };

  return (
    <div
      className={`viewport${canPan ? ' can-pan' : ''}${panning ? ' is-panning' : ''}`}
      data-camera-mode={camera.mode}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    >
      <div
        ref={stageRef}
        className="stage"
        style={{
          width: ROOM.w,
          height: ROOM.h,
          transform: `translate3d(calc(-50% + ${camera.panX}px), calc(-50% + ${camera.panY}px), 0) scale(${camera.scale})`,
        }}
      >
        {children(ctx)}
      </div>
      {overlay && <div className="hud-overlay">{overlay(ctx)}</div>}
    </div>
  );
}
