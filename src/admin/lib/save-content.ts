'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { saveSiteData } from '@/lib/firebase';
import { releasedStoragePaths } from '@/lib/media-policy';
import { deleteReleasedMedia, UploadRejected } from '@/lib/portfolio-storage';
import { showToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store';
import type { SiteData } from '@/types';

type T = (key: string, opts?: Record<string, unknown>) => string;

export function describeAdminError(err: unknown, t: T): string {
  if (err instanceof UploadRejected) {
    if (err.problem.code === 'size') return t('admin-media-too-large', { mb: err.problem.limitMb });
    if (err.problem.code === 'empty') return t('admin-media-empty');
    return t('admin-media-bad-type');
  }
  const message = err instanceof Error ? err.message : String(err);
  if (message === 'PREVIEW_READ_ONLY') return t('admin-preview-read-only');
  if (message === 'CONTENT_NOT_LOADED') return t('admin-content-not-loaded');
  if (message === 'AUTH_REQUIRED') return t('admin-auth-required-upload');
  if (/permission|unauthori[sz]ed|PERMISSION_DENIED|storage\/unauthorized/i.test(message)) return t('admin-permission-denied');
  return t('admin-save-failed');
}

/**
 * Saves the whole content tree, then deletes Storage objects the save stopped referencing.
 * Deletion runs only after the database write succeeded, and skips anything still referenced
 * elsewhere, so a failed save can never leave the site pointing at a deleted file.
 */
export function useSaveContent() {
  const { t } = useTranslation();
  return useCallback(
    async (next: SiteData, extraReleased: string[] = []): Promise<boolean> => {
      const before = useAppStore.getState().siteData;
      try {
        await saveSiteData(next);
      } catch (err) {
        console.error(err);
        showToast(describeAdminError(err, t), 'error');
        return false;
      }
      showToast(t('admin-saved'), 'success');
      const released = [...new Set([...releasedStoragePaths(before, next), ...extraReleased])];
      if (released.length) {
        const failed = await deleteReleasedMedia(released, next).catch(() => released);
        if (failed.length) showToast(t('admin-media-cleanup-failed', { count: failed.length }), 'warning');
      }
      return true;
    },
    [t]
  );
}
