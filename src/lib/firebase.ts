import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  onValue,
  get,
  type Database,
} from 'firebase/database';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { isInlineDataUrl } from '@/lib/media';
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
  }
  return database;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
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

export function subscribeToSiteData(
  onData: (data: unknown) => void,
  onError?: (error: Error) => void
) {
  const db = getFirebaseDatabase();
  const siteDataRef = ref(db, 'siteData');
  return onValue(
    siteDataRef,
    (snapshot) => {
      onData(snapshot.val());
    },
    (error) => {
      console.error('Firebase subscription error:', error);
      onError?.(error);
    }
  );
}

export async function getSiteDataOnce() {
  const db = getFirebaseDatabase();
  const siteDataRef = ref(db, 'siteData');
  const snapshot = await get(siteDataRef);
  return snapshot.val();
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

export async function saveSiteData(data: unknown) {
  const db = getFirebaseDatabase();
  const siteDataRef = ref(db, 'siteData');
  const cleaned = stripInlineMediaFromSiteData(data as SiteData);
  await set(siteDataRef, cleaned);
}

export async function saveFirebaseData(path: string, data: unknown) {
  const db = getFirebaseDatabase();
  const dataRef = ref(db, path);
  await set(dataRef, data);
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
    const db = getFirebaseDatabase();
    set(ref(db, `activityLog/${entry.id}`), entry).catch(() => {});
  } catch { /* offline */ }
}

export { ref, onValue, get, set };
