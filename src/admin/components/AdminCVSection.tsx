'use client';
import { useTranslation } from 'react-i18next';
import { useSaveContent } from '@/admin/lib/save-content';
import { useAppStore, selectCvFiles } from '@/store';
import { MediaUpload } from './form/MediaUpload';
import { inputClass } from './form/fields';
import type { CVFile } from '@/types';

export function AdminCVSection() {
  const { t } = useTranslation();
  const saveContent = useSaveContent();
  const siteData = useAppStore((s) => s.siteData);
  const cvFiles = useAppStore(selectCvFiles);
  const save = async (files: CVFile[], activeId?: string) => {
    if (!siteData) return false;
    const active = activeId ?? (files.some((file) => file.id === siteData.activeCvId) ? siteData.activeCvId : files[0]?.id ?? '');
    return saveContent({ ...siteData, cvFiles: files, activeCvId: active });
  };
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-bold">{t('admin-nav-cv')}</h2>
      <MediaUpload folder="cv" entityId="documents" kind="resume" allow={['pdf']} label={t('admin-upload-pdf')} onUploaded={(file) => {
        const entry: CVFile = { id: crypto.randomUUID(), name: file.name || 'Resume.pdf', dataUrl: file.url, path: file.path };
        void save([...cvFiles, entry], entry.id);
      }} />
    </div>
    <p className="text-sm text-slate-500">{t('admin-cv-language-hint')}</p>
    {cvFiles.map((file) => <div key={file.id} className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-slate-800 space-y-3">
      <p className="font-medium break-all">{file.name}</p>
      <div className="flex flex-wrap gap-3 items-center">
        <label>{t('admin-cv-language')}
          <select className={inputClass} value={file.language ?? ''} onChange={(e) => void save(cvFiles.map((f) => f.id === file.id ? { ...f, language: (e.target.value || undefined) as CVFile['language'] } : f))}>
            <option value="">{t('admin-default')}</option><option value="en">English</option><option value="tr">Türkçe</option>
          </select>
        </label>
        <button onClick={() => void save([file, ...cvFiles.filter((f) => f.id !== file.id)], file.id)} className="px-3 py-2 rounded-lg border text-sm">{siteData?.activeCvId === file.id ? t('admin-active') : t('admin-set-active')}</button>
        <a href={file.dataUrl} target="_blank" rel="noreferrer" className="underline text-sm">{t('admin-preview')}</a>
        <button onClick={() => { if (window.confirm(t('admin-confirm-delete'))) void save(cvFiles.filter((f) => f.id !== file.id)); }} className="px-3 py-2 text-red-500 text-sm">{t('admin-delete')}</button>
      </div>
    </div>)}
    {!cvFiles.length && <p className="text-slate-500">{t('admin-no-cv-hint')}</p>}
  </div>;
}
