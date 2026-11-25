import type { Project, SiteData, Skill, TimelineEntry } from '@/types';

/**
 * `siteData` is world-readable (the public site reads it over REST), so anything unpublished
 * lives in the admin-only `siteDrafts` node instead. The admin edits the merged view; every
 * save splits it again.
 */
export interface SiteDrafts {
  projects?: Project[];
  skills?: Skill[];
  timeline?: TimelineEntry[];
}

const isPublished = {
  projects: (p: Project) => !!p.published,
  skills: (s: Skill) => s.published !== false,
  timeline: (t: TimelineEntry) => t.published !== false,
};

type Collection = keyof typeof isPublished;
const COLLECTIONS = Object.keys(isPublished) as Collection[];

function list<T>(value: T[] | Record<string, T> | null | undefined): T[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : Object.values(value)).filter((v): v is T => v != null);
}

export function splitDrafts(data: SiteData): { publicData: SiteData; drafts: SiteDrafts } {
  const publicData = { ...data } as SiteData;
  const drafts: SiteDrafts = {};
  for (const key of COLLECTIONS) {
    const items = list(data[key] as never[]);
    const test = isPublished[key] as (item: unknown) => boolean;
    (publicData as unknown as Record<string, unknown>)[key] = items.filter(test);
    const hidden = items.filter((item) => !test(item));
    if (hidden.length) (drafts as Record<string, unknown>)[key] = hidden;
  }
  return { publicData, drafts };
}

/** Public items first, then drafts; an id present in both keeps the draft (the newer write). */
export function mergeDrafts(publicData: SiteData | null, drafts: SiteDrafts | null): SiteData | null {
  if (!publicData && !drafts) return null;
  const merged = { ...(publicData ?? {}) } as SiteData;
  for (const key of COLLECTIONS) {
    const draftItems = list(drafts?.[key] as never[]);
    const draftIds = new Set(draftItems.map((d: { id?: string }) => d.id).filter(Boolean));
    const publicItems = list(publicData?.[key] as never[]).filter(
      (p: { id?: string }) => !p.id || !draftIds.has(p.id)
    );
    (merged as unknown as Record<string, unknown>)[key] = [...publicItems, ...draftItems].sort(
      (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0)
    );
  }
  return merged;
}
