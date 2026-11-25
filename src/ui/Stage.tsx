import { useEffect, useState, type ReactNode } from 'react';
import { ROOM } from '../game/layout';

function fitScale(): number {
  return Math.min(window.innerWidth / ROOM.w, window.innerHeight / ROOM.h);
}

/** Scales the fixed-size room uniformly to fit the window, letterboxed. */
export function Stage({ children }: { children: (scale: number) => ReactNode }) {
  const [scale, setScale] = useState(fitScale);

  useEffect(() => {
    const onResize = () => setScale(fitScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="viewport">
      <div
        className="stage"
        style={{ width: ROOM.w, height: ROOM.h, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children(scale)}
      </div>
    </div>
  );
}
