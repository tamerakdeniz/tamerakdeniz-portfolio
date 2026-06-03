import type { SiteData } from '@/types';

const inflight = new Set<string>();
const loaded = new Set<string>();

export function isMediaCached(url: string): boolean {
  return loaded.has(url);
}

/** Warm browser HTTP cache for Storage/CDN URLs (session-only bookkeeping). */
export function prefetchMediaUrl(url: string | undefined | null): void {
  if (!url || url.startsWith('data:') || inflight.has(url) || loaded.has(url)) return;
  inflight.add(url);
  const img = new Image();
  img.onload = () => {
    loaded.add(url);
    inflight.delete(url);
  };
  img.onerror = () => inflight.delete(url);
  img.src = url;
}

export function prefetchSiteMedia(data: SiteData): void {
  for (const p of data.projects || []) {
    prefetchMediaUrl(p.image);
  }
  for (const e of data.aboutEntries || []) {
    prefetchMediaUrl(e.avatar?.imageUrl);
  }
  if (data.homeHero?.icon?.mode === 'image') {
    prefetchMediaUrl(data.homeHero.icon.imageUrl);
  }
}
