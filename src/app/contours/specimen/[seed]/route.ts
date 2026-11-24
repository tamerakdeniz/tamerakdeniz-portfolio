import { specimenSvg } from '@/lib/contours';

export async function GET(_req: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  const value = Number.parseInt(seed, 10);
  if (!Number.isFinite(value) || value < 0 || value > 0xffffffff) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(specimenSvg(value), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
