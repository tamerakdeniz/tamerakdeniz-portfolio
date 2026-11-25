import 'server-only';
import { cache } from 'react';
import { databaseRestUrl, SNAPSHOT_PREVIEW } from '@/lib/firebase-config';
import snapshot from '../../../content/preview-snapshot.json';
import type { SiteData } from '@/types';

export const SITE_DATA_REVALIDATE_SECONDS = 60;
export const SITE_DATA_TAG = 'site-data';

/**
 * Reads the public `siteData` node over the Realtime Database REST API: one request per
 * revalidation window for the whole site, shared by every page through the fetch cache.
 * The admin panel writes through the Firebase SDK and expires the tag (/api/revalidate).
 * Production failures throw so ISR retains its last good render; development can fall back.
 */
export const getSiteData = cache(async (): Promise<SiteData | null> => {
  if (SNAPSHOT_PREVIEW) return snapshot as unknown as SiteData;
  const url = databaseRestUrl('siteData');
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: SITE_DATA_REVALIDATE_SECONDS, tags: [SITE_DATA_TAG] },
    });
    if (!response.ok) throw new Error(`siteData ${response.status}`);
    const data = (await response.json()) as SiteData | null;
    return data ?? null;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
    return null;
  }
});
