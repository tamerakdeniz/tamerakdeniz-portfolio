'use client';

import { useEffect } from 'react';
import { isAdminUser, onAuthChange, subscribeToSiteData } from '@/lib/firebase';
import { useAppStore } from '@/store';
import type { SiteData } from '@/types';

/**
 * Admin content sync. Content is read only after the admin claim is confirmed, and only
 * through the SDK, so the editor always holds published content and drafts together; a save
 * from a partial view would otherwise drop the drafts it never saw.
 */
export function useFirebaseSync() {
  const setSiteData = useAppStore((s) => s.setSiteData);
  const setSiteDataLoaded = useAppStore((s) => s.setSiteDataLoaded);
  const setFirebaseConnected = useAppStore((s) => s.setFirebaseConnected);
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  useEffect(() => {
    let unsubData: (() => void) | null = null;
    let generation = 0;

    const stopData = () => {
      unsubData?.();
      unsubData = null;
    };

    const unsubAuth = onAuthChange(async (user) => {
      const current = ++generation;
      stopData();
      if (!user) {
        setAuthUser(null);
        setFirebaseConnected(false);
        return;
      }
      let admin = false;
      try {
        admin = await isAdminUser(user, true);
      } catch {
        admin = false;
      }
      if (current !== generation) return;
      setAuthUser({ email: user.email || '', admin });
      if (!admin) return;

      unsubData = subscribeToSiteData(
        (data) => {
          if (current !== generation) return;
          setSiteData((data ?? {}) as SiteData);
          setFirebaseConnected(true);
        },
        () => {
          if (current !== generation) return;
          setFirebaseConnected(false);
          setSiteDataLoaded(true);
        }
      );
    });

    return () => {
      generation++;
      stopData();
      unsubAuth();
    };
  }, [setSiteData, setSiteDataLoaded, setFirebaseConnected, setAuthUser]);
}
