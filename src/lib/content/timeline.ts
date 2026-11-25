import type { TimelineEntry } from '@/types';

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;
export function monthIndex(value?: string): number | null {
  const match = value?.match(MONTH);
  return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null;
}

/** Structured dates are authoritative; untouched legacy records retain their period text. */
export function timelinePeriod(entry: TimelineEntry) {
  const start = monthIndex(entry.startDate);
  const end = monthIndex(entry.endDate);
  const ongoing = entry.current ?? (end === null && /present|now|current|günümüz|devam/i.test(`${entry.period?.en} ${entry.period?.tr}`));
  const format = (value: number, lang: string) => new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(Math.floor(value / 12), value % 12, 1)));
  const period = start === null ? (entry.period ?? { en: '', tr: '' }) : {
    en: `${format(start, 'en')} ${ongoing ? '– Present' : end !== null ? `– ${format(end, 'en')}` : ''}`.trim(),
    tr: `${format(start, 'tr')} ${ongoing ? '– Günümüz' : end !== null ? `– ${format(end, 'tr')}` : ''}`.trim(),
  };
  return { period, ongoing, start, end };
}
