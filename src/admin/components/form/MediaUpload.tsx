'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { acceptAttr, type MediaClass } from '@/lib/media-policy';
import { uploadMedia, type StorageFolder, type UploadedFile } from '@/lib/portfolio-storage';
import { describeAdminError } from '@/admin/lib/save-content';
import { buttonClass } from './fields';

export interface UploadResult extends UploadedFile {
  name: string;
  width?: number;
  height?: number;
}

async function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith('image/')) return {};
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return {};
  }
}

/**
 * File picker with validation, progress and errors. Every upload goes to a new unique path;
 * the caller decides when the previous file is released (after a successful save).
 */
export function MediaUpload({
  folder,
  entityId,
  kind,
  allow = ['image'],
  label,
  onUploaded,
  disabled,
}: {
  folder: StorageFolder;
  entityId: string;
  kind: string;
  allow?: MediaClass[];
  label: string;
  onUploaded: (file: UploadResult) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [lastFile, setLastFile] = useState<File | null>(null);

  const run = async (file: File) => {
    setError('');
    setLastFile(file);
    setProgress(0);
    controller.current = new AbortController();
    try {
      const [uploaded, size] = await Promise.all([
        uploadMedia(file, { folder, entityId, kind, allow, onProgress: setProgress, signal: controller.current.signal }),
        imageSize(file),
      ]);
      onUploaded({ ...uploaded, ...size, name: file.name });
      setLastFile(null);
    } catch (err) {
      console.error(err);
      setError(describeAdminError(err, t));
    } finally {
      setProgress(null);
      if (input.current) input.current.value = '';
    }
  };

  const busy = progress !== null;
  return (
    <div className="space-y-1">
      <p className="text-xs text-amber-700 dark:text-amber-300" role="note">{t('admin-media-public-notice')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className={`${buttonClass} cursor-pointer inline-flex items-center gap-1 ${busy || disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <span className="material-symbols-outlined text-base">upload</span>
          {label}
          <input
            ref={input}
            type="file"
            accept={acceptAttr(allow)}
            className="sr-only"
            disabled={busy || disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void run(file);
            }}
          />
        </label>
        {busy && (
          <span className="flex items-center gap-2 text-xs text-slate-500" role="status">
            <progress className="w-28 h-2" max={1} value={progress ?? 0} />
            {Math.round((progress ?? 0) * 100)}%
          </span>
        )}
        {busy && <button type="button" className={buttonClass} onClick={() => controller.current?.abort()}>{t('admin-cancel')}</button>}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-2" role="alert">
          {error}
          {lastFile && (
            <button type="button" className="underline" onClick={() => void run(lastFile)}>
              {t('admin-retry')}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
