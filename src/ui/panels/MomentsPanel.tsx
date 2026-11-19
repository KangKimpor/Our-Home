import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { momentSceneArt } from '../../art/scenes';
import { svgDoc } from '../../art/svg';
import { MOMENTS, MOMENTS_BY_ID } from '../../data/moments';
import { useGameStore } from '../../store/gameStore';
import { Button, Empty, Modal, SceneArt, useDateLabel, cx } from '../bits';
import { Icon } from '../icons';

function formatStamp(ts: number): string {
  try {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return '';
  }
}

async function downloadMomentPng(momentId: string, title: string, stamp: string): Promise<void> {
  const svgMarkup = svgDoc(momentSceneArt(momentId));
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to render scene image'));
      el.src = svgUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 760;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FBF7EC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2B2521';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    ctx.drawImage(img, 36, 36, 688, 444);
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 688, 444);

    ctx.fillStyle = '#2B2521';
    ctx.font = '700 28px Fredoka, Nunito, sans-serif';
    ctx.fillText(title, 40, 526);

    ctx.fillStyle = '#6A6158';
    ctx.font = '700 20px Nunito, sans-serif';
    ctx.fillText(stamp, 40, 560);

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `our-home-moment-${momentId}.png`;
    link.click();
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export function MomentsPanel() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const caught = MOMENTS.filter((moment) => Boolean(state.moments[moment.id])).length;

  return (
    <Modal
      title={t('moments.title')}
      subtitle={t('moments.subtitle')}
      size="lg"
      className="modal-moments"
      icon={<Icon name="camera" size={22} />}
      onClose={closeOverlay}
    >
      <div className="album-head">
        <span>
          <Icon name="camera" size={17} />
          {t('moments.count', { caught, total: MOMENTS.length })}
        </span>
      </div>
      <div className="moment-grid">
        {MOMENTS.map((moment) => {
          const captured = state.moments[moment.id];
          const name = t(moment.nameKey, { defaultValue: moment.name });
          return (
            <button
              key={moment.id}
              type="button"
              className={cx('moment-card', captured ? 'is-captured' : 'is-locked')}
              onClick={() => (captured ? openOverlay('moment', moment.id) : undefined)}
              disabled={!captured}
            >
              <span className="moment-photo">
                {captured ? <SceneArt momentId={moment.id} /> : <span className="moment-lock"><Icon name="lock" size={26} /></span>}
              </span>
              <span className="moment-caption">
                {captured ? (
                  <>
                    <time className="moment-stamp" dateTime={new Date(captured.firstAt).toISOString()}>
                      {formatStamp(captured.firstAt)}
                    </time>
                    <strong>{name}</strong>
                    <small>{t('moments.times', { count: captured.count })}</small>
                  </>
                ) : (
                  <>
                    <strong>{t('moments.unseen')}</strong>
                    <small>{t('moments.hint', { hint: t(moment.hintKey) })}</small>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

export function MomentDetailPanel({ momentId }: { momentId?: string }) {
  const { t } = useTranslation();
  const date = useDateLabel();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const notify = useGameStore((s) => s.notify);
  const [saving, setSaving] = useState(false);
  const moment = momentId ? MOMENTS_BY_ID[momentId] : undefined;
  const captured = momentId ? state.moments[momentId] : undefined;

  const back = () => openOverlay('moments');

  if (!moment || !captured) {
    return (
      <Modal title={t('moments.title')} size="sm" className="modal-moments" icon={<Icon name="camera" size={22} />} onClose={back}>
        <Empty icon="camera">{t('moments.empty')}</Empty>
      </Modal>
    );
  }

  const titleText = t(moment.nameKey, { defaultValue: moment.name });
  const stampText = formatStamp(captured.firstAt);

  const onSavePhoto = async () => {
    setSaving(true);
    try {
      await downloadMomentPng(moment.id, titleText, stampText);
      notify('moments.savedPhoto', 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={titleText}
      subtitle={t('moments.detail')}
      size="md"
      className="modal-moments"
      icon={<Icon name="camera" size={22} />}
      onClose={closeOverlay}
      footer={
        <>
          <span className="muted">{t('moments.times', { count: captured.count })}</span>
          <div className="modal-footer-actions">
            <Button size="sm" variant="secondary" icon="download" disabled={saving} onClick={onSavePhoto}>
              {t('moments.savePhoto')}
            </Button>
            <Button size="sm" variant="primary" icon="camera" onClick={back}>
              {t('moments.replay')}
            </Button>
          </div>
        </>
      }
    >
      <div className="moment-detail-polaroid">
        <div className="moment-detail-photo">
          <SceneArt momentId={moment.id} />
        </div>
        <div className="moment-detail-meta">
          <time className="moment-stamp" dateTime={new Date(captured.firstAt).toISOString()}>
            {stampText}
          </time>
          <p className="moment-detail-hint">{t('moments.firstAt', { date: date(captured.firstAt) })}</p>
        </div>
      </div>
    </Modal>
  );
}
