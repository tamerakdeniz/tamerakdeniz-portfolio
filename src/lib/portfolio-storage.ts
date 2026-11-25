import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  type FirebaseStorage,
} from 'firebase/storage';
import { assertWritable, getFirebaseApp, getFirebaseAuth, getSiteDataOnce } from '@/lib/firebase';
import { EMULATOR_HOSTS, USE_EMULATORS } from '@/lib/firebase-config';
import { dataUrlToBlob, isInlineDataUrl } from '@/lib/media';
import { checkUpload, isManagedMediaPath, isOrphanCandidate, referencedStoragePaths, storagePathFor, type MediaClass, type UploadProblem } from '@/lib/media-policy';
import type { SiteData } from '@/types';

export type StorageFolder = 'projects' | 'about' | 'cv' | 'hero' | 'profile';

let storage: FirebaseStorage | null = null;

function getPortfolioStorage() {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
    if (USE_EMULATORS) {
      const [host, port] = EMULATOR_HOSTS.storage.split(':');
      connectStorageEmulator(storage, host, Number(port) || 9199);
    }
  }
  return storage;
}

function requireAdminAuth(): void {
  assertWritable();
  if (!getFirebaseAuth().currentUser) {
    throw new Error('AUTH_REQUIRED');
  }
}

export class UploadRejected extends Error {
  constructor(public problem: UploadProblem) {
    super(`UPLOAD_${problem.code.toUpperCase()}`);
  }
}

export interface UploadedFile {
  url: string;
  path: string;
  contentType: string;
  size: number;
}

/**
 * Uploads one file to a new, unique path. Nothing is overwritten, so a failed or abandoned
 * upload can never break a URL the site already uses; at worst it leaves an orphan that the
 * media audit in Settings can find.
 */
export async function uploadMedia(
  file: File,
  opts: { folder: StorageFolder; entityId: string; kind: string; allow: MediaClass[]; onProgress?: (fraction: number) => void; signal?: AbortSignal }
): Promise<UploadedFile> {
  requireAdminAuth();
  const problem = checkUpload(file, opts.allow);
  if (problem) throw new UploadRejected(problem);
  const path = storagePathFor(opts.folder, opts.entityId, opts.kind, file.type);
  const objectRef = ref(getPortfolioStorage(), path);
  const task = uploadBytesResumable(objectRef, file, {
    contentType: file.type,
    cacheControl: 'public, max-age=31536000, immutable',
  });
  const cancel = () => task.cancel();
  opts.signal?.addEventListener('abort', cancel, { once: true });
  if (opts.signal?.aborted) cancel();
  try { await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => opts.onProgress?.(snap.totalBytes ? snap.bytesTransferred / snap.totalBytes : 0),
      reject,
      () => resolve()
    );
  }); } finally { opts.signal?.removeEventListener('abort', cancel); }
  return { url: await getDownloadURL(objectRef), path, contentType: file.type, size: file.size };
}

/** Backwards-compatible single-image upload used by the older admin sections. */
export async function uploadPortfolioFile(file: File, folder: StorageFolder, entityId: string): Promise<string> {
  const allow: MediaClass[] = folder === 'cv' ? ['pdf'] : ['image'];
  return (await uploadMedia(file, { folder, entityId, kind: folder === 'cv' ? 'resume' : 'image', allow })).url;
}

/**
 * Deletes objects no longer referenced by `current`. Call only after the content write that
 * released them has succeeded. Paths still referenced anywhere (shared media) are skipped.
 * Returns the paths that could not be deleted; they stay as harmless orphans.
 */
export async function deleteReleasedMedia(paths: string[], current: SiteData | null): Promise<string[]> {
  if (!paths.length) return [];
  requireAdminAuth();
  if (!current) throw new Error('CONTENT_NOT_LOADED');
  const fresh = await getSiteDataOnce();
  if (!fresh) throw new Error('CONTENT_NOT_LOADED');
  const stillUsed = new Set([...referencedStoragePaths(current), ...referencedStoragePaths(fresh)]);
  const failed: string[] = [];
  for (const path of paths) {
    if (!isManagedMediaPath(path) || stillUsed.has(path)) continue;
    try {
      await deleteObject(ref(getPortfolioStorage(), path));
    } catch (error) {
      if ((error as { code?: string })?.code !== 'storage/object-not-found') failed.push(path);
    }
  }
  return failed;
}

export interface StoredObject {
  path: string;
  size: number;
  updated: string;
  url: string | null;
}

