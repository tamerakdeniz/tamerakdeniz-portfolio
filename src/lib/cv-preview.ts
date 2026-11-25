function isSameOriginPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

/**
 * URL the in-page renderer may fetch.
 * A root-relative CV is already same-origin. A registered remote CV uses the
 * existing download route, which only serves files listed in public site data.
 * Anything else is refused so the viewer never becomes an open URL proxy.
 */
export function cvPreviewSrc(viewUrl: string, downloadUrl: string): string {
  if (isSameOriginPath(viewUrl)) return viewUrl;
  if (isSameOriginPath(downloadUrl)) return downloadUrl;
  return '';
}
