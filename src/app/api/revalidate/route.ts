import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { SITE_DATA_TAG } from '@/lib/content/site-data';

export const dynamic = 'force-dynamic';

/**
 * Called by the admin panel after a successful save. Expires the cached `siteData` read and
 * every rendered page, so the next request renders the new content. Admin-only: the caller's
 * Firebase ID token must carry the `admin` claim.
 */
export async function POST(req: NextRequest) {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const check = await verifyAdminToken(token);
  if (!check.ok) {
    return NextResponse.json({ error: 'unauthorized' }, { status: check.status });
  }
  revalidateTag(SITE_DATA_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
}
