function isFirebaseStorageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host.includes('firebasestorage.googleapis.com') ||
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
