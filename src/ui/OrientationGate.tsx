import { useEffect, useRef, useState, type ReactNode } from 'react';
import { needsLandscapeRotation, readOrientationEnv, tryLockLandscape } from '../game/orientation';

function RotateIcon() {
  return (
    <svg className="rotate-icon" viewBox="0 0 96 96" aria-hidden="true">
      <g className="rotate-icon-phone">
        <rect x="31" y="14" width="34" height="62" rx="7" fill="#faf3e3" stroke="#312210" strokeWidth="4" />
        <rect x="37" y="22" width="22" height="42" rx="3" fill="#8fa88a" stroke="#312210" strokeWidth="2.5" />
        <circle cx="48" cy="70" r="2.6" fill="#312210" />
      </g>
      <path d="M76 40c4 7 4 17-1 24" fill="none" stroke="#d8aa5f" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M68 61l7.5 4 2.6-8.2"
        fill="none"
        stroke="#312210"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Phones and tablets play Our Home in landscape only. In portrait a hand-painted
 * "turn sideways" card covers the room; the game stays mounted (but inert) underneath,
 * so rotating back is instant and nothing reloads.
 */
export function OrientationGate({ children }: { children: ReactNode }) {
  const [needsRotate, setNeedsRotate] = useState(() => needsLandscapeRotation(readOrientationEnv()));
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setNeedsRotate(needsLandscapeRotation(readOrientationEnv()));
    update();
    tryLockLandscape();
    const pointerQuery = window.matchMedia?.('(pointer: coarse)');
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    pointerQuery?.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
      pointerQuery?.removeEventListener?.('change', update);
    };
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    shell.inert = needsRotate;
    if (needsRotate) shell.setAttribute('aria-hidden', 'true');
    else shell.removeAttribute('aria-hidden');
  }, [needsRotate]);

  return (
    <>
      <div ref={shellRef} className="orientation-shell">
        {children}
      </div>
      {needsRotate && (
        <div
          className="rotate-gate"
          data-testid="rotate-gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rotate-gate-title"
        >
          <div className="version-card rotate-card">
            <RotateIcon />
            <h1 id="rotate-gate-title" className="version-title">
              Turn sideways to come in
            </h1>
            <p className="version-message">
              Our Home is a landscape living room. Rotate your phone or tablet to play.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
