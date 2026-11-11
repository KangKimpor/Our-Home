import { useEffect } from 'react';
import { dayPhase, now } from './config/time';
import { applyLanguage } from './i18n';
import { playMusic, setMusicVolume, setSfxVolume } from './audio/engine';
import { cloudConfigured, uploadCloudSave } from './save/cloud';
import { initAutosave, setSaveRevision } from './save/autosave';
import { useGameStore } from './store/gameStore';
import { Hud } from './ui/Hud';
import { OverlayHost } from './ui/OverlayHost';
import { StageView } from './ui/StageView';
import { RotateOverlay, Toasts, MomentFlash } from './ui/Toasts';
import { TitleScreen } from './ui/TitleScreen';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const loaded = useGameStore((s) => s.loaded);
  const settings = useGameStore((s) => s.state.settings);
  const overlay = useGameStore((s) => s.overlay);
  const lastSeenAt = useGameStore((s) => s.state.lastSeenAt);
  const boot = useGameStore((s) => s.boot);

  useEffect(() => {
    void boot();
  }, [boot]);

  // A gentle one-second heartbeat keeps pets, visitors, crops and bubbles alive.
  useEffect(() => {
    if (!loaded) return;
    const id = window.setInterval(() => useGameStore.getState().tick(), 1000);
    return () => window.clearInterval(id);
  }, [loaded]);

  // Autosave watches gameplay state only, not UI state such as open panels.
  useEffect(() => {
    if (!loaded) return;
    const store = useGameStore.getState();
    setSaveRevision(store.saveRevision);
    const stop = initAutosave({
      getState: () => useGameStore.getState().state,
      getDeviceId: () => useGameStore.getState().deviceId,
      subscribe: (listener) =>
        useGameStore.subscribe((next, previous) => {
          if (next.state !== previous.state) listener();
        }),
      onStatus: (status) => useGameStore.getState().setSaveStatus(status),
      onSaved: (envelope) => {
        useGameStore.getState().setSaveRevision(envelope.revision);
        if (cloudConfigured()) {
          void uploadCloudSave(envelope).catch(() => undefined);
        }
      },
    });
    return stop;
  }, [loaded]);

  useEffect(() => {
    applyLanguage(settings.lang);
  }, [settings.lang]);

  useEffect(() => {
    setMusicVolume(settings.music);
    setSfxVolume(settings.sfx);
  }, [settings.music, settings.sfx]);

  useEffect(() => {
    document.documentElement.dataset.textSize = settings.textSize;
  }, [settings.textSize]);

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (overlay) {
      document.body.classList.add('has-overlay');
    } else {
      document.body.classList.remove('has-overlay');
    }
    return () => document.body.classList.remove('has-overlay');
  }, [overlay]);

  // The clock in the room decides the music. `lastSeenAt` refreshes each tick.
  const night = dayPhase(now()) === 'night';
  useEffect(() => {
    if (screen !== 'game' || !loaded) return;
    playMusic(night ? 'night' : 'day');
  }, [screen, loaded, night, lastSeenAt]);

  return (
    <div className={screen === 'game' ? 'app app-game' : 'app app-title'}>
      {screen === 'title' ? (
        <TitleScreen />
      ) : (
        <div className="stage-shell">
          <div className="stage-frame">
            <StageView night={night} />
            <Hud />
            <OverlayHost />
            <MomentFlash />
          </div>
        </div>
      )}
      <Toasts />
      <RotateOverlay />
    </div>
  );
}
