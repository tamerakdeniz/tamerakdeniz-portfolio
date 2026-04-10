import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';

export function detectBrowserLanguage(): 'en' | 'tr' {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('portfolio_language');
  if (stored === 'en' || stored === 'tr') return stored;
  const browserLang = navigator.language || 'en';
  const langCode = browserLang.split('-')[0].toLowerCase();
  return langCode === 'tr' ? 'tr' : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
