import type { SiteData } from '@/types';

export const SITE_DATA_CACHE_KEY = 'portfolio_siteData_cache';

export function readSiteDataCache(): SiteData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(SITE_DATA_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as SiteData;
  } catch {
    return null;
  }
}

export function writeSiteDataCache(data: SiteData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SITE_DATA_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded */
  }
}

/** Hydrate Zustand on first client render (before useEffect). */
export function getInitialSiteDataFromCache(): {
  data: SiteData | null;
  loaded: boolean;
} {
  const data = readSiteDataCache();
  return { data, loaded: !!data };
}
