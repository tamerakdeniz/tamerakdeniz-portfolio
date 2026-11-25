import { USE_EMULATORS } from '@/lib/firebase-config';
function isFirebaseStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (USE_EMULATORS && parsed.origin === 'http://127.0.0.1:9199') return true;
    const host = parsed.hostname;
    return (
      host === 'firebasestorage.googleapis.com' ||
      host.endsWith('.firebasestorage.app') ||
      host === 'storage.googleapis.com'
    );
  } catch {
    return false;
  }
}

function safePdfName(fileName: string): string {
  return fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
}

/** Same-origin URL — server fetches Storage and returns Content-Disposition: attachment */
export function getCvDownloadHref(fileUrl: string, fileName: string): string {
  const safeName = safePdfName(fileName);
  if (fileUrl.startsWith('/')) return fileUrl;
  if (isFirebaseStorageUrl(fileUrl)) {
    const params = new URLSearchParams({ url: fileUrl, name: safeName });
    return `/api/download-cv?${params.toString()}`;
  }
  return fileUrl;
}
