'use client';

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectCvFiles } from '@/store';
import { getCvDownloadHref } from '@/lib/download-file';
import { Modal } from './Modal';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-all text-sm shrink-0';
const btnSecondary =
  'inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-sm shrink-0';
/** Header on small screens: icon-only (full labels in body below) */
const btnHeader =
  'max-sm:size-10 max-sm:p-0 max-sm:gap-0';

export function CVModal() {
  const { t } = useTranslation();
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

  const downloadHref = useMemo(() => getCvDownloadHref(src, fileName), [src, fileName]);

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const openCvInNewTab = useCallback(() => {
    window.open(src, '_blank', 'noopener,noreferrer');
  }, [src]);

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold min-w-0 truncate">{t('cv-title')}</h2>
        <div className="flex items-center gap-2 justify-end shrink-0">
          <a
            href={downloadHref}
            download={fileName}
            className={`${btnPrimary} ${btnHeader}`}
            aria-label={t('cv-download')}
          >
            <span className="material-symbols-outlined text-xl sm:text-sm">download</span>
            <span className="hidden sm:inline">{t('cv-download')}</span>
          </a>
          <button
            type="button"
            onClick={openCvInNewTab}
            className={`${btnSecondary} ${btnHeader}`}
            aria-label={t('cv-open-tab')}
          >
            <span className="material-symbols-outlined text-xl sm:text-sm">open_in_new</span>
            <span className="hidden sm:inline">{t('cv-open-tab')}</span>
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="flex items-center justify-center size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {isMobile ? (
          <div className="w-full text-center py-8">
            <span className="material-symbols-outlined text-6xl text-primary mb-4 block">
              description
            </span>
            <h3 className="text-xl font-bold mb-2">{fileName}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              {t('cv-mobile-info')}
            </p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <a href={downloadHref} download={fileName} className={`${btnPrimary} w-full`}>
                <span className="material-symbols-outlined">download</span>
                {t('cv-download')}
              </a>
              <button type="button" onClick={openCvInNewTab} className={`${btnSecondary} w-full`}>
                <span className="material-symbols-outlined">open_in_new</span>
                {t('cv-open-tab')}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            <iframe
              src={src}
              title={fileName}
              className="w-full h-[70vh] min-h-[600px] border-0 rounded-lg"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