/** Objects under `portfolio/` that no content (published or draft) references. */
export async function findOrphanedMedia(): Promise<StoredObject[]> {
  requireAdminAuth();
  const current = await getSiteDataOnce();
  if (!current) throw new Error('CONTENT_NOT_LOADED');
  const used = referencedStoragePaths(current);
  const paths: string[] = [];
  const walk = async (prefix: string) => {
    const res = await listAll(ref(getPortfolioStorage(), prefix));
    for (const item of res.items) paths.push(item.fullPath);
    for (const folder of res.prefixes) await walk(folder.fullPath);
  };
  await walk('portfolio');
  const orphans = paths.filter((p) => isManagedMediaPath(p) && !used.has(p));
  const objects = await Promise.all(
    orphans.map(async (path) => {
      const objectRef = ref(getPortfolioStorage(), path);
      const meta = await getMetadata(objectRef);
      return { path, size: meta.size, updated: meta.updated, url: await getDownloadURL(objectRef) };
    })
  );
  return objects.filter((object) => isOrphanCandidate(object.path, object.updated, used));
}

export async function deleteOrphanedMedia(paths: string[]): Promise<string[]> {
  // Re-scan on confirmation. Any failed listing or metadata request aborts before deletion.
  const eligible = new Set((await findOrphanedMedia()).map((o) => o.path));
  const current = await getSiteDataOnce();
  const selected = paths.filter((p) => eligible.has(p));
  return [...paths.filter((p) => !eligible.has(p)), ...await deleteReleasedMedia(selected, current)];
}

export async function uploadDataUrlToStorage(
  dataUrl: string,
  folder: StorageFolder,
  entityId: string,
  filenameHint: string
): Promise<string> {
  requireAdminAuth();
  const { blob, contentType } = dataUrlToBlob(dataUrl);
  const problem = checkUpload({ type: contentType, size: blob.size }, folder === 'cv' ? ['pdf'] : ['image']);
  if (problem) throw new UploadRejected(problem);
  const path = storagePathFor(folder, entityId, filenameHint, contentType);
  const storageRef = ref(getPortfolioStorage(), path);
  await uploadBytes(storageRef, blob, { contentType });
  return getDownloadURL(storageRef);
}

export function countInlineMedia(data: SiteData): number {
  let n = 0;
  for (const p of data.projects || []) {
    if (isInlineDataUrl(p.image)) n++;
  }
  for (const e of data.aboutEntries || []) {
    if (isInlineDataUrl(e.avatar?.imageUrl)) n++;
  }
  for (const f of data.cvFiles || []) {
    if (isInlineDataUrl(f.dataUrl)) n++;
  }
  if (isInlineDataUrl(data.homeHero?.icon?.imageUrl)) n++;
  return n;
}

/** Move legacy base64 fields in RTDB to Firebase Storage URLs. */
export async function migrateSiteDataMedia(
  data: SiteData,
  onProgress?: (message: string) => void
): Promise<SiteData> {
  requireAdminAuth();
  const next: SiteData = structuredClone(data);

  for (const project of next.projects) {
    if (!isInlineDataUrl(project.image)) continue;
    onProgress?.(project.title?.en || project.title?.tr || project.id);
    project.image = await uploadDataUrlToStorage(project.image, 'projects', project.id, 'cover');
  }

  next.aboutEntries ??= [];
  for (const entry of next.aboutEntries) {
    if (!isInlineDataUrl(entry.avatar?.imageUrl)) continue;
    onProgress?.(entry.title?.en || entry.id);
    entry.avatar = {
      ...entry.avatar,
      imageUrl: await uploadDataUrlToStorage(entry.avatar.imageUrl, 'about', entry.id, 'avatar'),
    };
  }

  next.cvFiles ??= [];
  for (const file of next.cvFiles) {
    if (!isInlineDataUrl(file.dataUrl)) continue;
    onProgress?.(file.name || file.id);
    file.dataUrl = await uploadDataUrlToStorage(file.dataUrl, 'cv', file.id, 'resume');
  }

  if (data.homeHero?.icon && isInlineDataUrl(data.homeHero.icon.imageUrl)) {
    onProgress?.('home icon');
    const imageUrl = await uploadDataUrlToStorage(data.homeHero.icon.imageUrl, 'hero', 'icon', 'icon');
    next.homeHero = { ...data.homeHero, icon: { ...data.homeHero.icon, imageUrl } };
  }

  return next;
}
