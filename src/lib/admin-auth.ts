import 'server-only';
import { EMULATOR_HOSTS, USE_EMULATORS, SNAPSHOT_PREVIEW } from '@/lib/firebase-config';

/**
 * Verifies a Firebase ID token by asking the Identity Toolkit who it belongs to, then checks the
 * `admin` custom claim. Uses only the public web API key: no service-account secret on the server.
 * An expired, revoked or forged token is rejected by Google, not by this code.
 */
export async function verifyAdminToken(idToken: string): Promise<{ ok: true; uid: string } | { ok: false; status: number }> {
  if (SNAPSHOT_PREVIEW) return { ok: false, status: 403 };
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || !idToken || idToken.length > 4096) return { ok: false, status: 401 };
  const origin = USE_EMULATORS
    ? `http://${EMULATOR_HOSTS.auth}/identitytoolkit.googleapis.com`
    : 'https://identitytoolkit.googleapis.com';
  try {
    const res = await fetch(`${origin}/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, status: 401 };
    const data = (await res.json()) as { users?: { localId: string; disabled?: boolean; customAttributes?: string }[] };
    const user = data.users?.[0];
    if (!user || user.disabled) return { ok: false, status: 401 };
    const claims = user.customAttributes ? (JSON.parse(user.customAttributes) as Record<string, unknown>) : {};
    return claims.admin === true ? { ok: true, uid: user.localId } : { ok: false, status: 403 };
  } catch {
    return { ok: false, status: 503 };
  }
}
