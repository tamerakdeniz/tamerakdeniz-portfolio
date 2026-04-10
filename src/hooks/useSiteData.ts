'use client';

import { useAppStore } from '@/store';
import type { Language } from '@/types';

export function useLocalizedValue<T extends { en: string; tr: string }>(
  value: T | undefined,
  fallback = ''
): string {
  const lang = useAppStore((s) => s.language);
  if (!value) return fallback;
  return value[lang] || value.en || fallback;
}

export function getLocalizedValue(
  value: { en: string; tr: string } | undefined,
  lang: Language,
  fallback = ''
): string {
  if (!value) return fallback;
  return value[lang] || value.en || fallback;
}
