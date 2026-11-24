import 'server-only';
import { cache } from 'react';
import type { SiteData } from '@/types';

export const SITE_DATA_REVALIDATE_SECONDS = 60;

/**
 * Reads the public `siteData` node over the Realtime Database REST API.
 * The admin panel keeps writing through the Firebase SDK; public pages only read,
 * so they don't need the SDK in the browser bundle.
 */
export const getSiteData = cache(async (): Promise<SiteData | null> => {
  const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim();
  if (!databaseUrl) return null;

  try {
    const response = await fetch(`${databaseUrl.replace(/\/+$/, '')}/siteData.json`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: SITE_DATA_REVALIDATE_SECONDS, tags: ['site-data'] },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as SiteData | null;
    return data ?? null;
  } catch {
    return null;
  }
});
