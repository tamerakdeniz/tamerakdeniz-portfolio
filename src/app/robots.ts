import type { MetadataRoute } from 'next';
import { OWNER } from '@/lib/content/portfolio';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${OWNER.siteUrl}/sitemap.xml`,
  };
}
