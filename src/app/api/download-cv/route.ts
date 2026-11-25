import { NextRequest, NextResponse } from 'next/server';
import { getSiteData } from '@/lib/content/site-data';
import { USE_EMULATORS } from '@/lib/firebase-config';

const MAX_PDF_BYTES = 15 * 1024 * 1024;
function allowedOrigin(value: string) {
  try {
    const url = new URL(value);
    if (USE_EMULATORS && url.origin === 'http://127.0.0.1:9199' && url.pathname.startsWith('/v0/b/demo-portfolio.appspot.com/o/')) return true;
    return url.protocol === 'https:' && ['firebasestorage.googleapis.com', 'storage.googleapis.com'].includes(url.hostname);
  } catch { return false; }
}

/** Proxy only registered public CVs; never act as an arbitrary Storage download relay. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url || !allowedOrigin(url)) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  const data = await getSiteData();
  const file = Object.values(data?.cvFiles ?? {}).find((file) => file.dataUrl === url);
  if (!file) return NextResponse.json({ error: 'Unknown CV' }, { status: 404 });
  try {
    const upstream = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(10_000) });
    if (!upstream.ok || !upstream.body) return NextResponse.json({ error: 'Download unavailable' }, { status: 502 });
    if (Number(upstream.headers.get('content-length')) > MAX_PDF_BYTES) { await upstream.body.cancel(); return NextResponse.json({ error: 'File too large' }, { status: 413 }); }
    const reader = upstream.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_PDF_BYTES) { await reader.cancel(); return NextResponse.json({ error: 'File too large' }, { status: 413 }); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') return NextResponse.json({ error: 'Invalid PDF' }, { status: 502 });
    const name = (file.name || 'resume.pdf').replace(/[^\w.\-() ]+/g, '_').slice(0, 150);
    return new NextResponse(bytes, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return NextResponse.json({ error: 'Download failed' }, { status: 502 }); }
}
