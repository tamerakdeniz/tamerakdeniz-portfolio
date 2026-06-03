import type { SiteData } from '@/types';

/** Strip media URLs from chat API payload to save tokens and avoid large bodies. */
export function compactSiteDataForChat(siteData: SiteData): Record<string, unknown> {
  return {
    homeHero: siteData.homeHero,
    aboutEntries: siteData.aboutEntries?.map((e) => ({
      title: e.title,
      content: e.content,
    })),
    contactInfo: siteData.contactInfo,
    availability: siteData.availability,
    projects: siteData.projects?.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      techStack: p.techStack,
      published: p.published,
      githubUrl: p.githubUrl,
      demoUrl: p.demoUrl,
      liveUrl: p.liveUrl,
    })),
    skills: siteData.skills,
    timeline: siteData.timeline,
  };
}
