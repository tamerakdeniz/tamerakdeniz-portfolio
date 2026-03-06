'use client';

import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { saveSiteData, getSiteDataOnce } from '@/lib/firebase';
import { showToast } from '@/components/ui/Toast';
import type { SiteData } from '@/types';

export function AdminSettingsSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const isFirebaseConnected = useAppStore((s) => s.isFirebaseConnected);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    let data = siteData;
    if (!data) {
      try { data = await getSiteDataOnce() as SiteData; } catch { /* ignore */ }
    }
    if (!data) { showToast('No data to export', 'error'); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  }, [siteData]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string) as SiteData;
        await saveSiteData(data);
        showToast('Data imported successfully!', 'success');
      } catch {
        showToast('Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('admin-nav-settings')}</h2>

      {/* Firebase Status */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="font-bold mb-4">Firebase Status</h3>
        <div className={`flex items-center gap-3 p-4 rounded-xl ${isFirebaseConnected ? 'bg-green-50 dark:bg-green-500/5' : 'bg-red-50 dark:bg-red-500/5'}`}>
          <span className={`material-symbols-outlined ${isFirebaseConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isFirebaseConnected ? 'cloud_done' : 'cloud_off'}
          </span>
          <div>
            <p className="text-sm font-medium">{isFirebaseConnected ? 'Connected' : 'Disconnected'}</p>
            <p className="text-xs text-slate-500">
              {isFirebaseConnected
                ? 'Real-time sync is active. Changes are saved to Firebase automatically.'
                : 'Working offline. Data changes will sync when connection is restored.'}
            </p>
          </div>
        </div>
      </div>

      {/* Export / Import */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="font-bold mb-4">Data Management</h3>
        <div className="flex flex-wrap gap-4">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-sm">download</span>
            {t('admin-export')}
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">upload</span>
            {t('admin-import')}
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>
    </div>
  );
}
