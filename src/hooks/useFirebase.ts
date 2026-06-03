'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { subscribeToSiteData, onAuthChange } from '@/lib/firebase';
import type { SiteData } from '@/types';

const SITE_DATA_CACHE_KEY = 'portfolio_siteData_cache';

function readSiteDataCache(): SiteData | null {
  try {
    const cached = localStorage.getItem(SITE_DATA_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as SiteData;
  } catch {
    return null;
  }
}

function writeSiteDataCache(data: SiteData) {
  try {
    localStorage.setItem(SITE_DATA_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded */
  }
}

export function useFirebaseSync() {
  const setSiteData = useAppStore((s) => s.setSiteData);
  const setSiteDataLoaded = useAppStore((s) => s.setSiteDataLoaded);
  const setFirebaseConnected = useAppStore((s) => s.setFirebaseConnected);
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  useEffect(() => {
    const cached = readSiteDataCache();
    if (cached) {
      setSiteData(cached);
    }

    const unsubData = subscribeToSiteData((data) => {
      if (data) {
        setSiteData(data as SiteData);
        setFirebaseConnected(true);
        writeSiteDataCache(data as SiteData);
      } else {
        if (!cached) {
          const fallback = readSiteDataCache();
          if (fallback) setSiteData(fallback);
        }
        setSiteDataLoaded(true);
      }
    });

    const unsubAuth = onAuthChange((user) => {
      if (user) {
        setAuthUser({ email: user.email || '' });
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      unsubData();
      unsubAuth();
    };
  }, [setSiteData, setSiteDataLoaded, setFirebaseConnected, setAuthUser]);
}
