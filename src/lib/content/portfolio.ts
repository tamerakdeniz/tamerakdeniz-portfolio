import type { LocalizedString, SiteData, Project, TimelineEntry, Skill } from '@/types';
import { getCvDownloadHref } from '@/lib/download-file';
import { compactSiteDataForChat } from '@/lib/chat-payload';

export type Lang = 'en' | 'tr';
export type Loc = LocalizedString;

export const OWNER = {
  fullName: 'Mustafa Tamer Akdeniz',
  shortName: 'Tamer Akdeniz',
  monogram: 'MTA',
  siteUrl: 'https://tamerakdeniz.com',
  role: { en: 'Software Developer', tr: 'Yazılım Geliştirici' } as Loc,
} as const;

const FALLBACK_CV = '/resume/Mustafa-Tamer-Akdeniz-Resume.pdf';
const FALLBACK_CONTACT = {
  email: 'info@tamerakdeniz.com',
  location: { en: 'Istanbul, TR', tr: 'İstanbul, TR' },
  social: {
    github: 'https://github.com/tamerakdeniz',
    linkedin: 'https://www.linkedin.com/in/tamerakdeniz/',
    instagram: 'https://www.instagram.com/tamerakdnz/',
  },
};

export interface PortfolioProject {
  id: string;
  slug: string;
  /** 1-based position in the published order. */
  number: number;
  title: Loc;
  name: Loc;
  subtitle: Loc | null;
  summary: Loc;
  description: Loc;
  categories: string[];
  stack: string[];
  image: string | null;
  links: { live?: string; demo?: string; source?: string };
  role: Loc | null;
  status: string | null;
  year: string | null;
  sections: { heading: Loc; body: Loc }[];
}

export interface JourneyEntry {
  id: string;
  type: TimelineEntry['type'];
  title: Loc;
  org: Loc;
  period: Loc;
  description: Loc;
  startYear: string | null;
  endYear: string | null;
  /** Months since year 0 (year * 12 + month), parsed from the English period when possible. */
  start: number | null;
  end: number | null;
  ongoing: boolean;
}

export interface PortfolioSkill {
  name: string;
  categories: string[];
}

export interface Portfolio {
  hero: { title: Loc | null; description: Loc | null };
  about: { title: Loc | null; paragraphs: { en: string[]; tr: string[] }; portrait: string | null };
  contact: {
    email: string;
    location: Loc;
    social: { github?: string; linkedin?: string; instagram?: string };
  };
  availability: { status: string; label: Loc } | null;
  cv: { viewUrl: string; downloadUrl: string; fileName: string };
  projects: PortfolioProject[];
  featured: PortfolioProject[];
  archive: PortfolioProject[];
  journey: JourneyEntry[];
  skills: PortfolioSkill[];
  chatContext: Record<string, unknown> | null;
}

function toArray<T>(value: T[] | Record<string, T> | null | undefined): T[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : Object.values(value);
  return list.filter((item): item is T => item != null);
}

function loc(value: Partial<Loc> | null | undefined): Loc | null {
  const en = value?.en?.trim() ?? '';
  const tr = value?.tr?.trim() ?? '';
  if (!en && !tr) return null;
  return { en: en || tr, tr: tr || en };
}

function mapLoc(value: Loc, fn: (s: string) => string): Loc {
  return { en: fn(value.en), tr: fn(value.tr) };
}

export function safeUrl(value: string | null | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (raw.startsWith('/')) return raw;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

const TR_MAP: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u' };

export function slugify(input: string): string {
  return input
    .replace(/[çğıİöşü]/gi, (ch) => TR_MAP[ch] ?? TR_MAP[ch.toLowerCase()] ?? ch)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "Qirushio – AI-Powered Quiz" → ["Qirushio", "AI-Powered Quiz"] */
function splitTitle(title: string): [string, string | null] {
  const match = title.match(/^(.+?)(?:\s+[–—-]\s+|:\s+)(.+)$/);
  return match ? [match[1].trim(), match[2].trim()] : [title.trim(), null];
}

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const match = clean.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0] : clean;
}

function categoriesOf(value: string | string[] | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((c) => c.trim()).filter(Boolean);
}

