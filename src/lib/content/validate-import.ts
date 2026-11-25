import type { SiteData } from '@/types';

/** Full-backup import only. Candidate imports use the scoped CLI instead. */
export function validateSiteDataImport(value: unknown): asserts value is SiteData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_IMPORT');
  const data = value as Record<string, unknown>;
  for (const key of ['projects', 'aboutEntries', 'skills', 'timeline', 'cvFiles']) {
    if (!Array.isArray(data[key])) throw new Error(`INVALID_IMPORT_${key}`);
    if ((data[key] as unknown[]).some((item) => !item || typeof item !== 'object' || Array.isArray(item))) throw new Error(`INVALID_IMPORT_${key}`);
  }
  for (const key of ['contactInfo', 'homeHero', 'availability']) {
    if (!data[key] || typeof data[key] !== 'object') throw new Error(`INVALID_IMPORT_${key}`);
  }
  for (const key of ['projects', 'skills', 'timeline']) {
    const ids = (data[key] as { id?: string }[]).map((item) => item.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) throw new Error('DUPLICATE_ID');
  }
}
