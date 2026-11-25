import type { SiteData } from '@/types';

/** Mirrors storage.rules; the rules are the enforcement, this gives early, readable errors. */
export const MEDIA_RULES = {
  image: { types: ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'], maxBytes: 10 * 1024 * 1024 },
  video: { types: ['video/mp4', 'video/webm'], maxBytes: 60 * 1024 * 1024 },
  pdf: { types: ['application/pdf'], maxBytes: 15 * 1024 * 1024 },
} as const;

export type MediaClass = keyof typeof MEDIA_RULES;

export type UploadProblem = { code: 'type' | 'size' | 'empty'; limitMb?: number };

export function classify(contentType: string): MediaClass | null {
  for (const [cls, rule] of Object.entries(MEDIA_RULES) as [MediaClass, (typeof MEDIA_RULES)[MediaClass]][]) {
    if ((rule.types as readonly string[]).includes(contentType)) return cls;
  }
  return null;
}

export function checkUpload(file: { type: string; size: number }, allowed: MediaClass[]): UploadProblem | null {
  if (!file.size) return { code: 'empty' };
  const cls = classify(file.type);
  if (!cls || !allowed.includes(cls)) return { code: 'type' };
  const max = MEDIA_RULES[cls].maxBytes;
  if (file.size > max) return { code: 'size', limitMb: Math.round(max / 1024 / 1024) };
  return null;
}

export function acceptAttr(allowed: MediaClass[]): string {
  return allowed.flatMap((c) => MEDIA_RULES[c].types).join(',');
}

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'application/pdf': 'pdf',
};

/** `portfolio/projects/<id>/desktop-<time>-<rand>.webp`: unique, so replacing never overwrites a live URL. */
export function storagePathFor(folder: string, entityId: string, kind: string, contentType: string, now = Date.now()) {
  const safeId = entityId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64) || 'item';
  const rand = Math.random().toString(36).slice(2, 8);
  return `portfolio/${folder}/${safeId}/${kind}-${now}-${rand}.${EXT[contentType] ?? 'bin'}`;
}

/** Object path from a Firebase Storage download URL, or null for anything else. */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function add(set: Set<string>, url?: string | null, path?: string | null) {
  if (path) set.add(path);
  const fromUrl = storagePathFromUrl(url);
  if (fromUrl) set.add(fromUrl);
}

/** Legacy paths are never swept. New unique uploads only, with a grace period for open forms. */
export function isManagedMediaPath(path: string): boolean {
  return /^portfolio\/(projects|about|cv|hero|profile)\/[a-zA-Z0-9_-]+\/(?:[a-zA-Z0-9_-]+-\d{13}-[a-z0-9]{6}|import-[a-f0-9]{64})\.(png|jpg|webp|avif|gif|mp4|webm|pdf)$/.test(path);
}

export function isOrphanCandidate(path: string, updated: string, used: Set<string>, now = Date.now()): boolean {
  const time = Date.parse(updated);
  return isManagedMediaPath(path) && !used.has(path) && Number.isFinite(time) && now - time >= 86_400_000;
}

/** Every Storage object referenced anywhere in the content, drafts included. */
export function referencedStoragePaths(data: SiteData | null | undefined): Set<string> {
  const paths = new Set<string>();
  if (!data) return paths;
  for (const p of data.projects ?? []) {
    add(paths, p.image, p.imagePath);
    for (const m of p.media ?? []) add(paths, m.url, m.path);
  }
  for (const a of data.aboutEntries ?? []) add(paths, a.avatar?.imageUrl, a.avatar?.path);
  for (const f of data.cvFiles ?? []) add(paths, f.dataUrl, f.path);
  add(paths, data.homeHero?.icon?.imageUrl);
  add(paths, data.profile?.fieldPhoto?.url, data.profile?.fieldPhoto?.path);
  return paths;
}

/**
 * Objects that were referenced before a save and are not referenced after it.
 * Only paths under `portfolio/` are ever candidates for deletion.
 */
export function releasedStoragePaths(before: SiteData | null, after: SiteData | null): string[] {
  const still = referencedStoragePaths(after);
  return [...referencedStoragePaths(before)].filter((p) => p.startsWith('portfolio/') && !still.has(p));
}
