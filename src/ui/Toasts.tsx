import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MOMENTS_BY_ID } from '../data/moments';
import { useGameStore } from '../store/gameStore';
import { SceneArt } from './bits';
import { Icon } from './icons';

export function Toasts() {
  const { t } = useTranslation();
  const toast = useGameStore((s) => s.toast);
  const dismiss = useGameStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => dismiss(), 3800);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div className="toast-wrap" aria-live="polite">
      <button key={toast.id} type="button" className={`toast toast-${toast.kind}`} onClick={dismiss}>
        <Icon name={toast.kind === 'warn' ? 'info' : toast.kind === 'success' ? 'check' : 'sparkle'} size={18} />
        <span>{t(toast.key, toast.params)}</span>
      </button>
    </div>
  );
}

export function MomentFlash() {
  const { t } = useTranslation();
  const momentId = useGameStore((s) => s.momentFlash);
  const setMomentFlash = useGameStore((s) => s.setMomentFlash);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const moment = momentId ? MOMENTS_BY_ID[momentId] : undefined;

  useEffect(() => {
    if (!momentId) return;
    const timer = window.setTimeout(() => setMomentFlash(null), 6500);
    return () => window.clearTimeout(timer);
  }, [momentId, setMomentFlash]);

  if (!moment || !momentId) return null;

  return (
    <button
      type="button"
      className="moment-flash"
      onClick={() => {
        setMomentFlash(null);
        openOverlay('moment', momentId);
      }}
    >
      <span className="moment-flash-tape" aria-hidden="true" />
      <SceneArt momentId={momentId} />
      <span className="moment-flash-label">
        <Icon name="camera" size={16} />
        {t('moments.new')}
      </span>
      <strong>{t(moment.nameKey, { defaultValue: moment.name })}</strong>
    </button>
  );
}

export function RotateOverlay() {
  const { t } = useTranslation();
  return (
    <div className="rotate-overlay">
      <div className="rotate-phone">
        <span className="rotate-phone-screen" />
      </div>
      <h2>{t('rotate.title')}</h2>
      <p>{t('rotate.body')}</p>
    </div>
  );
}
