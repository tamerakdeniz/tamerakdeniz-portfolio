'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { findOrphanedMedia, deleteOrphanedMedia, type StoredObject } from '@/lib/portfolio-storage';
import { PREVIEW_WRITES_BLOCKED } from '@/lib/firebase-config';
import { showToast } from '@/components/ui/Toast';
import { buttonClass } from './form/fields';

export function AdminMediaAudit() {
  const { t } = useTranslation();
  const [objects, setObjects] = useState<StoredObject[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const scan = async () => {
    setBusy(true);
    setObjects(null);
    setSelected(new Set());
    try { setObjects(await findOrphanedMedia()); }
    catch { showToast(t('admin-orphan-failed'), 'error'); }
    finally { setBusy(false); }
  };
  const cleanup = async () => {
    if (!window.confirm(t('admin-orphan-confirm', { count: selected.size }))) return;
    setBusy(true);
    try {
      const failed = await deleteOrphanedMedia([...selected]);
      showToast(t('admin-orphan-done', { count: failed.length }), failed.length ? 'warning' : 'success');
      setObjects(await findOrphanedMedia());
      setSelected(new Set());
    } catch { showToast(t('admin-orphan-failed'), 'error'); setObjects(null); }
    finally { setBusy(false); }
  };
  return (
    <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
      <h3 className="font-bold">{t('admin-orphan-title')}</h3>
      <p className="text-sm text-slate-500">{t('admin-orphan-hint')}</p>
      <button className={buttonClass} disabled={busy || PREVIEW_WRITES_BLOCKED} onClick={() => void scan()}>{t(busy ? 'admin-orphan-scanning' : 'admin-orphan-scan')}</button>
      {objects?.length === 0 && <p role="status">{t('admin-orphan-empty')}</p>}
      {objects?.map((object) => <label key={object.path} className="flex gap-3 items-start text-sm break-all">
        <input type="checkbox" disabled={busy} checked={selected.has(object.path)} onChange={(e) => setSelected((old) => { const next = new Set(old); if (e.target.checked) next.add(object.path); else next.delete(object.path); return next; })} />
        <span>{object.path}<br /><span className="text-slate-500">{(object.size / 1024).toFixed(1)} KB · {new Date(object.updated).toLocaleString()}</span></span>
      </label>)}
      {!!objects?.length && <button className={`${buttonClass} text-red-600`} disabled={busy || !selected.size || PREVIEW_WRITES_BLOCKED} onClick={() => void cleanup()}>{t('admin-orphan-delete')}</button>}
    </section>
  );
}
