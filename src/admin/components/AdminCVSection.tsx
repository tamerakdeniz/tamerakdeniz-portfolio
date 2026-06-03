'use client';

import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectCvFiles } from '@/store';
import { saveSiteData } from '@/lib/firebase';
import { uploadPortfolioFile } from '@/lib/portfolio-storage';
import { showToast } from '@/components/ui/Toast';
import type { CVFile } from '@/types';

function formatAddedDate(id: string): string {
  const ts = parseInt(id, 10);
  if (isNaN(ts)) return '';
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AdminCVSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const cvFiles = useAppStore(selectCvFiles);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = useCallback(async (files: CVFile[], activeId?: string) => {
    if (!siteData) return;
    try {
      await saveSiteData({ ...siteData, cvFiles: files, activeCvId: activeId || siteData.activeCvId });
      showToast(t('admin-saved'), 'success');
    } catch { showToast(t('admin-save-failed'), 'error'); }
  }, [siteData, t]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 1024 * 1024 * 10) {
      showToast(t('admin-file-too-large'), 'error');
      return;
    }

    const id = Date.now().toString();
    try {
      const url = await uploadPortfolioFile(file, 'cv', id);
      const newFile: CVFile = { id, name: file.name, dataUrl: url };
      save([...cvFiles, newFile], newFile.id);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message === 'AUTH_REQUIRED'
          ? t('admin-auth-required-upload')
          : t('admin-save-failed');
      showToast(message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-cv')}</h2>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <span className="material-symbols-outlined text-sm">upload</span>{t('admin-upload-pdf')}
        </button>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
      </div>

      <div className="space-y-3">
        {cvFiles.map((file) => (
          <div key={file.id} className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-slate-800 flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">description</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('admin-added', { date: formatAddedDate(file.id) })}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => save(cvFiles, file.id)} className={`p-2 rounded-lg transition-colors ${siteData?.activeCvId === file.id ? 'text-green-500' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <span className="material-symbols-outlined text-sm">{siteData?.activeCvId === file.id ? 'check_circle' : 'radio_button_unchecked'}</span>
              </button>
              <button onClick={() => save(cvFiles.filter(f => f.id !== file.id))} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        ))}
        {cvFiles.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2">description</span>
            <p>{t('admin-no-cv-hint')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