function buildProjects(raw: Project[]): PortfolioProject[] {
  const published = raw
    .filter((p) => p.published)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const used = new Set<string>();

  return published.map((p, i) => {
    const title = loc(p.title) ?? { en: 'Untitled', tr: 'Adsız' };
    const [nameEn, subEn] = splitTitle(title.en);
    const [nameTr, subTr] = splitTitle(title.tr);
    const description = loc(p.description) ?? { en: '', tr: '' };

    let slug = slugify(p.slug || nameEn) || p.id;
    if (used.has(slug)) slug = `${slug}-${p.id}`;
    used.add(slug);

    return {
      id: p.id,
      slug,
      number: i + 1,
      title,
      name: { en: nameEn, tr: nameTr },
      subtitle: subEn || subTr ? { en: subEn ?? subTr ?? '', tr: subTr ?? subEn ?? '' } : null,
      summary: mapLoc(description, firstSentence),
      description,
      categories: categoriesOf(p.category),
      stack: toArray(p.techStack).map((s) => s.trim()).filter(Boolean),
      image: safeUrl(p.image) ?? null,
      links: {
        live: safeUrl(p.liveUrl),
        demo: safeUrl(p.demoUrl),
        source: safeUrl(p.githubUrl),
      },
      role: loc(p.role),
      status: p.status?.trim() || null,
      year: p.year?.trim() || null,
      sections: toArray(p.sections)
        .map((s) => ({ heading: loc(s.heading), body: loc(s.body) }))
        .filter((s): s is { heading: Loc; body: Loc } => !!s.heading && !!s.body),
    };
  });
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Mar 2026", "April 2025", "2023" → months since year 0. */
function parseMonth(text: string, endOfYear = false): number | null {
  const match = text.match(/([a-zçğıöşü]+)?\.?\s*((?:19|20)\d{2})/i);
  if (!match) return null;
  const year = Number(match[2]);
  const month = match[1] ? MONTHS.indexOf(match[1].slice(0, 3).toLowerCase()) : -1;
  return year * 12 + (month >= 0 ? month : endOfYear ? 11 : 0);
}

export function parsePeriod(period: string, now = new Date()): { start: number | null; end: number | null } {
  const [from, to] = period.split(/\s+[–—-]\s+|\s+to\s+/i);
  const start = from ? parseMonth(from) : null;
  let end: number | null = null;
  if (to && /present|now|current|günümüz|devam/i.test(to)) end = now.getFullYear() * 12 + now.getMonth();
  else if (to) end = parseMonth(to, true);
  else end = start;
  return { start, end };
}

function buildJourney(raw: TimelineEntry[]): JourneyEntry[] {
  return raw
    .filter((t) => t.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t, i) => {
      const period = loc(t.period) ?? { en: '', tr: '' };
      const years = period.en.match(/\b(19|20)\d{2}\b/g) ?? [];
      const ongoing = /present|now|current|günümüz|devam/i.test(`${period.en} ${period.tr}`);
      return {
        id: t.id || `journey-${i}`,
        type: t.type,
        title: loc(t.title) ?? { en: '', tr: '' },
        org: loc(t.company) ?? { en: '', tr: '' },
        period,
        description: loc(t.description) ?? { en: '', tr: '' },
        startYear: years[0] ?? null,
        endYear: ongoing ? null : (years[years.length - 1] ?? null),
        ...parsePeriod(period.en),
        ongoing,
      };
    });
}

function buildSkills(raw: Skill[]): PortfolioSkill[] {
  return raw
    .filter((s) => s.published !== false && s.name?.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => ({ name: s.name.trim(), categories: categoriesOf(s.category) }));
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const AVAILABILITY_LABELS: Record<string, Loc> = {
  available: { en: 'Open to work', tr: 'Çalışmaya açık' },
  'open-to-offers': { en: 'Open to offers', tr: 'Tekliflere açık' },
  working: { en: 'Currently working', tr: 'Şu anda çalışıyor' },
};

export function buildPortfolio(data: SiteData | null): Portfolio {
  const projects = buildProjects(toArray(data?.projects));

  const aboutEntries = toArray(data?.aboutEntries);
  const activeAbout =
    aboutEntries.find((e) => e.id === data?.activeAboutId) ?? aboutEntries[0] ?? null;
  const aboutContent = loc(activeAbout?.content);

  const cvFiles = toArray(data?.cvFiles);
  const activeCv = cvFiles.find((f) => f.id === data?.activeCvId) ?? cvFiles[0] ?? null;
  const cvUrl = safeUrl(activeCv?.dataUrl) ?? FALLBACK_CV;
  const cvName = activeCv?.name?.trim() || 'Mustafa-Tamer-Akdeniz-Resume.pdf';

  const contactInfo = data?.contactInfo;
  const social = contactInfo?.social;

  const status = data?.availability?.status;
  const custom = loc(data?.availability?.customLabel);
  const availabilityLabel = custom ?? (status ? AVAILABILITY_LABELS[status] : undefined);

  return {
    hero: {
      title: loc(data?.homeHero?.title),
      description: loc(data?.homeHero?.description),
    },
    about: {
      title: loc(activeAbout?.title),
      paragraphs: {
        en: aboutContent ? splitParagraphs(aboutContent.en) : [],
        tr: aboutContent ? splitParagraphs(aboutContent.tr) : [],
      },
      portrait: safeUrl(activeAbout?.avatar?.imageUrl) ?? null,
    },
    contact: {
      email: contactInfo?.email?.trim() || FALLBACK_CONTACT.email,
      location: loc(contactInfo?.location) ?? FALLBACK_CONTACT.location,
      social: contactInfo
        ? {
            github: safeUrl(social?.github),
            linkedin: safeUrl(social?.linkedin),
            instagram: safeUrl(social?.instagram),
          }
        : FALLBACK_CONTACT.social,
    },
    availability: status && availabilityLabel ? { status, label: availabilityLabel } : null,
    cv: { viewUrl: cvUrl, downloadUrl: getCvDownloadHref(cvUrl, cvName), fileName: cvName },
    projects,
    featured: projects.slice(0, 3),
    archive: projects.slice(3),
    journey: buildJourney(toArray(data?.timeline)),
    skills: buildSkills(toArray(data?.skills)),
    chatContext: data
      ? compactSiteDataForChat({
          ...data,
          projects: toArray(data.projects),
          aboutEntries: aboutEntries,
          skills: toArray(data.skills),
          timeline: toArray(data.timeline),
        })
      : null,
  };
}

export function pick(value: Loc | null | undefined, lang: Lang): string {
  if (!value) return '';
  return value[lang] || value.en;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
