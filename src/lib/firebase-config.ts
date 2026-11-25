/**
 * Firebase settings shared by server and client code. No SDK import here, so public pages
 * can build REST URLs without pulling Firebase into their bundle.
 */

export const USE_EMULATORS = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === '1';

export const EMULATOR_HOSTS = {
  auth: process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099',
  storage: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199',
};

// Fail closed: an emulator flag must never send an SDK or REST request to production.
if (USE_EMULATORS) {
  const database = new URL(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'http://invalid');
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-portfolio' ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET !== 'demo-portfolio.appspot.com' ||
      database.origin !== 'http://127.0.0.1:9000' ||
      database.searchParams.get('ns') !== 'demo-portfolio-default-rtdb' ||
      EMULATOR_HOSTS.auth !== '127.0.0.1:9099' || EMULATOR_HOSTS.storage !== '127.0.0.1:9199') {
    throw new Error('UNSAFE_EMULATOR_CONFIGURATION');
  }
}

/**
 * REST URL for a Realtime Database path. Keeps query parameters from the configured URL,
 * so emulator URLs such as `http://127.0.0.1:9000/?ns=demo-portfolio-default-rtdb` work.
 */
export function databaseRestUrl(path: string, params: Record<string, string> = {}): string | null {
  const base = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim();
  if (!base) return null;
  try {
    const url = new URL(base);
    const clean = path.replace(/^\/+|\/+$/g, '');
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/${clean}.json`;
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    return url.toString();
  } catch {
    return null;
  }
}

/** Vercel exposes the deployment environment to the browser for Next.js projects. */
export const DEPLOY_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development');

/**
 * Preview deployments share production Firebase unless their environment variables say otherwise.
 * Writes from previews are refused in the UI unless explicitly allowed.
 */
export const PREVIEW_WRITES_BLOCKED =
  DEPLOY_ENV === 'preview' && process.env.NEXT_PUBLIC_ALLOW_PREVIEW_WRITES !== '1';
