import type { MetadataRoute } from 'next';
import { getPortfolio } from '@/lib/content/get-portfolio';
import { OWNER } from '@/lib/content/portfolio';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getPortfolio();
  const base = OWNER.siteUrl;
  return [
    { url: base, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: 'monthly', priority: 0.8 },
    ...projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
