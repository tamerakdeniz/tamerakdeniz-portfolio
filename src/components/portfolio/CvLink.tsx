'use client';
import type { ComponentProps } from 'react';
import type { Portfolio } from '@/lib/content/portfolio';
import { useLang } from '@/lib/lang';

export function CvLink({ cv, download, children, ...props }: Omit<ComponentProps<'a'>, 'href' | 'download'> & { cv: Portfolio['cv']; download?: boolean }) {
  const language = useLang();
  const document = cv.variants?.[language] ?? cv;
  const englishFallback = language === 'tr' && !cv.variants?.tr && cv.language === 'en';
  return <a {...props} href={download ? document.downloadUrl : document.viewUrl} download={download ? document.fileName : undefined}>{children}{englishFallback && <span> (İngilizce)</span>}</a>;
}
