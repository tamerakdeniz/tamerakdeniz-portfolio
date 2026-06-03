import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
];

function isAllowedCvUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith('.firebasestorage.app')
    );
  } catch {
    return false;
  }
}

function safeFilename(name: string): string {
  const base = name.replace(/[^\w.\-() ]+/g, '_').trim() || 'resume';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const name = req.nextUrl.searchParams.get('name') || 'resume.pdf';

  if (!url || !isAllowedCvUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream fetch failed' },
        { status: upstream.status }
      );
    }

    const buffer = await upstream.arrayBuffer();
    const filename = safeFilename(name);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
