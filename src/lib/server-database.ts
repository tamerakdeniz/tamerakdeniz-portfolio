import 'server-only';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { SNAPSHOT_PREVIEW, USE_EMULATORS } from './firebase-config';

/** Dedicated server app; database rules constrain its overridden identity to intake/quotas. */
export function getServerDatabase() {
  if (SNAPSHOT_PREVIEW) throw new Error('SNAPSHOT_READ_ONLY');
  const name = 'portfolio-intake';
  let app = getApps().find((a) => a.name === name);
  if (!app) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!projectId || !databaseURL) throw new Error('SERVER_DATABASE_NOT_CONFIGURED');
    if (USE_EMULATORS && process.env.FIREBASE_DATABASE_EMULATOR_HOST !== '127.0.0.1:9000') throw new Error('UNSAFE_EMULATOR_CONFIGURATION');
    if (!USE_EMULATORS) {
      const url = new URL(databaseURL);
      if (process.env.FIREBASE_DATABASE_EMULATOR_HOST || url.protocol !== 'https:' || !/^[a-z][a-z0-9-]+$/.test(projectId) || !new RegExp(`^${projectId}(-default-rtdb)?(?:\\.[a-z0-9-]+)?\\.(firebaseio\\.com|firebasedatabase\\.app)$`).test(url.hostname)) throw new Error('SERVER_DATABASE_TARGET_MISMATCH');
    }
    const credentials = USE_EMULATORS ? null : JSON.parse(process.env.FIREBASE_SERVER_CREDENTIALS_JSON || 'null');
    if (!USE_EMULATORS && credentials?.project_id !== projectId) throw new Error('SERVER_CREDENTIAL_PROJECT_MISMATCH');
    app = initializeApp({ projectId, databaseURL,
      credential: USE_EMULATORS ? { getAccessToken: async () => ({ access_token: 'owner', expires_in: 3600 }) } : cert(credentials),
      databaseAuthVariableOverride: { uid: 'portfolio-intake-server' },
    }, name);
  }
  return getDatabase(app);
}

export async function boundedDatabase<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try { return await Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), 6000); })]); }
  finally { clearTimeout(timer!); }
}
