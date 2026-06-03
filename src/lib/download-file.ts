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

function cvProxyDownloadUrl(storageUrl: string, fileName: string): string {
  const params = new URLSearchParams({
    url: storageUrl,
    name: fileName,
  });
  return `/api/download-cv?${params.toString()}`;
}

/** Trigger a file download; Firebase Storage uses same-origin API proxy (no CORS). */
export async function downloadFile(url: string, fileName: string): Promise<void> {
  const safeName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const fetchUrl = isFirebaseStorageUrl(url) ? cvProxyDownloadUrl(url, safeName) : url;

  if (fetchUrl.startsWith('/') && typeof window !== 'undefined') {
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const res = await fetch(fetchUrl);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
