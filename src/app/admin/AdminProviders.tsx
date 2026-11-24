'use client';

import { useEffect, useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { detectBrowserLanguage } from '@/lib/i18n';
import { useFirebaseSync } from '@/hooks/useFirebase';
import { useThemeInit } from '@/hooks/useTheme';
import { useAppStore } from '@/store';
import { Toast } from '@/components/ui/Toast';

function AdminInitializer({ children }: { children: React.ReactNode }) {
  useFirebaseSync();
  useThemeInit();

  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const detected = detectBrowserLanguage();
    if (detected !== language) setLanguage(detected);
  }, [language, setLanguage]);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
}

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AdminInitializer>
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-[family-name:var(--font-display-family)]">
          {children}
        </div>
        <Toast />
      </AdminInitializer>
    </I18nextProvider>
  );
}
