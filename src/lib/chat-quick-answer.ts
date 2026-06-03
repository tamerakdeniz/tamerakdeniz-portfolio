import type { SiteData, Project } from '@/types';

function loc(
  obj: { en: string; tr: string } | undefined,
  lang: 'en' | 'tr'
): string {
  if (!obj) return '';
  return obj[lang] || obj.en || obj.tr || '';
}

function publishedProjects(siteData: SiteData): Project[] {
  return (siteData.projects || []).filter((p) => p.published);
}

function projectCategories(p: Project): string[] {
  if (Array.isArray(p.category)) return p.category;
  return p.category ? [p.category] : [];
}

function formatProjectList(projects: Project[], lang: 'en' | 'tr'): string {
  if (projects.length === 0) {
    return lang === 'tr'
      ? 'Yayınlanmış proje bulunmuyor.'
      : 'There are no published projects.';
  }
  return projects
    .map((p) => {
      const title = loc(p.title, lang);
      const desc = loc(p.description, lang);
      const tech = (p.techStack || []).join(', ');
      return `**${title}** — ${desc}${tech ? ` (${tech})` : ''}`;
    })
    .join('\n');
}

/** Answer common portfolio questions without calling Gemini (saves quota). */
export function tryQuickAnswer(
  message: string,
  siteData: SiteData | null,
  language: string
): string | null {
  if (!siteData) return null;

  const lang: 'en' | 'tr' = language === 'tr' ? 'tr' : 'en';
  const normalized = message.trim().toLowerCase();

  const aiProjects = publishedProjects(siteData).filter((p) =>
    projectCategories(p).some((c) => c.toLowerCase() === 'ai')
  );

  const isAiProjectsQuestion =
    normalized.includes('ai projeleri') ||
    normalized.includes('any ai projects') ||
    (/(ai|yapay zeka|llm)/.test(normalized) &&
      /(proje|project)/.test(normalized));

  if (isAiProjectsQuestion) {
    if (aiProjects.length === 0) {
      return lang === 'tr'
        ? 'Şu an yayında **AI** kategorisinde proje görünmüyor. Tüm projeler için Projects sayfasına bakabilirsin.'
        : 'There are no published projects in the **AI** category right now. Check the Projects page for the full list.';
    }
    const header =
      lang === 'tr'
        ? `Evet, **${aiProjects.length}** AI projesi var:\n\n`
        : `Yes, there **${aiProjects.length}** AI project(s):\n\n`;
    return header + formatProjectList(aiProjects, lang);
  }

  const isWhatDoesTamerDo =
    normalized.includes('what does tamer do') ||
    normalized.includes('tamer ne yapıyor');

  if (isWhatDoesTamerDo) {
    const hero = siteData.homeHero;
    const title = loc(hero?.title, lang);
    const bio = loc(hero?.description, lang);
    return lang === 'tr'
      ? `**${title}** — ${bio}`
      : `**${title}** — ${bio}`;
  }

  const isTechQuestion =
    normalized.includes('which technologies') ||
    normalized.includes('hangi teknolojiler');

  if (isTechQuestion) {
    const skills = (siteData.skills || [])
      .filter((s) => s.published !== false)
      .map((s) => s.name)
      .filter(Boolean);
    if (skills.length === 0) {
      return lang === 'tr'
        ? 'Yetenek listesi henüz yüklenmedi.'
        : 'Skills are not loaded yet.';
    }
    const label = lang === 'tr' ? 'Başlıca teknolojiler' : 'Main technologies';
    return `${label}: ${skills.slice(0, 20).join(', ')}.`;
  }

  return null;
}

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
