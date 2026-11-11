import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  cloudConfigured,
  deleteCloudData,
  getCloudStatus,
  refreshCloudUser,
  signIn,
  signOut,
  subscribeCloud,
  uploadCloudSave,
  type CloudStatus,
} from '../../save/cloud';
import { downloadSave, encodeBackupCode, exportSaveJson } from '../../save/exportImport';
import { saveNow } from '../../save/autosave';
import { useGameStore } from '../../store/gameStore';
import { Button, Field, Modal, Tabs } from '../bits';
import { Icon } from '../icons';

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function SettingsPanel() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const importSave = useGameStore((s) => s.importSave);
  const resetGame = useGameStore((s) => s.resetGame);
  const notify = useGameStore((s) => s.notify);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const [tab, setTab] = useState<'general' | 'save' | 'cloud' | 'about'>('general');
  const [importText, setImportText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [cloud, setCloud] = useState<CloudStatus>(() => getCloudStatus());
  const [syncing, setSyncing] = useState(false);
  const configured = cloudConfigured();

  useEffect(() => {
    if (!configured) return;
    const unsubscribe = subscribeCloud(setCloud);
    void refreshCloudUser();
    return unsubscribe;
  }, [configured]);

  const exportBackup = () => {
    downloadSave(state);
    notify('settings.exportDone', 'success');
  };

  const copyBackup = async () => {
    try {
      await navigator.clipboard.writeText(encodeBackupCode(exportSaveJson(state)));
      notify('settings.copied', 'success');
    } catch {
      downloadText(encodeBackupCode(exportSaveJson(state)), 'our-home-backup.txt');
      notify('settings.exportDone', 'success');
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      const envelope = await saveNow(true);
      if (envelope) await uploadCloudSave(envelope);
      notify('settings.cloudSynced', 'success');
    } catch (error) {
      notify('settings.cloudError', 'warn', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Modal
      title={t('settings.title')}
      size="lg"
      icon={<Icon name="settings" size={22} />}
      onClose={closeOverlay}
    >
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { id: 'general', label: t('settings.audio'), icon: 'sound' },
          { id: 'save', label: t('settings.saveData'), icon: 'bag' },
          { id: 'cloud', label: t('settings.cloud'), icon: 'cloud' },
          { id: 'about', label: t('settings.about'), icon: 'info' },
        ]}
      />

      {tab === 'general' ? (
        <div className="settings-list">
          <section className="settings-group">
            <h3>
              <Icon name="sound" size={18} /> {t('settings.audio')}
            </h3>
            <Field label={t('settings.music')}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.settings.music}
                onChange={(event) => updateSettings({ music: Number(event.target.value) })}
              />
              <span className="range-value">{Math.round(state.settings.music * 100)}%</span>
            </Field>
            <Field label={t('settings.sfx')}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.settings.sfx}
                onChange={(event) => updateSettings({ sfx: Number(event.target.value) })}
              />
              <span className="range-value">{Math.round(state.settings.sfx * 100)}%</span>
            </Field>
          </section>

          <section className="settings-group">
            <h3>
              <Icon name="text" size={18} /> {t('settings.textSize')}
            </h3>
            <div className="segmented">
              {(['s', 'm', 'l'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={state.settings.textSize === size ? 'is-active' : ''}
                  onClick={() => updateSettings({ textSize: size })}
                >
                  {t(size === 's' ? 'settings.small' : size === 'm' ? 'settings.medium' : 'settings.large')}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-group">
            <h3>
              <Icon name="users" size={18} /> {t('characters.title')}
            </h3>
            <div className="settings-actions">
              <Button size="sm" variant="secondary" icon="users" onClick={() => openOverlay('characters')}>
                {t('characters.title')}
              </Button>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={state.settings.showBaby}
                  onChange={(event) => updateSettings({ showBaby: event.target.checked })}
                />
                {t('settings.showBaby')}
              </label>
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'save' ? (
        <div className="settings-list">
          <section className="settings-group">
            <h3>
              <Icon name="bag" size={18} /> {t('settings.saveData')}
            </h3>
            <p className="muted">{t('settings.autosave')}</p>
            <div className="settings-actions">
              <Button size="sm" variant="secondary" icon="download" onClick={exportBackup}>
                {t('settings.export')}
              </Button>
              <Button size="sm" variant="ghost" icon="upload" onClick={copyBackup}>
                {t('settings.backupCode')} · {t('settings.copyCode')}
              </Button>
            </div>
          </section>

          <section className="settings-group">
            <h3>
              <Icon name="upload" size={18} /> {t('settings.import')}
            </h3>
            <p className="muted">{t('settings.importHint')}</p>
            <textarea
              className="import-area"
              value={importText}
              placeholder={t('settings.importPlaceholder')}
              onChange={(event) => setImportText(event.target.value)}
              rows={4}
            />
            <div className="settings-actions">
              <Button
                size="sm"
                variant="primary"
                icon="upload"
                disabled={!importText.trim()}
                onClick={() => importSave(importText)}
              >
                {t('settings.import')}
              </Button>
              <label className="btn btn-secondary btn-sm file-btn">
                <Icon name="bag" size={16} />
                <span>{t('settings.importFile')}</span>
                <input
                  type="file"
                  accept="application/json,.json,.txt"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    setImportText(text);
                    importSave(text);
                  }}
                />
              </label>
            </div>
          </section>

          <section className="settings-group dangers">
            <h3>
              <Icon name="trash" size={18} /> {t('settings.dangerZone')}
            </h3>
            {confirmReset ? (
              <div className="confirm-row">
                <p>{t('settings.resetConfirm')}</p>
                <div className="settings-actions">
                  <Button
                    size="sm"
                    variant="danger"
                    icon="trash"
                    onClick={async () => {
                      await resetGame();
                      notify('settings.imported', 'success');
                    }}
                  >
                    {t('common.confirm')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="danger" icon="trash" onClick={() => setConfirmReset(true)}>
                {t('settings.reset')}
              </Button>
            )}
          </section>
        </div>
      ) : null}

      {tab === 'cloud' ? (
        <div className="settings-list">
          <section className="settings-group">
            <h3>
              <Icon name="cloud" size={18} /> {t('settings.cloud')}
            </h3>
            <p className="muted">{t('settings.cloudHint')}</p>
            {!configured ? (
              <div className="cloud-box">
                <Icon name="cloud" size={30} />
                <p>{t('settings.cloudSoon')}</p>
                <small>{t('settings.cloudUnconfigured')}</small>
              </div>
            ) : (
              <div className="cloud-box">
                <Icon name="cloud" size={30} />
                {cloud.user ? (
                  <p>{t('settings.cloudSignedIn', { name: cloud.user.name ?? cloud.user.email ?? cloud.user.sub })}</p>
                ) : (
                  <p>{t('settings.cloudSoon')}</p>
                )}
                {cloud.lastError ? <small className="warn-text">{cloud.lastError}</small> : null}
                <div className="settings-actions">
                  {cloud.user ? (
                    <>
                      <Button size="sm" variant="primary" icon="cloud" disabled={syncing} onClick={syncNow}>
                        {syncing ? t('hud.saveSaving') : t('settings.cloudSyncNow')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => signOut()}>
                        {t('settings.cloudSignOut')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon="trash"
                        onClick={async () => {
                          try {
                            await deleteCloudData();
                            notify('common.delete', 'info');
                          } catch (error) {
                            notify('settings.cloudError', 'warn', {
                              error: error instanceof Error ? error.message : String(error),
                            });
                          }
                        }}
                      >
                        Delete my cloud data
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="primary" icon="cloud" onClick={() => signIn()}>
                      {t('settings.cloudSignIn')}
                    </Button>
                  )}
                </div>
                <small className="muted">
                  Deleting cloud data removes your Supabase save and snapshots immediately. To delete your Auth0 login profile, sign out and request deletion from the account owner.
                </small>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {tab === 'about' ? (
        <div className="settings-list">
          <section className="settings-group">
            <h3>
              <Icon name="home" size={18} /> {t('settings.about')}
            </h3>
            <p>{t('settings.aboutText')}</p>
            <div className="settings-actions">
              <Button size="sm" variant="secondary" icon="info" onClick={() => openOverlay('about')}>
                {t('about.title')}
              </Button>
              <Button size="sm" variant="ghost" icon="lock" onClick={() => openOverlay('privacy')}>
                {t('settings.privacy')}
              </Button>
              <Button size="sm" variant="ghost" icon="users" onClick={() => openOverlay('characters')}>
                {t('settings.credits')}
              </Button>
            </div>
          </section>
          <section className="settings-group">
            <h3>
              <Icon name="sparkle" size={18} /> {t('settings.credits')}
            </h3>
            <p className="muted">{t('settings.artCredit')}</p>
            <p className="muted">{t('settings.musicCredit')}</p>
            <p className="muted">{t('settings.dataCredit')}</p>
          </section>
          <p className="muted center">{t('app.version', { version: '0.1.0' })}</p>
        </div>
      ) : null}
    </Modal>
  );
}
