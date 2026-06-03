/** Inline base64/data URLs embedded in RTDB (legacy). Prefer Firebase Storage HTTPS URLs. */

export function isInlineDataUrl(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.startsWith('data:');
}

export function isFirebaseStorageUrl(value: string | undefined | null): boolean {
  if (!value) return false;
  return (
    value.includes('firebasestorage.googleapis.com') ||
    value.includes('firebasestorage.app')
  );
}

export function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const comma = dataUrl.indexOf(',');
  if (comma === -1) throw new Error('Invalid data URL');
  const header = dataUrl.slice(0, comma);
  const base64 = dataUrl.slice(comma + 1);
  const mimeMatch = header.match(/data:([^;]+)/);
  const contentType = mimeMatch?.[1] || 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

export function extensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
  };
  return map[contentType] || contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'bin';
}
