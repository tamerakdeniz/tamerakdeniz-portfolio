import 'server-only';
import { createHmac } from 'node:crypto';
import { getClientIp } from './chat-rate-limit';
import { PREVIEW_WRITES_BLOCKED, USE_EMULATORS } from './firebase-config';
import { boundedDatabase, getServerDatabase } from './server-database';

export type PublicAction = 'contact' | 'chat';
export const ACTION_LIMITS = {
  contact: { daily: 50, perClientDaily: 5, windowMs: 600_000, perWindow: 2 },
  chat: { daily: 100, perClientDaily: 20, windowMs: 60_000, perWindow: 5 },
};
type Client = { total: number; window: number; count: number };
type State = { day: number; total: number; clients: Record<string, Client> };

/** Pure transition used by a server-side RTDB transaction: one global cap across instances. */
export function reserveAction(current: State | null, key: string, action: PublicAction, now: number): State | undefined {
  const limit = ACTION_LIMITS[action];
  const day = Math.floor(now / 86_400_000);
  const state: State = current?.day === day ? structuredClone(current) : { day, total: 0, clients: {} };
  state.clients ??= {};
  const window = Math.floor(now / limit.windowMs);
  const client = state.clients[key] ?? { total: 0, window, count: 0 };
  if (client.window !== window) { client.window = window; client.count = 0; }
  if (state.total >= limit.daily || client.total >= limit.perClientDaily || client.count >= limit.perWindow) return;
  state.total++; client.total++; client.count++;
  state.clients[key] = client;
  return state;
}

export class ActionDenied extends Error {
  status: number;
  constructor(status: number) { super(status === 429 ? 'rate_limit' : status === 403 ? 'verification_required' : 'service_unavailable'); this.status = status; }
}

export function publicActionsEnabled() {
  return !PREVIEW_WRITES_BLOCKED && process.env.PORTFOLIO_PUBLIC_ACTIONS_ENABLED === '1';
}

export async function verifyChallenge(token: unknown, action: PublicAction): Promise<void> {
  if (USE_EMULATORS && token === 'emulator-test-token') return;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || '').split(',').map((h) => h.trim()).filter(Boolean);
  if (!secret || !hosts.length || !process.env.PUBLIC_ACTION_IP_HASH_KEY) throw new ActionDenied(503);
  if (typeof token !== 'string' || !token || token.length > 2048) throw new ActionDenied(403);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, response: token }),
    signal: AbortSignal.timeout(5000), cache: 'no-store',
  });
  if (!response.ok) throw new ActionDenied(503);
  const result = await response.json();
  if (!result.success || result.action !== action || !hosts.includes(result.hostname)) throw new ActionDenied(403);
}

export async function guardPublicAction(request: Request, token: unknown, action: PublicAction) {
  if (!publicActionsEnabled()) throw new ActionDenied(503);
  await verifyChallenge(token, action);
  // Vercel supplies this header at its trusted ingress. Other deployments share the unknown
  // bucket until their proxy trust model is configured; user-supplied X-Forwarded-For is ignored.
  const ip = getClientIp(request);
  const secret = USE_EMULATORS ? 'local-demo-only' : process.env.PUBLIC_ACTION_IP_HASH_KEY;
  if (!secret) throw new ActionDenied(503);
  const key = createHmac('sha256', secret).update(`${Math.floor(Date.now() / 86_400_000)}:${ip}`).digest('hex');
  const outcome = await boundedDatabase(getServerDatabase().ref(`_serverLimits/${action}`).transaction((state) => reserveAction(state, key, action, Date.now()), undefined, false));
  if (!outcome.committed) throw new ActionDenied(429);
}
