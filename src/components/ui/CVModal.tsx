'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectCvFiles } from '@/store';
import { downloadFile } from '@/lib/download-file';
import { showToast } from '@/components/ui/Toast';
import { Modal } from './Modal';

export function CVModal() {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const isOpen = useAppStore((s) => s.cvModalOpen);
  const onClose = useAppStore((s) => s.setCvModalOpen);
  const cvFiles = useAppStore(selectCvFiles);
  const siteData = useAppStore((s) => s.siteData);

  const getActiveCVFile = () => {
    if (!cvFiles.length) return null;
    const activeId = siteData?.activeCvId;
    if (!activeId) return cvFiles[0];
    return cvFiles.find((f) => f.id === activeId) || cvFiles[0];
  };

  const activeFile = getActiveCVFile();
  const src = activeFile?.dataUrl || '/resume/Mustafa-Tamer-Akdeniz-Resume.pdf';
  const fileName = activeFile?.name || 'Mustafa-Tamer-Akdeniz-Resume.pdf';

  const [downloading, setDownloading] = useState(false);

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const downloadCV = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadFile(src, fileName);
    } catch {
      showToast(
        language === 'tr'
          ? 'İndirme başarısız. PDF yeni sekmede açılıyor.'
          : 'Download failed. Opening PDF in a new tab.',
        'warning'
      );
      window.open(src, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  }, [downloading, src, fileName, language]);

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold">{t('cv-title')}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void downloadCV()}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-all text-sm disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-sm">
              {downloading ? 'progress_activity' : 'download'}
            </span>
            {t('btn-download-cv')}
          </button>
          <button
            onClick={() => onClose(false)}
            className="flex items-center justify-center size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {isMobile ? (
          <div className="w-full text-center py-8">
            <div className="mb-6">
              <span className="material-symbols-outlined text-6xl text-primary mb-4">
                description
              </span>
              <h3 className="text-xl font-bold mb-2">{fileName}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                {t('cv-mobile-info')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                {t('cv-open-tab')}
              </a>
              <button
                onClick={() => void downloadCV()}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-all disabled:opacity-60"
              >
                <span className="material-symbols-outlined">download</span>
                {t('cv-download')}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            <iframe
              src={src}
              className="w-full h-[70vh] min-h-[600px] border-0 rounded-lg"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
