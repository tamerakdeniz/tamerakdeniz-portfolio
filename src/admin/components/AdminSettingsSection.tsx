'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { saveSiteData, getSiteDataOnce } from '@/lib/firebase';
import { countInlineMedia, migrateSiteDataMedia } from '@/lib/portfolio-storage';
import { showToast } from '@/components/ui/Toast';
import type { SiteData } from '@/types';

export function AdminSettingsSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const isFirebaseConnected = useAppStore((s) => s.isFirebaseConnected);
  const fileRef = useRef<HTMLInputElement>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateProgress, setMigrateProgress] = useState('');

  const inlineMediaCount = siteData ? countInlineMedia(siteData) : 0;

  const handleExport = useCallback(async () => {
    let data = siteData;
    if (!data) {
      try {
        data = (await getSiteDataOnce()) as SiteData;
      } catch {
        /* ignore */
      }
    }
    if (!data) {
      showToast(t('admin-no-data-export'), 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('admin-export-success'), 'success');
  }, [siteData, t]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const data = JSON.parse(reader.result as string) as SiteData;
          await saveSiteData(data);
          if (countInlineMedia(data) > 0) {
            showToast(t('admin-import-inline-hint'), 'info');
          } else {
            showToast(t('admin-import-success'), 'success');
          }
        } catch {
          showToast(t('admin-invalid-json'), 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [t]
  );

  const handleMigrateMedia = useCallback(async () => {
    setMigrating(true);
    setMigrateProgress('');
    try {
      let data = siteData;
      if (!data) {
        data = (await getSiteDataOnce()) as SiteData;
      }
      if (!data) {
        showToast(t('admin-no-data-export'), 'error');
        return;
      }
      const remaining = countInlineMedia(data);
      if (remaining === 0) {
        showToast(t('admin-migrate-nothing'), 'info');
        return;
      }
      const migrated = await migrateSiteDataMedia(data, (label) =>
        setMigrateProgress(label)
      );
      await saveSiteData(migrated);
      try {
        localStorage.removeItem('portfolio_siteData_cache');
      } catch {
        /* ignore */
      }
      showToast(t('admin-migrate-success'), 'success');
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message === 'AUTH_REQUIRED'
          ? t('admin-auth-required-upload')
          : t('admin-migrate-failed');
      showToast(message, 'error');
    } finally {
      setMigrating(false);
      setMigrateProgress('');
    }
  }, [siteData, t]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('admin-nav-settings')}</h2>

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="font-bold mb-4">{t('admin-firebase-status')}</h3>
        <div
          className={`flex items-center gap-3 p-4 rounded-xl ${isFirebaseConnected ? 'bg-green-50 dark:bg-green-500/5' : 'bg-red-50 dark:bg-red-500/5'}`}
        >
          <span
            className={`material-symbols-outlined ${isFirebaseConnected ? 'text-green-500' : 'text-red-500'}`}
          >
            {isFirebaseConnected ? 'cloud_done' : 'cloud_off'}
          </span>
          <div>
            <p className="text-sm font-medium">
              {isFirebaseConnected ? t('admin-connected') : t('admin-disconnected')}
            </p>
            <p className="text-xs text-slate-500">
              {isFirebaseConnected
                ? t('admin-firebase-connected-desc')
                : t('admin-firebase-offline-desc')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold">{t('admin-media-storage-title')}</h3>
        <p className="text-sm text-slate-500">{t('admin-media-storage-desc')}</p>
        {inlineMediaCount > 0 ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t('admin-media-inline-count', { count: inlineMediaCount })}
          </p>
        ) : (
          <p className="text-sm text-green-600 dark:text-green-400">{t('admin-media-all-storage')}</p>
        )}
        {migrateProgress && (
          <p className="text-xs font-mono text-slate-500 truncate">{migrateProgress}</p>
        )}
        <button
          onClick={handleMigrateMedia}
          disabled={migrating || inlineMediaCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          {migrating && (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          )}
          <span className="material-symbols-outlined text-sm">cloud_upload</span>
          {t('admin-migrate-media')}
        </button>
        <p className="text-xs text-slate-400">{t('admin-migrate-media-hint')}</p>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="font-bold mb-4">{t('admin-data-management')}</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {t('admin-export')}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            {t('admin-import')}
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>
    </div>
  );
}
