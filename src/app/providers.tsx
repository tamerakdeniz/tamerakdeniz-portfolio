'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { I18nextProvider } from 'react-i18next';
import i18n, { detectBrowserLanguage } from '@/lib/i18n';
import { useFirebaseSync } from '@/hooks/useFirebase';
import { useThemeInit } from '@/hooks/useTheme';
import { useAppStore } from '@/store';
import { Toast } from '@/components/ui/Toast';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useFirebaseSync();
  useThemeInit();

  const pathname = usePathname();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const hydrated = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      const detected = detectBrowserLanguage();
      if (detected !== language) {
        setLanguage(detected);
      }
    }
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AppInitializer>
        {children}
        <Toast />
      </AppInitializer>
    </I18nextProvider>
  );
}
