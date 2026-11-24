'use client';

import { useSyncExternalStore } from 'react';
import type { Lang } from '@/lib/content/portfolio';
import { LANG_STORAGE_KEY } from '@/lib/lang-boot';

function read(): Lang {
  return document.documentElement.lang === 'tr' ? 'tr' : 'en';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  return () => observer.disconnect();
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => 'en');
}

export function setLang(lang: Lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* private mode */
  }
}
