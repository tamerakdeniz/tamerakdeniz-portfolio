'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore, selectCvFiles } from '@/store';
import { Modal } from './Modal';

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

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const downloadCV = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold">{t('cv-title')}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCV}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-sm">download</span>
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
                onClick={downloadCV}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
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
