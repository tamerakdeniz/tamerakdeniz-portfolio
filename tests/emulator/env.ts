// Shared helpers for tests that run inside `firebase emulators:exec` (see npm run test:emulator).
// The `demo-` project id guarantees the emulators never reach a real Firebase project.

export const PROJECT_ID = 'demo-portfolio';
export const DB_NS = `${PROJECT_ID}-default-rtdb`;
export const BUCKET = `${PROJECT_ID}.appspot.com`;
export const DB = process.env.FIREBASE_DATABASE_EMULATOR_HOST ?? '127.0.0.1:9000';
export const STORAGE = process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? '127.0.0.1:9199';
export const AUTH = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';

if (DB !== '127.0.0.1:9000' || STORAGE !== '127.0.0.1:9199' || AUTH !== '127.0.0.1:9099') throw new Error('Tests only support fixed loopback emulator hosts');

const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

/** Unsigned ID token; the emulators accept these, production never does. */
export function fakeToken(uid: string, claims: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000);
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    aud: PROJECT_ID,
    auth_time: now,
    iat: now,
    exp: now + 3600,
    sub: uid,
    user_id: uid,
    email: `${uid}@example.test`,
    email_verified: true,
    firebase: { identities: {}, sign_in_provider: 'password' },
    ...claims,
  })}.`;
}

export const ADMIN = fakeToken('admin-1', { admin: true });
export const USER = fakeToken('stranger-1');

type Auth = string | 'owner' | null;

function authHeader(auth: Auth): Record<string, string> {
  return auth ? { Authorization: `Bearer ${auth}` } : {};
}

/** RTDB REST: `owner` bypasses rules; ID tokens go in `?auth=` (a Bearer header would mean a service account). */
export async function db(method: string, path: string, body?: unknown, auth: Auth = null) {
  const query = new URLSearchParams({ ns: DB_NS });
  if (auth && auth !== 'owner') query.set('auth', auth);
  const res = await fetch(`http://${DB}/${path.replace(/^\//, '')}.json?${query}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth === 'owner' ? authHeader(auth) : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

export async function resetDb() {
  await db('PUT', '', null, 'owner');
}

/** Multipart upload with explicit metadata, the same shape the Firebase SDK sends. */
export async function upload(path: string, bytes: Uint8Array, contentType: string, auth: Auth) {
  const boundary = `b${Date.now()}`;
  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify({ name: path, contentType }) +
      `\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--`);
  const res = await fetch(`http://${STORAGE}/v0/b/${BUCKET}/o?name=${encodeURIComponent(path)}`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'X-Goog-Upload-Protocol': 'multipart',
      ...authHeader(auth),
    },
    body: Buffer.concat([head, Buffer.from(bytes), tail]),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function removeObject(path: string, auth: Auth) {
  const res = await fetch(`http://${STORAGE}/v0/b/${BUCKET}/o/${encodeURIComponent(path)}`, {
    method: 'DELETE',
    headers: authHeader(auth),
  });
  return res.status;
}

export async function getObject(path: string, auth: Auth = null) {
  const res = await fetch(`http://${STORAGE}/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media`, {
    headers: authHeader(auth),
  });
  return res.status;
}

/** 1×1 PNG. */
export const PNG = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  )
);
