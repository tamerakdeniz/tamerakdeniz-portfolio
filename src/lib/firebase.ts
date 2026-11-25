import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  connectDatabaseEmulator,
  ref,
  set,
  update,
  onValue,
  get,
  type Database,
} from 'firebase/database';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { isInlineDataUrl } from '@/lib/media';
import { EMULATOR_HOSTS, PREVIEW_WRITES_BLOCKED, USE_EMULATORS } from '@/lib/firebase-config';
import { mergeDrafts, splitDrafts, type SiteDrafts } from '@/lib/content/drafts';
import type { SiteData } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

let app: FirebaseApp;
let database: Database;
let auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export function getFirebaseDatabase(): Database {
  if (!database) {
    database = getDatabase(getFirebaseApp());
    if (USE_EMULATORS) {
      const url = new URL(firebaseConfig.databaseURL);
      connectDatabaseEmulator(database, url.hostname, Number(url.port) || 9000);
    }
  }
  return database;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    if (USE_EMULATORS) connectAuthEmulator(auth, `http://${EMULATOR_HOSTS.auth}`, { disableWarnings: true });
  }
  return auth;
}

/** Admin access is a custom claim (`admin: true`) set with scripts/grant-admin.mjs; the rules check the same claim. */
export async function isAdminUser(user: User | null, forceRefresh = false): Promise<boolean> {
  if (!user) return false;
  const result = await user.getIdTokenResult(forceRefresh);
  return result.claims.admin === true;
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<User> {
  const authInstance = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(
    authInstance,
    email,
    password
  );
  return credential.user;
}

export async function logoutAdmin(): Promise<void> {
  const authInstance = getFirebaseAuth();
  await signOut(authInstance);
}

export function onAuthChange(callback: (user: User | null) => void) {
  const authInstance = getFirebaseAuth();
  return onAuthStateChanged(authInstance, callback);
}

/**
 * Whether the editor currently holds both `siteData` and `siteDrafts`. Saving rewrites both
 * nodes, so a save without the drafts loaded would delete them.
 */
let contentComplete = false;

/**
 * Admin view of the content: public `siteData` merged with the admin-only `siteDrafts`.
 * Emits only once both nodes have arrived; if either cannot be read, reports an error and
 * saving stays blocked.
 */
export function subscribeToSiteData(
  onData: (data: unknown) => void,
  onError?: (error: Error) => void
) {
  const db = getFirebaseDatabase();
  let publicData: SiteData | null = null;
  let drafts: SiteDrafts | null = null;
  let gotPublic = false;
  let gotDrafts = false;
  contentComplete = false;
  const emit = () => {
    if (!gotPublic || !gotDrafts) return;
    contentComplete = true;
    onData(mergeDrafts(publicData, drafts));
  };
  const fail = (error: Error) => {
    contentComplete = false;
    console.error('Firebase subscription error:', error);
    onError?.(error);
  };
  const offPublic = onValue(
    ref(db, 'siteData'),
    (snapshot) => {
      publicData = snapshot.val();
      gotPublic = true;
      emit();
    },
    fail
  );
  const offDrafts = onValue(
    ref(db, 'siteDrafts'),
    (snapshot) => {
      drafts = snapshot.val();
      gotDrafts = true;
      emit();
    },
    fail
  );
  return () => {
    contentComplete = false;
    offPublic();
    offDrafts();
  };
}

export async function getSiteDataOnce() {
  const db = getFirebaseDatabase();
  const [pub, drafts] = await Promise.all([get(ref(db, 'siteData')), get(ref(db, 'siteDrafts'))]);
  return mergeDrafts(pub.val(), drafts.val());
}

/** Strip legacy base64 so RTDB stays small; media must live in Firebase Storage. */
export function stripInlineMediaFromSiteData(data: SiteData): SiteData {
  return {
    ...data,
    projects: (data.projects || []).map((p) => ({
      ...p,
      image: isInlineDataUrl(p.image) ? '' : p.image,
    })),
    aboutEntries: (data.aboutEntries || []).map((e) => ({
      ...e,
      avatar: {
        ...e.avatar,
        imageUrl: isInlineDataUrl(e.avatar?.imageUrl) ? '' : e.avatar?.imageUrl || '',
      },
    })),
    cvFiles: (data.cvFiles || []).map((f) => ({
      ...f,
      dataUrl: isInlineDataUrl(f.dataUrl) ? '' : f.dataUrl,
    })),
    homeHero: data.homeHero
      ? {
          ...data.homeHero,
          icon: data.homeHero.icon
            ? {
                ...data.homeHero.icon,
                imageUrl: isInlineDataUrl(data.homeHero.icon.imageUrl)
                  ? ''
                  : data.homeHero.icon.imageUrl || '',
              }
            : data.homeHero.icon,
        }
      : data.homeHero,
  };
}

/**
 * Saves the merged admin view: published items to the public `siteData`, unpublished ones to
 * `siteDrafts`, in one atomic multi-path update, then asks the site to refresh its cache.
 */
export async function saveSiteData(data: unknown) {
  assertWritable();
  if (!contentComplete) throw new Error('CONTENT_NOT_LOADED');
  const db = getFirebaseDatabase();
  const { publicData, drafts } = splitDrafts(stripInlineMediaFromSiteData(data as SiteData));
  /* JSON round-trip drops `undefined`, which the SDK rejects, from optional form fields. */
  await update(ref(db), JSON.parse(JSON.stringify({ siteData: publicData, siteDrafts: drafts })));
  void requestRevalidation();
}

export function assertWritable() {
  if (PREVIEW_WRITES_BLOCKED) throw new Error('PREVIEW_READ_ONLY');
}

/**
 * Tells the Next.js server to drop its cached content. Pages refresh on their own within
 * 60 seconds anyway; this only makes the change visible on the next request.
 */
export async function requestRevalidation(): Promise<boolean> {
  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return false;
    const token = await user.getIdToken();
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveFirebaseData(path: string, data: unknown) {
  assertWritable();
  const db = getFirebaseDatabase();
  const dataRef = ref(db, path);
  await set(dataRef, data);
  if (path === 'siteData' || path.startsWith('siteData/')) void requestRevalidation();
}

export interface ActivityEntry {
  id: string;
  type: 'login' | 'logout' | 'add' | 'edit' | 'delete' | 'contact' | 'reorder' | 'info';
  message: string;
  timestamp: string;
}

const ACTIVITY_STORAGE_KEY = 'admin_activity_log';
const MAX_LOG_ENTRIES = 100;

function getLocalActivityLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalActivityLog(entries: ActivityEntry[]) {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_LOG_ENTRIES)));
  } catch { /* quota */ }
}

export function getActivityLog(): ActivityEntry[] {
  return getLocalActivityLog();
}

export function logActivity(
  type: ActivityEntry['type'],
  message: string
) {
  const entry: ActivityEntry = {
    id: Date.now().toString(),
    type,
    message,
    timestamp: new Date().toISOString(),
  };

  const existing = getLocalActivityLog();
  saveLocalActivityLog([entry, ...existing]);

  try {
    assertWritable();
    const db = getFirebaseDatabase();
    set(ref(db, `activityLog/${entry.id}`), entry).catch(() => {});
  } catch { /* offline */ }
}

export { ref, onValue, get, set, update };
