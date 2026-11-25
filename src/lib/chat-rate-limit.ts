import { isIP } from 'node:net';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** In-memory limiter (per server instance). Stops burst traffic before Gemini quota. */
export function checkChatRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  if (buckets.size >= 10_000) {
    for (const [id, value] of buckets) if (now >= value.resetAt) buckets.delete(id);
    if (!buckets.has(key) && buckets.size >= 10_000) return { ok: false, retryAfterSec: 60 };
  }
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  if (bucket.count >= maxRequests) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Only Vercel's ingress-owned header may distinguish clients; other hosts share a bucket. */
export function getClientIp(req: Request, vercelIngress = process.env.VERCEL === '1'): string {
  const forwarded = vercelIngress ? req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : null;
  return forwarded && isIP(forwarded) ? forwarded : 'unknown';
}
