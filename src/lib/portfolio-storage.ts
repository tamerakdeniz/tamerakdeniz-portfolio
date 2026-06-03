import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseApp, getFirebaseAuth } from '@/lib/firebase';
import {
  dataUrlToBlob,
  extensionFromContentType,
  isInlineDataUrl,
} from '@/lib/media';
import type { SiteData } from '@/types';

export type StorageFolder = 'projects' | 'about' | 'cv' | 'hero';

function getPortfolioStorage() {
  return getStorage(getFirebaseApp());
}

function requireAdminAuth(): void {
  if (!getFirebaseAuth().currentUser) {
    throw new Error('AUTH_REQUIRED');
  }
}

function extensionFromFile(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  return extensionFromContentType(file.type);
}

export async function uploadPortfolioFile(
  file: File,
  folder: StorageFolder,
  entityId: string
): Promise<string> {
  requireAdminAuth();
  const ext = extensionFromFile(file);
  const path = `portfolio/${folder}/${entityId}/${Date.now()}.${ext}`;
  const storageRef = ref(getPortfolioStorage(), path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function uploadDataUrlToStorage(
  dataUrl: string,
  folder: StorageFolder,
  entityId: string,
  filenameHint: string
): Promise<string> {
  requireAdminAuth();
  const { blob, contentType } = dataUrlToBlob(dataUrl);
  const ext = extensionFromContentType(contentType);
  const path = `portfolio/${folder}/${entityId}/${filenameHint}.${ext}`;
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
  const next: SiteData = { ...data, projects: [...(data.projects || [])] };

  for (const project of next.projects) {
    if (!isInlineDataUrl(project.image)) continue;
    onProgress?.(project.title?.en || project.title?.tr || project.id);
    project.image = await uploadDataUrlToStorage(
      project.image,
      'projects',
      project.id,
      'cover'
    );
  }

  next.aboutEntries = [...(data.aboutEntries || [])];
  for (const entry of next.aboutEntries) {
    if (!isInlineDataUrl(entry.avatar?.imageUrl)) continue;
    onProgress?.(entry.title?.en || entry.id);
    entry.avatar = {
      ...entry.avatar,
      imageUrl: await uploadDataUrlToStorage(
        entry.avatar.imageUrl,
        'about',
        entry.id,
        'avatar'
      ),
    };
  }

  next.cvFiles = [...(data.cvFiles || [])];
  for (const file of next.cvFiles) {
    if (!isInlineDataUrl(file.dataUrl)) continue;
    onProgress?.(file.name || file.id);
    file.dataUrl = await uploadDataUrlToStorage(
      file.dataUrl,
      'cv',
      file.id,
      'resume'
    );
  }

  if (data.homeHero?.icon && isInlineDataUrl(data.homeHero.icon.imageUrl)) {
    onProgress?.('home icon');
    const imageUrl = await uploadDataUrlToStorage(
      data.homeHero.icon.imageUrl,
      'hero',
      'icon',
      'icon'
    );
    next.homeHero = {
      ...data.homeHero,
      icon: { ...data.homeHero.icon, imageUrl },
    };
  }

  return next;
}
