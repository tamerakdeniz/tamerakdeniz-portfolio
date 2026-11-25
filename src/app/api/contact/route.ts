import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { readBoundedJson } from '@/lib/request-body';
import { ActionDenied, guardPublicAction } from '@/lib/public-action-guard';
import { boundedDatabase, getServerDatabase } from '@/lib/server-database';

export const maxDuration = 30;
const respond = (body: object, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '600' } : {}) } });
export async function POST(request: Request) {
  let parsed: unknown;
  try { parsed = await readBoundedJson(request, 24_000); }
  catch (error) {
    return error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE'
      ? respond({ error: 'payload_too_large' }, 413) : respond({ error: 'invalid_request' }, 400);
  }
  try {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return respond({ error: 'invalid_request' }, 400);
    const data = parsed as Record<string, unknown>;
    const fields: Record<string, string> = {};
    for (const [key, limit] of Object.entries({ name: 120, email: 200, subject: 200, message: 5000 })) {
      const value = data[key];
      if (typeof value !== 'string' || !value.trim() || value.length > limit) return respond({ error: 'invalid_request' }, 400);
      fields[key] = value.trim();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return respond({ error: 'invalid_request' }, 400);
    await guardPublicAction(request, data.challengeToken, 'contact');
    const id = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    await boundedDatabase(getServerDatabase().ref(`contactSubmissions/${id}`).set({ ...fields, id, read: false, timestamp: new Date().toISOString(), createdAt: { '.sv': 'timestamp' } }));
    return respond({ ok: true }, 200);
  } catch (error) {
    if (error instanceof ActionDenied) return respond({ error: error.message }, error.status);
    return respond({ error: 'service_unavailable' }, 503);
  }
}
