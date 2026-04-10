'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { subscribeToSiteData, onAuthChange } from '@/lib/firebase';
import type { SiteData } from '@/types';

export function useFirebaseSync() {
  const setSiteData = useAppStore((s) => s.setSiteData);
  const setSiteDataLoaded = useAppStore((s) => s.setSiteDataLoaded);
  const setFirebaseConnected = useAppStore((s) => s.setFirebaseConnected);
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  useEffect(() => {
    const unsubData = subscribeToSiteData((data) => {
      if (data) {
        setSiteData(data as SiteData);
        setFirebaseConnected(true);
        try {
          localStorage.setItem('portfolio_siteData_cache', JSON.stringify(data));
        } catch { /* quota exceeded is fine */ }
      } else {
        const cached = localStorage.getItem('portfolio_siteData_cache');
        if (cached) {
          try {
            setSiteData(JSON.parse(cached) as SiteData);
          } catch { /* ignore */ }
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
