'use client';

import { useEffect } from 'react';
import {
  subscribeToSiteData,
  onAuthChange,
  getSiteDataOnce,
} from '@/lib/firebase';
import {
  readSiteDataCache,
  writeSiteDataCache,
} from '@/lib/site-data-cache';
import { schedulePrefetchSiteMedia } from '@/lib/prefetch-media';
import { useAppStore } from '@/store';
import type { SiteData } from '@/types';

function applySiteData(
  site: SiteData,
  setSiteData: (d: SiteData) => void,
  setFirebaseConnected: (c: boolean) => void
) {
  setSiteData(site);
  setFirebaseConnected(true);
  writeSiteDataCache(site);
  schedulePrefetchSiteMedia(site);
}

async function getSiteDataFromApi(signal: AbortSignal): Promise<SiteData | null> {
  const response = await fetch('/api/site-data', {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error('SITE_DATA_API_FAILED');

  return (await response.json()) as SiteData;
}

export function useFirebaseSync() {
  const setSiteData = useAppStore((s) => s.setSiteData);
  const setSiteDataLoaded = useAppStore((s) => s.setSiteDataLoaded);
  const setFirebaseConnected = useAppStore((s) => s.setFirebaseConnected);
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const cached = readSiteDataCache();
    const existing = useAppStore.getState().siteData;

    if (existing) {
      schedulePrefetchSiteMedia(existing);
    } else if (cached) {
      setSiteData(cached);
    }

    // Instagram's in-app browser can delay Firebase RTDB transports heavily.
    // Same-origin HTTP gives visitors visible content first; realtime sync follows.
    getSiteDataFromApi(controller.signal)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          applySiteData(data, setSiteData, setFirebaseConnected);
        } else if (!cached && !useAppStore.getState().siteData) {
          setSiteDataLoaded(true);
        }
      })
      .catch((error) => {
        if (cancelled || error?.name === 'AbortError') return;
        if (cached) setSiteData(cached);
        if (!useAppStore.getState().siteData) setSiteDataLoaded(true);
      });

    // One-shot fetch often completes before the WebSocket listener on mobile.
    getSiteDataOnce()
      .then((data) => {
        if (cancelled) return;
        if (data) {
          applySiteData(data as SiteData, setSiteData, setFirebaseConnected);
        } else if (!cached) {
          setSiteDataLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled && cached) setSiteData(cached);
        if (!cancelled) setSiteDataLoaded(true);
      });

    const unsubData = subscribeToSiteData(
      (data) => {
        if (cancelled) return;
        if (data) {
          applySiteData(data as SiteData, setSiteData, setFirebaseConnected);
        } else {
          const fallback = readSiteDataCache();
          if (fallback) setSiteData(fallback);
          setSiteDataLoaded(true);
        }
      },
      () => {
        if (cancelled) return;
        const fallback = readSiteDataCache();
        if (fallback) setSiteData(fallback);
        setSiteDataLoaded(true);
      }
    );

    const unsubAuth = onAuthChange((user) => {
      if (user) {
        setAuthUser({ email: user.email || '' });
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
      unsubData();
      unsubAuth();
    };
  }, [setSiteData, setSiteDataLoaded, setFirebaseConnected, setAuthUser]);
}
