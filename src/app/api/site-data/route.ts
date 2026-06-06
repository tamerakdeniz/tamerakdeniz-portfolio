import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { error: 'Firebase database URL is not configured.' },
      { status: 503 }
    );
  }

  try {
    const url = `${databaseUrl.replace(/\/+$/, '')}/siteData.json`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch site data.' },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data) {
      return NextResponse.json({ error: 'No site data found.' }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch site data.' },
      { status: 502 }
    );
  }
}
